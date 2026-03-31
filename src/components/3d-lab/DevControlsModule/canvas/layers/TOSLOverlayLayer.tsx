'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { useSelectionStore } from '../../stores/useSelectionStore'
import { GEOMETRY_Y, COLOR, OPACITY } from '../constants'
import { CITATIONS } from '@/lib/pd1096/zoningTables'

// TOSL overlay — transparent highlight over the entire open space (ISA + USA).
// Covers the lot area minus the building footprint.

export function TOSLOverlayLayer() {
  const lotW = useDevControlsStore((s) => s.lot.width)
  const lotD = useDevControlsStore((s) => s.lot.depth)
  const tosl = useDevControlsStore((s) => s.result.tosl)
  const tla = useDevControlsStore((s) => s.result.tla)
  const setSelection = useSelectionStore((s) => s.setSelection)

  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: COLOR.TOSL,
    transparent: true,
    opacity: OPACITY.TOSL_OVERLAY,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), [])

  return (
    <mesh
      position={[lotW / 2, GEOMETRY_Y.TOSL_OVERLAY, lotD / 2]}
      rotation={[-Math.PI / 2, 0, 0]}
      material={material}
      onClick={(e) => {
        e.stopPropagation()
        setSelection('tosl-overlay', {
          objectId: 'tosl-overlay',
          layerType: 'tosl',
          displayName: 'Total Open Space within Lot (TOSL)',
          codeReference: CITATIONS.tosl,
          computedValues: {
            'TOSL': `${tosl.toFixed(1)} sqm`,
            '% of TLA': `${((tosl / tla) * 100).toFixed(1)}%`,
            'TLA': `${tla.toFixed(1)} sqm`,
          },
          violations: [],
        })
      }}
    >
      <planeGeometry args={[lotW, lotD]} />
    </mesh>
  )
}
