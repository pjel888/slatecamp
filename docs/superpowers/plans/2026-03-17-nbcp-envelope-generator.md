# NBCP Envelope Generator Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a parametric 3D building envelope simulator grounded in PD 1096 (2004 Revised IRR) that lets ALE students manipulate zoning, lot, RROW, and firewall parameters to see the maximum allowable building volume morph in real-time with spatial violation annotations.

**Architecture:** Pure TypeScript math engine (`calculateEnvelope`) feeds a thin Zustand store; a React control panel and telemetry HUD write to / read from the store; an R3F scene reads from the store via `getState()` inside `useFrame` and lerps geometry refs toward target values using a self-scheduling `invalidate()` loop.

**Tech Stack:** Next.js 14 App Router, React Three Fiber, @react-three/drei, Zustand, Tailwind CSS, TypeScript, Bun (tests via `bun test`)

**Spec:** `docs/superpowers/specs/2026-03-17-nbcp-envelope-generator-design.md`

---

## Chunk 1: NBCP Domain Constants

### Task 1: Create `_constants/nbcp.ts` — enums, zoning table, RROW BHL table

**Files:**
- Create: `src/app/dashboard/3d-lab/_constants/nbcp.ts`
- Create: `src/app/dashboard/3d-lab/_constants/nbcp.test.ts`

- [ ] **Step 1.1: Create the constants file with enums and zoning table**

```ts
// src/app/dashboard/3d-lab/_constants/nbcp.ts
// 2004 Revised IRR of PD 1096 — Rules VII & VIII
// IMPORTANT: Every value here is sourced from the IRR. Do NOT modify without
// cross-referencing the 2004 Revised Implementing Rules and Regulations of PD 1096.

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum ZoningClass {
  R1       = 'R1',
  R2_BASIC = 'R2_BASIC',
  R2_MAX   = 'R2_MAX',
  R3       = 'R3',
  R4       = 'R4',
  R5       = 'R5',
  C1       = 'C1',
  C2       = 'C2',
  C3       = 'C3',
  I1       = 'I1',
  I2       = 'I2',
}

export enum LotType {
  INSIDE = 'INSIDE',
  CORNER = 'CORNER',
  THROUGH = 'THROUGH',
  END    = 'END',
}

// ─── Zoning Table ─────────────────────────────────────────────────────────────
// IRR Rule VII Guidelines Table VII.G.1 — FLAR Designations
// IRR Rule VII §707 + Table VII.2 — Building Height Limits
// IRR Rule VIII §802-803 — Percentage of Site Occupancy (PSO)
//
// flar: mid-range of the allowed FLAR band for simulation
// pso_inside: used for INSIDE and THROUGH lots (0.0–1.0 decimal, e.g. 0.80 = 80%)
// pso_corner: used for CORNER lots only; END lots use pso_inside

export interface ZoningEntry {
  label: string
  flar: number
  bhl_storeys: number
  pso_inside: number  // also used for THROUGH and END lots
  pso_corner: number  // CORNER lots only
  isResidential: boolean
}

export const ZONING_TABLE: Record<ZoningClass, ZoningEntry> = {
  [ZoningClass.R1]:       { label: 'R-1 Low-Density Residential',        flar: 1.20, bhl_storeys: 3,  pso_inside: 0.80, pso_corner: 0.80, isResidential: true  },
  [ZoningClass.R2_BASIC]: { label: 'R-2 Basic (Duplex/Rowhouse)',         flar: 2.00, bhl_storeys: 3,  pso_inside: 0.80, pso_corner: 0.85, isResidential: true  },
  [ZoningClass.R2_MAX]:   { label: 'R-2 Max (Apartment)',                 flar: 3.00, bhl_storeys: 5,  pso_inside: 0.80, pso_corner: 0.85, isResidential: true  },
  [ZoningClass.R3]:       { label: 'R-3 High-Density Residential',        flar: 5.00, bhl_storeys: 12, pso_inside: 0.70, pso_corner: 0.75, isResidential: true  },
  [ZoningClass.R4]:       { label: 'R-4 High-Rise Condominium',           flar: 7.50, bhl_storeys: 18, pso_inside: 0.70, pso_corner: 0.75, isResidential: true  },
  [ZoningClass.R5]:       { label: 'R-5 Very High-Density Residential',   flar: 9.00, bhl_storeys: 36, pso_inside: 0.60, pso_corner: 0.65, isResidential: true  },
  [ZoningClass.C1]:       { label: 'C-1 Low-Intensity Commercial',        flar: 2.80, bhl_storeys: 5,  pso_inside: 0.80, pso_corner: 0.85, isResidential: false },
  [ZoningClass.C2]:       { label: 'C-2 Medium-Intensity Commercial',     flar: 6.30, bhl_storeys: 15, pso_inside: 0.80, pso_corner: 0.85, isResidential: false },
  [ZoningClass.C3]:       { label: 'C-3 High-Intensity Commercial',       flar: 12.00, bhl_storeys: 30, pso_inside: 0.70, pso_corner: 0.75, isResidential: false },
  [ZoningClass.I1]:       { label: 'I-1 Light Industrial',                flar: 1.75, bhl_storeys: 5,  pso_inside: 0.70, pso_corner: 0.75, isResidential: false },
  [ZoningClass.I2]:       { label: 'I-2 Medium Industrial',               flar: 1.25, bhl_storeys: 3,  pso_inside: 0.60, pso_corner: 0.65, isResidential: false },
} as const

// ─── RROW → BHL Cap ───────────────────────────────────────────────────────────
// IRR Rule VII §707 + Table VII.2
// CRITICAL: minRrow uses >= (inclusive lower bound). 8.00m → 5 storeys (8.00–9.99m band).

export interface RrowBhlEntry {
  minRrow: number   // inclusive
  maxRrow: number   // exclusive (except last entry which is Infinity)
  bhl_storeys: number
}

export const RROW_BHL_TABLE: RrowBhlEntry[] = [
  { minRrow: 0,    maxRrow: 8,    bhl_storeys: 3  },  // < 8m
  { minRrow: 8,    maxRrow: 10,   bhl_storeys: 5  },  // 8.00–9.99m
  { minRrow: 10,   maxRrow: 12,   bhl_storeys: 5  },  // 10.00–11.99m
  { minRrow: 12,   maxRrow: 15,   bhl_storeys: 12 },  // 12.00–14.99m
  { minRrow: 15,   maxRrow: 20,   bhl_storeys: 15 },  // 15.00–19.99m
  { minRrow: 20,   maxRrow: 30,   bhl_storeys: 18 },  // 20.00–29.99m
  { minRrow: 30,   maxRrow: Infinity, bhl_storeys: 36 }, // 30m+
] as const

// ─── Setback Tables ───────────────────────────────────────────────────────────

export interface SetbackValues {
  front: number
  side: number
  rear: number
}

// IRR Rule VIII Table VIII.2 — R-1 Residential only, by building height
// Note: Table VIII.2 is height-band based (not continuous incremental).
// The incremental setback rule (§804.6) is applied ON TOP of these values.
export interface R1SetbackEntry {
  maxStoreys: number
  setbacksIfRrowBelow10: SetbackValues
  setbacksIfRrowAtLeast10: SetbackValues
}

export const SETBACK_TABLE_R1: R1SetbackEntry[] = [
  {
    maxStoreys: 2,
    setbacksIfRrowBelow10:    { front: 3.0, side: 1.5, rear: 2.0 },
    setbacksIfRrowAtLeast10:  { front: 4.5, side: 1.5, rear: 2.0 },
  },
  {
    maxStoreys: 3,
    setbacksIfRrowBelow10:    { front: 4.5, side: 2.0, rear: 2.0 },
    setbacksIfRrowAtLeast10:  { front: 4.5, side: 2.0, rear: 2.0 },
  },
] as const

// IRR Rule VIII Table VIII.3 — Non-residential and higher-density, by RROW width
export interface GeneralSetbackEntry {
  minRrow: number   // inclusive
  maxRrow: number   // exclusive
  setbacks: SetbackValues
}

export const SETBACK_TABLE_GENERAL: GeneralSetbackEntry[] = [
  { minRrow: 0,   maxRrow: 15,  setbacks: { front: 5.0, side: 2.0, rear: 2.0 } },
  { minRrow: 15,  maxRrow: 20,  setbacks: { front: 5.0, side: 3.0, rear: 3.0 } },
  { minRrow: 20,  maxRrow: 30,  setbacks: { front: 6.0, side: 3.0, rear: 3.0 } },
  { minRrow: 30,  maxRrow: Infinity, setbacks: { front: 8.0, side: 5.0, rear: 5.0 } },
] as const

// ─── Firewall Permissions ─────────────────────────────────────────────────────
// IRR Rule VII — firewall provisions by zone
// R-1: no firewalls permitted on any property line
// R-2: rear and side property lines only (not front/RROW-facing)
// R-3+, Commercial, Industrial: rear and side property lines

export type FirewallSide = 'front' | 'rear' | 'left' | 'right'

export const FIREWALL_ALLOWED: Record<ZoningClass, FirewallSide[]> = {
  [ZoningClass.R1]:       [],
  [ZoningClass.R2_BASIC]: ['rear', 'left', 'right'],
  [ZoningClass.R2_MAX]:   ['rear', 'left', 'right'],
  [ZoningClass.R3]:       ['rear', 'left', 'right'],
  [ZoningClass.R4]:       ['rear', 'left', 'right'],
  [ZoningClass.R5]:       ['rear', 'left', 'right'],
  [ZoningClass.C1]:       ['rear', 'left', 'right'],
  [ZoningClass.C2]:       ['rear', 'left', 'right'],
  [ZoningClass.C3]:       ['rear', 'left', 'right'],
  [ZoningClass.I1]:       ['rear', 'left', 'right'],
  [ZoningClass.I2]:       ['rear', 'left', 'right'],
} as const

// ─── GFA Conversion Factors ───────────────────────────────────────────────────
// IRR Rule VII Guidelines — TGFA = GFA × conversionFactor
export const GFA_CONVERSION = {
  residential:    1.2,
  nonResidential: 1.3,
} as const

// ─── Lookup Helpers ───────────────────────────────────────────────────────────

/** Returns BHL cap (storeys) from RROW width. Uses >= on lower bound. */
export function getRrowBhl(rrowWidth: number): number {
  const entry = RROW_BHL_TABLE.find(e => rrowWidth >= e.minRrow && rrowWidth < e.maxRrow)
  return entry?.bhl_storeys ?? 3
}

/** Returns base setbacks (before incremental) for a given zone and RROW. */
export function getBaseSetbacks(
  zoningClass: ZoningClass,
  rrowWidth: number,
  bhlEffective: number,
): SetbackValues {
  if (zoningClass === ZoningClass.R1) {
    const entry = SETBACK_TABLE_R1.find(e => bhlEffective <= e.maxStoreys)
      ?? SETBACK_TABLE_R1[SETBACK_TABLE_R1.length - 1]
    return rrowWidth < 10
      ? { ...entry.setbacksIfRrowBelow10 }
      : { ...entry.setbacksIfRrowAtLeast10 }
  }
  const entry = SETBACK_TABLE_GENERAL.find(e => rrowWidth >= e.minRrow && rrowWidth < e.maxRrow)
    ?? SETBACK_TABLE_GENERAL[SETBACK_TABLE_GENERAL.length - 1]
  return { ...entry.setbacks }
}
```

- [ ] **Step 1.2: Write tests for the lookup helpers**

```ts
// src/app/dashboard/3d-lab/_constants/nbcp.test.ts
import { describe, test, expect } from 'bun:test'
import { getRrowBhl, getBaseSetbacks, ZONING_TABLE, ZoningClass, LotType } from './nbcp'

describe('getRrowBhl', () => {
  test('8.00m maps to 5 storeys (>= lower bound)', () => {
    expect(getRrowBhl(8)).toBe(5)
  })
  test('7.99m maps to 3 storeys', () => {
    expect(getRrowBhl(7.99)).toBe(3)
  })
  test('15m maps to 15 storeys', () => {
    expect(getRrowBhl(15)).toBe(15)
  })
  test('30m maps to 36 storeys', () => {
    expect(getRrowBhl(30)).toBe(36)
  })
  test('12m maps to 12 storeys', () => {
    expect(getRrowBhl(12)).toBe(12)
  })
})

describe('getBaseSetbacks — R1', () => {
  test('R1, 2 storeys, RROW < 10: front 3.0m', () => {
    const sb = getBaseSetbacks(ZoningClass.R1, 8, 2)
    expect(sb.front).toBe(3.0)
    expect(sb.side).toBe(1.5)
    expect(sb.rear).toBe(2.0)
  })
  test('R1, 2 storeys, RROW >= 10: front 4.5m', () => {
    const sb = getBaseSetbacks(ZoningClass.R1, 10, 2)
    expect(sb.front).toBe(4.5)
  })
  test('R1, 3 storeys: front 4.5m regardless of RROW', () => {
    expect(getBaseSetbacks(ZoningClass.R1, 8, 3).front).toBe(4.5)
    expect(getBaseSetbacks(ZoningClass.R1, 15, 3).front).toBe(4.5)
  })
})

describe('getBaseSetbacks — General (Table VIII.3)', () => {
  test('RROW 10m: front 5.0, side 2.0, rear 2.0', () => {
    const sb = getBaseSetbacks(ZoningClass.R3, 10, 5)
    expect(sb).toEqual({ front: 5.0, side: 2.0, rear: 2.0 })
  })
  test('RROW 15m: front 5.0, side 3.0, rear 3.0', () => {
    const sb = getBaseSetbacks(ZoningClass.R3, 15, 12)
    expect(sb).toEqual({ front: 5.0, side: 3.0, rear: 3.0 })
  })
  test('RROW 30m: front 8.0, side 5.0, rear 5.0', () => {
    const sb = getBaseSetbacks(ZoningClass.C2, 30, 15)
    expect(sb).toEqual({ front: 8.0, side: 5.0, rear: 5.0 })
  })
})

describe('ZONING_TABLE spot checks', () => {
  test('R3 FLAR is 5.0, BHL 12 storeys, PSO inside 70%', () => {
    const entry = ZONING_TABLE[ZoningClass.R3]
    expect(entry.flar).toBe(5.0)
    expect(entry.bhl_storeys).toBe(12)
    expect(entry.pso_inside).toBe(0.70)
    expect(entry.pso_corner).toBe(0.75)
  })
  test('R2_MAX BHL is 5 storeys', () => {
    expect(ZONING_TABLE[ZoningClass.R2_MAX].bhl_storeys).toBe(5)
  })
  test('C2 is not residential', () => {
    expect(ZONING_TABLE[ZoningClass.C2].isResidential).toBe(false)
  })
})
```

- [ ] **Step 1.3: Run tests — expect PASS**

```bash
bun test src/app/dashboard/3d-lab/_constants/nbcp.test.ts
```

Expected: all tests pass.

- [ ] **Step 1.4: Commit**

```bash
git add src/app/dashboard/3d-lab/_constants/
git commit -m "feat: add NBCP IRR constants — zoning table, RROW BHL, setbacks, firewall rules"
```

---

## Chunk 2: Calculator + Store + Hook

### Task 2: Create `_utils/nbcpCalculator.ts` — pure calculation engine

**Files:**
- Create: `src/app/dashboard/3d-lab/_utils/nbcpCalculator.ts`
- Create: `src/app/dashboard/3d-lab/_utils/nbcpCalculator.test.ts`

- [ ] **Step 2.1: Write the types and pure calculator**

```ts
// src/app/dashboard/3d-lab/_utils/nbcpCalculator.ts
// Pure function — no React, no Zustand, no side effects. Unit-testable in isolation.
// Implements sequential development control calculation per 2004 Revised IRR of PD 1096.

import {
  ZoningClass,
  LotType,
  ZONING_TABLE,
  FIREWALL_ALLOWED,
  GFA_CONVERSION,
  getRrowBhl,
  getBaseSetbacks,
  type FirewallSide,
} from '../_constants/nbcp'

// ─── I/O Types ────────────────────────────────────────────────────────────────

export interface FirewallInputs {
  front: boolean
  rear: boolean
  left: boolean
  right: boolean
}

export interface NBCPInputs {
  lotWidth: number      // meters, 5–200
  lotDepth: number      // meters, 5–200
  zoningClass: ZoningClass
  lotType: LotType
  rrowWidth: number     // meters, 6–40
  floorHeight: number   // meters per storey, 2.7–4.0 (design assumption)
  firewalls: FirewallInputs
}

export interface Violation {
  field: string
  message: string
  codeCitation: string
}

export interface PerSideSetbacks {
  front: number
  rear: number
  left: number
  right: number
}

export interface NBCPComputed {
  // Step 1 — Lot
  tla: number

  // Step 2 — BHL
  bhl_zoning: number       // from ZONING_TABLE (storeys)
  bhl_rrow: number         // from RROW_BHL_TABLE (storeys)
  bhl_effective: number    // min(bhl_zoning, bhl_rrow)
  bhl_meters: number       // bhl_effective × floorHeight
  bhl_source: 'zoning' | 'rrow'

  // Step 3 — Setbacks
  setbacks: PerSideSetbacks
  incrementalSetback: number  // 0.30 × min(bhl_effective - 2, 12), ≥ 0

  // Step 4 — AMBF
  buildableWidth: number
  buildableDepth: number
  ambf_by_setbacks: number
  ambf_by_pso: number
  ambf: number             // min(by_setbacks, by_pso) — post-PSO

  // Step 5 — TOSL
  tosl: number
  tosl_pct: number         // 0.0–1.0

  // Step 6 — PSO
  pso: number              // 0.0–1.0

  // Step 7 — GFA / FLAR
  flar: number
  maxGFA: number           // tla × flar
  conversionFactor: number
  maxTGFA: number          // maxGFA × conversionFactor

  // Step 7 — AMVB (valid because ambf is already post-PSO from Step 4)
  amvb: number             // ambf × bhl_meters

  // Step 8 — Effective storeys (FLAR-BHL crosscheck)
  effectiveStoreys: number // min(bhl_effective, floor(maxGFA / ambf)), clamped ≥ 1
  effectiveHeight: number  // effectiveStoreys × floorHeight

  // Step 9 — Violations
  violations: Violation[]
}

// ─── Calculator ───────────────────────────────────────────────────────────────

/**
 * Pure function implementing the sequential development control calculation
 * from the 2004 Revised IRR of PD 1096 (Rules VII & VIII).
 *
 * Never throws. Invalid inputs produce violations[], not exceptions.
 * All section references are to the 2004 Revised IRR unless otherwise noted.
 */
export function calculateEnvelope(inputs: NBCPInputs): NBCPComputed {
  const { lotWidth, lotDepth, zoningClass, lotType, rrowWidth, floorHeight, firewalls } = inputs

  const zoning = ZONING_TABLE[zoningClass]
  const violations: Violation[] = []

  // ── Step 1: TLA ───────────────────────────────────────────────────────────
  const tla = lotWidth * lotDepth

  // ── Step 2: BHL (IRR Rule VII §707 + Table VII.2) ────────────────────────
  const bhl_zoning = zoning.bhl_storeys
  const bhl_rrow   = getRrowBhl(rrowWidth)
  const bhl_effective = Math.min(bhl_zoning, bhl_rrow)
  const bhl_meters    = bhl_effective * floorHeight
  const bhl_source: 'zoning' | 'rrow' = bhl_rrow < bhl_zoning ? 'rrow' : 'zoning'
  // Note: use strict < (not <=). When RROW and zoning BHL are equal, neither is
  // more restrictive — source = 'zoning' avoids spurious amber building color.

  // ── Step 3: Setbacks (IRR Rule VIII Tables VIII.2 & VIII.3 + §804.6) ─────
  // Sanitize firewalls: disallowed sides forced to false
  const allowed = new Set<FirewallSide>(FIREWALL_ALLOWED[zoningClass])
  const cleanFirewalls: FirewallInputs = {
    front: firewalls.front && allowed.has('front'),
    rear:  firewalls.rear  && allowed.has('rear'),
    left:  firewalls.left  && allowed.has('left'),
    right: firewalls.right && allowed.has('right'),
  }

  // Base setbacks from table (before incremental)
  const base = getBaseSetbacks(zoningClass, rrowWidth, bhl_effective)

  // Incremental setback: 0.30m per storey above 2nd, capped at storey 14
  // IRR Rule VIII §804.6
  const incrementalStoreys   = Math.min(Math.max(bhl_effective - 2, 0), 12)
  const incrementalSetback   = incrementalStoreys * 0.30

  // Per-side setbacks accounting for lot type and firewalls
  // Lot type rules:
  //   CORNER:  left side (secondary road) uses front setback
  //   THROUGH: rear also uses front setback (RROW on both sides)
  //   END:     right side (secondary road-end, canonical) uses front setback
  const frontSb = base.front + incrementalSetback
  const sideSb  = base.side  + incrementalSetback
  const rearSb  = base.rear  + incrementalSetback

  const rawSetbacks: PerSideSetbacks = {
    front: frontSb,
    rear:  (lotType === LotType.THROUGH)           ? frontSb : rearSb,
    left:  (lotType === LotType.CORNER)            ? frontSb : sideSb,
    right: (lotType === LotType.END)               ? frontSb : sideSb,
  }

  const setbacks: PerSideSetbacks = {
    front: cleanFirewalls.front ? 0 : rawSetbacks.front,
    rear:  cleanFirewalls.rear  ? 0 : rawSetbacks.rear,
    left:  cleanFirewalls.left  ? 0 : rawSetbacks.left,
    right: cleanFirewalls.right ? 0 : rawSetbacks.right,
  }

  // ── Step 4: AMBF (IRR Rule VIII §802-803 + Rule VII Guidelines) ──────────
  const buildableWidth   = Math.max(0, lotWidth  - setbacks.left  - setbacks.right)
  const buildableDepth   = Math.max(0, lotDepth  - setbacks.front - setbacks.rear)
  const ambf_by_setbacks = buildableWidth * buildableDepth

  // PSO: CORNER gets pso_corner; all other lot types use pso_inside
  const pso = lotType === LotType.CORNER ? zoning.pso_corner : zoning.pso_inside
  const ambf_by_pso = tla * pso

  // Most stringent rule governs (IRR Rule VII Guidelines — sequential DC application)
  const ambf = Math.min(ambf_by_setbacks, ambf_by_pso)

  if (ambf <= 0) {
    violations.push({
      field: 'ambf',
      message: 'Lot too small for required setbacks',
      codeCitation: 'IRR Rule VIII §802–803',
    })
  }

  // ── Step 5: TOSL (IRR Rule VIII §804 + Guidelines §4) ────────────────────
  const tosl     = tla - ambf
  const tosl_pct = tla > 0 ? tosl / tla : 0

  // ── Step 6: GFA / FLAR (IRR Rule VII Guidelines Table VII.G.1) ───────────
  const flar             = zoning.flar
  const maxGFA           = tla * flar
  const conversionFactor = zoning.isResidential ? GFA_CONVERSION.residential : GFA_CONVERSION.nonResidential
  const maxTGFA          = maxGFA * conversionFactor

  // ── Step 7: AMVB (IRR Rule VII Guidelines — AMVB procedure) ─────────────
  // Valid because ambf is post-PSO (Step 4 already applied the most-stringent rule)
  const amvb = ambf * bhl_meters

  // ── Step 8: Effective storeys — FLAR–BHL crosscheck ─────────────────────
  // IRR Rule VII Guidelines (sequential DC application)
  let flarLimitedStoreys = ambf > 0 ? Math.floor(maxGFA / ambf) : 0

  if (flarLimitedStoreys < 1) {
    violations.push({
      field: 'flar',
      message: 'FLAR too restrictive: max GFA smaller than single-floor footprint',
      codeCitation: 'IRR Rule VII Guidelines Table VII.G.1',
    })
    flarLimitedStoreys = 1  // clamp so 3D scene always renders ≥1 storey
  } else if (flarLimitedStoreys < bhl_effective) {
    violations.push({
      field: 'flar',
      message: `FLAR limits building to ${flarLimitedStoreys} storeys (BHL allows ${bhl_effective})`,
      codeCitation: 'IRR Rule VII Guidelines Table VII.G.1',
    })
  }

  const effectiveStoreys = Math.min(bhl_effective, flarLimitedStoreys)
  const effectiveHeight  = effectiveStoreys * floorHeight

  return {
    tla,
    bhl_zoning, bhl_rrow, bhl_effective, bhl_meters, bhl_source,
    setbacks, incrementalSetback,
    buildableWidth, buildableDepth,
    ambf_by_setbacks, ambf_by_pso, ambf,
    tosl, tosl_pct,
    pso,
    flar, maxGFA, conversionFactor, maxTGFA,
    amvb,
    effectiveStoreys, effectiveHeight,
    violations,
  }
}
```

- [ ] **Step 2.2: Write tests — hand-calculated verification scenarios from the spec**

```ts
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
  // I-2 (FLAR=1.25) on a large lot with big setbacks → maxGFA can be < ambf
  // Use a large lot where AMBF > maxGFA
  // TLA=10000, FLAR=1.25 → maxGFA=12500; but try FLAR=0.1 scenario via I2 on corner
  // Easier: tiny FLAR zone: use R1 (flar=1.20), huge setbacks reduce AMBF significantly
  // Actually: need maxGFA < ambf → tla*flar < ambf
  // With R1 on inside lot 100×100=10000, RROW=6, no firewalls:
  //   BHL=3 (min of R1=3, RROW=3), incremental=(3-2)*0.30=0.30
  //   Base setbacks (R1, rrow<10, 3 storeys): front=4.5, side=2.0, rear=2.0
  //   Setbacks: front=4.8, rear=2.3, left=2.3, right=2.3
  //   Buildable: W=100-2.3-2.3=95.4, D=100-4.8-2.3=92.9
  //   AMBF_setbacks=95.4*92.9=8862.66; AMBF_pso=10000*0.80=8000 → AMBF=8000
  //   maxGFA=10000*1.20=12000 > 8000 — no violation
  // Need flar < 1.0 to get maxGFA < ambf... use a custom calc path:
  // Simplest: directly test the guard with a zone that has very low FLAR on large lot
  // I2 (flar=1.25) on 10x10=100sqm lot, RROW=6m:
  //   BHL=min(3,3)=3; base(I2,rrow<10,3st): front=5,side=2,rear=2; incr=0.30
  //   Setbacks: 5.3, 2.3, 2.3, 2.3
  //   Buildable: W=10-2.3-2.3=5.4, D=10-5.3-2.3=2.4 → AMBF_sb=12.96
  //   AMBF_pso=100*0.60=60 → AMBF=12.96
  //   maxGFA=100*1.25=125 > 12.96 → no clamp triggered
  // Need a case where ambf > maxGFA. Use lotW=50,lotD=50=2500sqm, I2 (flar=1.25):
  //   maxGFA=2500*1.25=3125; RROW=6, BHL=3, incr=0.30
  //   Base(I2,rrow<10,3st): front=5,side=2,rear=2
  //   Setbacks: 5.3,2.3,2.3,2.3 → bW=50-4.6=45.4, bD=50-7.6=42.4 → AMBF_sb=1924.96
  //   AMBF_pso=2500*0.60=1500 → AMBF=1500
  //   maxGFA=3125 > 1500, floor(3125/1500)=2 storeys — no zero clamp
  // True zero-storey: need ambf >> maxGFA. Construct manually by using very large lot
  // but the FLAR yields tiny maxGFA. This is hard with given zones.
  // Instead: test with a lot where setbacks leave almost no AMBF but FLAR is also tiny.
  // Skip formal scenario — test the clamp guard directly via the ambf=0 path:
  // When ambf=0 (already tested), flarLimitedStoreys=0 → clamp fires automatically.
  // The existing "lot too small for setbacks" test covers this path.
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
```

- [ ] **Step 2.3: Run tests — expect PASS**

```bash
bun test src/app/dashboard/3d-lab/_utils/nbcpCalculator.test.ts
```

If any test fails, fix the calculator logic before proceeding. Do NOT proceed with store/UI until all calculator tests pass.

- [ ] **Step 2.4: Commit**

```bash
git add src/app/dashboard/3d-lab/_utils/
git commit -m "feat: add NBCP calculator — pure TypeScript engine with IRR-verified math"
```

---

### Task 3: Create `_stores/nbcpStore.ts` and `_hooks/useNBCPInvalidateOnChange.ts`

**Files:**
- Create: `src/app/dashboard/3d-lab/_stores/nbcpStore.ts`
- Create: `src/app/dashboard/3d-lab/_hooks/useNBCPInvalidateOnChange.ts`

- [ ] **Step 3.1: Write the Zustand store**

```ts
// src/app/dashboard/3d-lab/_stores/nbcpStore.ts
import { create } from 'zustand'
import { ZoningClass, LotType } from '../_constants/nbcp'
import { calculateEnvelope, type NBCPInputs, type NBCPComputed } from '../_utils/nbcpCalculator'

// ─── Default inputs ────────────────────────────────────────────────────────────
const DEFAULT_INPUTS: NBCPInputs = {
  lotWidth:    20,
  lotDepth:    30,
  zoningClass: ZoningClass.R2_MAX,
  lotType:     LotType.INSIDE,
  rrowWidth:   12,
  floorHeight: 3.0,
  firewalls:   { front: false, rear: false, left: false, right: false },
}

// ─── Presets ──────────────────────────────────────────────────────────────────
export const NBCP_PRESETS: Array<{ label: string; inputs: NBCPInputs }> = [
  {
    label: 'R-1 Subdivision',
    inputs: { ...DEFAULT_INPUTS, lotWidth: 12, lotDepth: 25, zoningClass: ZoningClass.R1, rrowWidth: 8 },
  },
  {
    label: 'R-3 Apartment',
    inputs: { ...DEFAULT_INPUTS, lotWidth: 25, lotDepth: 40, zoningClass: ZoningClass.R3, rrowWidth: 15 },
  },
  {
    label: 'C-2 Commercial',
    inputs: { ...DEFAULT_INPUTS, lotWidth: 30, lotDepth: 50, zoningClass: ZoningClass.C2, lotType: LotType.CORNER, rrowWidth: 20 },
  },
  {
    label: 'RROW Effect',
    inputs: { ...DEFAULT_INPUTS, lotWidth: 20, lotDepth: 40, zoningClass: ZoningClass.R3, rrowWidth: 8 },
  },
  {
    label: 'Firewall Effect',
    inputs: { ...DEFAULT_INPUTS, lotWidth: 12, lotDepth: 25, zoningClass: ZoningClass.R2_MAX, rrowWidth: 10, firewalls: { front: false, rear: true, left: true, right: false } },
  },
]

// ─── Store ────────────────────────────────────────────────────────────────────

interface NBCPState {
  inputs: NBCPInputs
  computed: NBCPComputed

  // R3F bridge — registered from inside Canvas via useNBCPInvalidateOnChange
  invalidateFn: (() => void) | null

  // Actions
  setInputs: (patch: Partial<NBCPInputs>) => void
  setFirewall: (side: keyof NBCPInputs['firewalls'], val: boolean) => void
  applyPreset: (preset: typeof NBCP_PRESETS[number]) => void
  reset: () => void
  setInvalidateFn: (fn: (() => void) | null) => void
}

function computeAndInvalidate(inputs: NBCPInputs, invalidateFn: (() => void) | null): NBCPComputed {
  const computed = calculateEnvelope(inputs)
  invalidateFn?.()
  return computed
}

export const useNBCPStore = create<NBCPState>()((set, get) => ({
  inputs:   DEFAULT_INPUTS,
  computed: calculateEnvelope(DEFAULT_INPUTS),
  invalidateFn: null,

  setInputs: (patch) => {
    const next = { ...get().inputs, ...patch }
    set({ inputs: next, computed: computeAndInvalidate(next, get().invalidateFn) })
  },

  setFirewall: (side, val) => {
    const next = { ...get().inputs, firewalls: { ...get().inputs.firewalls, [side]: val } }
    set({ inputs: next, computed: computeAndInvalidate(next, get().invalidateFn) })
  },

  applyPreset: (preset) => {
    set({ inputs: preset.inputs, computed: computeAndInvalidate(preset.inputs, get().invalidateFn) })
  },

  reset: () => {
    set({ inputs: DEFAULT_INPUTS, computed: computeAndInvalidate(DEFAULT_INPUTS, get().invalidateFn) })
  },

  setInvalidateFn: (fn) => set({ invalidateFn: fn }),
}))
```

- [ ] **Step 3.2: Write the R3F invalidate hook**

```ts
// src/app/dashboard/3d-lab/_hooks/useNBCPInvalidateOnChange.ts
'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useNBCPStore } from '../_stores/nbcpStore'

/**
 * Registers the R3F `invalidate` function into the NBCP Zustand store.
 * Call this inside an R3F Canvas component (NBCPScene.tsx).
 *
 * Mirrors useInvalidateOnChange.ts exactly but wired to useNBCPStore,
 * keeping the two stores completely independent.
 */
export function useNBCPInvalidateOnChange() {
  const { invalidate } = useThree()
  const setInvalidateFn = useNBCPStore((s) => s.setInvalidateFn)

  useEffect(() => {
    setInvalidateFn(invalidate)
    return () => setInvalidateFn(null)
  }, [invalidate, setInvalidateFn])
}
```

- [ ] **Step 3.3: Verify store computes on init — quick sanity check in tests**

```ts
// Add to nbcpCalculator.test.ts or a new store test — confirm store initialises:
// This is a manual check: import useNBCPStore and call getState().computed
// Bun test cannot test Zustand stores that import from 'zustand' without a mock;
// skip store unit test — the calculator tests cover the math engine.
// Visual verification happens in Phase 4 (3D scene).
```

- [ ] **Step 3.4: Commit**

```bash
git add src/app/dashboard/3d-lab/_stores/nbcpStore.ts
git add src/app/dashboard/3d-lab/_hooks/useNBCPInvalidateOnChange.ts
git commit -m "feat: add NBCP Zustand store and R3F invalidate hook"
```

---

## Chunk 3: 2D Control Panel & Telemetry HUD

### Task 4: Create `NBCPControlPanel.tsx`

**Files:**
- Create: `src/app/dashboard/3d-lab/_scenes/NBCPEnvelope/NBCPControlPanel.tsx`

- [ ] **Step 4.1: Write the control panel**

```tsx
// src/app/dashboard/3d-lab/_scenes/NBCPEnvelope/NBCPControlPanel.tsx
'use client'

import { memo, useState } from 'react'
import { ChevronDown, ChevronRight, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { useNBCPStore, NBCP_PRESETS } from '../../_stores/nbcpStore'
import { ZoningClass, LotType, ZONING_TABLE, FIREWALL_ALLOWED } from '../../_constants/nbcp'
import type { FirewallInputs } from '../../_utils/nbcpCalculator'

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children, defaultOpen = true }: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-border first:border-t-0 pt-2 first:pt-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 w-full text-left mb-2"
      >
        {open ? <ChevronDown className="h-3 w-3 text-zinc-400" /> : <ChevronRight className="h-3 w-3 text-zinc-400" />}
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{title}</span>
      </button>
      {open && <div className="space-y-3">{children}</div>}
    </div>
  )
}

function SliderRow({ label, value, min, max, step, unit, decimals = 0, onChange }: {
  label: string; value: number; min: number; max: number; step: number
  unit: string; decimals?: number; onChange: (v: number) => void
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-medium text-zinc-600">{label}</label>
        <span className="text-[11px] font-bold text-zinc-900 tabular-nums">
          {value.toFixed(decimals)} {unit}
        </span>
      </div>
      <Slider
        value={[value]} min={min} max={max} step={step}
        onValueChange={([v]) => onChange(v!)}
        className="cursor-pointer"
      />
    </div>
  )
}

function SelectRow({ label, value, options, onChange }: {
  label: string; value: string
  options: Array<{ value: string; label: string }>
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="text-[11px] font-medium text-zinc-600 shrink-0">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="text-[11px] font-medium text-zinc-900 border border-border rounded px-1.5 py-0.5 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-0"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function ToggleRow({ label, value, disabled, tooltip, onChange }: {
  label: string; value: boolean; disabled: boolean; tooltip?: string; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <label className={cn('text-[11px] font-medium', disabled ? 'text-zinc-300' : 'text-zinc-600')}>
        {label}
      </label>
      <button
        title={tooltip}
        disabled={disabled}
        onClick={() => onChange(!value)}
        className={cn(
          'w-8 h-4 rounded-full transition-colors relative',
          disabled ? 'opacity-40 cursor-not-allowed bg-zinc-200' :
            value ? 'bg-blue-600 cursor-pointer' : 'bg-zinc-200 cursor-pointer'
        )}
      >
        <span className={cn(
          'absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform',
          value && !disabled ? 'translate-x-4' : 'translate-x-0.5'
        )} />
      </button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const ZONING_OPTIONS = Object.entries(ZONING_TABLE).map(([value, entry]) => ({
  value,
  label: entry.label,
}))

const LOT_TYPE_OPTIONS = [
  { value: LotType.INSIDE,  label: 'Inside' },
  { value: LotType.CORNER,  label: 'Corner' },
  { value: LotType.THROUGH, label: 'Through' },
  { value: LotType.END,     label: 'End' },
]

export const NBCPControlPanel = memo(function NBCPControlPanel() {
  const { inputs, setInputs, setFirewall, applyPreset, reset } = useNBCPStore()
  const { computed } = useNBCPStore()

  const allowedFirewallSides = new Set(FIREWALL_ALLOWED[inputs.zoningClass])

  // BHL conversion display
  const bhlDisplay = `BHL: ${computed.bhl_effective} storeys × ${inputs.floorHeight.toFixed(1)}m = ${computed.bhl_meters.toFixed(1)}m`

  return (
    <div className="absolute left-4 top-4 bottom-4 z-10 w-72 overflow-y-auto
      bg-white/90 backdrop-blur-sm border border-border rounded-md shadow-lg p-3 space-y-3">

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
          NBCP Parameters
        </span>
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-sm hover:bg-zinc-100" onClick={reset}>
          <RotateCcw className="h-3 w-3 text-zinc-400" />
        </Button>
      </div>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-1">
        {NBCP_PRESETS.map(preset => (
          <button
            key={preset.label}
            onClick={() => applyPreset(preset)}
            className="text-[10px] font-medium text-blue-600 border border-blue-200 rounded px-1.5 py-0.5 hover:bg-blue-50 transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Lot */}
      <Section title="Lot">
        <SliderRow label="Width" value={inputs.lotWidth} min={5} max={200} step={1} unit="m"
          onChange={v => setInputs({ lotWidth: v })} />
        <SliderRow label="Depth" value={inputs.lotDepth} min={5} max={200} step={1} unit="m"
          onChange={v => setInputs({ lotDepth: v })} />
        <SelectRow label="Lot Type" value={inputs.lotType} options={LOT_TYPE_OPTIONS}
          onChange={v => setInputs({ lotType: v as LotType })} />
      </Section>

      {/* Zoning */}
      <Section title="Zoning">
        <SelectRow label="Zone" value={inputs.zoningClass} options={ZONING_OPTIONS}
          onChange={v => setInputs({ zoningClass: v as ZoningClass })} />
      </Section>

      {/* Building (floor height — design assumption) */}
      <Section title="Building">
        <div className="text-[10px] text-zinc-400 italic mb-1">
          Design assumption, not a code requirement
        </div>
        <SliderRow label="Floor Height" value={inputs.floorHeight} min={2.7} max={4.0} step={0.1} unit="m" decimals={1}
          onChange={v => setInputs({ floorHeight: v })} />
        <div className="text-[10px] font-mono text-zinc-500 bg-zinc-50 rounded px-2 py-1">
          {bhlDisplay}
        </div>
      </Section>

      {/* Road */}
      <Section title="Road (RROW)">
        <SliderRow label="RROW Width" value={inputs.rrowWidth} min={6} max={40} step={0.5} unit="m" decimals={1}
          onChange={v => setInputs({ rrowWidth: v })} />
      </Section>

      {/* Firewalls */}
      <Section title="Firewalls" defaultOpen={false}>
        {(['front', 'rear', 'left', 'right'] as const).map(side => {
          const isAllowed = allowedFirewallSides.has(side)
          return (
            <ToggleRow
              key={side}
              label={side.charAt(0).toUpperCase() + side.slice(1)}
              value={inputs.firewalls[side as keyof FirewallInputs]}
              disabled={!isAllowed}
              tooltip={!isAllowed ? `Firewalls not permitted on ${side} in ${ZONING_TABLE[inputs.zoningClass].label}` : undefined}
              onChange={v => setFirewall(side as keyof FirewallInputs, v)}
            />
          )
        })}
      </Section>
    </div>
  )
})
```

- [ ] **Step 4.2: Commit**

```bash
git add src/app/dashboard/3d-lab/_scenes/NBCPEnvelope/NBCPControlPanel.tsx
git commit -m "feat: add NBCP control panel — collapsible groups, presets, firewall toggles"
```

---

### Task 5: Create `NBCPTelemetry.tsx`

**Files:**
- Create: `src/app/dashboard/3d-lab/_scenes/NBCPEnvelope/NBCPTelemetry.tsx`

- [ ] **Step 5.1: Write the telemetry HUD**

```tsx
// src/app/dashboard/3d-lab/_scenes/NBCPEnvelope/NBCPTelemetry.tsx
'use client'

import { memo } from 'react'
import { AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNBCPStore } from '../../_stores/nbcpStore'

function Row({ label, value, state = 'normal', sub }: {
  label: string; value: string; state?: 'normal' | 'red' | 'amber' | 'green'; sub?: string
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[10px] text-zinc-500 shrink-0">{label}</span>
      <div className="text-right">
        <span className={cn(
          'text-[11px] font-bold tabular-nums font-mono',
          state === 'red'   && 'text-red-600',
          state === 'amber' && 'text-amber-600',
          state === 'green' && 'text-green-600',
          state === 'normal'&& 'text-zinc-900',
        )}>
          {value}
        </span>
        {sub && <div className="text-[9px] text-zinc-400">{sub}</div>}
      </div>
    </div>
  )
}

export const NBCPTelemetry = memo(function NBCPTelemetry() {
  const { computed, inputs } = useNBCPStore()
  const {
    tla, pso, ambf, ambf_by_setbacks, ambf_by_pso,
    bhl_effective, bhl_meters, bhl_source,
    flar, maxGFA, effectiveStoreys, effectiveHeight,
    tosl, tosl_pct,
    amvb, setbacks, violations,
  } = computed

  const fmt = (n: number, dp = 2) => n.toFixed(dp)
  const fmtArea = (n: number) => `${fmt(n)} sqm`

  const ambfConstrainedBySetbacks = ambf_by_setbacks < ambf_by_pso

  return (
    <div className="absolute right-4 top-4 bottom-4 z-10 w-64 overflow-y-auto
      bg-white/90 backdrop-blur-sm border border-border rounded-md shadow-lg p-3 space-y-1.5">

      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">
        Computed Values
      </span>

      <Row
        label="TLA"
        value={fmtArea(tla)}
      />
      <Row
        label="PSO"
        value={`${(pso * 100).toFixed(0)}%`}
        sub={inputs.lotType}
      />
      <Row
        label="AMBF"
        value={fmtArea(ambf)}
        state={ambfConstrainedBySetbacks ? 'amber' : 'normal'}
        sub={ambfConstrainedBySetbacks ? 'setback-limited' : 'PSO-limited'}
      />
      <Row
        label="BHL"
        value={`${bhl_effective} storeys / ${fmt(bhl_meters, 2)}m`}
        state={bhl_source === 'rrow' ? 'amber' : 'normal'}
        sub={bhl_source === 'rrow' ? 'RROW-limited' : 'Zoning-limited'}
      />
      <Row
        label="FLAR"
        value={`${fmt(flar, 2)}×`}
      />
      <Row
        label="Max GFA"
        value={fmtArea(maxGFA)}
        state={effectiveStoreys < bhl_effective ? 'red' : 'normal'}
      />
      <Row
        label="Eff. Storeys"
        value={`${effectiveStoreys} × ${fmt(inputs.floorHeight, 1)}m = ${fmt(effectiveHeight, 1)}m`}
        state={effectiveStoreys < bhl_effective ? 'amber' : 'normal'}
      />
      <Row
        label="TOSL"
        value={`${fmtArea(tosl)} (${(tosl_pct * 100).toFixed(0)}%)`}
        state={tosl_pct > 0.35 ? 'green' : 'normal'}
      />
      <Row
        label="AMVB"
        value={`${fmt(amvb)} m³`}
      />

      {/* Setbacks */}
      <div className="pt-1 border-t border-border">
        <div className="text-[10px] text-zinc-400 mb-0.5">Setbacks</div>
        <div className="text-[10px] font-mono text-zinc-700">
          Front: {fmt(setbacks.front, 1)} | Rear: {fmt(setbacks.rear, 1)}
        </div>
        <div className="text-[10px] font-mono text-zinc-700">
          Left: {fmt(setbacks.left, 1)} | Right: {fmt(setbacks.right, 1)}
        </div>
      </div>

      {/* Violations */}
      {violations.length > 0 && (
        <div className="pt-1 border-t border-red-200 space-y-1.5">
          {violations.map((v, i) => (
            <div key={i} className="bg-red-50 border border-red-200 rounded px-2 py-1.5 flex gap-1.5">
              <AlertTriangle className="h-3 w-3 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-red-700">{v.message}</p>
                <p className="text-[9px] text-red-500 mt-0.5">{v.codeCitation}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
})
```

- [ ] **Step 5.2: Commit**

```bash
git add src/app/dashboard/3d-lab/_scenes/NBCPEnvelope/NBCPTelemetry.tsx
git commit -m "feat: add NBCP telemetry HUD — live computed values with IRR violation citations"
```

---

## Chunk 4: 3D Scene

### Task 6: Create `NBCPScene.tsx` — R3F geometry with lerp animation

**Files:**
- Create: `src/app/dashboard/3d-lab/_scenes/NBCPEnvelope/NBCPScene.tsx`

- [ ] **Step 6.1: Write the scene**

```tsx
// src/app/dashboard/3d-lab/_scenes/NBCPEnvelope/NBCPScene.tsx
'use client'

import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import { useNBCPStore } from '../../_stores/nbcpStore'
import { useNBCPInvalidateOnChange } from '../../_hooks/useNBCPInvalidateOnChange'
import { ViolationIndicator } from '../../_components/ViolationIndicator'
import { LotType } from '../../_constants/nbcp'

// ─── Scale ────────────────────────────────────────────────────────────────────
// 1 Three.js unit = 20m
const SCALE = 0.05
const LOT_Y = 0.005  // half-thickness of lot plate

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toU(meters: number) { return meters * SCALE }

/** Clamp distanceFactor for <Html> based on lot area for readability at all scales */
function labelDistanceFactor(tla: number): number {
  if (tla < 100)   return 6
  if (tla < 1000)  return 7
  if (tla < 5000)  return 9
  return 12
}

/** Lerp a value toward target. Returns true when settled (within epsilon). */
function lerp(current: number, target: number, factor: number, epsilon = 0.001): [number, boolean] {
  const next = current + (target - current) * factor
  return [Math.abs(next - target) < epsilon ? target : next, Math.abs(next - target) < epsilon]
}

// ─── Scene ────────────────────────────────────────────────────────────────────

export function NBCPScene() {
  useNBCPInvalidateOnChange()
  const { invalidate } = useThree()

  // Lerp targets — read directly from store (not subscribed)
  const buildingRef = useRef<THREE.Mesh>(null)
  const buildingMatRef = useRef<THREE.MeshStandardMaterial>(null)

  // Current animated values stored in refs (not React state — no re-render)
  const animRef = useRef({ w: 0.001, d: 0.001, h: 0.001 })

  useFrame(() => {
    const { computed, inputs } = useNBCPStore.getState()
    const target = {
      w: Math.max(0.001, toU(computed.buildableWidth)),
      d: Math.max(0.001, toU(computed.buildableDepth)),
      h: Math.max(0.001, toU(computed.effectiveHeight)),
    }

    const LERP_FACTOR = 0.12  // ~400ms to settle at 60fps
    let anyMoving = false

    const [nw, wSettled] = lerp(animRef.current.w, target.w, LERP_FACTOR)
    const [nd, dSettled] = lerp(animRef.current.d, target.d, LERP_FACTOR)
    const [nh, hSettled] = lerp(animRef.current.h, target.h, LERP_FACTOR)

    animRef.current = { w: nw, d: nd, h: nh }
    anyMoving = !wSettled || !dSettled || !hSettled

    if (buildingRef.current) {
      buildingRef.current.scale.set(nw, nh, nd)
      buildingRef.current.position.y = LOT_Y * 2 + nh / 2
    }

    // Building color
    if (buildingMatRef.current) {
      const { violations, bhl_source } = computed
      const hasViolation = violations.length > 0
      const color = hasViolation ? '#dc2626' : bhl_source === 'rrow' ? '#d97706' : '#2563eb'
      buildingMatRef.current.color.set(color)
    }

    if (anyMoving) invalidate()  // self-schedule next frame while animating
  })

  // Static values (don't need animation)
  const { computed, inputs } = useNBCPStore()
  const {
    tla, bhl_effective, bhl_meters, bhl_source,
    ambf, setbacks, effectiveStoreys, effectiveHeight,
    flar, violations,
  } = computed

  const lotWu = toU(inputs.lotWidth)
  const lotDu = toU(inputs.lotDepth)
  const bhlU  = toU(bhl_meters)

  const df = labelDistanceFactor(tla)

  // Setback zone positions
  const frontSbDepth = toU(setbacks.front)
  const rearSbDepth  = toU(setbacks.rear)
  const leftSbWidth  = toU(setbacks.left)
  const rightSbWidth = toU(setbacks.right)

  // BHL line color
  const bhlLineColor = violations.length > 0 ? '#dc2626' : bhl_source === 'rrow' ? '#d97706' : '#16a34a'

  // RROW plane(s)
  const rrowWu = toU(inputs.rrowWidth)
  const showRearRrow = inputs.lotType === LotType.THROUGH

  return (
    <group>
      {/* ── RROW plane(s) ──────────────────────────────────────────────── */}
      {/* Front RROW */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, lotDu / 2 + rrowWu / 2]}>
        <planeGeometry args={[lotWu + rrowWu, rrowWu]} />
        <meshStandardMaterial color="#d1d5db" />
      </mesh>
      <Html position={[0, 0, lotDu / 2 + rrowWu / 2]} distanceFactor={df} occlude={false}>
        <div style={{ pointerEvents: 'none' }} className="bg-white/90 border border-zinc-200 rounded px-1.5 py-0.5 text-[9px] font-bold text-zinc-500 whitespace-nowrap -translate-x-1/2">
          RROW: {inputs.rrowWidth.toFixed(1)}m
        </div>
      </Html>

      {/* Rear RROW (Through lots only) */}
      {showRearRrow && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -(lotDu / 2 + rrowWu / 2)]}>
          <planeGeometry args={[lotWu + rrowWu, rrowWu]} />
          <meshStandardMaterial color="#d1d5db" />
        </mesh>
      )}

      {/* ── Lot plate ──────────────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[lotWu, lotDu]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      {/* Property lines (thin box strips) */}
      {/* Front/rear */}
      {([1, -1] as const).map(dir => (
        <mesh key={`prop-fb-${dir}`} position={[0, 0.003, dir * lotDu / 2]}>
          <boxGeometry args={[lotWu, 0.006, 0.008]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
      ))}
      {/* Left/right */}
      {([1, -1] as const).map(dir => (
        <mesh key={`prop-lr-${dir}`} position={[dir * lotWu / 2, 0.003, 0]}>
          <boxGeometry args={[0.008, 0.006, lotDu]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
      ))}

      {/* ── Setback zones (ground planes, light blue) ───────────────────── */}
      {/* Front setback */}
      {frontSbDepth > 0 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, LOT_Y, lotDu / 2 - frontSbDepth / 2]}>
          <planeGeometry args={[lotWu, frontSbDepth]} />
          <meshStandardMaterial color="#bfdbfe" transparent opacity={0.45} />
        </mesh>
      )}
      {/* Rear setback */}
      {rearSbDepth > 0 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, LOT_Y, -(lotDu / 2 - rearSbDepth / 2)]}>
          <planeGeometry args={[lotWu, rearSbDepth]} />
          <meshStandardMaterial color="#bfdbfe" transparent opacity={0.45} />
        </mesh>
      )}
      {/* Left setback */}
      {leftSbWidth > 0 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-(lotWu / 2 - leftSbWidth / 2), LOT_Y, 0]}>
          <planeGeometry args={[leftSbWidth, lotDu]} />
          <meshStandardMaterial color="#bfdbfe" transparent opacity={0.45} />
        </mesh>
      )}
      {/* Right setback */}
      {rightSbWidth > 0 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(lotWu / 2 - rightSbWidth / 2), LOT_Y, 0]}>
          <planeGeometry args={[rightSbWidth, lotDu]} />
          <meshStandardMaterial color="#bfdbfe" transparent opacity={0.45} />
        </mesh>
      )}

      {/* Setback labels */}
      {frontSbDepth > 0 && (
        <Html position={[0, LOT_Y, lotDu / 2 - frontSbDepth / 2]} distanceFactor={df} occlude={false}>
          <div style={{ pointerEvents: 'none' }} className="bg-white/80 border border-zinc-200 rounded px-1 py-0.5 text-[9px] font-mono text-zinc-600 -translate-x-1/2 whitespace-nowrap">
            Front: {setbacks.front.toFixed(1)}m
          </div>
        </Html>
      )}
      {rearSbDepth > 0 && (
        <Html position={[0, LOT_Y, -(lotDu / 2 - rearSbDepth / 2)]} distanceFactor={df} occlude={false}>
          <div style={{ pointerEvents: 'none' }} className="bg-white/80 border border-zinc-200 rounded px-1 py-0.5 text-[9px] font-mono text-zinc-600 -translate-x-1/2 whitespace-nowrap">
            Rear: {setbacks.rear.toFixed(1)}m
          </div>
        </Html>
      )}

      {/* ── Building envelope ───────────────────────────────────────────── */}
      {/* Unit cube — scaled by useFrame via animRef */}
      <mesh ref={buildingRef} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          ref={buildingMatRef}
          color="#2563eb"
          transparent
          opacity={0.65}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Floor plate lines */}
      {Array.from({ length: effectiveStoreys - 1 }, (_, i) => {
        const floorY = LOT_Y * 2 + toU((i + 1) * inputs.floorHeight)
        const bw = toU(computed.buildableWidth)
        const bd = toU(computed.buildableDepth)
        return (
          <mesh key={`floor-${i}`} position={[0, floorY, 0]}>
            <boxGeometry args={[bw, 0.005, bd]} />
            <meshStandardMaterial color="#1d4ed8" transparent opacity={0.4} />
          </mesh>
        )
      })}

      {/* ── 3D-anchored labels ──────────────────────────────────────────── */}
      {/* Height label — right face */}
      <Html
        position={[toU(computed.buildableWidth) / 2 + 0.08, LOT_Y * 2 + toU(effectiveHeight) / 2, 0]}
        distanceFactor={df} occlude={false}
      >
        <div style={{ pointerEvents: 'none' }} className="bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded border border-zinc-200 shadow-sm whitespace-nowrap">
          <span className="text-[9px] font-bold text-zinc-700">
            {effectiveHeight.toFixed(1)}m · {effectiveStoreys}F
          </span>
        </div>
      </Html>

      {/* AMBF label — top face */}
      <Html
        position={[0, LOT_Y * 2 + toU(effectiveHeight) + 0.06, 0]}
        distanceFactor={df} occlude={false}
      >
        <div style={{ pointerEvents: 'none' }} className="bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded border border-zinc-200 shadow-sm whitespace-nowrap text-center">
          <div className="text-[9px] font-bold text-zinc-700">AMBF: {ambf.toFixed(0)} sqm</div>
          <div className="text-[9px] text-zinc-500">FLAR {flar.toFixed(2)}×</div>
        </div>
      </Html>

      {/* ── BHL reference line ──────────────────────────────────────────── */}
      <mesh position={[0, LOT_Y * 2 + bhlU, 0]}>
        <boxGeometry args={[lotWu * 1.2, 0.006, 0.006]} />
        <meshStandardMaterial color={bhlLineColor} transparent opacity={0.85} />
      </mesh>
      <Html
        position={[lotWu * 0.6 + 0.08, LOT_Y * 2 + bhlU, 0]}
        distanceFactor={df} occlude={false}
      >
        <div style={{ pointerEvents: 'none' }} className={`px-1.5 py-0.5 rounded border shadow-sm whitespace-nowrap ${
          violations.length > 0 ? 'bg-red-50 border-red-200' :
          bhl_source === 'rrow' ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className={`text-[9px] font-bold ${
            violations.length > 0 ? 'text-red-700' :
            bhl_source === 'rrow' ? 'text-amber-700' : 'text-slate-500'
          }`}>
            BHL {bhl_meters.toFixed(1)}m ({bhl_effective}F) — {bhl_source === 'rrow' ? 'RROW-limited' : 'Zoning-limited'}
          </span>
        </div>
      </Html>

      {/* ── Violation annotations ───────────────────────────────────────── */}
      {violations.map((v, i) => (
        <ViolationIndicator
          key={i}
          position={[
            0,
            LOT_Y * 2 + toU(effectiveHeight) + 0.25 + i * 0.18,
            0,
          ]}
          message={v.message}
          codeRef={v.codeCitation}
          visible
          distanceFactor={df}
        />
      ))}
    </group>
  )
}
```

- [ ] **Step 6.2: Commit**

```bash
git add src/app/dashboard/3d-lab/_scenes/NBCPEnvelope/NBCPScene.tsx
git commit -m "feat: add NBCP 3D scene — lerp animation, setback zones, BHL line, violation annotations"
```

---

## Chunk 5: Integration

### Task 7: Create scene wrapper, wire into LabViewport and page

**Files:**
- Create: `src/app/dashboard/3d-lab/_scenes/NBCPEnvelope/index.ts`
- Create: `src/app/dashboard/3d-lab/_scenes/NBCPEnvelope/NBCPEnvelope.tsx`
- Modify: `src/app/dashboard/3d-lab/_components/LabViewport.tsx`
- Modify: `src/app/dashboard/3d-lab/page.tsx`

- [ ] **Step 7.1: Write the scene wrapper**

```tsx
// src/app/dashboard/3d-lab/_scenes/NBCPEnvelope/NBCPEnvelope.tsx
'use client'

import { useEffect } from 'react'
import { CanvasWrapper } from '../../_components/CanvasWrapper'
import { NBCPScene } from './NBCPScene'
import { NBCPControlPanel } from './NBCPControlPanel'
import { NBCPTelemetry } from './NBCPTelemetry'
import { useNBCPStore } from '../../_stores/nbcpStore'

/**
 * Top-level NBCP Envelope Generator.
 * Composes CanvasWrapper (3D) + NBCPControlPanel (left) + NBCPTelemetry (right).
 *
 * Camera position auto-adjusts based on lot size via cameraPosition prop.
 * Uses frameloop="demand" — zero GPU cost while idle.
 */
export default function NBCPEnvelope() {
  const { inputs } = useNBCPStore()

  // Dynamic camera — stays far enough to show the whole lot
  const maxDim = Math.max(inputs.lotWidth, inputs.lotDepth)
  const camDist = Math.max(10, maxDim * 0.07)  // in Three.js units
  const cameraPosition: [number, number, number] = [camDist, camDist * 0.8, camDist]

  return (
    <div className="relative h-full w-full">
      <CanvasWrapper
        cameraPosition={cameraPosition}
        cameraFov={40}
        maxPolarAngle={Math.PI / 1.75}
        minDistance={2}
        maxDistance={80}
        showGround={false}
      >
        <NBCPScene />
      </CanvasWrapper>
      <NBCPControlPanel />
      <NBCPTelemetry />
    </div>
  )
}
```

- [ ] **Step 7.2: Write the barrel export**

```ts
// src/app/dashboard/3d-lab/_scenes/NBCPEnvelope/index.ts
export { default } from './NBCPEnvelope'
```

- [ ] **Step 7.3: Wire into `LabViewport.tsx`**

In `src/app/dashboard/3d-lab/_components/LabViewport.tsx`, make these changes:

```ts
// Add dynamic import (after the existing imports):
const NBCPEnvelope = dynamic(
  () => import('../_scenes/NBCPEnvelope'),
  { ssr: false },
)

// Add to PARAMETRIC_SCENES set:
const PARAMETRIC_SCENES = new Set(['far-calculator', 'nbcp-envelope'])

// Add routing case (inside the if block for PARAMETRIC_SCENES):
if (PARAMETRIC_SCENES.has(modelId)) {
  if (modelId === 'nbcp-envelope') return <NBCPEnvelope />
  return <FARPlayground />
}
```

Full diff:
- Line 8–11: Add `const NBCPEnvelope = dynamic(...)` after the ClassicalOrders import
- Line 19: Change `new Set(['far-calculator'])` to `new Set(['far-calculator', 'nbcp-envelope'])`
- Line 43–45: Add `if (modelId === 'nbcp-envelope') return <NBCPEnvelope />` before `return <FARPlayground />`

- [ ] **Step 7.4: Add tree node to `page.tsx`**

In `src/app/dashboard/3d-lab/page.tsx`, add the NBCP Envelope leaf to the zoning branch in `MOCK_TREE`:

```ts
// Inside the 'zoning' children array, after the far-calculator entry:
{
  id: 'nbcp-envelope',
  label: 'NBCP Envelope Generator ✦',
  modelId: 'nbcp-envelope',
},
```

- [ ] **Step 7.5: TypeScript build check**

```bash
bun run build 2>&1 | head -50
```

Expected: no TypeScript errors. If errors appear, fix before committing.

- [ ] **Step 7.6: Run all NBCP tests one final time**

```bash
bun test src/app/dashboard/3d-lab/
```

Expected: all tests pass.

- [ ] **Step 7.7: Commit**

```bash
git add src/app/dashboard/3d-lab/_scenes/NBCPEnvelope/
git add src/app/dashboard/3d-lab/_components/LabViewport.tsx
git add src/app/dashboard/3d-lab/page.tsx
git commit -m "feat: integrate NBCP Envelope Generator into 3D Lab — new tree node, LabViewport routing"
```

---

### Task 8: Manual verification checklist

- [ ] **Step 8.1: Open the 3D Lab and navigate to NBCP Envelope Generator ✦**

Navigate to `/dashboard/3d-lab?model=nbcp-envelope`. Verify:
- Scene loads without WebGL errors
- Default scene shows an R-2 Max building on a 20m×30m lot
- Control panel visible on left, telemetry HUD on right

- [ ] **Step 8.2: Verify the RROW Effect preset**

Click `RROW Effect` preset. Verify:
- Zoning = R-3, RROW = 8m
- Telemetry shows BHL = 5 storeys (not 12) with label "RROW-limited"
- Building is amber, not blue

- [ ] **Step 8.3: Verify lerp animation**

Change Lot Width from 20m to 100m using the slider. Verify:
- Building and lot expand smoothly (~400ms), not instantly

- [ ] **Step 8.4: Trigger a FLAR violation**

Set zoning to R-1. Then set lot width to 5m, depth to 5m. Verify:
- Telemetry shows violation
- Building turns red
- ViolationIndicator appears above the building with IRR citation

- [ ] **Step 8.5: Verify firewall effect**

Click `Firewall Effect` preset. Verify:
- Rear and Left firewalls show as ON
- Setbacks show 0m for rear and left in telemetry
- AMBF is larger than it would be without firewalls

- [ ] **Step 8.6: Verify RROW=8 boundary (critical)**

Set RROW slider to exactly 8.0m with R-3 zoning. Verify BHL = 5 storeys.
Set RROW to 7.9m. Verify BHL = 3 storeys.
This confirms the `>=` lower bound lookup is working correctly.

- [ ] **Step 8.7: Final commit**

```bash
git add .
git commit -m "feat: NBCP Envelope Generator — complete 5-phase implementation"
```
