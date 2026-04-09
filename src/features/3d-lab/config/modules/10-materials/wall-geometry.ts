// src/features/3d-lab/config/modules/10-materials/wall-geometry.ts
// Main geometry dispatcher — routes to core-type-specific sub-builders + shared layers

import type { GeometryInstruction } from '@/features/3d-lab/types/templates'
import type { ComputedWallState, WallViewMode } from './wall-types'
import { buildCHBGeometry } from './wall-geometry-chb'
import { buildDrywallGeometry } from './wall-geometry-drywall'
import { buildBrickGeometry } from './wall-geometry-brick'
import { buildGenericGeometry } from './wall-geometry-generic'
import { buildFinishLayers } from './wall-geometry-layers'
import { buildMEPGeometry } from './wall-geometry-mep'
import { buildConnectionGeometry } from './wall-geometry-connections'
import { getBuildSteps } from './wall-build-steps'

export const buildWallGeometry = (
  state: ComputedWallState,
  params: Record<string, number | boolean | string>
): GeometryInstruction[] => {
  const L = state.wallLengthMm / 1000
  const H = state.wallHeightMm / 1000
  const T = state.coreThickness

  const inst: GeometryInstruction[] = []

  // ── Ground plane ──
  inst.push({
    id: 'ground',
    type: 'box',
    position: [0, -0.05, 0],
    args: [L + 1.0, 0.1, T + 2.0],
    color: '#e4e4e7',
    opacity: 0.6,
    transparent: true,
  })

  // ── Core geometry — exhaustive dispatch by core type ──
  let coreInstructions: GeometryInstruction[]

  switch (state.coreType) {
    case 'chb':
      coreInstructions = buildCHBGeometry(state)
      break
    case 'drywall':
      coreInstructions = buildDrywallGeometry(state)
      break
    case 'brick':
      coreInstructions = buildBrickGeometry(state)
      break
    case 'plywood':
    case 'cement-board':
    case 'solid-concrete':
    case 'existing-wall':
      coreInstructions = buildGenericGeometry(state)
      break
    default: {
      // Exhaustive check — TypeScript compile error if a CoreType is missing
      const _exhaustive: never = state.coreType
      throw new Error(`Unknown core type: ${_exhaustive}`)
    }
  }

  inst.push(...coreInstructions)

  // ── View mode ──
  const viewMode = String(params.viewMode || 'overview') as WallViewMode

  // ── Shared finish layers ──
  let layerInstructions = buildFinishLayers(state, params)

  // ── Section-cut: reduce finish layer opacity for transparency ──
  if (viewMode === 'section-cut') {
    layerInstructions = layerInstructions.map(inst => ({
      ...inst,
      opacity: 0.4,
      transparent: true,
    }))
  }

  // ── Exploded: offset each layer's Z position by explode amount ──
  if (viewMode === 'exploded') {
    const explodePercent = Number(params.explodeAmount || 0) / 100
    const gapSize = 0.15 // 150mm gap between layers at full explosion
    layerInstructions = layerInstructions.map((inst, index) => ({
      ...inst,
      position: [
        inst.position[0],
        inst.position[1],
        inst.position[2] + explodePercent * (index + 1) * gapSize,
      ] as [number, number, number],
      // Add label when exploded past 30%
      label: explodePercent > 0.3 ? inst.label : undefined,
    }))
  }

  inst.push(...layerInstructions)

  // ── MEP elements ──
  const mepInstructions = buildMEPGeometry(state, params)
  inst.push(...mepInstructions)

  // ── Connection details ──
  const connectionInstructions = buildConnectionGeometry(state, params)
  inst.push(...connectionInstructions)

  // ── Waterproofing membrane ──
  const wallLocation = String(params.wallLocation || 'interior')
  const showWaterproofing = params.showWaterproofing === true || params.showWaterproofing === 'true'

  if (showWaterproofing && wallLocation !== 'interior') {
    const wpHeight = wallLocation === 'bathroom' ? Math.min(1.8, H) : H
    const wpFrontOffset = state.layerStack
      .filter(l => l.side === 'front')
      .reduce((sum, l) => sum + l.thickness, T / 2)
    const wpZ = wallLocation === 'below-grade'
      ? -(T / 2 + 0.005)  // Earth-facing side
      : (wpFrontOffset + 0.005)  // After finish layers

    inst.push({
      id: 'waterproofing-membrane',
      type: 'box',
      position: [0, wpHeight / 2, wpZ],
      args: [L + 0.004, wpHeight, 0.003],
      color: '#06b6d4', // Cyan — waterproofing membrane
      opacity: 0.5,
      transparent: true,
      label: wallLocation === 'bathroom' ? 'Waterproofing (to 1800mm)' : 'Waterproofing Membrane',
    })
  }

  // ── Total thickness indicator ──
  const frontOffset = state.layerStack
    .filter(l => l.side === 'front')
    .reduce((sum, l) => sum + l.thickness, T / 2)
  const backOffset = state.bothSides
    ? state.layerStack
        .filter(l => l.side === 'back')
        .reduce((sum, l) => sum + l.thickness, T / 2)
    : T / 2
  const totalT = frontOffset + backOffset

  inst.push({
    id: 'thickness-edge',
    type: 'box',
    position: [L / 2 + 0.015, H / 2, (frontOffset - T / 2) / 2],
    args: [0.01, H * 0.6, totalT],
    color: '#1B3FC4',
    opacity: 0.25,
    transparent: true,
    label: `Total: ${Math.round(totalT * 1000)}mm`,
  })

  // ── Build-sequence: filter to only geometry visible at current step ──
  if (viewMode === 'build-sequence') {
    const steps = getBuildSteps(state.coreType)
    const currentStep = Math.min(Number(params.buildStep || steps.length), steps.length)
    const visibleIds = new Set(steps[currentStep - 1]?.visibleIds ?? [])
    return inst.filter(i => visibleIds.has(i.id))
  }

  return inst
}
