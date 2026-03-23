'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface CrossSectionPlaneProps {
  enabled: boolean
  height?: number         // Y position of the clipping plane (per-module config)
  direction?: 'up' | 'down'  // Which side to clip
}

// Cross-section clipping plane that reveals interior spaces.
// Toggle via ToolPalette. Position is per-module (configured in module.config.ts).
// Smooth 300ms transition on enable/disable.
export const CrossSectionPlane = ({
  enabled,
  height = 1.0,
  direction = 'down',
}: CrossSectionPlaneProps) => {
  const { gl } = useThree()
  const planeRef = useRef<THREE.Plane>(
    new THREE.Plane(
      new THREE.Vector3(0, direction === 'down' ? -1 : 1, 0),
      height
    )
  )
  const targetEnabled = useRef(enabled)
  const currentAlpha = useRef(enabled ? 1 : 0)

  useEffect(() => {
    targetEnabled.current = enabled
  }, [enabled])

  useEffect(() => {
    gl.localClippingEnabled = true
    return () => {
      gl.clippingPlanes = []
      gl.localClippingEnabled = false
    }
  }, [gl])

  useFrame((_, delta) => {
    const target = targetEnabled.current ? 1 : 0
    const speed = 1 / 0.3 // 300ms transition

    if (currentAlpha.current !== target) {
      const step = speed * delta
      if (currentAlpha.current < target) {
        currentAlpha.current = Math.min(currentAlpha.current + step, 1)
      } else {
        currentAlpha.current = Math.max(currentAlpha.current - step, 0)
      }

      if (currentAlpha.current > 0.01) {
        // Animate plane position: from far away to target height
        const farDistance = 20
        const currentHeight = farDistance + (height - farDistance) * currentAlpha.current
        planeRef.current.constant = currentHeight
        gl.clippingPlanes = [planeRef.current]
      } else {
        gl.clippingPlanes = []
      }
    }
  })

  // Render a visible cut-plane indicator (thin disc at the cut height)
  if (!enabled && currentAlpha.current < 0.01) return null

  return (
    <mesh
      position={[0, height, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      visible={currentAlpha.current > 0.5}
    >
      <ringGeometry args={[0, 5, 64]} />
      <meshBasicMaterial
        color="#1B3FC4"
        opacity={0.08 * currentAlpha.current}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}
