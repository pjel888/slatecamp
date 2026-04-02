import {
  PLASTER_THICKNESS_M,
  DRY_VOLUME_FACTOR,
  CEMENT_MIX_FRACTION,
  SAND_MIX_FRACTION,
  CEMENT_BULK_DENSITY_KG_M3,
  CEMENT_BAG_KG,
} from './constants'

export interface PlasterResult {
  wetVolumeCubicM: number
  dryVolumeCubicM: number
  cementVolumeCubicM: number
  sandVolumeCubicM: number
  theoreticalCementBags: number
  adjustedCementBags: number
  procurementCementBags: number
  theoreticalSandCubicM: number
  adjustedSandCubicM: number
}

export function computePlaster(
  finishAreaSqm: number,
  wasteFactor: number
): PlasterResult {
  const wetVolumeCubicM = finishAreaSqm * PLASTER_THICKNESS_M
  const dryVolumeCubicM = wetVolumeCubicM * DRY_VOLUME_FACTOR
  const cementVolumeCubicM = CEMENT_MIX_FRACTION * dryVolumeCubicM
  const sandVolumeCubicM = SAND_MIX_FRACTION * dryVolumeCubicM

  const theoreticalCementBags = (cementVolumeCubicM * CEMENT_BULK_DENSITY_KG_M3) / CEMENT_BAG_KG
  const adjustedCementBags = theoreticalCementBags * (1 + wasteFactor)
  const procurementCementBags = Math.ceil(adjustedCementBags)

  const adjustedSandCubicM = sandVolumeCubicM * (1 + wasteFactor)

  return {
    wetVolumeCubicM,
    dryVolumeCubicM,
    cementVolumeCubicM,
    sandVolumeCubicM,
    theoreticalCementBags,
    adjustedCementBags,
    procurementCementBags,
    theoreticalSandCubicM: sandVolumeCubicM,
    adjustedSandCubicM,
  }
}
