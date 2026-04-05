# SlateCamp — Development Controls Lab
## Master Unification Implementation Plan
### PD 1096 IRR Rules VII & VIII — Definitive Engineering Roadmap

**Version:** 1.0 — Unified  
**Stack:** Next.js 14 · React 18 · React Three Fiber · Zustand · Supabase  
**Classification:** Core ILX Module — Area C Exam Preparation  
**Regulatory Scope:** PD 1096 2004 Revised IRR — Rule VII (Setbacks) · Rule VIII (Development Controls)  
**Source Documents Synthesized:** UI Blueprint · Feature Implementation Plan (FIP) · Complete Technical Reference · UX Implementation Plan

---

## Pre-Flight: Split-Step Verification

| Constraint | Verified | Evidence |
|---|---|---|
| Strict separation of computation vs. rendering | ✅ | `lib/pd1096/` has zero React/R3F/Three.js imports; Zustand bridges engine to UI |
| Y-axis constant anti-z-fighting strategy | ✅ | `GEOMETRY_Y` constants with minimum 0.01m separation; no two coplanar surfaces share a Y value |
| Dual-mode (Sandbox vs. Exam) architecture | ✅ | `labMode: 'sandbox' \| 'exam'` is a root-level store flag that reconfigures every surface |
| ISA/USA expressed as % of TLA (not % of TOSL) | ✅ | Canonical IRR Table VIII.1; engine uses `lot.tla * zoning.isaPercent` |
| AMBF is min of setback-based AND PSO-based | ✅ | `AMBF = min(AMBF_setback, AMBF_PSO)` — TOSL-based reduces to PSO-based |
| Angular plane coefficient flagged for audit | ✅ | `ANGULAR_PLANE_TANGENT = 2.0` marked `⚠️ VERIFY AGAINST IRR` before production |
| Zero text in 3D canvas | ✅ | All labels via DOM overlay; `TextGeometry`, `CSS2DRenderer`, `CSS3DRenderer` banned |

---

# Part I — Architectural Principles

## 1.1 Absolute Boundaries (Non-Negotiable)

These constraints are immutable. Any pull request violating them is rejected without review.

| Constraint | Rule | Enforcement Mechanism |
|---|---|---|
| **Zero text in 3D canvas** | No `TextGeometry`, `CSS2DRenderer`, or `CSS3DRenderer` | Banned from import. All labels rendered as DOM elements via `drei Html` or the 2D overlay layer. |
| **Zero coplanar face overlap (z-fighting)** | Every geometry layer occupies a unique Y-axis coordinate | `GEOMETRY_Y` constants are the single source of truth. No raw Y values may be hardcoded anywhere in the scene. |
| **Original materials always restorable** | Every mesh caches its original material on scene load | `userData.originalMaterial` populated via `useMaterialCache` hook on mount. Cache is the exclusive reset source. |
| **Zero rendering imports in computation engine** | `lib/pd1096/` contains pure TypeScript only | No `react`, `three`, `@react-three/fiber`, or any rendering primitive may appear in any file under this path. |
| **No intermediate stale-output states** | Every input mutation atomically recomputes the result | Every Zustand action calls `recompute()` synchronously within the same `set()` call before returning. |
| **Formula assumptions bounded to Doc 3** | No zoning parameters, formulas, or coefficients from external sources | All values derived exclusively from the 2004 Revised IRR as documented in the Complete Technical Reference. |

## 1.2 Core Separation of Concerns Model

```
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 0 — Regulatory Truth                                          │
│  src/lib/pd1096/                                                     │
│  Pure TypeScript. Zero framework dependencies.                       │
│  Input: LotData, ZoningData, ProposedBuilding (plain objects)        │
│  Output: DevControlsResult (plain object)                           │
│  Testable in isolation. Auditable by a licensed architect.          │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ plain object (DevControlsResult)
┌──────────────────────────────▼──────────────────────────────────────┐
│  LAYER 1 — State Bridge                                              │
│  src/stores/useDevControlsStore.ts + useSelectionStore.ts           │
│  Zustand with subscribeWithSelector middleware.                      │
│  Manages: raw inputs, computed outputs, UI state, exam state.       │
│  Calls runDevControlsEngine() atomically on every input mutation.   │
│  Bridges WebGL events to DOM with zero direct coupling.             │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ granular selectors
          ┌────────────────────┼────────────────────┐
          │                    │                    │
┌─────────▼──────┐  ┌─────────▼──────┐  ┌─────────▼──────────────┐
│  LAYER 2a      │  │  LAYER 2b      │  │  LAYER 2c              │
│  R3F Scene     │  │  DOM Overlay   │  │  Supabase Persistence  │
│  (Canvas)      │  │  (2D UI)       │  │  (Server Actions)      │
│                │  │                │  │                        │
│  Geometry only │  │  All text,     │  │  Exam answers,         │
│  No text       │  │  numbers,      │  │  Readiness Score       │
│  No formulas   │  │  formulas,     │  │  writes, lab_sessions  │
│  Color state   │  │  labels        │  │                        │
│  only          │  │                │  │                        │
└────────────────┘  └────────────────┘  └────────────────────────┘
```

## 1.3 Next.js 14 Server/Client Boundary Map

| File | Directive | Role |
|---|---|---|
| `app/dashboard/3d-lab/dev-controls/page.tsx` | Server (none) | Supabase fetch of saved session; dynamic import of module with `ssr: false` |
| `app/dashboard/3d-lab/dev-controls/loading.tsx` | Server (none) | Static skeleton during dynamic import |
| `app/dashboard/3d-lab/dev-controls/actions.ts` | `'use server'` | Exam answer submission; Readiness Score recomputation via Supabase RPC |
| `components/3d-lab/DevControlsModule/index.tsx` | `'use client'` | Module root — layout shell, Zustand access |
| `components/3d-lab/DevControlsModule/DevControlsCanvas.tsx` | `'use client'` | R3F Canvas — hard client wall; no server-only imports allowed |
| `components/3d-lab/DevControlsModule/dashboard/` | `'use client'` | All dashboard panels: Scorecard, InputPanel, ZoningSelector, etc. |
| `lib/pd1096/computationEngine.ts` and all sub-modules | *(no directive)* | Pure TS module — no directive required or permitted |
| `stores/useDevControlsStore.ts` | *(no directive)* | Zustand store module |

---

# Part II — Unified State & Data Flow

## 2.1 Canonical TypeScript Interfaces

The following interfaces are the definitive unified schema, reconciling all four source documents. These must be implemented exactly in `src/lib/pd1096/types.ts`.

```typescript
// src/lib/pd1096/types.ts
// ─── INPUT TYPES ──────────────────────────────────────────────────────────────

export interface LotData {
  width: number          // meters
  depth: number          // meters
  tla: number            // sq.m. — Total Lot Area (width × depth)
  frontage: 'road' | 'alley'
  occupancyGroup: string // 'A-1' | 'A-2' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I'
}

export interface ZoningData {
  zoneClass: ZoneClass
  psoPercent: number       // decimal (0.0–1.0) — from Table VIII.1
  isaPercent: number       // decimal — from Table VIII.1, expressed as % of TLA
  usaPercent: number       // decimal — from Table VIII.1, expressed as % of TLA
  bhl: number              // meters — Building Height Limit from Table VII.2
  far: number              // Floor Area Ratio / FLAR from Table VII.G.1
  maxLotCoverage: number   // decimal (0.0–1.0) — per zoning ordinance (may differ from PSO)
  firewallActive: boolean  // toggles PSO column (e vs. f) per Table VIII.1
}

export interface ProposedBuilding {
  footprintWidth: number   // meters
  footprintDepth: number   // meters
  floors: number           // integer
  floorHeight: number      // meters per floor (ALE standard default: 3.0)
  proposedHeight: number   // meters — total building height
}

export interface DevControlsInput {
  lot: LotData
  zoning: ZoningData
  proposed: ProposedBuilding
  rrowWidth: number        // meters — Road Right-of-Way width
}

// ─── OUTPUT TYPES ─────────────────────────────────────────────────────────────

export interface SetbackResult {
  front: number            // meters — from Table VIII.2 / VIII.3
  rear: number
  left: number
  right: number
  incrementalSetback?: number  // Section 804.6: +0.30m per storey above 2, up to 14 storeys
}

export interface AMBFCandidates {
  setbackBased: number     // (width - L - R) × (depth - F - Rear) in sq.m.
  psoBased: number         // psoPercent × tla in sq.m.
  toslBased: number        // (1 - toslPercent) × tla — reduces to psoBased in canonical IRR
  binding: number          // Math.min(setbackBased, psoBased)
  bindingMethod: 'setback' | 'pso'
}

export interface AMBFResult {
  buildableWidth: number   // meters
  buildableDepth: number   // meters
  candidates: AMBFCandidates
  allowableAMBF: number    // sq.m. — the governing (minimum) value
  proposedFootprint: number
  isCompliant: boolean
  overage: number          // sq.m. — 0 if compliant
}

export interface TOSLResult {
  tosl: number             // TLA − AMBF (sq.m.)
  isa: number              // isaPercent × TLA (sq.m.) — canonical IRR form
  usa: number              // TLA − AMBF − ISA (sq.m.)
  maca: number             // AMBF + ISA (sq.m.)
  closureCheck: number     // TOSL − ISA − USA (must be ≈ 0)
  isIdentitySatisfied: boolean  // |closureCheck| < 0.01
}

export interface TGFAResult {
  totalGFA: number         // proposedFootprint × floors
  maxAllowable: number     // far × tla
  isCompliant: boolean
  remainingAllowable: number
  maxCompliantFloors: number
}

export interface BHLResult {
  zoningCap: number        // meters — from Table VII.2 / zoning ordinance
  angularPlaneResult: number  // ⚠️ AUDIT FLAG — coefficient unconfirmed
  governingBHL: number     // min(zoningCap, angularPlaneResult)
  amvbInitial: number      // allowableAMBF × governingBHL
  amvbFinal: number        // amvbInitial − volume above angular plane ⚠️ AUDIT FLAG
  proposedHeight: number
  isCompliant: boolean
}

export interface PSORResult {
  openSpaceRequired: number   // (1 − psoPercent) × tla
  openSpaceProvided: number   // tla − proposedFootprint
  isCompliant: boolean
}

export interface DevControlsResult {
  setbacks: SetbackResult
  ambf: AMBFResult
  pso: PSORResult
  tosl: TOSLResult
  tgfa: TGFAResult
  bhl: BHLResult
  overallCompliant: boolean
}

// ─── ZONE TYPES ───────────────────────────────────────────────────────────────

export type ZoneClass =
  | 'R-1' | 'R-2' | 'R-3' | 'R-4' | 'R-5'
  | 'C-1' | 'C-2' | 'C-3'
  | 'I-1' | 'I-2' | 'I-3'
  | 'GI' | 'Institutional' | 'Cultural' | 'Parks'

export type LabMode = 'sandbox' | 'exam'
export type CameraPreset = 'orbit' | 'top' | 'front' | 'isometric'
export type LayerKey = 'setbacks' | 'ambf' | 'pso' | 'bhl' | 'floors' | 'isa' | 'usa' | 'tosl'
```

## 2.2 Unified Zustand Store Schema

Two stores govern the module. They must never be merged into one: `useDevControlsStore` handles computation and inputs; `useSelectionStore` handles the 3D selection-to-panel bridge.

### 2.2.1 `useDevControlsStore`

```typescript
// src/stores/useDevControlsStore.ts

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { runDevControlsEngine } from '@/lib/pd1096/computationEngine'
import type {
  LotData, ZoningData, ProposedBuilding, DevControlsResult,
  LabMode, CameraPreset, LayerKey, ExamProblem,
} from '@/lib/pd1096/types'

interface DevControlsStore {
  // ─ Mode (root-level — reconfigures every surface)
  labMode: LabMode
  setLabMode: (mode: LabMode) => void

  // ─ Raw Inputs
  lot: LotData
  setLot: (patch: Partial<LotData>) => void

  zoning: ZoningData
  setZoneClass: (z: ZoneClass) => void
  setZoningParams: (patch: Partial<ZoningData>) => void

  proposed: ProposedBuilding
  setProposed: (patch: Partial<ProposedBuilding>) => void

  rrowWidth: number
  setRrowWidth: (w: number) => void

  firewallActive: boolean
  toggleFirewall: () => void

  // ─ Computed Output (recomputed atomically on every input mutation)
  result: DevControlsResult

  // ─ 3D Scene UI State
  cameraPreset: CameraPreset
  setCameraPreset: (p: CameraPreset) => void
  visibleLayers: LayerKey[]
  toggleLayer: (layer: LayerKey) => void
  activeHotspot: string | null
  setActiveHotspot: (id: string | null) => void
  highlightedMetric: string | null
  setHighlightedMetric: (metric: string | null) => void
  dpr: number
  setDpr: (dpr: number) => void

  // ─ Exam State
  exam: {
    currentProblem: ExamProblem | null
    userAnswer: number | null
    isSubmitted: boolean
    isCorrect: boolean | null
    revealStep: number  // 0 = hidden | 1 = binding only | 2 = full derivation
  }
  setExamProblem: (problem: ExamProblem) => void
  submitExamAnswer: (answer: number) => void
  advanceRevealStep: () => void
}
```

### 2.2.2 Atomic Recompute Pattern

```typescript
// ─ CRITICAL: recompute() is called inside every set() — no intermediate stale states

const recompute = (
  lot: LotData,
  zoning: ZoningData,
  proposed: ProposedBuilding,
  rrowWidth: number
): DevControlsResult =>
  runDevControlsEngine({ lot, zoning, proposed, rrowWidth })

// Example mutating action — all actions follow this pattern:
setLot: (patch) => set((s) => {
  const newLot: LotData = {
    ...s.lot,
    ...patch,
    tla: (patch.width ?? s.lot.width) * (patch.depth ?? s.lot.depth),
  }
  return {
    lot: newLot,
    result: recompute(newLot, s.zoning, s.proposed, s.rrowWidth),
  }
}),
```

### 2.2.3 `useSelectionStore`

```typescript
// src/stores/useSelectionStore.ts
// Bridges WebGL click events → DOM overlay with zero rendering coupling

export interface SelectedObjectData {
  objectId: string
  layerType: 'lot' | 'setback' | 'ambf' | 'isa' | 'usa' | 'tosl' | 'building'
  displayName: string
  codeReference: string
  formulaHint?: string        // Suppressed in exam mode
  computedValues: Record<string, number | string>
  violations: string[]
}

interface SelectionStore {
  selectedObjectId: string | null
  selectedObjectData: SelectedObjectData | null
  setSelectedObject: (id: string, data: SelectedObjectData) => void
  clearSelection: () => void  // ONLY reset path — no direct material mutation from DOM
}
```

## 2.3 Data Flow Diagram

```
User Input (slider / dropdown / toggle)
         │
         ▼
  Zustand Action (setLot / setZoneClass / toggleFirewall / etc.)
         │
         ▼
  runDevControlsEngine(input: DevControlsInput) → DevControlsResult
         │
         ├─────────────────────────────────────────────────────────►
         │                                                          │
         ▼                                                          ▼
  store.result updated atomically                  invalidate() called once
         │                                          (via useEffect in Canvas)
         ├─── R3F geometry selectors ───► one re-render frame
         │    (buildableWidth, bhl, etc.)
         │
         ├─── DOM overlay selectors ──► ComplianceScorecard, AMBFThreeWayPanel,
         │                              ClosureEquationStrip update
         │
         └─── Exam mode check ────────► If labMode === 'exam': suppress formula hints
                                        Show only problem statement + answer input
```

---

# Part III — Pure Computation Engine Strategy

## 3.1 Engine Architecture: SOLID Principles

- **Single Responsibility:** One file, one code check. `computeAMBF.ts` does not touch BHL.
- **Open/Closed:** New occupancy groups extend `SETBACK_TABLE` lookup without modifying `computeSetbacks`.
- **Liskov Substitution:** All compute functions accept the same `LotData | ZoningData` interface.
- **Interface Segregation:** Each function receives only the slice of `DevControlsInput` it needs.
- **Dependency Inversion:** Engine depends on abstractions (`LotData`), never on store shape.

## 3.2 Computation Dependency Order

```
DevControlsInput (lot, zoning, proposed, rrowWidth)
         │
         ▼
Step 1:  computeSetbacks(lot, occupancyGroup, rrowWidth)
         → SetbackResult
         │         │
         │         └── incremental setback for storeys > 2 (Section 804.6)
         │                 +0.30m per additional storey, capped at storey 14
         │
         ▼
Step 2:  computeAMBF(lot, zoning, setbacks, proposed.footprintWidth, proposed.footprintDepth)
         → AMBFResult
         │
         ├─ Check 1: AMBF_setback = (width - L - R) × (depth - F - Rear)
         ├─ Check 2: AMBF_PSO    = psoPercent × TLA
         └─ Governing AMBF = Math.min(Check 1, Check 2)
         │
         ├──────────────────┬──────────────────┬────────────────────────┐
         ▼                  ▼                  ▼                        ▼
Step 3:  computePSO()  computeTOSL()      computeTGFA()          computeBHL()
         │              │                  │                        │
         │              ├─ TOSL = TLA − AMBF                    ├─ zoningCap
         │              ├─ ISA  = isaPercent × TLA              ├─ angularPlane ⚠️
         │              ├─ USA  = TLA − AMBF − ISA              └─ governing = min
         │              ├─ MACA = AMBF + ISA
         │              └─ closureCheck = TOSL − ISA − USA
         │
         └──────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
                                  DevControlsResult
                                  (overallCompliant =
                                   ambf.isCompliant &&
                                   pso.isCompliant &&
                                   tosl.isIdentitySatisfied &&
                                   tgfa.isCompliant &&
                                   bhl.isCompliant)
                                           │
                                           ▼
                                  store.result (written atomically)
```

## 3.3 Canonical Regulatory Formulas (From IRR — Do Not Modify)

All formulas below are sourced exclusively from the 2004 Revised IRR as documented in the Complete Technical Reference.

### Area Closure Identities (Master Relationships)

```
TLA = AMBF + TOSL
TOSL = ISA + USA
TLA = AMBF + ISA + USA        ← Primary closure identity (verification check)
MACA = AMBF + ISA
TLA = MACA + USA
PSO% = (AMBF / TLA) × 100
```

### AMBF Three-Way Check (Section 704.4)

```
AMBF_setback = (lotWidth − s_L − s_R) × (lotDepth − s_Front − s_Rear)
AMBF_PSO     = PSO% × TLA
AMBF_TOSL    = (1 − TOSL%) × TLA   [reduces to AMBF_PSO in canonical IRR]
AMBF         = min(AMBF_setback, AMBF_PSO)
```

> **Canonical note:** `AMBF_TOSL` reduces to `AMBF_PSO` because `TOSL% = 100% − PSO%` per Table VIII.1. The three-way check pedagogically shows all three candidates; the binding computation is a two-way min.

### Incremental Setback (Section 804.6)

```
side/rear court (n storeys) = base_court + 0.30 × (n − 2),  for 2 < n ≤ 14
```

### ISA and USA (Table VIII.1 — Canonical IRR Form)

```
ISA = isaPercent × TLA   [isaPercent expressed as % of TLA, not % of TOSL]
USA = TLA − AMBF − ISA
```

### TGFA (Section 705 / Table VII.1)

```
GFA  = TLA × FLAR
TGFA = GFA × Multiplier_VII.G.2
     = GFA × 1.50   (residential)
     = GFA × 1.25–1.33  (commercial)
```

Or equivalently (Table VII.1 approach):

```
TGFA = permittedStoreys × (PSO% × TLA)
```

### AMVB (Rule VII Guidelines)

```
AMVB_initial = AMBF × BHL_meters
tan(θ) = H / (S + ½ × RROW)     [θ varies by zone and RROW width]
AMVB_final = AMVB_initial − volume_above_angular_plane
```

> **⚠️ AUDIT FLAG:** The angular plane tangent coefficient is unconfirmed. The implementation uses `ANGULAR_PLANE_TANGENT = 2.0` as a placeholder. A licensed architect must verify the precise coefficient from the full 2004 IRR Rule VII Guidelines before this function is merged to production.

### Key Lookup Tables (Condensed)

**Table VIII.1 — PSO / ISA / USA (% of TLA)**

| Zone | PSO (no FW) | PSO (with FW) | ISA | USA | TOSL |
|---|---|---|---|---|---|
| R-1 | 55% | N/A | 30% | 15% | 45% |
| R-2 Basic | 55% | 60% | 30% | 10% | 40% |
| R-2 Max | 60% | 70% | 20% | 10% | 30% |
| R-3 Basic | 60% | 70% | 20% | 10% | 30% |
| R-3 Max | 65% | 70% | 20% | 10–15% | 30–35% |
| R-4 | 70% | 80% | 10–20% | 10% | 20–30% |
| R-5 | 70% | 80% | 10–20% | 10% | 20–30% |
| C-1 | 65% | 75% | 20% | 5–15% | 25–35% |
| C-2 | 75% | 85% | 10–20% | 5% | 15–25% |
| C-3 | 80% | 90% | 5–15% | 5% | 10–20% |
| I-1 | 70% | 80% | 5–15% | 15% | 20–30% |
| I-2 | 70% | 80% | 5–15% | 15% | 20–30% |
| Institutional | 50% | 60% | 20% | 20–30% | 40–50% |

> **R-1 Note:** Group A buildings (R-1) comply via Table VIII.2 minimum yard standards, not via a direct PSO assignment.

**Table VIII.2 — Residential Setbacks**

| Zone | Front (m) | Side (m) | Rear (m) |
|---|---|---|---|
| R-1 | 4.50 | 2.00 | 2.00 |
| R-2 Basic | 3.00 | 2.00* | 2.00 |
| R-2 Max | 8.00** | 2.00* | 2.00 |
| R-3 Basic | 3.00 | 2.00 | 2.00 |
| R-3 Max | 8.00** | 2.00 | 2.00 |
| R-4 | 4.50 | optional | optional |
| R-5 | 6.00 | 3.00 | 3.00 |

*One side only. **3.00m + 5.00m at grade; upper floors revert to 3.00m minimum.

**Table VIII.3 — Commercial/Industrial Setbacks by RROW Width**

| RROW Width | Front (m) | Side (m) | Rear (m) |
|---|---|---|---|
| ≥ 30.00 m | 8.00 | 5.00 | 5.00 |
| 25.00–29.00 m | 6.00 | 3.00 | 3.00 |
| 20.00–24.00 m | 5.00 | 3.00 | 3.00 |
| 10.00–19.00 m | 5.00 | 2.00 | 2.00 |
| < 10.00 m | 5.00 | 2.00 | 2.00 |

**Table VII.2 — BHL by Zone (Selected)**

| Zone | Storeys | Meters |
|---|---|---|
| R-1 | 3 | 10.00 m |
| R-2 Basic | 3 | 10.00 m |
| R-2 Max | 5 | 15.00 m |
| R-3 Max | 12 | 36.00 m |
| R-5 | 12–18 | 36.00–54.00 m |
| C-1 | 5 | 15.00 m |
| C-2 | 6 | 18.00 m |
| C-3 | up to 48 | ~180.00 m |

**Table VII.G.1 — FLAR (Selected)**

| Zone | FLAR Range |
|---|---|
| R-1 | 1.50 |
| R-2 Basic | 1.30–1.50 |
| R-2 Max | 2.10–3.00 |
| R-3 Max | 7.10–8.10 |
| R-5 | 6.00–9.00 |
| C-1 | 1.70–3.00 |
| C-2 | 3.60–9.00 |
| C-3 | 9.00–34.00 |

## 3.4 Computation Engine File Structure

```
src/lib/pd1096/
├── types.ts                  ← All shared input/output TypeScript interfaces
├── computationEngine.ts      ← ONLY function called by Zustand store (orchestrator)
├── computeSetbacks.ts        ← Rule VII Tables VIII.2/VIII.3 + Section 804.6
├── computeAMBF.ts            ← Three-way check: setback vs. PSO
├── computePSO.ts             ← Open space provided vs. required
├── computeTOSL.ts            ← Area closure identity (TLA = AMBF + ISA + USA)
├── computeTGFA.ts            ← FAR × TLA cap; floor count compliance
├── computeBHL.ts             ← Zoning cap vs. angular plane ⚠️ AUDIT FLAG
├── computeMACA.ts            ← MACA = AMBF + ISA
├── lookupTables.ts           ← Static data: TABLE_VIII_1, TABLE_VIII_2, TABLE_VII_2, FLAR_TABLE
└── __tests__/
    ├── computeAMBF.test.ts   ← Unit tests for 3-way check (required before shipping)
    ├── computeTOSL.test.ts   ← Unit tests for closure identity
    └── computeBHL.test.ts    ← Unit tests for angular plane (mark pending IRR audit)
```

---

# Part IV — R3F Scene & UI Overlay Architecture

## 4.1 Y-Axis Geometry Constants (Anti-Z-Fighting System)

These constants are the **exclusive** source of truth for all Y-axis placement. No raw Y value may be hardcoded in any scene component.

```typescript
// src/lib/3d/geometryConstants.ts

export const GEOMETRY_Y = {
  BASE_GROUND:    0.000,  // Raw earth / terrain base
  ROAD:           0.010,  // Road surface
  ROAD_MARKING:   0.011,  // Painted lane markings
  SIDEWALK:       0.050,  // Raised pedestrian pavement
  CURB:           0.040,  // Curb edge
  LOT_SURFACE:    0.100,  // Lot ground fill
  SETBACK_ZONE:   0.101,  // Setback overlay plane (transparent)
  HARDSCAPE_ISA:  0.102,  // Impervious surface area fill
  SOFTSCAPE_USA:  0.103,  // Unpaved surface area fill
  TOSL_OVERLAY:   0.104,  // TOSL zone highlight (transparent)
  AMBF_FOOTPRINT: 0.105,  // Allowable building footprint indicator
  BUILDING_BASE:  0.200,  // Bottom of building extrusion
  FLOOR_HEIGHT:   3.000,  // 3m per floor — ALE standard
} as const

export type GeometryYKey = keyof typeof GEOMETRY_Y
```

**Z-fighting is geometrically impossible** in this system: minimum vertical separation between any two coplanar-capable surfaces is 0.010 world units (1 cm at 1:100 scale), which exceeds the WebGL depth buffer precision threshold at any expected camera distance.

## 4.2 Scene Layer Composition

```
CityDiagramScene
│
├─ <GroundLayer />              Y = 0.000   PlaneGeometry — raw terrain
├─ <RoadLayer />                Y = 0.010   PlaneGeometry — road fill
│   └─ <RoadMarkings />         Y = 0.011   PlaneGeometry — lane markings
├─ <CurbLayer />                Y = 0.040   BoxGeometry — curb extrusion
├─ <SidewalkLayer />            Y = 0.050   PlaneGeometry — pedestrian paving
├─ <LotSurfaceLayer />          Y = 0.100   PlaneGeometry — lot ground
├─ <SetbackZoneLayer />         Y = 0.101   PlaneGeometry (transparent) — setback exclusion
├─ <ISALayer />                 Y = 0.102   PlaneGeometry — impervious hardscape fill
├─ <USALayer />                 Y = 0.103   PlaneGeometry — softscape fill
├─ <TOSLOverlayLayer />         Y = 0.104   PlaneGeometry (transparent) — open space zone
├─ <AMBFFootprintLayer />       Y = 0.105   PlaneGeometry — buildable footprint indicator
└─ <BuildingLayer />            Y = 0.200+  BoxGeometry extruded per floor
    ├─ <BuildableEnvelope />    Y: 0 → BHL  Binding AMBF volume (solid, cobalt)
    ├─ <AMBFGhostCandidates />  Y: 0 → BHL  PSO-AMBF (amber ghost) + TOSL-AMBF (grey ghost)
    ├─ <AngularPlane />         Custom BufferGeometry — diagonal RROW slicer
    └─ <AMVBVolume />           Trimmed residual volume (fades red when above plane)
```

## 4.3 Material System

### 4.3.1 Shared Singleton Materials

```typescript
// src/lib/3d/sharedMaterials.ts
// Module-level singletons — never reinstantiated inside components

import * as THREE from 'three'

export const GREYSCALE_MATERIAL = new THREE.MeshStandardMaterial({
  color: '#9CA3AF',
  roughness: 0.9,
  metalness: 0.0,
})

export const SELECTION_BLUE_MATERIAL = new THREE.MeshStandardMaterial({
  color: '#1B3FC4',
  roughness: 0.6,
  metalness: 0.0,
  emissive: '#1B3FC4',
  emissiveIntensity: 0.15,
})
```

### 4.3.2 Color System (Immutable)

| Zone | Token | Hex | Usage |
|---|---|---|---|
| Ground | `raw-earth` | `#E8E4DB` | Base terrain |
| Road | `road-grey` | `#6B7280` | Road surface |
| Lot Surface | `lot-sand` | `#C8C0A8` | Lot ground fill |
| AMBF (Binding) | `cobalt` | `#1B3FC4` | Buildable footprint — solid + Edges |
| AMBF PSO Ghost | `amber-ghost` | `#F5A62310` | Non-binding PSO envelope |
| AMBF TOSL Ghost | `grey-ghost` | `#9CA3AF10` | Non-binding TOSL envelope |
| ISA Zone | `amber` | `#F5A623` | Impervious hardscape |
| USA Zone | `trail-green` | `#4A7C59` | Permeable softscape (crosshatch tex) |
| TOSL Overlay | `dual-zone` | `#88A898` | Total open space (ISA + USA) |
| Building | `concrete` | `#B8B4A8` | Floor slab extrusion |
| Selection Highlight | `cobalt` | `#1B3FC4` | Selected mesh overlay |
| Greyscale (inactive) | `neutral-grey` | `#9CA3AF` | Non-selected meshes in focus mode |
| Violation | `red` | `#E63329` | Code violations — pulsing shader |
| Setback Zone | `red-tint` | `#E74C3C26` | Setback exclusion plane (15% opacity) |

> **Rule:** Color assignments are immutable. These exact tokens must appear identically in the formula panel, the ground plane, the data card, and the quiz feedback. Multi-channel reinforcement per dual-coding theory.

### 4.3.3 Material Caching System

```typescript
// src/lib/3d/materialCache.ts

export interface CachedMaterialEntry {
  originalMaterial: THREE.Material | THREE.Material[]
  originalColor: THREE.Color | null
}

// Cache populated ONCE on scene load via useMaterialCache hook — never modified after init
const materialCache = new Map<string, CachedMaterialEntry>()

export function cacheMaterials(scene: THREE.Object3D): void {
  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      materialCache.set(obj.uuid, {
        originalMaterial: Array.isArray(obj.material)
          ? obj.material.map(m => m.clone())
          : obj.material.clone(),
        originalColor: (obj.material as THREE.MeshStandardMaterial).color?.clone() ?? null,
      })
      obj.userData.originalMaterial = materialCache.get(obj.uuid)?.originalMaterial
    }
  })
}

export function restoreMaterial(mesh: THREE.Mesh): void {
  const cached = materialCache.get(mesh.uuid)
  if (cached) mesh.material = cached.originalMaterial
}
```

### 4.3.4 Violation Shader

```typescript
// src/components/3d-lab/DevControlsModule/canvas/materials/ViolationMaterial.ts
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import * as THREE from 'three'

export const ViolationMaterial = shaderMaterial(
  {
    uBaseColor: new THREE.Color('#E8E4DB'),
    uViolationColor: new THREE.Color('#E63329'),
    uViolationAmount: 0.0,   // 0.0 = compliant, 1.0 = violation
    uTime: 0.0,
    uOpacity: 0.85,
  },
  /* vertex */ `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* fragment */ `
    uniform vec3 uBaseColor;
    uniform vec3 uViolationColor;
    uniform float uViolationAmount;
    uniform float uTime;
    uniform float uOpacity;
    varying vec3 vNormal;
    void main() {
      float light = dot(vNormal, normalize(vec3(1.0, 1.5, 1.0))) * 0.4 + 0.6;
      // 1.5 Hz pulse — noticeable but not distracting
      float pulse = sin(uTime * 9.42) * 0.5 + 0.5;
      float intensity = uViolationAmount * (0.6 + 0.4 * pulse);
      vec3 color = mix(uBaseColor, uViolationColor, intensity);
      gl_FragColor = vec4(color * light, uOpacity);
    }
  `
)
extend({ ViolationMaterial })
```

> **Critical:** `uTime` is updated via `useFrame` ref mutation — this must never trigger a React re-render.

## 4.4 R3F Canvas Configuration

```tsx
// src/components/3d-lab/DevControlsModule/canvas/DevControlsCanvas.tsx
<Canvas
  frameloop="demand"                    // Render on invalidate() only — never idle-renders
  dpr={[1, 1.5]}                        // Cap at 1.5x — PH device thermal safety
  gl={{
    antialias: true,
    alpha: false,
    powerPreference: 'default',         // Not 'high-performance' — thermal safety on mid-range Android
    stencil: false,
    depth: true,
  }}
  shadows="soft"
  camera={{ position: [18, 14, 20], fov: 42, near: 0.1, far: 500 }}
  style={{ background: '#F2F0EB' }}
  onPointerMissed={() => useDevControlsStore.getState().setActiveHotspot(null)}
>
  <PerformanceMonitor
    onDecline={() => useDevControlsStore.getState().setDpr(1)}
    onIncline={() => useDevControlsStore.getState().setDpr(1.5)}
  />
```

## 4.5 Camera Presets

| Preset | Config | Best For |
|---|---|---|
| ORBIT | Free orbit, minPolarAngle: 0.1, maxPolarAngle: π/2 − 0.05, enablePan: false | General exploration |
| TOP | Orthographic, looking straight down | Area legibility, closure identity |
| FRONT | Perspective, facing RROW frontage | BHL / AMVB visualization |
| ISOMETRIC | Fixed isometric angle | Full envelope composition |

## 4.6 Draw Call Budget

| Scene Element | Mesh Count | Draw Calls | Strategy |
|---|---|---|---|
| Lot ground plane | 1 | 1 | PlaneGeometry |
| Setback zones (4 sides) | 4 | 1 | InstancedMesh, 4 instances |
| ISA zone | 1 | 1 | PlaneGeometry |
| USA zone | 1 | 1 | PlaneGeometry |
| TOSL overlay | 1 | 1 | PlaneGeometry (transparent) |
| Buildable envelope (AMBF binding) | 1 | 1 | BoxGeometry + Edges |
| AMBF ghost candidates (PSO + TOSL) | 2 | 2 | Same geometry, different materials |
| Floor slabs (up to 20) | 20 | 1 | `Instances` from drei |
| Angular plane | 1 | 1 | Custom BufferGeometry (4 vertices) |
| Violation overlay | 1 | 1 | ViolationMaterial shader |
| Dimension lines | ≤ 8 | ≤ 8 | drei `Line` per annotation |
| Html annotations | ~8 | 0 (DOM) | drei `Html` with `occlude` prop |
| Ground shadow | 0 | 1 | ContactShadows |
| **TOTAL** | | **≤ 20** | Target: ≤ 20 in steady state |

## 4.7 Full File Structure

```
src/
├── app/
│   └── dashboard/3d-lab/dev-controls/
│       ├── page.tsx                        Server Component — data fetch + dynamic import
│       ├── loading.tsx                     Static skeleton (Suspense boundary)
│       └── actions.ts                      'use server' — exam answer writes + Readiness Score
│
├── components/3d-lab/DevControlsModule/
│   ├── index.tsx                           'use client' — module root, layout shell
│   │
│   ├── canvas/
│   │   ├── DevControlsCanvas.tsx           'use client' — R3F Canvas + scene setup
│   │   └── scene/
│   │       ├── LotGround.tsx               Ground plane + lot boundary
│   │       ├── SetbackZones.tsx            4 setback planes (InstancedMesh)
│   │       ├── ISALayer.tsx                ISA ground fill (amber)
│   │       ├── USALayer.tsx                USA ground fill (trail-green + crosshatch)
│   │       ├── TOSLOverlayLayer.tsx        TOSL transparent highlight
│   │       ├── AMBFFootprintLayer.tsx      Buildable footprint indicator plane
│   │       ├── BuildableEnvelope.tsx       Binding AMBF volume (solid, cobalt)
│   │       ├── AMBFGhostCandidates.tsx     PSO + TOSL ghost volumes
│   │       ├── AngularPlane.tsx            AMVB diagonal slicer ⚠️ AUDIT FLAG
│   │       ├── AMVBVolume.tsx              Trimmed residual volume
│   │       ├── FloorSlabs.tsx              Building floors (Instances)
│   │       ├── ViolationOverlay.tsx        ViolationMaterial shader meshes
│   │       ├── RROWIndicator.tsx           RROW width + centerline marker
│   │       ├── FirewallMarkers.tsx         Conditional — firewallActive only
│   │       └── DimensionLines.tsx          Annotation lines + Html labels
│   │
│   ├── dashboard/
│   │   ├── DevControlsDashboard.tsx        'use client' — right-panel shell
│   │   ├── LotInputPanel.tsx               Lot dimension sliders
│   │   ├── ZoningInputPanel.tsx            Zone class selector + Table VIII.1 display
│   │   ├── ProposedBuildingPanel.tsx       Floors / footprint / height controls
│   │   ├── ComplianceScorecard.tsx         Live pass/fail per check
│   │   ├── AMBFThreeWayPanel.tsx           Three-candidate breakdown display
│   │   ├── ClosureEquationStrip.tsx        TLA = AMBF + ISA + USA visual
│   │   ├── ComputationStepCard.tsx         Step-by-step formula reveal
│   │   └── ExamModeToggle.tsx              Sandbox ↔ Exam mode switcher
│   │
│   ├── exam/
│   │   ├── ExamProblemCard.tsx             Problem statement display
│   │   ├── ExamAnswerInput.tsx             Numerical input + submit button
│   │   └── ExamFeedbackReveal.tsx          Post-submission explanation (step-by-step)
│   │
│   ├── hooks/
│   │   ├── useMaterialCache.ts             Populates materialCache on scene mount
│   │   ├── useMaterialSwapper.ts           Subscribes to store → swaps materials
│   │   └── useSoundEngine.ts               Web Audio API — synthesized sounds
│   │
│   └── skeletons/
│       └── DevControlsSkeleton.tsx         Shown during dynamic import
│
├── lib/
│   ├── 3d/
│   │   ├── geometryConstants.ts            GEOMETRY_Y — single source of truth
│   │   ├── materialCache.ts                Cache population + restore
│   │   ├── sharedMaterials.ts              GREYSCALE_MATERIAL, SELECTION_BLUE_MATERIAL
│   │   └── selectionDataRegistry.ts        objectId → SelectedObjectData builder
│   └── pd1096/
│       ├── types.ts
│       ├── computationEngine.ts            ONLY function called by Zustand store
│       ├── computeSetbacks.ts
│       ├── computeAMBF.ts
│       ├── computePSO.ts
│       ├── computeTOSL.ts
│       ├── computeTGFA.ts
│       ├── computeBHL.ts                   ⚠️ AUDIT FLAG: angular plane coefficient
│       ├── computeMACA.ts
│       ├── lookupTables.ts
│       └── __tests__/
│           ├── computeAMBF.test.ts
│           ├── computeTOSL.test.ts
│           └── computeBHL.test.ts
│
└── stores/
    ├── useDevControlsStore.ts
    └── useSelectionStore.ts
```

---

# Part V — UX/Pedagogical Implementation

## 5.1 The Six Cognitive Friction Points and Their 3D Fixes

| # | Friction Point | Root Cause | 3D Cognitive Fix |
|---|---|---|---|
| 1 | **AMBF Three-Way Check** | Reviewers collapse to PSO-only; miss binding constraint | Render all three AMBF candidates simultaneously as layered volumes: binding = cobalt solid + Edges; non-binding = ghost amber/grey at 6% opacity |
| 2 | **Area Closure Identity** | Equation is memorized as text, not spatial truth | Literal color-filled ground plane tiles. Slider changes redraw tiles in real-time — identity is visually enforced, not memorized |
| 3 | **TOSL vs. MACA Conflation** | Overlapping vocabulary ("area," "open") | Strict persistent color: TOSL zones always green-tinted; MACA zones (building + ISA) always blue-tinted; USA carries crosshatch texture. Colors repeated in formula panel, ground plane, data card, and quiz feedback |
| 4 | **Angular Plane (AMVB) Invisibility** | Concept is spatially unimaginable from text | Animate angular plane as visible slicing geometry — translucent diagonal plane sweeps from RROW center; geometry above cutting plane fades red; volumetric counter decrements in real-time |
| 5 | **Zoning → Table Lookup → Value Chain** | Single-point-of-failure: wrong zone poisons all values | Zoning selector is first and most prominent input; Table VIII.1 values cascade-in on selection with reveal animation; selected row remains as persistent reference card throughout |
| 6 | **Firewall Exception Invisibility** | Default setbacks applied universally; exception missed | Firewall toggle removes relevant side/rear setback planes from 3D scene; freed area animates to join buildable envelope |

## 5.2 Cognitive Load Management Protocol

| Load Type | Strategy | Implementation |
|---|---|---|
| **Intrinsic load** | Segment computation into 8-step sequence | Step-locked progression in Lab mode; all steps visible simultaneously in Sandbox mode |
| **Extraneous load** | Eliminate decorative geometry | Only code-meaningful surfaces render; no ambient clutter in scene |
| **Germane load** | Force active recall at each step | In-canvas quiz checkpoint after AMBF resolution before proceeding in Exam mode |
| **Split-attention** | Co-locate formula and geometry | Equation panel docks directly adjacent to the canvas element it describes |
| **Redundancy** | Consistent color/label across all channels | TLA = Lot Sand. AMBF = Cobalt. ISA = Amber. USA = Trail Green. TOSL = Dual Zone. Never deviate. |

## 5.3 Three-Stage Scaffolding Model

```
Stage 1 — Spatial Anchoring (Sandbox Mode)
  ● Fully computed, compliant lot displayed
  ● All values within legal limits; labels visible
  ● Formula hints available on hover
  ● Goal: establish spatial relationship between lot, setbacks,
    buildable volume, permitted floor area

Stage 2 — Violation Discovery (Sandbox Mode — Parameter Manipulation)
  ● Student adjusts sliders → scene responds immediately
  ● Violations appear in red (ViolationMaterial pulse)
  ● Student discovers — rather than memorizes — what causes failures
  ● ComplianceScorecard updates in real time, naming each failing
    check with its code reference

Stage 3 — Unaided Computation (Exam Mode)
  ● labMode = 'exam'
  ● Formula hints suppressed
  ● Scene displays lot with specified parameters
  ● Student derives target value without visual aid
  ● Readiness Score impact active
  ● Incorrect answer → post-answer explanation (not red X)
```

## 5.4 Dual-Mode Architecture

| Dimension | Sandbox / Lab Mode | Exam Mode |
|---|---|---|
| **Purpose** | Spatial understanding, parametric exploration | ALE-calibrated performance testing |
| **Input access** | All parameters exposed | Given (locked); derived (hidden until revealed) |
| **Formula visibility** | Always visible with live values | Hidden; student must recall and solve |
| **3D feedback** | Immediate on every slider change | Deferred until "Submit Answer" |
| **AMBF display** | All three candidates visible simultaneously | One correct answer revealed post-submission |
| **Readiness Score** | No scoring | Feeds Readiness Score recomputation |
| **Sound** | Ambient confirmation tones (opt-in) | Correct/incorrect sound gates (opt-in) |
| **Reveal step** | N/A | 0 = hidden → 1 = binding → 2 = full derivation |

## 5.5 Exam Mode Flow

```
ENTER EXAM MODE
     │
     ▼
[ExamProblemCard]
  "Given: Lot 10m × 30m, Zone R-2, RROW = 6m"
  "What is the maximum allowable building footprint (AMBF)?"
     │
     ▼
[3D Canvas — LOT RENDERED, ENVELOPE HIDDEN]
  Student sees: lot ground, RROW indicator, setback overlay
  Student does NOT see: AMBF envelope, ghost candidates, results panel
     │
     ▼
[ExamAnswerInput]
  "Enter your computed AMBF: [______] sqm"
  [Submit Answer]
     │
     ├── CORRECT ──────────────────────────────────────────────────────►
     │   SOUND: ascending soft chime (220→330→440Hz, sine, 180ms, −12dB)
     │   3D: AMBF envelope animates INTO scene from below (Y: −BHL → 0)
     │   Panel: Three-way check reveals with "✓ Binding: Setback Method"
     │   Score: +1 point to Readiness Score (building-laws/pd1096/rule-viii)
     │   Toast: "Correct. Setback method governs at {value} m²"
     │
     └── INCORRECT ─────────────────────────────────────────────────────►
         SOUND: low dull thud (150Hz, square wave, 80ms, −18dB)
         3D: Correct envelope appears; wrong-zone area flashes red briefly
         Panel: Step-by-step derivation reveals; wrong step highlighted amber
         Toast: "Review: PSO method gives {psoBased}m² but setback governs at {setbackBased}m²"
         Score: Node records miss → amber flag on Development Controls heatmap
```

## 5.6 Closure Equation Strip

The strip docked below the canvas is the spatial memory anchor. It must remain visible at all times in Sandbox mode and during the reveal phase in Exam mode.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│   TLA          =   AMBF          +   ISA          +   USA                    │
│   [300 sqm]       [144 sqm]         [60 sqm]         [30 sqm]               │
│   ██████████      ████████░░░░       ████░░░░░░░░     ████░░░░░░░░░░░        │
│   (full width)    (proportional fill relative to TLA)                        │
│                                                                              │
│   Also:  TLA = MACA + USA  →  [204 sqm] + [30 sqm] = 300 sqm ✓             │
│          MACA = AMBF + ISA →  [144 sqm] + [60 sqm] = 204 sqm ✓             │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Each term color-coded to its ground plane tile in the 3D scene
- Progress bars proportional to TLA (not max width) — the equation made visual
- On hover/tap of any term: corresponding 3D geometry highlights with rim glow
- On closure violation: strip turns red with `≠` indicator

## 5.7 Mobile Adaptation (< 768px)

Draggable bottom sheet pattern:

```
┌──────────────────────────────────────┐
│  [← Lab]  Dev Controls  [LAB|EXAM]  │
├──────────────────────────────────────┤
│      R3F CANVAS (full width)         │  ← 60% viewport height
│  [ORBIT] [TOP] [ISO]                 │
├──────────────────────────────────────┤
│  ── (drag handle) ──────────────── │  ← Bottom sheet
│  TLA = AMBF + ISA + USA            │  20% peek (equation strip only)
│  [300]  [144]  [60]  [30]   sqm    │  40% default (inputs visible)
│  Lot Width [___]m  Depth [___]m     │  85% expanded (full results panel)
│  Zone: [▼ R-2]                      │
│  [Compute Controls]                  │
└──────────────────────────────────────┘
```

## 5.8 Sound Design Specification

All sounds implemented via Web Audio API (`useSoundEngine` hook). Synthesized — no audio file assets. Opt-in per session (Philippine student context: shared study spaces).

| Trigger | Sound Profile | Spec |
|---|---|---|
| Correct answer (exam) | Ascending soft chime | 220→330→440Hz, sine, 180ms, −12dB |
| Incorrect answer | Dull low thud | 150Hz, square wave, 80ms, −18dB |
| Slider drag (sandbox) | Subtle tick per 1% change | 800Hz, 5ms, −24dB |
| Three-way check — binding found | Soft lock click | 600Hz, 30ms |
| Violation detected | Gentle triple pulse | 200Hz × 3, 60ms each, −16dB |
| Exam timer warning (final 60s) | Low ambient hum | 80Hz, sine, −30dB |
| Mode toggle (LAB ↔ EXAM) | Mechanical switch | 400ms, stereo width, −14dB |

## 5.9 Supabase Readiness Score Integration

```typescript
// src/app/dashboard/3d-lab/dev-controls/actions.ts
'use server'

export async function submitExamAnswer(payload: {
  moduleSlug: string
  checkId: 'ambf' | 'tosl' | 'isa' | 'usa' | 'maca' | 'amvb'
  submittedValue: number
  correctValue: number
  lotSnapshot: object
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const isCorrect = Math.abs(payload.submittedValue - payload.correctValue) < 0.5  // ±0.5 sq.m. tolerance

  await supabase.from('exam_answers').insert({
    user_id: user.id,
    module_slug: payload.moduleSlug,
    check_id: payload.checkId,
    submitted_value: payload.submittedValue,
    correct_value: payload.correctValue,
    is_correct: isCorrect,
    lot_snapshot: payload.lotSnapshot,
  })

  // Non-blocking Readiness Score recomputation
  await supabase.rpc('recompute_readiness_score', { p_user_id: user.id })

  revalidatePath('/dashboard')
  return { success: true, isCorrect }
}
```

Taxonomy node updated on every answer: `building-laws/pd1096/rule-viii` → amber/green/red state visible on student heatmap.

---

# Part VI — Performance & Compliance Gates

## 6.1 Compliance Checklist (Required Before Ship)

```
ABSOLUTE BOUNDARIES
[ ] TextGeometry: absent from codebase (grep confirms)
[ ] CSS2DRenderer: absent from codebase
[ ] CSS3DRenderer: absent from codebase
[ ] GEOMETRY_Y values: all unique — TypeScript const assertion verified
[ ] materialCache populated before first selection event (useMaterialCache in CityDiagramScene)
[ ] lib/pd1096/ contains zero React / Three.js / R3F imports (import audit passes)

GEOMETRY
[ ] All geometry is procedural (BufferGeometry/Planes/Boxes) — no GLB files
[ ] useMemo() wraps every geometry constructor with dimension-keyed deps
[ ] useEffect(() => { geometry.dispose() }, [geometry]) on every memoized geometry
[ ] raycast={() => null} on all non-interactive decorative meshes
[ ] Y-axis constants: no two values equal for any coplanar geometries

MATERIALS
[ ] GREYSCALE_MATERIAL and SELECTION_BLUE_MATERIAL are module-level singletons
[ ] No new THREE.Material() instantiated inside useFrame or event handlers
[ ] materialCache.clear() + repopulate() called only when scene geometry rebuilds
[ ] originalMaterial stored as .clone() — not a live reference

RENDERING
[ ] frameloop="demand" — Canvas never renders unless invalidate() is called
[ ] invalidate() called exactly once per parameter change (via useEffect in Canvas)
[ ] useMaterialSwapper subscribes imperatively — zero React re-renders on click
[ ] No setState() inside useFrame
[ ] No allocations (new Vector3, new Color) inside useFrame
[ ] uTime uniform updated via ref mutation in useFrame — no re-render triggered

STATE
[ ] useDevControlsStore selectors are granular — components subscribe to one field
[ ] Every mutating action calls recompute() atomically within the same set() call
[ ] clearSelection() is the exclusive material reset path — no direct mutation from DOM
[ ] useDevControlsStore reset on route change (useEffect cleanup in module root)

ASSET BUDGET
[ ] No GLB files — all geometry procedural
[ ] Module JS bundle (excluding Three.js shared chunk) < 150KB
[ ] Supabase query on page.tsx completes < 200ms (index on lab_sessions.user_id)

RUNTIME — Desktop (M1 MacBook Air)
[ ] Draw calls < 20 per frame (verified via r3f-perf in development)
[ ] Triangle count < 5,000 (all procedural geometry)
[ ] 60fps sustained during slider drag
[ ] Zero React re-renders on slider drag (React DevTools Profiler confirms)

RUNTIME — Mobile (Realme C55 / Samsung A14)
[ ] 30fps minimum during parameter changes
[ ] No jank during first 3 seconds (precompute initial result before Canvas mounts)
[ ] ContactShadows disposed on unmount

CORRECTNESS
[ ] Unit tests pass: computeAMBF (3-way check), computeTOSL (closure identity)
[ ] ISA and USA computed as % of TLA — not as % of TOSL
[ ] AMBF = min(AMBF_setback, AMBF_PSO) — not three-way minimum
[ ] MACA = AMBF + ISA — confirmed in TOSLResult.maca
[ ] Firewall toggle changes PSO column in Table VIII.1 lookup
[ ] BHL angular plane coefficient marked ⚠️ — licensed architect review recorded before merge
[ ] Exam mode fully suppresses formula hints and computed values
[ ] Readiness Score write confirmed by Supabase action on exam answer submit
[ ] TOSL closure identity tolerance: |closureCheck| < 0.01 sq.m.
[ ] Answer tolerance: |submitted − correct| < 0.5 sq.m.
```

## 6.2 Open Audit Items (Must Resolve Before Production)

| Item | Risk | Resolution Required |
|---|---|---|
| `ANGULAR_PLANE_TANGENT = 2.0` in `computeBHL.ts` | High — incorrect BHL produces wrong AMVB; exam answers fail | Licensed architect reviews full 2004 IRR Rule VII Guidelines; confirms or corrects the coefficient and reference point (property line vs. road centerline) |
| ISA/USA ratio convention (% of TLA vs. % of TOSL) | Medium — exam shorthand diverges from canonical IRR | Engine uses canonical IRR form (`isaPercent × TLA`); pedagogical note added to UI explaining both conventions |
| TGFA multiplier (Table VII.G.2) | Medium — 1.50 residential, 1.25–1.33 commercial ranges not fully enumerated by occupancy type | Lookup table `lookupTables.ts` must enumerate multiplier per occupancy group before TGFA function ships |
| R-1 PSO source | Low — R-1 compliance via Table VIII.2 setbacks, not Table VIII.1 PSO | `computeSetbacks` handles R-1 as setback-only; UI warns "R-1: PSO enforced via yard minimums, not direct Table VIII.1 assignment" |

---

# Appendix A — Glossary

| Term | Full Name | Rule Reference |
|---|---|---|
| TLA | Total Lot Area | Rule VIII §802 |
| PSO | Percentage of Site Occupancy | Rule VIII §803 |
| AMBF | Allowable Maximum Building Footprint | Rule VII §704.4 |
| TOSL | Total Open Space within Lot | Rule VIII §803.3b |
| ISA | Maximum Allowable Impervious Surface Area | Rule VIII §803.3b.i |
| USA | Minimum Unpaved Surface Area | Rule VIII §803.3b.ii |
| MACA | Maximum Allowable Construction Area | Rule VIII Table VIII.1 |
| TGFA | Total Gross Floor Area | Rule VII §705 |
| GFA | Gross Floor Area | Rule VII §705 |
| FLAR | Floor to Lot Area Ratio (= FAR) | Rule VII Table VII.G.1 |
| BHL | Building Height Limit | Rule VII §707 |
| AMVB | Allowable Maximum Volume of Building | Rule VII Guidelines |
| RROW | Road Right-of-Way | Rule VIII §804 |
| OFB | Outermost Face of the Building | Rule VII Guidelines |
| OLBP | Outermost Limit of Building Projection | Rule VII Guidelines |

---

# Appendix B — Dependency Graph (Canonical)

```
DevControlsInput
  (lot, zoning, proposed, rrowWidth)
         │
         ▼
computeSetbacks() ──────────────────────────────────────────────────────────────┐
         │                                                                       │
         ▼                                                                       ▼
computeAMBF()                                                             computeBHL()
  ├─ AMBF_setback = buildable W × buildable D                         ⚠️ AUDIT FLAG
  ├─ AMBF_PSO    = psoPercent × TLA
  └─ governing   = min(setback, PSO)
         │
         ├──────────────────┬──────────────────┬───────────────────────────┐
         ▼                  ▼                  ▼                           ▼
computePSO()          computeTOSL()      computeTGFA()             computeMACA()
(open space           ├─ TOSL=TLA−AMBF   ├─ totalGFA=              MACA=AMBF+ISA
 required vs.         ├─ ISA=%TLA        │  footprint×floors
 provided)            ├─ USA=TLA−AMBF−ISA└─ maxAllowable=FAR×TLA
                      ├─ MACA=AMBF+ISA
                      └─ closureCheck
         │                  │                  │                           │
         └──────────────────┴──────────────────┴───────────────────────────┘
                                           │
                                           ▼
                                  DevControlsResult
                                  (overallCompliant)
                                           │
                                           ▼
                                  store.result (atomic write)
                                           │
                        ┌──────────────────┼──────────────────┐
                        ▼                  ▼                  ▼
                    R3F Scene         DOM Overlay         Exam Mode UI
                    (geometry)        (formulas,          (suppressed
                    (color state)     labels, values)     in exam mode)
```

---

*SlateCamp — Development Controls Lab · Master Unification Implementation Plan v1.0*  
*Single source of truth for engineering execution. All computation functions require unit test coverage before production deployment. BHL angular plane coefficient flagged for licensed architect review. Regulatory formulas sourced exclusively from PD 1096 2004 Revised IRR.*
