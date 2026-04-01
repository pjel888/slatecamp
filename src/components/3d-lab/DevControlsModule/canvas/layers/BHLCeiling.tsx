'use client'

import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { GEOMETRY_Y } from '../constants'

// BHL Ceiling — orange 2D plane at the exact building height limit.
// Red perimeter border + dashed vertical corner posts for visibility.
// Toggled independently by the 'bhl' layer key.

const BHL_PLANE_COLOR = '#E8853A'     // Camp Orange — warm, visible
const BHL_BORDER_COLOR = '#D64545'    // Warm Red — high-contrast border
const BHL_PLANE_OPACITY = 0.22

export function BHLCeiling() {
  const lotW = useDevControlsStore((s) => s.lot.width)
  const lotD = useDevControlsStore((s) => s.lot.depth)
  const bhlMeters = useDevControlsStore((s) => s.result.bhlMeters)

  // BHL ceiling spans the full lot, not just the buildable area
  const ceilingY = GEOMETRY_Y.BUILDING_BASE + bhlMeters
  const centerX = lotW / 2
  const centerZ = lotD / 2

  // Red perimeter outline at the ceiling height
  const perimeterPoints = useMemo(() => [
    new THREE.Vector3(0, ceilingY, 0),
    new THREE.Vector3(lotW, ceilingY, 0),
    new THREE.Vector3(lotW, ceilingY, lotD),
    new THREE.Vector3(0, ceilingY, lotD),
    new THREE.Vector3(0, ceilingY, 0),
  ], [lotW, lotD, ceilingY])

  // Dashed vertical posts at lot corners
  const corners = useMemo(() => {
    const yBase = GEOMETRY_Y.BUILDING_BASE
    return [
      [new THREE.Vector3(0, yBase, 0), new THREE.Vector3(0, ceilingY, 0)],
      [new THREE.Vector3(lotW, yBase, 0), new THREE.Vector3(lotW, ceilingY, 0)],
      [new THREE.Vector3(lotW, yBase, lotD), new THREE.Vector3(lotW, ceilingY, lotD)],
      [new THREE.Vector3(0, yBase, lotD), new THREE.Vector3(0, ceilingY, lotD)],
    ] as [THREE.Vector3, THREE.Vector3][]
  }, [lotW, lotD, ceilingY])

  if (bhlMeters <= 0) return null

  return (
    <group>
      {/* Orange ceiling plane at the exact BHL height */}
      <mesh
        position={[centerX, ceilingY, centerZ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[lotW, lotD]} />
        <meshStandardMaterial
          color={BHL_PLANE_COLOR}
          transparent
          opacity={BHL_PLANE_OPACITY}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Red perimeter border at ceiling height */}
      <Line
        points={perimeterPoints}
        color={BHL_BORDER_COLOR}
        lineWidth={2}
      />

      {/* Dashed vertical posts at lot corners */}
      {corners.map((pair, i) => (
        <Line
          key={i}
          points={pair}
          color={BHL_BORDER_COLOR}
          lineWidth={1}
          dashed
          dashSize={0.5}
          gapSize={0.4}
        />
      ))}
    </group>
  )
}
