'use client'

import { useMemo } from 'react'
import { Line, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { GEOMETRY_Y, COLOR } from '../constants'

// RROW indicator — road surface in front of the lot with width marker.
// Positioned along Z < 0 (in front of the lot front boundary).

export function RROWIndicator() {
  const lotW = useDevControlsStore((s) => s.lot.width)
  const rrowWidth = useDevControlsStore((s) => s.rrow.width)

  // Road extends from Z = -rrowWidth to Z = 0 (front of lot)
  const roadW = lotW + 8 // extend beyond lot edges
  const roadX = lotW / 2
  const roadZ = -rrowWidth / 2

  // Centerline of road
  const centerlinePoints = useMemo(() => [
    new THREE.Vector3(-4, GEOMETRY_Y.ROAD_MARKING, -rrowWidth / 2),
    new THREE.Vector3(lotW + 4, GEOMETRY_Y.ROAD_MARKING, -rrowWidth / 2),
  ], [lotW, rrowWidth])

  // RROW dimension line
  const rrowDimPoints = useMemo(() => [
    new THREE.Vector3(-2, GEOMETRY_Y.ROAD + 0.02, 0),
    new THREE.Vector3(-2, GEOMETRY_Y.ROAD + 0.02, -rrowWidth),
  ], [rrowWidth])

  return (
    <group>
      {/* Road surface */}
      <mesh
        position={[roadX, GEOMETRY_Y.ROAD, roadZ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[roadW, rrowWidth]} />
        <meshStandardMaterial color={COLOR.ROAD} roughness={0.95} metalness={0} />
      </mesh>

      {/* Road centerline (dashed) */}
      <Line
        points={centerlinePoints}
        color={COLOR.ROAD_MARKING}
        lineWidth={1}
        dashed
        dashSize={1.5}
        gapSize={1.0}
      />

      {/* RROW dimension line */}
      <Line
        points={rrowDimPoints}
        color="#4A5568"
        lineWidth={1}
      />

      {/* RROW label — DOM overlay, not 3D text */}
      <Html
        position={[-3, GEOMETRY_Y.ROAD + 0.5, -rrowWidth / 2]}
        style={{ pointerEvents: 'none' }}
      >
        <div className="rounded-sm bg-[#1A2332]/80 px-1.5 py-0.5 text-[10px] font-mono text-white whitespace-nowrap">
          RROW {rrowWidth}m
        </div>
      </Html>
    </group>
  )
}
