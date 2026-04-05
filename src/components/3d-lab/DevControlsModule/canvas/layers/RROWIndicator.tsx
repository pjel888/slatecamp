'use client'

import { useMemo } from 'react'
import { Line, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { GEOMETRY_Y, COLOR } from '../constants'

// ─── RROW Indicator — Dynamic Road Mesh ────────────────────────────────────
// Road surface anchored to the lot's front edge (Z = 0).
// Length = lot width (frontage). No overhang beyond lot boundary endpoints.
// Width (depth) = rrowWidth, extending in -Z direction from the front edge.
// Centerline and dimension label included.

export function RROWIndicator() {
  const lotW = useDevControlsStore((s) => s.lot.width)
  const rrowWidth = useDevControlsStore((s) => s.rrow.width)

  // Road geometry: anchored to lot front edge
  // X: centered on lot width (lotW / 2)
  // Z: extends from 0 to -rrowWidth, center at -rrowWidth / 2
  // Length (X-axis) = lotW — exactly matches frontage, no overhang
  const roadX = lotW / 2
  const roadZ = -rrowWidth / 2

  // Centerline: runs along the road center, matching lot width exactly
  const centerlinePoints = useMemo(() => [
    new THREE.Vector3(0, GEOMETRY_Y.ROAD_MARKING, -rrowWidth / 2),
    new THREE.Vector3(lotW, GEOMETRY_Y.ROAD_MARKING, -rrowWidth / 2),
  ], [lotW, rrowWidth])

  // RROW dimension line: vertical marker at left edge showing road width
  const rrowDimPoints = useMemo(() => [
    new THREE.Vector3(-1.5, GEOMETRY_Y.ROAD + 0.02, 0),
    new THREE.Vector3(-1.5, GEOMETRY_Y.ROAD + 0.02, -rrowWidth),
  ], [rrowWidth])

  return (
    <group>
      {/* Road surface — length = lotW (frontage), width = rrowWidth */}
      <mesh
        position={[roadX, GEOMETRY_Y.ROAD, roadZ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[lotW, rrowWidth]} />
        <meshStandardMaterial color={COLOR.ROAD} roughness={0.95} metalness={0} />
      </mesh>

      {/* Road centerline (dashed) — matches frontage length */}
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

      {/* RROW label */}
      <Html
        position={[-2.5, GEOMETRY_Y.ROAD + 0.5, -rrowWidth / 2]}
        style={{ pointerEvents: 'none' }}
      >
        <div className="rounded-sm bg-foreground/80 px-1.5 py-0.5 font-mono text-[10px] text-white whitespace-nowrap">
          RROW {rrowWidth}m
        </div>
      </Html>
    </group>
  )
}
