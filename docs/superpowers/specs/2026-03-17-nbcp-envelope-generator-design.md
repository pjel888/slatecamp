# NBCP Envelope Generator — Design Specification
**Date:** 2026-03-17
**Status:** Approved
**Feature:** Parametric NBCP (PD 1096) Building Envelope Simulator for the SlateCamp 3D Lab

---

## Overview

An interactive 3D simulator that lets architecture students manipulate zoning classification, lot dimensions, RROW width, lot type, and firewall provisions to see the maximum allowable building envelope morph in real-time. Grounded in the 2004 Revised IRR of PD 1096 (Rules VII & VIII). The primary pedagogical mechanism is "Learning by Breaking" — violations turn the building red with exact IRR code citations anchored spatially at the point of violation.

**Target user:** Filipino architecture students preparing for the Architect Licensure Examination (ALE), specifically the Building Technology and Development Control portions.

---

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| NBCP data storage | TypeScript constants | PD 1096 tables are law — they don't change; zero network dependency; pure function testability |
| Routing | Existing `?model=nbcp-envelope` via `LabViewport.tsx` | Consistent with FAR Calculator; no new route infrastructure |
| Building transitions | Lerp animation via `useFrame` (~400ms) | Spatial learning payoff: students _watch_ the envelope grow/shrink; more impactful than snap |
| Lot types | All 4: Inside, Corner, Through, End | Complete ALE coverage; math is a switch block, complexity is low |
| Architecture | Pure math engine + thin Zustand store | Separated concerns; calculator is unit-testable before any rendering |

---

## File Structure

```
src/app/dashboard/3d-lab/
├── _constants/                  # NEW directory
│   └── nbcp.ts                  # All PD 1096 lookup tables (NEW)
├── _utils/                      # NEW directory
│   └── nbcpCalculator.ts        # Pure fn: calculateEnvelope(inputs) → computed (NEW)
├── _hooks/
│   ├── useInvalidateOnChange.ts # Existing — UNCHANGED (wired to labStore)
│   └── useNBCPInvalidateOnChange.ts  # NEW — mirrors above but wired to nbcpStore
├── _stores/
│   ├── labStore.ts              # Existing — UNCHANGED
│   └── nbcpStore.ts             # Thin Zustand store for NBCP inputs + R3F bridge (NEW)
└── _scenes/
    └── NBCPEnvelope/            # NEW
        ├── index.ts
        ├── NBCPEnvelope.tsx     # Page wrapper (CanvasWrapper + panels)
        ├── NBCPScene.tsx        # All R3F geometry (inside Canvas)
        ├── NBCPControlPanel.tsx # Left overlay: sliders, dropdowns, toggles
        └── NBCPTelemetry.tsx    # Right overlay: computed values readout
```

**Integration touches (minimal, non-breaking):**
- `_constants/` — **new directory** (does not exist yet); create `src/app/dashboard/3d-lab/_constants/`
- `_utils/` — **new directory** (does not exist yet); create `src/app/dashboard/3d-lab/_utils/`
- `LabViewport.tsx`: add `'nbcp-envelope'` to `PARAMETRIC_SCENES`, add dynamic import
- `page.tsx`: add leaf node `{ id: 'nbcp-envelope', label: 'NBCP Envelope Generator ✦', modelId: 'nbcp-envelope' }` under the existing `zoning` branch in `MOCK_TREE`

---

## Math Engine

### IRR Reference Table (verified against 2004 Revised IRR of PD 1096)

| Step | Calculation | IRR Reference |
|------|-------------|---------------|
| 1 | `tla = lotWidth × lotDepth` | Basic input — no section |
| 2 | `effectiveBHL = min(zoningBHL, rrowBHL)` | IRR Rule VII §707 + Table VII.2 |
| 3 | Setbacks per side (RROW + storeys + firewall) | IRR Rule VIII Tables VIII.2 & VIII.3 |
| 4 | `ambf = min(ambf_setbacks, ambf_pso)` — most stringent wins | IRR Rule VIII §802–803 + Rule VII Guidelines |
| 5 | `tosl = tla − ambf` | IRR Rule VIII §804 + Guidelines §4 |
| 6 | `maxGFA = tla × flar` | IRR Rule VII Guidelines Table VII.G.1 |
| 7 | `amvb = ambf × bhl_meters` — valid because AMBF from Step 4 is already post-PSO | IRR Rule VII Guidelines (AMVB procedure) |
| 8 | Crosscheck: `actualGFA` vs `maxGFA` | IRR Rule VII Guidelines (sequential DC application) |
| 9 | Collect `Violation[]` | Programmatic — no section |

**Incremental setback rule:** 0.30m per storey above the 2nd storey, capped at the 14th storey → cited as `IRR Rule VIII §804.6`

### `_constants/nbcp.ts` — Key Structures

```ts
enum ZoningClass { R1, R2_BASIC, R2_MAX, R3, R4, R5, C1, C2, C3, I1, I2 }
enum LotType { INSIDE, CORNER, THROUGH, END }

// Table VII.G.1 — keyed by ZoningClass
const ZONING_TABLE: Record<ZoningClass, {
  flar: number           // mid-range value used for simulation
  bhl_storeys: number
  pso_inside: number     // 0.0–1.0; also used for THROUGH lots (no corner bonus)
  pso_corner: number     // used for CORNER lots only; END lots use pso_inside
  label: string
}>

// RROW → BHL cap (IRR Rule VII §707 + Table VII.2)
// CRITICAL: lookup uses >= on lower bound; 8.00m maps to 5 storeys (8.00–9.99m band)
const RROW_BHL_TABLE: Array<{ minRrow: number; maxRrow: number; bhl_storeys: number }>

// Setback tables
const SETBACK_TABLE_RESIDENTIAL: ...  // IRR Rule VIII Table VIII.2 (R-1 only)
const SETBACK_TABLE_GENERAL: ...      // IRR Rule VIII Table VIII.3 (all others)

// Firewall permissions by zone
// R-1: no firewalls; R-2: rear + sides only (not front); R-3+: all non-front sides
const FIREWALL_ALLOWED: Record<ZoningClass, { sides: ('rear'|'left'|'right')[] }>
```

### `_utils/nbcpCalculator.ts`

```ts
// Single pure export — no React, no Zustand, no side effects
export function calculateEnvelope(inputs: NBCPInputs): NBCPComputed
```

- Never throws; invalid inputs produce violations, not exceptions
- Returns ~20 scalar values + `violations: Violation[]` + `setbacks: { front, rear, left, right }`

**Lot type adjustments:**
- **Corner**: PSO uses `pso_corner`; two perpendicular sides (front + one side) use RROW front setback
- **Through**: Both front AND rear use RROW front setback (two road frontages); PSO uses `pso_inside` (Through lots classified differently under Rule VIII — no corner bonus despite two road frontages)
- **End**: Canonical orientation — road runs along the depth axis; the road-end face = right side of lot. Setbacks: front (RROW front setback), rear (standard rear setback), left (standard side setback), right (RROW front setback — secondary front, functions as front yard per IRR Rule VIII). PSO uses `pso_inside`.

**FLAR–BHL interaction:** When `maxGFA < ambf × bhl_storeys`, effective storey count is reduced to `floor(maxGFA / ambf)`. Telemetry shows `"FLAR limits to N storeys"` — teaches students that FLAR and BHL are competing constraints.
- **Zero-storey guard:** If `floor(maxGFA / ambf) < 1` (i.e., `maxGFA < ambf`), clamp effective storeys to 1 and add violation: `"FLAR too restrictive: max GFA smaller than single-floor footprint"`. A zero-height building is not renderable.

### `_stores/nbcpStore.ts`

Thin Zustand store:
- Input state with setters
- Derived `computed: NBCPComputed` via `calculateEnvelope()` — recomputed on every input change
- `invalidateFn` R3F bridge (same pattern as `labStore.ts`)
- Firewall inputs sanitized before calculation — disallowed sides forced to `false`

**R3F invalidate bridge:** A new hook `_hooks/useNBCPInvalidateOnChange.ts` is created — mirrors `useInvalidateOnChange.ts` exactly but imports `useNBCPStore` instead of `useLabStore`. The existing hook is NOT modified. `NBCPScene.tsx` calls this hook inside the Canvas so the NBCP store's `invalidateFn` is registered independently of the FAR Calculator.

---

## Control Panel (`NBCPControlPanel.tsx`)

Left overlay: `absolute left-4 top-4 bottom-4 w-72 overflow-y-auto`
Style: `bg-white/90 backdrop-blur-sm border border-border rounded-md shadow-lg`

**Five collapsible groups:**

| Group | Controls |
|-------|----------|
| **Lot** | Width slider + number input (5–200m); Depth slider + number input (5–200m); Lot Type dropdown (Inside / Corner / Through / End) |
| **Zoning** | Zoning Class dropdown (R-1, R-2 Basic, R-2 Max, R-3, R-4, R-5, C-1, C-2, C-3, I-1, I-2) |
| **Building** | Floor Height slider (2.7–4.0m, default 3.0m) — labeled _"Design assumption, not a code requirement"_; read-only display: `BHL: 5 storeys × 3.0m = 15.0m` |
| **Road** | RROW Width slider + number input (6–40m) |
| **Firewalls** | Four toggles: Front / Rear / Left / Right — disabled with tooltip when not permitted by zone |

**Preset buttons (top):** `R-1 Subdivision` / `R-3 Apartment` / `C-2 Commercial` / `RROW Effect` / `Firewall Effect`
**Reset button:** returns all inputs to defaults

```ts
const PRESETS = [
  { label: 'R-1 Subdivision', lotWidth: 12, lotDepth: 25, zoning: R1,     lotType: INSIDE,  rrow: 8  },
  { label: 'R-3 Apartment',   lotWidth: 25, lotDepth: 40, zoning: R3,     lotType: INSIDE,  rrow: 15 },
  { label: 'C-2 Commercial',  lotWidth: 30, lotDepth: 50, zoning: C2,     lotType: CORNER,  rrow: 20 },
  { label: 'RROW Effect',     lotWidth: 20, lotDepth: 40, zoning: R3,     lotType: INSIDE,  rrow: 8  }, // BHL=5 despite R-3 → must verify rrow=8 maps to 5 storeys via >= lower bound
  { label: 'Firewall Effect', lotWidth: 12, lotDepth: 25, zoning: R2_MAX, lotType: INSIDE,  rrow: 10, firewalls: { rear: true, left: true } },
]
```

---

## Telemetry HUD (`NBCPTelemetry.tsx`)

Right overlay: `absolute right-4 top-4 bottom-4 w-64 overflow-y-auto`

| Row | Format | State |
|-----|--------|-------|
| TLA | `600.00 sqm` | Always gray |
| PSO | `80% (Inside lot)` | Gray |
| AMBF | `384.00 sqm` | Red if setbacks more constraining than PSO |
| BHL | `5 storeys / 15.00m` | Amber if RROW-limited below zoning max |
| BHL Source | `RROW-limited` or `Zoning-limited` | Info text |
| FLAR | `3.00×` | Red if exceeded |
| Max GFA | `1,800.00 sqm` | Red if actualGFA > maxGFA |
| TOSL | `216.00 sqm (36%)` | Green if generous |
| AMVB | `5,760.00 m³` | Gray |
| Setbacks | `Front: 5.0 \| Rear: 2.0 \| Left: 2.0 \| Right: 2.0` | Gray |
| **Violations** | `⚠ [message] — [IRR citation]` | **Red bordered block, prominent** |

Numbers: `font-mono tabular-nums`

---

## 3D Scene (`NBCPScene.tsx`)

**Scale:** `SCALE = 0.05` (1 Three.js unit = 20m). Camera auto-positions at `[lotWidth * SCALE * 1.2, lotDepth * SCALE * 1.0, lotWidth * SCALE * 1.2]`.

### Geometry Layers (bottom to top)

| Layer | Geometry | Color |
|-------|----------|-------|
| RROW plane | `<Plane>` front of lot (+ rear for Through lots) | `#d1d5db` |
| Lot plate | `<Plane>` reactive to `lotWidth × lotDepth` | `#e5e7eb` |
| Property lines | 4× thin `<Box>` strips | `#374151` |
| Setback zones | 4× `<Plane>` on ground | `#bfdbfe` opacity 0.45 |
| Building envelope | `<Box>` — lerped via `useFrame` | See color states below |
| Floor plates | Thin `<Box>` at each storey | `#1d4ed8` |
| BHL reference line | Thin `<Box>` at max height | `#16a34a` / `#dc2626` |
| Ground grid | Subtle 1m × 1m grid (polish pass) | `#d1d5db` opacity 0.3 |

### Building Envelope Color States

- **Normal**: `#2563eb` opacity 0.65
- **RROW-limited BHL** (no violation, just constrained): `#d97706` amber
- **Any violation**: `#dc2626` red

### Lerp Animation

`frameloop="demand"` means `useFrame` only fires when `invalidate()` is called — a single call produces one frame, not continuous animation. To drive a multi-frame lerp under demand mode, `useFrame` must call `invalidate()` itself at the end of each frame while the lerp is still in progress:

```ts
const { invalidate } = useThree()

useFrame(() => {
  const target = useNBCPStore.getState().computed
  // lerp ref.current scale toward target values
  const settled = lerpRefs(ref, target, 0.12)  // 0.12 = lerp factor (~400ms to settle)
  if (!settled) invalidate()  // schedule next frame until animation completes
})
```

This self-scheduling pattern produces smooth animation under `frameloop="demand"` without converting to `frameloop="always"`. The lerp stops calling `invalidate()` once dimensions are within 0.001 of target (settled), returning the canvas to idle.

### 3D-Anchored Labels (Spatial Contiguity via `<Html distanceFactor={clamp(lotArea)}>`)

- `distanceFactor` clamped to `[6, 12]` based on lot area — tested at 5m and 200m extremes
- Right face: `Height: 15.00m · 5F`
- Top face: `AMBF: 384 sqm`
- Above: `FLAR: 3.00×` (red if violated)
- Each setback zone: `Front: 5.0m`, `Rear: 2.0m`, etc.
- BHL line: `BHL: 15.00m (5F) — RROW-limited` (amber) or `Zoning-limited` (green)

### Violation Annotations (using existing `ViolationIndicator` component)

- FLAR exceeded → above building: `⚠ FLAR 4.2× exceeds max 3.00× — IRR Rule VII Guidelines Table VII.G.1`
- BHL exceeded → top of building: `⚠ Height 18m exceeds BHL 15m — IRR Rule VII §707`
- Incremental setback → side of building: `⚠ Setback increase required above 2F — IRR Rule VIII §804.6`

---

## Edge Cases

| Case | Handling |
|------|----------|
| Setbacks exceed lot dimensions | `ambf = 0`; violation: `"Lot too small for required setbacks"` |
| Firewall on disallowed side | Sanitized to `false` before calculation |
| RROW BHL < zoning BHL | `bhl_source: 'rrow'`; amber building; `BHL Source: RROW-limited` in telemetry |
| FLAR limits storeys | Effective storey count = `floor(maxGFA / ambf)`; telemetry: `"FLAR limits to N storeys"` |
| FLAR produces zero storeys | `maxGFA < ambf`: clamp to 1 storey; violation: `"FLAR too restrictive: max GFA smaller than single-floor footprint"` |
| Through lot | Front + rear both use RROW front setback; PSO uses `pso_inside` |
| End lot | Front + right use RROW front setback (secondary front); rear + left use standard setbacks; PSO uses `pso_inside` |
| Very large lots (>10,000 sqm) | Camera `maxDistance` auto-scales; `distanceFactor` clamped to `[6, 12]` |

---

## Implementation Sequence (5 Phases)

1. **Phase 1** — `_constants/nbcp.ts`: all PD 1096 lookup tables, verified against 2004 Revised IRR
2. **Phase 2** — `_utils/nbcpCalculator.ts` + `_stores/nbcpStore.ts`: pure math engine + thin store
3. **Phase 3** — `NBCPControlPanel.tsx` + `NBCPTelemetry.tsx`: 2D overlay UI
4. **Phase 4** — `NBCPScene.tsx`: R3F geometry with lerp animation
5. **Phase 5** — `NBCPEnvelope.tsx` wrapper + `LabViewport.tsx` + `page.tsx` integration + edge case polish

**Critical rule:** Math engine is built and verified before any polygon is rendered. Phase 1–2 produce zero UI.

---

## Success Criteria

- Every NBCP constant cites its exact IRR Rule/Section/Table
- `calculateEnvelope()` passes hand-calculated verification for:
  - R-3 inside lot, `lotWidth=50m lotDepth=80m` (4000sqm), RROW=15m, no firewalls
  - R-1 corner lot, `lotWidth=15m lotDepth=20m` (300sqm), RROW=8m
  - R-2 Max inside lot with firewall on rear + left sides, RROW=10m
- All 4 lot types produce correct setback modifications
- All violation types trigger with correct IRR citations at the spatial point of violation
- Lerp self-scheduling pattern: canvas idles between user interactions; no continuous rendering
- Mobile: **deferred to v2** — desktop-only for initial release; responsive panels (overflow-y-auto) handle tablet landscape
- `distanceFactor` labels readable at both 5m and 200m lot widths (clamped [6, 12])
- RROW=8m correctly maps to BHL=5 storeys (>= lower bound lookup verified)
