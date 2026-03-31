'use client'

import { useMemo } from 'react'
import { Edges, Line } from '@react-three/drei'
import { useSiteControlsStore } from '../../_stores/siteControlsStore'

/**
 * TLA ground plane at Y=0.000 with dark edges and dashed lot boundary.
 * Y-stratification: this is the base layer — all other planes sit above it.
 */
export function LotPlane() {
  const lotWidth = useSiteControlsStore((s) => s.inputs.lotWidth)
  const lotDepth = useSiteControlsStore((s) => s.inputs.lotDepth)
  const activeZone = useSiteControlsStore((s) => s.activeZone)
  const setActiveZone = useSiteControlsStore((s) => s.setActiveZone)

  const isActive = activeZone === 'tla'

  // Dashed perimeter line (clockwise)
  const boundaryPoints = useMemo(
    (): [number, number, number][] => [
      [0, 0.001, 0],
      [lotWidth, 0.001, 0],
      [lotWidth, 0.001, lotDepth],
      [0, 0.001, lotDepth],
      [0, 0.001, 0],
    ],
    [lotWidth, lotDepth],
  )

  return (
    <group>
      {/* TLA ground — warm stone, matte */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[lotWidth / 2, 0, lotDepth / 2]}
        receiveShadow
        onClick={(e) => {
          e.stopPropagation()
          setActiveZone(isActive ? null : 'tla')
        }}
      >
        <planeGeometry args={[lotWidth, lotDepth]} />
        <meshStandardMaterial color="#D4CFC4" roughness={0.92} metalness={0.0} />
        <Edges threshold={15} color="#3A3A3A" lineWidth={1.0} scale={1.002} />
      </mesh>

      {/* Dashed lot boundary */}
      <Line
        points={boundaryPoints}
        color="#BFC5B5"
        lineWidth={1.5}
        dashed
        dashSize={0.3}
        gapSize={0.15}
      />
    </group>
  )
}
