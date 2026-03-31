'use client'

import { useMemo } from 'react'
import { Edges } from '@react-three/drei'
import * as THREE from 'three'
import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { GEOMETRY_Y, COLOR, OPACITY } from '../constants'

// Ghost volumes for the non-binding AMBF candidates:
// - PSO-based AMBF (amber wireframe)
// - Setback-based AMBF (grey wireframe)
// Only the non-binding candidate is shown as a ghost.

export function AMBFGhostCandidates() {
  const lotW = useDevControlsStore((s) => s.lot.width)
  const lotD = useDevControlsStore((s) => s.lot.depth)
  const setbacks = useDevControlsStore((s) => s.result.setbacks.effective)
  const candidates = useDevControlsStore((s) => s.result.ambfCandidates)
  const bhlMeters = useDevControlsStore((s) => s.result.bhlMeters)
  const buildableW = useDevControlsStore((s) => s.result.buildableWidth)
  const buildableD = useDevControlsStore((s) => s.result.buildableDepth)

  // If binding source is setback, show PSO ghost. If PSO, show setback ghost.
  // Only show ghost when the two candidates are meaningfully different (>1% of TLA).
  const psoMeaningful = candidates.byPSO < Infinity && Math.abs(candidates.byPSO - candidates.bySetbacks) > (lotW * lotD * 0.01)
  const showPSOGhost = candidates.bindingSource === 'setback' && psoMeaningful
  const showSBGhost = candidates.bindingSource === 'pso' && Math.abs(candidates.bySetbacks - candidates.byPSO) > (lotW * lotD * 0.01)

  // PSO ghost dimensions — square footprint sized to PSO area
  const psoSide = Math.sqrt(Math.max(0, candidates.byPSO))
  // Clamp to lot dimensions
  const psoW = Math.min(psoSide, lotW)
  const psoD = candidates.byPSO > 0 ? Math.min(candidates.byPSO / psoW, lotD) : 0

  return (
    <group>
      {/* PSO-based ghost (amber) — shown when setback is binding */}
      {showPSOGhost && psoW > 0 && psoD > 0 && (
        <mesh
          position={[
            setbacks.left + psoW / 2,
            GEOMETRY_Y.BUILDING_BASE + bhlMeters / 2,
            setbacks.front + psoD / 2,
          ]}
        >
          <boxGeometry args={[psoW, bhlMeters, psoD]} />
          <meshStandardMaterial
            color={COLOR.AMBF_GHOST_PSO}
            transparent
            opacity={OPACITY.AMBF_GHOST}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
          <Edges color={COLOR.AMBF_GHOST_PSO} lineWidth={1} />
        </mesh>
      )}

      {/* Setback-based ghost (grey) — shown when PSO is binding */}
      {showSBGhost && buildableW > 0 && buildableD > 0 && (
        <mesh
          position={[
            setbacks.left + buildableW / 2,
            GEOMETRY_Y.BUILDING_BASE + bhlMeters / 2,
            setbacks.front + buildableD / 2,
          ]}
        >
          <boxGeometry args={[buildableW, bhlMeters, buildableD]} />
          <meshStandardMaterial
            color={COLOR.AMBF_GHOST_SB}
            transparent
            opacity={OPACITY.AMBF_GHOST}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
          <Edges color={COLOR.AMBF_GHOST_SB} lineWidth={1} />
        </mesh>
      )}
    </group>
  )
}
