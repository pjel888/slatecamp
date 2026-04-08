'use client'

import React, { Suspense, useState, useCallback, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor, useGLTF } from '@react-three/drei'
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
  // Mobile DPR cap: detect ≤768px viewport and limit max DPR to 1.25.
  // Evaluated once on mount; typeof window guard ensures SSR safety.
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(max-width: 768px)').matches
  }, [])

  const maxDpr = isMobile ? 1.25 : 2
  const [dpr, setDpr] = useState(() => (isMobile ? 1.25 : 1.5))

  const handleDecline = useCallback(() => {
    setDpr((prev) => Math.max(1, prev - 0.5))
  }, [])

  const handleIncline = useCallback(() => {
    setDpr((prev) => Math.min(maxDpr, prev + 0.5))
  }, [maxDpr])

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
          gl={{ antialias: true, alpha: false, stencil: false, depth: true }}
          style={{ pointerEvents: 'auto' }}
        >
          <PerformanceMonitor
            flipflops={3}
            onDecline={handleDecline}
            onIncline={handleIncline}
          />

          {/* Scene content portaled from CanvasWrapper instances via SceneTunnel */}
          <Suspense fallback={null}>
            <SceneTunnel.Out />
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>

      {/* DOM overlay system — projects 3D positions to 2D screen coordinates */}
      <DOMOverlayLayer />

      {/* Overlay UI elements (hotspots, panels, etc.) */}
      <div className="relative z-10 pointer-events-none h-full w-full">
        {children}
      </div>
    </div>
  )
}
