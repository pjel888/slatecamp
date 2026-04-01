'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { useSelectionStore } from '../../stores/useSelectionStore'
import { GEOMETRY_Y, COLOR } from '../constants'
import { CITATIONS } from '@/lib/pd1096/zoningTables'

// AMBF footprint indicator — cobalt plane showing the allowable building footprint.
// This is the binding AMBF area (min of setback-based and PSO-based).

export function AMBFFootprintLayer() {
  const setbacks = useDevControlsStore((s) => s.result.setbacks.effective)
  const buildableW = useDevControlsStore((s) => s.result.buildableWidth)
  const buildableD = useDevControlsStore((s) => s.result.buildableDepth)
  const ambf = useDevControlsStore((s) => s.result.ambf)
  const bindingSource = useDevControlsStore((s) => s.result.ambfCandidates.bindingSource)
  const setSelection = useSelectionStore((s) => s.setSelection)

  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: COLOR.AMBF_BINDING,
    transparent: true,
    opacity: 0.20,
    side: THREE.DoubleSide,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -5,
    polygonOffsetUnits: -5,
  }), [])

  if (buildableW <= 0 || buildableD <= 0) return null

  return (
    <mesh
      position={[
        setbacks.left + buildableW / 2,
        GEOMETRY_Y.AMBF_FOOTPRINT,
        setbacks.front + buildableD / 2,
      ]}
      rotation={[-Math.PI / 2, 0, 0]}
      material={material}
      onClick={(e) => {
        e.stopPropagation()
        setSelection('ambf-footprint', {
          objectId: 'ambf-footprint',
          layerType: 'ambf',
          displayName: 'Allowable Maximum Building Footprint (AMBF)',
          codeReference: CITATIONS.ambf,
          computedValues: {
            'AMBF': `${ambf.toFixed(1)} sqm`,
            'Binding': bindingSource === 'setback' ? 'Setback-limited' : 'PSO-capped',
            'Buildable': `${buildableW.toFixed(1)}m × ${buildableD.toFixed(1)}m`,
          },
          violations: [],
        })
      }}
    >
      <planeGeometry args={[buildableW, buildableD]} />
    </mesh>
  )
}
