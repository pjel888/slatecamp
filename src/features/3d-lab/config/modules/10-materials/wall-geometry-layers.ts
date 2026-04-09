// src/features/3d-lab/config/modules/10-materials/wall-geometry-layers.ts
// Shared finish layer builder — used by ALL core types that support finish layers
// Produces GeometryInstruction[] from ComputedWallState + raw params

import type { GeometryInstruction } from '@/features/3d-lab/types/templates'
import type { ComputedWallState } from './wall-types'
import { LAYER_THICKNESSES, PAINT_COLORS, LAYER_COLORS, LAYER_OPACITIES } from './wall-constants'

// ─── Shared Finish Layer Builder ────────────────────────────────────────────

export const buildFinishLayers = (
  state: ComputedWallState,
  params: Record<string, number | boolean | string>,
): GeometryInstruction[] => {
  const instructions: GeometryInstruction[] = []

  const L = state.wallLengthMm / 1000  // meters
  const H = state.wallHeightMm / 1000  // meters
  const T = state.coreThickness         // meters

  const showPlaster = (params.showPlaster === true || params.showPlaster === 'true')
    && state.registryEntry.supportsPlaster
  const showSkim = params.showSkim === true || params.showSkim === 'true'
  const showPrimer = params.showPrimer === true || params.showPrimer === 'true'
  const showPaint = params.showPaint === true || params.showPaint === 'true'
  const paintColor = String(params.paintColor ?? 'White')
  const paintHex = PAINT_COLORS[paintColor] ?? '#ffffff'

  // Accumulated offsets from core center outward on each side
  let frontOffset = T / 2
  let backOffset = T / 2

  // ── Layer addition helper ─────────────────────────────────────────────────
  // Mirrors the addLayer pattern from unified-wall-configurator.ts
  const addLayer = (
    side: 'front' | 'back' | 'both',
    idSuffix: string,
    thickness: number,
    color: string,
    opacity: number,
    label?: string,
  ): void => {
    const half = thickness / 2

    if (side === 'front' || side === 'both') {
      frontOffset += half
      instructions.push({
        id: `layer-front-${idSuffix}`,
        type: 'box',
        position: [0, H / 2, frontOffset],
        args: [L + 0.002, H + 0.002, thickness],
        color,
        opacity,
        transparent: true,
        label: (side === 'front' || side === 'both') ? label : undefined,
      })
      frontOffset += half
    }

    if (side === 'back' || side === 'both') {
      backOffset += half
      instructions.push({
        id: `layer-back-${idSuffix}`,
        type: 'box',
        position: [0, H / 2, -backOffset],
        args: [L + 0.002, H + 0.002, thickness],
        color,
        opacity,
        transparent: true,
      })
      backOffset += half
    }
  }

  const layerSide = state.bothSides ? 'both' : 'front'

  // ── Plaster ───────────────────────────────────────────────────────────────
  if (showPlaster) {
    addLayer(layerSide, 'plaster', LAYER_THICKNESSES.plaster, LAYER_COLORS.plaster, LAYER_OPACITIES.plaster, 'Plaster')
  }

  // ── Skim coat ─────────────────────────────────────────────────────────────
  if (showSkim) {
    addLayer(layerSide, 'skim', LAYER_THICKNESSES.skimCoat, LAYER_COLORS.skimCoat, LAYER_OPACITIES.skimCoat, 'Skim Coat')
  }

  // ── Primer ────────────────────────────────────────────────────────────────
  if (showPrimer) {
    addLayer(layerSide, 'primer', LAYER_THICKNESSES.primer, LAYER_COLORS.primer, LAYER_OPACITIES.primer, 'Primer')
  }

  // ── Paint ─────────────────────────────────────────────────────────────────
  if (showPaint) {
    addLayer(layerSide, 'paint', LAYER_THICKNESSES.paint, paintHex, LAYER_OPACITIES.paint, `Paint — ${paintColor}`)
  }

  return instructions
}
