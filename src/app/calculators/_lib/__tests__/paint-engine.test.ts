import { describe, test, expect } from 'bun:test'
import { computePaintEstimate } from '../paint-engine'
import type { PaintInputs } from '../paint-engine'

const BASE_INPUTS: PaintInputs = {
  inputMode: 'room',
  roomLengthMm: 4000,
  roomWidthMm: 3000,
  wallHeightMm: 2700,
  wallSegments: [],
  openings: [],
  includeCeiling: false,
  ceilingAreaOverrideSqm: null,
  substrateType: 'new-concrete',
  coatsTopcoat: 2,
  coatsPrimer: 1,
  topcoatCoverageSqmPerLiter: 12,
  primerCoverageSqmPerLiter: 10,
  wastePercent: 5,
  canSizesAvailable: [1, 4, 16],
  selectedColorHex: '#FFFFFF',
}

describe('computePaintEstimate', () => {
  test('computes gross wall area for room mode', () => {
    const result = computePaintEstimate(BASE_INPUTS)
    // 2(4+3) × 2.7 = 2 × 7 × 2.7 = 37.8
    expect(result.grossWallAreaSqm).toBeCloseTo(37.8, 1)
  })

  test('net wall area equals gross when no openings', () => {
    const result = computePaintEstimate(BASE_INPUTS)
    expect(result.netWallAreaSqm).toBeCloseTo(result.grossWallAreaSqm, 2)
  })

  test('deducts opening area', () => {
    const inputs: PaintInputs = {
      ...BASE_INPUTS,
      openings: [
        { id: 'door1', type: 'door', widthMm: 900, heightMm: 2100, wallId: 'wall-front', xOffsetMm: 500, yOffsetMm: 0 },
      ],
    }
    const result = computePaintEstimate(inputs)
    expect(result.openingAreaSqm).toBeCloseTo(1.89, 2)
    expect(result.netWallAreaSqm).toBeCloseTo(37.8 - 1.89, 1)
  })

  test('includes ceiling area when toggled', () => {
    const inputs = { ...BASE_INPUTS, includeCeiling: true }
    const result = computePaintEstimate(inputs)
    // Ceiling: 4 × 3 = 12
    expect(result.ceilingAreaSqm).toBeCloseTo(12.0, 1)
    expect(result.basePaintableAreaSqm).toBeCloseTo(37.8 + 12.0, 1)
  })

  test('uses ceiling area override when provided', () => {
    const inputs = { ...BASE_INPUTS, includeCeiling: true, ceilingAreaOverrideSqm: 15.5 }
    const result = computePaintEstimate(inputs)
    expect(result.ceilingAreaSqm).toBeCloseTo(15.5, 1)
  })

  test('computes topcoat liters with coats and waste', () => {
    const result = computePaintEstimate(BASE_INPUTS)
    // Base: 37.8, adjusted: 37.8 × 1.05 × 2 = 79.38, liters: 79.38 / 12 = 6.615
    expect(result.topcoatLiters).toBeCloseTo(6.615, 1)
  })

  test('computes primer liters when primer coats > 0', () => {
    const result = computePaintEstimate(BASE_INPUTS)
    expect(result.primerLiters).not.toBeNull()
    // Primer: 37.8 × 1 / 10 = 3.78
    expect(result.primerLiters).toBeCloseTo(3.78, 1)
  })

  test('returns null primer when 0 coats', () => {
    const inputs = { ...BASE_INPUTS, coatsPrimer: 0 }
    const result = computePaintEstimate(inputs)
    expect(result.primerLiters).toBeNull()
  })

  test('suggests can sizes', () => {
    const result = computePaintEstimate(BASE_INPUTS)
    expect(result.topcoatCanSuggestion.length).toBeGreaterThan(0)
    const totalLiters = result.topcoatCanSuggestion.reduce(
      (sum, c) => sum + c.sizeLiters * c.quantity, 0
    )
    expect(totalLiters).toBeGreaterThanOrEqual(result.topcoatLiters)
  })

  test('generates per-wall breakdown in room mode', () => {
    const result = computePaintEstimate(BASE_INPUTS)
    expect(result.wallAreas.length).toBe(4)
    expect(result.wallAreas[0].wallId).toBe('wall-front')
  })
})
