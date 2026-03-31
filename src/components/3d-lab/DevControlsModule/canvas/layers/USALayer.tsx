'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { useSelectionStore } from '../../stores/useSelectionStore'
import { GEOMETRY_Y, COLOR, OPACITY } from '../constants'
import { CITATIONS } from '@/lib/pd1096/zoningTables'

// USA (Unpaved Surface Area) — softscape zone rendered as trail-green overlay.
// Positioned in the rear portion of the lot within the TOSL area.

export function USALayer() {
  const lotW = useDevControlsStore((s) => s.lot.width)
  const lotD = useDevControlsStore((s) => s.lot.depth)
  const setbacks = useDevControlsStore((s) => s.result.setbacks.effective)
  const usa = useDevControlsStore((s) => s.result.usa)
  const usaPercent = useDevControlsStore((s) => s.result.usaPercent)
  const tla = useDevControlsStore((s) => s.result.tla)
  const setSelection = useSelectionStore((s) => s.setSelection)

  // USA strip runs along the rear setback zone (garden/landscape concept)
  const buildableW = Math.max(0.1, lotW - setbacks.left - setbacks.right)
  const usaDepth = buildableW > 0 ? Math.min(usa / buildableW, setbacks.rear) : 0

  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: COLOR.USA,
    transparent: true,
    opacity: OPACITY.USA_ZONE,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), [])

  if (usa <= 0 || usaDepth <= 0) return null

  return (
    <mesh
      position={[
        setbacks.left + buildableW / 2,
        GEOMETRY_Y.SOFTSCAPE_USA,
        lotD - usaDepth / 2,
      ]}
      rotation={[-Math.PI / 2, 0, 0]}
      material={material}
      onClick={(e) => {
        e.stopPropagation()
        setSelection('usa-zone', {
          objectId: 'usa-zone',
          layerType: 'usa',
          displayName: 'Unpaved Surface Area (USA)',
          codeReference: CITATIONS.usa,
          computedValues: {
            'USA': `${usa.toFixed(1)} sqm`,
            'Table %': `${(usaPercent * 100).toFixed(0)}% of TLA`,
            'TLA': `${tla.toFixed(1)} sqm`,
          },
          violations: [],
        })
      }}
    >
      <planeGeometry args={[buildableW, usaDepth]} />
    </mesh>
  )
}
