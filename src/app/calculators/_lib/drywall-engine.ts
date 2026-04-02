// src/app/calculators/_lib/drywall-engine.ts
// Pure drywall partition estimation computation engine.

export interface DrywallInputs {
  wallLengthMm: number
  wallHeightMm: number
  openings: Array<{
    id: string
    type: 'door' | 'window' | 'pass-through'
    widthMm: number
    heightMm: number
    xOffsetMm: number
    yOffsetMm: number
  }>
  studSpacingMm: number
  boardLengthMm: number
  boardWidthMm: number
  boardLayersPerSide: number
  sidesBoarded: 'one-side' | 'two-side'
  boardOrientation: 'vertical' | 'horizontal'
  wastePercent: number
  includeCornerStudAllowance: boolean
  cornerStudExtraCount: number
  includeOpeningFramingAllowance: boolean
  extraStudsPerOpening: number
  trackStockLengthMm: number
}

export interface DrywallEstimate {
  grossWallAreaSqm: number
  openingAreaSqm: number
  netWallAreaSqm: number
  boardedFaceCount: number
  boardLayersPerSide: number
  totalBoardedAreaSqm: number
  boardAreaSqm: number
  rawBoardCount: number
  adjustedBoardCount: number
  roundedBoardCount: number
  baseStudCount: number
  cornerAllowanceCount: number
  openingExtraStudCount: number
  finalStudCount: number
  topTrackLengthMm: number
  bottomTrackLengthMm: number
  totalTrackLengthMm: number
  headerTrackLengthMm: number
  trackPiecesToBuy: number
  studPositionsM: number[]
  boardPlacements: Array<{
    id: string
    xM: number
    yM: number
    wM: number
    hM: number
    face: 'front' | 'back'
    isCut: boolean
  }>
  assumptions: string[]
}

export function computeDrywallEstimate(inputs: DrywallInputs): DrywallEstimate {
  // Gross wall face area
  const grossWallAreaSqm = (inputs.wallLengthMm * inputs.wallHeightMm) / 1_000_000

  // Opening area
  const openingAreaSqm = inputs.openings.reduce(
    (sum, o) => sum + (o.widthMm * o.heightMm) / 1_000_000,
    0,
  )

  // Net wall face area
  const netWallAreaSqm = Math.max(0, grossWallAreaSqm - openingAreaSqm)

  // Boarded face multiplier
  const boardedFaceCount = inputs.sidesBoarded === 'two-side' ? 2 : 1

  // Total boarded area
  const totalBoardedAreaSqm =
    netWallAreaSqm * boardedFaceCount * inputs.boardLayersPerSide

  // Board area
  const boardAreaSqm = (inputs.boardLengthMm * inputs.boardWidthMm) / 1_000_000

  // Board counts
  const rawBoardCount = boardAreaSqm > 0 ? totalBoardedAreaSqm / boardAreaSqm : 0
  const adjustedBoardCount = rawBoardCount * (1 + inputs.wastePercent / 100)
  const roundedBoardCount = Math.ceil(adjustedBoardCount)

  // Stud logic
  const baseStudCount =
    inputs.studSpacingMm > 0
      ? Math.ceil(inputs.wallLengthMm / inputs.studSpacingMm) + 1
      : 0

  const cornerAllowanceCount = inputs.includeCornerStudAllowance
    ? inputs.cornerStudExtraCount
    : 0

  const openingExtraStudCount = inputs.includeOpeningFramingAllowance
    ? inputs.openings.length * inputs.extraStudsPerOpening
    : 0

  const finalStudCount = baseStudCount + cornerAllowanceCount + openingExtraStudCount

  // Track logic
  const topTrackLengthMm = inputs.wallLengthMm
  // Bottom track: full length minus door openings at floor level
  const doorOpeningWidths = inputs.openings
    .filter((o) => o.type === 'door' && o.yOffsetMm === 0)
    .reduce((sum, o) => sum + o.widthMm, 0)
  const bottomTrackLengthMm = inputs.wallLengthMm - doorOpeningWidths

  const totalTrackLengthMm = topTrackLengthMm + bottomTrackLengthMm

  // Header tracks above openings
  const headerTrackLengthMm = inputs.openings.reduce((sum, o) => sum + o.widthMm + 140, 0)

  const totalTrackNeeded = totalTrackLengthMm + headerTrackLengthMm
  const trackPiecesToBuy =
    inputs.trackStockLengthMm > 0
      ? Math.ceil(totalTrackNeeded / inputs.trackStockLengthMm)
      : 0

  // Pre-compute stud positions for 3D rendering (meters)
  const studPositionsM = computeStudPositions(inputs)

  // Pre-compute board placements for 3D rendering
  const boardPlacements = computeBoardPlacements(inputs)

  // Assumptions
  const assumptions: string[] = [
    `Stud spacing: ${inputs.studSpacingMm}mm on center`,
    `Board: ${inputs.boardLengthMm} × ${inputs.boardWidthMm}mm, ${inputs.boardOrientation} orientation`,
    `Sides boarded: ${inputs.sidesBoarded === 'two-side' ? 'both sides' : 'one side'}`,
    `Layers per side: ${inputs.boardLayersPerSide}`,
    `Waste allowance: ${inputs.wastePercent}%`,
  ]
  if (inputs.includeCornerStudAllowance) {
    assumptions.push(`Corner stud allowance: +${inputs.cornerStudExtraCount} studs`)
  }
  if (inputs.includeOpeningFramingAllowance) {
    assumptions.push(
      `Opening framing: +${inputs.extraStudsPerOpening} studs per opening`,
    )
  }
  if (inputs.trackStockLengthMm > 0) {
    assumptions.push(`Track stock length: ${inputs.trackStockLengthMm}mm`)
  }

  return {
    grossWallAreaSqm,
    openingAreaSqm,
    netWallAreaSqm,
    boardedFaceCount,
    boardLayersPerSide: inputs.boardLayersPerSide,
    totalBoardedAreaSqm,
    boardAreaSqm,
    rawBoardCount,
    adjustedBoardCount,
    roundedBoardCount,
    baseStudCount,
    cornerAllowanceCount,
    openingExtraStudCount,
    finalStudCount,
    topTrackLengthMm,
    bottomTrackLengthMm,
    totalTrackLengthMm,
    headerTrackLengthMm,
    trackPiecesToBuy,
    studPositionsM,
    boardPlacements,
    assumptions,
  }
}

/** Pre-compute stud X positions in meters for 3D rendering */
export function computeStudPositions(inputs: DrywallInputs): number[] {
  if (inputs.studSpacingMm <= 0 || inputs.wallLengthMm <= 0) return []
  const spacingM = inputs.studSpacingMm / 1000
  const wallLM = inputs.wallLengthMm / 1000
  const positions: number[] = []

  let x = 0
  while (x <= wallLM + 0.001) {
    positions.push(x)
    x += spacingM
  }
  // Ensure end stud
  if (positions.length > 0 && Math.abs(positions[positions.length - 1] - wallLM) > 0.01) {
    positions.push(wallLM)
  }
  return positions
}

/** Pre-compute board placement rects for 3D rendering */
export function computeBoardPlacements(
  inputs: DrywallInputs,
): DrywallEstimate['boardPlacements'] {
  const wallLM = inputs.wallLengthMm / 1000
  const wallHM = inputs.wallHeightMm / 1000
  const boardLM = inputs.boardLengthMm / 1000
  const boardWM = inputs.boardWidthMm / 1000

  if (boardLM <= 0 || boardWM <= 0 || wallLM <= 0 || wallHM <= 0) return []

  const placements: DrywallEstimate['boardPlacements'] = []
  const faces: Array<'front' | 'back'> =
    inputs.sidesBoarded === 'two-side' ? ['front', 'back'] : ['front']

  for (const face of faces) {
    if (inputs.boardOrientation === 'vertical') {
      // Boards placed vertically: width along X, length along Y
      const cols = Math.ceil(wallLM / boardWM)
      const rows = Math.ceil(wallHM / boardLM)

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const xM = c * boardWM
          const yM = r * boardLM
          const isCut = xM + boardWM > wallLM || yM + boardLM > wallHM
          placements.push({
            id: `${face}-${r}-${c}`,
            xM,
            yM,
            wM: Math.min(boardWM, wallLM - xM),
            hM: Math.min(boardLM, wallHM - yM),
            face,
            isCut,
          })
        }
      }
    } else {
      // Horizontal: length along X, width along Y
      const cols = Math.ceil(wallLM / boardLM)
      const rows = Math.ceil(wallHM / boardWM)

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const xM = c * boardLM
          const yM = r * boardWM
          const isCut = xM + boardLM > wallLM || yM + boardWM > wallHM
          placements.push({
            id: `${face}-${r}-${c}`,
            xM,
            yM,
            wM: Math.min(boardLM, wallLM - xM),
            hM: Math.min(boardWM, wallHM - yM),
            face,
            isCut,
          })
        }
      }
    }
  }

  return placements
}
