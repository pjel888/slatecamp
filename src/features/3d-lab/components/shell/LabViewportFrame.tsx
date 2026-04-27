'use client'

import React, { Suspense, useState, useCallback, useEffect } from 'react'
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

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden bg-[#F8F7F5]"
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
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>

      {/* DOM overlay system — projects 3D positions to 2D screen coordinates */}
      <DOMOverlayLayer />

      {/* Overlay UI elements (hotspots, panels, etc.) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {children}
      </div>
    </div>
  )
}
