# Unified Wall Configurator: Technical Implementation Plan

---

## 1. System Architecture & Data Schema

### 1.1 Module Topology

```
src/
├── features/wall-configurator/
│   ├── types/
│   │   ├── wall.types.ts          # WallConfig, Layer, Opening, BOM
│   │   └── engine.types.ts        # AreaState, LayerResult, PackagingResult
│   ├── engine/
│   │   ├── geometry.engine.ts     # A_g, A_n, A_f computation — pure functions, zero UI
│   │   ├── chb.engine.ts          # CHB unit computation
│   │   ├── plaster.engine.ts      # Palitada cement/sand derivation
│   │   ├── drywall.engine.ts      # Board count + joint compound
│   │   ├── paint.engine.ts        # Primer + topcoat liters
│   │   └── packaging.engine.ts    # Final commercial rounding
│   ├── store/
│   │   └── useWallConfigStore.ts  # Zustand — configurator state
│   ├── components/
│   │   ├── steps/
│   │   │   ├── Step1CoreSelect.tsx
│   │   │   ├── Step2Geometry.tsx
│   │   │   ├── Step3Openings.tsx
│   │   │   ├── Step4Sides.tsx
│   │   │   ├── Step5Treatment.tsx
│   │   │   ├── Step6Finish.tsx
│   │   │   └── Step7BOM.tsx
│   │   ├── WallConfigurator.tsx   # 'use client' root
│   │   └── BOMTable.tsx           # 'use client' results display
│   └── hooks/
│       └── useWallComputation.ts  # Derives BOM from store state
```

**Engine constraint:** All files under `engine/` are pure TypeScript. No React imports, no Zustand imports. Computation is deterministic given inputs. This upholds the established SlateCamp separation between the pure computation engine and all rendering/UI code.

---

### 1.2 Core TypeScript Interfaces

```typescript
// wall.types.ts

export type CoreType = 'chb' | 'drywall' | 'existing-wall';
export type LayerBasis = 'area' | 'linear' | 'piece' | 'panel';
export type SideCount = 1 | 2;

// ─── Opening ─────────────────────────────────────────────────────────────────

export interface Opening {
  id: string;
  label: string;               // 'Door A', 'Window 1', etc.
  widthM: number;
  heightM: number;
  quantity: number;
}

// ─── Layer ───────────────────────────────────────────────────────────────────

export interface PackagingSpec {
  unit: string;                // 'bag' | 'board' | 'pail' | 'can' | 'pcs'
  sizePerUnit: number;         // 40 kg/bag, 2.973 sqm/board, 16 L/pail, etc.
}

export interface Layer {
  code: string;                // 'PLASTER_1S' | 'PAINT_TOPCOAT' | 'BOARD_FACE' | ...
  label: string;
  basis: LayerBasis;
  applyToSides: boolean;       // if true: quantify against A_f; if false: against A_n
  wasteFactor: number;         // 0.05 = 5%
  packaging?: PackagingSpec;
  enabled: boolean;
}

// ─── WallConfig ──────────────────────────────────────────────────────────────

export interface WallGeometry {
  lengthM: number;
  heightM: number;
  wallCount: number;
}

export interface WallConfig {
  coreType: CoreType;
  geometry: WallGeometry;
  openings: Opening[];
  sides: SideCount;
  layers: Layer[];
}

// ─── Computed area state (engine output) ─────────────────────────────────────

export interface AreaState {
  grossAreaSqm: number;        // A_g = L × H × n
  openingAreaSqm: number;      // A_o = Σ (w × h × qty)
  netAreaSqm: number;          // A_n = A_g − A_o
  finishAreaSqm: number;       // A_f = A_n × s
}

// ─── BOM row ─────────────────────────────────────────────────────────────────

export interface BOMRow {
  layerCode: string;
  label: string;
  unit: string;
  theoreticalQty: number;
  adjustedQty: number;         // theoreticalQty × (1 + wasteFactor)
  procurementQty: number;      // Math.ceil(adjustedQty / packageSize) × packageSize
  packagingNote: string;       // '4 boards', '1 × 16 L pail', etc.
}

export interface BOMResult {
  areaState: AreaState;
  rows: BOMRow[];
}
```

---

### 1.3 Zustand Store Schema

```typescript
// store/useWallConfigStore.ts
'use client'

import { create } from 'zustand'
import { type WallConfig, type CoreType, type SideCount, type Opening, type Layer } from '../types/wall.types'

interface WallConfigState {
  step: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  config: WallConfig;

  // Step setters
  setCoreType: (core: CoreType) => void;
  setGeometry: (lengthM: number, heightM: number, wallCount: number) => void;
  addOpening: (o: Opening) => void;
  removeOpening: (id: string) => void;
  setSides: (s: SideCount) => void;
  toggleLayer: (code: string, enabled: boolean) => void;
  setStep: (step: WallConfigState['step']) => void;
  reset: () => void;
}
```

Layer defaults are injected by the store initializer based on `coreType` — CHB config seeds CHB + plaster + paint layers; drywall config seeds board + tape + compound + paint layers; existing-wall config seeds skim + primer + paint layers.

---

### 1.4 Default Layer Seed Maps

```typescript
// Keyed by CoreType — imported by store initializer

const CHB_DEFAULT_LAYERS: Layer[] = [
  { code: 'CHB_CORE',      label: 'CHB Units',           basis: 'piece',  applyToSides: false, wasteFactor: 0.05, packaging: { unit: 'pcs',   sizePerUnit: 1     }, enabled: true  },
  { code: 'PLASTER',       label: 'Cement-Sand Plaster',  basis: 'area',   applyToSides: true,  wasteFactor: 0.05, packaging: { unit: 'bag',   sizePerUnit: 40    }, enabled: true  },
  { code: 'SKIM_COAT',     label: 'Skim/Putty Coat',      basis: 'area',   applyToSides: true,  wasteFactor: 0.10, packaging: { unit: 'kg',    sizePerUnit: 1     }, enabled: false },
  { code: 'PRIMER',        label: 'Primer',               basis: 'area',   applyToSides: true,  wasteFactor: 0.10, packaging: { unit: 'L',     sizePerUnit: 4     }, enabled: true  },
  { code: 'TOPCOAT',       label: 'Topcoat Paint',        basis: 'area',   applyToSides: true,  wasteFactor: 0.10, packaging: { unit: 'L',     sizePerUnit: 16    }, enabled: true  },
];

const DRYWALL_DEFAULT_LAYERS: Layer[] = [
  { code: 'GYP_BOARD',     label: 'Gypsum Board 4\'×8\'', basis: 'panel',  applyToSides: true,  wasteFactor: 0.05, packaging: { unit: 'board', sizePerUnit: 2.973 }, enabled: true  },
  { code: 'JOINT_TAPE',    label: 'Mesh Joint Tape',      basis: 'linear', applyToSides: true,  wasteFactor: 0.10, packaging: { unit: 'lm',    sizePerUnit: 1     }, enabled: true  },
  { code: 'JOINT_COMPOUND',label: 'Joint Compound',       basis: 'linear', applyToSides: true,  wasteFactor: 0.10, packaging: { unit: 'L',     sizePerUnit: 4     }, enabled: true  },
  { code: 'PRIMER',        label: 'Primer',               basis: 'area',   applyToSides: true,  wasteFactor: 0.10, packaging: { unit: 'L',     sizePerUnit: 4     }, enabled: true  },
  { code: 'TOPCOAT',       label: 'Topcoat Paint',        basis: 'area',   applyToSides: true,  wasteFactor: 0.10, packaging: { unit: 'L',     sizePerUnit: 16    }, enabled: true  },
];

const EXISTING_WALL_DEFAULT_LAYERS: Layer[] = [
  { code: 'SKIM_COAT',     label: 'Skim/Putty Coat',      basis: 'area',   applyToSides: true,  wasteFactor: 0.10, packaging: { unit: 'kg',    sizePerUnit: 1     }, enabled: false },
  { code: 'PRIMER',        label: 'Primer',               basis: 'area',   applyToSides: true,  wasteFactor: 0.10, packaging: { unit: 'L',     sizePerUnit: 4     }, enabled: true  },
  { code: 'TOPCOAT',       label: 'Topcoat Paint',        basis: 'area',   applyToSides: true,  wasteFactor: 0.10, packaging: { unit: 'L',     sizePerUnit: 16    }, enabled: true  },
];
```

---

## 2. Computation Engine & Formula Implementation

### 2.1 Geometry Engine — `geometry.engine.ts`

```typescript
import { type WallGeometry, type Opening, type AreaState, type SideCount } from '../types/wall.types'

export function computeAreaState(
  geometry: WallGeometry,
  openings: Opening[],
  sides: SideCount
): AreaState {
  const { lengthM, heightM, wallCount } = geometry

  // A_g = L × H × n
  const grossAreaSqm = lengthM * heightM * wallCount

  // A_o = Σ (w_i × h_i × qty_i)
  const openingAreaSqm = openings.reduce(
    (sum, o) => sum + o.widthM * o.heightM * o.quantity,
    0
  )

  // Guard: opening area must never exceed gross area
  const clampedOpeningArea = Math.min(openingAreaSqm, grossAreaSqm)

  // A_n = A_g − A_o
  const netAreaSqm = grossAreaSqm - clampedOpeningArea

  // A_f = A_n × s
  const finishAreaSqm = netAreaSqm * sides

  return { grossAreaSqm, openingAreaSqm: clampedOpeningArea, netAreaSqm, finishAreaSqm }
}
```

**Critical invariant:** All finish-layer engines receive `finishAreaSqm` (A_f) or `netAreaSqm` (A_n) — never `grossAreaSqm`. Gross dimensions are never passed directly to any material formula.

---

### 2.2 CHB Engine — `chb.engine.ts`

```typescript
// Constants
const CHB_FACE_WIDTH_M  = 0.40
const CHB_FACE_HEIGHT_M = 0.20
const CHB_FACE_AREA_SQM = CHB_FACE_WIDTH_M * CHB_FACE_HEIGHT_M  // 0.08 sqm/block

export interface CHBResult {
  theoreticalPcs: number    // A_n / 0.08
  adjustedPcs:    number    // theoreticalPcs × (1 + w)
  procurementPcs: number    // Math.ceil(adjustedPcs)
}

export function computeCHB(netAreaSqm: number, wasteFactor: number): CHBResult {
  // CHB is piece-based and applied to net area (not side-multiplied — core wall is one unit)
  const theoreticalPcs  = netAreaSqm / CHB_FACE_AREA_SQM
  const adjustedPcs     = theoreticalPcs * (1 + wasteFactor)
  const procurementPcs  = Math.ceil(adjustedPcs)

  return { theoreticalPcs, adjustedPcs, procurementPcs }
}
```

**Basis rule:** CHB units reference `A_n` only. The physical block count belongs to the wall core, which is single regardless of how many faces are finished.

---

### 2.3 Plaster Engine — `plaster.engine.ts`

```typescript
// Constants from technical specification
const PLASTER_THICKNESS_M       = 0.0127       // 12.7 mm = 1/2 inch minimum
const DRY_VOLUME_FACTOR         = 1.33         // wet-to-dry mortar bulking factor
const MIX_CEMENT_FRACTION       = 1 / 3        // 1 part cement in 1:2 mix
const MIX_SAND_FRACTION         = 2 / 3        // 2 parts sand in 1:2 mix
const CEMENT_BULK_DENSITY_KG_M3 = 1440         // kg/m³
const CEMENT_BAG_KG             = 40           // kg/bag

export interface PlasterResult {
  // Wet volumes
  wetVolumeCubicM:    number
  // Dry volumes
  dryVolumeCubicM:    number
  cementVolumeCubicM: number
  sandVolumeCubicM:   number
  // Converted
  theoreticalCementBags: number
  adjustedCementBags:    number
  procurementCementBags: number
  theoreticalSandCubicM: number
  adjustedSandCubicM:    number
}

export function computePlaster(
  finishAreaSqm: number,   // A_f — already side-multiplied by caller
  wasteFactor: number
): PlasterResult {
  // V_w = A_f × t_p
  const wetVolumeCubicM = finishAreaSqm * PLASTER_THICKNESS_M

  // V_d = V_w × 1.33
  const dryVolumeCubicM = wetVolumeCubicM * DRY_VOLUME_FACTOR

  // V_c = (1/3) × V_d
  const cementVolumeCubicM = MIX_CEMENT_FRACTION * dryVolumeCubicM

  // V_s = (2/3) × V_d
  const sandVolumeCubicM = MIX_SAND_FRACTION * dryVolumeCubicM

  // Cement bags (theoretical) = (V_c × 1440) / 40
  const theoreticalCementBags = (cementVolumeCubicM * CEMENT_BULK_DENSITY_KG_M3) / CEMENT_BAG_KG

  // Apply wastage to bags and sand
  const adjustedCementBags  = theoreticalCementBags * (1 + wasteFactor)
  const adjustedSandCubicM  = sandVolumeCubicM      * (1 + wasteFactor)

  // Procurement: bags round up to nearest whole bag
  const procurementCementBags = Math.ceil(adjustedCementBags)

  return {
    wetVolumeCubicM,
    dryVolumeCubicM,
    cementVolumeCubicM,
    sandVolumeCubicM,
    theoreticalCementBags,
    adjustedCementBags,
    procurementCementBags,
    theoreticalSandCubicM: sandVolumeCubicM,
    adjustedSandCubicM,
  }
}
```

---

### 2.4 Drywall Board Engine — `drywall.engine.ts`

```typescript
// Constants
const BOARD_AREA_SQM           = 1.2192 * 2.4384  // 2.973 sqm per 4'×8' board
const JC_COVERAGE_LM_PER_LITER = 12               // joint compound: 12 lm/L (Boysen spec)

export interface DrywallBoardResult {
  theoreticalBoards: number
  adjustedBoards:    number
  procurementBoards: number  // Math.ceil
}

export interface JointCompoundResult {
  theoreticalLiters: number
  adjustedLiters:    number
  procurement4LCans: number
}

export function computeDrywallBoards(
  finishAreaSqm: number,   // A_f — already side-multiplied
  wasteFactor: number
): DrywallBoardResult {
  // Boards = (A_f / 2.973) × (1 + w)
  const theoreticalBoards = finishAreaSqm / BOARD_AREA_SQM
  const adjustedBoards    = theoreticalBoards * (1 + wasteFactor)
  const procurementBoards = Math.ceil(adjustedBoards)

  return { theoreticalBoards, adjustedBoards, procurementBoards }
}

export function computeJointCompound(
  seamLengthLM: number,    // M — user-entered or derived from board layout
  wasteFactor: number
): JointCompoundResult {
  // JC liters = M / 12
  const theoreticalLiters = seamLengthLM / JC_COVERAGE_LM_PER_LITER
  const adjustedLiters    = theoreticalLiters * (1 + wasteFactor)

  // Package: 4 L can is smallest standard
  const procurement4LCans = Math.ceil(adjustedLiters / 4)

  return { theoreticalLiters, adjustedLiters, procurement4LCans }
}

// Seam length derivation heuristic (used when user has not manually entered seam LM)
// Assumes boards laid in a single column orientation; vertical seams every 1.2192 m
export function deriveSeamLengthFromBoards(finishAreaSqm: number, boardHeightM = 2.4384): number {
  const boardsPerRow = Math.ceil(finishAreaSqm / (1.2192 * boardHeightM))
  // Each internal vertical seam runs the full board height
  const verticalSeamCount = boardsPerRow - 1
  return verticalSeamCount * boardHeightM
}
```

---

### 2.5 Paint Engine — `paint.engine.ts`

```typescript
// Constants
const PAINT_COVERAGE_SQM_PER_L_PER_COAT = 7   // configurable default; 7 sqm/L/coat

export interface PaintLayerResult {
  theoreticalLiters: number
  adjustedLiters:    number
  procurement16LPails: number
  procurement4LCans:   number
}

export function computePaintLayer(
  finishAreaSqm: number,
  coats: number,
  wasteFactor: number,
  coverageSqmPerLPerCoat: number = PAINT_COVERAGE_SQM_PER_L_PER_COAT
): PaintLayerResult {
  // Paint liters = (A_f × N) / C
  const theoreticalLiters = (finishAreaSqm * coats) / coverageSqmPerLPerCoat

  // Adjusted = theoretical × (1 + w)
  const adjustedLiters = theoreticalLiters * (1 + wasteFactor)

  // Packaging conversion
  const procurement16LPails = Math.ceil(adjustedLiters / 16)
  const procurement4LCans   = Math.ceil(adjustedLiters / 4)

  return { theoreticalLiters, adjustedLiters, procurement16LPails, procurement4LCans }
}
```

**Primer and topcoat are each passed through `computePaintLayer` independently.** They are separate SKUs and must never be merged into a single packaging result.

---

### 2.6 Packaging Engine — `packaging.engine.ts`

```typescript
// Final commercial rounding — called by the BOM assembler after all layer engines run

export interface PackagingOutput {
  procurementQty:  number
  packagingNote:   string
}

export function resolvePackaging(
  adjustedQty: number,
  packageSizePerUnit: number,
  unit: string
): PackagingOutput {
  const procurementQty = Math.ceil(adjustedQty / packageSizePerUnit)
  const packagingNote  = `${procurementQty} × ${packageSizePerUnit} ${unit}`
  return { procurementQty, packagingNote }
}
```

---

### 2.7 BOM Assembly Hook — `useWallComputation.ts`

```typescript
'use client'

import { useMemo } from 'react'
import { useWallConfigStore } from '../store/useWallConfigStore'
import { computeAreaState }       from '../engine/geometry.engine'
import { computeCHB }             from '../engine/chb.engine'
import { computePlaster }         from '../engine/plaster.engine'
import { computeDrywallBoards, computeJointCompound } from '../engine/drywall.engine'
import { computePaintLayer }      from '../engine/paint.engine'
import { type BOMResult }         from '../types/wall.types'

export function useWallComputation(): BOMResult {
  const { config } = useWallConfigStore()
  const { geometry, openings, sides, layers, coreType } = config

  return useMemo(() => {
    const areaState = computeAreaState(geometry, openings, sides)
    const { netAreaSqm, finishAreaSqm } = areaState
    const rows = []

    // ── CHB core ──────────────────────────────────────────────────────────────
    if (coreType === 'chb') {
      const chbLayer  = layers.find(l => l.code === 'CHB_CORE')
      if (chbLayer?.enabled) {
        const r = computeCHB(netAreaSqm, chbLayer.wasteFactor)
        rows.push({
          layerCode: 'CHB_CORE',
          label: 'CHB Units',
          unit: 'pcs',
          theoreticalQty:  r.theoreticalPcs,
          adjustedQty:     r.adjustedPcs,
          procurementQty:  r.procurementPcs,
          packagingNote:   `${r.procurementPcs} pcs`,
        })
      }
    }

    // ── Plaster ───────────────────────────────────────────────────────────────
    const plasterLayer = layers.find(l => l.code === 'PLASTER')
    if (plasterLayer?.enabled) {
      const r = computePlaster(finishAreaSqm, plasterLayer.wasteFactor)
      rows.push(
        {
          layerCode: 'PLASTER_CEMENT',
          label: 'Plaster — Cement (40 kg bags)',
          unit: 'bags',
          theoreticalQty: r.theoreticalCementBags,
          adjustedQty:    r.adjustedCementBags,
          procurementQty: r.procurementCementBags,
          packagingNote:  `${r.procurementCementBags} × 40 kg bags`,
        },
        {
          layerCode: 'PLASTER_SAND',
          label: 'Plaster — Sand',
          unit: 'm³',
          theoreticalQty: r.theoreticalSandCubicM,
          adjustedQty:    r.adjustedSandCubicM,
          procurementQty: Math.ceil(r.adjustedSandCubicM * 100) / 100,
          packagingNote:  `${(Math.ceil(r.adjustedSandCubicM * 100) / 100).toFixed(2)} m³`,
        }
      )
    }

    // ── Drywall boards ────────────────────────────────────────────────────────
    if (coreType === 'drywall') {
      const boardLayer = layers.find(l => l.code === 'GYP_BOARD')
      if (boardLayer?.enabled) {
        const r = computeDrywallBoards(finishAreaSqm, boardLayer.wasteFactor)
        rows.push({
          layerCode: 'GYP_BOARD',
          label: "Gypsum Board 4'×8'",
          unit: 'boards',
          theoreticalQty: r.theoreticalBoards,
          adjustedQty:    r.adjustedBoards,
          procurementQty: r.procurementBoards,
          packagingNote:  `${r.procurementBoards} boards`,
        })
      }

      const jcLayer = layers.find(l => l.code === 'JOINT_COMPOUND')
      if (jcLayer?.enabled) {
        // Use store-provided seamLengthLM or derived estimate
        const seamLM = config.seamLengthLM ?? 10
        const r = computeJointCompound(seamLM, jcLayer.wasteFactor)
        rows.push({
          layerCode: 'JOINT_COMPOUND',
          label: 'Joint Compound (4 L cans)',
          unit: 'L',
          theoreticalQty: r.theoreticalLiters,
          adjustedQty:    r.adjustedLiters,
          procurementQty: r.procurement4LCans * 4,
          packagingNote:  `${r.procurement4LCans} × 4 L can`,
        })
      }
    }

    // ── Primer ────────────────────────────────────────────────────────────────
    const primerLayer = layers.find(l => l.code === 'PRIMER')
    if (primerLayer?.enabled) {
      const r = computePaintLayer(finishAreaSqm, 1, primerLayer.wasteFactor)
      rows.push({
        layerCode: 'PRIMER',
        label: 'Primer (1 coat)',
        unit: 'L',
        theoreticalQty: r.theoreticalLiters,
        adjustedQty:    r.adjustedLiters,
        procurementQty: r.procurement4LCans * 4,
        packagingNote:  `${r.procurement4LCans} × 4 L can`,
      })
    }

    // ── Topcoat ───────────────────────────────────────────────────────────────
    const topcoatLayer = layers.find(l => l.code === 'TOPCOAT')
    if (topcoatLayer?.enabled) {
      const r = computePaintLayer(finishAreaSqm, 2, topcoatLayer.wasteFactor)
      rows.push({
        layerCode: 'TOPCOAT',
        label: 'Topcoat Paint (2 coats)',
        unit: 'L',
        theoreticalQty: r.theoreticalLiters,
        adjustedQty:    r.adjustedLiters,
        procurementQty: r.procurement16LPails * 16,
        packagingNote:  `${r.procurement16LPails} × 16 L pail`,
      })
    }

    return { areaState, rows }
  }, [config])
}
```

---

## 3. UI/UX Workflow & Component Strategy

### 3.1 Step-by-Step Flow Map

| Step | Component | Client? | Primary Input | Validation Gate |
|------|-----------|---------|--------------|-----------------|
| 1 | `Step1CoreSelect` | ✓ | `coreType` radio cards | Must select one |
| 2 | `Step2Geometry` | ✓ | `lengthM`, `heightM`, `wallCount` | All > 0 |
| 3 | `Step3Openings` | ✓ | Opening list (add / remove) | Each w, h > 0; total < gross |
| 4 | `Step4Sides` | ✓ | `sides` toggle | 1 or 2 |
| 5 | `Step5Treatment` | ✓ | Layer enable/disable toggles | None — optional |
| 6 | `Step6Finish` | ✓ | Primer on/off, coat count, topcoat on/off | None — optional |
| 7 | `Step7BOM` | ✓ | Read-only results display | None |

**Navigation model:** Linear wizard with a persistent step indicator. Steps 1–2 are required. Steps 3–6 are optional with sensible defaults. Step 7 is always reachable once step 2 is validated.

---

### 3.2 Step 1 — Core Select

```tsx
// Step1CoreSelect.tsx
'use client'
// Three card options: CHB | Drywall | Existing Wall
// On select: setCoreType(value), inject default layers, advance to step 2
// Each card shows the typical finishing sequence as a read-only list
// Typography: label in DM Mono uppercase; description in Inter sm
```

**UX rule:** Cards display the sequence (e.g., "CHB → Plaster → Primer → Paint") so the student understands what they are configuring before entering numbers.

---

### 3.3 Step 2 — Geometry

```tsx
// Step2Geometry.tsx
'use client'
// Three numeric inputs: Length (m), Height (m), Wall Count
// Inline computed preview: "Gross area: X.XX sqm" updates on every keystroke
// Uses controlled inputs with parseFloat validation; 0 values show inline error
// DM Mono tabular-nums for the computed preview value
```

---

### 3.4 Step 3 — Openings

```tsx
// Step3Openings.tsx
'use client'
// Dynamic list — user adds rows: Label, Width (m), Height (m), Quantity
// Remove button per row
// Below list: "Net area after openings: X.XX sqm" — live derived value
// Guard: if computed opening area ≥ gross area, show error banner, disable advance
```

---

### 3.5 Step 4 — Sides

```tsx
// Step4Sides.tsx
'use client'
// Two-option toggle: "One Side" | "Both Sides"
// Explanatory note: "Plastering and painting quantities double when both sides are selected."
// Shows updated A_f preview
```

---

### 3.6 Step 5 — Treatment Layers

```tsx
// Step5Treatment.tsx
'use client'
// Renders enabled/disabled toggles for core-specific non-paint layers
// CHB: Plaster toggle (default ON), Skim coat toggle (default OFF)
// Drywall: Board toggle (default ON), Joint compound toggle (default ON)
// Existing wall: Skim coat toggle (default OFF)
// Each row: layer name, basis hint (e.g., "area-based, per side"), wastage % display
```

---

### 3.7 Step 6 — Finish

```tsx
// Step6Finish.tsx
'use client'
// Primer toggle + coat count (fixed at 1; display only)
// Topcoat toggle + coat count stepper (default: 2; min: 1)
// Coverage constant displayed as editable field (default: 7 sqm/L/coat)
// Wastage % displayed as editable field (default: 10%)
```

---

### 3.8 Step 7 — Bill of Materials

```tsx
// Step7BOM.tsx
'use client'
// Three-tier table per layer:
//   Col 1: Material
//   Col 2: Theoretical Qty + unit
//   Col 3: Adjusted Qty (after waste)
//   Col 4: Procurement Qty (commercial sizes)
//   Col 5: Packaging note
// Area summary card at top: Gross / Opening / Net / Finish area
// Assumptions footer: lists every constant used (thickness, coverage, wastage %)
// Print-ready CSS class on table for browser print action
```

---

### 3.9 WallConfigurator Root

```tsx
// WallConfigurator.tsx
'use client'

import { useWallConfigStore }  from './store/useWallConfigStore'
import { StepIndicator }        from './components/StepIndicator'
import { Step1CoreSelect }      from './components/steps/Step1CoreSelect'
// ... all steps

export function WallConfigurator() {
  const { step } = useWallConfigStore()

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto px-4 py-8">
      <StepIndicator currentStep={step} totalSteps={7} />
      {step === 1 && <Step1CoreSelect />}
      {step === 2 && <Step2Geometry />}
      {step === 3 && <Step3Openings />}
      {step === 4 && <Step4Sides />}
      {step === 5 && <Step5Treatment />}
      {step === 6 && <Step6Finish />}
      {step === 7 && <Step7BOM />}
    </div>
  )
}
```

---

## 4. Packaging & Conversion Logic

### 4.1 Conversion Rules by Material

| Material | Theoretical unit | Commercial package | Conversion rule |
|---|---|---|---|
| CHB units | pcs | pcs (sold per piece) | `Math.ceil(adjustedPcs)` |
| Cement | m³ loose | 40 kg bag | `Math.ceil((V_c × 1440 / 40) × (1 + w))` |
| Sand | m³ | m³ (bulk order) | `Math.ceil(adjustedM³ × 100) / 100` (2 dp) |
| Gypsum board | board area (sqm) | 4'×8' board = 2.973 sqm | `Math.ceil(adjustedBoards)` |
| Joint compound | liters | 4 L can / 16 L can | `Math.ceil(adjustedL / 4)` for 4 L |
| Primer | liters | 4 L can | `Math.ceil(adjustedL / 4)` |
| Topcoat paint | liters | 16 L pail | `Math.ceil(adjustedL / 16)` |

### 4.2 Packaging Separation Rule

Primer and topcoat are always packaged separately. They are different product SKUs. The BOM assembler must never sum primer liters and topcoat liters before packaging conversion. Each layer calls `computePaintLayer` independently and generates its own procurement row.

### 4.3 Display Precision

- Areas: display to 2 decimal places (e.g., `10.00 sqm`)
- Volumes: display to 3 decimal places (e.g., `0.127 m³`)
- Theoretical/Adjusted quantities: display to 2 decimal places
- Procurement quantities: integers only (bags, boards, cans, pails)
- Sand: display to 2 decimal places in m³

---

## 5. Testing & Validation Protocol (10 sqm Baseline)

### 5.1 Test Configuration

```
coreType:     'chb'
geometry:     { lengthM: 10, heightM: 1, wallCount: 1 }  → or any L×H = 10
openings:     []
sides:        1 (primary); 2 (secondary check)
layers:       CHB_CORE ON, PLASTER ON, PRIMER ON (1 coat), TOPCOAT ON (2 coats)
wastage:      CHB 5%, plaster 5%, boards 5%, paint 10%
```

A_g = 10 × 1 × 1 = **10.00 sqm**
A_o = 0
A_n = **10.00 sqm**
A_f (1 side) = **10.00 sqm**
A_f (2 sides) = **20.00 sqm**

---

### 5.2 Expected Results — One Side

#### CHB Units

| | Value |
|---|---|
| Theoretical | 10 / 0.08 = **125.00 pcs** |
| Adjusted (5% waste) | 125 × 1.05 = **131.25 pcs** |
| Procurement | `Math.ceil(131.25)` = **132 pcs** |

#### Plaster — Cement (one side, A_f = 10 sqm)

| | Value |
|---|---|
| V_w | 10 × 0.0127 = **0.1270 m³** |
| V_d | 0.1270 × 1.33 = **0.1689 m³** |
| V_c | 0.1689 / 3 = **0.0563 m³** |
| V_s | 0.1689 × 2/3 = **0.1126 m³** |
| Theoretical bags | (0.0563 × 1440) / 40 = **2.027 bags** |
| Adjusted bags (5%) | 2.027 × 1.05 = **2.128 bags** |
| Procurement | `Math.ceil(2.128)` = **3 bags** |

#### Plaster — Sand (one side)

| | Value |
|---|---|
| Theoretical | **0.1126 m³** |
| Adjusted (5%) | 0.1126 × 1.05 = **0.1182 m³** |
| Procurement | **0.12 m³** (2 dp round-up) |

#### Primer (1 coat, A_f = 10 sqm, C = 7 sqm/L/coat, w = 0.10)

| | Value |
|---|---|
| Theoretical | (10 × 1) / 7 = **1.4286 L** |
| Adjusted (10%) | 1.4286 × 1.10 = **1.5714 L** |
| Procurement (4 L cans) | `Math.ceil(1.5714 / 4)` = **1 × 4 L can** |

#### Topcoat (2 coats, A_f = 10 sqm, C = 7, w = 0.10)

| | Value |
|---|---|
| Theoretical | (10 × 2) / 7 = **2.8571 L** |
| Adjusted (10%) | 2.8571 × 1.10 = **3.1429 L** |
| Procurement (16 L pails) | `Math.ceil(3.1429 / 16)` = **1 × 16 L pail** |

**Total coating (one side):** 1.5714 + 3.1429 = **4.7143 L** — consistent with specification reference of 4.71 L.

---

### 5.3 Expected Results — Both Sides (A_f = 20 sqm)

#### Plaster — Cement (both sides)

| | Value |
|---|---|
| V_w | 20 × 0.0127 = **0.2540 m³** |
| V_d | 0.2540 × 1.33 = **0.3378 m³** |
| V_c | 0.3378 / 3 = **0.1126 m³** |
| Theoretical bags | (0.1126 × 1440) / 40 = **4.054 bags** |
| Adjusted (5%) | 4.054 × 1.05 = **4.257 bags** |
| Procurement | `Math.ceil(4.257)` = **5 bags** |

#### Paint — Primer + Topcoat (both sides, A_f = 20 sqm)

| Layer | Theoretical | Adjusted (10%) | Procurement |
|---|---|---|---|
| Primer (1 coat) | 20/7 = 2.857 L | 3.143 L | 1 × 4 L can |
| Topcoat (2 coats) | 40/7 = 5.714 L | 6.286 L | 1 × 16 L pail |
| **Total** | **8.571 L** | **9.429 L** | — |

Consistent with specification reference of 9.43 L total for both-sides paint.

---

### 5.4 Drywall Validation (10 sqm, one side, A_f = 10 sqm)

#### Boards

| | Value |
|---|---|
| Theoretical | 10 / 2.973 = **3.364 boards** |
| Adjusted (5%) | 3.364 × 1.05 = **3.532 boards** |
| Procurement | `Math.ceil(3.532)` = **4 boards** |

#### Boards (both sides, A_f = 20 sqm)

| | Value |
|---|---|
| Theoretical | 20 / 2.973 = **6.728 boards** |
| Adjusted (5%) | 6.728 × 1.05 = **7.064 boards** |
| Procurement | `Math.ceil(7.064)` = **8 boards** |

#### Joint Compound (seam reference: 10 lm)

| | Value |
|---|---|
| Theoretical | 10 / 12 = **0.8333 L** |
| Adjusted (10%) | 0.8333 × 1.10 = **0.9167 L** |
| Procurement | `Math.ceil(0.9167 / 4)` = **1 × 4 L can** |

---

### 5.5 Automated Test Skeleton

```typescript
// __tests__/engine/validation.test.ts

describe('10 sqm baseline validation', () => {
  const NET_AREA = 10
  const FINISH_AREA_1S = 10
  const FINISH_AREA_2S = 20

  it('CHB units — 1 side', () => {
    const r = computeCHB(NET_AREA, 0.05)
    expect(r.theoreticalPcs).toBeCloseTo(125.00, 2)
    expect(r.adjustedPcs).toBeCloseTo(131.25, 2)
    expect(r.procurementPcs).toBe(132)
  })

  it('Plaster cement — 1 side', () => {
    const r = computePlaster(FINISH_AREA_1S, 0.05)
    expect(r.wetVolumeCubicM).toBeCloseTo(0.127, 3)
    expect(r.theoreticalCementBags).toBeCloseTo(2.027, 2)
    expect(r.procurementCementBags).toBe(3)
  })

  it('Plaster cement — 2 sides', () => {
    const r = computePlaster(FINISH_AREA_2S, 0.05)
    expect(r.theoreticalCementBags).toBeCloseTo(4.054, 2)
    expect(r.procurementCementBags).toBe(5)
  })

  it('Primer — 1 side (1 coat, 7 sqm/L)', () => {
    const r = computePaintLayer(FINISH_AREA_1S, 1, 0.10)
    expect(r.theoreticalLiters).toBeCloseTo(1.4286, 3)
    expect(r.adjustedLiters).toBeCloseTo(1.5714, 3)
    expect(r.procurement4LCans).toBe(1)
  })

  it('Topcoat — 1 side (2 coats, 7 sqm/L)', () => {
    const r = computePaintLayer(FINISH_AREA_1S, 2, 0.10)
    expect(r.theoreticalLiters).toBeCloseTo(2.8571, 3)
    expect(r.adjustedLiters).toBeCloseTo(3.1429, 3)
    expect(r.procurement16LPails).toBe(1)
  })

  it('Drywall boards — 1 side', () => {
    const r = computeDrywallBoards(FINISH_AREA_1S, 0.05)
    expect(r.theoreticalBoards).toBeCloseTo(3.364, 2)
    expect(r.procurementBoards).toBe(4)
  })

  it('Drywall boards — 2 sides', () => {
    const r = computeDrywallBoards(FINISH_AREA_2S, 0.05)
    expect(r.theoreticalBoards).toBeCloseTo(6.728, 2)
    expect(r.procurementBoards).toBe(8)
  })

  it('Joint compound — 10 lm seam reference', () => {
    const r = computeJointCompound(10, 0.10)
    expect(r.theoreticalLiters).toBeCloseTo(0.8333, 3)
    expect(r.procurement4LCans).toBe(1)
  })

  it('Gross-area gate — finish never uses A_g when openings exist', () => {
    const state = computeAreaState(
      { lengthM: 4, heightM: 3, wallCount: 1 },
      [{ id: '1', label: 'Door', widthM: 0.9, heightM: 2.1, quantity: 1 }],
      1
    )
    expect(state.grossAreaSqm).toBeCloseTo(12.00, 2)
    expect(state.openingAreaSqm).toBeCloseTo(1.89, 2)
    expect(state.netAreaSqm).toBeCloseTo(10.11, 2)
    // finishAreaSqm must equal netAreaSqm (1 side), not grossAreaSqm
    expect(state.finishAreaSqm).toBeCloseTo(10.11, 2)
    expect(state.finishAreaSqm).not.toBe(state.grossAreaSqm)
  })
})
```

---

### 5.6 Engineering Constants Registry

The following constants are used throughout the engine. They must be maintained in a single constants file and referenced by all engine modules — never inlined in formulas:

```typescript
// engine/constants.ts

export const CHB_FACE_WIDTH_M             = 0.40
export const CHB_FACE_HEIGHT_M            = 0.20
export const BOARD_WIDTH_M                = 1.2192    // 4 ft
export const BOARD_HEIGHT_M               = 2.4384    // 8 ft
export const BOARD_AREA_SQM               = 2.973     // 4'×8' panel
export const PLASTER_THICKNESS_M          = 0.0127    // 12.7 mm = 1/2 inch
export const DRY_VOLUME_FACTOR            = 1.33
export const CEMENT_MIX_FRACTION          = 1 / 3
export const SAND_MIX_FRACTION            = 2 / 3
export const CEMENT_BULK_DENSITY_KG_M3    = 1440
export const CEMENT_BAG_KG                = 40
export const PAINT_COVERAGE_SQM_PER_L     = 7
export const JC_COVERAGE_LM_PER_LITER     = 12
export const PACKAGE_PAINT_PAIL_L         = 16
export const PACKAGE_PAINT_CAN_L          = 4
export const PACKAGE_JC_CAN_SMALL_L       = 4
export const PACKAGE_JC_CAN_LARGE_L       = 16
```

Any architectural review or update to Philippine construction standards requires updating this file only — no formulas change.
