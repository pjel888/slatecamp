// src/app/dashboard/3d-lab/_utils/nbcpCalculator.test.ts
import { describe, test, expect } from 'bun:test'
import { calculateEnvelope, type NBCPInputs } from './nbcpCalculator'
import { ZoningClass, LotType } from '../_constants/nbcp'

const NO_FIREWALLS = { front: false, rear: false, left: false, right: false }

// ── Scenario A: R-3 inside lot, 50m×80m (4000sqm), RROW=15m ─────────────────
// Hand-calc:
//   TLA = 4000 sqm
//   BHL: zoning=12, rrow(15m)=15 → effective=12 storeys
//   Base setbacks (Table VIII.3, RROW=15m): front=5, side=3, rear=3
//   Incremental: (12-2)=10 storeys, 10×0.30=3.0m
//   Setbacks: front=8.0, left=6.0, right=6.0, rear=6.0
//   Buildable: W=50-6-6=38m, D=80-8-6=66m
//   AMBF by setbacks: 38×66 = 2508 sqm
//   AMBF by PSO: 4000×0.70 = 2800 sqm
//   AMBF = min(2508, 2800) = 2508 sqm ← setbacks more stringent
//   maxGFA = 4000×5.0 = 20000 sqm
//   effectiveStoreys = min(12, floor(20000/2508)) = min(12, 7) = 7 storeys
//   Wait — floor(20000/2508) = floor(7.97) = 7 — FLAR limits to 7!
//   effectiveHeight = 7×3.0 = 21m (using default 3.0m floor height)

describe('Scenario A — R3 inside lot 50x80m RROW=15m', () => {
  const inputs: NBCPInputs = {
    lotWidth: 50, lotDepth: 80,
    zoningClass: ZoningClass.R3,
    lotType: LotType.INSIDE,
    rrowWidth: 15,
    floorHeight: 3.0,
    firewalls: NO_FIREWALLS,
  }
  const result = calculateEnvelope(inputs)

  test('TLA = 4000', () => expect(result.tla).toBe(4000))
  test('BHL effective = 12 (zoning-limited)', () => {
    expect(result.bhl_effective).toBe(12)
    expect(result.bhl_source).toBe('zoning')
  })
  test('Incremental setback = 3.0m', () => expect(result.incrementalSetback).toBe(3.0))
  test('Front setback = 8.0m', () => expect(result.setbacks.front).toBe(8.0))
  test('Side setbacks = 6.0m each', () => {
    expect(result.setbacks.left).toBe(6.0)
    expect(result.setbacks.right).toBe(6.0)
  })
  test('AMBF by setbacks = 2508', () => expect(result.ambf_by_setbacks).toBe(38 * 66))
  test('AMBF by PSO = 2800', () => expect(result.ambf_by_pso).toBe(2800))
  test('AMBF = 2508 (setbacks more stringent)', () => expect(result.ambf).toBe(38 * 66))
  test('maxGFA = 20000', () => expect(result.maxGFA).toBe(20000))
  test('FLAR limits to 7 storeys (violation present)', () => {
    expect(result.effectiveStoreys).toBe(7)
    expect(result.violations.some(v => v.field === 'flar')).toBe(true)
  })
})

// ── Scenario B: R-1 corner lot, 15m×20m (300sqm), RROW=8m ───────────────────
// Hand-calc:
//   TLA = 300 sqm
//   BHL: zoning=3, rrow(8m)=5 → effective=3 (zoning more stringent)
//   Base setbacks (Table VIII.2, RROW=8m<10, 3 storeys): front=4.5, side=2.0, rear=2.0
//   Incremental: (3-2)=1 storey × 0.30 = 0.30m
//   CORNER lot: left side uses front setback
//   Setbacks: front=4.8, rear=2.3, left=4.8 (CORNER→front), right=2.3
//   Buildable: W=15-4.8-2.3=7.9m, D=20-4.8-2.3=12.9m
//   AMBF by setbacks: 7.9×12.9 = 101.91 sqm
//   PSO for corner lot = 0.80 (R-1 has same PSO for inside and corner)
//   AMBF by PSO: 300×0.80 = 240 sqm
//   AMBF = min(101.91, 240) = 101.91 sqm ← setbacks more stringent
//   maxGFA = 300×1.20 = 360 sqm
//   effectiveStoreys = min(3, floor(360/101.91)) = min(3, 3) = 3 storeys

describe('Scenario B — R1 corner lot 15x20m RROW=8m', () => {
  const inputs: NBCPInputs = {
    lotWidth: 15, lotDepth: 20,
    zoningClass: ZoningClass.R1,
    lotType: LotType.CORNER,
    rrowWidth: 8,
    floorHeight: 3.0,
    firewalls: NO_FIREWALLS,
  }
  const result = calculateEnvelope(inputs)

  test('TLA = 300', () => expect(result.tla).toBe(300))
  test('BHL effective = 3 (zoning-limited)', () => {
    expect(result.bhl_effective).toBe(3)
    expect(result.bhl_source).toBe('zoning')
  })
  test('PSO = 0.80 (R-1 corner same as inside)', () => expect(result.pso).toBe(0.80))
  test('Front setback = 4.8m (4.5 + 0.3 incremental)', () => {
    expect(result.setbacks.front).toBeCloseTo(4.8, 5)
  })
  test('Left setback = 4.8m (CORNER uses front setback on secondary road side)', () => {
    expect(result.setbacks.left).toBeCloseTo(4.8, 5)
  })
  test('No violations', () => expect(result.violations).toHaveLength(0))
  test('effectiveStoreys = 3', () => expect(result.effectiveStoreys).toBe(3))
})

// ── Scenario C: R-2 Max, inside lot, RROW=10m, firewall rear+left ─────────────
// Hand-calc:
//   TLA = 12×25 = 300 sqm
//   BHL: zoning=5, rrow(10m)=5 → effective=5
//   Base setbacks (Table VIII.3, RROW=10m): front=5.0, side=2.0, rear=2.0
//   Incremental: (5-2)=3 storeys × 0.30 = 0.90m
//   Raw: front=5.9, rear=2.9, left=2.9, right=2.9
//   Firewalls: rear→0, left→0 (R-2 allows rear+sides)
//   Setbacks: front=5.9, rear=0, left=0, right=2.9
//   Buildable: W=12-0-2.9=9.1m, D=25-5.9-0=19.1m
//   AMBF by setbacks: 9.1×19.1 = 173.81 sqm
//   PSO (inside) = 0.80; AMBF by PSO = 300×0.80 = 240
//   AMBF = min(173.81, 240) = 173.81 sqm
//   maxGFA = 300×3.00 = 900 sqm
//   effectiveStoreys = min(5, floor(900/173.81)) = min(5, 5) = 5

describe('Scenario C — R2 Max inside 12x25m RROW=10m, rear+left firewalls', () => {
  const inputs: NBCPInputs = {
    lotWidth: 12, lotDepth: 25,
    zoningClass: ZoningClass.R2_MAX,
    lotType: LotType.INSIDE,
    rrowWidth: 10,
    floorHeight: 3.0,
    firewalls: { front: false, rear: true, left: true, right: false },
  }
  const result = calculateEnvelope(inputs)

  test('Rear setback = 0 (firewall)', () => expect(result.setbacks.rear).toBe(0))
  test('Left setback = 0 (firewall)', () => expect(result.setbacks.left).toBe(0))
  test('Right setback = 2.9m (2.0 + 0.9 incremental)', () => {
    expect(result.setbacks.right).toBeCloseTo(2.9, 5)
  })
  test('AMBF uses setbacks (more stringent than PSO)', () => {
    expect(result.ambf).toBeLessThan(result.ambf_by_pso)
  })
  test('effectiveStoreys = 5 (no FLAR violation)', () => {
    expect(result.effectiveStoreys).toBe(5)
    expect(result.violations).toHaveLength(0)
  })
})

// ── RROW Effect (key teaching moment): R-3, RROW=8m → BHL drops to 5 ─────────
describe('RROW Effect — R3 RROW=8m caps BHL at 5 storeys', () => {
  const inputs: NBCPInputs = {
    lotWidth: 20, lotDepth: 40,
    zoningClass: ZoningClass.R3,
    lotType: LotType.INSIDE,
    rrowWidth: 8,
    floorHeight: 3.0,
    firewalls: NO_FIREWALLS,
  }
  const result = calculateEnvelope(inputs)

  test('bhl_effective = 5 despite R-3 allowing 12', () => {
    expect(result.bhl_effective).toBe(5)
    expect(result.bhl_source).toBe('rrow')
    expect(result.bhl_zoning).toBe(12)
  })
})

// ── Firewall sanitization: R-1 firewalls always disabled ──────────────────────
describe('Firewall sanitization — R1 cannot have firewalls', () => {
  const inputs: NBCPInputs = {
    lotWidth: 12, lotDepth: 25,
    zoningClass: ZoningClass.R1,
    lotType: LotType.INSIDE,
    rrowWidth: 8,
    floorHeight: 3.0,
    firewalls: { front: true, rear: true, left: true, right: true }, // all requested
  }
  const result = calculateEnvelope(inputs)

  test('No setback is zero despite all firewalls requested', () => {
    expect(result.setbacks.front).toBeGreaterThan(0)
    expect(result.setbacks.rear).toBeGreaterThan(0)
    expect(result.setbacks.left).toBeGreaterThan(0)
    expect(result.setbacks.right).toBeGreaterThan(0)
  })
})

// ── Through lot: rear uses front setback ──────────────────────────────────────
describe('Through lot — rear setback equals front setback', () => {
  const inputs: NBCPInputs = {
    lotWidth: 20, lotDepth: 40,
    zoningClass: ZoningClass.R2_MAX,
    lotType: LotType.THROUGH,
    rrowWidth: 10,
    floorHeight: 3.0,
    firewalls: NO_FIREWALLS,
  }
  const result = calculateEnvelope(inputs)
  test('rear setback equals front setback (both RROW-based)', () => {
    expect(result.setbacks.rear).toBe(result.setbacks.front)
  })
  test('left and right are standard side setbacks (not RROW front)', () => {
    expect(result.setbacks.left).toBeLessThan(result.setbacks.front)
  })
})

// ── End lot: right uses front setback (secondary road-end, canonical) ──────────
describe('End lot — right setback equals front setback', () => {
  const inputs: NBCPInputs = {
    lotWidth: 20, lotDepth: 40,
    zoningClass: ZoningClass.R2_MAX,
    lotType: LotType.END,
    rrowWidth: 10,
    floorHeight: 3.0,
    firewalls: NO_FIREWALLS,
  }
  const result = calculateEnvelope(inputs)
  test('right setback equals front setback (secondary road-end side)', () => {
    expect(result.setbacks.right).toBe(result.setbacks.front)
  })
  test('left uses standard side setback (not secondary front)', () => {
    expect(result.setbacks.left).toBeLessThan(result.setbacks.front)
  })
})

// ── FLAR zero-storey clamp ─────────────────────────────────────────────────────
describe('FLAR zero-storey clamp — maxGFA < ambf', () => {
  test('when ambf=0, effectiveStoreys is still at least 1 (zero-storey clamp)', () => {
    const inputs: NBCPInputs = {
      lotWidth: 5, lotDepth: 5,
      zoningClass: ZoningClass.R3,
      lotType: LotType.INSIDE,
      rrowWidth: 15,
      floorHeight: 3.0,
      firewalls: NO_FIREWALLS,
    }
    const result = calculateEnvelope(inputs)
    expect(result.ambf).toBe(0)
    expect(result.effectiveStoreys).toBeGreaterThanOrEqual(1)
    expect(result.violations.some(v => v.message.includes('too small') || v.message.includes('FLAR too restrictive'))).toBe(true)
  })
})

// ── Edge: lot too small for setbacks ──────────────────────────────────────────
describe('Edge — lot too small for setbacks', () => {
  const inputs: NBCPInputs = {
    lotWidth: 5, lotDepth: 5,
    zoningClass: ZoningClass.R3,
    lotType: LotType.INSIDE,
    rrowWidth: 15,
    floorHeight: 3.0,
    firewalls: NO_FIREWALLS,
  }
  const result = calculateEnvelope(inputs)

  test('ambf = 0', () => expect(result.ambf).toBe(0))
  test('violation field = ambf', () => {
    expect(result.violations.some(v => v.field === 'ambf')).toBe(true)
  })
  test('effectiveStoreys still ≥ 1 (render guard)', () => {
    expect(result.effectiveStoreys).toBeGreaterThanOrEqual(1)
  })
})
