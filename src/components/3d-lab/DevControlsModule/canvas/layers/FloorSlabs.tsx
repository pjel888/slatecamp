'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { GEOMETRY_Y, COLOR, OPACITY } from '../constants'

// Floor slabs — one box per proposed storey, stacked vertically.
// NO CLAMPING: proposed footprint renders at actual dimensions.
// Visual violation cues:
//   - Red tint: footprint exceeds AMBF (setback violation)
//   - Amber tint: floors above maxCompliantFloors (FLAR/TGFA violation)

export function FloorSlabs() {
  const setbacks = useDevControlsStore((s) => s.result.setbacks.base)
  const fpW = useDevControlsStore((s) => s.building.proposedFootprintWidth)
  const fpD = useDevControlsStore((s) => s.building.proposedFootprintDepth)
  const floors = useDevControlsStore((s) => s.building.proposedStoreys)
  const floorH = useDevControlsStore((s) => s.building.floorHeight)
  const ambf = useDevControlsStore((s) => s.result.ambf)
  const maxCompliantFloors = useDevControlsStore((s) => s.result.maxCompliantFloors)
  const bhlStoreys = useDevControlsStore((s) => s.result.bhlStoreys)
  const lotW = useDevControlsStore((s) => s.lot.width)
  const lotD = useDevControlsStore((s) => s.lot.depth)

  const visW = Math.min(fpW, lotW)
  const visD = Math.min(fpD, lotD)
  const slabThickness = 0.15

  // Violation states
  const proposedArea = fpW * fpD
  const isAmbfViolation = proposedArea > ambf + 0.01

  const slabs = useMemo(() => {
    const arr: { y: number; key: number; floorNum: number }[] = []
    for (let i = 0; i < Math.min(floors, 50); i++) {
      arr.push({ y: GEOMETRY_Y.BUILDING_BASE + i * floorH, key: i, floorNum: i + 1 })
    }
    return arr
  }, [floors, floorH])

  if (visW <= 0 || visD <= 0) return null

  const posX = setbacks.left + visW / 2
  const posZ = setbacks.front + visD / 2

  return (
    <group>
      {slabs.map((slab) => {
        // Determine slab color based on violation type:
        // - AMBF violation (footprint too large): all slabs red
        // - FLAR/TGFA violation (too many floors): floors above limit amber
        // - BHL violation (too tall): floors above BHL limit amber
        const isFlarViolation = slab.floorNum > maxCompliantFloors
        const isBhlViolation = slab.floorNum > bhlStoreys

        let color: string = COLOR.BUILDING
        let opacity: number = OPACITY.FLOOR_SLAB

        if (isAmbfViolation) {
          color = '#D64545'     // red — footprint violation
          opacity = 0.65
        } else if (isBhlViolation) {
          color = '#D64545'     // red — height violation (more severe)
          opacity = 0.55
        } else if (isFlarViolation) {
          color = '#D4951A'     // amber — FLAR violation (warning)
          opacity = 0.60
        }

        return (
          <mesh
            key={slab.key}
            position={[posX, slab.y + slabThickness / 2, posZ]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[visW, slabThickness, visD]} />
            <meshStandardMaterial
              color={color}
              transparent
              opacity={opacity}
              roughness={0.8}
              metalness={0.05}
            />
          </mesh>
        )
      })}

      {/* Vertical edges — building corners */}
      {slabs.length > 0 && (
        <lineSegments
          position={[posX, GEOMETRY_Y.BUILDING_BASE + (floors * floorH) / 2, posZ]}
        >
          <edgesGeometry args={[new THREE.BoxGeometry(visW, floors * floorH, visD)]} />
          <lineBasicMaterial color={isAmbfViolation ? '#D64545' : '#8896A7'} linewidth={1} />
        </lineSegments>
      )}
    </group>
  )
}
