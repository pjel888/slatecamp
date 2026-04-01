// src/lib/pd1096/__tests__/computationEngine.test.ts
import { describe, test, expect } from 'bun:test'
import { computeDevControls } from '../computationEngine'
import type { DevControlsInput } from '../types'

// ─── Helper to build default input ──────────────────────────────────────────

function makeInput(overrides: Partial<{
  lotWidth: number; lotDepth: number;
  zoneClass: string; firewallActive: boolean;
  footprintW: number; footprintD: number;
  storeys: number; floorHeight: number;
  rrowWidth: number;
}> = {}): DevControlsInput {
  return {
    lot: {
      width: overrides.lotWidth ?? 20,
      depth: overrides.lotDepth ?? 15,
      type: 'interior',
    },
    zoning: {
      zoneClass: (overrides.zoneClass ?? 'R-1') as any,
      firewallActive: overrides.firewallActive ?? false,
      firewallSides: [],
    },
    building: {
      proposedFootprintWidth: overrides.footprintW ?? 10,
      proposedFootprintDepth: overrides.footprintD ?? 10,
      proposedStoreys: overrides.storeys ?? 2,
      floorHeight: overrides.floorHeight ?? 3.0,
    },
    rrow: { width: overrides.rrowWidth ?? 10 },
  }
}

// ─── R-1 Canonical Case (300 sqm) ──────────────────────────────────────────

describe('R-1 300sqm Canonical Case', () => {
  const input = makeInput({ lotWidth: 20, lotDepth: 15, zoneClass: 'R-1', storeys: 2 })
  const result = computeDevControls(input)

  test('TLA = 300 sqm', () => {
    expect(result.tla).toBe(300)
  })

  test('setbacks: front=4.5, side=2.0, rear=2.0 (no increment for 2 storeys)', () => {
    expect(result.setbacks.effective.front).toBe(4.5)
    expect(result.setbacks.effective.left).toBe(2.0)
    expect(result.setbacks.effective.right).toBe(2.0)
    expect(result.setbacks.effective.rear).toBe(2.0)
    expect(result.setbacks.incremental).toBe(0)
  })

  test('buildable envelope = (20-2-2) × (15-4.5-2) = 16 × 8.5 = 136 sqm', () => {
    expect(result.buildableWidth).toBe(16)
    expect(result.buildableDepth).toBe(8.5)
    expect(result.ambfCandidates.bySetbacks).toBe(136)
  })

  test('R-1 PSO path N/A — setback always governs', () => {
    expect(result.ambfCandidates.bindingSource).toBe('setback')
    expect(result.ambf).toBe(136)
  })

  test('TOSL = TLA - AMBF = 164 sqm', () => {
    expect(result.tosl).toBe(164)
  })

  test('ISA = 30% × TLA = 90 sqm', () => {
    expect(result.isa).toBe(90)
  })

  test('USA = TLA - AMBF - ISA = 300 - 136 - 90 = 74 sqm', () => {
    expect(result.usa).toBe(74)
  })

  test('MACA = AMBF + ISA = 226 sqm', () => {
    expect(result.maca).toBe(226)
  })

  test('closure identity: TLA = AMBF + ISA + USA', () => {
    expect(result.closureIdentityValid).toBe(true)
    expect(Math.abs(result.tla - (result.ambf + result.isa + result.usa))).toBeLessThan(0.01)
  })

  test('overall compliant when proposed fits within AMBF', () => {
    // Proposed: 10×10=100 sqm footprint, which is < 136 AMBF
    expect(result.checks.find(c => c.id === 'ambf')?.compliant).toBe(true)
    expect(result.overallCompliant).toBe(true)
  })
})

// ─── R-2-basic with Firewall ────────────────────────────────────────────────

describe('R-2-basic with Firewall', () => {
  const input: DevControlsInput = {
    lot: { width: 8, depth: 20, type: 'interior' },
    zoning: {
      zoneClass: 'R-2-basic',
      firewallActive: true,
      firewallSides: ['left'],
    },
    building: {
      proposedFootprintWidth: 5,
      proposedFootprintDepth: 14,
      proposedStoreys: 3,
      floorHeight: 3.0,
    },
    rrow: { width: 8 },
  }
  const result = computeDevControls(input)

  test('TLA = 160 sqm', () => {
    expect(result.tla).toBe(160)
  })

  test('firewall zeroes left setback', () => {
    expect(result.setbacks.effective.left).toBe(0)
    expect(result.setbacks.effective.right).toBeGreaterThan(0)
  })

  test('PSO with firewall = 60% → AMBF_PSO = 96 sqm', () => {
    expect(result.psoAllowed).toBe(0.60)
    expect(result.ambfCandidates.byPSO).toBeCloseTo(96, 1)
  })

  test('no incremental setback (removed from base module)', () => {
    expect(result.setbacks.incremental).toBe(0)
  })

  test('closure identity holds', () => {
    expect(result.closureIdentityValid).toBe(true)
  })
})

// ─── Com-1 Commercial ───────────────────────────────────────────────────────

describe('Com-1 Commercial', () => {
  const input = makeInput({
    lotWidth: 30, lotDepth: 40, zoneClass: 'Com-1',
    footprintW: 18, footprintD: 30, storeys: 4, rrowWidth: 15,
  })
  const result = computeDevControls(input)

  test('TLA = 1200 sqm', () => {
    expect(result.tla).toBe(1200)
  })

  test('commercial setback from RROW 15m: front=5, side=3, rear=3', () => {
    expect(result.setbacks.base.front).toBe(5)
    expect(result.setbacks.base.left).toBe(3)
    expect(result.setbacks.incremental).toBe(0) // incremental removed
  })

  test('PSO no firewall = 65% → AMBF_PSO = 780 sqm', () => {
    expect(result.ambfCandidates.byPSO).toBeCloseTo(780, 1)
  })

  test('BHL: min(zoning 5 storeys, RROW 15 storeys) = 5', () => {
    expect(result.bhlStoreys).toBe(5)
    expect(result.bhlSource).toBe('zoning')
  })

  test('closure identity holds', () => {
    expect(result.closureIdentityValid).toBe(true)
  })

  test('FLAR midpoint for Com-1 = (1.70+3.00)/2 = 2.35', () => {
    expect(result.flar).toBeCloseTo(2.35, 2)
  })
})

// ─── Narrow Lot Violation ───────────────────────────────────────────────────

describe('Narrow Lot Violation', () => {
  const input = makeInput({
    lotWidth: 6, lotDepth: 10, zoneClass: 'R-1',
    footprintW: 5, footprintD: 8, storeys: 2,
  })
  const result = computeDevControls(input)

  test('narrow lot: buildable width = max(0, 6-2-2) = 2m', () => {
    expect(result.buildableWidth).toBe(2)
  })

  test('AMBF is small: 2 × 3.5 = 7 sqm', () => {
    expect(result.ambfCandidates.bySetbacks).toBe(7)
    expect(result.ambf).toBe(7)
  })

  test('proposed 5×8=40 sqm exceeds AMBF=7 → violation', () => {
    const ambfCheck = result.checks.find(c => c.id === 'ambf')
    expect(ambfCheck?.compliant).toBe(false)
    expect(ambfCheck?.excess).toBeGreaterThan(0)
  })

  test('overall not compliant', () => {
    expect(result.overallCompliant).toBe(false)
  })

  test('closure identity still holds even with violation', () => {
    expect(result.closureIdentityValid).toBe(true)
  })
})

// ─── Floor Height Violation ─────────────────────────────────────────────────

describe('Floor Height Violation', () => {
  const input = makeInput({ floorHeight: 2.4 })
  const result = computeDevControls(input)

  test('floor height 2.4m < 2.7m → violation', () => {
    const check = result.checks.find(c => c.id === 'floorHeight')
    expect(check?.compliant).toBe(false)
    expect(check?.shortfall).toBeCloseTo(0.3, 2)
  })
})

// ─── BHL Storey Violation ───────────────────────────────────────────────────

describe('BHL Violation', () => {
  const input = makeInput({
    zoneClass: 'R-1', storeys: 5, rrowWidth: 6,
  })
  const result = computeDevControls(input)

  test('R-1 BHL = 3 storeys, RROW<8 BHL = 3 → proposed 5 exceeds', () => {
    expect(result.bhlStoreys).toBe(3)
    const bhlCheck = result.checks.find(c => c.id === 'bhl')
    expect(bhlCheck?.compliant).toBe(false)
    expect(bhlCheck?.excess).toBe(2)
  })
})

// ─── Incremental Setback Cap at 14 Storeys ──────────────────────────────────

describe('Incremental Setback Removed', () => {
  const input = makeInput({
    zoneClass: 'Com-3', storeys: 20, rrowWidth: 30,
    lotWidth: 100, lotDepth: 100,
  })
  const result = computeDevControls(input)

  test('no incremental setback regardless of storey count', () => {
    expect(result.setbacks.incremental).toBe(0)
    // Effective equals base — no height-dependent adjustment
    expect(result.setbacks.effective.left).toBe(result.setbacks.base.left)
    expect(result.setbacks.effective.rear).toBe(result.setbacks.base.rear)
  })
})

// ─── All 15 Zones Produce Valid Results ─────────────────────────────────────

describe('All zones compute without error', () => {
  const zones = [
    'R-1', 'R-2-basic', 'R-2-max', 'R-3-basic', 'R-3-max',
    'R-4', 'R-5', 'Com-1', 'Com-2', 'Com-3',
    'Ind-1', 'Ind-2', 'Ind-3', 'Institutional', 'Cultural',
  ] as const

  for (const zone of zones) {
    test(`${zone} computes with valid closure identity`, () => {
      const input = makeInput({
        lotWidth: 30, lotDepth: 30, zoneClass: zone,
        footprintW: 10, footprintD: 10, storeys: 2, rrowWidth: 12,
      })
      const result = computeDevControls(input)
      expect(result.closureIdentityValid).toBe(true)
      expect(result.tla).toBe(900)
      expect(result.ambf).toBeGreaterThan(0)
      expect(result.tosl).toBeGreaterThanOrEqual(0)
      expect(result.isa).toBeGreaterThanOrEqual(0)
      expect(result.usa).toBeGreaterThanOrEqual(0)
      expect(Math.abs(result.tla - (result.ambf + result.isa + result.usa))).toBeLessThan(0.01)
    })
  }
})

// ─── TGFA Violation ─────────────────────────────────────────────────────────

describe('TGFA Violation', () => {
  // R-1 with FLAR=1.50, TLA=300, GFA=450, TGFA=675
  // Proposed: 15×15 footprint × 4 floors = 900 sqm > 675
  const input = makeInput({
    lotWidth: 20, lotDepth: 15, zoneClass: 'R-1',
    footprintW: 15, footprintD: 15, storeys: 4,
  })
  const result = computeDevControls(input)

  test('proposed GFA exceeds TGFA limit → violation', () => {
    const check = result.checks.find(c => c.id === 'tgfa')
    expect(check?.compliant).toBe(false)
  })
})

// ─── Polygon Lot (lot.area override) ────────────────────────────────────────

describe('Polygon Lot with area override', () => {
  test('uses lot.area for TLA instead of width×depth', () => {
    const input = makeInput({ lotWidth: 20, lotDepth: 15 })
    // Override area to 500 sqm (different from 20×15=300)
    input.lot.area = 500
    const result = computeDevControls(input)
    expect(result.tla).toBe(500)
  })

  test('closure identity holds with polygon area', () => {
    const input = makeInput({ lotWidth: 25, lotDepth: 20 })
    input.lot.area = 400 // irregular lot area
    const result = computeDevControls(input)
    expect(result.closureIdentityValid).toBe(true)
    expect(Math.abs(result.tla - (result.ambf + result.isa + result.usa))).toBeLessThan(0.01)
  })

  test('polygon vertices trigger polygon inset for AMBF', () => {
    const input = makeInput({ lotWidth: 20, lotDepth: 15 })
    input.lot.area = 300
    input.lot.polygonVertices = [
      { x: 0, z: 0 }, { x: 20, z: 0 }, { x: 20, z: 15 }, { x: 0, z: 15 },
    ]
    const result = computeDevControls(input)
    // Should use polygon inset area (same as rectangular for a rectangle)
    expect(result.tla).toBe(300)
    expect(result.ambf).toBeGreaterThan(0)
    expect(result.closureIdentityValid).toBe(true)
  })

  test('FLAR override works with polygon lots', () => {
    const input = makeInput({ lotWidth: 30, lotDepth: 30, zoneClass: 'Com-1' })
    input.lot.area = 900
    input.flarOverride = 5.0
    const result = computeDevControls(input)
    expect(result.flar).toBe(5.0)
    expect(result.gfa).toBe(4500) // 900 × 5.0
  })
})
