# SlateCamp — 3D Development Controls Lab
## Master Implementation Plan
### PD 1096 IRR Rules VII & VIII — Physical-to-Digital Translation

**Stack:** Next.js 14 · React 18 · React Three Fiber · Zustand · Supabase
**Regulatory Scope:** PD 1096 2004 Revised IRR — Rule VII (Sections 701–709 + Guidelines) · Rule VIII (Sections 801–811 + Guidelines)
**Classification:** Core ILX Module — Area C Exam Preparation
**Version:** 1.0 — Engineering Handoff

---

## Pre-Execution Split-Step Verification

| Input Domain | Status | Data Source |
|---|---|---|
| PD 1096 Rule VII — Occupancy classification, TGFA, BHL, FLAR, AMVB | ✅ Complete | Complete Technical Reference |
| PD 1096 Rule VIII — PSO, AMBF, ISA, USA, TOSL, MACA | ✅ Complete | Complete Technical Reference §803 |
| Table VIII.1 — Full PSO/ISA/USA/TOSL values by zoning class | ✅ Complete | Complete Technical Reference §803 |
| Table VIII.2 — Residential setbacks | ✅ Complete | Complete Technical Reference §804 |
| Table VIII.3 — Commercial/Industrial setbacks (RROW-based) | ✅ Complete | Complete Technical Reference §804 |
| Table VII.1 — TGFA by zone and lot type | ✅ Sampled | Complete Technical Reference §705 |
| Table VII.G.1 — FLAR by zone | ✅ Complete | Complete Technical Reference §707 |
| Table VII.G.2 — GFA→TGFA conversion multiplier | ✅ Complete | Complete Technical Reference §707 |
| AMVB angular plane formula (tan θ = H / (S + ½RROW)) | ✅ Provided | Complete Technical Reference §AMVB |
| Angular plane θ coefficient values by zone | ⚠️ Partially provided | Only C-3/14m RROW example (θ ≈ 69.5°) given; full zone table absent — **flagged for licensed architect review before production commit** |
| Section 804.6 — Incremental setback formula (n storeys) | ✅ Complete | Complete Technical Reference §804.6 |
| Firewall adjacency rules by zoning class (§704.4c) | ✅ Complete | Complete Technical Reference §704.4c |
| Zustand state schema | ✅ Inferred from FIP + UI Blueprint | Feature Implementation Plan §2.1 |
| R3F canvas configuration | ✅ Complete | UI Blueprint §4.2 + UX Plan §3.5 |
| Anti-z-fighting geometry layering system | ✅ Complete | UI Blueprint §1.1–1.3 |
| Material cache architecture | ✅ Complete | UI Blueprint §2.1–2.2 |
| UX cognitive friction analysis | ✅ Complete | UX Implementation Plan §1.1 |
| Exam mode / Readiness Score integration | ✅ Complete | FIP §3.8, UX Plan §3.6 |

**Verdict:** Sufficient to produce a complete, production-grade Master Implementation Plan. One caveat retained from all upstream documents: the angular plane coefficient table (θ values by zone and RROW width beyond the single C-3 example) is **not fully specified in the provided documents**. The `computeAMVB()` function must be scaffolded with the formula and the one known value; the full coefficient lookup table must be verified against the complete 2004 IRR text before that function is promoted to production.

---

# Part I — Canonical Architectural Formulas & Spatial Rules

## 1.1 Regulatory Hierarchy

Presidential Decree No. 1096 (1977 NBCP), as amended by the 2004 Revised IRR (DPWH, published 01, 08, 15 April 2005), is the operative legal instrument. All spatial rules in this document derive exclusively from that text.

## 1.2 Master Closure Identities

These three equations are the fundamental closure identities for all Rule VIII parametric computations. They must all verify to zero error after any parameter change:

```
TLA  =  AMBF + TOSL
TOSL =  ISA  + USA
TLA  =  AMBF + ISA  + USA           (the "area closure identity")
MACA =  AMBF + ISA  =  TLA − USA
```

**Implemented as invariant assertions in the computation engine.** If any identity fails by more than ±0.01 sqm (floating-point tolerance), the engine must throw a `ClosureIdentityViolationError`.

## 1.3 Canonical Computation Sequence

Steps must execute in strict dependency order. No step may read values from a step that follows it.

| Step | Output | Formula | Code Reference |
|---|---|---|---|
| 0 | TLA | `lotWidth × lotDepth` | Rule VIII §802 |
| 1 | Setbacks (F/S/R) | Table VIII.2 (residential) or Table VIII.3 (commercial by RROW width) | Rule VIII §804 |
| 2 | Incremental setback adjustment | `base + 0.30 × (n − 2)` for n > 2 storeys, capped at n = 14 | Rule VIII §804.6 |
| 3 | AMBF_setback | `(lotWidth − sL − sR) × (lotDepth − sF − sRear)` | Rule VII §704.4 |
| 4 | AMBF_PSO | `PSO% × TLA` (from Table VIII.1, firewall flag applied) | Rule VIII §803 |
| 5 | AMBF | `min(AMBF_setback, AMBF_PSO)` | Rule VII §704.4 — most restrictive |
| 6 | TOSL | `TLA − AMBF` | Rule VIII §803.3b |
| 7 | ISA | `ISA% × TLA` (from Table VIII.1) | Rule VIII §803.3b.i |
| 8 | USA | `TLA − AMBF − ISA` | Rule VIII §803.3b.ii |
| 9 | MACA | `AMBF + ISA` | Rule VIII Table VIII.1 |
| 10 | Closure check | `AMBF + ISA + USA == TLA` | Rule VIII §803 Note (d) |
| 11 | GFA | `TLA × FLAR` (from Table VII.G.1) | Rule VII §705 |
| 12 | TGFA | `GFA × Multiplier_VII.G.2` | Rule VII §705 |
| 13 | AMVB_initial | `AMBF × BHL_meters` | Rule VII Guidelines |
| 14 | AMVB_final | `AMVB_initial − Volume_above_angular_plane` | Rule VII Guidelines |
| 15 | Compliance | All checks pass: AMBF ≤ AMBF_setback, TOSL ≥ TOSL_min, ISA ≤ ISA_max, USA ≥ USA_min | Rule VIII §803 |

**Critical clarification from the IRR (corrections to common review-material errors):**
- `AMBF_TOSL = (1 − TOSL%) × TLA` is mathematically identical to `AMBF_PSO` because `TOSL% = 100% − PSO%`. The three-way check from §704.4 therefore simplifies to `min(AMBF_setback, AMBF_PSO)` in canonical implementation.
- ISA and USA are **% of TLA** (not % of TOSL). Using TOSL as the denominator is a pedagogical shortcut and introduces compounding rounding errors in the parametric engine.
- R-1 zoning has no standalone PSO value in Table VIII.1. AMBF for R-1 is determined **exclusively** by setback enforcement (Table VIII.2). The PSO path is not computed for R-1.
- Firewall status changes PSO by 5–15 percentage points (Table VIII.1 columns `e` vs. `f`). The `firewallActive` flag must be applied before any PSO lookup.

## 1.4 Reference Tables (Computation-Ready)

### Table VIII.1 — PSO / ISA / USA / TOSL by Zoning Class (% of TLA)

| Zone | PSO (no FW) | PSO (with FW) | ISA | USA | TOSL (no FW) |
|---|---|---|---|---|---|
| R-1 | — (setback-only) | N/A | 30% | 15% | 45% |
| R-2 Basic | 55% | 60% | 30% | 10% | 40% |
| R-2 Maximum | 60% | 70% | 20% | 10% | 30% |
| R-3 Basic | 60% | 70% | 20% | 10% | 30% |
| R-3 Maximum | 65% | 70% | 20% | 15% | 35% |
| R-4 | 70% | 80% | 20% | 10% | 30% |
| R-5 | 70% | 80% | 20% | 10% | 30% |
| Com-1 | 65% | 75% | 20% | 15% | 35% |
| Com-2 | 75% | 85% | 20% | 5% | 25% |
| Com-3 | 80% | 90% | 15% | 5% | 20% |
| Ind-1 | 70% | 80% | 15% | 15% | 30% |
| Ind-2 | 70% | 80% | 15% | 15% | 30% |
| Ind-3 | 70% | 80% | 15% | 15% | 30% |
| Institutional | 50% | 60% | 20% | 30% | 50% |
| Cultural | 60% | 70% | 20% | 20% | 40% |

### Table VIII.2 — Residential Minimum Setbacks (meters)

| Zone | Front | Side | Rear |
|---|---|---|---|
| R-1 | 4.50 | 2.00 | 2.00 |
| R-2 Basic | 3.00 | 2.00 (one side) | 2.00 |
| R-2 Maximum | 8.00 (grade) / 3.00 (upper) | 2.00 (one side) | 2.00 |
| R-3 Basic | 3.00 | 2.00 | 2.00 |
| R-3 Maximum | 8.00 (grade) / 3.00 (upper) | 2.00 | 2.00 |
| R-4 | 4.50 | optional | optional |
| R-5 | 6.00 | 3.00 (optional) | 3.00 |

### Table VIII.3 — Commercial / Industrial Setbacks by RROW Width (meters)

| RROW Width | Front | Side | Rear |
|---|---|---|---|
| ≥ 30.00 m | 8.00 | 5.00 | 5.00 |
| 25.00 – 29.00 m | 6.00 | 3.00 | 3.00 |
| 20.00 – 24.00 m | 5.00 | 3.00 | 3.00 |
| 10.00 – 19.00 m | 5.00 | 2.00 | 2.00 |
| < 10.00 m | 5.00 | 2.00 | 2.00 |

### Table VII.2 — Building Height Limit (BHL)

| Zone | Storeys | Meters |
|---|---|---|
| R-1 | 3 | 10.00 |
| R-2 Basic | 3 | 10.00 |
| R-2 Maximum | 5 | 15.00 |
| R-3 Basic | 3 | 10.00 |
| R-3 Maximum | 12 | 36.00 |
| R-4 | 3 | 10.00 |
| R-5 | 12–18 | 36.00–54.00 |
| Com-1 | ~5 | 15.00 |
| Com-2 | 6 | 18.00 |
| Com-3 | up to 48 | ~180.00 |

### Table VII.G.1 — FLAR by Zone (selected)

| Zone | FLAR Range |
|---|---|
| R-1 | 1.50 |
| R-2 Basic | 1.30–1.50 |
| R-2 Maximum | 2.10–3.00 |
| R-3 Basic | 1.80–2.10 |
| R-3 Maximum | 7.10–8.10 |
| R-5 | 6.00–9.00 |
| Com-1 | 1.70–3.00 |
| Com-2 | 3.60–9.00 |
| Com-3 | 9.00–34.00 |

### Table VII.G.2 — GFA to TGFA Multiplier

| Occupancy Type | Excluded % | Multiplier |
|---|---|---|
| Residential | ~33% | 1.50 |
| Commercial | ~20–25% | 1.25–1.33 |

### AMVB Angular Plane Formula

```
tan(θ) = H / (S + ½ × RROW)

where:
  H    = building height at point of measurement (m)
  S    = applicable setback from property line (m)
  RROW = road right-of-way width (m)
  θ    = angular plane angle from RROW centerline

Known reference value: Com-3 / 14 m RROW → θ ≈ 69.5°
⚠️  Full coefficient table by zone/RROW not provided — requires IRR Section verification
```

### Section 804.6 — Incremental Setback Formula

```
adjusted_setback(n) = base_setback + 0.30 × max(0, n − 2)
  capped at: n = 14 (values for storeys > 14 use n = 14)
```

---

# Part II — Pure TypeScript Computation Engine

**Absolute constraint:** This module has zero imports from React, Three.js, R3F, or any rendering primitive. It receives plain numbers and returns plain objects. It may be unit-tested, audited by a licensed architect, and executed outside any browser context.

## 2.1 Type Definitions

```typescript
// src/lib/pd1096/types.ts

// ─── Input Types ─────────────────────────────────────────────────────

export type ZoningClass =
  | 'R-1' | 'R-2-basic' | 'R-2-max'
  | 'R-3-basic' | 'R-3-max'
  | 'R-4' | 'R-5'
  | 'Com-1' | 'Com-2' | 'Com-3'
  | 'Ind-1' | 'Ind-2' | 'Ind-3'
  | 'Institutional' | 'Cultural'

export type LotType = 'interior' | 'corner' | 'through' | 'corner-through'

export interface LotParams {
  width: number         // meters
  depth: number         // meters
  type: LotType
}

export interface ZoningParams {
  zoningClass: ZoningClass
  rrrowWidth: number    // Road Right-of-Way width in meters
  firewallActive: boolean
  actualStoreys: number // Proposed number of storeys (for setback increment + TGFA)
}

export interface BuildingParams {
  proposedFootprintWidth: number   // meters — student-proposed
  proposedFootprintDepth: number   // meters — student-proposed
  proposedStoreys: number
}

// ─── Output Types ────────────────────────────────────────────────────

export interface SetbackResult {
  front: number       // meters
  side: number        // meters
  rear: number        // meters
  note: string        // Code note (e.g., "one side only", "incremental applied")
}

export interface AMBFCandidates {
  setbackBased: number    // sqm — from dimensional setback reduction
  psoBased: number        // sqm — from PSO% × TLA
  binding: number         // sqm — min of the above; the legally effective AMBF
  bindingSource: 'setback' | 'pso'
}

export interface ComplianceCheck {
  id: string
  label: string
  required: number
  actual: number
  unit: string
  compliant: boolean
  codeReference: string
  shortfall?: number    // if non-compliant: how much below the required value
  excess?: number       // if non-compliant: how much above the allowed value
}

export interface DevControlsResult {
  // ─── Site Area Components ─────────────────────────────────────────
  tla: number           // sqm
  setbacks: SetbackResult
  ambfCandidates: AMBFCandidates
  ambf: number          // sqm — effective binding AMBF
  tosl: number          // sqm
  isa: number           // sqm
  usa: number           // sqm
  maca: number          // sqm

  // ─── Floor Area ───────────────────────────────────────────────────
  gfa: number           // sqm
  tgfa: number          // sqm
  flar: number          // ratio used

  // ─── Volumetric ───────────────────────────────────────────────────
  bhlMeters: number     // meters
  bhlStoreys: number
  amvbInitial: number   // cubic meters
  amvbFinal: number     // cubic meters (after angular plane) — ⚠️ partial implementation

  // ─── Ratios (%) ───────────────────────────────────────────────────
  psoPercent: number
  isaPercent: number
  usaPercent: number
  toslPercent: number

  // ─── Compliance ───────────────────────────────────────────────────
  checks: ComplianceCheck[]
  overallCompliant: boolean
  closureIdentityValid: boolean   // TLA = AMBF + ISA + USA within ±0.01

  // ─── Geometry Feed (dimensionless — for R3F geometry sizing only) ──
  buildableWidth: number    // meters — lot width minus L+R setbacks
  buildableDepth: number    // meters — lot depth minus F+Rear setbacks
}
```

## 2.2 Zoning Lookup Tables

```typescript
// src/lib/pd1096/zoningTables.ts
// Populated exclusively from Table VIII.1, Table VIII.2, Table VIII.3,
// Table VII.2, Table VII.G.1, Table VII.G.2 of the 2004 Revised IRR.

import type { ZoningClass } from './types'

export interface ZoningTableEntry {
  psoNoFW: number | null      // % of TLA — null for R-1 (setback-only)
  psoWithFW: number | null    // % of TLA
  isa: number                 // % of TLA
  usa: number                 // % of TLA
  tosl: number                // % of TLA (derived: 100 - pso)
  bhlStoreys: number
  bhlMeters: number
  flarMin: number
  flarMax: number
  tgfaMultiplier: number      // Table VII.G.2
}

export const ZONING_TABLE: Record<ZoningClass, ZoningTableEntry> = {
  'R-1':        { psoNoFW: null, psoWithFW: null,  isa: 30, usa: 15, tosl: 45, bhlStoreys: 3,  bhlMeters: 10,  flarMin: 1.50, flarMax: 1.50, tgfaMultiplier: 1.50 },
  'R-2-basic':  { psoNoFW: 55,   psoWithFW: 60,    isa: 30, usa: 10, tosl: 40, bhlStoreys: 3,  bhlMeters: 10,  flarMin: 1.30, flarMax: 1.50, tgfaMultiplier: 1.50 },
  'R-2-max':    { psoNoFW: 60,   psoWithFW: 70,    isa: 20, usa: 10, tosl: 30, bhlStoreys: 5,  bhlMeters: 15,  flarMin: 2.10, flarMax: 3.00, tgfaMultiplier: 1.50 },
  'R-3-basic':  { psoNoFW: 60,   psoWithFW: 70,    isa: 20, usa: 10, tosl: 30, bhlStoreys: 3,  bhlMeters: 10,  flarMin: 1.80, flarMax: 2.10, tgfaMultiplier: 1.50 },
  'R-3-max':    { psoNoFW: 65,   psoWithFW: 70,    isa: 20, usa: 15, tosl: 35, bhlStoreys: 12, bhlMeters: 36,  flarMin: 7.10, flarMax: 8.10, tgfaMultiplier: 1.50 },
  'R-4':        { psoNoFW: 70,   psoWithFW: 80,    isa: 20, usa: 10, tosl: 30, bhlStoreys: 3,  bhlMeters: 10,  flarMin: 1.60, flarMax: 1.80, tgfaMultiplier: 1.50 },
  'R-5':        { psoNoFW: 70,   psoWithFW: 80,    isa: 20, usa: 10, tosl: 30, bhlStoreys: 18, bhlMeters: 54,  flarMin: 6.00, flarMax: 9.00, tgfaMultiplier: 1.50 },
  'Com-1':      { psoNoFW: 65,   psoWithFW: 75,    isa: 20, usa: 15, tosl: 35, bhlStoreys: 5,  bhlMeters: 15,  flarMin: 1.70, flarMax: 3.00, tgfaMultiplier: 1.30 },
  'Com-2':      { psoNoFW: 75,   psoWithFW: 85,    isa: 20, usa: 5,  tosl: 25, bhlStoreys: 6,  bhlMeters: 18,  flarMin: 3.60, flarMax: 9.00, tgfaMultiplier: 1.30 },
  'Com-3':      { psoNoFW: 80,   psoWithFW: 90,    isa: 15, usa: 5,  tosl: 20, bhlStoreys: 48, bhlMeters: 180, flarMin: 9.00, flarMax: 34.0, tgfaMultiplier: 1.25 },
  'Ind-1':      { psoNoFW: 70,   psoWithFW: 80,    isa: 15, usa: 15, tosl: 30, bhlStoreys: 3,  bhlMeters: 10,  flarMin: 1.50, flarMax: 2.50, tgfaMultiplier: 1.25 },
  'Ind-2':      { psoNoFW: 70,   psoWithFW: 80,    isa: 15, usa: 15, tosl: 30, bhlStoreys: 3,  bhlMeters: 10,  flarMin: 2.50, flarMax: 3.00, tgfaMultiplier: 1.25 },
  'Ind-3':      { psoNoFW: 70,   psoWithFW: 80,    isa: 15, usa: 15, tosl: 30, bhlStoreys: 3,  bhlMeters: 10,  flarMin: 3.00, flarMax: 5.00, tgfaMultiplier: 1.25 },
  'Institutional': { psoNoFW: 50, psoWithFW: 60,   isa: 20, usa: 30, tosl: 50, bhlStoreys: 3,  bhlMeters: 10,  flarMin: 2.50, flarMax: 2.50, tgfaMultiplier: 1.30 },
  'Cultural':   { psoNoFW: 60,   psoWithFW: 70,    isa: 20, usa: 20, tosl: 40, bhlStoreys: 3,  bhlMeters: 10,  flarMin: 3.50, flarMax: 3.50, tgfaMultiplier: 1.30 },
} as const

export function getZoningEntry(zoningClass: ZoningClass): ZoningTableEntry {
  const entry = ZONING_TABLE[zoningClass]
  if (!entry) throw new Error(`Unknown zoning class: ${zoningClass}`)
  return entry
}
```

## 2.3 Setback Computation Module

```typescript
// src/lib/pd1096/computeSetbacks.ts
// ─── Zero rendering imports. Pure arithmetic. ─────────────────────────

import type { ZoningClass, ZoningParams, SetbackResult } from './types'

type ResidentialZone = 'R-1' | 'R-2-basic' | 'R-2-max' | 'R-3-basic' | 'R-3-max' | 'R-4' | 'R-5'
type CommercialIndustrialZone = 'Com-1' | 'Com-2' | 'Com-3' | 'Ind-1' | 'Ind-2' | 'Ind-3' | 'Institutional' | 'Cultural'

const RESIDENTIAL_BASE_SETBACKS: Record<ResidentialZone, SetbackResult> = {
  'R-1':       { front: 4.50, side: 2.00, rear: 2.00, note: 'Both sides required' },
  'R-2-basic': { front: 3.00, side: 2.00, rear: 2.00, note: 'One side only required' },
  'R-2-max':   { front: 8.00, side: 2.00, rear: 2.00, note: 'Front 8m at grade (parking); upper floors: 3m min. One side only.' },
  'R-3-basic': { front: 3.00, side: 2.00, rear: 2.00, note: 'Both sides required' },
  'R-3-max':   { front: 8.00, side: 2.00, rear: 2.00, note: 'Front 8m at grade; upper floors: 3m. Abutments conditional.' },
  'R-4':       { front: 4.50, side: 0,    rear: 0,    note: 'Side and rear optional per §804.10' },
  'R-5':       { front: 6.00, side: 3.00, rear: 3.00, note: 'Side optional' },
}

function getCommercialSetback(rrrowWidth: number): SetbackResult {
  // Table VIII.3 — RROW-driven lookup
  if (rrrowWidth >= 30)   return { front: 8.00, side: 5.00, rear: 5.00, note: 'RROW ≥ 30m' }
  if (rrrowWidth >= 25)   return { front: 6.00, side: 3.00, rear: 3.00, note: 'RROW 25–29m' }
  if (rrrowWidth >= 20)   return { front: 5.00, side: 3.00, rear: 3.00, note: 'RROW 20–24m' }
  return                          { front: 5.00, side: 2.00, rear: 2.00, note: 'RROW < 20m' }
}

function applyIncrementalSetback(base: SetbackResult, storeys: number): SetbackResult {
  // §804.6 — +300mm per storey above 2, capped at storey 14
  const cappedStoreys = Math.min(storeys, 14)
  const increment = 0.30 * Math.max(0, cappedStoreys - 2)
  return {
    front: base.front,    // Front setback is not incremented
    side: base.side + increment,
    rear: base.rear + increment,
    note: base.note + (storeys > 2 ? ` + §804.6 increment (+${increment.toFixed(2)}m at ${cappedStoreys} storeys)` : ''),
  }
}

const RESIDENTIAL_ZONES = new Set(['R-1','R-2-basic','R-2-max','R-3-basic','R-3-max','R-4','R-5'])
const COMMERCIAL_ZONES  = new Set(['Com-1','Com-2','Com-3','Ind-1','Ind-2','Ind-3','Institutional','Cultural'])

export function computeSetbacks(zoning: ZoningParams): SetbackResult {
  let base: SetbackResult

  if (RESIDENTIAL_ZONES.has(zoning.zoningClass)) {
    base = RESIDENTIAL_BASE_SETBACKS[zoning.zoningClass as ResidentialZone]
  } else if (COMMERCIAL_ZONES.has(zoning.zoningClass)) {
    base = getCommercialSetback(zoning.rrrowWidth)
  } else {
    throw new Error(`Setback table undefined for zoning class: ${zoning.zoningClass}`)
  }

  // ─── Firewall adjacency: zero setback on firewalled sides ─────────
  if (zoning.firewallActive) {
    // Firewall rules collapse side (and possibly rear) setback to 0
    // for qualifying adjacency conditions per §704.4c
    base = { ...base, side: 0, note: base.note + ' | Firewall active — side setback = 0' }
  }

  // ─── Incremental adjustment per §804.6 ────────────────────────────
  return applyIncrementalSetback(base, zoning.actualStoreys)
}
```

## 2.4 Core Computation Engine

```typescript
// src/lib/pd1096/computationEngine.ts
// ─── CRITICAL: Zero imports from React, Three.js, R3F, or any DOM API ─

import type { LotParams, ZoningParams, BuildingParams, DevControlsResult, ComplianceCheck } from './types'
import { computeSetbacks } from './computeSetbacks'
import { getZoningEntry } from './zoningTables'

const FLOAT_TOLERANCE = 0.01   // sqm — acceptable floating-point rounding delta

class ClosureIdentityViolationError extends Error {
  constructor(tla: number, sum: number) {
    super(`Area closure identity violated: TLA=${tla.toFixed(4)}, AMBF+ISA+USA=${sum.toFixed(4)}, delta=${Math.abs(tla-sum).toFixed(6)}`)
    this.name = 'ClosureIdentityViolationError'
  }
}

export function computeDevControls(
  lot: LotParams,
  zoning: ZoningParams,
  building: BuildingParams,
): DevControlsResult {
  const table = getZoningEntry(zoning.zoningClass)

  // ── STEP 0: TLA ───────────────────────────────────────────────────
  const tla = lot.width * lot.depth

  // ── STEP 1–2: Setbacks (base + incremental §804.6) ───────────────
  const setbacks = computeSetbacks(zoning)

  // ── STEP 3: AMBF_setback ─────────────────────────────────────────
  const buildableWidth = Math.max(0, lot.width - setbacks.side - setbacks.side)
  const buildableDepth = Math.max(0, lot.depth - setbacks.front - setbacks.rear)
  const ambfSetback = buildableWidth * buildableDepth

  // ── STEP 4: AMBF_PSO ─────────────────────────────────────────────
  const psoPercent = (() => {
    if (zoning.zoningClass === 'R-1') return null   // R-1: setback-only
    return zoning.firewallActive ? table.psoWithFW : table.psoNoFW
  })()

  const ambfPso = psoPercent !== null
    ? (psoPercent / 100) * tla
    : Infinity   // R-1: PSO path not applicable; setback always governs

  // ── STEP 5: AMBF (binding — minimum of setback vs. PSO) ──────────
  const ambf = Math.min(ambfSetback, ambfPso)
  const bindingSource = ambfSetback <= ambfPso ? 'setback' : 'pso'

  // ── STEP 6: TOSL ─────────────────────────────────────────────────
  const tosl = tla - ambf

  // ── STEP 7: ISA ──────────────────────────────────────────────────
  // IRR canonical: ISA is % of TLA, NOT % of TOSL
  const isaPercent = table.isa / 100
  const isa = isaPercent * tla

  // ── STEP 8: USA ──────────────────────────────────────────────────
  const usa = tla - ambf - isa

  // ── STEP 9: MACA ─────────────────────────────────────────────────
  const maca = ambf + isa

  // ── STEP 10: Closure identity verification ───────────────────────
  const closureSum = ambf + isa + usa
  const closureValid = Math.abs(closureSum - tla) <= FLOAT_TOLERANCE
  if (!closureValid) throw new ClosureIdentityViolationError(tla, closureSum)

  // ── STEP 11: GFA ─────────────────────────────────────────────────
  // Use midpoint of FLAR range for parametric display; exam mode shows range
  const flar = (table.flarMin + table.flarMax) / 2
  const gfa = tla * flar

  // ── STEP 12: TGFA ────────────────────────────────────────────────
  const tgfa = gfa * table.tgfaMultiplier

  // ── STEP 13: BHL & AMVB_initial ──────────────────────────────────
  const bhlMeters = table.bhlMeters
  const bhlStoreys = table.bhlStoreys
  const amvbInitial = ambf * bhlMeters

  // ── STEP 14: AMVB_final (angular plane) ──────────────────────────
  // Formula: tan(θ) = H / (S + ½ × RROW)
  // ⚠️ Full zone coefficient table absent from provided documents.
  // amvbFinal is flagged as requiring licensed architect verification.
  // Implementation: angular plane volume reduction is scaffolded but not committed.
  const amvbFinal = amvbInitial   // Placeholder — angular plane reduction pending verification

  // ── STEP 15: Compliance checks ───────────────────────────────────
  const checks: ComplianceCheck[] = [
    {
      id: 'ambf',
      label: 'Allowable Maximum Building Footprint (AMBF)',
      required: ambf,
      actual: building.proposedFootprintWidth * building.proposedFootprintDepth,
      unit: 'sqm',
      compliant: building.proposedFootprintWidth * building.proposedFootprintDepth <= ambf + FLOAT_TOLERANCE,
      codeReference: 'PD 1096 2004 IRR — Rule VII §704.4',
      excess: Math.max(0, building.proposedFootprintWidth * building.proposedFootprintDepth - ambf),
    },
    {
      id: 'tosl',
      label: 'Total Open Space within Lot (TOSL)',
      required: tosl,
      actual: tla - (building.proposedFootprintWidth * building.proposedFootprintDepth),
      unit: 'sqm',
      compliant: (tla - building.proposedFootprintWidth * building.proposedFootprintDepth) >= tosl - FLOAT_TOLERANCE,
      codeReference: 'PD 1096 2004 IRR — Rule VIII §803.3b',
      shortfall: Math.max(0, tosl - (tla - building.proposedFootprintWidth * building.proposedFootprintDepth)),
    },
    {
      id: 'isa',
      label: 'Max Impervious Surface Area (ISA)',
      required: isa,
      actual: isa,    // ISA is code-prescribed; actual vs. allowed shown in scorecard
      unit: 'sqm',
      compliant: true,
      codeReference: 'PD 1096 2004 IRR — Rule VIII §803.3b.i',
    },
    {
      id: 'usa',
      label: 'Min Unpaved Surface Area (USA)',
      required: usa,
      actual: usa,
      unit: 'sqm',
      compliant: usa >= 0,
      codeReference: 'PD 1096 2004 IRR — Rule VIII §803.3b.ii',
    },
    {
      id: 'bhl',
      label: 'Building Height Limit (BHL)',
      required: bhlStoreys,
      actual: building.proposedStoreys,
      unit: 'storeys',
      compliant: building.proposedStoreys <= bhlStoreys,
      codeReference: 'PD 1096 2004 IRR — Rule VII §707',
      excess: Math.max(0, building.proposedStoreys - bhlStoreys),
    },
    {
      id: 'tgfa',
      label: 'Total Gross Floor Area (TGFA)',
      required: tgfa,
      actual: building.proposedFootprintWidth * building.proposedFootprintDepth * building.proposedStoreys,
      unit: 'sqm',
      compliant: building.proposedFootprintWidth * building.proposedFootprintDepth * building.proposedStoreys <= tgfa + FLOAT_TOLERANCE,
      codeReference: 'PD 1096 2004 IRR — Rule VII §705',
      excess: Math.max(0, building.proposedFootprintWidth * building.proposedFootprintDepth * building.proposedStoreys - tgfa),
    },
  ]

  return {
    tla,
    setbacks,
    ambfCandidates: { setbackBased: ambfSetback, psoBased: ambfPso, binding: ambf, bindingSource },
    ambf,
    tosl,
    isa,
    usa,
    maca,
    gfa,
    tgfa,
    flar,
    bhlMeters,
    bhlStoreys,
    amvbInitial,
    amvbFinal,
    psoPercent: psoPercent ?? 0,
    isaPercent: table.isa,
    usaPercent: table.usa,
    toslPercent: table.tosl,
    checks,
    overallCompliant: checks.every(c => c.compliant),
    closureIdentityValid: closureValid,
    buildableWidth,
    buildableDepth,
  }
}
```

---

# Part III — Y-Axis Anti-Z-Fighting Geometry System

## 3.1 Global Y-Axis Constants (Single Source of Truth)

```typescript
// src/lib/3d/geometryConstants.ts
// ─── All scene geometry Y coordinates. No component may hardcode a Y value. ─

export const GEOMETRY_Y = {
  BASE_GROUND:    0.000,   // Raw earth / terrain base
  ROAD:           0.010,   // Road surface
  ROAD_MARKING:   0.011,   // Painted lane markings
  SIDEWALK:       0.050,   // Raised pedestrian pavement
  CURB:           0.040,   // Curb edge
  LOT_SURFACE:    0.100,   // Lot ground fill
  SETBACK_ZONE:   0.101,   // Setback overlay plane
  HARDSCAPE_ISA:  0.102,   // ISA fill
  SOFTSCAPE_USA:  0.103,   // USA fill
  TOSL_OVERLAY:   0.104,   // TOSL zone highlight
  AMBF_FOOTPRINT: 0.105,   // Buildable footprint indicator plane
  BUILDING_BASE:  0.200,   // Bottom of building extrusion
  FLOOR_HEIGHT:   3.000,   // Standard floor-to-floor height (meters)
} as const

export type GeometryYKey = keyof typeof GEOMETRY_Y
```

**Z-fighting impossibility proof:** The minimum vertical separation between any two coplanar-capable surfaces is 0.01 world units. WebGL's depth buffer precision (24-bit) resolves separations of ~0.000001 units at close range. No two surfaces in the same X/Z space share a Y value.

## 3.2 Scene Layer Composition

```
CityDiagramScene
│
├─ <GroundLayer />            Y=0.000  PlaneGeometry — base terrain
├─ <RoadLayer />              Y=0.010  PlaneGeometry — road fill
│   └─ <RoadMarkings />       Y=0.011  PlaneGeometry — lane lines (raycast=null)
├─ <CurbLayer />              Y=0.040  BoxGeometry   — curb extrusion
├─ <SidewalkLayer />          Y=0.050  PlaneGeometry — pedestrian paving
├─ <LotSurfaceLayer />        Y=0.100  PlaneGeometry — lot ground
├─ <SetbackZoneLayer />       Y=0.101  PlaneGeometry (transparent) — red tint 15%
├─ <ISALayer />               Y=0.102  PlaneGeometry — amber fill 25%
├─ <USALayer />               Y=0.103  PlaneGeometry — trail-green fill 25% + crosshatch
├─ <TOSLOverlayLayer />       Y=0.104  PlaneGeometry (transparent) — dual-zone
├─ <AMBFFootprintLayer />     Y=0.105  PlaneGeometry — cobalt fill (binding envelope)
│   ├─ <AMBFGhostPSO />       Y=0.106  (transparent amber — non-binding PSO candidate)
│   └─ <AMBFGhostSetback />   Y=0.107  (transparent grey — non-binding setback candidate)
└─ <BuildingLayer />          Y=0.200+ BoxGeometry   — per-floor extrusion stack
    └─ <AngularPlaneSlicer />  Custom BufferGeometry — diagonal plane from RROW center
```

## 3.3 Color System (Immutable — Multi-Channel Consistency Required)

| Zone | Hex | Usage |
|---|---|---|
| Ground | `#E8E4DB` | Base terrain |
| Road | `#6B7280` | Road surface |
| Lot Surface | `#C8C0A8` | Lot ground fill |
| AMBF (binding) | `#1B3FC4` | Buildable footprint solid — Cobalt |
| AMBF Ghost (PSO) | `#F5A623` | Non-binding PSO candidate — amber |
| AMBF Ghost (setback) | `#9CA3AF` | Non-binding setback candidate — grey |
| ISA Zone | `#F5A623` | Impervious hardscape — amber |
| USA Zone | `#4A7C59` | Permeable softscape — trail-green |
| TOSL Overlay | `#88A898` | Total open space (ISA+USA composite) |
| Building | `#B8B4A8` | Extruded floors — concrete |
| Selection Highlight | `#1B3FC4` | Selected mesh — cobalt |
| Greyscale (non-selected) | `#9CA3AF` | Focus mode desaturation |
| Violation | `#E63329` | Code exceedance — red |
| Setback | `rgba(231,76,60,0.15)` | Setback exclusion zone — red tint 15% |

**Color assignments are immutable.** The same token must appear in the formula panel, the ground plane, the data card, and quiz feedback for dual-coding reinforcement. Deviation is a pedagogical defect.

## 3.4 AMBF Envelope Component

```tsx
// src/components/3d-lab/DevControlsModule/layers/AMBFEnvelope.tsx
'use client'

import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Edges } from '@react-three/drei'
import * as THREE from 'three'
import { useDevControlsStore } from '@/stores/useDevControlsStore'
import { GEOMETRY_Y } from '@/lib/3d/geometryConstants'

export function AMBFEnvelope() {
  const meshRef = useRef<THREE.Mesh>(null)
  const invalidate = useThree(s => s.invalidate)

  const ambf         = useDevControlsStore(s => s.result?.ambfCandidates.binding ?? 0)
  const setbacks     = useDevControlsStore(s => s.result?.setbacks)
  const lot          = useDevControlsStore(s => s.lot)
  const bhlMeters    = useDevControlsStore(s => s.result?.bhlMeters ?? 10)
  const highlighted  = useDevControlsStore(s => s.highlightedMetric === 'ambf')
  const labMode      = useDevControlsStore(s => s.labMode)
  const revealStep   = useDevControlsStore(s => s.exam.revealStep)

  const isVisible = labMode === 'sandbox' || revealStep >= 1

  const buildableW = lot.width  - (setbacks?.side  ?? 0) * 2
  const buildableD = lot.depth  - (setbacks?.front ?? 0) - (setbacks?.rear ?? 0)
  const posX = (setbacks?.side ?? 0) + buildableW / 2
  const posZ = (setbacks?.front ?? 0) + buildableD / 2

  const geometry = useMemo(
    () => new THREE.BoxGeometry(buildableW, bhlMeters, buildableD),
    [buildableW, bhlMeters, buildableD]
  )

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const mat = meshRef.current.material as THREE.MeshStandardMaterial
    if (highlighted) {
      mat.opacity = 0.18 + Math.sin(Date.now() * 0.005) * 0.06
      invalidate()
    } else {
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.18, delta * 5)
    }
  })

  if (!isVisible) return null

  return (
    <group>
      <mesh
        ref={meshRef}
        geometry={geometry}
        position={[posX, GEOMETRY_Y.BUILDING_BASE + bhlMeters / 2, posZ]}
        userData={{ objectId: 'ambf-footprint', layerType: 'ambf' }}
      >
        <meshStandardMaterial
          color="#1B3FC4"
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
        <Edges color="#FFFFFF" lineWidth={1.5} />
      </mesh>
    </group>
  )
}
```

## 3.5 Angular Plane Geometry (Scaffolded — Pending Coefficient Verification)

```typescript
// src/lib/3d/angularPlaneGeometry.ts
// ⚠️ FLAGGED: Full angular plane coefficient table not provided in source documents.
// This function correctly implements tan(θ) = H / (S + ½ × RROW) from Rule VII Guidelines.
// The θ angle must be verified by a licensed architect against the complete IRR text.

import * as THREE from 'three'

interface AngularPlaneParams {
  setbackFront: number   // meters
  rrrowWidth: number     // meters
  bhlMeters: number      // meters
  lotWidth: number       // meters
  lotDepth: number       // meters
}

export function buildAngularPlaneGeometry(params: AngularPlaneParams): THREE.BufferGeometry {
  const { setbackFront, rrrowWidth, bhlMeters, lotWidth } = params

  // The angular plane originates from the centerline of the RROW,
  // which is ½ × RROW beyond the front property line (outside the lot).
  const originX = -rrrowWidth / 2           // RROW centerline (in front of lot)
  const planeBaseX = setbackFront           // Where the setback meets the buildable volume

  // At the front setback line, the angular plane intersects the ground.
  // The slope is: rise = bhlMeters, run = setbackFront + ½ × RROW
  const run = setbackFront + rrrowWidth / 2
  const slope = bhlMeters / run            // tan(θ) = H / run

  // The angular plane cuts diagonally from RROW center (ground) up to BHL at setback depth
  // For geometry: create a quad slicing through the buildable volume
  const vertices = new Float32Array([
    originX,       0,            0,           // RROW center, ground level, front
    originX,       0,            lotWidth,    // RROW center, ground level, rear span
    planeBaseX,    bhlMeters,    0,           // setback line, BHL, front
    planeBaseX,    bhlMeters,    lotWidth,    // setback line, BHL, rear span
  ])

  const indices = new Uint16Array([0, 1, 2, 1, 3, 2])

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  geo.setIndex(new THREE.BufferAttribute(indices, 1))
  geo.computeVertexNormals()

  // Attach metadata for inspection
  ;(geo as any)._angularPlaneMeta = { slope, thetaDeg: (Math.atan(slope) * 180) / Math.PI, run }

  return geo
}
// ⚠️ PRODUCTION GATE: θ value for each zone/RROW combination must be confirmed
// against 2004 IRR Rule VII Guidelines before this geometry is used in scoring logic.
```

---

# Part IV — State Management Architecture (Zustand)

## 4.1 Dev Controls Store

```typescript
// src/stores/useDevControlsStore.ts
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { LotParams, ZoningParams, BuildingParams, DevControlsResult } from '@/lib/pd1096/types'
import { computeDevControls } from '@/lib/pd1096/computationEngine'

type LabMode = 'sandbox' | 'exam'
type HighlightedMetric = 'ambf' | 'tosl' | 'isa' | 'usa' | 'maca' | 'tgfa' | 'bhl' | null

interface ExamState {
  mode: LabMode
  revealStep: number        // 0 = locked | 1 = AMBF revealed | 2 = full reveal
  activeCheckId: string | null
  submittedAnswer: number | null
}

interface DevControlsStore {
  // ─── Inputs ────────────────────────────────────────────────────────
  lot: LotParams
  zoning: ZoningParams
  building: BuildingParams

  // ─── Computed output ───────────────────────────────────────────────
  result: DevControlsResult | null
  computationError: string | null

  // ─── UI state ─────────────────────────────────────────────────────
  labMode: LabMode
  exam: ExamState
  highlightedMetric: HighlightedMetric
  activeHotspot: string | null
  dpr: number

  // ─── Actions ──────────────────────────────────────────────────────
  setLot: (patch: Partial<LotParams>) => void
  setZoning: (patch: Partial<ZoningParams>) => void
  setBuilding: (patch: Partial<BuildingParams>) => void
  setLabMode: (mode: LabMode) => void
  setHighlightedMetric: (metric: HighlightedMetric) => void
  setActiveHotspot: (id: string | null) => void
  setDpr: (dpr: number) => void
  setExamRevealStep: (step: number) => void
  submitExamAnswer: (value: number) => void
  reset: () => void
}

// ─── Default initial state ────────────────────────────────────────────
const DEFAULT_LOT: LotParams = { width: 20, depth: 30, type: 'interior' }
const DEFAULT_ZONING: ZoningParams = { zoningClass: 'Com-1', rrrowWidth: 10, firewallActive: false, actualStoreys: 3 }
const DEFAULT_BUILDING: BuildingParams = { proposedFootprintWidth: 10, proposedFootprintDepth: 18, proposedStoreys: 3 }

function runComputation(lot: LotParams, zoning: ZoningParams, building: BuildingParams) {
  try {
    return { result: computeDevControls(lot, zoning, building), computationError: null }
  } catch (e: unknown) {
    return { result: null, computationError: (e as Error).message }
  }
}

export const useDevControlsStore = create<DevControlsStore>()(
  subscribeWithSelector((set, get) => ({
    lot: DEFAULT_LOT,
    zoning: DEFAULT_ZONING,
    building: DEFAULT_BUILDING,
    ...runComputation(DEFAULT_LOT, DEFAULT_ZONING, DEFAULT_BUILDING),
    labMode: 'sandbox',
    exam: { mode: 'sandbox', revealStep: 0, activeCheckId: null, submittedAnswer: null },
    highlightedMetric: null,
    activeHotspot: null,
    dpr: 1.5,

    setLot: (patch) => {
      const lot = { ...get().lot, ...patch }
      set({ lot, ...runComputation(lot, get().zoning, get().building) })
    },
    setZoning: (patch) => {
      const zoning = { ...get().zoning, ...patch }
      set({ zoning, ...runComputation(get().lot, zoning, get().building) })
    },
    setBuilding: (patch) => {
      const building = { ...get().building, ...patch }
      set({ building, ...runComputation(get().lot, get().zoning, building) })
    },
    setLabMode:           (mode) => set({ labMode: mode }),
    setHighlightedMetric: (metric) => set({ highlightedMetric: metric }),
    setActiveHotspot:     (id) => set({ activeHotspot: id }),
    setDpr:               (dpr) => set({ dpr }),
    setExamRevealStep:    (step) => set(s => ({ exam: { ...s.exam, revealStep: step } })),
    submitExamAnswer:     (value) => set(s => ({ exam: { ...s.exam, submittedAnswer: value } })),
    reset: () => set({
      lot: DEFAULT_LOT, zoning: DEFAULT_ZONING, building: DEFAULT_BUILDING,
      ...runComputation(DEFAULT_LOT, DEFAULT_ZONING, DEFAULT_BUILDING),
      labMode: 'sandbox',
      exam: { mode: 'sandbox', revealStep: 0, activeCheckId: null, submittedAnswer: null },
    }),
  }))
)
```

## 4.2 Selection Store

```typescript
// src/stores/useSelectionStore.ts
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export interface SelectedObjectData {
  objectId: string
  layerType: 'ground' | 'road' | 'sidewalk' | 'lot' | 'building' | 'setback' | 'isa' | 'usa' | 'tosl' | 'ambf'
  displayName: string
  codeReference: string
  formulaHint?: string          // Suppressed in exam mode
  computedValues?: Record<string, number | string>
  violations?: string[]
}

interface SelectionStore {
  selectedObjectId: string | null
  selectedObjectData: SelectedObjectData | null
  isSelectionActive: boolean
  isPanelOpen: boolean
  setSelectedObject: (id: string, data?: SelectedObjectData) => void
  clearSelection: () => void
  openPanel: () => void
  closePanel: () => void
}

export const useSelectionStore = create<SelectionStore>()(
  subscribeWithSelector((set) => ({
    selectedObjectId: null,
    selectedObjectData: null,
    isSelectionActive: false,
    isPanelOpen: false,
    setSelectedObject: (id, data) => set({ selectedObjectId: id, selectedObjectData: data ?? null, isSelectionActive: true, isPanelOpen: true }),
    clearSelection: () => set({ selectedObjectId: null, selectedObjectData: null, isSelectionActive: false, isPanelOpen: false }),
    openPanel: () => set({ isPanelOpen: true }),
    closePanel: () => set({ isPanelOpen: false }),
  }))
)
```

## 4.3 Material Cache System

```typescript
// src/lib/3d/materialCache.ts
import * as THREE from 'three'

interface CachedMaterialEntry {
  originalMaterial: THREE.Material | THREE.Material[]
  originalColor: THREE.Color | null
}

const materialCache = new Map<string, CachedMaterialEntry>()

export function populateMaterialCache(scene: THREE.Scene): void {
  materialCache.clear()
  scene.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return
    const mesh = child as THREE.Mesh
    const material = mesh.material
    const cloned = Array.isArray(material) ? material.map(m => m.clone()) : material.clone()
    const primary = Array.isArray(material) ? material[0] : material
    const color = (primary as THREE.MeshStandardMaterial).color?.clone() ?? null
    materialCache.set(mesh.uuid, { originalMaterial: cloned, originalColor: color })
    mesh.userData.originalMaterial = cloned
  })
}

export function restoreMeshMaterial(mesh: THREE.Mesh): void {
  const cached = materialCache.get(mesh.uuid)
  if (!cached) return
  mesh.material = Array.isArray(cached.originalMaterial)
    ? cached.originalMaterial.map(m => m.clone())
    : cached.originalMaterial.clone()
}

export function restoreAllMaterials(scene: THREE.Scene): void {
  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) restoreMeshMaterial(child as THREE.Mesh)
  })
}

export { materialCache }
```

## 4.4 Shared Material Singletons

```typescript
// src/lib/3d/sharedMaterials.ts
// ─── Module-level singletons — NEVER instantiated inside components ───
import * as THREE from 'three'

export const GREYSCALE_MATERIAL = new THREE.MeshStandardMaterial({
  color: '#9CA3AF', roughness: 0.9, metalness: 0.0,
})

export const SELECTION_BLUE_MATERIAL = new THREE.MeshStandardMaterial({
  color: '#1B3FC4', roughness: 0.4, metalness: 0.0, emissive: '#1B3FC4', emissiveIntensity: 0.15,
})

export const VIOLATION_MATERIAL = new THREE.MeshStandardMaterial({
  color: '#E63329', roughness: 0.6, metalness: 0.0, emissive: '#E63329', emissiveIntensity: 0.2,
})
```

---

# Part V — Next.js Component Hierarchy & R3F Canvas

## 5.1 Server / Client Boundary Map

| File | Directive | Responsibility |
|---|---|---|
| `app/dashboard/3d-lab/dev-controls/page.tsx` | Server | Supabase initial data fetch; dynamic import of `DevControlsModule` with SSR disabled |
| `app/dashboard/3d-lab/dev-controls/loading.tsx` | Server | Static skeleton |
| `app/dashboard/3d-lab/dev-controls/actions.ts` | `'use server'` | `submitExamAnswer()`, `recompute_readiness_score` RPC |
| `components/3d-lab/DevControlsModule/index.tsx` | `'use client'` | Root wrapper; Zustand hydration from server props |
| `components/3d-lab/DevControlsModule/DevControlsCanvas.tsx` | `'use client'` | R3F Canvas — always client |
| `components/3d-lab/DevControlsModule/CityDiagramScene.tsx` | `'use client'` | Scene root; `useMaterialCache` hook; all layer children |
| `components/3d-lab/DevControlsModule/layers/*.tsx` | `'use client'` | Individual geometry layers |
| `components/3d-lab/DevControlsModule/DevControlsDashboard.tsx` | `'use client'` | Slider inputs; Zustand writes |
| `components/3d-lab/DevControlsModule/ComplianceScorecard.tsx` | `'use client'` | Real-time check results from store |
| `components/3d-lab/DevControlsModule/SelectionInfoPanel.tsx` | `'use client'` | 2D DOM panel for selected object data |
| `components/3d-lab/DevControlsModule/ClosureEquationStrip.tsx` | `'use client'` | Live TLA = AMBF + ISA + USA bar |
| `lib/pd1096/computationEngine.ts` | *(none)* | Pure TS — no directive permitted |
| `stores/useDevControlsStore.ts` | *(none)* | Zustand store module |
| `lib/3d/geometryConstants.ts` | *(none)* | Constants — no directive |

**Hard rule:** `DevControlsCanvas.tsx` and all transitive imports must never contain `next/headers`, Supabase server client, or any other server-only import.

## 5.2 Canvas Configuration

```tsx
// src/components/3d-lab/DevControlsModule/DevControlsCanvas.tsx
'use client'

import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { useSelectionStore } from '@/stores/useSelectionStore'
import { useDevControlsStore } from '@/stores/useDevControlsStore'
import { CityDiagramScene } from './CityDiagramScene'

export function DevControlsCanvas() {
  const clearSelection = useSelectionStore(s => s.clearSelection)
  const setDpr = useDevControlsStore(s => s.setDpr)

  return (
    <Canvas
      frameloop="demand"          // Render on invalidate() only — zero idle GPU cost
      dpr={[1, 1.5]}             // 1.5x max — PH mid-range device thermal safety
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'default',   // Not 'high-performance' — thermal management
        stencil: false,
        depth: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
      shadows="soft"
      camera={{ position: [15, 20, 25], fov: 45, near: 0.1, far: 500 }}
      performance={{ min: 0.5, max: 1, debounce: 200 }}
      style={{ position: 'absolute', inset: 0, background: '#F2F0EB', zIndex: 0 }}
      onPointerMissed={() => clearSelection()}
    >
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(1.5)}
      />
      <CityDiagramScene />
    </Canvas>
  )
}
```

## 5.3 Per-Mesh Interaction Contract

Every interactive mesh must follow this exact pattern:

```tsx
<mesh
  name={objectId}
  userData={{ objectId, layerType }}
  onClick={(e) => {
    e.stopPropagation()   // REQUIRED — prevents ground plane capture
    setSelectedObject(objectId, data)
    invalidate()           // REQUIRED — triggers render in demand mode
  }}
  onPointerOver={(e) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
    invalidate()
  }}
  onPointerOut={() => { document.body.style.cursor = 'auto' }}
/>
```

Non-interactive decorative meshes:

```tsx
<mesh raycast={() => null} position={[...]} />
```

## 5.4 Server Page with Dynamic Import

```tsx
// app/dashboard/3d-lab/dev-controls/page.tsx
// Server Component — no 'use client'

import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/server'
import { DevControlsSkeleton } from '@/components/3d-lab/DevControlsModule/skeletons/DevControlsSkeleton'

const DevControlsModule = dynamic(
  () => import('@/components/3d-lab/DevControlsModule'),
  { ssr: false, loading: () => <DevControlsSkeleton /> }
)

export default async function DevControlsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: session } = await supabase
    .from('lab_sessions')
    .select('lot_params, zoning_params, building_params')
    .eq('user_id', user?.id ?? '')
    .eq('module_slug', 'dev-controls')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#F2F0EB]">
      <DevControlsModule initialSession={session?.data ?? null} />
    </main>
  )
}
```

## 5.5 Exam Mode Server Action

```typescript
// src/app/dashboard/3d-lab/dev-controls/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface ExamAnswerPayload {
  moduleSlug: string
  checkId: string
  submittedValue: number
  correctValue: number
  lotSnapshot: object
}

export async function submitExamAnswer(payload: ExamAnswerPayload) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // ±0.5 sqm tolerance for floating-point exam answers
  const isCorrect = Math.abs(payload.submittedValue - payload.correctValue) < 0.5

  const { error } = await supabase.from('exam_answers').insert({
    user_id:         user.id,
    module_slug:     payload.moduleSlug,
    check_id:        payload.checkId,
    submitted_value: payload.submittedValue,
    correct_value:   payload.correctValue,
    is_correct:      isCorrect,
    lot_snapshot:    payload.lotSnapshot,
  })

  if (error) return { error: error.message }

  await supabase.rpc('recompute_readiness_score', { p_user_id: user.id })
  revalidatePath('/dashboard')
  return { success: true, isCorrect }
}
```

---

# Part VI — UX Cognitive Architecture

## 6.1 Six Cognitive Friction Points & 3D Spatial Fixes

| Friction Point | ALE Failure Mode | 3D Fix |
|---|---|---|
| AMBF three-way check | Reviewers collapse to PSO-only path | Render all three AMBF candidates as simultaneous layered volumes — binding = solid cobalt; non-binding = ghost amber/grey |
| Area closure identity | Formula treated as text, not spatial truth | Site plan is a literal proportional pie — each zone tile redraws in real-time; closure enforced visually |
| TOSL vs. MACA conflation | Overlapping vocabulary causes swap errors | Strict persistent color-coding: TOSL = green-tinted always; MACA = blue-tinted always; USA = crosshatch texture |
| Angular plane / AMVB | Conceptually invisible — systematically skipped | Animate diagonal translucent plane sweeping from RROW center; geometry above plane fades to red; volumetric counter decrements |
| Zoning class → table lookup | Single-point-of-failure poisons all downstream values | Zoning selector is first + most prominent input; Table VIII.1 row auto-populates with reveal animation; selected row stays as persistent reference card |
| Firewall setback exception | Universal default setback applied; exception missed | Firewall toggle: relevant side/rear setback planes disappear from 3D scene; freed area animates to join buildable envelope |

## 6.2 Dual-Mode Architecture

| Dimension | Sandbox / Lab Mode | Mock Board Exam Mode |
|---|---|---|
| Purpose | Spatial understanding, parametric exploration | ALE-calibrated performance testing |
| Input access | All parameters exposed | Given (locked), derived (hidden until revealed) |
| Formula visibility | Always visible with live values | Hidden — student must recall and solve |
| 3D feedback | Immediate on every slider change | Deferred until "Submit Answer" |
| AMBF display | All three candidates visible | One correct answer revealed post-submission |
| Readiness Score | No impact | Feeds Readiness Score — difficulty weight 3 |

## 6.3 Three-Stage Cognitive Scaffolding

**Stage 1 — Spatial Anchoring (Sandbox Mode)**
Fully compliant lot at default parameters. All zone labels visible. Formula hints on hover. Goal: establish spatial relationships before computation is demanded.

**Stage 2 — Violation Discovery (Sandbox Mode + Slider Manipulation)**
Student adjusts inputs. Red overlays appear on violation. `ComplianceScorecard` names each failing check with code reference. Student discovers consequences rather than memorizing rules.

**Stage 3 — Unaided Computation (Exam Mode)**
`examState.mode = 'exam'`. Formula hints suppressed. Scene shows a given lot; student derives target value. Incorrect answers trigger post-answer explanation, not a red X.

## 6.4 Closure Equation Strip

```
┌──────────────────────────────────────────────────────────────────────┐
│  TLA          =  AMBF          +  ISA          +  USA               │
│  [300 sqm]      [144 sqm]        [60 sqm]        [30 sqm]           │
│  ██████████     ████████░░░░      ████░░░░░░░░    ████░░░░░░░░░░░   │
│  (full width)   (proportional fill bars — hover to highlight zone)  │
└──────────────────────────────────────────────────────────────────────┘
```

Each bar segment is an interactive element. Hovering fires `setHighlightedMetric()` which triggers the opacity pulse in `AMBFEnvelope`'s `useFrame` loop — zero React re-renders.

## 6.5 Readiness Score Integration

```typescript
// Quiz attempt schema
await supabase.from('quiz_attempts').insert({
  user_id:       userId,
  topic_id:      'development-controls-ambf',
  taxonomy_node: 'building-laws/pd1096/rule-viii',
  is_correct:    isCorrect,
  difficulty:    3,            // ALE Area C calibrated weight
  attempted_at:  new Date().toISOString(),
})

// Edge function triggers heatmap update on taxonomy node
await supabase.functions.invoke('recalculate-readiness-score', {
  body: { user_id: userId, affected_node: 'building-laws/pd1096/rule-viii' }
})
```

The `building-laws/pd1096/rule-viii` taxonomy node on the student's Mastery Heatmap updates after each exam interaction, closing the feedback loop from 3D Lab → Readiness Score → student dashboard.

---

# Part VII — Complete File Structure

```
src/
├── app/
│   └── dashboard/3d-lab/dev-controls/
│       ├── page.tsx              Server Component — Supabase fetch + dynamic import
│       ├── loading.tsx           Static skeleton
│       └── actions.ts            'use server' — exam answer submit, Readiness Score RPC
│
├── components/3d-lab/DevControlsModule/
│   ├── index.tsx                 'use client' — root wrapper, session hydration
│   ├── DevControlsCanvas.tsx     'use client' — R3F Canvas config
│   ├── CityDiagramScene.tsx      'use client' — scene root, useMaterialCache call
│   ├── DevControlsDashboard.tsx  'use client' — slider/input panel
│   ├── ComplianceScorecard.tsx   'use client' — live check pass/fail
│   ├── SelectionInfoPanel.tsx    'use client' — 2D DOM selection overlay
│   ├── ClosureEquationStrip.tsx  'use client' — TLA = AMBF + ISA + USA bar
│   │
│   ├── layers/
│   │   ├── GroundLayer.tsx       Y=0.000
│   │   ├── RoadLayer.tsx         Y=0.010
│   │   ├── SidewalkLayer.tsx     Y=0.050
│   │   ├── LotSurfaceLayer.tsx   Y=0.100
│   │   ├── SetbackZoneLayer.tsx  Y=0.101
│   │   ├── ISALayer.tsx          Y=0.102
│   │   ├── USALayer.tsx          Y=0.103
│   │   ├── TOSLOverlayLayer.tsx  Y=0.104
│   │   ├── AMBFFootprintLayer.tsx Y=0.105  (binding + ghost candidates)
│   │   ├── AMBFEnvelope.tsx      Y=0.200+  (3D buildable volume box)
│   │   ├── BuildingLayer.tsx     Y=0.200+  (per-floor extrusion stack)
│   │   └── AngularPlaneSlicer.tsx  Custom BufferGeometry — ⚠️ pending verification
│   │
│   ├── hooks/
│   │   ├── useMaterialCache.ts   Populates materialCache on scene mount
│   │   └── useMaterialSwapper.ts Subscribes imperatively to store → swaps materials
│   │
│   └── skeletons/
│       └── DevControlsSkeleton.tsx  Static loading skeleton
│
├── lib/
│   ├── 3d/
│   │   ├── geometryConstants.ts     Y-axis constants — single source of truth
│   │   ├── materialCache.ts         Cache populate / restore functions
│   │   ├── sharedMaterials.ts       Module-level material singletons
│   │   ├── angularPlaneGeometry.ts  AMVB slicer geometry builder — ⚠️ flagged
│   │   └── selectionDataRegistry.ts ObjectId → SelectedObjectData builder
│   │
│   └── pd1096/
│       ├── types.ts                 All input/output TypeScript interfaces
│       ├── zoningTables.ts          ZONING_TABLE — Table VIII.1, VII.2, VII.G.1
│       ├── computeSetbacks.ts       Table VIII.2 / VIII.3 + §804.6 incremental
│       └── computationEngine.ts     computeDevControls() — pure TS, zero rendering imports
│
└── stores/
    ├── useDevControlsStore.ts       Lot/zoning/building params + DevControlsResult
    └── useSelectionStore.ts         selectedObjectId + panel state
```

---

# Part VIII — Performance Compliance Gates

All gates must pass before the feature ships. Items marked ⚠️ are pre-production blockers.

```
COMPUTATION CORRECTNESS
[⚠️] Angular plane θ coefficient table verified against complete 2004 IRR Rule VII Guidelines by licensed architect
[  ] computeAMBF: unit test — 3-way check with all three binding scenarios exercised
[  ] computeTOSL: unit test — closure identity holds across 15 zoning classes
[  ] R-1 zone: unit test — PSO path NOT executed; setback path only
[  ] Firewall flag: unit test — PSO shifts by correct delta per Table VIII.1
[  ] §804.6 incremental: unit test — side/rear setback increases at +0.30m/storey, capped at n=14
[  ] ISA computed as % of TLA (not % of TOSL) — verified in all zoning class branches
[  ] ClosureIdentityViolationError thrown on delta > ±0.01 sqm

GEOMETRY
[  ] All Y values in GEOMETRY_Y are unique — confirmed by TypeScript const assertion
[  ] No two coplanar-capable surfaces share the same Y coordinate
[  ] All geometry is procedural (BufferGeometry/BoxGeometry/PlaneGeometry) — zero GLB files
[  ] useMemo() wraps every geometry constructor with dimension-keyed dependencies
[  ] raycast={() => null} on all non-interactive decorative meshes

MATERIALS
[  ] GREYSCALE_MATERIAL and SELECTION_BLUE_MATERIAL are module-level singletons
[  ] No new THREE.Material() inside useFrame or event handlers
[  ] materialCache.clear() + repopulate() called only when scene geometry rebuilds
[  ] originalMaterial stored as .clone() — never a reference to the live material
[  ] TextGeometry: absent from codebase
[  ] CSS2DRenderer: absent from codebase
[  ] CSS3DRenderer: absent from codebase

RENDERING
[  ] frameloop="demand" — Canvas never renders unless invalidate() is called
[  ] useMaterialSwapper subscribes imperatively — zero React re-renders on mesh click
[  ] No setState() inside useFrame
[  ] No allocations (new Vector3, new Color, new BoxGeometry) inside useFrame
[  ] dpr capped at 1.5x — verified against target device Realme C55 / Samsung A14
[  ] Total draw calls ≤ 20 per frame in steady state (verified via r3f-perf)
[  ] Triangle count ≤ 5,000 (all procedural geometry)

RUNTIME TARGETS
[  ] 60fps sustained on development machine (M1 MacBook Air) during slider drag
[  ] 30fps minimum on target mobile (Realme C55) during parameter changes
[  ] Zero React re-renders on slider drag — verified via React DevTools Profiler
[  ] Supabase page.tsx query < 200ms — index on lab_sessions.user_id confirmed

MEMORY
[  ] useDevControlsStore.reset() called on route change (useEffect cleanup in module root)
[  ] ContactShadows disposed on unmount
[  ] No BoxGeometry allocations inside render loops

STATE
[  ] useSelectionStore selectors are granular — each component subscribes to one field
[  ] SelectionInfoPanel reads selectedObjectData only — no scene traversal in DOM
[  ] clearSelection() is the exclusive reset path — no direct material mutation from DOM

EXAM MODE
[  ] Formula hints fully suppressed when labMode === 'exam'
[  ] Computed values hidden in ComplianceScorecard during exam until revealStep triggers
[  ] submitExamAnswer() writes to Supabase and calls recompute_readiness_score RPC
[  ] ±0.5 sqm tolerance applied to all area-based exam answer comparisons
[  ] Post-answer rationale shown on incorrect submission — no red X without explanation

ABSOLUTE BOUNDARY VERIFICATION
[  ] Zero text in 3D canvas — all labels are DOM elements
[  ] Zero coplanar faces at the same Y coordinate
[  ] Material cache populated before first selection event
[  ] Rendering layer reads exclusively from DevControlsResult — never recomputes code values
```

---

# Part IX — Known Gaps & Production Gates

| Gap | Impact | Resolution |
|---|---|---|
| Angular plane θ coefficient table by zone + RROW combination not fully specified | `computeAMVB_final()` scaffolded but not production-ready; AMVB geometry renders shape correctly but angle may be inaccurate | **Verify against 2004 IRR Rule VII Guidelines §AMVB before committing to scoring logic** |
| R-2 Maximum front setback (8m grade / 3m upper floors) | Incremental setback logic only adjusts side/rear uniformly; the dual-height front setback requires a storey-conditional branch | Add floor-conditional setback logic to `computeSetbacks()` for R-2-max and R-3-max |
| R-4 and R-3 abutment conditions (§804.10) | Side and rear setbacks listed as "optional" — the conditions for zero setback are not encoded | Requires the full §804.10 text to implement the boolean conditions correctly |
| Table VII.1 TGFA — lot type multipliers (corner, through, corner-through) | TGFA currently computed from FLAR path only; the lot-type variations (corner +5% PSO, through +5% PSO) are not encoded | Add `lotType` branch to `computeTGFA()` |
| Mixed occupancy (§703) | Mixed occupancy buildings require the most restrictive rule across all groups — not implemented | Out of scope for v1; flag as v2 feature |

---

*SlateCamp — 3D Development Controls Lab: Master Implementation Plan*
*All computation functions derived exclusively from PD 1096 2004 Revised IRR (DPWH, April 2005). No dimensional values, zoning coefficients, or legal formulas have been assumed from sources outside the provided documents. All rendering logic is strictly decoupled from the computation engine. The angular plane production gate must be cleared by a licensed architect before AMVB scoring is enabled.*
