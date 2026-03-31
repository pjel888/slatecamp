'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { useSelectionStore } from '../../stores/useSelectionStore'
import { GEOMETRY_Y, COLOR, OPACITY } from '../constants'
import { CITATIONS } from '@/lib/pd1096/zoningTables'

// ISA (Impervious Surface Area) — hardscape zone rendered as amber overlay.
// Positioned adjacent to the building footprint within the TOSL area.
// Layout: ISA strip runs along the front setback zone (driveway/parking concept).

export function ISALayer() {
  const lotW = useDevControlsStore((s) => s.lot.width)
  const lotD = useDevControlsStore((s) => s.lot.depth)
  const setbacks = useDevControlsStore((s) => s.result.setbacks.effective)
  const isa = useDevControlsStore((s) => s.result.isa)
  const isaPercent = useDevControlsStore((s) => s.result.isaPercent)
  const tla = useDevControlsStore((s) => s.result.tla)
  const setSelection = useSelectionStore((s) => s.setSelection)

  // ISA is placed as a strip in front of the buildable area
  const buildableW = Math.max(0.1, lotW - setbacks.left - setbacks.right)
  const isaDepth = buildableW > 0 ? Math.min(isa / buildableW, setbacks.front) : 0

  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: COLOR.ISA,
    transparent: true,
    opacity: OPACITY.ISA_ZONE,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), [])

  if (isa <= 0 || isaDepth <= 0) return null

  return (
    <mesh
      position={[
        setbacks.left + buildableW / 2,
        GEOMETRY_Y.HARDSCAPE_ISA,
        isaDepth / 2,
      ]}
      rotation={[-Math.PI / 2, 0, 0]}
      material={material}
      onClick={(e) => {
        e.stopPropagation()
        setSelection('isa-zone', {
          objectId: 'isa-zone',
          layerType: 'isa',
          displayName: 'Impervious Surface Area (ISA)',
          codeReference: CITATIONS.isa,
          computedValues: {
            'ISA': `${isa.toFixed(1)} sqm`,
            'Table %': `${(isaPercent * 100).toFixed(0)}% of TLA`,
            'TLA': `${tla.toFixed(1)} sqm`,
          },
          violations: [],
        })
      }}
    >
      <planeGeometry args={[buildableW, isaDepth]} />
    </mesh>
  )
}
