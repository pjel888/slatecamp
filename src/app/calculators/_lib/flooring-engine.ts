// src/app/calculators/_lib/flooring-engine.ts
// Pure flooring/tile estimation computation engine.
// No React, no state — pure functions that take inputs and return results.

// ─── Types ────────────────────────────────────────────────────────────────────

export type TilePattern = 'straight' | 'brick' | 'diagonal' | 'herringbone-lite'

export interface FlooringInputs {
  roomMode: 'rectangle' | 'polygon-simple'
  roomLengthMm: number
  roomWidthMm: number
  floorPolygonPoints: [number, number][]
  exclusions: Array<{
    id: string
    xMm: number
    yMm: number
    widthMm: number
    heightMm: number
  }>
  tileLengthMm: number
  tileWidthMm: number
  groutJointMm: number
  pattern: TilePattern
  wastePercent: number
  boxCoverageSqm: number | null
  orientationDeg: number
  includeSparePercent: number
}

export interface TileGridCell {
  col: number
  row: number
  /** World-space X position (meters) */
  x: number
  /** World-space Z position (meters) */
  z: number
  /** Width in meters (tile + grout) */
  w: number
  /** Depth in meters (tile + grout) */
  d: number
  /** Whether this tile is cut at an edge or exclusion */
  isCut: boolean
  /** Whether this tile is inside an exclusion (should not render) */
  isExcluded: boolean
  /** Offset for brick pattern (meters) */
  offsetX: number
}

export interface FlooringEstimate {
  grossAreaSqm: number
  exclusionAreaSqm: number
  netAreaSqm: number
  effectiveModuleAreaSqm: number
  rawTileCount: number
  adjustedTileCount: number
  roundedTileCount: number
  wastePercentApplied: number
  sparePercentApplied: number
  boxCoverageSqm: number | null
  boxesToBuy: number | null
  cutTileCountApprox: number
  tileGrid: TileGridCell[]
  assumptions: string[]
}

// ─── Pattern Waste Defaults ───────────────────────────────────────────────────

export const PATTERN_WASTE_DEFAULTS: Record<TilePattern, number> = {
  straight: 8,
  brick: 10,
  diagonal: 12,
  'herringbone-lite': 15,
}

// ─── Computation ──────────────────────────────────────────────────────────────

/** Shoelace formula for polygon area in sq mm */
function shoelaceArea(points: [number, number][]): number {
  let area = 0
  const n = points.length
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    area += points[i][0] * points[j][1]
    area -= points[j][0] * points[i][1]
  }
  return Math.abs(area) / 2
}

export function computeFlooringEstimate(inputs: FlooringInputs): FlooringEstimate {
  // Gross area
  let grossAreaSqm: number
  if (inputs.roomMode === 'rectangle') {
    grossAreaSqm = (inputs.roomLengthMm * inputs.roomWidthMm) / 1_000_000
  } else {
    grossAreaSqm = shoelaceArea(inputs.floorPolygonPoints) / 1_000_000
  }

  // Exclusion area
  const exclusionAreaSqm = inputs.exclusions.reduce(
    (sum, ex) => sum + (ex.widthMm * ex.heightMm) / 1_000_000,
    0,
  )

  // Net area
  const netAreaSqm = Math.max(0, grossAreaSqm - exclusionAreaSqm)

  // Effective tile module area (tile + grout on two sides)
  const effectiveModuleAreaSqm =
    ((inputs.tileLengthMm + inputs.groutJointMm) *
      (inputs.tileWidthMm + inputs.groutJointMm)) /
    1_000_000

  // Raw tile count
  const rawTileCount = effectiveModuleAreaSqm > 0 ? netAreaSqm / effectiveModuleAreaSqm : 0

  // Adjusted (waste + spare)
  const wasteFraction = inputs.wastePercent / 100
  const spareFraction = inputs.includeSparePercent / 100
  const adjustedTileCount = rawTileCount * (1 + wasteFraction + spareFraction)

  // Rounded (buy quantity)
  const roundedTileCount = Math.ceil(adjustedTileCount)

  // Boxes
  let boxesToBuy: number | null = null
  if (inputs.boxCoverageSqm != null && inputs.boxCoverageSqm > 0) {
    boxesToBuy = Math.ceil(
      (netAreaSqm * (1 + wasteFraction + spareFraction)) / inputs.boxCoverageSqm,
    )
  }

  // Generate tile grid for 3D scene
  const tileGrid = generateTileGrid(inputs)

  // Approximate cut tile count
  const cutTileCountApprox = tileGrid.filter((c) => c.isCut && !c.isExcluded).length

  // Assumptions
  const assumptions: string[] = [
    `Pattern: ${inputs.pattern.charAt(0).toUpperCase() + inputs.pattern.slice(1)}`,
    `Waste factor: ${inputs.wastePercent}% (${inputs.wastePercent === PATTERN_WASTE_DEFAULTS[inputs.pattern] ? 'pattern default' : 'user-adjusted'})`,
    `Grout joint: ${inputs.groutJointMm}mm`,
  ]
  if (inputs.includeSparePercent > 0) {
    assumptions.push(`Spare stock: ${inputs.includeSparePercent}%`)
  }
  if (inputs.boxCoverageSqm != null) {
    assumptions.push(`Box coverage: ${inputs.boxCoverageSqm} sq.m.`)
  }
  if (inputs.pattern === 'diagonal' || inputs.pattern === 'herringbone-lite') {
    assumptions.push(
      'Diagonal/herringbone preview is approximate; tiles rendered axis-aligned with adjusted waste %.',
    )
  }

  return {
    grossAreaSqm,
    exclusionAreaSqm,
    netAreaSqm,
    effectiveModuleAreaSqm,
    rawTileCount,
    adjustedTileCount,
    roundedTileCount,
    wastePercentApplied: inputs.wastePercent,
    sparePercentApplied: inputs.includeSparePercent,
    boxCoverageSqm: inputs.boxCoverageSqm,
    boxesToBuy,
    cutTileCountApprox,
    tileGrid,
    assumptions,
  }
}

/**
 * Generates tile grid cells for the 3D scene.
 * Called inside Zustand recompute(), NOT inside a React component or useFrame.
 */
export function generateTileGrid(inputs: FlooringInputs): TileGridCell[] {
  const roomLM = inputs.roomLengthMm / 1000
  const roomWM = inputs.roomWidthMm / 1000
  const moduleW = (inputs.tileLengthMm + inputs.groutJointMm) / 1000
  const moduleD = (inputs.tileWidthMm + inputs.groutJointMm) / 1000

  if (moduleW <= 0 || moduleD <= 0 || roomLM <= 0 || roomWM <= 0) return []

  const cols = Math.ceil(roomLM / moduleW)
  const rows = Math.ceil(roomWM / moduleD)
  // Safety cap for GPU
  if (cols * rows > 10_000) return []

  const cells: TileGridCell[] = []

  // Pre-convert exclusions to meters
  const exclusionsM = inputs.exclusions.map((ex) => ({
    x: ex.xMm / 1000,
    y: ex.yMm / 1000,
    w: ex.widthMm / 1000,
    h: ex.heightMm / 1000,
  }))

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const baseX = c * moduleW
      const baseZ = r * moduleD

      // Brick pattern offset
      let offsetX = 0
      if (inputs.pattern === 'brick' && r % 2 === 1) {
        offsetX = moduleW / 2
      }

      const x = baseX + offsetX
      const z = baseZ

      // Check if tile is cut (extends beyond room boundary)
      const isCut = x + moduleW > roomLM || z + moduleD > roomWM || x < 0

      // Check if tile center is inside any exclusion
      const tileCenterX = x + moduleW / 2
      const tileCenterZ = z + moduleD / 2
      const isExcluded = exclusionsM.some(
        (ex) =>
          tileCenterX >= ex.x &&
          tileCenterX <= ex.x + ex.w &&
          tileCenterZ >= ex.y &&
          tileCenterZ <= ex.y + ex.h,
      )

      cells.push({
        col: c,
        row: r,
        x,
        z,
        w: moduleW,
        d: moduleD,
        isCut,
        isExcluded,
        offsetX,
      })
    }
  }

  return cells
}
