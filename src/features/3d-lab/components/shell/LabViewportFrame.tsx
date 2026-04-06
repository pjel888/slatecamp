'use client'

import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { SceneTunnel } from '@/features/3d-lab/components/GlobalCanvasPortal'
import { StudioLighting } from '@/features/3d-lab/components/rendering/StudioLighting'
import { SceneBase } from '@/features/3d-lab/components/rendering/SceneBase'

interface LabViewportFrameProps {
  children?: React.ReactNode
}

/**
 * LabViewportFrame — Isolated WebGL container for 3D Lab modules.
 * This component hosts the R3F Canvas and shared environment logic.
 * It is relative-positioned to fill its parent (usually the LabModuleShell content area).
 */
export const LabViewportFrame = ({ children }: LabViewportFrameProps) => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#F8F7F5]">
      <Canvas
        frameloop="demand"
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [6, 6, 6], fov: 35 }}
        gl={{ antialias: true, alpha: false, stencil: false, depth: true }}
        style={{ pointerEvents: 'auto' }}
      >
        <StudioLighting />
        <SceneBase showGround />
        
        <OrbitControls 
          makeDefault 
          minPolarAngle={0} 
          maxPolarAngle={Math.PI / 1.75} 
          minDistance={3} 
          maxDistance={Infinity} 
        />

        {/* Individual module scenes portal their content here */}
        <Suspense fallback={null}>
          <SceneTunnel.Out />
        </Suspense>
      </Canvas>
      
      {/* Overlay UI elements (hotspots, panels, etc.) */}
      <div className="relative z-10 pointer-events-none h-full w-full">
        {children}
      </div>
    </div>
  )
}
