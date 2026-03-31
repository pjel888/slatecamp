'use client'

import { Edges, Line } from '@react-three/drei'
import * as THREE from 'three'
import { useSiteControlsStore } from '../../_stores/siteControlsStore'

/** TLA base ground plane — warm stone-travertine per UX Plan §01. */
export function LotPlane() {
  const lotWidth = useSiteControlsStore((s) => s.inputs.lotWidth)
  const lotDepth = useSiteControlsStore((s) => s.inputs.lotDepth)
  const activeZone = useSiteControlsStore((s) => s.activeZone)
  const setActiveZone = useSiteControlsStore((s) => s.setActiveZone)

  const isActive = activeZone === 'tla'
  const dimmed = activeZone !== null && !isActive

  // Lot boundary corners at y=0.01
  const y = 0.01
  const boundaryPoints: [number, number, number][] = [
    [0, y, 0],
    [lotWidth, y, 0],
    [lotWidth, y, lotDepth],
    [0, y, lotDepth],
    [0, y, 0],
  ]

  return (
    <group>
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
        <meshStandardMaterial
          color={isActive ? '#1B3FC4' : dimmed ? '#D0D0D0' : '#D4CFC4'}
          side={THREE.DoubleSide}
          roughness={0.92}
          metalness={0.0}
          transparent={dimmed}
          opacity={dimmed ? 0.4 : 1.0}
        />
        <Edges threshold={15} color="#3A3A3A" lineWidth={1} scale={1.001} />
      </mesh>

      {/* Dashed lot boundary — site boundary green */}
      <Line
        points={boundaryPoints}
        color="#BFC5B5"
        lineWidth={1.5}
        dashed
        dashSize={0.5}
        gapSize={0.3}
      />
    </group>
  )
}
