import { describe, test, expect } from 'bun:test'
import { computeDrywallEstimate, computeStudPositions, computeBoardPlacements } from '../drywall-engine'
import type { DrywallInputs } from '../drywall-engine'

const BASE_INPUTS: DrywallInputs = {
  wallLengthMm: 4000,
  wallHeightMm: 2700,
  openings: [],
  studSpacingMm: 600,
  boardLengthMm: 2440,
  boardWidthMm: 1220,
  boardLayersPerSide: 1,
  sidesBoarded: 'two-side',
  boardOrientation: 'vertical',
  wastePercent: 10,
  includeCornerStudAllowance: true,
  cornerStudExtraCount: 2,
  includeOpeningFramingAllowance: true,
  extraStudsPerOpening: 3,
  trackStockLengthMm: 3000,
}

describe('computeDrywallEstimate', () => {
  test('computes gross wall area', () => {
    const result = computeDrywallEstimate(BASE_INPUTS)
    // 4 × 2.7 = 10.8
    expect(result.grossWallAreaSqm).toBeCloseTo(10.8, 1)
  })

  test('deducts opening area', () => {
    const inputs: DrywallInputs = {
      ...BASE_INPUTS,
      openings: [{ id: 'd1', type: 'door', widthMm: 900, heightMm: 2100, xOffsetMm: 500, yOffsetMm: 0 }],
    }
    const result = computeDrywallEstimate(inputs)
    expect(result.openingAreaSqm).toBeCloseTo(1.89, 2)
    expect(result.netWallAreaSqm).toBeCloseTo(10.8 - 1.89, 1)
  })

  test('doubles boarded area for two-side', () => {
    const result = computeDrywallEstimate(BASE_INPUTS)
    expect(result.boardedFaceCount).toBe(2)
    expect(result.totalBoardedAreaSqm).toBeCloseTo(result.netWallAreaSqm * 2, 1)
  })

  test('single side when one-side', () => {
    const inputs = { ...BASE_INPUTS, sidesBoarded: 'one-side' as const }
    const result = computeDrywallEstimate(inputs)
    expect(result.boardedFaceCount).toBe(1)
    expect(result.totalBoardedAreaSqm).toBeCloseTo(result.netWallAreaSqm, 1)
  })

  test('computes base stud count', () => {
    const result = computeDrywallEstimate(BASE_INPUTS)
    // ceil(4000 / 600) + 1 = 7 + 1 = 8
    expect(result.baseStudCount).toBe(8)
  })

  test('adds corner allowance', () => {
    const result = computeDrywallEstimate(BASE_INPUTS)
    expect(result.cornerAllowanceCount).toBe(2)
    expect(result.finalStudCount).toBe(result.baseStudCount + 2)
  })

  test('adds opening framing studs', () => {
    const inputs: DrywallInputs = {
      ...BASE_INPUTS,
      openings: [{ id: 'd1', type: 'door', widthMm: 900, heightMm: 2100, xOffsetMm: 500, yOffsetMm: 0 }],
    }
    const result = computeDrywallEstimate(inputs)
    expect(result.openingExtraStudCount).toBe(3) // 1 opening × 3 extra
  })

  test('computes track pieces to buy', () => {
    const result = computeDrywallEstimate(BASE_INPUTS)
    // Top: 4000, Bottom: 4000, Total: 8000, Headers: 0 → 8000 / 3000 = 2.67 → 3
    expect(result.trackPiecesToBuy).toBe(3)
  })

  test('header track includes 140mm stud overlap per opening', () => {
    const inputs: DrywallInputs = {
      ...BASE_INPUTS,
      openings: [{ id: 'd1', type: 'door', widthMm: 900, heightMm: 2100, xOffsetMm: 500, yOffsetMm: 0 }],
    }
    const result = computeDrywallEstimate(inputs)
    // 900 + 140 = 1040
    expect(result.headerTrackLengthMm).toBe(1040)
  })

  test('rounds up board count', () => {
    const result = computeDrywallEstimate(BASE_INPUTS)
    expect(result.roundedBoardCount).toBe(Math.ceil(result.adjustedBoardCount))
    expect(Number.isInteger(result.roundedBoardCount)).toBe(true)
  })

  test('applies waste percent', () => {
    const result = computeDrywallEstimate(BASE_INPUTS)
    expect(result.adjustedBoardCount).toBeCloseTo(result.rawBoardCount * 1.1, 1)
  })
})

describe('computeStudPositions', () => {
  test('returns positions at correct spacing', () => {
    const positions = computeStudPositions(BASE_INPUTS)
    expect(positions[0]).toBe(0)
    expect(positions[1]).toBeCloseTo(0.6, 2)
    expect(positions[positions.length - 1]).toBeCloseTo(4.0, 1)
  })

  test('returns empty for zero spacing', () => {
    expect(computeStudPositions({ ...BASE_INPUTS, studSpacingMm: 0 })).toEqual([])
  })
})

describe('computeBoardPlacements', () => {
  test('generates placements for both faces', () => {
    const placements = computeBoardPlacements(BASE_INPUTS)
    const frontPlacements = placements.filter(p => p.face === 'front')
    const backPlacements = placements.filter(p => p.face === 'back')
    expect(frontPlacements.length).toBeGreaterThan(0)
    expect(backPlacements.length).toBeGreaterThan(0)
  })

  test('marks edge boards as cut', () => {
    const placements = computeBoardPlacements(BASE_INPUTS)
    const cutBoards = placements.filter(p => p.isCut)
    expect(cutBoards.length).toBeGreaterThan(0)
  })
})
