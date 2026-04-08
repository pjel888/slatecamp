'use client'

import React, { Suspense, useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { SceneTunnel } from '@/features/3d-lab/components/GlobalCanvasPortal'
import { WebGLErrorBoundary } from '@/components/r3f/WebGLErrorBoundary'

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
 */
export const LabViewportFrame = ({ children }: LabViewportFrameProps) => {
  const [dpr, setDpr] = useState(1.5)

  const handleDecline = useCallback(() => {
    setDpr((prev) => Math.max(1, prev - 0.5))
  }, [])

  const handleIncline = useCallback(() => {
    setDpr((prev) => Math.min(2, prev + 0.5))
  }, [])

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#F8F7F5]">
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

      {/* Overlay UI elements (hotspots, panels, etc.) */}
      <div className="relative z-10 pointer-events-none h-full w-full">
        {children}
      </div>
    </div>
  )
}
