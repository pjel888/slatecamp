'use client'

import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { SceneTunnel } from './_components/GlobalCanvasPortal'
import { StudioLighting } from './_components/StudioLighting'
import { SceneBase } from './_components/SceneBase'
import { OrbitControls } from '@react-three/drei'

/**
 * 3D Lab Layout with persistent Global Canvas.
 * This prevents WebGL context re-initialization during navigation between lab modules.
 * Individual scenes portal their content into this canvas via SceneTunnel.In.
 */
const ThreeDLabLayoutPage = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full w-full relative flex">
      {/* 
         Persistent Global Canvas (UX Plan §01)
         This stays mounted during navigation within /3d-lab.
      */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Canvas
          frameloop="demand"
          shadows
          dpr={[1, 1.5]}
          camera={{ position: [6, 6, 6], fov: 35 }}
          gl={{ antialias: true, alpha: false, stencil: false, depth: true }}
          style={{ pointerEvents: 'auto' }}
        >
          {/* Shared lighting and environment */}
          <StudioLighting />
          <SceneBase showGround />
          
          <OrbitControls 
            makeDefault 
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 1.75} 
            minDistance={3} 
            maxDistance={Infinity} 
          />

          {/* This is where individual scene content is injected via the tunnel */}
          <Suspense fallback={null}>
            <SceneTunnel.Out />
          </Suspense>
        </Canvas>
      </div>

      {/* 
         UI Layer (React Server Components / Client Components)
         Contains the sidebars, controls, and scene content (In-tunnel).
      */}
      <div className="relative z-10 flex h-full w-full overflow-hidden">
        {children}
      </div>
    </div>
  )
}

export default ThreeDLabLayoutPage
