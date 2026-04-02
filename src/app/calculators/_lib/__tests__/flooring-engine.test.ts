import { describe, test, expect } from 'bun:test'
import { computeFlooringEstimate, generateTileGrid, PATTERN_WASTE_DEFAULTS } from '../flooring-engine'
import type { FlooringInputs } from '../flooring-engine'

const BASE_INPUTS: FlooringInputs = {
  roomMode: 'rectangle',
  roomLengthMm: 4000,
  roomWidthMm: 3000,
  floorPolygonPoints: [],
  exclusions: [],
  tileLengthMm: 600,
  tileWidthMm: 600,
  groutJointMm: 3,
  pattern: 'straight',
  wastePercent: 8,
  boxCoverageSqm: 4.0,
  orientationDeg: 0,
  includeSparePercent: 0,
}

describe('computeFlooringEstimate', () => {
  test('computes correct gross area for rectangle room', () => {
    const result = computeFlooringEstimate(BASE_INPUTS)
    expect(result.grossAreaSqm).toBeCloseTo(12.0, 2)
  })

  test('net area equals gross when no exclusions', () => {
    const result = computeFlooringEstimate(BASE_INPUTS)
    expect(result.netAreaSqm).toBeCloseTo(result.grossAreaSqm, 2)
    expect(result.exclusionAreaSqm).toBe(0)
  })

  test('deducts exclusion area correctly', () => {
    const inputs = {
      ...BASE_INPUTS,
      exclusions: [{ id: 'col1', xMm: 1000, yMm: 1000, widthMm: 500, heightMm: 500 }],
    }
    const result = computeFlooringEstimate(inputs)
    expect(result.exclusionAreaSqm).toBeCloseTo(0.25, 2)
    expect(result.netAreaSqm).toBeCloseTo(11.75, 2)
  })

  test('computes effective module area with grout', () => {
    const result = computeFlooringEstimate(BASE_INPUTS)
    // (600 + 3) × (600 + 3) / 1,000,000 = 603 × 603 / 1M = 0.363609
    expect(result.effectiveModuleAreaSqm).toBeCloseTo(0.363609, 4)
  })

  test('applies waste percent correctly', () => {
    const result = computeFlooringEstimate(BASE_INPUTS)
    expect(result.wastePercentApplied).toBe(8)
    expect(result.adjustedTileCount).toBeCloseTo(result.rawTileCount * 1.08, 1)
  })

  test('rounds up to whole tiles for buy quantity', () => {
    const result = computeFlooringEstimate(BASE_INPUTS)
    expect(result.roundedTileCount).toBe(Math.ceil(result.adjustedTileCount))
    expect(Number.isInteger(result.roundedTileCount)).toBe(true)
  })

  test('computes boxes to buy when box coverage provided', () => {
    const result = computeFlooringEstimate(BASE_INPUTS)
    expect(result.boxesToBuy).not.toBeNull()
    expect(result.boxesToBuy).toBeGreaterThan(0)
    expect(Number.isInteger(result.boxesToBuy!)).toBe(true)
  })

  test('returns null boxes when no box coverage', () => {
    const inputs = { ...BASE_INPUTS, boxCoverageSqm: null }
    const result = computeFlooringEstimate(inputs)
    expect(result.boxesToBuy).toBeNull()
  })

  test('applies spare percent when provided', () => {
    const inputs = { ...BASE_INPUTS, includeSparePercent: 5 }
    const result = computeFlooringEstimate(inputs)
    expect(result.sparePercentApplied).toBe(5)
    expect(result.adjustedTileCount).toBeCloseTo(result.rawTileCount * 1.13, 1) // 8% waste + 5% spare
  })

  test('generates assumptions list', () => {
    const result = computeFlooringEstimate(BASE_INPUTS)
    expect(result.assumptions.length).toBeGreaterThan(0)
    expect(result.assumptions.some(a => a.includes('Straight'))).toBe(true)
  })
})

describe('generateTileGrid', () => {
  test('generates correct number of cells', () => {
    const grid = generateTileGrid(BASE_INPUTS)
    // 4000mm / 603mm ≈ 6.6 → 7 cols, 3000mm / 603mm ≈ 5.0 → 5 rows = 35
    expect(grid.length).toBe(35)
  })

  test('marks edge tiles as cut', () => {
    const grid = generateTileGrid(BASE_INPUTS)
    const cutTiles = grid.filter(c => c.isCut)
    expect(cutTiles.length).toBeGreaterThan(0)
  })

  test('returns empty grid for zero dimensions', () => {
    const inputs = { ...BASE_INPUTS, roomLengthMm: 0 }
    expect(generateTileGrid(inputs)).toEqual([])
  })

  test('caps grid at 10000 cells', () => {
    const inputs = { ...BASE_INPUTS, roomLengthMm: 100000, roomWidthMm: 100000, tileLengthMm: 50, tileWidthMm: 50 }
    expect(generateTileGrid(inputs)).toEqual([])
  })

  test('applies brick pattern offset on odd rows', () => {
    const inputs = { ...BASE_INPUTS, pattern: 'brick' as const }
    const grid = generateTileGrid(inputs)
    const oddRowCells = grid.filter(c => c.row % 2 === 1)
    expect(oddRowCells.every(c => c.offsetX > 0)).toBe(true)
  })
})

describe('PATTERN_WASTE_DEFAULTS', () => {
  test('has defaults for all patterns', () => {
    expect(PATTERN_WASTE_DEFAULTS.straight).toBe(8)
    expect(PATTERN_WASTE_DEFAULTS.brick).toBe(10)
    expect(PATTERN_WASTE_DEFAULTS.diagonal).toBe(12)
    expect(PATTERN_WASTE_DEFAULTS['herringbone-lite']).toBe(15)
  })
})
