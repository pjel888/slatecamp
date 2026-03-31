'use client'

import { useMemo } from 'react'
import { Edges } from '@react-three/drei'
import * as THREE from 'three'
import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { GEOMETRY_Y, COLOR, OPACITY } from '../constants'

// Buildable envelope — 3D volume showing the binding AMBF × BHL.
// Solid cobalt box with white edges. Transparent to see internal layers.

export function BuildableEnvelope() {
  const setbacks = useDevControlsStore((s) => s.result.setbacks.effective)
  const buildableW = useDevControlsStore((s) => s.result.buildableWidth)
  const buildableD = useDevControlsStore((s) => s.result.buildableDepth)
  const bhlMeters = useDevControlsStore((s) => s.result.bhlMeters)

  const geometry = useMemo(
    () => new THREE.BoxGeometry(
      Math.max(0.1, buildableW),
      Math.max(0.1, bhlMeters),
      Math.max(0.1, buildableD)
    ),
    [buildableW, bhlMeters, buildableD]
  )

  if (buildableW <= 0 || buildableD <= 0) return null

  return (
    <mesh
      geometry={geometry}
      position={[
        setbacks.left + buildableW / 2,
        GEOMETRY_Y.BUILDING_BASE + bhlMeters / 2,
        setbacks.front + buildableD / 2,
      ]}
    >
      <meshStandardMaterial
        color={COLOR.AMBF_BINDING}
        transparent
        opacity={OPACITY.AMBF_BINDING}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
      <Edges color="#FFFFFF" lineWidth={1.5} />
    </mesh>
  )
}
