'use client'

import { Edges } from '@react-three/drei'
import * as THREE from 'three'
import { useSiteControlsStore } from '../../_stores/siteControlsStore'

/** TLA base ground plane — sized to full lot dimensions. */
export function LotPlane() {
  const lotWidth = useSiteControlsStore((s) => s.inputs.lotWidth)
  const lotDepth = useSiteControlsStore((s) => s.inputs.lotDepth)
  const activeZone = useSiteControlsStore((s) => s.activeZone)
  const setActiveZone = useSiteControlsStore((s) => s.setActiveZone)

  const isActive = activeZone === 'tla'
  const dimmed = activeZone !== null && !isActive

  return (
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
        color="#E8E4DB"
        side={THREE.DoubleSide}
        transparent={dimmed}
        opacity={dimmed ? 0.4 : 1.0}
      />
      <Edges threshold={15} color="#8A8680" lineWidth={1} scale={1.001} />
    </mesh>
  )
}
