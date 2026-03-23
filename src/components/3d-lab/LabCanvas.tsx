'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei'
import * as THREE from 'three'

interface LabCanvasProps {
  children: React.ReactNode
  defaultCameraPosition?: [number, number, number]
  defaultCameraTarget?: [number, number, number]
  orbitEnabled?: boolean
}

export const LabCanvas = ({
  children,
  defaultCameraPosition = [5, 5, 5],
  defaultCameraTarget = [0, 0, 0],
  orbitEnabled = true,
}: LabCanvasProps) => {
  return (
    <Canvas
      frameloop="demand"
      shadows
      camera={{
        fov: 45,
        near: 0.1,
        far: 100,
        position: defaultCameraPosition,
      }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(new THREE.Color('#F2F0EB'))
        scene.background = new THREE.Color('#F2F0EB')
      }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.0}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Ground shadows */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.35}
        scale={10}
        blur={2}
      />

      {/* Environment */}
      <Environment preset="city" />

      {/* Orbit controls — disabled in question mode */}
      {orbitEnabled && (
        <OrbitControls
          target={defaultCameraTarget}
          enablePan={false}
          enableDamping
          dampingFactor={0.05}
          minPolarAngle={0.1}
          maxPolarAngle={Math.PI / 2}
          minDistance={1}
          maxDistance={15}
          autoRotate={false}
        />
      )}

      {/* Model content with Suspense boundary for async loading */}
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  )
}
