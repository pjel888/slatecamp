// src/app/dashboard/3d-lab/_scenes/NBCPEnvelope/NBCPEnvelope.tsx
'use client'

import { Suspense } from 'react'
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei'
import { CanvasWrapper } from '@/features/3d-lab/components/CanvasWrapper'
import { NBCPScene } from './NBCPScene'
import { NBCPControlPanel } from './NBCPControlPanel'
import { NBCPTelemetry } from './NBCPTelemetry'
import { useNBCPStore } from '@/features/3d-lab/stores/nbcpStore'

/**
 * Top-level NBCP Envelope Generator.
 * Composes Canvas (3D) + NBCPControlPanel (left) + NBCPTelemetry (right).
 *
 * Camera position auto-adjusts based on lot size.
 * Uses frameloop="demand" — zero GPU cost while idle.
 */
export default function NBCPEnvelope() {
  const { inputs } = useNBCPStore()

  // Dynamic camera — stays far enough to show the whole lot
  // 1 Three.js unit = 20m (SCALE = 0.05), so divide by 20
  const maxDim = Math.max(inputs.lotWidth, inputs.lotDepth)
  const camDist = Math.max(10, maxDim * 0.07)
  const cameraPosition: [number, number, number] = [camDist, camDist * 0.8, camDist]

  return (
    <div className="relative h-full w-full">
      <CanvasWrapper>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={cameraPosition} fov={40} />
          <Environment preset="city" />
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[10, 20, 10]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <OrbitControls
            makeDefault
            maxPolarAngle={Math.PI / 1.75}
            minDistance={2}
            maxDistance={80}
          />
          <NBCPScene />
        </Suspense>
      </CanvasWrapper>
      <NBCPControlPanel />
      <NBCPTelemetry />
    </div>
  )
}
