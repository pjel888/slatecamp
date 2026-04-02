import { BOARD_AREA_SQM, JC_COVERAGE_LM_PER_LITER, BOARD_HEIGHT_M, BOARD_WIDTH_M, PACKAGE_JC_CAN_SMALL_L } from './constants'

export interface DrywallBoardResult {
  theoreticalBoards: number
  adjustedBoards: number
  procurementBoards: number
}

export interface JointCompoundResult {
  theoreticalLiters: number
  adjustedLiters: number
  procurement4LCans: number
}

export function computeDrywallBoards(
  finishAreaSqm: number,
  wasteFactor: number
): DrywallBoardResult {
  const theoreticalBoards = finishAreaSqm / BOARD_AREA_SQM
  const adjustedBoards = theoreticalBoards * (1 + wasteFactor)
  const procurementBoards = Math.ceil(adjustedBoards)
  return { theoreticalBoards, adjustedBoards, procurementBoards }
}

export function computeJointCompound(
  seamLengthLM: number,
  wasteFactor: number
): JointCompoundResult {
  const theoreticalLiters = seamLengthLM / JC_COVERAGE_LM_PER_LITER
  const adjustedLiters = theoreticalLiters * (1 + wasteFactor)
  const procurement4LCans = Math.ceil(adjustedLiters / PACKAGE_JC_CAN_SMALL_L)
  return { theoreticalLiters, adjustedLiters, procurement4LCans }
}

export function deriveSeamLengthFromBoards(finishAreaSqm: number, boardHeightM = BOARD_HEIGHT_M): number {
  const boardsPerRow = Math.ceil(finishAreaSqm / (BOARD_WIDTH_M * boardHeightM))
  const verticalSeamCount = Math.max(0, boardsPerRow - 1)
  return verticalSeamCount * boardHeightM
}
