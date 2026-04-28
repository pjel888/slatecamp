'use client'

import React, { Suspense, useState, useCallback, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Html, PerformanceMonitor, useGLTF } from '@react-three/drei'
import { SceneTunnel } from '@/features/3d-lab/components/GlobalCanvasPortal'
import { WebGLErrorBoundary } from '@/components/r3f/WebGLErrorBoundary'
import { DOMOverlayLayer } from '@/features/3d-lab/components/overlays/DOMOverlayLayer'

// Configure DRACO decoder path globally for all useGLTF calls in the 3D Lab.
// The /draco/ directory in /public/ must contain the Draco WASM decoder files.
useGLTF.setDecoderPath('/draco/')

interface LabViewportFrameProps {
  children?: React.ReactNode
}

function SceneReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady()
  }, [onReady])

  return null
}

/**
 * LabViewportFrame — Isolated WebGL container for 3D Lab modules.
 * This component hosts the R3F Canvas and shared environment logic.
 * It is relative-positioned to fill its parent (usually the LabModuleShell content area).
 *
 * Camera, controls, lighting, and scene base are now configured per-module
 * via SceneConfig (portaled through SceneTunnel from CanvasWrapper).
 * The Canvas `camera` prop is a fallback matching SceneConfig defaults.
 *
 * PerformanceMonitor dynamically adjusts DPR to maintain frame rate.
 * flipflops={3} prevents DPR oscillation between incline/decline thresholds.
 *
 * Mobile: DPR is capped at 1.25 on viewports ≤768px to preserve frame rate
 * on lower-powered devices. touch-action: none on the container prevents the
 * browser from intercepting touch events during orbit/pinch gestures.
 */
export const LabViewportFrame = ({ children }: LabViewportFrameProps) => {
  const [isMobile, setIsMobile] = useState(false)
  const maxDpr = isMobile ? 1.25 : 2
  const [dpr, setDpr] = useState(1.5)
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null)
  const [sceneReady, setSceneReady] = useState(false)
  const [slowScene, setSlowScene] = useState(false)
  const slowSceneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const slowSceneTimeoutMsRef = useRef(12000)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const testTimeout = (window as unknown as { __slatecamp3dLabSlowSceneTimeoutMs?: number })
      .__slatecamp3dLabSlowSceneTimeoutMs
    if (Number.isFinite(testTimeout) && testTimeout > 0) {
      slowSceneTimeoutMsRef.current = Math.max(50, testTimeout)
    }

    let supported = false
    const canvas = document.createElement('canvas')

    try {
      supported = Boolean(
        canvas.getContext('webgl2') ||
          canvas.getContext('webgl') ||
          canvas.getContext('experimental-webgl'),
      )
    } catch {
      supported = false
    }

    setWebglSupported(supported)
    window.dispatchEvent(
      new CustomEvent('slatecamp:3d:webgl-support', {
        detail: { supported },
      }),
    )

    return undefined
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const media = window.matchMedia('(max-width: 768px)')
    const updateMobile = () => {
      setIsMobile(media.matches)
      setDpr((prev) => Math.min(prev, media.matches ? 1.25 : 2))
    }

    updateMobile()

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', updateMobile)
      return () => media.removeEventListener('change', updateMobile)
    }

    media.addListener(updateMobile)
    return () => media.removeListener(updateMobile)
  }, [])

  const handlePerformanceChange = useCallback(
    ({ factor }: { factor: number }) => {
      const targetDpr = isMobile ? 1 + factor * 0.25 : 1 + factor
      const rounded = Math.round(Math.min(maxDpr, Math.max(1, targetDpr)) * 100) / 100

      setDpr((prev) => (Math.abs(prev - rounded) >= 0.05 ? rounded : prev))
    },
    [isMobile, maxDpr],
  )

  const handlePerformanceFallback = useCallback(() => {
    setDpr(1)
  }, [])

  useEffect(() => {
    if (webglSupported !== true || sceneReady) return undefined

    slowSceneTimerRef.current = setTimeout(() => {
      setSlowScene(true)
      window.dispatchEvent(
        new CustomEvent('slatecamp:3d:slow-scene', {
          detail: { timeoutMs: slowSceneTimeoutMsRef.current },
        }),
      )
    }, slowSceneTimeoutMsRef.current)

    return () => {
      if (slowSceneTimerRef.current) clearTimeout(slowSceneTimerRef.current)
    }
  }, [sceneReady, webglSupported])

  const handleCanvasCreated = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('slatecamp:3d:canvas-created'))
    }
  }, [])

  const handleSceneReady = useCallback(() => {
    if (
      typeof window !== 'undefined' &&
      (window as unknown as { __slatecamp3dLabHoldSceneReady?: boolean }).__slatecamp3dLabHoldSceneReady
    ) {
      window.dispatchEvent(new CustomEvent('slatecamp:3d:scene-ready-held'))
      return
    }

    setSceneReady(true)
    setSlowScene(false)
    if (slowSceneTimerRef.current) clearTimeout(slowSceneTimerRef.current)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('slatecamp:3d:scene-ready'))
    }
  }, [])

  if (webglSupported === false) {
    return (
      <div
        className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden bg-surface-light p-6"
        data-testid="3dlab-webgl-unavailable"
      >
        <div className="max-w-md rounded-lg border border-border bg-card p-6 text-center shadow-lg">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Graphics fallback
          </p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">
            WebGL is unavailable
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            This browser or device cannot start the 3D renderer. Try enabling hardware
            acceleration, updating the browser, or opening the lesson on a device with WebGL support.
          </p>
        </div>
      </div>
    )
  }

  if (webglSupported === null) {
    return (
      <div
        className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden bg-surface-light"
        data-testid="3dlab-webgl-checking"
      >
        <div className="rounded-sm border border-border bg-card/95 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground shadow-sm">
          Checking graphics support...
        </div>
      </div>
    )
  }

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden bg-surface-light"
      style={{ touchAction: 'none' }}
    >
      <WebGLErrorBoundary>
        <Canvas
          frameloop="demand"
          shadows
          dpr={[1, dpr]}
          camera={{ position: [6, 6, 6], fov: 35 }}
          gl={{
            antialias: true,
            alpha: false,
            stencil: false,
            depth: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: false,
          }}
          style={{ pointerEvents: 'auto' }}
          onCreated={handleCanvasCreated}
        >
          <PerformanceMonitor
            flipflops={3}
            onChange={handlePerformanceChange}
            onFallback={handlePerformanceFallback}
          />

          {/* Scene content portaled from CanvasWrapper instances via SceneTunnel */}
          <Suspense
            fallback={
              <Html center>
                <div className="rounded-sm border border-border bg-card/95 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground shadow-sm">
                  Loading 3D scene...
                </div>
              </Html>
            }
          >
            <SceneTunnel.Out />
            <SceneReadySignal onReady={handleSceneReady} />
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>

      {/* DOM overlay system — projects 3D positions to 2D screen coordinates */}
      <DOMOverlayLayer />

      {/* Overlay UI elements (hotspots, panels, etc.) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {children}
      </div>

      {slowScene && (
        <div
          className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-md border border-border bg-card/95 px-4 py-3 text-center shadow-lg"
          data-testid="3dlab-slow-scene-notice"
          role="status"
          aria-live="polite"
        >
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Still loading 3D scene
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            The lesson shell is ready; the renderer is still preparing graphics resources.
          </p>
        </div>
      )}
    </div>
  )
}
