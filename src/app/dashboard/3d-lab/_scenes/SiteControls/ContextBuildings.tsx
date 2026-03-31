'use client'

import { useMemo } from 'react'
import { Edges } from '@react-three/drei'
import { useSiteControlsStore } from '../../_stores/siteControlsStore'

/**
 * Ghost-white context buildings around the subject lot.
 * Positioned relative to lot dimensions for visual context at any scale.
 * castShadow: false — these are background, not the subject.
 */
export function ContextBuildings() {
  const lotWidth = useSiteControlsStore((s) => s.inputs.lotWidth)
  const lotDepth = useSiteControlsStore((s) => s.inputs.lotDepth)
  const rrowWidth = useSiteControlsStore((s) => s.inputs.rrowWidth)

  const buildings = useMemo(() => {
    const w = lotWidth
    const d = lotDepth
    const r = rrowWidth

    return [
      // Across the road (front)
      { pos: [w * 0.3, 3.5, -(r + 4)], size: [w * 0.35, 7, 8] },
      { pos: [w * 0.8, 2.5, -(r + 5)], size: [w * 0.25, 5, 6] },
      // Left neighbor
      { pos: [-5, 3, d * 0.4], size: [6, 6, d * 0.5] },
      // Right neighbor
      { pos: [w + 5, 4, d * 0.3], size: [6, 8, d * 0.4] },
      { pos: [w + 5, 2.5, d * 0.8], size: [5, 5, d * 0.25] },
      // Rear neighbor
      { pos: [w * 0.5, 2, d + 5], size: [w * 0.4, 4, 5] },
    ] as { pos: [number, number, number]; size: [number, number, number] }[]
  }, [lotWidth, lotDepth, rrowWidth])

  return (
    <group>
      {buildings.map((b, i) => (
        <mesh key={i} position={b.pos}>
          <boxGeometry args={b.size} />
          <meshStandardMaterial
            color="#EDEAE4"
            roughness={0.85}
            metalness={0.0}
            transparent
            opacity={0.7}
          />
          <Edges threshold={15} color="#CCCCCC" lineWidth={0.5} scale={1.002} />
        </mesh>
      ))}
    </group>
  )
}
