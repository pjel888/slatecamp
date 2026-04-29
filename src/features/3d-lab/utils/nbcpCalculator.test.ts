// src/app/dashboard/3d-lab/_utils/nbcpCalculator.test.ts
import { describe, test, expect } from 'bun:test'
import { calculateEnvelope, type NBCPInputs } from './nbcpCalculator'
import { ZoningClass, LotType } from '../constants/nbcp'

const NO_FIREWALLS = { front: false, rear: false, left: false, right: false }

// ── Scenario A: R-3 inside lot, 50m×80m (4000sqm), RROW=15m ─────────────────
// Flat base setbacks (SETBACK_TABLE_GENERAL, 15m ≥ 15 → 15–20 band):
//   front=5.0, side=3.0, rear=3.0
// setbacks: front=5.0, rear=3.0, left=3.0, right=3.0
// Buildable: W=50-3-3=44m, D=80-5-3=72m
// AMBF by setbacks: 44×72 = 3168 sqm
// AMBF by PSO: 4000×0.70 = 2800 sqm
// AMBF = min(3168, 2800) = 2800 sqm ← PSO-limited
// maxGFA = 4000×5.0 = 20000 sqm
// effectiveStoreys = min(12, floor(20000/2800)) = min(12, 7) = 7 storeys

describe('Scenario A — R3 inside lot 50x80m RROW=15m', () => {
  const inputs: NBCPInputs = {
    lotWidth: 50, lotDepth: 80,
    zoningClass: ZoningClass.R3,
    lotType: LotType.INSIDE,
    rrowWidth: 15,
    floorHeight: 3.0,
    firewalls: NO_FIREWALLS,
    floorsOverride: 0,
  }
  const result = calculateEnvelope(inputs)

  test('TLA = 4000', () => expect(result.tla).toBe(4000))
  test('BHL effective = 12 (zoning-limited)', () => {
    expect(result.bhl_effective).toBe(12)
    expect(result.bhl_source).toBe('zoning')
  })
  test('Front setback = 5.0m (flat base, RROW 15m)', () => expect(result.setbacks.front).toBe(5.0))
  test('Side setbacks = 3.0m each (flat base, RROW 15m)', () => {
    expect(result.setbacks.left).toBe(3.0)
    expect(result.setbacks.right).toBe(3.0)
  })
  test('AMBF by setbacks = 3168 (44×72)', () => expect(result.ambf_by_setbacks).toBe(44 * 72))
  test('AMBF by PSO = 2800', () => expect(result.ambf_by_pso).toBe(2800))
  test('AMBF = 2800 (PSO more stringent)', () => expect(result.ambf).toBe(2800))
  test('maxGFA = 20000', () => expect(result.maxGFA).toBe(20000))
  test('effectiveStoreys = 7 (FLAR-limited)', () => expect(result.effectiveStoreys).toBe(7))
  test('No violations (no BHL override active)', () => expect(result.violations.length).toBe(0))
})

// ── Scenario B: R-1 corner lot, 15m×20m (300sqm), RROW=8m ───────────────────
// R-1 setbacks (SETBACK_TABLE_R1): bhlEffective=3, RROW=8m<10 → {front:4.5, side:2.0, rear:2.0}
// CORNER: left uses front setback
// setbacks: front=4.5, rear=2.0, left=4.5 (CORNER), right=2.0
// Buildable: W=15-4.5-2.0=8.5m, D=20-4.5-2.0=13.5m
// AMBF by setbacks: 8.5×13.5 = 114.75 sqm
// PSO for corner lot R-1 = 0.80; AMBF by PSO: 300×0.80 = 240 sqm
// AMBF = min(114.75, 240) = 114.75 sqm ← setbacks more stringent
// maxGFA = 300×1.20 = 360 sqm
// effectiveStoreys = min(3, floor(360/114.75)) = min(3, 3) = 3 storeys

describe('Scenario B — R1 corner lot 15x20m RROW=8m', () => {
  const inputs: NBCPInputs = {
    lotWidth: 15, lotDepth: 20,
    zoningClass: ZoningClass.R1,
    lotType: LotType.CORNER,
    rrowWidth: 8,
    floorHeight: 3.0,
    firewalls: NO_FIREWALLS,
    floorsOverride: 0,
  }
  const result = calculateEnvelope(inputs)

  test('TLA = 300', () => expect(result.tla).toBe(300))
  test('BHL effective = 3 (zoning-limited)', () => {
    expect(result.bhl_effective).toBe(3)
    expect(result.bhl_source).toBe('zoning')
  })
  test('PSO = 0.80 (R-1 corner same as inside)', () => expect(result.pso).toBe(0.80))
  test('Front setback = 4.5m (R-1 flat base, RROW<10, 3F)', () => {
    expect(result.setbacks.front).toBeCloseTo(4.5, 5)
  })
  test('Left setback = 4.5m (CORNER uses front setback on secondary road side)', () => {
    expect(result.setbacks.left).toBeCloseTo(4.5, 5)
  })
  test('No violations', () => expect(result.violations.length).toBe(0))
  test('effectiveStoreys = 3', () => expect(result.effectiveStoreys).toBe(3))
})

// ── Scenario C: R-2 Max, inside lot, RROW=10m, firewall rear+left ─────────────
// Flat base setbacks (SETBACK_TABLE_GENERAL, RROW=10m, 0–15 band):
//   front=5.0, side=2.0, rear=2.0
// With firewalls: rear→0, left→0
// setbacks: front=5.0, rear=0, left=0, right=2.0
// Buildable: W=12-0-2.0=10.0m, D=25-5.0-0=20.0m
// AMBF by setbacks: 10×20 = 200 sqm
// PSO (inside) = 0.80; AMBF by PSO = 240 sqm
// AMBF = min(200, 240) = 200 sqm ← setbacks more stringent
// maxGFA = 300×3.00 = 900 sqm
// effectiveStoreys = min(5, floor(900/200)) = min(5, 4) = 4 storeys

describe('Scenario C — R2 Max inside 12x25m RROW=10m, rear+left firewalls', () => {
  const inputs: NBCPInputs = {
    lotWidth: 12, lotDepth: 25,
    zoningClass: ZoningClass.R2_MAX,
    lotType: LotType.INSIDE,
    rrowWidth: 10,
    floorHeight: 3.0,
    firewalls: { front: false, rear: true, left: true, right: false },
    floorsOverride: 0,
  }
  const result = calculateEnvelope(inputs)

  test('Rear setback = 0 (firewall)', () => expect(result.setbacks.rear).toBe(0))
  test('Left setback = 0 (firewall)', () => expect(result.setbacks.left).toBe(0))
  test('Right setback = 2.0m (flat base, no incremental)', () => {
    expect(result.setbacks.right).toBeCloseTo(2.0, 5)
  })
  test('AMBF = 200 (setbacks more stringent than PSO)', () => {
    expect(result.ambf).toBe(200)
    expect(result.ambf).toBeLessThan(result.ambf_by_pso)
  })
  test('effectiveStoreys = 4 (FLAR-limited: floor(900/200) = 4)', () => {
    expect(result.effectiveStoreys).toBe(4)
  })
  test('No violations (no BHL override, ambf > 0)', () => expect(result.violations.length).toBe(0))
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
    floorsOverride: 0,
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
    floorsOverride: 0,
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
    floorsOverride: 0,
  }
  const result = calculateEnvelope(inputs)
  test('rear setback equals front setback (both RROW-based)', () => {
    expect(result.setbacks.rear).toBe(result.setbacks.front)
  })
  test('left and right are standard side setbacks (not RROW front)', () => {
    expect(result.setbacks.left).toBeLessThan(result.setbacks.front)
  })
})

// ── End lot: right uses front setback ─────────────────────────────────────────
describe('End lot — right setback equals front setback', () => {
  const inputs: NBCPInputs = {
    lotWidth: 20, lotDepth: 40,
    zoningClass: ZoningClass.R2_MAX,
    lotType: LotType.END,
    rrowWidth: 10,
    floorHeight: 3.0,
    firewalls: NO_FIREWALLS,
    floorsOverride: 0,
  }
  const result = calculateEnvelope(inputs)
  test('right setback equals front setback (secondary road-end side)', () => {
    expect(result.setbacks.right).toBe(result.setbacks.front)
  })
  test('left uses standard side setback (not secondary front)', () => {
    expect(result.setbacks.left).toBeLessThan(result.setbacks.front)
  })
})

// ── floorsOverride: BHL violation fires when override exceeds BHL ──────────────
describe('floorsOverride — exceeding BHL fires a violation', () => {
  const inputs: NBCPInputs = {
    lotWidth: 20, lotDepth: 30,
    zoningClass: ZoningClass.R2_MAX,
    lotType: LotType.INSIDE,
    rrowWidth: 12,
    floorHeight: 3.0,
    firewalls: NO_FIREWALLS,
    floorsOverride: 10, // bhl_effective = min(5, 12) = 5 → this exceeds it
  }
  const result = calculateEnvelope(inputs)

  test('displayStoreys = 10 (override)', () => expect(result.displayStoreys).toBe(10))
  test('displayHeight = 30m', () => expect(result.displayHeight).toBe(30))
  test('BHL violation fires', () => expect(result.violations.some(v => v.field === 'bhl')).toBe(true))
})

// ── floorsOverride = 0: no override, uses effectiveStoreys ────────────────────
describe('floorsOverride = 0 — uses code-computed max', () => {
  const inputs: NBCPInputs = {
    lotWidth: 20, lotDepth: 30,
    zoningClass: ZoningClass.R2_MAX,
    lotType: LotType.INSIDE,
    rrowWidth: 12,
    floorHeight: 3.0,
    firewalls: NO_FIREWALLS,
    floorsOverride: 0,
  }
  const result = calculateEnvelope(inputs)
  test('displayStoreys = effectiveStoreys (no override)', () => {
    expect(result.displayStoreys).toBe(result.effectiveStoreys)
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
    floorsOverride: 0,
  }
  const result = calculateEnvelope(inputs)

  test('ambf = 0', () => expect(result.ambf).toBe(0))
  test('violation field = ambf', () => {
    expect(result.violations.some(v => v.field === 'ambf')).toBe(true)
  })
  test('effectiveStoreys still ≥ 1 (render guard)', () => {
    expect(result.effectiveStoreys).toBeGreaterThan(0)
  })
})
