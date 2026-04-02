import { describe, test, expect } from 'bun:test'
import { computeCHBEstimate, generateCHBGrid, CHB_PRESETS } from '../chb-engine'
import type { CHBInputs } from '../chb-engine'

const BASE_INPUTS: CHBInputs = {
  wallLengthMm: 4000,
  wallHeightMm: 2700,
  openings: [],
  blockLengthMm: 400,
  blockHeightMm: 200,
  blockThicknessMm: 150,
  chbSize: '6-inch',
  mortarJointMm: 10,
  wastePercent: 5,
  includeVerticalRebar: true,
  verticalRebarSpacingMm: 800,
  verticalRebarDiaMm: 10,
  includeHorizontalRebar: true,
  horizontalRebarCourseInterval: 3,
  horizontalRebarDiaMm: 10,
  mortarMixRatio: 4,
}

describe('computeCHBEstimate', () => {
  test('computes correct gross wall area', () => {
    const result = computeCHBEstimate(BASE_INPUTS)
    // 4000mm × 2700mm = 10.8 sq.m.
    expect(result.grossWallAreaSqm).toBeCloseTo(10.8, 2)
  })

  test('net area equals gross when no openings', () => {
    const result = computeCHBEstimate(BASE_INPUTS)
    expect(result.netWallAreaSqm).toBeCloseTo(result.grossWallAreaSqm, 2)
    expect(result.openingAreaSqm).toBe(0)
  })

  test('deducts opening area correctly', () => {
    const inputs: CHBInputs = {
      ...BASE_INPUTS,
      openings: [{ id: 'door1', type: 'door', widthMm: 900, heightMm: 2100, xOffsetMm: 500, yOffsetMm: 0 }],
    }
    const result = computeCHBEstimate(inputs)
    // 900 × 2100 = 1,890,000 sq.mm = 1.89 sq.m.
    expect(result.openingAreaSqm).toBeCloseTo(1.89, 2)
    expect(result.netWallAreaSqm).toBeCloseTo(10.8 - 1.89, 2)
  })

  test('deducts multiple openings', () => {
    const inputs: CHBInputs = {
      ...BASE_INPUTS,
      openings: [
        { id: 'door1', type: 'door', widthMm: 900, heightMm: 2100, xOffsetMm: 500, yOffsetMm: 0 },
        { id: 'win1', type: 'window', widthMm: 1200, heightMm: 1000, xOffsetMm: 2000, yOffsetMm: 900 },
      ],
    }
    const result = computeCHBEstimate(inputs)
    // 1.89 + 1.2 = 3.09
    expect(result.openingAreaSqm).toBeCloseTo(3.09, 2)
  })

  test('computes block module area with mortar', () => {
    const result = computeCHBEstimate(BASE_INPUTS)
    // (400 + 10) × (200 + 10) / 1,000,000 = 410 × 210 / 1M = 0.0861
    expect(result.blockModuleAreaSqm).toBeCloseTo(0.0861, 4)
  })

  test('computes course count for 2700mm wall', () => {
    const result = computeCHBEstimate(BASE_INPUTS)
    // 2700 / (200 + 10) = 2700 / 210 = 12.857 → ceil = 13
    expect(result.courseCount).toBe(13)
  })

  test('computes blocks per course for 4000mm wall', () => {
    const result = computeCHBEstimate(BASE_INPUTS)
    // 4000 / (400 + 10) = 4000 / 410 = 9.756 → ceil = 10
    expect(result.blocksPerCourse).toBe(10)
  })

  test('applies waste percent correctly', () => {
    const result = computeCHBEstimate(BASE_INPUTS)
    expect(result.wastePercentApplied).toBe(5)
    expect(result.adjustedBlockCount).toBeCloseTo(result.rawBlockCount * 1.05, 1)
  })

  test('rounds up block count to whole number', () => {
    const result = computeCHBEstimate(BASE_INPUTS)
    expect(result.roundedBlockCount).toBe(Math.ceil(result.adjustedBlockCount))
    expect(Number.isInteger(result.roundedBlockCount)).toBe(true)
  })

  test('computes mortar volume (horizontal + vertical)', () => {
    const result = computeCHBEstimate(BASE_INPUTS)
    expect(result.totalMortarVolumeCuM).toBeCloseTo(
      result.horizontalJointVolumeCuM + result.verticalJointVolumeCuM, 6
    )
    expect(result.totalMortarVolumeCuM).toBeGreaterThan(0)
  })

  test('computes horizontal joint volume', () => {
    const result = computeCHBEstimate(BASE_INPUTS)
    // wallLength × mortarJoint × blockThickness × (courseCount + 1) / 1e9
    // 4000 × 10 × 150 × 14 / 1e9 = 84,000,000 / 1e9 = 0.084
    expect(result.horizontalJointVolumeCuM).toBeCloseTo(0.084, 3)
  })

  test('computes vertical joint volume', () => {
    const result = computeCHBEstimate(BASE_INPUTS)
    // mortarJoint × blockHeight × blockThickness × blocksPerCourse × courseCount / 1e9
    // 10 × 200 × 150 × 10 × 13 / 1e9 = 39,000,000 / 1e9 = 0.039
    expect(result.verticalJointVolumeCuM).toBeCloseTo(0.039, 3)
  })

  test('cement bags rounded up correctly', () => {
    const result = computeCHBEstimate(BASE_INPUTS)
    expect(Number.isInteger(result.cementBags40kg)).toBe(true)
    expect(result.cementBags40kg).toBeGreaterThan(0)
    // Cement volume = total / (1 + 4) = total / 5
    const expectedCementVol = result.totalMortarVolumeCuM / 5
    const expectedBags = Math.ceil(expectedCementVol / 0.03)
    expect(result.cementBags40kg).toBe(expectedBags)
  })

  test('sand volume is remainder after cement', () => {
    const result = computeCHBEstimate(BASE_INPUTS)
    const cementVol = result.totalMortarVolumeCuM / (1 + BASE_INPUTS.mortarMixRatio)
    expect(result.sandVolumeCuM).toBeCloseTo(result.totalMortarVolumeCuM - cementVol, 6)
    expect(result.sandVolumeCuM).toBeGreaterThan(0)
  })

  test('net wall area cannot be negative', () => {
    const inputs: CHBInputs = {
      ...BASE_INPUTS,
      openings: [{ id: 'huge', type: 'door', widthMm: 10000, heightMm: 10000, xOffsetMm: 0, yOffsetMm: 0 }],
    }
    const result = computeCHBEstimate(inputs)
    expect(result.netWallAreaSqm).toBe(0)
  })

  test('generates assumptions list', () => {
    const result = computeCHBEstimate(BASE_INPUTS)
    expect(result.assumptions.length).toBeGreaterThan(0)
    expect(result.assumptions.some(a => a.includes('6" CHB'))).toBe(true)
    expect(result.assumptions.some(a => a.includes('running bond'))).toBe(true)
  })

  test('includes rebar assumptions when enabled', () => {
    const result = computeCHBEstimate(BASE_INPUTS)
    expect(result.assumptions.some(a => a.includes('Vertical rebar'))).toBe(true)
    expect(result.assumptions.some(a => a.includes('Horizontal rebar'))).toBe(true)
  })

  test('excludes rebar assumptions when disabled', () => {
    const inputs: CHBInputs = {
      ...BASE_INPUTS,
      includeVerticalRebar: false,
      includeHorizontalRebar: false,
    }
    const result = computeCHBEstimate(inputs)
    expect(result.assumptions.some(a => a.includes('Vertical rebar'))).toBe(false)
    expect(result.assumptions.some(a => a.includes('Horizontal rebar'))).toBe(false)
  })
})

describe('vertical rebar', () => {
  test('computes vertical rebar at regular spacing', () => {
    const result = computeCHBEstimate(BASE_INPUTS)
    // Wall 4m, spacing 0.8m: positions at 0, 0.8, 1.6, 2.4, 3.2, 4.0 = 6 rebars
    expect(result.verticalRebarCount).toBe(6)
    expect(result.verticalRebarPositionsM.length).toBe(6)
    const expected = [0, 0.8, 1.6, 2.4, 3.2, 4.0]
    result.verticalRebarPositionsM.forEach((v, i) => expect(v).toBeCloseTo(expected[i], 4))
  })

  test('computes vertical rebar total length', () => {
    const result = computeCHBEstimate(BASE_INPUTS)
    // 6 rebars × 2.7m wall height = 16.2m
    expect(result.verticalRebarLengthM).toBeCloseTo(16.2, 1)
  })

  test('adds rebar at opening sides', () => {
    const inputs: CHBInputs = {
      ...BASE_INPUTS,
      openings: [{ id: 'win1', type: 'window', widthMm: 1200, heightMm: 1000, xOffsetMm: 1100, yOffsetMm: 900 }],
    }
    const result = computeCHBEstimate(inputs)
    // Opening at x=1100mm (1.1m) to x=2300mm (2.3m)
    // Regular positions: 0, 0.8, 1.6, 2.4, 3.2, 4.0
    // 1.1m is not within 0.05m of any regular pos, so add it
    // 2.3m is not within 0.05m of any regular pos, so add it
    expect(result.verticalRebarPositionsM).toContain(1.1)
    expect(result.verticalRebarPositionsM).toContain(2.3)
    expect(result.verticalRebarCount).toBe(8) // 6 regular + 2 opening sides
  })

  test('does not duplicate rebar near existing position', () => {
    const inputs: CHBInputs = {
      ...BASE_INPUTS,
      openings: [{ id: 'win1', type: 'window', widthMm: 1200, heightMm: 1000, xOffsetMm: 800, yOffsetMm: 900 }],
    }
    const result = computeCHBEstimate(inputs)
    // Opening left edge at 0.8m matches regular rebar position exactly
    // Opening right edge at 2.0m is not near any regular (1.6, 2.4 are > 0.05 away)
    expect(result.verticalRebarPositionsM.filter(p => Math.abs(p - 0.8) < 0.001).length).toBe(1)
  })

  test('no rebar when disabled', () => {
    const inputs: CHBInputs = { ...BASE_INPUTS, includeVerticalRebar: false }
    const result = computeCHBEstimate(inputs)
    expect(result.verticalRebarCount).toBe(0)
    expect(result.verticalRebarLengthM).toBe(0)
    expect(result.verticalRebarPositionsM).toEqual([])
  })
})

describe('horizontal rebar', () => {
  test('computes horizontal rebar at course intervals', () => {
    const result = computeCHBEstimate(BASE_INPUTS)
    // courseCount = 13, interval = 3
    // Courses with rebar: 3, 6, 9, 12 = 4 rebars
    expect(result.horizontalRebarCount).toBe(4)
  })

  test('computes horizontal rebar positions as Y in meters', () => {
    const result = computeCHBEstimate(BASE_INPUTS)
    const moduleH = (200 + 10) / 1000 // 0.21m
    expect(result.horizontalRebarPositionsM[0]).toBeCloseTo(3 * moduleH, 4)
    expect(result.horizontalRebarPositionsM[1]).toBeCloseTo(6 * moduleH, 4)
  })

  test('computes horizontal rebar total length', () => {
    const result = computeCHBEstimate(BASE_INPUTS)
    // 4 rebars × 4.0m wall length = 16.0m
    expect(result.horizontalRebarLengthM).toBeCloseTo(16.0, 1)
  })

  test('no rebar when disabled', () => {
    const inputs: CHBInputs = { ...BASE_INPUTS, includeHorizontalRebar: false }
    const result = computeCHBEstimate(inputs)
    expect(result.horizontalRebarCount).toBe(0)
    expect(result.horizontalRebarLengthM).toBe(0)
    expect(result.horizontalRebarPositionsM).toEqual([])
  })

  test('total rebar length sums vertical and horizontal', () => {
    const result = computeCHBEstimate(BASE_INPUTS)
    expect(result.totalRebarLengthM).toBeCloseTo(
      result.verticalRebarLengthM + result.horizontalRebarLengthM, 4
    )
  })
})

describe('generateCHBGrid', () => {
  test('generates correct number of cells', () => {
    const grid = generateCHBGrid(BASE_INPUTS)
    // cols = ceil(4000/410) = 10, rows = ceil(2700/210) = 13 → 130
    expect(grid.length).toBe(130)
  })

  test('applies running bond offset on odd rows', () => {
    const grid = generateCHBGrid(BASE_INPUTS)
    const oddRowCells = grid.filter(c => c.row % 2 === 1)
    const evenRowCells = grid.filter(c => c.row % 2 === 0)
    expect(oddRowCells.every(c => c.offsetX > 0)).toBe(true)
    expect(evenRowCells.every(c => c.offsetX === 0)).toBe(true)
  })

  test('offset is half module width', () => {
    const grid = generateCHBGrid(BASE_INPUTS)
    const moduleW = (400 + 10) / 1000 // 0.41m
    const oddCell = grid.find(c => c.row === 1)!
    expect(oddCell.offsetX).toBeCloseTo(moduleW / 2, 4)
  })

  test('marks edge blocks as cut', () => {
    const grid = generateCHBGrid(BASE_INPUTS)
    const cutBlocks = grid.filter(c => c.isCut)
    expect(cutBlocks.length).toBeGreaterThan(0)
  })

  test('excludes blocks inside openings', () => {
    const inputs: CHBInputs = {
      ...BASE_INPUTS,
      openings: [{ id: 'door1', type: 'door', widthMm: 900, heightMm: 2100, xOffsetMm: 500, yOffsetMm: 0 }],
    }
    const grid = generateCHBGrid(inputs)
    const excludedBlocks = grid.filter(c => c.isExcluded)
    expect(excludedBlocks.length).toBeGreaterThan(0)
  })

  test('returns empty grid for zero dimensions', () => {
    const inputs: CHBInputs = { ...BASE_INPUTS, wallLengthMm: 0 }
    expect(generateCHBGrid(inputs)).toEqual([])
  })

  test('returns empty grid for zero block size', () => {
    const inputs: CHBInputs = { ...BASE_INPUTS, blockLengthMm: 0, mortarJointMm: 0 }
    expect(generateCHBGrid(inputs)).toEqual([])
  })

  test('caps grid at 5000 cells', () => {
    const inputs: CHBInputs = {
      ...BASE_INPUTS,
      wallLengthMm: 100000,
      wallHeightMm: 100000,
      blockLengthMm: 50,
      blockHeightMm: 50,
    }
    expect(generateCHBGrid(inputs)).toEqual([])
  })

  test('cell coordinates are in meters', () => {
    const grid = generateCHBGrid(BASE_INPUTS)
    const first = grid[0]
    expect(first.x).toBe(0)
    expect(first.y).toBe(0)
    expect(first.w).toBeCloseTo(0.41, 2)
    expect(first.h).toBeCloseTo(0.21, 2)
  })
})

describe('CHB_PRESETS', () => {
  test('has correct thickness for all sizes', () => {
    expect(CHB_PRESETS['4-inch'].thicknessMm).toBe(100)
    expect(CHB_PRESETS['6-inch'].thicknessMm).toBe(150)
    expect(CHB_PRESETS['8-inch'].thicknessMm).toBe(200)
  })

  test('has labels for all sizes', () => {
    expect(CHB_PRESETS['4-inch'].label).toContain('4"')
    expect(CHB_PRESETS['6-inch'].label).toContain('6"')
    expect(CHB_PRESETS['8-inch'].label).toContain('8"')
  })
})
