'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { GEOMETRY_Y, SCENE } from '../constants'

// Context buildings — neighboring structures for spatial reference.
// Positioned on the opposite side of the road and flanking the lot.
// Semi-transparent greyscale to avoid competing with the main lot visualization.

interface ContextBuildingProps {
  position: [number, number, number]
  size: [number, number, number]
}

function ContextBuilding({ position, size }: ContextBuildingProps) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={SCENE.CONTEXT_BUILDING_COLOR}
        roughness={0.9}
        metalness={0}
        transparent
        opacity={0.5}
      />
    </mesh>
  )
}

export function ContextBuildings() {
  const lotW = useDevControlsStore((s) => s.lot.width)
  const lotD = useDevControlsStore((s) => s.lot.depth)
  const rrowWidth = useDevControlsStore((s) => s.rrow.width)

  // Buildings across the road
  const acrossZ = -rrowWidth - 3
  const flankY = GEOMETRY_Y.BUILDING_BASE

  const buildings = useMemo(() => [
    // Across the road — row of buildings
    { position: [lotW * 0.25, flankY + 4, acrossZ] as [number, number, number], size: [lotW * 0.3, 8, 10] as [number, number, number] },
    { position: [lotW * 0.75, flankY + 3, acrossZ] as [number, number, number], size: [lotW * 0.25, 6, 8] as [number, number, number] },
    // Left neighbor
    { position: [-5, flankY + 3.5, lotD * 0.4] as [number, number, number], size: [8, 7, lotD * 0.5] as [number, number, number] },
    // Right neighbor
    { position: [lotW + 5, flankY + 2.5, lotD * 0.3] as [number, number, number], size: [6, 5, lotD * 0.4] as [number, number, number] },
  ], [lotW, lotD, acrossZ, flankY])

  return (
    <group>
      {buildings.map((b, i) => (
        <ContextBuilding key={i} position={b.position} size={b.size} />
      ))}
    </group>
  )
}
