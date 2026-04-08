# 02 — Phase Tracker (Living Document)

**Purpose:** Actionable checklist for implementation. **UPDATE THIS FILE** as tasks complete.
**Rule:** Before starting ANY phase, read `01_master_architecture.md` and `04_ux_ui_gatekeeper.md`. After completing ANY phase, run the gatekeeper checklist and update `.ai/state/current-task.md`.

---

## AI Self-Management Protocol

```
BEFORE EACH PHASE:
  1. Read .ai/state/current-task.md
  2. Read 01_master_architecture.md (rules + constraints)
  3. Read 04_ux_ui_gatekeeper.md (verification gates for THIS phase)
  4. Run `bun run type-check` — must pass before starting

AFTER EACH PHASE:
  1. Run `bun run type-check` — must pass
  2. Run `bun run build` — must pass
  3. Execute verification gate from 04_ux_ui_gatekeeper.md
  4. Update this file: check completed tasks, note any deviations
  5. Update .ai/state/current-task.md with new status
  6. git commit with conventional message

IF BLOCKED:
  1. Document blocker in this file under the phase
  2. Update .ai/state/current-task.md
  3. Ask user for guidance — do NOT guess or hallucinate a workaround
```

---

## Execution Order

```
P0 (baseline) → P1 (CRITICAL PATH) → P2, P3, P4 (parallel after P1)
P5, P6, P7, P8, P9 (independent after P0)
Then: Build Phase 0 → Wave 1 → Wave 2 → Wave 3 → Wave 4
Parallel: Regulatory track (non-blocking but mandatory before ship)
```

---

## Architecture Phases

### Phase 0: Pre-Flight Verification
**Status:** NOT STARTED
**Gate:** `04_ux_ui_gatekeeper.md` § Phase 0

- [ ] **0.1** `bun run type-check` — record baseline
- [ ] **0.2** `bun run build` — confirm all 3D routes compile
- [ ] **0.3** Document current behavior of each module (see regression-checklist.md)
- [ ] **0.4** Record `gl.info.memory` baseline for 3 module switches

**Blockers:** None expected
**Notes:**

---

### Phase 1: Fix CanvasWrapper + SceneConfig [F-01, F-06, F-13, F-15]
**Status:** ✅ COMPLETE (2026-04-08)
**Depends on:** P0
**Gate:** `04_ux_ui_gatekeeper.md` § Phase 1

Files to CREATE:
- [x] `src/features/3d-lab/components/rendering/SceneConfig.tsx`

Files to MODIFY:
- [x] `components/CanvasWrapper.tsx` — stripped 15 dead props, added `sceneConfig` prop
- [x] `components/shell/LabViewportFrame.tsx` — removed hardcoded camera/controls/lighting, added PerformanceMonitor with flipflops={3} + DPR management
- [x] All 10 template consumers — replaced dead props with `sceneConfig={{ ... }}`

Files to DELETE:
- [x] `components/templates/CanvasWrapper.tsx` (re-export) — DELETED
- [x] `components/templates/GlobalCanvasPortal.tsx` (re-export) — DELETED

**Blockers:** None
**Notes:**
- SceneConfig uses imperative CameraSetup (useEffect) for perspective camera to avoid fighting with OrbitControls on re-renders
- OrthographicCamera uses drei declarative component (only for Calculator orthographic mode)
- PerformanceMonitor adjusts DPR between 1.0-2.0 in 0.5 steps
- Canvas `camera` prop kept as fallback matching SceneConfig defaults ([6,6,6], fov:35)
- NBCP passes `disableLighting: true, disableSceneBase: true` — manages own camera/controls/lighting internally
- `disableShadows` and `glConfig` (Canvas-level props) deferred to Phase 4
- Calculator orthographic/flat modes now actually WORK via SceneConfig (previously dead props)

---

### Phase 2: WebGL Lifecycle Safety [F-02, F-03]
**Status:** COMPLETE (2026-04-08)
**Depends on:** P1
**Gate:** `04_ux_ui_gatekeeper.md` § Phase 2

Files to CREATE:
- [x] `src/components/r3f/WebGLErrorBoundary.tsx` (dual strategy: error boundary + context loss listener)
- [x] `src/components/r3f/useDisposeOnUnmount.ts` (imperative objects ONLY — R3F auto-disposes JSX)
- [x] `src/components/r3f/useWebGLMemoryMonitor.ts` (dev-only)

Files to MODIFY:
- [x] `LabViewportFrame.tsx` — wrapped Canvas in WebGLErrorBoundary
- [x] `src/components/r3f/index.ts` — exported new utilities
- [x] 13 scene components — added `useDisposeOnUnmount` to root group ref:
  - [x] `ParametricSceneRenderer.tsx`
  - [x] `ExplodedAssemblyScene.tsx`
  - [x] `CutawaySectionScene.tsx`
  - [x] `AnimatedSequenceScene.tsx`
  - [x] `FloorPlanScene.tsx`
  - [x] `WallConfiguratorRenderer.tsx`
  - [x] `NBCPScene.tsx`
  - [x] `FARScene.tsx`
  - [x] `ClassicalOrdersScene.tsx`
  - [x] `FlooringScene.tsx`
  - [x] `PaintScene.tsx`
  - [x] `DrywallScene.tsx`
  - [x] `CHBScene.tsx`

**Blockers:** None
**Notes:** Commit `83f7b23`. WebGLErrorBoundary is a class component (React error boundary requirement — only exception to arrow-function rule). useDisposeOnUnmount handles ImageBitmap leak via texture.source.data.close?.(). useWebGLMemoryMonitor is dev-only (no-op in production).

---

### Phase 3: 2D DOM Overlay System [F-04, F-05, F-07, F-20]
**Status:** COMPLETE (2026-04-08)
**Depends on:** P1
**Gate:** `04_ux_ui_gatekeeper.md` § Phase 3 (CRITICAL — zero `<Html>` gate)

Files to CREATE:
- [x] `src/features/3d-lab/constants/scene-colors.ts`
- [x] `src/features/3d-lab/stores/useOverlayStore.ts`
- [x] `src/features/3d-lab/hooks/useWorldToScreen.ts`
- [x] `src/features/3d-lab/components/overlays/DOMOverlayLayer.tsx`
- [x] `src/features/3d-lab/components/overlays/CameraSync.tsx`
- [x] `src/features/3d-lab/components/overlays/LabelOverlay.tsx`
- [x] `src/features/3d-lab/components/overlays/ViolationBadge.tsx`
- [x] `src/features/3d-lab/components/overlays/PartTooltip.tsx`
- [x] `src/features/3d-lab/components/overlays/HotspotCard.tsx`
- [x] `src/features/3d-lab/components/overlays/DimensionLabel.tsx` (added — not in original plan)

Files to MODIFY (removed ALL `<Html>` and `<Text>`):
- [x] `ExplodedAssemblyScene.tsx` — writes part positions to overlay store
- [x] `CutawaySectionScene.tsx` — writes layer data to overlay store
- [x] `FloorPlanScene.tsx` — writes violation/annotation positions to overlay store
- [x] `AnimatedSequenceScene.tsx` — writes step labels to overlay store
- [x] `ParametricSceneRenderer.tsx` — writes violation/annotation to overlay store
- [x] `NBCPScene.tsx` — writes setback labels/dimensions to overlay store
- [x] `FARScene.tsx` — writes setback/FAR/height labels to overlay store
- [x] `ClassicalOrdersScene.tsx` — writes hotspot quiz prompt to overlay store
- [x] `HotspotAnnotation.tsx` — rewritten to emit overlay items (returns null)
- [x] `HumanSilhouette.tsx` — removed `<Html>`, emits "1.7m" as overlay item
- [x] `ViolationIndicator.tsx` — rewritten to emit overlay items (returns null)
- [x] `CanvasWrapper.tsx` — integrated CameraSync inside tunnel
- [x] `LabViewportFrame.tsx` — integrated DOMOverlayLayer as Canvas sibling

**Blockers:** None
**Notes:** Commit `77560de`. Zero `<Html>` gate PASSED — grep confirms 0 Html imports outside DevControls. GroundPlane.tsx created but SceneBase.tsx not modified (deferred). scene-colors.ts created with centralized hex values for NBCP/FAR scenes.

---

### Phase 4: Configurable Lighting [F-08]
**Status:** COMPLETE (2026-04-08)
**Depends on:** P1
**Gate:** `04_ux_ui_gatekeeper.md` § Phase 4

- [x] Added `lightingPreset` to `SceneConfigProps` (presets: studio, clinical, dramatic, flat)
- [x] Refactored `StudioLighting.tsx` to accept `preset` prop with PRESETS lookup table (backward compatible — studio default is verbatim copy of previous hardcoded values)
- [x] Migrated `CalculatorLighting.tsx` to deprecated wrapper over `<StudioLighting preset="flat" />`

**Blockers:** None
**Notes:** Commit `14b1053`. Fill light conditionally rendered (skipped when fillIntensity === 0, as in flat preset). LightingPreset type exported for use in SceneConfig.

---

### Phase 5: Store Lifecycle & Isolation [F-11, F-09]
**Status:** NOT STARTED
**Depends on:** P0

- [ ] Split `useLabStore` → `useLabNavigationStore` + `useLabProgressStore` + `useLabViewStore` (keep re-export)
- [ ] Add `resetOnUnmount` to `createModuleStore()`
- [ ] Create `src/features/3d-lab/hooks/useModuleLifecycle.ts`
- [ ] Verify/delete `useInvalidateOnChange.ts` (potentially broken — see Appendix B.2 in master doc)
- [ ] Selective invalidation: remove `invalidateFn()` from `setActiveAnnotation`

**Blockers:**
**Notes:**

---

### Phase 6: Asset Loading [F-12]
**Status:** NOT STARTED
**Depends on:** P0

- [ ] Create `AssetPreloader.tsx`
- [ ] Upgrade `CanvasLoadingOverlay` → `LoadingProgress.tsx` (backward compatible)
- [ ] Extend `ModuleRegistryEntry` with `assets?` field
- [ ] Configure DRACO decoder path globally

**Blockers:**
**Notes:**

---

### Phase 7: Animation Completion [F-14]
**Status:** NOT STARTED
**Depends on:** P0

- [ ] Create `useAnimationComplete.ts` hook
- [ ] Refactor 5 scenes: AnimatedSequence, Cutaway, Exploded, NBCP, FAR

**Blockers:**
**Notes:**

---

### Phase 8: Mobile & Navigation [F-10, F-17, F-19]
**Status:** NOT STARTED
**Depends on:** P0

- [ ] `ModuleViewer.tsx` stale-closure guard
- [ ] Create `camera-presets.ts` (shared registry)
- [ ] Mobile: `touch-action: none`, mobile DPR `[1, 1.25]`, `enableDamping={false}`

**Blockers:**
**Notes:**

---

### Phase 9: Template Normalization [F-21-F-25]
**Status:** NOT STARTED
**Depends on:** P0

- [ ] Fix ExplodedAssembly store deps: `[]` → `[config.id]`
- [ ] Fix AnimatedSequence store deps: `[]` → `[config.id]`
- [ ] Stabilize useMemo pattern, remove ESLint disables (3 templates)
- [ ] Create `SceneErrorBoundary.tsx` + add to all 7 templates
- [ ] Create `SceneEmptyState.tsx` + add to all scene renderers
- [ ] Evaluate LabPanelLayout adoption for remaining templates

**Blockers:**
**Notes:**

---

## Module Rollout

### Build Phase 0: Repair Broken Existing Modules
**Status:** ✅ COMPLETE (2026-04-08)
**Depends on:** Architecture P0

- [x] Site Development Controls — verified working (bespoke, own Canvas, unaffected)
- [x] Stairway Geometry Configurator — fixed pointer-events-none blocking LabPanelLayout panels
- [x] Unified Wall Configurator — fixed pointer-events-none blocking LabPanelLayout panels
- [x] Flooring / Tile Visualizer — fixed pointer-events-none on CalculatorTemplate + set default room dimensions (4000x3000mm) + pre-computed initial tile grid

**Root Cause:** LabViewportFrame children wrapper had `pointer-events-none` that cascaded to all template panels, making controls unclickable. Fixed by adding `pointer-events-auto` to LabPanelLayout grid root and CalculatorTemplate layout, with `pointer-events-none` on center viewport divs to preserve Canvas event pass-through.
**Plan:** `.ai/plans/archive/build_phase_0_module_repair_plan.md`

---

### Wave 1: Foundation (13 modules — LOW/MEDIUM)
**Depends on:** Architecture P0-P2 + Build Phase 0

| # | Module | Status |
|---|--------|--------|
| 1 | MOD-102 Room Sizer | [ ] Verify BUILT |
| 2 | MOD-103 FLAR & Setback | [ ] Verify BUILT |
| 3 | MOD-105 Height Visualizer | [ ] Verify BUILT |
| 4 | MOD-106 Doorway + Fenestration | [ ] Build (PARTIAL) |
| 5 | MOD-207 Accessible Parking | [ ] Build |
| 6 | MOD-208 Elevator Cab | [ ] Build |
| 7 | MOD-405 Parks Ratio | [ ] Build |
| 8 | MOD-504 Solar Painter | [ ] Build |
| 9 | MOD-502 Erosion Fence | [ ] Build |
| 10 | Light & Vent Well | [ ] Verify BUILT |
| 11 | Fire Extinguisher | [ ] Verify BUILT |
| 12 | FAR Massing | [ ] Verify BUILT |
| 13 | ISA vs USA | [ ] Verify BUILT |

---

### Wave 2: Parametric Powerhouses (9 modules — HIGH)
**Depends on:** P3 + Wave 1

| # | Module | Status |
|---|--------|--------|
| 1 | MOD-101 Staircase | [ ] Build |
| 2 | MOD-202 Ramp + Zocalo | [ ] Build |
| 3 | MOD-104 Firewall | [ ] Build |
| 4 | MOD-305 Fire Escape | [ ] Build |
| 5 | MOD-205 Accessible Toilet | [ ] Build |
| 6 | MOD-403 Rowhouse Cluster | [ ] Build |
| 7 | MOD-109 Parking Layout | [ ] Build |
| 8 | Exit Width Calculator | [ ] Build |
| 9 | Number of Exits | [ ] Build |

---

### Wave 3: Floor Plan & Measurement (11 modules)
**Depends on:** Wave 2

| # | Module | Status |
|---|--------|--------|
| 1 | MOD-302 Travel Distance | [ ] Build |
| 2 | MOD-304 Sprinkler Coverage | [ ] Build |
| 3 | MOD-201 Wheelchair Turning | [ ] Build |
| 4 | MOD-209 Corridor Width | [ ] Build |
| 5 | MOD-204 Reach Sphere | [ ] Build |
| 6 | MOD-203 Tactile Paving | [ ] Build |
| 7 | MOD-303 Fire Barrier | [ ] Build |
| 8 | MOD-306 Smoke Enclosure | [ ] Build |
| 9 | MOD-401 Saleable Ratio | [ ] Build |
| 10 | MOD-406 Lot Frontage | [ ] Build |
| 11 | Housing Lot Minimums | [ ] Build |

---

### Wave 4: Advanced (8 modules — NEW templates)
**Depends on:** Wave 3

| # | Module | Template | Status |
|---|--------|----------|--------|
| 1 | MOD-301 Egress Sim | `simulation` | [ ] Build template + module |
| 2 | MOD-503 Ventilation | `simulation` | [ ] Build |
| 3 | MOD-402 Lot Sizer | `site-planner` | [ ] Build template + module |
| 4 | MOD-404 Road Hierarchy | `site-planner` | [ ] Build |
| 5 | MOD-406 Batch Verifier | `floorplan` | [ ] Build |
| 6 | MOD-501 USA Botanist | `parametric` | [ ] Build |
| 7 | Shading Device | `parametric` | [ ] Build |
| 8 | Daylighting Room Depth | `cutaway` | [ ] Build |

---

## Parallel Track: Regulatory Verification
**See:** `03_regulatory_ledger.md` for details. Non-blocking but mandatory before any module ships.

- [ ] Add `LegalCitation` type to `types/templates.ts`
- [ ] Create `config/constants/pd-1096.ts`
- [ ] Create `config/constants/ra-9514.ts`
- [ ] Create `config/constants/bp-344.ts`
- [ ] Create `config/constants/nscp.ts`
- [ ] Create `config/constants/index.ts`
- [ ] Create `scripts/audit-legal-citations.ts`
- [ ] Migrate Cat 01 (24 modules) to shared constants
- [ ] Migrate Cat 03 (19 modules) to shared constants
- [ ] Run `bun run audit:citations` — report baseline
