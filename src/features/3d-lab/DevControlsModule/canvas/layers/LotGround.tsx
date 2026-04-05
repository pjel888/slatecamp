'use client'

import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { useSelectionStore } from '../../stores/useSelectionStore'
import { GEOMETRY_Y, COLOR } from '../constants'
import { CITATIONS } from '@/lib/pd1096/zoningTables'

// Rectangular lot ground plane with dashed boundary outline.

export function LotGround() {
  const lotW = useDevControlsStore((s) => s.lot.width)
  const lotD = useDevControlsStore((s) => s.lot.depth)
  const tla = useDevControlsStore((s) => s.result.tla)
  const setSelection = useSelectionStore((s) => s.setSelection)

  const boundaryPoints = useMemo(() => [
    new THREE.Vector3(0, GEOMETRY_Y.LOT_SURFACE + 0.001, 0),
    new THREE.Vector3(lotW, GEOMETRY_Y.LOT_SURFACE + 0.001, 0),
    new THREE.Vector3(lotW, GEOMETRY_Y.LOT_SURFACE + 0.001, lotD),
    new THREE.Vector3(0, GEOMETRY_Y.LOT_SURFACE + 0.001, lotD),
    new THREE.Vector3(0, GEOMETRY_Y.LOT_SURFACE + 0.001, 0),
  ], [lotW, lotD])

  return (
    <group>
      <mesh
        position={[lotW / 2, GEOMETRY_Y.LOT_SURFACE, lotD / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation()
          setSelection('lot-ground', {
            objectId: 'lot-ground',
            layerType: 'lot',
            displayName: 'Total Lot Area (TLA)',
            codeReference: CITATIONS.tla,
            computedValues: {
              'Width': `${lotW.toFixed(1)} m`,
              'Depth': `${lotD.toFixed(1)} m`,
              'TLA': `${tla.toFixed(1)} sqm`,
            },
            violations: [],
          })
        }}
      >
        <planeGeometry args={[lotW, lotD]} />
        <meshStandardMaterial color={COLOR.LOT_SURFACE} roughness={0.9} metalness={0} />
      </mesh>
      <Line points={boundaryPoints} color="#4A5568" lineWidth={1.5} dashed dashSize={0.5} gapSize={0.3} />
    </group>
  )
}
