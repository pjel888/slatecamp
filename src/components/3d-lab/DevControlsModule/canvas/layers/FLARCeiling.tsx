'use client'

import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { GEOMETRY_Y } from '../constants'

// FLAR Ceiling — a 2D plane at the maximum height derived from FLAR/TGFA.
// Height = maxCompliantFloors × floorHeight.
// Green when compliant, amber when the proposed building exceeds it.
// Toggled by the 'pso' layer key (reusing — or we can add a 'flar' key).

const FLAR_COMPLIANT_COLOR = '#2D9F6F'   // Emerald — within limits
const FLAR_EXCEEDED_COLOR = '#D4951A'    // Amber — exceeded
const FLAR_BORDER_COMPLIANT = '#2D9F6F'
const FLAR_BORDER_EXCEEDED = '#D4951A'
const FLAR_PLANE_OPACITY = 0.18

export function FLARCeiling() {
  const setbacks = useDevControlsStore((s) => s.result.setbacks.base)
  const buildableW = useDevControlsStore((s) => s.result.buildableWidth)
  const buildableD = useDevControlsStore((s) => s.result.buildableDepth)
  const maxFloors = useDevControlsStore((s) => s.result.maxCompliantFloors)
  const floorH = useDevControlsStore((s) => s.building.floorHeight)
  const proposedFloors = useDevControlsStore((s) => s.building.proposedStoreys)
  const bhlMeters = useDevControlsStore((s) => s.result.bhlMeters)

  // FLAR ceiling height capped by BHL — AMVB always prevails
  const flarHeight = Math.min(maxFloors * floorH, bhlMeters)
  const isExceeded = proposedFloors > maxFloors
  const ceilingY = GEOMETRY_Y.BUILDING_BASE + flarHeight

  const planeColor = isExceeded ? FLAR_EXCEEDED_COLOR : FLAR_COMPLIANT_COLOR
  const borderColor = isExceeded ? FLAR_BORDER_EXCEEDED : FLAR_BORDER_COMPLIANT

  // Plane spans the buildable area (setback-derived)
  const centerX = setbacks.left + buildableW / 2
  const centerZ = setbacks.front + buildableD / 2

  // Perimeter at ceiling height
  const perimeterPoints = useMemo(() => {
    const x0 = setbacks.left
    const x1 = setbacks.left + buildableW
    const z0 = setbacks.front
    const z1 = setbacks.front + buildableD
    return [
      new THREE.Vector3(x0, ceilingY, z0),
      new THREE.Vector3(x1, ceilingY, z0),
      new THREE.Vector3(x1, ceilingY, z1),
      new THREE.Vector3(x0, ceilingY, z1),
      new THREE.Vector3(x0, ceilingY, z0),
    ]
  }, [setbacks.left, setbacks.front, buildableW, buildableD, ceilingY])

  if (flarHeight <= 0 || buildableW <= 0 || buildableD <= 0) return null

  return (
    <group>
      {/* FLAR ceiling plane */}
      <mesh
        position={[centerX, ceilingY, centerZ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[buildableW, buildableD]} />
        <meshStandardMaterial
          color={planeColor}
          transparent
          opacity={FLAR_PLANE_OPACITY}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Perimeter border — dashed to distinguish from BHL (solid) */}
      <Line
        points={perimeterPoints}
        color={borderColor}
        lineWidth={1.5}
        dashed
        dashSize={0.6}
        gapSize={0.4}
      />
    </group>
  )
}
