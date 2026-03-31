'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { GEOMETRY_Y, COLOR, OPACITY } from '../constants'

// Floor slabs — one box per proposed storey, stacked vertically.
// Uses individual meshes (instancing adds complexity for small N).

export function FloorSlabs() {
  const setbacks = useDevControlsStore((s) => s.result.setbacks.effective)
  const fpW = useDevControlsStore((s) => s.building.proposedFootprintWidth)
  const fpD = useDevControlsStore((s) => s.building.proposedFootprintDepth)
  const floors = useDevControlsStore((s) => s.building.proposedStoreys)
  const floorH = useDevControlsStore((s) => s.building.floorHeight)
  const buildableW = useDevControlsStore((s) => s.result.buildableWidth)
  const buildableD = useDevControlsStore((s) => s.result.buildableDepth)

  // Clamp proposed footprint to buildable area for visualization
  const visW = Math.min(fpW, buildableW)
  const visD = Math.min(fpD, buildableD)
  const slabThickness = 0.15

  const slabs = useMemo(() => {
    const arr: { y: number; key: number }[] = []
    for (let i = 0; i < Math.min(floors, 50); i++) {
      arr.push({ y: GEOMETRY_Y.BUILDING_BASE + i * floorH, key: i })
    }
    return arr
  }, [floors, floorH])

  if (visW <= 0 || visD <= 0) return null

  return (
    <group>
      {slabs.map((slab) => (
        <mesh
          key={slab.key}
          position={[
            setbacks.left + visW / 2,
            slab.y + slabThickness / 2,
            setbacks.front + visD / 2,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[visW, slabThickness, visD]} />
          <meshStandardMaterial
            color={COLOR.BUILDING}
            transparent
            opacity={OPACITY.FLOOR_SLAB}
            roughness={0.8}
            metalness={0.05}
          />
        </mesh>
      ))}

      {/* Vertical edges — building corners */}
      {slabs.length > 0 && (
        <lineSegments
          position={[
            setbacks.left + visW / 2,
            GEOMETRY_Y.BUILDING_BASE + (floors * floorH) / 2,
            setbacks.front + visD / 2,
          ]}
        >
          <edgesGeometry args={[new THREE.BoxGeometry(visW, floors * floorH, visD)]} />
          <lineBasicMaterial color="#8896A7" linewidth={1} />
        </lineSegments>
      )}
    </group>
  )
}
