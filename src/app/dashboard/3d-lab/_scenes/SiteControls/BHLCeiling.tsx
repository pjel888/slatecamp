'use client'

import { Edges } from '@react-three/drei'
import * as THREE from 'three'
import { useSiteControlsStore } from '../../_stores/siteControlsStore'

/**
 * Transparent plane at building height showing the BHL ceiling cap.
 * Helps students see how far the building extends toward its height limit.
 */
export function BHLCeiling() {
  const computed = useSiteControlsStore((s) => s.computed)

  const { buildingHeight, setbacks, buildableWidth, buildableDepth } = computed

  if (buildableWidth <= 0 || buildableDepth <= 0 || buildingHeight <= 0) return null

  const cx = setbacks.left + buildableWidth / 2
  const cz = setbacks.front + buildableDepth / 2

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[cx, buildingHeight + 0.02, cz]}
    >
      <planeGeometry args={[buildableWidth + 1, buildableDepth + 1]} />
      <meshStandardMaterial
        color="#F5A623"
        transparent
        opacity={0.08}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
      <Edges threshold={15} color="#F5A623" lineWidth={1.0} />
    </mesh>
  )
}
