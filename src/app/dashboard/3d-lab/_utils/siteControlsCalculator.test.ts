// src/app/dashboard/3d-lab/_utils/siteControlsCalculator.test.ts
//
// Validation tests for PD 1096 Site Controls calculator.
// Uses CORRECTED formulas with ISA/USA redistribution within TOSL
// to maintain the governing identity: AMBF + ISA + USA = TLA.

import { describe, test, expect } from 'bun:test'
import { calculateSiteControls, type SiteControlInputs } from './siteControlsCalculator'
import { ZoningClass } from '../_constants/nbcp'

// -- Helper -------------------------------------------------------------------

function calc(overrides: Partial<SiteControlInputs> = {}) {
  return calculateSiteControls({
    lotWidth: 15,
    lotDepth: 20,
    zoningClass: ZoningClass.R1,
    rrowWidth: 10,
    numFloors: 2,
    floorHeight: 3.0,
    ...overrides,
  })
}

// -- 300 sqm R-1 Reference Case -----------------------------------------------

describe('300 sqm R-1 Lot (Fact-Check validation)', () => {
  const result = calc()

  test('TLA = 300 sqm (15m x 20m)', () => {
    expect(result.tla).toBe(300)
  })

  test('Setbacks: front 4.5m, sides 2.0m, rear 2.0m', () => {
    expect(result.setbacks.front).toBe(4.5)
    expect(result.setbacks.left).toBe(2.0)
    expect(result.setbacks.right).toBe(2.0)
    expect(result.setbacks.rear).toBe(2.0)
  })

  test('Buildable width = 11.0m', () => {
    expect(result.buildableWidth).toBe(11)
  })

  test('Buildable depth = 13.5m', () => {
    expect(result.buildableDepth).toBe(13.5)
  })

  test('AMBF by setbacks = 148.5 sqm', () => {
    expect(result.ambf_by_setbacks).toBe(148.5)
  })

  test('AMBF by PSO = 150.0 sqm (50% x 300, NOT 60%)', () => {
    expect(result.ambf_by_pso).toBe(150)
  })

  test('Effective AMBF = 148.5 sqm (setback-limited)', () => {
    expect(result.ambf).toBe(148.5)
  })

  test('PSO = 0.495 (a RATIO, not an area)', () => {
    expect(result.pso).toBeCloseTo(0.495, 3)
  })

  test('TOSL = 151.5 sqm', () => {
    expect(result.tosl).toBeCloseTo(151.5, 1)
  })

  // ISA/USA are redistributed within TOSL to maintain identity
  // ISA = 151.5 * (0.30/0.50) = 90.9 sqm
  // USA = 151.5 * (0.20/0.50) = 60.6 sqm
  test('ISA = 90.9 sqm (redistributed within TOSL)', () => {
    expect(result.isa).toBeCloseTo(90.9, 1)
  })

  test('USA = 60.6 sqm (redistributed within TOSL)', () => {
    expect(result.usa).toBeCloseTo(60.6, 1)
  })

  test('MACA = 239.4 sqm (AMBF + ISA, NOT a multiplier)', () => {
    expect(result.maca).toBeCloseTo(239.4, 1)
  })

  test('Governing identity: AMBF + ISA + USA = TLA', () => {
    expect(result.ambf + result.isa + result.usa).toBeCloseTo(result.tla, 2)
    expect(result.compliance.identityOk).toBe(true)
  })

  test('AMBF + TOSL = TLA', () => {
    expect(result.ambf + result.tosl).toBeCloseTo(result.tla, 2)
  })

  test('All compliance checks pass', () => {
    expect(result.compliance.ambfOk).toBe(true)
    expect(result.compliance.toslOk).toBe(true)
    expect(result.compliance.setbacksOk).toBe(true)
    expect(result.compliance.identityOk).toBe(true)
    expect(result.violations).toHaveLength(0)
  })

  test('Table reference values exposed for UI', () => {
    expect(result.lotCoverageMax).toBe(0.50)
    expect(result.isaPercent).toBe(0.30)
    expect(result.usaPercent).toBe(0.20)
  })
})

// -- PSO-Limited Case (Wide Lot) ----------------------------------------------

describe('PSO-limited AMBF (wide lot, zoning cap binds)', () => {
  // 50x50m R-1: TLA = 2500 sqm
  // Setback-limited = 46 x 43.5 = 2001 sqm
  // Zoning-capped = 2500 x 0.50 = 1250 sqm
  // AMBF = 1250 (zoning binds, NOT setbacks)
  const result = calc({ lotWidth: 50, lotDepth: 50 })

  test('AMBF is PSO-limited (1250 < 2001)', () => {
    expect(result.ambf).toBe(1250)
    expect(result.ambf_by_pso).toBe(1250)
    expect(result.ambf_by_setbacks).toBeGreaterThan(1250)
  })

  test('PSO = 0.50 (exactly at zoning cap)', () => {
    expect(result.pso).toBeCloseTo(0.50, 2)
  })

  // When zoning-capped, TOSL = (1-0.50) x TLA = 1250
  // ISA = 1250 x 0.6 = 750, USA = 1250 x 0.4 = 500
  test('Identity holds: AMBF + ISA + USA = TLA', () => {
    expect(result.ambf + result.isa + result.usa).toBeCloseTo(result.tla, 2)
  })

  test('ISA = 750, USA = 500 (redistributed)', () => {
    expect(result.isa).toBeCloseTo(750, 1)
    expect(result.usa).toBeCloseTo(500, 1)
  })
})

// -- Tiny Lot (Edge Case) -----------------------------------------------------

describe('Tiny lot (6m x 6m) - negative buildable depth', () => {
  const result = calc({ lotWidth: 6, lotDepth: 6 })

  test('TLA = 36 sqm', () => {
    expect(result.tla).toBe(36)
  })

  test('Buildable depth clamped to 0 (6 - 4.5 - 2.0 = -0.5)', () => {
    expect(result.buildableDepth).toBe(0)
  })

  test('AMBF = 0 (no buildable area)', () => {
    expect(result.ambf).toBe(0)
  })

  test('Setbacks violation reported', () => {
    expect(result.compliance.setbacksOk).toBe(false)
    expect(result.violations.some(v => v.field === 'ambf')).toBe(true)
  })

  test('Identity holds: 0 + ISA + USA = 36', () => {
    expect(result.ambf + result.isa + result.usa).toBeCloseTo(36, 2)
    expect(result.compliance.identityOk).toBe(true)
  })

  test('All open space goes to TOSL', () => {
    expect(result.tosl).toBeCloseTo(36, 1)
  })
})

// -- Narrow Lot ---------------------------------------------------------------

describe('Narrow lot (3m wide) - zero buildable width', () => {
  const result = calc({ lotWidth: 3, lotDepth: 20 })

  test('Buildable width = 0 (3 - 2 - 2 < 0, clamped)', () => {
    expect(result.buildableWidth).toBe(0)
  })

  test('AMBF = 0', () => {
    expect(result.ambf).toBe(0)
  })

  test('Identity still holds', () => {
    expect(result.compliance.identityOk).toBe(true)
  })
})

// -- Commercial Zoning --------------------------------------------------------

describe('Commercial setbacks (RROW-dependent)', () => {
  const result = calc({
    lotWidth: 20,
    lotDepth: 30,
    zoningClass: ZoningClass.C1,
    rrowWidth: 25,
  })

  test('Front setback = 6.0m', () => {
    expect(result.setbacks.front).toBe(6.0)
  })

  test('C-1 maxPSO = 80%', () => {
    expect(result.zoningData.maxPSO).toBe(0.80)
  })
})

// -- Formula Integrity Across Zoning Classes ----------------------------------

describe('Formula integrity across zoning classes', () => {
  const classes = [
    ZoningClass.R1,
    ZoningClass.R2_BASIC,
    ZoningClass.R3,
    ZoningClass.C1,
    ZoningClass.C2,
    ZoningClass.I1,
  ]

  for (const zc of classes) {
    test(`${zc}: AMBF + ISA + USA = TLA (governing identity)`, () => {
      const r = calc({ zoningClass: zc, lotWidth: 20, lotDepth: 30, rrowWidth: 12 })
      expect(r.ambf + r.isa + r.usa).toBeCloseTo(r.tla, 2)
    })

    test(`${zc}: AMBF + TOSL = TLA`, () => {
      const r = calc({ zoningClass: zc, lotWidth: 20, lotDepth: 30, rrowWidth: 12 })
      expect(r.ambf + r.tosl).toBeCloseTo(r.tla, 2)
    })

    test(`${zc}: MACA = AMBF + ISA (not a multiplier)`, () => {
      const r = calc({ zoningClass: zc, lotWidth: 20, lotDepth: 30, rrowWidth: 12 })
      expect(r.maca).toBeCloseTo(r.ambf + r.isa, 2)
    })

    test(`${zc}: PSO = AMBF / TLA (ratio)`, () => {
      const r = calc({ zoningClass: zc, lotWidth: 20, lotDepth: 30, rrowWidth: 12 })
      if (r.tla > 0) {
        expect(r.pso).toBeCloseTo(r.ambf / r.tla, 4)
      }
    })

    test(`${zc}: ISA + USA = TOSL (redistributed)`, () => {
      const r = calc({ zoningClass: zc, lotWidth: 20, lotDepth: 30, rrowWidth: 12 })
      expect(r.isa + r.usa).toBeCloseTo(r.tosl, 2)
    })

    test(`${zc}: identityOk = true`, () => {
      const r = calc({ zoningClass: zc, lotWidth: 20, lotDepth: 30, rrowWidth: 12 })
      expect(r.compliance.identityOk).toBe(true)
    })
  }
})

// -- Floor Height Violation ---------------------------------------------------

describe('Floor height violation', () => {
  const result = calc({ floorHeight: 2.4 })

  test('floorHeightOk = false when below 2.7m', () => {
    expect(result.compliance.floorHeightOk).toBe(false)
  })

  test('Warning violation reported', () => {
    expect(result.violations.some(v => v.field === 'floorHeight' && v.severity === 'warning')).toBe(true)
  })
})
