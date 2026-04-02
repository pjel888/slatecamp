import { CHB_FACE_AREA_SQM } from './constants'

export interface CHBResult {
  theoreticalPcs: number
  adjustedPcs: number
  procurementPcs: number
}

export function computeCHB(netAreaSqm: number, wasteFactor: number): CHBResult {
  const theoreticalPcs = netAreaSqm / CHB_FACE_AREA_SQM
  const adjustedPcs = theoreticalPcs * (1 + wasteFactor)
  const procurementPcs = Math.ceil(adjustedPcs)
  return { theoreticalPcs, adjustedPcs, procurementPcs }
}
