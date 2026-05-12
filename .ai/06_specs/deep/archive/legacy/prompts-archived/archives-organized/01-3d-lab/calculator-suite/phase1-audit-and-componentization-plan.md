# Phase 1 Calculator Suite — Codebase Audit & Componentization Plan

**Document type:** Architecture audit + refactoring specification
**Date:** April 2026
**Status:** Pre-implementation — must be completed before any Calculator Suite module code is written
**Scope:** Audit existing 3D Lab infrastructure, identify reusable components, define extraction strategy for the Calculator Suite

---

## 1. Audit Findings

### 1.1 Architectural Mismatch: 3D Lab vs. Calculator Suite

The existing 3D Lab and the incoming Calculator Suite are **two fundamentally different product surfaces** that share an R3F rendering core but diverge on every other axis. The audit below maps each divergence.

| Dimension | Existing 3D Lab | Calculator Suite (spec) | Gap |
|---|---|---|---|
| **Camera** | Perspective (`fov: 35`), cinematic | Orthographic (`zoom: 80`), diagrammatic | Cannot reuse `CanvasWrapper` camera config |
| **Tone mapping** | `ACESFilmicToneMapping` + `SRGBColorSpace` | `flat` (disabled tone mapping) | `SceneBase` hardcodes ACES; calculators need `flat` |
| **Lighting** | Studio rig (warm key 1.2 + cool fill 0.4 + ambient 0.35) | Minimal (ambient 0.6 + single directional 0.8, no shadows) | `StudioLighting` is overbuilt for calculators |
| **Ground plane** | 80m warm stone + fog + shadow disc | None — floor plane IS the geometry | `SceneBase` ground/fog is waste; calculators render their own floor |
| **Materials** | `meshStandardMaterial` with roughness/metalness per ArchMass | Cached flat `MeshBasicMaterial` / `MeshStandardMaterial` palette | New material system needed; existing per-mesh materials create excess draw calls |
| **Geometry** | `GeometryInstruction[]` → `InstructionMesh` (individual meshes) | `InstancedMesh` for tile/board arrays (1 draw call per material) | `InstructionMesh` creates 1 draw call per tile — fatal for 500+ tile grids |
| **Store pattern** | `createModuleStore` (generic `params: Record<string, ...>`) | Per-tool typed stores with `inputVersion` counter + `computed` slice | Generic store lacks computed derivations, typed inputs, and version-based invalidation |
| **Invalidation** | `useInvalidateOnChange` → registers into `labStore` | `SceneInvalidator` watches `inputVersion` from tool-specific store | Existing hook hardcoded to `labStore`; `useModuleInvalidate` is closer but lacks `inputVersion` |
| **Layout** | Full-bleed canvas with 240px left drawer overlay | Three-panel grid: 320px input | 1fr canvas | 340px results | Completely different layout paradigm |
| **Shell** | `ModuleViewer` (LabTopBar + OnboardingFlow + ContextCard) | No top bar, no onboarding — breadcrumb + three panels + disclaimer | `ModuleViewer` is 3D Lab chrome; calculators need their own page shell |
| **Routing** | `/dashboard/3d-lab?model={id}` via `LabViewport` dispatch | `/calculators/flooring`, `/calculators/paint`, `/calculators/drywall` | Separate route tree entirely; no `LabViewport` involvement |

**Conclusion (REVISED):** Rather than building a parallel component tree, we **extend the existing 3D Lab template system** with a new `calculator` template type. This adds capabilities to the current system (more features, not fewer), keeps all rendering infrastructure in one place, and ensures existing templates continue to work untouched. The key extensions are: an orthographic mode flag on `CanvasWrapper`, a `CalculatorConfig` interface in the type system, and a `calculator` case in `LabViewport`'s dispatch switch. Calculator-specific UI (three-panel layout, typed stores, computation engines) lives alongside the existing template components.

---

### 1.2 Components That ARE Reusable (Extract & Generalize)

These components contain logic that both the 3D Lab and Calculator Suite need, but are currently coupled to 3D Lab specifics.

#### A. Invalidation Bridge Pattern

**Current state:** Three separate hooks doing the same thing with different store bindings.
- `useInvalidateOnChange.ts` → hardcoded to `labStore`
- `useModuleInvalidate.ts` → accepts any `ModuleStoreState` store
- `useNBCPInvalidateOnChange.ts` → hardcoded to `nbcpStore`

**Problem:** The Calculator Suite needs the same pattern but with its own stores that have an `inputVersion` counter (not the generic `ModuleStoreState` shape). Three hooks doing identical work = unnecessary duplication.

#### B. GeometryElement / InstructionMesh

**Current state:** `GeometryMesh.tsx` renders `GeometryInstruction` objects as individual meshes.

**Problem:** Works for 3D Lab modules (10-30 meshes per scene) but is insufficient for calculators (500+ tiles). However, the geometry-type switch (`box`, `cylinder`, `plane`, etc.) is reusable for non-instanced elements (floor planes, exclusion zones, framing members).

#### C. Orbit Controls Configuration

**Current state:** Hardcoded in `CanvasWrapper` with perspective-oriented defaults.

**Problem:** Calculators need different polar angle limits, zoom ranges (not distance — they use orthographic zoom), and damping. The configuration needs extraction.

#### D. Loading Overlay Pattern

**Current state:** `CanvasWrapper` renders a spinner until `onCreated` fires. `LabViewport` uses `LoadingSpinner` for dynamic imports.

**Problem:** Good pattern, needs extraction into a shared primitive so calculators can use the same loading UX.

---

### 1.3 Components to EXTEND (Revised Strategy)

Instead of leaving these untouched and building parallel alternatives, we extend them with new capabilities. Existing behavior is preserved via default prop values.

| Component | Extension | How existing behavior is preserved |
|---|---|---|
| `CanvasWrapper.tsx` | Add `orthographic`, `flat`, `disableLighting`, `disableSceneBase` props | All new props default to `false`; existing templates pass no new props and get identical behavior |
| `LabViewport.tsx` | Add `'calculator'` case to template dispatch switch | Existing cases untouched; new case only triggers for `calculator` templateType |
| `_types/templates.ts` | Add `CalculatorConfig` interface + `'calculator'` to `TemplateType` union + `CalculatorConfig` to `ModuleConfig` discriminated union | Union extension is additive; existing types unchanged |

### Components That Stay Untouched

| Component | Why no changes needed |
|---|---|
| `SceneBase.tsx` | Calculator templates skip it via `disableSceneBase` flag on CanvasWrapper |
| `StudioLighting.tsx` | Calculator templates skip it via `disableLighting` flag; use CalculatorLighting instead |
| `GenericControlPanel.tsx` | Calculators use their own InputPanel; GenericControlPanel continues to serve parametric/exploded/etc. templates |
| `ModuleViewer.tsx` | Calculator route pages render their own shell; ModuleViewer stays for 3D Lab modules |
| `ArchMass.tsx` | Calculator scenes use InstancedMesh directly |
| `HotspotAnnotation.tsx` | Calculator scenes use DOM result panels |
| `createModuleStore.ts` | Calculator stores are separate typed stores; generic store stays for existing templates |

---

### 1.4 Tight Coupling Issues

| Issue | Location | Impact |
|---|---|---|
| `useInvalidateOnChange` imports `labStore` directly | `_hooks/useInvalidateOnChange.ts:6` | Cannot be used outside 3D Lab context |
| `CanvasWrapper` imports `useInvalidateOnChange` directly | `_components/CanvasWrapper.tsx:8` | Forces all Canvas users through `labStore` |
| `InvalidateRegistrar` is defined inside `CanvasWrapper` | `_components/CanvasWrapper.tsx:24-27` | Cannot opt out of labStore registration |
| `createModuleStore` uses untyped `Record<string, number \| boolean \| string>` | `_stores/createModuleStore.ts:4` | Calculator stores need typed fields + computed slices + `inputVersion` |
| `GenericControlPanel` is tightly bound to `ParameterDef[]` + `ModuleStoreState` | `_components/GenericControlPanel.tsx:277-288` | Cannot render number inputs, tile presets, sponsor cards |
| All templates hardcode `CanvasWrapper` import | `_templates/ParametricScene.tsx:7` | Cannot swap in a different canvas configuration |

---

## 2. Componentization Strategy

### 2.1 Extraction Targets — New Shared Primitives

Create a new shared directory `src/components/r3f/` for framework-level R3F primitives that both the 3D Lab and Calculator Suite consume. These are pure rendering utilities with zero product-level opinions.

```
src/components/r3f/
├── useRegisterInvalidate.ts       ← Generic invalidation bridge
├── SceneInvalidator.tsx           ← Version-counter-based invalidator
├── CalculatorOrbitControls.tsx    ← Orthographic orbit config
├── GeometrySwitch.tsx             ← Extracted from GeometryMesh.tsx
├── CanvasLoadingOverlay.tsx       ← Extracted from CanvasWrapper
└── types.ts                       ← Shared R3F primitive types
```

#### `useRegisterInvalidate.ts`

Replaces `useInvalidateOnChange`, `useModuleInvalidate`, and `useNBCPInvalidateOnChange` with a single generic hook.

```ts
import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

/**
 * Generic invalidation bridge — registers R3F's invalidate() into any
 * Zustand store that exposes a setInvalidateFn method.
 *
 * Usage inside Canvas:
 *   useRegisterInvalidate(useMyStore, (s) => s.setInvalidateFn)
 */
export function useRegisterInvalidate<T>(
  useStore: (selector: (s: T) => (fn: (() => void) | null) => void) => (fn: (() => void) | null) => void,
  selector: (s: T) => (fn: (() => void) | null) => void,
) {
  const { invalidate } = useThree()
  const setInvalidateFn = useStore(selector)

  useEffect(() => {
    setInvalidateFn(invalidate)
    return () => setInvalidateFn(null)
  }, [invalidate, setInvalidateFn])
}
```

**Migration:** Existing 3D Lab hooks become thin wrappers:
```ts
// _hooks/useInvalidateOnChange.ts — now a one-liner
export const useInvalidateOnChange = () =>
  useRegisterInvalidate(useLabStore, (s) => s.setInvalidateFn)
```

#### `SceneInvalidator.tsx`

For Calculator Suite stores that use an `inputVersion` counter instead of direct `invalidateFn` calls:

```ts
import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

interface SceneInvalidatorProps<T> {
  useStore: (selector: (s: T) => number) => number
  selector: (s: T) => number
}

/**
 * Watches a version counter in a Zustand store and calls invalidate()
 * when it changes. This is the SOLE bridge between store mutations and
 * Canvas re-renders in Calculator Suite tools.
 */
export function SceneInvalidator<T>({ useStore, selector }: SceneInvalidatorProps<T>) {
  const invalidate = useThree((s) => s.invalidate)
  const version = useStore(selector)

  useEffect(() => {
    invalidate()
  }, [version, invalidate])

  return null
}
```

#### `GeometrySwitch.tsx`

Extracted from `GeometryMesh.tsx` — pure geometry element factory, no mesh wrapping:

```ts
import type { GeometryType } from '@/app/dashboard/3d-lab/_types/templates'

interface GeometrySwitchProps {
  type: GeometryType
  args: number[]
}

/**
 * Returns the correct Three.js geometry JSX intrinsic for a given type.
 * Shared between 3D Lab (InstructionMesh) and Calculator Suite (custom meshes).
 */
export function GeometrySwitch({ type, args }: GeometrySwitchProps) {
  switch (type) {
    case 'box': return <boxGeometry args={args as [number, number, number]} />
    case 'cylinder': return <cylinderGeometry args={args as [number, number, number, number]} />
    case 'plane': return <planeGeometry args={args as [number, number]} />
    case 'ring': return <ringGeometry args={args as [number, number]} />
    case 'sphere': return <sphereGeometry args={args as [number, number, number]} />
    case 'cone': return <coneGeometry args={args as [number, number, number]} />
    default: return <boxGeometry args={[0.1, 0.1, 0.1]} />
  }
}
```

**Migration:** `GeometryMesh.tsx` imports `GeometrySwitch` instead of defining its own switch:
```ts
// GeometryMesh.tsx — updated
import { GeometrySwitch } from '@/components/r3f/GeometrySwitch'

export function GeometryElement({ inst }: { inst: GeometryInstruction }) {
  return <GeometrySwitch type={inst.type} args={inst.args} />
}
```

#### `CanvasLoadingOverlay.tsx`

Extracted from `CanvasWrapper`:

```ts
import { CircleNotch } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'

interface CanvasLoadingOverlayProps {
  visible: boolean
  message?: string
  bgClassName?: string
}

export function CanvasLoadingOverlay({
  visible,
  message = 'Loading Scene...',
  bgClassName = 'bg-[#EEF2FA]/80',
}: CanvasLoadingOverlayProps) {
  if (!visible) return null
  return (
    <div className={`absolute inset-0 flex items-center justify-center ${bgClassName} z-10`}>
      <div className="flex flex-col items-center gap-3">
        <SCIcon icon={CircleNotch} size="lg" className="animate-spin text-zinc-300" />
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">
          {message}
        </span>
      </div>
    </div>
  )
}
```

---

### 2.2 Calculator Suite — New Component Tree

These are Calculator Suite-specific components that live under the new route tree. They import shared primitives from `src/components/r3f/` but are otherwise independent from the 3D Lab.

```
src/app/calculators/
├── page.tsx                              ← Suite index (Server Component)
├── layout.tsx                            ← Minimal layout (no dashboard chrome)
├── _components/
│   ├── CalculatorCanvasShell.tsx         ← Orthographic Canvas + flat + minimal lighting
│   ├── CalculatorLighting.tsx            ← ambient(0.6) + directional(0.8), no shadows
│   ├── CalculatorOrbitControls.tsx       ← Constrained ortho orbit config
│   ├── InputPanel.tsx                    ← Shared input panel shell (left column)
│   ├── ResultPanel.tsx                   ← Shared result panel shell (right column)
│   ├── ResultRow.tsx                     ← Single result trail row
│   ├── AssumptionsAccordion.tsx          ← Shared assumptions display
│   ├── SponsorCard.tsx                   ← Sponsor product card
│   ├── CanvasEmptyState.tsx              ← Ghost placeholder before dims entered
│   ├── EstimationDisclaimer.tsx          ← Shared footer disclaimer
│   └── ExportActions.tsx                 ← PDF export + Save buttons (premium gate)
├── _stores/
│   ├── types.ts                          ← BaseCalculatorStore interface
│   ├── flooringStore.ts                  ← Typed flooring inputs + computed + recompute
│   ├── paintStore.ts                     ← Typed paint inputs + computed + recompute
│   └── drywallStore.ts                   ← Typed drywall inputs + computed + recompute
├── _lib/
│   ├── calculator-materials.ts           ← Cached THREE materials (spec §4)
│   ├── flooring-engine.ts                ← Pure computation: generateTileGrid + estimate
│   ├── paint-engine.ts                   ← Pure computation: wall areas + can sizes
│   └── drywall-engine.ts                 ← Pure computation: stud positions + board placements
├── flooring/
│   ├── page.tsx                          ← Three-panel layout + conditional Canvas mount
│   ├── _components/
│   │   ├── FlooringScene.tsx             ← R3F scene root
│   │   ├── FloorPlane.tsx                ← Room footprint mesh
│   │   ├── ExclusionZones.tsx            ← Dark cutout boxes
│   │   ├── TileGridInstanced.tsx         ← InstancedMesh — all full tiles
│   │   ├── CutTileGridInstanced.tsx      ← InstancedMesh — all cut tiles
│   │   ├── PatternOrientationArrow.tsx   ← Arrow on floor
│   │   └── FlooringInputPanel.tsx        ← Tool-specific input fields
│   └── _lib/
│       └── tile-presets.ts               ← PH tile size presets
├── paint/
│   ├── page.tsx
│   ├── _components/
│   │   ├── PaintScene.tsx
│   │   ├── RoomShell.tsx                 ← 4-wall box
│   │   ├── WallSurface.tsx              ← Per-wall paintable face
│   │   ├── OpeningCutouts.tsx           ← Door/window voids
│   │   ├── CeilingSurface.tsx           ← Optional ceiling
│   │   └── PaintInputPanel.tsx
│   └── _lib/
│       └── paint-presets.ts
└── drywall/
    ├── page.tsx
    ├── _components/
    │   ├── DrywallScene.tsx
    │   ├── StudArray.tsx                 ← Stud lines at spacing
    │   ├── TrackBars.tsx                 ← Top/bottom tracks
    │   ├── OpeningVoids.tsx             ← Door/window voids
    │   ├── BoardPanels.tsx              ← Board overlay (toggled)
    │   └── DrywallInputPanel.tsx
    └── _lib/
        └── drywall-presets.ts
```

---

### 2.3 `CalculatorCanvasShell` — The Calculator Equivalent of `CanvasWrapper`

This is the most critical new component. It replaces `CanvasWrapper` for calculators with spec-mandated orthographic + flat rendering.

```ts
interface CalculatorCanvasShellProps {
  children: React.ReactNode
  /** Background color passed to gl.setClearColor */
  clearColor?: string
}
```

**Key differences from `CanvasWrapper`:**

| Attribute | `CanvasWrapper` (3D Lab) | `CalculatorCanvasShell` (Calc Suite) |
|---|---|---|
| Camera | `perspective`, `fov: 35` | `orthographic`, `zoom: 80` |
| `flat` prop | absent (ACES tone mapping active) | `flat` (no tone mapping) |
| Shadows | `shadows` enabled | No `shadows` prop |
| `dpr` | `[1, 1.5]` | `[1, 1.5]` (shared) |
| `frameloop` | `"demand"` | `"demand"` (shared) |
| Internal lighting | `<StudioLighting />` | `<CalculatorLighting />` |
| Internal scene | `<SceneBase />` | None — tool scene IS the content |
| Invalidation | `<InvalidateRegistrar />` → `labStore` | `<SceneInvalidator />` → per-tool store |
| Orbit controls | Perspective-oriented (distance limits) | Orthographic-oriented (zoom limits) |
| `gl` config | default | `{ antialias: true, alpha: false, powerPreference: 'high-performance' }` |

---

### 2.4 Zustand Store Architecture — Calculator Suite Pattern

Each calculator store follows this shared base pattern (distinct from `createModuleStore`):

```ts
// src/app/calculators/_stores/types.ts

export interface BaseCalculatorStore {
  /** Incremented on every input mutation. SceneInvalidator watches this. */
  inputVersion: number

  /** UI state — does NOT trigger 3D re-render */
  viewMode: 'default' | 'deductions' | 'waste'
  resultMode: 'net' | 'buy'
  hoveredSurface: string | null

  setViewMode: (mode: BaseCalculatorStore['viewMode']) => void
  setResultMode: (mode: 'net' | 'buy') => void
  setHoveredSurface: (id: string | null) => void
}
```

**Why not extend `createModuleStore`:**

| `createModuleStore` | Calculator stores |
|---|---|
| Untyped `params: Record<string, ...>` | Typed fields: `roomLengthMm: number`, `tileLengthMm: number` |
| No computed derivations | `computed: FlooringComputed` with full result trail |
| Calls `invalidateFn?.()` on every `setParam` | Increments `inputVersion` counter; `SceneInvalidator` watches it |
| Single `reset()` resets all params | Per-field `setInput<K>()` with recompute on each change |
| No `recompute()` method | `recompute()` regenerates `computed` slice including 3D scene data (e.g., `tileGrid`) |

The generic store is designed for educational modules with simple slider parameters. Calculator stores are domain-specific computation engines. Trying to force one into the other would compromise both.

---

## 3. Step-by-Step Execution Plan

### Phase A: Extract Shared Primitives (No behavior changes)

All changes in this phase are non-breaking refactors. The 3D Lab continues to function identically.

**Step A.1: Create `src/components/r3f/` directory**
- Create `useRegisterInvalidate.ts` — generic invalidation bridge hook
- Create `GeometrySwitch.tsx` — extracted geometry type switch
- Create `CanvasLoadingOverlay.tsx` — extracted loading overlay
- Create `types.ts` — shared R3F primitive types (`GeometryType` enum re-export)

**Step A.2: Rewire existing 3D Lab hooks to use shared primitives**
- `_hooks/useInvalidateOnChange.ts` → import `useRegisterInvalidate`, call with `labStore` selector
- `_hooks/useModuleInvalidate.ts` → import `useRegisterInvalidate`, call with module store selector
- `_hooks/useNBCPInvalidateOnChange.ts` → import `useRegisterInvalidate`, call with `nbcpStore` selector
- `_components/GeometryMesh.tsx` → import `GeometrySwitch` from shared, `GeometryElement` becomes a wrapper
- `_components/CanvasWrapper.tsx` → import `CanvasLoadingOverlay` from shared

**Step A.3: Verify 3D Lab is unchanged**
- Run existing 3D Lab manually: load FARPlayground, ClassicalOrders, NBCPEnvelope, and 2-3 template modules
- Confirm rendering, invalidation, and controls work identically
- No visual diff, no console errors

---

### Phase B: Scaffold Calculator Suite Route Tree (Empty shells)

**Step B.1: Create route structure**
- `src/app/calculators/layout.tsx` — minimal layout (no dashboard sidebar)
- `src/app/calculators/page.tsx` — Server Component index with tool card grid
- `src/app/calculators/flooring/page.tsx` — empty shell with three-panel grid
- `src/app/calculators/paint/page.tsx` — empty shell
- `src/app/calculators/drywall/page.tsx` — empty shell

**Step B.2: Create shared calculator UI components**
- `_components/CalculatorCanvasShell.tsx` — orthographic Canvas + flat + minimal lighting + `SceneInvalidator` slot
- `_components/CalculatorLighting.tsx` — ambient(0.6) + directional(0.8)
- `_components/CalculatorOrbitControls.tsx` — orthographic zoom limits, constrained polar angles
- `_components/InputPanel.tsx` — shared input panel shell (320px left column, mobile accordion)
- `_components/ResultPanel.tsx` — shared result panel shell (340px right column)
- `_components/ResultRow.tsx` — single result row with deduction/addition/summary/highlight variants
- `_components/AssumptionsAccordion.tsx` — Shadcn Accordion wrapper
- `_components/SponsorCard.tsx` — sponsor product card (hidden if no sponsor data)
- `_components/CanvasEmptyState.tsx` — ghost placeholder before dimensions entered
- `_components/EstimationDisclaimer.tsx` — standard disclaimer text
- `_components/ExportActions.tsx` — PDF export + Save buttons with premium gate

**Step B.3: Create calculator material palette**
- `_lib/calculator-materials.ts` — cached THREE materials per spec §4
- `setPaintableWallColor()` utility for runtime color mutation

---

### Phase C: Build Typed Stores + Computation Engines (Pure logic, no UI)

**Step C.1: Define store types**
- `_stores/types.ts` — `BaseCalculatorStore` interface

**Step C.2: Build computation engines (pure functions, testable)**
- `_lib/flooring-engine.ts` — `computeFlooringEstimate()`, `generateTileGrid()`
- `_lib/paint-engine.ts` — `computePaintEstimate()`, `computeWallAreas()`
- `_lib/drywall-engine.ts` — `computeDrywallEstimate()`, `computeStudPositions()`, `computeBoardPlacements()`
- Write unit tests for each engine against formula spec

**Step C.3: Build typed Zustand stores**
- `_stores/flooringStore.ts` — `FlooringInputs` + `FlooringComputed` + `setInput<K>()` + `recompute()`
- `_stores/paintStore.ts` — `PaintInputs` + `PaintComputed` + `setInput<K>()` + `recompute()`
- `_stores/drywallStore.ts` — `DrywallInputs` + `DrywallComputed` + `setInput<K>()` + `recompute()`
- Each store: typed inputs, `inputVersion` counter, `recompute()` calls engine, derived `computed` slice

---

### Phase D: Implement Tool-Specific Scenes (One tool at a time)

Build order per spec: **Flooring → Paint → Drywall**.

**Per-tool implementation steps (flooring example):**

1. `FlooringInputPanel.tsx` — room mode toggle, dimension inputs, tile presets, pattern selector, waste/spare inputs, procurement fields, sponsor card slot
2. `FlooringScene.tsx` — R3F scene root, subscribes to `flooringStore` via granular selectors
3. `FloorPlane.tsx` — `BoxGeometry` at room dimensions
4. `ExclusionZones.tsx` — group of dark cutout boxes
5. `TileGridInstanced.tsx` — single `InstancedMesh` for all full tiles (reads `computed.tileGrid`)
6. `CutTileGridInstanced.tsx` — single `InstancedMesh` for all cut tiles
7. `PatternOrientationArrow.tsx` — drei `<Line>` arrow
8. Wire `flooring/page.tsx` — three-panel layout, conditional Canvas mount, result trail rendering
9. Integration test: input dimensions → see 3D preview + result trail update in real-time

---

### Phase E: Performance Validation

**Per-tool verification checklist:**

| Check | Target | Tool |
|---|---|---|
| Draw calls | ≤ 50 | Chrome DevTools → Three.js inspector or `gl.info.render.calls` |
| Frame budget | ≤ 33ms (30fps) on mobile | R3F `useFrame` perf hook or Chrome Performance tab |
| `frameloop="demand"` | 0 frames when idle | Verify with `gl.info.render.frame` counter |
| Zustand subscriptions | No full-store subscriptions inside Canvas | Code review: grep for `useStore()` without selector |
| InstancedMesh allocation | Pre-allocated to max count, not resized on input change | Code review |
| Material reuse | All meshes reference `CALC_MATERIALS` constants | Code review: no inline `new THREE.Material()` inside render |
| Bundle size | Each tool chunk ≤ 50KB (excluding shared three.js) | `next build` + analyze |

---

## 4. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Shared primitive extraction breaks 3D Lab | Low | High | Phase A ends with full manual verification before moving to Phase B |
| `InstancedMesh` count exceeds GPU limit on mobile | Low | Medium | Pre-allocate max 10,000 instances; cap tile grid computation at this limit |
| Orthographic camera confuses users expecting 3D depth | Medium | Low | Spec confirms orthographic is correct for estimation tools — "eliminates perspective distortion" |
| Three stores with `recompute()` cause stale closures | Medium | Medium | Use `get()` pattern inside `recompute()`, not `set()` callback — matches existing NBCP store pattern |
| `calculator-materials.ts` creates materials on module load (even if tool not visited) | Low | Low | Wrap in lazy initializer; materials created on first access |

---

## 5. What This Plan Does NOT Include

Per the task boundary constraints:

- No new 3D module implementations (flooring/paint/drywall scene code is Phase D, gated behind Phases A-C)
- No modifications to existing 3D Lab module configs (`_config/modules/*`)
- No changes to the module registry (`_config/registry/*`)
- No SEO, sponsorship, or freemium gate implementation
- No PDF export or email capture functionality
- No mobile gesture tuning beyond what the spec defines

---

*This document must be reviewed and approved before any code in Phases A-E is written. The 3D Lab must remain fully functional throughout the entire refactoring process.*
