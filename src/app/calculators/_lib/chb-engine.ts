// src/app/calculators/_lib/chb-engine.ts
// Pure CHB (Concrete Hollow Block) wall estimation engine.

// ─── Types ────────────────────────────────────────────────────────────────────

export type CHBSize = '4-inch' | '6-inch' | '8-inch'

export interface CHBInputs {
  wallLengthMm: number
  wallHeightMm: number
  openings: Array<{
    id: string
    type: 'door' | 'window'
    widthMm: number
    heightMm: number
    xOffsetMm: number
    yOffsetMm: number
  }>
  /** CHB block dimensions */
  blockLengthMm: number   // 400 standard
  blockHeightMm: number   // 200 standard
  blockThicknessMm: number // 100 (4"), 150 (6"), 200 (8")
  chbSize: CHBSize
  mortarJointMm: number   // 10 standard
  wastePercent: number
  /** Vertical rebar */
  includeVerticalRebar: boolean
  verticalRebarSpacingMm: number  // 800 standard
  verticalRebarDiaMm: number      // 10 or 12
  /** Horizontal rebar (every Nth course) */
  includeHorizontalRebar: boolean
  horizontalRebarCourseInterval: number  // 3 = every 3rd course (600mm)
  horizontalRebarDiaMm: number    // 10
  /** Mortar mix ratio (cement:sand by volume) */
  mortarMixRatio: number  // 4 = 1:4 mix (1 part cement, 4 parts sand)
}

export interface CHBBlockGrid {
  col: number
  row: number
  x: number  // meters
  y: number  // meters
  w: number  // meters (block + mortar)
  h: number  // meters (block + mortar)
  isCut: boolean
  isExcluded: boolean
  /** Offset for running bond (half block on odd courses) */
  offsetX: number
}

export interface CHBEstimate {
  grossWallAreaSqm: number
  openingAreaSqm: number
  netWallAreaSqm: number
  /** Block module area including mortar */
  blockModuleAreaSqm: number
  rawBlockCount: number
  adjustedBlockCount: number
  roundedBlockCount: number
  /** Number of courses (horizontal rows) */
  courseCount: number
  /** Blocks per course */
  blocksPerCourse: number
  /** Mortar */
  totalMortarVolumeCuM: number
  horizontalJointVolumeCuM: number
  verticalJointVolumeCuM: number
  cementBags40kg: number
  sandVolumeCuM: number
  /** Rebar */
  verticalRebarCount: number
  verticalRebarLengthM: number
  horizontalRebarCount: number
  horizontalRebarLengthM: number
  totalRebarLengthM: number
  /** Grid for 3D rendering */
  blockGrid: CHBBlockGrid[]
  /** Vertical rebar X positions in meters */
  verticalRebarPositionsM: number[]
  /** Horizontal rebar Y positions in meters (course centerlines) */
  horizontalRebarPositionsM: number[]
  wastePercentApplied: number
  assumptions: string[]
}

// ─── PH CHB Presets ───────────────────────────────────────────────────────────

export const CHB_PRESETS: Record<CHBSize, { thicknessMm: number; label: string }> = {
  '4-inch': { thicknessMm: 100, label: '4" CHB (100mm)' },
  '6-inch': { thicknessMm: 150, label: '6" CHB (150mm)' },
  '8-inch': { thicknessMm: 200, label: '8" CHB (200mm)' },
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Mortar yield: approx 0.03 cu.m. per 40kg bag at 1:4 mix */
const MORTAR_YIELD_PER_BAG_CUM = 0.03

// ─── Computation ──────────────────────────────────────────────────────────────

export function computeCHBEstimate(inputs: CHBInputs): CHBEstimate {
  const wallLM = inputs.wallLengthMm / 1000
  const wallHM = inputs.wallHeightMm / 1000

  // Gross wall area
  const grossWallAreaSqm = (inputs.wallLengthMm * inputs.wallHeightMm) / 1_000_000

  // Opening area
  const openingAreaSqm = inputs.openings.reduce(
    (sum, o) => sum + (o.widthMm * o.heightMm) / 1_000_000, 0
  )

  // Net wall area
  const netWallAreaSqm = Math.max(0, grossWallAreaSqm - openingAreaSqm)

  // Block module area (block + mortar on two sides)
  const moduleW = (inputs.blockLengthMm + inputs.mortarJointMm) / 1000  // ~0.41m
  const moduleH = (inputs.blockHeightMm + inputs.mortarJointMm) / 1000  // ~0.21m
  const blockModuleAreaSqm = moduleW * moduleH

  // Course count and blocks per course
  const courseCount = Math.ceil(inputs.wallHeightMm / (inputs.blockHeightMm + inputs.mortarJointMm))
  const blocksPerCourse = Math.ceil(inputs.wallLengthMm / (inputs.blockLengthMm + inputs.mortarJointMm))

  // Raw block count from area
  const rawBlockCount = blockModuleAreaSqm > 0 ? netWallAreaSqm / blockModuleAreaSqm : 0

  // Adjusted with waste
  const adjustedBlockCount = rawBlockCount * (1 + inputs.wastePercent / 100)
  const roundedBlockCount = Math.ceil(adjustedBlockCount)

  // ─── Mortar Calculation ───────────────────────────────────────────────────

  // Horizontal joints: full wall length × mortar thickness × block thickness × (courses + 1)
  // There are (courseCount + 1) horizontal bed joints (top, bottom, between each course)
  const horizontalJointCount = courseCount + 1
  const horizontalJointVolumeCuM =
    (inputs.wallLengthMm * inputs.mortarJointMm * inputs.blockThicknessMm * horizontalJointCount) / 1_000_000_000

  // Vertical joints: mortar thickness × block height × block thickness × (blocksPerCourse) per course × courseCount
  const verticalJointsPerCourse = blocksPerCourse
  const verticalJointVolumeCuM =
    (inputs.mortarJointMm * inputs.blockHeightMm * inputs.blockThicknessMm * verticalJointsPerCourse * courseCount) / 1_000_000_000

  const totalMortarVolumeCuM = horizontalJointVolumeCuM + verticalJointVolumeCuM

  // Cement bags (at given mix ratio)
  // Cement portion = totalMortar / (1 + ratio), so for 1:4, cement = total / 5
  const cementVolumeCuM = totalMortarVolumeCuM / (1 + inputs.mortarMixRatio)
  const cementBags40kg = Math.ceil(cementVolumeCuM / MORTAR_YIELD_PER_BAG_CUM)

  // Sand volume
  const sandVolumeCuM = totalMortarVolumeCuM - cementVolumeCuM

  // ─── Rebar Calculation ────────────────────────────────────────────────────

  let verticalRebarCount = 0
  let verticalRebarLengthM = 0
  const verticalRebarPositionsM: number[] = []

  if (inputs.includeVerticalRebar && inputs.verticalRebarSpacingMm > 0) {
    // Vertical rebar at spacing intervals + at corners + at each side of openings
    const spacingM = inputs.verticalRebarSpacingMm / 1000
    // Regular spacing
    let x = 0
    while (x <= wallLM + 0.001) {
      verticalRebarPositionsM.push(x)
      x += spacingM
    }
    if (verticalRebarPositionsM.length > 0 && Math.abs(verticalRebarPositionsM[verticalRebarPositionsM.length - 1] - wallLM) > 0.01) {
      verticalRebarPositionsM.push(wallLM)
    }
    // Add rebar at each side of openings (if not already near a regular position)
    for (const opening of inputs.openings) {
      const leftM = opening.xOffsetMm / 1000
      const rightM = (opening.xOffsetMm + opening.widthMm) / 1000
      for (const pos of [leftM, rightM]) {
        if (!verticalRebarPositionsM.some(p => Math.abs(p - pos) < 0.05)) {
          verticalRebarPositionsM.push(pos)
        }
      }
    }
    verticalRebarPositionsM.sort((a, b) => a - b)
    verticalRebarCount = verticalRebarPositionsM.length
    verticalRebarLengthM = verticalRebarCount * wallHM
  }

  let horizontalRebarCount = 0
  let horizontalRebarLengthM = 0
  const horizontalRebarPositionsM: number[] = []

  if (inputs.includeHorizontalRebar && inputs.horizontalRebarCourseInterval > 0) {
    for (let course = inputs.horizontalRebarCourseInterval; course <= courseCount; course += inputs.horizontalRebarCourseInterval) {
      const yM = course * moduleH
      horizontalRebarPositionsM.push(yM)
    }
    horizontalRebarCount = horizontalRebarPositionsM.length
    horizontalRebarLengthM = horizontalRebarCount * wallLM
  }

  const totalRebarLengthM = verticalRebarLengthM + horizontalRebarLengthM

  // ─── Block Grid for 3D ────────────────────────────────────────────────────

  const blockGrid = generateCHBGrid(inputs)

  // ─── Assumptions ──────────────────────────────────────────────────────────

  const assumptions: string[] = [
    `CHB size: ${CHB_PRESETS[inputs.chbSize].label}`,
    `Block: ${inputs.blockLengthMm} × ${inputs.blockHeightMm} × ${inputs.blockThicknessMm}mm`,
    `Mortar joint: ${inputs.mortarJointMm}mm`,
    `Mortar mix: 1:${inputs.mortarMixRatio} (cement:sand)`,
    `Waste allowance: ${inputs.wastePercent}%`,
    `Coursing: running bond (half-block offset on alternate courses)`,
  ]
  if (inputs.includeVerticalRebar) {
    assumptions.push(`Vertical rebar: ${inputs.verticalRebarDiaMm}mm dia @ ${inputs.verticalRebarSpacingMm}mm c/c`)
  }
  if (inputs.includeHorizontalRebar) {
    assumptions.push(`Horizontal rebar: ${inputs.horizontalRebarDiaMm}mm dia every ${inputs.horizontalRebarCourseInterval} courses`)
  }

  return {
    grossWallAreaSqm,
    openingAreaSqm,
    netWallAreaSqm,
    blockModuleAreaSqm,
    rawBlockCount,
    adjustedBlockCount,
    roundedBlockCount,
    courseCount,
    blocksPerCourse,
    totalMortarVolumeCuM,
    horizontalJointVolumeCuM,
    verticalJointVolumeCuM,
    cementBags40kg,
    sandVolumeCuM,
    verticalRebarCount,
    verticalRebarLengthM,
    horizontalRebarCount,
    horizontalRebarLengthM,
    totalRebarLengthM,
    blockGrid,
    verticalRebarPositionsM,
    horizontalRebarPositionsM,
    wastePercentApplied: inputs.wastePercent,
    assumptions,
  }
}

export function generateCHBGrid(inputs: CHBInputs): CHBBlockGrid[] {
  const wallLM = inputs.wallLengthMm / 1000
  const wallHM = inputs.wallHeightMm / 1000
  const moduleW = (inputs.blockLengthMm + inputs.mortarJointMm) / 1000
  const moduleH = (inputs.blockHeightMm + inputs.mortarJointMm) / 1000

  if (moduleW <= 0 || moduleH <= 0 || wallLM <= 0 || wallHM <= 0) return []

  const cols = Math.ceil(wallLM / moduleW)
  const rows = Math.ceil(wallHM / moduleH)
  if (cols * rows > 5000) return []  // safety cap

  const cells: CHBBlockGrid[] = []

  const openingsM = inputs.openings.map(o => ({
    x: o.xOffsetMm / 1000,
    y: o.yOffsetMm / 1000,
    w: o.widthMm / 1000,
    h: o.heightMm / 1000,
  }))

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const baseX = c * moduleW
      const baseY = r * moduleH

      // Running bond: odd courses offset by half block
      const offsetX = r % 2 === 1 ? moduleW / 2 : 0
      const x = baseX + offsetX
      const y = baseY

      const isCut = x + moduleW > wallLM || y + moduleH > wallHM || x < 0

      // Check if block center is inside any opening
      const centerX = x + moduleW / 2
      const centerY = y + moduleH / 2
      const isExcluded = openingsM.some(
        o => centerX >= o.x && centerX <= o.x + o.w && centerY >= o.y && centerY <= o.y + o.h
      )

      cells.push({ col: c, row: r, x, y, w: moduleW, h: moduleH, isCut, isExcluded, offsetX })
    }
  }

  return cells
}
