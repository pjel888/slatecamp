# SlateCamp — 3D Development Controls Lab
## Feature Implementation Plan (FIP)
### PD 1096 IRR Rules VII & VIII Interactive Learning Experience

**Version:** 1.0  
**Stack:** Next.js 14 · React 18 · React Three Fiber · Zustand · Supabase  
**Regulatory Scope:** PD 1096 2004 Revised IRR — Rule VII (Setbacks) · Rule VIII (Development Controls)  
**Classification:** Core ILX Module — Area C Exam Preparation

---

## Verification Report (Split-Step Pre-Check)

Before generating the plan, all required inputs were verified:

| Input | Status | Source |
|---|---|---|
| PD 1096 Rule VII — Setback constraints | ✅ Sufficient | Skills: `slatecamp-3d-code-compliance-viz` |
| PD 1096 Rule VIII — AMBF, PSO, TGFA, ISA, USA, TOSL, MACA | ✅ Sufficient | Skills: `slatecamp-3d-code-compliance-viz`, global schema |
| Zustand global state schema | ✅ Provided | Infrastructure block: `lot`, `zoning`, `examState` |
| R3F/drei rendering API | ✅ Sufficient | Skill: `slatecamp-r3f-api-master` |
| Performance budget and targets | ✅ Sufficient | Skill: `slatecamp-3d-performance-engineer` |
| Next.js 14 Server/Client architecture | ✅ Sufficient | Skill: `slatecamp-nextjs-frontend` |
| Pedagogical UX intent | ✅ Inferable | Skills: `slatecamp-3d-information-designer`, `slatecamp-3d-interaction-designer` |
| Angular plane / TOSL closure identities | ⚠️ Partial | Provided via schema keys; full formula set must be verified against complete IRR text before shipping computation engine |

**Verdict:** Sufficient to produce a complete, actionable FIP. One caveat flagged above: the precise coefficient tables for angular plane reductions (BHL/TOSL) must be cross-referenced against the complete IRR text before the `computeTOSL()` and `computeAngularPlane()` functions are committed to production.

---

# 1. Feature Definition & Pedagogical Intent

## 1.1 What This Feature Is

The **Development Controls Lab** is SlateCamp's highest-leverage interactive 3D module. It transforms the most computationally dense, spatially abstract section of the Philippine Architecture Licensure Examination (ALE) — Area C development controls under PD 1096 IRR Rules VII and VIII — into a manipulable 3D environment where reviewers can see, feel, and compute code compliance in real time.

The module delivers a parametric, interactive 3D lot with a buildable envelope that dynamically responds to the student's inputs: lot dimensions, occupancy group, zoning classification, building height, floor count, and derived building footprint. Every adjustment produces an immediate visual and numerical consequence grounded in legally accurate computation.

## 1.2 Why It Is Critical for ALE Reviewers

**The failure pattern this feature attacks is specific and well-documented:**

Reviewers who fail Area C do not fail because they don't know what AMBF means. They fail because they cannot perform the **three-way AMBF check** under time pressure, they confuse PSO with ISA, they misapply the angular plane to BHL reduction, or they lose the TOSL closure identity when floor areas change. These are not conceptual failures — they are **procedural and spatial failures**. The student can define every term and still miss every computation.

The root cause is that PD 1096's development controls are taught as a list of formulas on a flat page. There is no feedback loop, no spatial anchor, and no moment where a wrong answer produces a visible consequence. Students memorize without internalizing.

**This feature provides the missing feedback loop:**

| What the Student Does | What the Lab Shows |
|---|---|
| Reduces lot width | Buildable envelope shrinks; AMBF updates in real time |
| Increases floor count past TGFA limit | Violation shader activates on excess floors |
| Sets building footprint beyond AMBF | Red overlay with exact overage in sq.m. |
| Mismatches BHL with angular plane result | Height violation indicator triggers at roof plane |
| Fails PSO minimum | Open space zone turns red; shortfall value displayed |
| Toggling exam mode | Input panel hides formula hints; score impact activates |

## 1.3 Pedagogical Framework: Cognitive Load Management

The feature implements a **three-stage cognitive scaffolding model:**

**Stage 1 — Spatial Anchoring (Sandbox Mode)**  
The student sees a fully computed, compliant lot. All values are within legal limits. Labels are visible. Formula hints are available on hover. The goal is to establish the spatial relationship between lot, setback envelope, buildable volume, and permitted floor area before any computation is demanded.

**Stage 2 — Violation Discovery (Sandbox Mode — Parameter Manipulation)**  
The student adjusts sliders and inputs. The scene responds. Violations appear in red. The student discovers — rather than memorizes — what causes an AMBF exceedance, a PSO failure, or a BHL violation. The `ComplianceScorecard` component updates in real time, naming each failing check with its code reference.

**Stage 3 — Unaided Computation (Exam Mode)**  
The `examState.mode` flag switches to `'exam'`. Formula hints are suppressed. The scene displays a lot with specified parameters and asks the student to derive a target value. The Readiness Score impact is active. Incorrect answers trigger a post-answer explanation, not a red X.

## 1.4 Strategic Importance

This module is SlateCamp's clearest demonstration of what no other ALE review platform provides: a legally accurate, spatially honest, computationally verifiable interactive experience. It is a moat feature — difficult to replicate without the same precision investment — and a conversion driver, because it is immediately legible as superior to any textbook or reviewer PDF.

---

# 2. Engineering Intent & Tech Stack Best Practices

## 2.1 Architectural Principle: Strict Separation of Computation and Rendering

The governing architectural law of this module is:

> **PD 1096 computation logic must have zero dependency on React, R3F, Three.js, or any rendering primitive.**

This is not a style preference. It is a correctness guarantee. The computation engine is a pure TypeScript module. It receives numbers, returns numbers. It can be unit-tested in isolation, audited by a licensed architect, and shared between the 3D scene and a 2D fallback without modification.

The rendering layer reads from computed outputs — it never recomputes, interpolates, or approximates code values.

```
┌─────────────────────────────────────────────────────────────────┐
│  COMPUTATION LAYER (Pure TypeScript — zero React imports)       │
│  src/lib/pd1096/                                                │
│  ├── computeSetbacks()                                          │
│  ├── computeAMBF()      ← 3-way check: setback vs. zoning vs.  │
│  │                           max footprint                      │
│  ├── computePSO()                                               │
│  ├── computeISA()                                               │
│  ├── computeUSA()                                               │
│  ├── computeTOSL()      ← Area closure identity                 │
│  ├── computeMACA()                                              │
│  ├── computeTGFA()                                              │
│  └── computeBHL()       ← Angular plane + zoning cap            │
└─────────────────────────┬───────────────────────────────────────┘
                          │ outputs DevControlsResult (plain object)
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│  ZUSTAND STORE (src/stores/useDevControlsStore.ts)              │
│  Reads global lot + zoning state → runs computation engine →   │
│  writes DevControlsResult into store                            │
└─────────────────────────┬───────────────────────────────────────┘
                          │ selectors (granular, re-render safe)
          ┌───────────────┼───────────────┐
          │               │               │
┌─────────▼─────┐ ┌───────▼──────┐ ┌────▼──────────────────────┐
│  R3F Scene    │ │  Dashboard   │ │  Compliance Scorecard     │
│  (Canvas)     │ │  Overlay     │ │  (DOM — outside Canvas)   │
│               │ │  (Html/DOM)  │ │                           │
│  BuildableVol │ │  AMBF badge  │ │  Pass/Fail per check      │
│  SetbackZones │ │  TGFA meter  │ │  Code reference labels    │
│  ViolShaders  │ │  Slider UI   │ │  Score impact indicator   │
└───────────────┘ └──────────────┘ └───────────────────────────┘
```

## 2.2 Next.js 14 Server / Client Boundary Map

| File | Directive | Reason |
|---|---|---|
| `app/dashboard/3d-lab/dev-controls/page.tsx` | Server (none) | Fetches initial lot/zoning data from Supabase; no interactivity |
| `app/dashboard/3d-lab/dev-controls/loading.tsx` | Server (none) | Static skeleton |
| `components/3d-lab/DevControlsModule/index.tsx` | `'use client'` | Zustand store access; Canvas wrapper |
| `components/3d-lab/DevControlsModule/DevControlsCanvas.tsx` | `'use client'` | R3F Canvas — always client |
| `components/3d-lab/DevControlsModule/DevControlsDashboard.tsx` | `'use client'` | Slider interactivity; Zustand reads |
| `components/3d-lab/DevControlsModule/ComplianceScorecard.tsx` | `'use client'` | Real-time score updates from store |
| `lib/pd1096/computationEngine.ts` | *(none — not a component)* | Pure TS module; no directive required or permitted |
| `stores/useDevControlsStore.ts` | *(none — not a component)* | Zustand store module |
| `app/dashboard/3d-lab/dev-controls/actions.ts` | `'use server'` | Supabase writes for Readiness Score, exam session persistence |

**Critical Rule:** `DevControlsCanvas.tsx` and all files it imports must never contain a server-only import (`next/headers`, Supabase server client, etc.). The Canvas boundary is a hard client wall.

```tsx
// app/dashboard/3d-lab/dev-controls/page.tsx
// NO 'use client' directive — Server Component

import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/server'
import { DevControlsSkeleton } from '@/components/3d-lab/DevControlsModule/skeletons/DevControlsSkeleton'

// Dynamic import with SSR disabled — mandatory for any R3F module
const DevControlsModule = dynamic(
  () => import('@/components/3d-lab/DevControlsModule'),
  {
    ssr: false,
    loading: () => <DevControlsSkeleton />,
  }
)

export default async function DevControlsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch user's saved lot/zoning preferences or use defaults
  const { data: savedParams } = await supabase
    .from('lab_sessions')
    .select('lot_params, zoning_params')
    .eq('user_id', user?.id)
    .eq('module_slug', 'dev-controls')
    .maybeSingle()

  return (
    <main className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <DevControlsModule initialParams={savedParams} />
    </main>
  )
}
```

## 2.3 R3F Render Optimization Strategy

### 2.3.1 On-Demand Rendering

The Development Controls scene is **not continuously animated**. The buildable envelope is static until a parameter changes. This mandates `frameloop="demand"`:

```tsx
<Canvas
  frameloop="demand"
  gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
  dpr={[1, 1.5]}   // Cap at 1.5 — mobile GPU budget
  shadows="soft"
  camera={{ position: [12, 10, 14], fov: 42 }}
  style={{ background: '#F2F0EB' }}
>
```

Every time a Zustand store value changes (e.g., `lot.width`, `zoning.psoPercent`), the computation engine reruns and `invalidate()` is called once. This produces exactly one re-render frame per parameter change — not 60 frames per second of idle waste.

### 2.3.2 Draw Call Budget

| Scene Element | Mesh Count | Draw Calls | Strategy |
|---|---|---|---|
| Lot ground plane | 1 | 1 | Single PlaneGeometry |
| Setback zones (4 sides) | 4 | 1 | InstancedMesh, 4 instances |
| Buildable envelope (AMBF) | 1 | 1 | BoxGeometry with transparent material |
| Floor slabs (up to 20) | 20 | 1 | `Instances` from drei |
| PSO open-space overlay | 1 | 1 | PlaneGeometry |
| Violation overlay | 1 | 1 | ViolationMaterial shader |
| Dimension annotations (Html) | ~8 | 0 (DOM) | drei `Html` |
| Ground shadow | 0 | 1 | `ContactShadows` |
| **TOTAL** | | **< 8 draw calls** | Well within 50-call budget |

### 2.3.3 Geometry Instancing for Floor Slabs

```tsx
import { Instances, Instance } from '@react-three/drei'

function FloorSlabs({ floorCount, footprintWidth, footprintDepth, floorHeight }: FloorSlabProps) {
  const isViolating = useDevControlsStore(s => s.result.tgfa.isCompliant === false)
  const maxCompliantFloors = useDevControlsStore(s => s.result.tgfa.maxCompliantFloors)

  return (
    <Instances limit={30} castShadow receiveShadow>
      <boxGeometry args={[footprintWidth, floorHeight * 0.85, footprintDepth]} />
      <meshStandardMaterial
        color="#D8D4CB"
        roughness={0.8}
        metalness={0}
        transparent
        opacity={0.92}
      />
      {Array.from({ length: floorCount }, (_, i) => (
        <Instance
          key={i}
          position={[
            footprintWidth / 2,
            i * floorHeight + floorHeight / 2,
            footprintDepth / 2,
          ]}
          // Floors exceeding TGFA limit render differently via shader override
          // handled by ViolationMaterial on a separate overlay mesh
        />
      ))}
    </Instances>
  )
}
```

### 2.3.4 Memoization Strategy

Scene geometry is expensive to recompute. Use `useMemo` for all derived Three.js objects:

```tsx
// ❌ Recomputes geometry on every render
function BuildableEnvelope({ width, depth, height }) {
  return (
    <mesh>
      <boxGeometry args={[width, height, depth]} />
    </mesh>
  )
}

// ✅ Geometry only rebuilt when dimensions change
function BuildableEnvelope({ width, depth, height }: EnvelopeProps) {
  const geometry = useMemo(
    () => new THREE.BoxGeometry(width, height, depth),
    [width, height, depth]
  )

  useEffect(() => {
    return () => { geometry.dispose() }
  }, [geometry])

  return (
    <mesh geometry={geometry} position={[width / 2, height / 2, depth / 2]}>
      <meshStandardMaterial color="#1B3FC4" transparent opacity={0.10} side={THREE.DoubleSide} />
    </mesh>
  )
}
```

## 2.4 Zustand State Architecture

The global schema provided in the infrastructure block is extended into a `useDevControlsStore` that handles both raw input and computed output, cleanly separated.

### 2.4.1 Store Design Principles

1. **Raw inputs** (lot dimensions, zoning params) live in the global store as specified in the infrastructure schema.
2. **Computed outputs** (AMBF result, PSO status, TGFA status, violation flags) are derived and stored as a single `DevControlsResult` object, recomputed atomically.
3. **UI state** (active hotspot, visible layers, exam mode progress) lives in a separate UI slice.
4. No component ever calls a computation function directly. All computation is centralized in the store's `recompute()` action.

### 2.4.2 Store Schema

```typescript
// src/stores/useDevControlsStore.ts
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { runDevControlsEngine } from '@/lib/pd1096/computationEngine'

// ── Input Types ────────────────────────────────────────────────────────────────

interface LotState {
  width: number        // meters
  depth: number        // meters
  tla: number          // Total Lot Area (auto-derived: width × depth for rect lots)
}

interface ZoningState {
  zoneClass: string        // e.g., 'R-2', 'C-1', 'MXD'
  psoPercent: number       // Percentage of Site Occupancy (e.g., 0.70 = 70%)
  isaPercent: number       // Impervious Surface Area %
  usaPercent: number       // Unpaved Surface Area %
  bhl: number              // Building Height Limit (meters)
}

interface ExamState {
  mode: 'sandbox' | 'exam'
  readinessScoreImpact: boolean
}

// ── Output Types ───────────────────────────────────────────────────────────────

interface SetbackResult {
  front: number; rear: number; left: number; right: number
}

interface AMBFResult {
  buildableWidth: number
  buildableDepth: number
  maxBySetback: number         // sq.m. — from setback deduction
  maxByZoning: number          // sq.m. — from PSO/coverage ratio
  maxByCode: number            // sq.m. — from absolute code cap (if applicable)
  allowableAMBF: number        // sq.m. — minimum of all three checks (governing value)
  proposedFootprint: number    // sq.m.
  isCompliant: boolean
  overage: number              // sq.m. — 0 if compliant
}

interface TGFAResult {
  totalGFA: number
  maxAllowable: number         // FAR × TLA
  isCompliant: boolean
  remainingAllowable: number
  maxCompliantFloors: number   // computed floor count at which TGFA limit is hit
}

interface TOSLResult {
  tosl: number                 // TOSL = TLA − AMBF
  isa: number                  // Impervious Surface Area
  usa: number                  // Unpaved Surface Area
  closureCheck: number         // TOSL − ISA − USA (must equal 0)
  isIdentitySatisfied: boolean
}

interface BHLResult {
  zoningCap: number            // meters — from zoning classification
  angularPlaneResult: number   // meters — from angular plane computation
  governingBHL: number         // minimum of zoning cap and angular plane
  proposedHeight: number
  isCompliant: boolean
}

export interface DevControlsResult {
  setbacks: SetbackResult
  ambf: AMBFResult
  pso: { openSpaceRequired: number; openSpaceProvided: number; isCompliant: boolean }
  tgfa: TGFAResult
  tosl: TOSLResult
  bhl: BHLResult
  overallCompliant: boolean
}

// ── Store Interface ────────────────────────────────────────────────────────────

interface DevControlsStore {
  // Global inputs (match infrastructure schema)
  lot: LotState
  zoning: ZoningState
  examState: ExamState

  // Derived scene parameters (user-controlled, not part of code computation)
  proposedFloors: number
  proposedFootprintWidth: number
  proposedFootprintDepth: number
  proposedHeight: number

  // Computed output
  result: DevControlsResult

  // Actions
  setLot: (patch: Partial<LotState>) => void
  setZoning: (patch: Partial<ZoningState>) => void
  setProposedFloors: (n: number) => void
  setProposedFootprint: (w: number, d: number) => void
  setProposedHeight: (h: number) => void
  setExamMode: (mode: 'sandbox' | 'exam') => void

  // UI State
  activeHotspot: string | null
  setActiveHotspot: (id: string | null) => void
  visibleLayers: ('setbacks' | 'ambf' | 'pso' | 'bhl' | 'floors')[]
  toggleLayer: (layer: string) => void
}
```

### 2.4.3 Atomic Recompute Pattern

```typescript
// Pattern: every mutating action calls recompute() atomically
// No intermediate states where inputs are updated but outputs are stale

const recompute = (state: Omit<DevControlsStore, 'result'>): DevControlsResult => {
  return runDevControlsEngine({
    lot: state.lot,
    zoning: state.zoning,
    proposedFloors: state.proposedFloors,
    proposedFootprintWidth: state.proposedFootprintWidth,
    proposedFootprintDepth: state.proposedFootprintDepth,
    proposedHeight: state.proposedHeight,
  })
}

export const useDevControlsStore = create<DevControlsStore>()(
  subscribeWithSelector((set, get) => ({
    // ... initial state ...

    setLot: (patch) => set((s) => {
      const newLot = { ...s.lot, ...patch, tla: (patch.width ?? s.lot.width) * (patch.depth ?? s.lot.depth) }
      const nextState = { ...s, lot: newLot }
      return { lot: newLot, result: recompute(nextState) }
    }),

    setZoning: (patch) => set((s) => {
      const newZoning = { ...s.zoning, ...patch }
      const nextState = { ...s, zoning: newZoning }
      return { zoning: newZoning, result: recompute(nextState) }
    }),

    setProposedFloors: (n) => set((s) => {
      const nextState = { ...s, proposedFloors: n }
      return { proposedFloors: n, result: recompute(nextState) }
    }),
  }))
)
```

### 2.4.4 Canvas Subscription (Zero Re-render Cascade)

```tsx
// Inside Canvas — fine-grained selectors prevent over-renders

function BuildableEnvelopeMesh() {
  // Re-renders ONLY when these specific values change
  const { buildableWidth, buildableDepth } = useDevControlsStore(s => s.result.ambf)
  const bhl = useDevControlsStore(s => s.result.bhl.governingBHL)
  const invalidate = useThree(s => s.invalidate)

  useEffect(() => { invalidate() }, [buildableWidth, buildableDepth, bhl, invalidate])

  const geometry = useMemo(
    () => new THREE.BoxGeometry(buildableWidth, bhl, buildableDepth),
    [buildableWidth, bhl, buildableDepth]
  )

  return (
    <mesh geometry={geometry} position={[buildableWidth / 2, bhl / 2, buildableDepth / 2]}>
      <meshStandardMaterial color="#1B3FC4" transparent opacity={0.08} side={THREE.DoubleSide} />
    </mesh>
  )
}
```

---

# 3. Technical Implementation Blueprint

## 3.1 Folder Hierarchy

```
src/
├── app/
│   └── dashboard/
│       └── 3d-lab/
│           └── dev-controls/
│               ├── page.tsx               # Server Component — data fetch + dynamic import
│               ├── loading.tsx            # Static skeleton (Suspense boundary)
│               └── actions.ts             # 'use server' — Supabase writes for exam sessions
│
├── components/
│   └── 3d-lab/
│       └── DevControlsModule/
│           ├── index.tsx                  # 'use client' — module root, layout shell
│           │
│           ├── canvas/
│           │   ├── DevControlsCanvas.tsx  # 'use client' — R3F Canvas + scene setup
│           │   ├── scene/
│           │   │   ├── LotGround.tsx      # Ground plane + lot boundary
│           │   │   ├── SetbackZones.tsx   # 4 setback plane overlays (InstancedMesh)
│           │   │   ├── BuildableEnvelope.tsx  # AMBF volume (transparent box)
│           │   │   ├── FloorSlabs.tsx     # Proposed building floors (Instances)
│           │   │   ├── ViolationOverlay.tsx   # ViolationMaterial shader meshes
│           │   │   ├── PSZOpenSpace.tsx   # PSO open-space ground highlight
│           │   │   └── DimensionLines.tsx # Annotation lines (drei Line + Html labels)
│           │   └── hotspots/
│           │       ├── HotspotSystem.tsx  # Hotspot registry + active state
│           │       └── hotspot-data.ts    # Static content: labels, code refs, descriptions
│           │
│           ├── dashboard/
│           │   ├── DevControlsDashboard.tsx   # 'use client' — right-panel UI shell
│           │   ├── LotInputPanel.tsx          # Lot dimension sliders
│           │   ├── ZoningInputPanel.tsx       # Zone class selector + parameter sliders
│           │   ├── ProposedBuildingPanel.tsx  # Proposed floors/footprint/height controls
│           │   ├── ComplianceScorecard.tsx    # Live pass/fail for all checks
│           │   ├── ComputationStepCard.tsx    # Step-by-step formula reveal
│           │   └── ExamModeToggle.tsx         # Sandbox ↔ Exam mode switcher
│           │
│           └── skeletons/
│               └── DevControlsSkeleton.tsx    # Skeleton shown during dynamic import
│
├── lib/
│   └── pd1096/
│       ├── computationEngine.ts           # Main entry — orchestrates all checks
│       ├── computeSetbacks.ts             # Rule VII — setback requirements
│       ├── computeAMBF.ts                 # Rule VIII — AMBF 3-way check
│       ├── computePSO.ts                  # Rule VIII — Percentage of Site Occupancy
│       ├── computeTOSL.ts                 # Rule VIII — TOSL closure identity
│       ├── computeTGFA.ts                 # Rule VIII — Total Gross Floor Area
│       ├── computeBHL.ts                  # Rule VIII — Building Height Limit
│       ├── computeISA.ts                  # Rule VIII — Impervious Surface Area
│       ├── computeMACA.ts                 # Rule VIII — Maximum Allowable Construction Area
│       ├── types.ts                       # All shared input/output TypeScript types
│       └── __tests__/
│           ├── computeAMBF.test.ts        # Unit tests for AMBF 3-way check
│           ├── computeTOSL.test.ts        # Unit tests for area closure identity
│           └── computeBHL.test.ts         # Unit tests for angular plane reduction
│
└── stores/
    └── useDevControlsStore.ts             # Zustand store (see Section 2.4)
```

## 3.2 PD 1096 Computation Engine — Complete Schema

All functions in `src/lib/pd1096/` follow these strict SOLID principles:

- **Single Responsibility:** One function, one code check. `computeAMBF` does not touch BHL.
- **Open/Closed:** New occupancy groups extend `SETBACK_TABLE` without modifying `computeSetbacks`.
- **Liskov Substitution:** All compute functions accept the same `LotData | ZoningData` interface.
- **Interface Segregation:** Each function receives only the slice of data it needs.
- **Dependency Inversion:** The computation engine depends on abstractions (`LotData`) not implementations (UI store shapes).

### 3.2.1 Types Module

```typescript
// src/lib/pd1096/types.ts

export interface LotData {
  width: number          // meters
  depth: number          // meters
  tla: number            // sq.m. — Total Lot Area
  frontage: 'road' | 'alley'
  occupancyGroup: string // 'A-1' | 'A-2' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I'
}

export interface ZoningData {
  zoneClass: string
  psoPercent: number       // decimal (0.0–1.0)
  isaPercent: number       // decimal
  usaPercent: number       // decimal
  bhl: number              // meters — zoning authority cap
  far: number              // Floor Area Ratio
  maxLotCoverage: number   // decimal (0.0–1.0)
}

export interface ProposedBuilding {
  footprintWidth: number   // meters
  footprintDepth: number   // meters
  floors: number           // integer
  floorHeight: number      // meters per floor (default: 3.0)
  proposedHeight: number   // meters — total building height
}

export interface DevControlsInput {
  lot: LotData
  zoning: ZoningData
  proposed: ProposedBuilding
}

// Re-export result types (defined in Section 2.4.2)
export type {
  SetbackResult,
  AMBFResult,
  TGFAResult,
  TOSLResult,
  BHLResult,
  DevControlsResult,
}
```

### 3.2.2 AMBF Three-Way Check

```typescript
// src/lib/pd1096/computeAMBF.ts
// PD 1096 IRR Rule VIII — Allowable Maximum Building Footprint
// The AMBF is governed by the MOST RESTRICTIVE of three independent checks.

import type { LotData, ZoningData, SetbackResult, AMBFResult } from './types'

export function computeAMBF(
  lot: LotData,
  zoning: ZoningData,
  setbacks: SetbackResult,
  proposedFootprintWidth: number,
  proposedFootprintDepth: number
): AMBFResult {
  // CHECK 1: Setback Deduction
  // Buildable dimensions after mandatory setbacks are removed
  const buildableWidth = lot.width - setbacks.left - setbacks.right
  const buildableDepth = lot.depth - setbacks.front - setbacks.rear
  const maxBySetback = buildableWidth * buildableDepth

  // CHECK 2: Zoning Maximum Lot Coverage
  // PSO percent defines maximum percentage of lot that may be built upon
  const maxByZoning = lot.tla * zoning.maxLotCoverage

  // CHECK 3: Code Absolute Cap (PSO-derived open space floor)
  // Open space requirement imposes a hard ceiling on footprint
  const requiredOpenSpace = lot.tla * (1 - zoning.psoPercent)
  const maxByCode = lot.tla - requiredOpenSpace  // equivalent to lot.tla * psoPercent

  // GOVERNING VALUE: Most restrictive (minimum) of all three checks
  const allowableAMBF = Math.min(maxBySetback, maxByZoning, maxByCode)

  const proposedFootprint = proposedFootprintWidth * proposedFootprintDepth
  const isCompliant = proposedFootprint <= allowableAMBF
  const overage = isCompliant ? 0 : proposedFootprint - allowableAMBF

  return {
    buildableWidth,
    buildableDepth,
    maxBySetback,
    maxByZoning,
    maxByCode,
    allowableAMBF,
    proposedFootprint,
    isCompliant,
    overage,
  }
}
```

### 3.2.3 TOSL Closure Identity

```typescript
// src/lib/pd1096/computeTOSL.ts
// PD 1096 IRR Rule VIII — Total Open Space within Lot
// Identity: TOSL = ISA + USA
// Where: TOSL = TLA − AMBF

import type { LotData, ZoningData, AMBFResult, TOSLResult } from './types'

export function computeTOSL(
  lot: LotData,
  zoning: ZoningData,
  ambfResult: AMBFResult
): TOSLResult {
  // TOSL derivation
  const tosl = lot.tla - ambfResult.allowableAMBF

  // ISA: Impervious but unbuilt surfaces (paving, driveways, hardscape)
  const isa = lot.tla * zoning.isaPercent

  // USA: Unpaved/landscaped surfaces (gardens, permeable ground)
  const usa = lot.tla * zoning.usaPercent

  // Closure identity check: ISA + USA must equal TOSL
  // In practice, floating point tolerance of ±0.01 sq.m. is acceptable
  const closureCheck = tosl - isa - usa
  const isIdentitySatisfied = Math.abs(closureCheck) < 0.01

  return { tosl, isa, usa, closureCheck, isIdentitySatisfied }
}
```

### 3.2.4 TGFA Computation

```typescript
// src/lib/pd1096/computeTGFA.ts
// PD 1096 IRR Rule VIII — Total Gross Floor Area

import type { LotData, ZoningData, ProposedBuilding, TGFAResult } from './types'

export function computeTGFA(
  lot: LotData,
  zoning: ZoningData,
  proposed: ProposedBuilding,
  proposedFootprint: number
): TGFAResult {
  // Total GFA = sum of all floor areas
  // For rectangular uniform floors: GFA per floor = footprint area
  const totalGFA = proposedFootprint * proposed.floors

  // Maximum allowable TGFA = FAR × TLA
  const maxAllowable = zoning.far * lot.tla

  const isCompliant = totalGFA <= maxAllowable
  const remainingAllowable = Math.max(0, maxAllowable - totalGFA)

  // How many floors at the proposed footprint fit within TGFA limit?
  const maxCompliantFloors = Math.floor(maxAllowable / proposedFootprint)

  return {
    totalGFA,
    maxAllowable,
    isCompliant,
    remainingAllowable,
    maxCompliantFloors,
  }
}
```

### 3.2.5 BHL Angular Plane Check

```typescript
// src/lib/pd1096/computeBHL.ts
// PD 1096 IRR Rule VIII — Building Height Limit
// BHL is governed by the LESSER of: (a) zoning authority cap, (b) angular plane result
//
// ⚠️ AUDIT FLAG: The angular plane computation coefficient and reference point
// (property line vs. road centerline) must be verified against the complete
// 2004 Revised IRR text before this function ships to production.

import type { LotData, ZoningData, ProposedBuilding, BHLResult } from './types'

// Angular plane: building face must fall within a plane rising from the property line
// at a regulated angle. Approximation: height ≤ (setbackDistance × angleTangent)
// The coefficient below is a placeholder — confirm from IRR tables.
const ANGULAR_PLANE_TANGENT = 2.0  // ⚠️ VERIFY AGAINST IRR — placeholder value

export function computeBHL(
  lot: LotData,
  zoning: ZoningData,
  proposed: ProposedBuilding,
  frontSetback: number
): BHLResult {
  // Check A: Zoning authority hard cap
  const zoningCap = zoning.bhl

  // Check B: Angular plane from front property line
  // Height limit derived from setback depth and regulated slope
  const angularPlaneResult = frontSetback * ANGULAR_PLANE_TANGENT

  // Governing BHL: lesser of the two
  const governingBHL = Math.min(zoningCap, angularPlaneResult)

  const isCompliant = proposed.proposedHeight <= governingBHL

  return {
    zoningCap,
    angularPlaneResult,
    governingBHL,
    proposedHeight: proposed.proposedHeight,
    isCompliant,
  }
}
```

### 3.2.6 Computation Engine Entry Point

```typescript
// src/lib/pd1096/computationEngine.ts
// Orchestrates all PD 1096 Rule VII & VIII checks in the correct dependency order.
// This is the ONLY function called by the Zustand store.

import type { DevControlsInput, DevControlsResult } from './types'
import { computeSetbacks } from './computeSetbacks'
import { computeAMBF } from './computeAMBF'
import { computePSO } from './computePSO'
import { computeTOSL } from './computeTOSL'
import { computeTGFA } from './computeTGFA'
import { computeBHL } from './computeBHL'

export function runDevControlsEngine(input: DevControlsInput): DevControlsResult {
  const { lot, zoning, proposed } = input

  // Step 1: Setbacks (Rule VII) — all downstream checks depend on this
  const setbacks = computeSetbacks(lot, lot.occupancyGroup)

  // Step 2: AMBF 3-way check (Rule VIII)
  const ambf = computeAMBF(lot, zoning, setbacks, proposed.footprintWidth, proposed.footprintDepth)

  // Step 3: PSO (Rule VIII) — depends on AMBF result
  const pso = computePSO(lot, zoning, ambf.proposedFootprint)

  // Step 4: TOSL identity (Rule VIII) — depends on AMBF result
  const tosl = computeTOSL(lot, zoning, ambf)

  // Step 5: TGFA (Rule VIII) — depends on AMBF footprint
  const tgfa = computeTGFA(lot, zoning, proposed, ambf.proposedFootprint)

  // Step 6: BHL (Rule VIII) — depends on setback (front)
  const bhl = computeBHL(lot, zoning, proposed, setbacks.front)

  // Overall compliance: ALL checks must pass
  const overallCompliant =
    ambf.isCompliant &&
    pso.isCompliant &&
    tosl.isIdentitySatisfied &&
    tgfa.isCompliant &&
    bhl.isCompliant

  return { setbacks, ambf, pso, tosl, tgfa, bhl, overallCompliant }
}
```

## 3.3 R3F Scene Component Tree

```tsx
// src/components/3d-lab/DevControlsModule/canvas/DevControlsCanvas.tsx
'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { Suspense } from 'react'
import { LotGround } from './scene/LotGround'
import { SetbackZones } from './scene/SetbackZones'
import { BuildableEnvelope } from './scene/BuildableEnvelope'
import { FloorSlabs } from './scene/FloorSlabs'
import { ViolationOverlay } from './scene/ViolationOverlay'
import { PSZOpenSpace } from './scene/PSZOpenSpace'
import { DimensionLines } from './scene/DimensionLines'
import { HotspotSystem } from './hotspots/HotspotSystem'
import { useDevControlsStore } from '@/stores/useDevControlsStore'

export function DevControlsCanvas() {
  const visibleLayers = useDevControlsStore(s => s.visibleLayers)

  return (
    <Canvas
      frameloop="demand"
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      dpr={[1, 1.5]}
      shadows="soft"
      camera={{ position: [18, 14, 20], fov: 42, near: 0.1, far: 500 }}
      style={{ background: '#F2F0EB' }}
      onPointerMissed={() => useDevControlsStore.getState().setActiveHotspot(null)}
    >
      <Suspense fallback={null}>
        {/* Lighting Rig */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[15, 20, 12]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={80}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        <Environment preset="city" background={false} />

        {/* Scene Geometry — rendered in layered Z-depth order */}
        <LotGround />
        {visibleLayers.includes('pso') && <PSZOpenSpace />}
        {visibleLayers.includes('setbacks') && <SetbackZones />}
        {visibleLayers.includes('ambf') && <BuildableEnvelope />}
        {visibleLayers.includes('floors') && <FloorSlabs />}
        <ViolationOverlay />

        {/* Annotations */}
        <DimensionLines />
        <HotspotSystem />

        {/* Ground Shadow */}
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.3}
          scale={60}
          blur={2.5}
          far={10}
        />

        {/* Controls */}
        <OrbitControls
          makeDefault
          enablePan
          panSpeed={0.6}
          minDistance={5}
          maxDistance={60}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI / 2 - 0.05}  // Prevent camera going underground
          target={[8, 2, 8]}
        />

        {/* Development profiler — strip before production */}
        {process.env.NODE_ENV === 'development' && (
          // <Perf position="top-left" />  // Add r3f-perf if needed
          null
        )}
      </Suspense>
    </Canvas>
  )
}
```

## 3.4 Violation Shader — ViolationMaterial

The `ViolationMaterial` provides the visual feedback loop central to the module's pedagogy. It pulses red on any mesh when the corresponding check is failing.

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
  /* vertex */ /*glsl*/`
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* fragment */ /*glsl*/`
    uniform vec3 uBaseColor;
    uniform vec3 uViolationColor;
    uniform float uViolationAmount;
    uniform float uTime;
    uniform float uOpacity;
    varying vec3 vNormal;

    void main() {
      float light = dot(vNormal, normalize(vec3(1.0, 1.5, 1.0))) * 0.4 + 0.6;
      // Slow pulse — 1.5 Hz — noticeable but not distracting
      float pulse = sin(uTime * 9.42) * 0.5 + 0.5;
      float intensity = uViolationAmount * (0.6 + 0.4 * pulse);
      vec3 color = mix(uBaseColor, uViolationColor, intensity);
      gl_FragColor = vec4(color * light, uOpacity);
    }
  `
)

extend({ ViolationMaterial })

// TypeScript JSX namespace extension
declare global {
  namespace JSX {
    interface IntrinsicElements {
      violationMaterial: import('@react-three/fiber').ReactThreeFiber.Object3DNode<
        InstanceType<typeof ViolationMaterial>,
        typeof ViolationMaterial
      >
    }
  }
}
```

## 3.5 UI Dashboard — ComplianceScorecard

```tsx
// src/components/3d-lab/DevControlsModule/dashboard/ComplianceScorecard.tsx
'use client'

import { useDevControlsStore } from '@/stores/useDevControlsStore'

interface ScorecardRow {
  label: string
  codeRef: string
  getValue: (result: import('@/lib/pd1096/types').DevControlsResult) => string
  isPass: (result: import('@/lib/pd1096/types').DevControlsResult) => boolean
}

const SCORECARD_ROWS: ScorecardRow[] = [
  {
    label: 'AMBF — 3-Way Check',
    codeRef: 'PD 1096 IRR Rule VIII',
    getValue: (r) => `${r.ambf.proposedFootprint.toFixed(1)} / ${r.ambf.allowableAMBF.toFixed(1)} sq.m.`,
    isPass: (r) => r.ambf.isCompliant,
  },
  {
    label: 'PSO — Open Space',
    codeRef: 'PD 1096 IRR Rule VIII',
    getValue: (r) => `${r.pso.openSpaceProvided.toFixed(1)} / ${r.pso.openSpaceRequired.toFixed(1)} sq.m. required`,
    isPass: (r) => r.pso.isCompliant,
  },
  {
    label: 'TOSL — Area Closure',
    codeRef: 'PD 1096 IRR Rule VIII',
    getValue: (r) => `ISA + USA Δ = ${r.tosl.closureCheck.toFixed(2)} sq.m.`,
    isPass: (r) => r.tosl.isIdentitySatisfied,
  },
  {
    label: 'TGFA — Floor Area Cap',
    codeRef: 'PD 1096 IRR Rule VIII',
    getValue: (r) => `${r.tgfa.totalGFA.toFixed(1)} / ${r.tgfa.maxAllowable.toFixed(1)} sq.m. (FAR)`,
    isPass: (r) => r.tgfa.isCompliant,
  },
  {
    label: 'BHL — Height Limit',
    codeRef: 'PD 1096 IRR Rule VIII',
    getValue: (r) => `${r.bhl.proposedHeight.toFixed(1)}m / ${r.bhl.governingBHL.toFixed(1)}m limit`,
    isPass: (r) => r.bhl.isCompliant,
  },
]

export function ComplianceScorecard() {
  const result = useDevControlsStore(s => s.result)
  const examMode = useDevControlsStore(s => s.examState.mode)

  const passCount = SCORECARD_ROWS.filter(row => row.isPass(result)).length

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-1">
        Development Controls Check
      </p>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="font-display text-2xl font-extrabold text-gray-900">
          {passCount}/{SCORECARD_ROWS.length}
        </span>
        <span className="font-sans text-xs text-muted-foreground">requirements met</span>
      </div>

      <div className="space-y-2.5">
        {SCORECARD_ROWS.map((row) => {
          const pass = row.isPass(result)
          return (
            <div key={row.label} className="flex items-start gap-2.5">
              <div className={`mt-0.5 h-3 w-3 flex-shrink-0 rounded-full ${pass ? 'bg-[#1B7A3C]' : 'bg-[#E63329]'}`} />
              <div className="min-w-0">
                <p className="font-sans text-xs font-medium text-gray-900 truncate">{row.label}</p>
                {/* Hide computed values in exam mode — student must derive them */}
                {examMode === 'sandbox' && (
                  <p className="font-mono text-[10px] text-gray-500 mt-0.5">{row.getValue(result)}</p>
                )}
                <p className="font-mono text-[9px] text-gray-400">{row.codeRef}</p>
              </div>
            </div>
          )
        })}
      </div>

      {!result.overallCompliant && (
        <div className="mt-3 rounded-lg bg-red-50 border border-red-100 px-3 py-2">
          <p className="font-mono text-[10px] text-red-800">
            {SCORECARD_ROWS.length - passCount} violation{SCORECARD_ROWS.length - passCount > 1 ? 's' : ''} detected.
            Adjust parameters to achieve full compliance.
          </p>
        </div>
      )}
    </div>
  )
}
```

## 3.6 Hotspot Content Registry

```typescript
// src/components/3d-lab/DevControlsModule/canvas/hotspots/hotspot-data.ts
// All hotspot content is static and code-reviewed. Do not derive from user input.

import type { Hotspot } from '@/types/3d-lab'

// Hotspot positions are defined in lot-space coordinates.
// Lot origin = (0, 0, 0) at front-left corner.
// X = width axis, Z = depth axis, Y = height axis.

export const DEV_CONTROLS_HOTSPOTS: Hotspot[] = [
  {
    id: 'ambf-volume',
    // Position: center of buildable envelope, at mid-height
    // Actual position computed at render time from store — this is a label key
    positionKey: 'ambf-center',
    label: 'AMBF Volume',
    description:
      'The Allowable Maximum Building Footprint is determined by the most restrictive of three independent checks: (1) the net area after mandatory setback deductions, (2) the maximum lot coverage permitted by your zoning classification, and (3) the area implied by the required minimum open space. Your building footprint cannot exceed any one of these three ceilings.',
    codeReference: 'PD 1096 2004 Revised IRR — Rule VIII',
    formulaHint: 'AMBF = min(Setback Area, PSO Area, Code Cap)',
  },
  {
    id: 'front-setback',
    positionKey: 'front-setback-center',
    label: 'Front Setback',
    description:
      'The front setback is the mandatory unbuilt buffer between the front property line and the nearest face of the building. Its dimension varies by occupancy group and lot area. No permanent structure — including fences above 1.8m — may encroach into this zone.',
    codeReference: 'PD 1096 2004 Revised IRR — Rule VII, Table VII.1',
    formulaHint: 'Front Setback = f(Occupancy Group, Lot Area)',
  },
  {
    id: 'bhl-plane',
    positionKey: 'bhl-roof-center',
    label: 'Building Height Limit',
    description:
      'The BHL is the lesser of two constraints: the zoning authority\'s hard height cap (in meters), and the angular plane limit derived from the front setback distance. A building that satisfies the zoning cap may still violate the angular plane if its setback is shallow.',
    codeReference: 'PD 1096 2004 Revised IRR — Rule VIII',
    formulaHint: 'BHL = min(Zoning Cap, Setback × Angular Plane Coefficient)',
  },
  {
    id: 'tosl-zone',
    positionKey: 'open-space-center',
    label: 'TOSL Open Space',
    description:
      'The Total Open Space within Lot must satisfy a closure identity: TOSL = ISA + USA. Where ISA is the impervious but unbuilt area (hardscape, driveways) and USA is the unpaved permeable area (gardens, lawn). These two components must account for the entire non-built portion of the lot.',
    codeReference: 'PD 1096 2004 Revised IRR — Rule VIII',
    formulaHint: 'TOSL = TLA − AMBF = ISA + USA',
  },
  {
    id: 'tgfa-stack',
    positionKey: 'floor-stack-right',
    label: 'TGFA Stack',
    description:
      'The Total Gross Floor Area is the sum of all floor plate areas across all floors. It must not exceed the product of the Floor Area Ratio and the Total Lot Area (FAR × TLA). Adding floors increases TGFA linearly — the highlighted floors indicate where the FAR limit is breached.',
    codeReference: 'PD 1096 2004 Revised IRR — Rule VIII',
    formulaHint: 'TGFA = Σ(GFA per floor) ≤ FAR × TLA',
  },
]
```

## 3.7 Performance Compliance Checklist

Before shipping, this module must pass the following gates:

```
ASSET BUDGET
[ ] No GLB files used — all geometry is procedural (BufferGeometry / Instances)
[ ] Total module JS bundle (excluding Three.js shared chunk) < 150KB
[ ] Supabase query on page.tsx completes < 200ms (use index on lab_sessions.user_id)

RUNTIME — Development Machine (M1 MacBook Air)
[ ] Draw calls < 10 per frame (verified via r3f-perf)
[ ] Triangle count < 5,000 (all procedural geometry)
[ ] 60fps sustained during slider drag (frameloop="demand" + invalidate pattern)
[ ] Zero React re-renders on slider drag (verified via React DevTools Profiler)
[ ] ViolationMaterial uTime uniform update does NOT trigger re-render
    (mutation via useFrame ref, not useState)

RUNTIME — Target Mobile (Realme C55 / Samsung A14)
[ ] 30fps minimum during parameter changes
[ ] No jank during first 3 seconds (precompute initial result before Canvas mounts)

MEMORY
[ ] No BoxGeometry allocations inside useFrame
[ ] useMemo wraps all geometry construction with dimension-keyed dependencies
[ ] ContactShadows disposed on unmount
[ ] useDevControlsStore reset on route change (add to module root useEffect cleanup)

CORRECTNESS
[ ] Unit tests pass: computeAMBF (3-way check), computeTOSL (closure identity)
[ ] BHL angular plane coefficient marked for architect review before production
[ ] Exam mode fully suppresses formula hints and computed values in scorecard
[ ] Readiness Score write confirmed by Supabase action on exam mode answer submit
```

## 3.8 Exam Mode Integration

```typescript
// src/app/dashboard/3d-lab/dev-controls/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface ExamAnswerPayload {
  moduleSlug: string
  checkId: string                // e.g., 'ambf' | 'tgfa' | 'bhl'
  submittedValue: number
  correctValue: number
  lotSnapshot: object            // JSON snapshot of lot+zoning params at time of question
}

export async function submitExamAnswer(payload: ExamAnswerPayload) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const isCorrect = Math.abs(payload.submittedValue - payload.correctValue) < 0.5  // ±0.5 sq.m. tolerance

  const { error } = await supabase.from('exam_answers').insert({
    user_id: user.id,
    module_slug: payload.moduleSlug,
    check_id: payload.checkId,
    submitted_value: payload.submittedValue,
    correct_value: payload.correctValue,
    is_correct: isCorrect,
    lot_snapshot: payload.lotSnapshot,
  })

  if (error) return { error: error.message }

  // Trigger Readiness Score recomputation (async — non-blocking)
  // Supabase function handles weighted score update
  await supabase.rpc('recompute_readiness_score', { p_user_id: user.id })

  revalidatePath('/dashboard')
  return { success: true, isCorrect }
}
```

---

## Appendix A: Key PD 1096 Variables — Glossary

| Variable | Full Name | Rule | Governs |
|---|---|---|---|
| TLA | Total Lot Area | VII | All area computations |
| AMBF | Allowable Maximum Building Footprint | VIII | Max footprint of building |
| PSO | Percentage of Site Occupancy | VIII | Max % of lot that may be built upon |
| ISA | Impervious Surface Area | VIII | Hardscape within TOSL |
| USA | Unpaved Surface Area | VIII | Permeable ground within TOSL |
| TOSL | Total Open Space within Lot | VIII | TLA − AMBF; must equal ISA + USA |
| MACA | Maximum Allowable Construction Area | VIII | Total area across all floors |
| TGFA | Total Gross Floor Area | VIII | Sum of all floor GFAs |
| BHL | Building Height Limit | VIII | Max building height in meters |
| FAR | Floor Area Ratio | VIII | TGFA / TLA ratio cap |

---

## Appendix B: Dependency Graph (Computation Order)

```
LotData + ZoningData
        │
        ▼
  computeSetbacks()           ← Rule VII input
        │
        ├──────────────────────────────┐
        ▼                              ▼
  computeAMBF()               computeBHL()
  (3-way check)               (angular plane)
        │
        ├───────────────┬──────────────┐
        ▼               ▼              ▼
  computePSO()    computeTOSL()  computeTGFA()
                  (identity)     (floor count)
        │               │              │
        └───────────────┴──────────────┘
                        │
                        ▼
              DevControlsResult
              (overallCompliant)
                        │
                        ▼
              Zustand Store.result
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
      R3F Scene    Scorecard    ExamMode UI
```

---

*Feature Implementation Plan — SlateCamp Development Controls Lab*  
*Prepared for engineering handoff. All computation functions require unit test coverage before production deployment. BHL angular plane coefficient flagged for licensed architect review.*
