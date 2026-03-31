'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { GEOMETRY_Y, COLOR } from '../constants'

// Urban grid — road surface, sidewalks, and curbs providing spatial context.
// Road is in front (Z < 0) of the lot. Sidewalks flank the road.

export function UrbanGrid() {
  const lotW = useDevControlsStore((s) => s.lot.width)
  const lotD = useDevControlsStore((s) => s.lot.depth)
  const rrowWidth = useDevControlsStore((s) => s.rrow.width)

  // Ground extends beyond the lot
  const groundSize = Math.max(lotW, lotD) * 2.5
  const groundX = lotW / 2
  const groundZ = lotD / 2 - rrowWidth / 2

  // Sidewalk strip between road and lot
  const sidewalkW = lotW + 6
  const sidewalkD = 2.0

  return (
    <group>
      {/* Base ground plane — terrain */}
      <mesh
        position={[groundX, GEOMETRY_Y.BASE_GROUND, groundZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[groundSize, groundSize]} />
        <meshStandardMaterial color={COLOR.GROUND} roughness={1} metalness={0} />
      </mesh>

      {/* Sidewalk — between road and lot front boundary */}
      <mesh
        position={[lotW / 2, GEOMETRY_Y.SIDEWALK, -sidewalkD / 2 + 0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[sidewalkW, sidewalkD]} />
        <meshStandardMaterial color={COLOR.SIDEWALK} roughness={0.85} metalness={0} />
      </mesh>

      {/* Curb — edge between sidewalk and road */}
      <mesh position={[lotW / 2, GEOMETRY_Y.CURB / 2, -1]}>
        <boxGeometry args={[sidewalkW, GEOMETRY_Y.CURB, 0.15]} />
        <meshStandardMaterial color="#9CA3AF" roughness={0.9} metalness={0} />
      </mesh>
    </group>
  )
}
