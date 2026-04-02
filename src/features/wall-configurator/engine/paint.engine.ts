import { PAINT_COVERAGE_SQM_PER_L, PACKAGE_PAINT_PAIL_L, PACKAGE_PAINT_CAN_L } from './constants'

export interface PaintLayerResult {
  theoreticalLiters: number
  adjustedLiters: number
  procurement16LPails: number
  procurement4LCans: number
}

export function computePaintLayer(
  finishAreaSqm: number,
  coats: number,
  wasteFactor: number,
  coverageSqmPerLPerCoat: number = PAINT_COVERAGE_SQM_PER_L
): PaintLayerResult {
  const theoreticalLiters = (finishAreaSqm * coats) / coverageSqmPerLPerCoat
  const adjustedLiters = theoreticalLiters * (1 + wasteFactor)
  const procurement16LPails = Math.ceil(adjustedLiters / PACKAGE_PAINT_PAIL_L)
  const procurement4LCans = Math.ceil(adjustedLiters / PACKAGE_PAINT_CAN_L)
  return { theoreticalLiters, adjustedLiters, procurement16LPails, procurement4LCans }
}
