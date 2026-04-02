import {
  TILE_ADHESIVE_KG_PER_SQM,
  TILE_GROUT_KG_PER_SQM,
  TILE_ADHESIVE_BAG_KG,
  TILE_GROUT_BAG_KG,
} from './constants'
import type { TileConfig } from '../types/wall.types'

export interface TileEstimate {
  tileAreaEach: number
  tilesTheoretical: number
  tilesAdjusted: number
  tilesProcurement: number
  tilesPerBox: number
  boxCount: number
  adhesiveKg: number
  adhesiveBags: number
  groutKg: number
  groutBags: number
}

export function computeTileEstimate(
  finishAreaSqm: number,
  tileConfig: TileConfig,
  wasteFactor: number = 0.10,
): TileEstimate {
  const tileW = tileConfig.widthMM / 1000
  const tileH = tileConfig.heightMM / 1000
  const groutGap = tileConfig.groutGapMM / 1000

  // Effective tile area including grout gap on right and bottom edges
  const effectiveTileArea = (tileW + groutGap) * (tileH + groutGap)
  const tileAreaEach = tileW * tileH

  const tilesTheoretical = Math.ceil(finishAreaSqm / effectiveTileArea)
  const tilesAdjusted = Math.ceil(tilesTheoretical * (1 + wasteFactor))

  // Standard box sizes by tile dimension
  const tilesPerBox = tileW <= 0.3 && tileH <= 0.3 ? 11 : tileW <= 0.3 ? 8 : 4
  const boxCount = Math.ceil(tilesAdjusted / tilesPerBox)
  const tilesProcurement = boxCount * tilesPerBox

  // Adhesive and grout
  const adhesiveKg = Math.ceil(finishAreaSqm * TILE_ADHESIVE_KG_PER_SQM * (1 + wasteFactor))
  const adhesiveBags = Math.ceil(adhesiveKg / TILE_ADHESIVE_BAG_KG)
  const groutKg = Math.ceil(finishAreaSqm * TILE_GROUT_KG_PER_SQM * (1 + wasteFactor))
  const groutBags = Math.ceil(groutKg / TILE_GROUT_BAG_KG)

  return {
    tileAreaEach,
    tilesTheoretical,
    tilesAdjusted,
    tilesProcurement,
    tilesPerBox,
    boxCount,
    adhesiveKg,
    adhesiveBags,
    groutKg,
    groutBags,
  }
}
