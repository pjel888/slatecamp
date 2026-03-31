// src/app/dashboard/3d-lab/_utils/siteControlsCalculator.test.ts
// Validation tests for the Site Controls calculator.
// Primary test case: 300 sqm R-1 lot per Fact-Check corrected values.

import { describe, test, expect } from 'bun:test'
import { calculateSiteControls, type SiteControlInputs } from './siteControlsCalculator'
import { ZoningClass } from '../_constants/nbcp'

// ─── Helper ──────────────────────────────────────────────────────────────────

function calc(overrides: Partial<SiteControlInputs> = {}) {
  return calculateSiteControls({
    lotWidth: 15,
    lotDepth: 20,
    zoningClass: ZoningClass.R1,
    rrowWidth: 10,
    buildingHeight: 6,
    ...overrides,
  })
}

// ─── 300 sqm R-1 Reference Case (Fact-Check Document) ───────────────────────

describe('300 sqm R-1 Lot (Fact-Check validation)', () => {
  const result = calc()

  test('TLA = 300 sqm (15m × 20m)', () => {
    expect(result.tla).toBe(300)
  })

  test('Setbacks: front 4.5m, sides 2.0m, rear 2.0m (Table VIII.2, RROW ≥ 10m)', () => {
    expect(result.setbacks.front).toBe(4.5)
    expect(result.setbacks.left).toBe(2.0)
    expect(result.setbacks.right).toBe(2.0)
    expect(result.setbacks.rear).toBe(2.0)
  })

  test('Buildable width = 11.0m (15 − 2 − 2)', () => {
    expect(result.buildableWidth).toBe(11)
  })

  test('Buildable depth = 13.5m (20 − 4.5 − 2)', () => {
    expect(result.buildableDepth).toBe(13.5)
  })

  test('AMBF by setbacks = 148.5 sqm (11.0 × 13.5)', () => {
    expect(result.ambf_by_setbacks).toBe(148.5)
  })

  test('AMBF by PSO = 150.0 sqm (50% × 300) — NOT 60%', () => {
    expect(result.ambf_by_pso).toBe(150)
  })

  test('Effective AMBF = 148.5 sqm — setback-limited (min of 148.5, 150)', () => {
    expect(result.ambf).toBe(148.5)
  })

  test('PSO = 0.495 — a RATIO, not an area', () => {
    expect(result.pso).toBeCloseTo(0.495, 3)
  })

  test('TOSL = 151.5 sqm (300 − 148.5)', () => {
    expect(result.tosl).toBeCloseTo(151.5, 1)
  })

  test('ISA = 90.0 sqm (30% × 300) — direct % of TLA, not fraction of TOSL', () => {
    expect(result.isa).toBe(90)
  })

  test('USA = 60.0 sqm (20% × 300) — direct % of TLA, not fraction of TOSL', () => {
    expect(result.usa).toBe(60)
  })

  test('MACA = 238.5 sqm (AMBF + ISA) — NOT AMBF × multiplier', () => {
    expect(result.maca).toBe(238.5)
  })

  test('Governing IRR identity: AMBF + TOSL = TLA', () => {
    expect(result.ambf + result.tosl).toBeCloseTo(result.tla, 2)
    expect(result.compliance.identityOk).toBe(true)
  })

  test('All compliance checks pass', () => {
    expect(result.compliance.ambfOk).toBe(true)
    expect(result.compliance.toslOk).toBe(true)
    expect(result.compliance.setbacksOk).toBe(true)
    expect(result.compliance.identityOk).toBe(true)
    expect(result.violations).toHaveLength(0)
  })
})

// ─── PSO-Limited Case ────────────────────────────────────────────────────────
// When the setback-bounded area exceeds the zoning PSO cap, AMBF is PSO-limited.

describe('PSO-limited AMBF (large lot, tight PSO)', () => {
  // 30×40m R-1 lot: TLA = 1200 sqm
  // Setbacks: front 4.5, sides 2.0, rear 2.0 → buildable 26×33.5 = 871 sqm
  // PSO cap: 50% × 1200 = 600 sqm
  // AMBF should be 600 (PSO-limited, not setback-limited)
  const result = calc({ lotWidth: 30, lotDepth: 40 })

  test('AMBF is PSO-limited (600 < 871)', () => {
    expect(result.ambf).toBe(600)
    expect(result.ambf_by_pso).toBe(600)
    expect(result.ambf_by_setbacks).toBeGreaterThan(600)
  })

  test('PSO = 0.50 (exactly at the zoning cap)', () => {
    expect(result.pso).toBeCloseTo(0.50, 2)
  })
})

// ─── Narrow Lot — Zero Buildable Area ────────────────────────────────────────

describe('Narrow lot violation (setbacks consume entire lot)', () => {
  // 3m wide lot with 2m side setbacks = 0m buildable width
  const result = calc({ lotWidth: 3, lotDepth: 20 })

  test('Buildable width is 0', () => {
    expect(result.buildableWidth).toBe(0)
  })

  test('AMBF is 0', () => {
    expect(result.ambf).toBe(0)
  })

  test('Setbacks violation is reported', () => {
    expect(result.compliance.setbacksOk).toBe(false)
    expect(result.violations.some(v => v.field === 'ambf')).toBe(true)
  })

  test('Identity still holds (0 + TLA = TLA)', () => {
    expect(result.compliance.identityOk).toBe(true)
  })
})

// ─── Commercial (RROW-Dependent Setbacks) ────────────────────────────────────

describe('Commercial setbacks are RROW-dependent (Table VIII.3)', () => {
  // C-1, RROW 25m → front 6.0, side 3.0, rear 3.0 (per Table VIII.3)
  const result = calc({
    lotWidth: 20,
    lotDepth: 30,
    zoningClass: ZoningClass.C1,
    rrowWidth: 25,
  })

  test('Front setback = 6.0m (RROW 25m band)', () => {
    expect(result.setbacks.front).toBe(6.0)
  })

  test('Side setbacks = 3.0m', () => {
    expect(result.setbacks.left).toBe(3.0)
    expect(result.setbacks.right).toBe(3.0)
  })

  test('C-1 maxPSO = 80%', () => {
    expect(result.zoningData.maxPSO).toBe(0.80)
  })
})

// ─── Formula Integrity Checks ────────────────────────────────────────────────

describe('Formula integrity across multiple zoning classes', () => {
  const classes = [
    ZoningClass.R1,
    ZoningClass.R2_BASIC,
    ZoningClass.R3,
    ZoningClass.C1,
    ZoningClass.C2,
    ZoningClass.I1,
  ]

  for (const zc of classes) {
    test(`${zc}: AMBF + TOSL = TLA`, () => {
      const r = calc({ zoningClass: zc, lotWidth: 20, lotDepth: 30, rrowWidth: 12 })
      expect(r.ambf + r.tosl).toBeCloseTo(r.tla, 2)
    })

    test(`${zc}: MACA = AMBF + ISA`, () => {
      const r = calc({ zoningClass: zc, lotWidth: 20, lotDepth: 30, rrowWidth: 12 })
      expect(r.maca).toBeCloseTo(r.ambf + r.isa, 2)
    })

    test(`${zc}: PSO = AMBF / TLA (ratio)`, () => {
      const r = calc({ zoningClass: zc, lotWidth: 20, lotDepth: 30, rrowWidth: 12 })
      if (r.tla > 0) {
        expect(r.pso).toBeCloseTo(r.ambf / r.tla, 4)
      }
    })

    test(`${zc}: ISA = maxISA × TLA (direct from table, not TOSL fraction)`, () => {
      const r = calc({ zoningClass: zc, lotWidth: 20, lotDepth: 30, rrowWidth: 12 })
      expect(r.isa).toBeCloseTo(r.zoningData.maxISA * r.tla, 2)
    })

    test(`${zc}: USA = minUSA × TLA (direct from table, not TOSL fraction)`, () => {
      const r = calc({ zoningClass: zc, lotWidth: 20, lotDepth: 30, rrowWidth: 12 })
      expect(r.usa).toBeCloseTo(r.zoningData.minUSA * r.tla, 2)
    })
  }
})
