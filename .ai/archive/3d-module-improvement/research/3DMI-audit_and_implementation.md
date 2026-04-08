# 3D Lab — Codebase Audit & Architectural Implementation Plan (v3)

**Created:** 2026-04-08
**Revised:** 2026-04-08 (v4 Final — consolidated ToDo list, 2D DOM-only rule, reviewed & optimized)
**Status:** ACTIVE
**Goal:** Prepare the 3D Lab foundation for massive module expansion (193 configs → 300+) while guaranteeing zero regression on existing modules and zero-hallucination compliance for parametric building code logic.

### ABSOLUTE ARCHITECTURAL RULE: 2D DOM-Only Text Rendering

**NO text, labels, tooltips, annotations, or pop-ups may EVER be rendered inside the 3D Canvas.**

All textual information — compliance data, part labels, dimension callouts, violation warnings, material names, code citations — MUST be rendered in the standard 2D React DOM layer overlaying the Canvas. This means:
- **BANNED:** drei `<Html>`, drei `<Text>`, any React component mounted inside `<Canvas>` that renders readable text
- **REQUIRED:** 2D DOM overlays positioned via 3D-to-screen coordinate projection (`useThree` → `Vector3.project(camera)` → CSS `transform` / `left`+`top`)
- **Existing violations to migrate:** `HotspotAnnotation.tsx` (uses `<Html>`), `HumanSilhouette.tsx` (uses `<Html>` for "1.7m" label), all inline `<Html>` in `ExplodedAssemblyScene`, `CutawaySectionScene`, `FloorPlanScene`, `AnimatedSequenceScene`
- **Rationale:** In-canvas `<Html>` creates a separate React renderer per element, degrades performance at scale (50+ elements kills FPS), breaks accessibility/SEO, and produces text that doesn't match browser-native rendering
- **Pattern:** Scene components expose 3D world positions via Zustand store. A sibling DOM component reads those positions, projects to screen coordinates each frame, and renders standard React/Tailwind UI at those coordinates.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Existing Module Inventory](#2-existing-module-inventory)
3. [Reusable Component Inventory (Strengths)](#3-reusable-component-inventory)
4. [Architecture Audit Findings](#4-architecture-audit-findings)
5. [Template Structural Comparison](#5-template-structural-comparison)
6. [Implementation Plan](#6-implementation-plan)
7. [Regulatory & Legal Verification Protocol](#7-regulatory--legal-verification-protocol)
8. [Module Catalogue Rollout: 500-Series Roadmap](#8-module-catalogue-rollout)
9. [Backwards Compatibility Contract](#9-backwards-compatibility-contract)
10. [Template Expansion Readiness](#10-template-expansion-readiness)
11. [Acceptance Criteria](#11-acceptance-criteria)
12. [Risk Register](#12-risk-register)

---

## 1. Executive Summary

The SlateCamp 3D Lab currently has **7 template types**, **4 standalone scenes**, **4 calculator tools**, a **DevControls module**, a **legacy GLTF Workspace**, and **193 registered module configs** across **16 ALE-aligned categories** — all using React Three Fiber 9.5 with `frameloop="demand"`.

The architecture has solid foundations:
- Discriminated union type system (`ModuleConfig`) with 7 template types
- Demand-mode invalidation bridge (zero GPU cost when idle)
- Segmented registry with dynamic imports per category
- `createModuleStore()` factory for per-module Zustand stores
- Existing reusable components: `HotspotAnnotation`, `HumanSilhouette`, `GenericControlPanel`, `LabPanelLayout`

But it contains **25 audit findings** (3 CRITICAL, 7 HIGH, 15 MODERATE) that will compound as we scale toward 300+ modules. The plan addresses all findings across **9 implementation phases + 4 module rollout waves**, each gated by verification. A parallel **Regulatory & Legal Verification Protocol** ensures zero-hallucination compliance for all parametric building code logic.

**Strategic context:** The definitive module catalogue (`google-research.md`) documents **31 specific modules** across Series 100-500:
- **Series 100** (PD 1096): 9 modules — Staircase, Room Sizer, Setback, Firewall, Height, Fenestration, Clearance, Plumbing, Parking
- **Series 200** (BP 344): 9 modules — Wheelchair, Ramp, Tactile, Reach, Washroom, Crossing, Parking, Elevator, Corridor
- **Series 300** (RA 9514): 7 modules — Egress, Travel Distance, Fire Barrier, Sprinkler, Fire Escape, Smoke, Panic Hardware
- **Series 400** (BP 220/PD 957): 6 modules — Density, Lot Sizer, Rowhouse, Road, Parks, Setback
- **Series 500** (GBC): 4 modules — USA Botanist, Erosion, Ventilation, Solar Reflectance

These require the existing 7 templates plus **3 new template types** (`simulation`, `site-planner`, `measurement`). The plan sequences their development across 4 waves after the architecture foundation is complete.

---

## 2. Existing Module Inventory

### 2.1 Template Types (discriminated union in `src/features/3d-lab/types/templates.ts`)

| Template | Entry Component | Scene Component | Store Pattern | Module Count |
|----------|----------------|-----------------|---------------|-------------|
| `parametric` | `ParametricScene.tsx` | `ParametricSceneRenderer.tsx` | `createModuleStore()` factory | ~120 configs |
| `exploded` | `ExplodedAssembly.tsx` | `ExplodedAssemblyScene.tsx` | `createModuleStore()` factory | ~25 configs |
| `floorplan` | `FloorPlanWalkthrough.tsx` | `FloorPlanScene.tsx` | `createModuleStore()` factory | ~15 configs |
| `cutaway` | `CutawaySection.tsx` | `CutawaySectionScene.tsx` | `createModuleStore()` factory | ~10 configs |
| `animated` | `AnimatedSequence.tsx` | `AnimatedSequenceScene.tsx` | `createModuleStore()` factory | ~10 configs |
| `calculator` | `CalculatorTemplate.tsx` | Per-tool scenes | Per-tool stores in `app/calculators/_stores/` | 4 tools |
| `wall-configurator` | `WallConfiguratorTemplate.tsx` | `WallConfiguratorRenderer.tsx` | `useWallLabStore` | 1 |

### 2.2 Standalone Scenes (custom layout, not using template system)

| Scene | Location | Canvas Pattern | Store |
|-------|----------|---------------|-------|
| NBCP Envelope | `scenes/NBCPEnvelope/` | CanvasWrapper + tunnel | `nbcpStore.ts` |
| FAR Playground | `scenes/FARPlayground/` | CanvasWrapper + tunnel | `legacyLabStore.ts` |
| Classical Orders | `scenes/ClassicalOrders/` | CanvasWrapper + tunnel | `useLabStore.ts` |
| DevControls | `DevControlsModule/` | **Own Canvas** (independent) | `useDevControlsStore.ts` |

### 2.3 Legacy Systems

| System | Location | Status | Notes |
|--------|----------|--------|-------|
| GLTF Workspace | `src/components/3d/Workspace.tsx` | Legacy — has patterns modern lab lacks | `SceneErrorBoundary` + `disposeObject()` usage, Framer Motion, ContactShadows |
| Admin Model Registry | `src/app/admin/3d-models/` | Active | ModelRegistryPage, ModelRegistryTree, ModelConfigDetail |

### 2.4 Infrastructure Files

| File | Purpose | Status |
|------|---------|--------|
| `components/CanvasWrapper.tsx` | Tunnel portal + loading overlay | **BROKEN** — ignores 15/16 props |
| `components/GlobalCanvasPortal.tsx` | tunnel-rat `SceneTunnel` instance | OK |
| `components/shell/LabViewportFrame.tsx` | R3F Canvas host | OK — but hardcoded config, no error boundary |
| `components/shell/LabModuleShell.tsx` | Module container (topbar + viewport) | OK |
| `components/shell/LabOverlayLayer.tsx` | DOM overlay z-layer | OK |
| `components/shell/LabBrowserShell.tsx` | Browser layout wrapper | OK |
| `components/shell/LabEmptyState.tsx` | Empty state fallback | OK |
| `components/shell/LabMetaPanel.tsx` | Metadata display panel | OK |
| `components/rendering/SceneBase.tsx` | Sky, ground, fog, tone mapping | OK — but hardcoded colors |
| `components/rendering/StudioLighting.tsx` | Fixed 3-light rig | OK — but not configurable |
| `components/ModuleViewer.tsx` | Config loader + onboarding + shell | OK — but no load cancellation |
| `components/LabViewport.tsx` | Template router/dispatcher | OK |
| `components/LabTopBar.tsx` | Header with back, title, progress | OK |
| `stores/createModuleStore.ts` | Per-module store factory | OK |
| `stores/useLabStore.ts` | Global lab state (monolithic) | NEEDS SPLITTING |
| `stores/legacyLabStore.ts` | Legacy store variant | OK — in use by FAR Playground |
| `config/taxonomy.ts` | 16-category ALE taxonomy | OK |
| `config/dashboard-visibility.ts` | Dashboard allowlist | OK |
| `utils/registryLoader.ts` | Dynamic import by category | OK |
| `types/templates.ts` | Full type system (7 config types + union) | OK — well-structured |
| `src/components/r3f/` | Shared R3F primitives (4 exports) | OK — small but clean |
| `src/lib/three-utils.ts` | `disposeObject()` utility | OK — **never called in modern lab** |

---

## 3. Reusable Component Inventory (Strengths)

These components are already well-architected and should be **preserved and extended**, not rewritten.

### 3.1 Components to Preserve

| Component | File | Quality | Notes |
|-----------|------|---------|-------|
| `HotspotAnnotation` | `components/templates/HotspotAnnotation.tsx` | Good (needs migration) | Memo-wrapped, expandable dot→card, quiz mode variant, wiki link. **VIOLATES 2D DOM-ONLY RULE** — uses drei `<Html>` inside Canvas. Must be migrated to DOM overlay in Phase 3. The interaction design (dot→card expand, quiz mode, wiki link) is excellent and should be preserved in the DOM version. |
| `HumanSilhouette` | `components/templates/HumanSilhouette.tsx` | Good | 1.7m capsule+sphere with scale label. Config-driven via `showHumanScale` flag in ParametricSceneConfig. |
| `GenericControlPanel` | `components/templates/GenericControlPanel.tsx` | **Excellent** | Auto-generates slider/toggle/dropdown UI from `ParameterDef[]` config. Groups, presets, violations — all handled. This is the primary UI generation engine. |
| `ComplianceReportPanel` | `components/templates/ComplianceReportPanel.tsx` | Good | Multi-law compliance visualization. Auto-detects law prefixes from violation IDs. |
| `LabPanelLayout` | `components/templates/LabPanelLayout.tsx` | **Excellent** | CSS Grid with collapsible left/right panels + resize handles. Mobile-responsive (collapses to column). Foundation for all template layouts. |
| `GeometryMesh` / `GeometryElement` | `components/templates/GeometryMesh.tsx` | Good | Declarative geometry renderer from `GeometryInstruction`. Supports box, cylinder, plane, line, ring, sphere, cone. |
| `ViolationIndicator` | `components/templates/ViolationIndicator.tsx` | Needs migration | 3D-anchored violation markers. **Migrates to `ViolationBadge.tsx` DOM overlay in Phase 3.** Preserve the visual design (warning icon + message + citation) in the DOM version. |
| `OnboardingFlow` | `components/templates/OnboardingFlow.tsx` | Good | First-time user walkthrough (purpose, hotspot tutorial, controls). |
| `ModuleContextCard` | `components/templates/ModuleContextCard.tsx` | Good | Pre-onboarding metadata card (learning objective, code ref, time estimate). |
| `CanvasLoadingOverlay` | `src/components/r3f/CanvasLoadingOverlay.tsx` | Good | Customizable message + background. Needs progress tracking upgrade. |
| `useRegisterInvalidate` | `src/components/r3f/useRegisterInvalidate.ts` | **Excellent** | Generic invalidation bridge. Well-documented, clean lifecycle. |
| `SceneInvalidator` | `src/components/r3f/SceneInvalidator.tsx` | Good | Version-counter pattern for calculators. |

**Undocumented drei usage (discovered during codebase verification):**
- `<Environment preset="city" />` — used in `scenes/NBCPEnvelope/NBCPEnvelope.tsx:33`. Provides image-based lighting (IBL). No other module uses this. Decision needed: should Environment be part of SceneConfig presets (Phase 1/4), or stay module-specific?
- `ContactShadows` — explicitly avoided. `SceneBase.tsx:88` uses a custom shadow disc instead ("avoids worker" overhead). This is correct and should remain the standard.
- `useGLTF` / `useLoader` / `useProgress` — NOT used anywhere in `features/3d-lab/`. All geometry is procedural via `GeometryInstruction[]`. GLTF support deferred to Phase 6.

### 3.2 Architectural Patterns to Preserve

| Pattern | Where | Why It Works |
|---------|-------|-------------|
| `frameloop="demand"` + invalidation bridge | All modules | Zero GPU cost when idle; renders only on state change |
| `createModuleStore(defaults)` factory | 5 template types | Per-module isolation with reset capability |
| `SceneTunnel` (tunnel-rat) | CanvasWrapper → LabViewportFrame | Single Canvas, multiple scene sources |
| Segmented registry with `import()` | `registryLoader.ts` | Keeps 193+ configs out of main bundle |
| `next/dynamic` with `ssr: false` | LabViewport dispatcher | All R3F code is client-only, code-split per template |
| `GeometryInstruction[]` declarative geometry | ParametricSceneRenderer | No GLTF bundling — runtime procedural geometry from config arrays |
| Config-driven modules | `config/modules/` | New modules = config file + registry entry (no new components needed for existing templates) |

---

## 4. Architecture Audit Findings

### CRITICAL (3) — Must fix before scaling

#### F-01: CanvasWrapper Props Are Dead Code
- **File:** `src/features/3d-lab/components/CanvasWrapper.tsx:32-34`
- **Issue:** Interface `CanvasWrapperProps` declares 15 props (cameraPosition, cameraFov, orthographic, flat, disableLighting, disableSceneBase, disableShadows, clearColor, glConfig, minPolarAngle, maxPolarAngle, minDistance, maxDistance, showGround) but the component destructures only `{ children }`.
- **Impact:** Camera position, FOV, orthographic mode, lighting overrides — all dead. Templates "work" because LabViewportFrame has hardcoded defaults and tunnel-rat passes children through.
- **Consumers affected:** 10 files — ParametricScene, ExplodedAssembly, CutawaySection, AnimatedSequence, FloorPlanWalkthrough, WallConfiguratorTemplate, CalculatorTemplate, NBCPEnvelope, FARPlayground, ClassicalOrders.
- **Severity:** CRITICAL — NO template can configure its own camera/lighting/canvas behavior.

#### F-02: Zero WebGL Memory Cleanup in Modern Lab
- **File:** `src/lib/three-utils.ts` (exists but unused by modern templates)
- **Issue:** `disposeObject()` is called in legacy `Workspace.tsx` (line 120) but never imported in any file under `src/features/3d-lab/`. No useEffect cleanup disposes geometries/materials/textures when modules unmount.
- **Reference:** Legacy `Workspace.tsx:119-121` shows the correct pattern: `useEffect(() => { return () => disposeObject(scene) }, [scene])`
- **Impact:** VRAM leaks accumulate as users navigate between modules. With 193+ modules, catastrophic on mobile.
- **Evidence:** `grep -r "disposeObject" src/features/3d-lab/` returns 0 results.
- **Severity:** CRITICAL.

#### F-03: No WebGL Error Boundary in Modern Lab
- **Issue:** Legacy `Workspace.tsx:59-69` has a `SceneErrorBoundary` class component that catches 3D render errors. But NO error boundary exists in `src/features/3d-lab/` or `src/components/r3f/`.
- **Impact:** WebGL context loss (mobile backgrounding, GPU crash, VRAM exhaustion) crashes the entire page. Users see a white screen.
- **Reference:** `Workspace.tsx`'s SceneErrorBoundary renders a `<SimpleBox>` fallback — a minimal but functional pattern.
- **Severity:** CRITICAL — real-world mobile occurrence.

### HIGH (7) — Should fix before scaling

#### F-04: All Annotations Rendered Inside 3D Canvas (Violates 2D DOM-Only Rule)
- **Files:** `ExplodedAssemblyScene.tsx:96-119`, `CutawaySectionScene.tsx:156-183`, `FloorPlanScene.tsx:338-388`, `AnimatedSequenceScene.tsx:82-93`, `HotspotAnnotation.tsx` (uses drei `<Html>`), `HumanSilhouette.tsx:24-29` (uses drei `<Html>`)
- **Issue:** Every template renders text INSIDE the 3D Canvas via drei `<Html>`. This creates a separate React renderer per element, kills FPS at 50+ elements, and breaks accessibility. `HotspotAnnotation.tsx` also uses `<Html>` for its expandable card.
- **Impact:** Performance cliff at scale. Inaccessible to screen readers. Inconsistent text rendering. Every new template must reinvent.
- **Required fix:** Migrate ALL text/labels/tooltips to 2D DOM overlays. Scene components expose world-space positions via Zustand store. A sibling DOM component projects those positions to screen coordinates (`Vector3.project(camera)`) and renders standard React/Tailwind UI.

#### F-05: Ground Plane Duplication
- **Files:** `SceneBase.tsx:77-96` (canonical), `AnimatedSequenceScene.tsx:138-141`, `ExplodedAssemblyScene.tsx:222-225`, `FloorPlanScene.tsx:283-290`
- **Issue:** SceneBase provides the canonical ground plane, but 3 scene types create their own with different sizes (`[12,12]`, `[5,5]`, `[planW,planD]`), colors (`#f1f5f9`, `#e4e4e7`), and positions.
- **Impact:** Visual inconsistency; design changes require N updates.

#### F-06: Canvas Configuration Divergence
- **Issue:** Three separate Canvas configurations:
  1. `LabViewportFrame` — hardcoded `dpr={[1,1.5]}`, `fov=35`, `shadows=true`, no PerformanceMonitor
  2. `DevControlsCanvas` — `PerformanceMonitor`, dynamic DPR, `toneMapping`, `onPointerMissed`
  3. `CalculatorTemplate` — passes orthographic/flat/clearColor/glConfig to CanvasWrapper (silently ignored)
- **Impact:** No unified per-module canvas configuration. DevControls has the best implementation but shares nothing.

#### F-07: Hardcoded Colors in Templates
- **Files:** Multiple templates use raw hex instead of design tokens:
  - `#f1f5f9` (ground) — in SceneBase, AnimatedSequence, ExplodedAssembly
  - `#F2F0EB` (sky) — in SceneBase, LabViewportFrame, CalculatorTemplate (3 files)
  - `#D64545` (violation red) — in CutawaySectionScene, FloorPlanScene
  - `#3b82f6` (hover blue) — in ExplodedAssemblyScene
  - `#e4e4e7` (floor plan base) — in FloorPlanScene
  - `#6b7280` (human silhouette) — in HumanSilhouette
  - `#3D5A9C` (legacy hotspot) — in Workspace.tsx
- **Impact:** Design system drift; dark mode support impossible; inconsistent with `.ai/rules/design.md`.

#### F-08: StudioLighting Not Configurable Per Module
- **File:** `src/features/3d-lab/components/rendering/StudioLighting.tsx`
- **Issue:** Fixed warm key (`#FFF5E6`, 1.2), cool fill (`#E6EFFF`, 0.4), ambient 0.35. No props for override.
- **Workaround exists:** CalculatorTemplate uses its own `CalculatorLighting.tsx` (separate component entirely). NBCPEnvelope has inline `<ambientLight>` + `<directionalLight>`.
- **Impact:** Modules needing different aesthetics (dramatic for history, clinical for code compliance, flat for calculators) must bypass shared lighting entirely, leading to divergence.

#### F-09: Invalidation Over-Triggering
- **Evidence:** 50+ `invalidateFn?.()` call sites across stores. DevControls `InvalidateBridge` subscribes to ALL store mutations. `createModuleStore` triggers invalidate on `setParam`, `setParams`, `setActiveAnnotation`, AND `reset`.
- **Issue:** UI-only state changes (panel open, annotation select) trigger full scene re-render. `setActiveAnnotation` calls invalidate even though only DOM overlays need to update (no 3D geometry changes).
- **Impact:** Wasted GPU cycles. Compounds with module complexity.

#### F-10: Module Config Loading Has No Cancellation
- **File:** `src/features/3d-lab/components/ModuleViewer.tsx`
- **Issue:** Uses `import()` in useEffect to load module configs. Fast navigation between modules causes overlapping dynamic imports with no AbortController or stale-closure guard.
- **Impact:** Race condition — slower module config could resolve after faster one, showing wrong module.

### MODERATE (10) — Address during scaling

#### F-11: Store Architecture Fragmentation
- 4 different store patterns: `createModuleStore()` factory, monolithic `useLabStore` (191 lines, 23 actions), `useDevControlsStore`, 4 calculator stores.
- `useLabStore` mixes hotspot state, quiz state, parametric state, and view state.

#### F-12: No Asset Preloading Infrastructure
- Current modules use only procedural geometry. No GLTF preloader, no texture cache, no asset manifest.
- Heritage buildings (Series 400-500 in google-research.md) will need GLTF models.

#### F-13: No Performance Monitoring (Shared)
- DevControlsCanvas has `<PerformanceMonitor>` with adaptive DPR. LabViewportFrame has none.

#### F-14: useFrame Animations Without Completion Detection
- `AnimatedSequenceScene.tsx:31`, `CutawaySectionScene.tsx:61`, `ExplodedAssemblyScene.tsx:34`, `NBCPScene.tsx:148`, `FARScene.tsx:154`
- Lerp animations call `invalidate()` in useFrame but never detect convergence. Frame loop runs indefinitely once animation starts.
- **5 scenes affected** (not 3 as initially counted).

#### F-15: Duplicate Re-export Files
- `components/templates/CanvasWrapper.tsx` and `components/templates/GlobalCanvasPortal.tsx` — single-line re-exports.

#### F-16: No Dark Mode Support for 3D Scenes
- Sky, ground, fog, overlay backgrounds all hardcoded for light mode.

#### F-17: No Mobile Touch Optimization
- No `touch-action` CSS on canvas containers.
- No pinch-zoom tuning on OrbitControls (default drei behavior).
- No mobile-specific DPR reduction (hardcoded `[1, 1.5]` for all devices).
- No responsive overlay sizing for small viewports.

#### F-18: Legacy Workspace.tsx Divergence
- `src/components/3d/Workspace.tsx` uses Framer Motion, ContactShadows, `useGLTF` with DRACO decoders — patterns abandoned in modern lab.
- Has the RIGHT safety patterns (error boundary, dispose) but the WRONG rendering patterns (ContactShadows worker overhead, motion library dependency).
- Should be migrated to template system or explicitly deprecated.

#### F-19: No Centralized Camera Preset System
- Each module hardcodes camera position/FOV in its entry component.
- DevControls has `CAMERA_PRESETS` constant with perspective/isometric/plan presets — good pattern but not shared.
- Calculators have `getCalcCameraPresets()` with `FloatingCameraBar` — another good pattern, also not shared.

#### F-20: No DOM Overlay Positioning System for Annotations
- All current annotations use drei `<Html>` inside Canvas — **must be eliminated per 2D DOM-Only rule**.
- After migration to DOM overlays, a new challenge: positioning multiple DOM elements from 3D coordinates requires a projection system with collision avoidance.
- At scale (Series 300 fire safety modules with 20+ data points), overlapping DOM labels will be unreadable without a spatial priority/culling system.
- **Required:** `useWorldToScreen` hook (projects 3D coords → CSS pixels) + `OverlayManager` component that z-orders/culls overlapping labels.

#### F-21: Store Reset Bug in ExplodedAssembly and AnimatedSequence
- **Files:** `templates/ExplodedAssembly.tsx`, `templates/AnimatedSequence.tsx`
- **Issue:** Both use `useMemo(() => createModuleStore(defaults), [])` with **empty deps**. Store never reinitializes when config changes. If the same template is reused with a different module config (e.g., navigating from one exploded assembly to another), stale parameter state persists.
- **Contrast:** ParametricScene, CutawaySection, FloorPlanWalkthrough correctly use `[config.id]` as dependency.
- **Impact:** Wrong initial values, stuck animations, stale explode positions after module switch.

#### F-22: No Template-Level Error Handling
- **Issue:** 0/7 templates have error boundaries or error fallback UI. All assume config is valid and scene renders without issue.
- **Only exception:** CalculatorTemplate has `<CanvasEmptyState>` for missing dimensions — but this is input validation, not error recovery.
- **Contrast:** Legacy `Workspace.tsx` has `SceneErrorBoundary` that renders `<SimpleBox>` on failure.
- **Impact:** A bad module config (e.g., geometry function throws) crashes the entire Canvas with no user feedback.

#### F-23: LabPanelLayout Underused — Only 2/7 Templates
- **Issue:** `LabPanelLayout` (CSS Grid with collapsible panels, resize handles, mobile-responsive) is only used by ParametricScene and WallConfiguratorTemplate. The other 5 templates use ad-hoc absolute positioning for their overlays.
- **Templates with absolute overlays:** ExplodedAssembly (slider + info panel), CutawaySection (annotation panel + cut slider), AnimatedSequence (timeline + step info), FloorPlanWalkthrough (control panel + legend + violation bar), CalculatorTemplate (custom 3-col grid).
- **Impact:** Inconsistent layout behavior, duplicated responsive logic, harder to maintain.

#### F-24: ESLint Disable on useMemo Store Creation
- **Files:** ParametricScene.tsx:27, CutawaySection.tsx (similar), FloorPlanWalkthrough.tsx (similar)
- **Issue:** `// eslint-disable-next-line react-hooks/exhaustive-deps` on `useMemo(() => createModuleStore(defaults), [config.id])`. The `defaults` object is rebuilt every render from `config.parameters`, creating a new reference. The ESLint rule correctly warns that `defaults` isn't in deps, but adding it would break memoization.
- **Root cause:** `createModuleStore` is called inside a useMemo that depends on `config.id` but the `defaults` computation should be stabilized separately.
- **Impact:** Technical debt; potential subtle bugs if config.parameters change without config.id changing.

#### F-25: No Loading/Empty States in 6/7 Templates
- **Issue:** Only CalculatorTemplate implements loading/empty state handling (`CanvasEmptyState` when `!hasDimensions`). The other 6 templates render immediately with no fallback for:
  - Config still loading (handled by ModuleViewer, but race conditions possible)
  - Scene renderer throwing during geometry generation
  - Invalid parameter combinations producing no visible geometry
- **Impact:** Users see a blank canvas with no guidance when something goes wrong.

---

## 5. Template Structural Comparison

Deep audit of all 7 template entry components reveals structural divergence that must be normalized before scaling.

### 5.1 CanvasWrapper Dead Props by Template

| Template | Dead Props Passed | Unique Props |
|----------|------------------|-------------|
| ParametricScene | `cameraPosition`, `cameraFov`, `minDistance`, `maxDistance`, `showGround` | — |
| ExplodedAssembly | `cameraPosition`, `cameraFov`, `showGround`, `minDistance`, `maxDistance` | — |
| CutawaySection | `cameraPosition`, `cameraFov`, `minDistance`, `maxDistance` | No `showGround` |
| AnimatedSequence | `cameraPosition`, `cameraFov`, `showGround`, `minDistance`, `maxDistance` | — |
| FloorPlanWalkthrough | `cameraPosition`, `cameraFov`, `showGround`, `minDistance`, `maxDistance` | — |
| WallConfiguratorTemplate | `cameraPosition`, `cameraFov`, `minDistance`, `maxDistance`, `showGround` | — |
| CalculatorTemplate | `orthographic`, `flat`, `disableLighting`, `disableSceneBase`, `disableShadows`, `cameraPosition`, `cameraFov`, `cameraZoom`, `clearColor`, `glConfig`, `minPolarAngle`, `maxPolarAngle` | **12 unique props** — all ignored |

### 5.2 Store Creation Patterns

| Template | Store | Deps | Reset on Nav? | Bug? |
|----------|-------|------|---------------|------|
| ParametricScene | `createModuleStore(defaults)` | `[config.id]` | Yes | ESLint disable |
| ExplodedAssembly | `createModuleStore({ explode: 0 })` | `[]` | **NO** | **YES — stale state** |
| CutawaySection | `createModuleStore(defaults)` | `[config.id]` | Yes | ESLint disable |
| AnimatedSequence | `createModuleStore({ currentStep: 0, isPlaying: false })` | `[]` | **NO** | **YES — stale state** |
| FloorPlanWalkthrough | `createModuleStore(defaults)` | `[config.id]` | Yes | ESLint disable |
| WallConfiguratorTemplate | `useWallLabStore` (external) | N/A | Unknown | Different pattern |
| CalculatorTemplate | Tool-specific stores (4) | N/A | Implicit | Different pattern |

### 5.3 Layout Architecture

| Template | Layout System | Left Panel | Right Panel | Overlays |
|----------|--------------|------------|-------------|----------|
| ParametricScene | **LabPanelLayout** | GenericControlPanel (240px) | ComplianceReportPanel (280px, conditional) | None |
| ExplodedAssembly | Absolute positioning | — | Info panel (framer-motion, z-10) | Explode slider (bottom, z-10) |
| CutawaySection | Absolute positioning | — | AnnotationPanel (scrollable, z-10) | CutSliderBar (bottom, z-10) |
| AnimatedSequence | Absolute positioning | — | Step info (z-10) | Timeline bar (bottom, z-10) |
| FloorPlanWalkthrough | Absolute positioning | GenericControlPanel | LegendOverlay (top-right, z-10) | ViolationBar (bottom, conditional) |
| WallConfiguratorTemplate | **LabPanelLayout** | ConfigPanel (320px) | BOMPanel (340px) | None |
| CalculatorTemplate | Custom 3-col grid | InputPanel (320px) | ResultPanel (340px) | FloatingCameraBar |

### 5.4 Error & Loading Handling

| Template | Error Boundary | Empty State | Loading State |
|----------|---------------|-------------|--------------|
| ParametricScene | None | None | None |
| ExplodedAssembly | None | None | None |
| CutawaySection | None | None | None |
| AnimatedSequence | None | None | None |
| FloorPlanWalkthrough | None | None | None |
| WallConfiguratorTemplate | None | None | None |
| CalculatorTemplate | None | **CanvasEmptyState** | **Suspense fallback** |

### 5.5 Compliance/Violation Handling

| Template | Has Violations | Implementation |
|----------|---------------|----------------|
| ParametricScene | **Yes** | Auto-detects multi-law modules; ComplianceReportPanel |
| ExplodedAssembly | No | — |
| CutawaySection | No | — |
| AnimatedSequence | No | — |
| FloorPlanWalkthrough | **Yes** | ViolationBar with computed check functions |
| WallConfiguratorTemplate | No | — |
| CalculatorTemplate | No | — |

---

## 6. Implementation Plan

### Phase 0: Pre-Flight Verification (No Code Changes)
**Goal:** Establish regression baseline.

- [ ] **0.1** Run `bun run type-check` — capture baseline
- [ ] **0.2** Run `bun run build` — confirm all 3D routes compile
- [ ] **0.3** Document current behavior of each existing module (see regression-checklist.md)
- [ ] **0.4** Record `gl.info.memory` baseline for 3 module switches in Chrome DevTools

### Phase 1: Fix CanvasWrapper + Restore Configuration Power [F-01, F-06, F-13, F-15]
**Goal:** Make CanvasWrapper consume its props. Add PerformanceMonitor. Delete dead re-exports.

**Strategy:** Split the concern — CanvasWrapper remains the tunnel portal, a new `<SceneConfig>` component mounts INSIDE the Canvas (via tunnel) and applies per-module camera, lighting, and ground settings. This preserves the single-Canvas architecture.

- [ ] **1.1** `src/features/3d-lab/components/CanvasWrapper.tsx` — Strip dead props. Accept `children` + optional `sceneConfig: SceneConfigProps`. Tunnel `<SceneConfig>` alongside children inside `SceneTunnel.In`.

- [ ] **1.2** Create `src/features/3d-lab/components/rendering/SceneConfig.tsx`:
  ```ts
  interface SceneConfigProps {
    cameraPosition?: Vector3Tuple
    cameraFov?: number
    orthographic?: boolean
    cameraZoom?: number
    minPolarAngle?: number
    maxPolarAngle?: number
    minDistance?: number
    maxDistance?: number
    disableLighting?: boolean
    disableSceneBase?: boolean
    disableShadows?: boolean
    clearColor?: string
    flat?: boolean
  }
  ```
  Mounts inside Canvas. Applies PerspectiveCamera/OrthographicCamera, OrbitControls, conditionally renders StudioLighting and SceneBase.

- [ ] **1.3** `src/features/3d-lab/components/shell/LabViewportFrame.tsx`:
  - Remove hardcoded camera, OrbitControls, StudioLighting, SceneBase (moved to SceneConfig)
  - Add `<PerformanceMonitor>` matching DevControlsCanvas pattern
  - Keep Canvas shell: `frameloop="demand"`, `dpr`, `gl`, `shadows`, `style`

- [ ] **1.4** Update all 10 template consumers: replace dead props with `sceneConfig={{ cameraPosition, cameraFov, ... }}`

- [ ] **1.5** Delete re-export files [F-15]:
  - `src/features/3d-lab/components/templates/CanvasWrapper.tsx`
  - `src/features/3d-lab/components/templates/GlobalCanvasPortal.tsx`

**Verification gate:**
- `bun run type-check` passes
- Every template renders with correct camera position/FOV (compare against Phase 0)
- DevControlsModule unchanged
- PerformanceMonitor visible in React DevTools

### Phase 2: WebGL Lifecycle Safety [F-02, F-03]
**Goal:** Prevent VRAM leaks and handle context loss. Port patterns from legacy Workspace.tsx.

**Reference implementation:** `src/components/3d/Workspace.tsx:59-69` (SceneErrorBoundary) and `Workspace.tsx:119-121` (disposeObject cleanup).

- [ ] **2.1** Create `src/components/r3f/WebGLErrorBoundary.tsx`:
  - React class error boundary (like Workspace's SceneErrorBoundary but improved)
  - Catches R3F render errors AND `webglcontextlost` event on the canvas element
  - Recovery UI: "Scene failed to load. Tap to retry." + remount button
  - Uses design tokens for styling (not hardcoded)
  - Export from `src/components/r3f/index.ts`

- [ ] **2.2** Create `src/components/r3f/useDisposeOnUnmount.ts`:
  - Hook accepting a `React.RefObject<Group>` — calls `disposeObject()` on unmount
  - Only disposes imperative objects (not R3F declarative JSX which self-disposes)
  - Export from `src/components/r3f/index.ts`

- [ ] **2.3** Create `src/components/r3f/useWebGLMemoryMonitor.ts`:
  - Dev-only hook reading `gl.info.memory` (geometries, textures)
  - Warns in console if counts exceed thresholds (>500 geometries, >100 textures)
  - No-op in production builds

- [ ] **2.4** `LabViewportFrame.tsx` — Wrap `<Canvas>` in `<WebGLErrorBoundary>`

- [ ] **2.5** Add `useDisposeOnUnmount` to root group ref in each scene:
  - `ParametricSceneRenderer.tsx`, `ExplodedAssemblyScene.tsx`, `CutawaySectionScene.tsx`
  - `AnimatedSequenceScene.tsx`, `FloorPlanScene.tsx`, `WallConfiguratorRenderer.tsx`
  - `NBCPScene.tsx`, `FARScene.tsx`, `ClassicalOrdersScene.tsx`
  - Calculator scenes: `FlooringScene`, `PaintScene`, `DrywallScene`, `CHBScene`
  - **13 files total**

**Verification gate:**
- `bun run type-check` passes
- All modules render (regression checklist)
- `gl.info.memory.geometries` stays bounded across 10 module switches
- Simulated context loss shows error boundary with working retry

### Phase 3: 2D DOM Overlay System + Scene Cleanup [F-04, F-05, F-07, F-20]
**Goal:** Eliminate ALL in-canvas text. Build 2D DOM overlay infrastructure. Extract ground plane. Centralize colors.

**Strategy:** The 3D Canvas renders ONLY geometry, materials, and lighting. All text/labels/tooltips live in a sibling DOM layer. Scene components write world-space positions to a Zustand store. A DOM `<OverlayLayer>` component reads those positions, projects them to screen coordinates every frame using `requestAnimationFrame` + `camera.project()`, and renders standard React components at those coordinates.

**Architecture:**
```
┌─────────────────────────────────────────────┐
│ LabViewportFrame (relative container)       │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ <Canvas> (z-index: 0)              │    │
│  │   Only: meshes, lights, controls   │    │
│  │   NO: <Html>, <Text>, text of any  │    │
│  │       kind whatsoever              │    │
│  │                                     │    │
│  │   Scene writes to overlayStore:     │    │
│  │   { id, worldPos, type, data }     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ <DOMOverlayLayer> (z-index: 10)    │    │
│  │   pointer-events: none (passthru)   │    │
│  │                                     │    │
│  │   Reads overlayStore + camera ref   │    │
│  │   Projects worldPos → screenXY     │    │
│  │   Renders React components:         │    │
│  │     <LabelOverlay>                  │    │
│  │     <ViolationBadge>                │    │
│  │     <PartTooltip>                   │    │
│  │     <DimensionCallout>              │    │
│  │     <HotspotCard>                   │    │
│  │   pointer-events: auto on cards    │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ <ControlOverlay> (z-index: 20)     │    │
│  │   Panels, sliders, toolbars         │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

- [ ] **3.1** Create `src/features/3d-lab/constants/scene-colors.ts`:
  ```ts
  export const SCENE_COLORS = {
    SKY: '#F2F0EB',
    GROUND: '#f1f5f9',
    GROUND_SHADOW: '#000000',
    VIOLATION: '#D64545',
    HOVER_HIGHLIGHT: '#1B3FC4',
    FLOOR_PLAN_BASE: '#e4e4e7',
    HUMAN_FIGURE: '#6b7280',
    HOTSPOT_ACTIVE: '#2D9F6F',
  } as const
  ```

- [ ] **3.2** Create `src/features/3d-lab/stores/useOverlayStore.ts`:
  ```ts
  interface OverlayItem {
    id: string
    worldPosition: Vector3Tuple     // 3D coordinates from scene
    type: 'label' | 'violation' | 'detail' | 'material' | 'dimension' | 'hotspot'
    data: Record<string, unknown>   // Type-specific payload (title, description, codeCitation, etc.)
    visible?: boolean
  }
  interface OverlayState {
    items: Map<string, OverlayItem>
    cameraRef: THREE.Camera | null
    setItems: (items: OverlayItem[]) => void
    setCameraRef: (camera: THREE.Camera) => void
    clearItems: () => void
  }
  ```
  Scene components call `setItems()` when their annotation data changes.
  DOM overlay reads `items` + `cameraRef` to project and render.

- [ ] **3.3** Create `src/features/3d-lab/hooks/useWorldToScreen.ts`:
  - Hook that takes `Vector3Tuple` + `THREE.Camera` + container `HTMLElement`
  - Returns `{ x: number, y: number, isVisible: boolean }` in CSS pixels
  - Uses `Vector3.project(camera)` → NDC → pixel conversion
  - `isVisible` = false if behind camera (z > 1) or outside viewport
  - Runs inside `requestAnimationFrame` loop, not R3F `useFrame` (since it's in DOM layer)

- [ ] **3.4** Create `src/features/3d-lab/components/overlays/DOMOverlayLayer.tsx`:
  - Reads `useOverlayStore` items + camera ref
  - For each item, projects world position to screen using `useWorldToScreen`
  - Renders appropriate React component by `type`:
    - `label` → `<LabelOverlay>` (simple text badge, same styling as current inline labels)
    - `violation` → `<ViolationBadge>` (warning icon + message + code citation)
    - `detail` → `<PartTooltip>` (expandable card with description, dismiss button)
    - `material` → `<MaterialLabel>` (material name + citation)
    - `dimension` → `<DimensionCallout>` (measurement value + unit)
    - `hotspot` → `<HotspotCard>` (expandable dot → card, wiki link — migrated from HotspotAnnotation)
  - All use Tailwind + design tokens. Standard browser text rendering.
  - Frustum culling: items with `isVisible=false` not rendered at all.
  - Z-ordering: items closer to camera rendered on top via `z-index` from projected depth.

- [ ] **3.5** Create `src/features/3d-lab/components/overlays/CameraSync.tsx`:
  - Thin R3F component mounted inside Canvas
  - On every invalidate/frame, writes camera ref to `useOverlayStore.setCameraRef()`
  - This bridges the R3F world to the DOM overlay layer

- [ ] **3.6** Create `src/features/3d-lab/components/rendering/GroundPlane.tsx`:
  - Configurable: `size`, `color` (default from SCENE_COLORS.GROUND), `showShadowDisc`
  - Replaces inline ground meshes in AnimatedSequence, ExplodedAssembly, FloorPlan

- [ ] **3.7** Migrate all scene templates — REMOVE all drei `<Html>` and `<Text>`:
  - `ExplodedAssemblyScene.tsx` — remove inline Html tooltips; write part positions + labels to overlay store
  - `CutawaySectionScene.tsx` — remove layer Html annotations; write layer data to overlay store
  - `FloorPlanScene.tsx` — remove violation/annotation Html; write positions to overlay store
  - `AnimatedSequenceScene.tsx` — remove step label Html; write to overlay store
  - `HotspotAnnotation.tsx` — rewrite as pure DOM component reading from overlay store
  - `HumanSilhouette.tsx` — remove `<Html>` for "1.7m" label; add as overlay item
  - `ViolationIndicator.tsx` — migrate to ViolationBadge in DOM overlay

- [ ] **3.8** Refactor all scene types to use `<GroundPlane>` instead of inline mesh code

- [ ] **3.9** Replace ALL hardcoded hex values with `SCENE_COLORS` imports

**Verification gate:**
- `grep -rn '<Html\|<Text' src/features/3d-lab/templates/ src/features/3d-lab/components/` returns **ZERO results** (excluding comments)
- Visual parity: labels appear at same screen positions as before
- Labels render as browser-native text (inspectable in DOM, accessible to screen readers)
- `bun run type-check` passes
- `grep -rn '#[0-9a-fA-F]{6}' src/features/3d-lab/templates/ src/features/3d-lab/components/` returns only `scene-colors.ts`

### Phase 4: Configurable Lighting [F-08]
**Goal:** Allow per-module lighting configuration without bypassing shared infrastructure.

- [ ] **4.1** Add `LightingConfig` to `SceneConfigProps`:
  ```ts
  interface LightingConfig {
    preset?: 'studio' | 'clinical' | 'dramatic' | 'flat'
    ambientIntensity?: number
    keyIntensity?: number
    keyColor?: string
    fillIntensity?: number
    fillColor?: string
  }
  ```

- [ ] **4.2** Refactor `StudioLighting.tsx` to accept `LightingConfig` props with defaults matching current values (backward compatible).

- [ ] **4.3** Add presets:
  - `studio` — current default (warm key, cool fill)
  - `clinical` — neutral white, higher ambient (for code compliance modules)
  - `dramatic` — strong directional, low ambient (for architectural history)
  - `flat` — high ambient, no directional shadows (for calculators)

- [ ] **4.4** Migrate `CalculatorLighting.tsx` to use `preset="flat"` instead of being a separate component.

**Verification gate:**
- Default `studio` preset produces identical rendering to current StudioLighting
- `bun run type-check` passes

### Phase 5: Store Lifecycle & Module Isolation [F-11, F-09]
**Goal:** Clean module mount/unmount. Reduce invalidation over-triggering.

- [ ] **5.1** Split `useLabStore` into focused stores:
  - `useLabNavigationStore` — hotspot, panel mode, exploration mode
  - `useLabProgressStore` — visited hotspots, answered questions, quiz results
  - `useLabViewStore` — cross-section, exploded view, camera state
  - **Keep backward-compatible re-export** from `useLabStore` composing all three

- [ ] **5.2** Add `resetOnUnmount` option to `createModuleStore()`:
  - Auto-calls `reset()` when module component unmounts
  - Prevents stale state leaking between modules

- [ ] **5.3** Create `src/features/3d-lab/hooks/useModuleLifecycle.ts`:
  - Combines: store reset, dispose cleanup, invalidation registration
  - Single hook call per scene component replaces 3 separate setup patterns

- [ ] **5.4** Delete broken `src/features/3d-lab/hooks/useInvalidateOnChange.ts`:
  - Selects `useLabStore.setInvalidateFn` which DOES NOT EXIST on useLabStore (see Appendix B.2)
  - Runtime error or silent no-op if ever mounted
  - `useLabStore` is pure UI state — should never trigger Canvas invalidation

- [ ] **5.5** Selective invalidation for `createModuleStore`:
  - `setActiveAnnotation` should NOT call `invalidateFn()` — only DOM overlays change (no geometry affected)
  - Only `setParam`, `setParams`, `reset` should trigger Canvas invalidation
  - Add `invalidateOnChange: boolean` flag to store actions

**Verification gate:**
- Navigate between 5 modules rapidly: no stale state, no VRAM growth
- `bun run type-check` passes
- Profile shows fewer invalidate() calls for UI-only actions

### Phase 6: Asset Loading & Progress Infrastructure [F-12]
**Goal:** Prepare for GLTF/texture-heavy modules (Series 400-500).

- [ ] **6.1** Create `src/features/3d-lab/components/rendering/AssetPreloader.tsx`:
  - Accepts asset manifest (URLs + types)
  - Uses `useGLTF.preload()` and `useTexture.preload()` from drei
  - Reports 0-100% progress

- [ ] **6.2** Upgrade `src/components/r3f/CanvasLoadingOverlay.tsx` → `LoadingProgress.tsx`:
  - Percentage bar with asset name
  - Falls back to spinner when no manifest (backward compatible)
  - Same API surface + new optional `progress` prop

- [ ] **6.3** Extend `ModuleRegistryEntry` in `types/templates.ts`:
  ```ts
  assets?: {
    models?: Array<{ url: string; type: 'gltf' | 'glb' }>
    textures?: Array<{ url: string; type: 'jpg' | 'png' | 'ktx2' }>
  }
  ```

- [ ] **6.4** Configure DRACO decoder path globally (currently only set in legacy Workspace.tsx):
  ```ts
  useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')
  ```

**Verification gate:**
- Existing modules (no manifest) show spinner as before
- Test module with GLTF shows progress bar
- `bun run type-check` passes

### Phase 7: Animation Completion & Frame Budget [F-14]
**Goal:** Stop frame loop when animations settle.

- [ ] **7.1** Create `src/features/3d-lab/hooks/useAnimationComplete.ts`:
  - Tracks lerp convergence: `Math.abs(current - target) < threshold`
  - Returns `isAnimating` flag
  - Only calls `invalidate()` while animating

- [ ] **7.2** Refactor 5 affected scenes:
  - `AnimatedSequenceScene.tsx` FadingMesh
  - `CutawaySectionScene.tsx` LayerMesh
  - `ExplodedAssemblyScene.tsx` PartMesh
  - `NBCPScene.tsx` envelope lerp
  - `FARScene.tsx` building lerp

**Verification gate:**
- React DevTools profiler: useFrame callbacks stop after animations complete
- `frameloop="demand"` returns to zero GPU when static

### Phase 8: Mobile & Navigation Hardening [F-10, F-17, F-19]
**Goal:** Fix module loading race condition. Add mobile optimizations. Centralize camera presets.

- [ ] **8.1** `ModuleViewer.tsx` — Add stale-closure guard to config loading:
  ```ts
  useEffect(() => {
    let cancelled = false
    loadModuleConfig(moduleId).then(config => {
      if (!cancelled) setConfig(config)
    })
    return () => { cancelled = true }
  }, [moduleId])
  ```

- [ ] **8.2** Create `src/features/3d-lab/constants/camera-presets.ts`:
  - Merge DevControls' `CAMERA_PRESETS` and Calculator's `getCalcCameraPresets()` into a shared registry
  - Presets: `perspective`, `isometric`, `top-down`, `front`, `section`
  - Extend `SceneConfigProps` with optional `cameraPreset` key

- [ ] **8.3** Mobile optimizations:
  - Add `touch-action: none` to LabViewportFrame canvas container (prevents page scroll interference)
  - Detect mobile via `navigator.maxTouchPoints > 0` and reduce DPR to `[1, 1.25]`
  - Add `enableDamping={false}` to OrbitControls on mobile (reduces input lag)

**Verification gate:**
- Fast navigation between 5 modules: correct module always shown
- Mobile: no page scroll interference during orbit
- `bun run type-check` passes

---

### Phase 9: Template Normalization [F-21, F-22, F-23, F-24, F-25]
**Goal:** Fix store reset bugs, add error handling, normalize layout patterns, and add empty states across all templates.

- [ ] **9.1** Fix store reset bugs in ExplodedAssembly and AnimatedSequence:
  - Change `useMemo(() => createModuleStore(defaults), [])` → `useMemo(() => createModuleStore(defaults), [config.id])`
  - Verify store reinitializes when navigating between modules of the same template type

- [ ] **9.2** Stabilize useMemo dependency pattern for store creation:
  - Extract `defaults` computation into a `useMemo` with stable deps
  - Remove ESLint disable comments from ParametricScene, CutawaySection, FloorPlanWalkthrough
  - Pattern:
    ```ts
    const defaults = useMemo(() => {
      const d: Record<string, number | boolean | string> = {}
      for (const p of config.parameters) d[p.key] = p.default
      return d
    }, [config.parameters])
    const useStore = useMemo(() => createModuleStore(defaults), [config.id])
    ```

- [ ] **9.3** Add `<SceneErrorBoundary>` to all 7 template entry components:
  - Create `src/features/3d-lab/components/SceneErrorBoundary.tsx` — class component (mirrors Workspace.tsx pattern)
  - Fallback UI: "This module failed to render" + error details + retry button
  - Wrap `<CanvasWrapper>` children in every template entry
  - **Not the same as WebGLErrorBoundary (Phase 2)** — this catches scene-level errors (bad geometry, null refs), while WebGLErrorBoundary catches Canvas-level crashes

- [ ] **9.4** Add empty state handling to all templates:
  - Create `src/features/3d-lab/components/SceneEmptyState.tsx` — shown when geometry function returns empty array
  - Pattern: `if (geometryInstructions.length === 0) return <SceneEmptyState message="Adjust parameters to see geometry" />`
  - Apply to ParametricSceneRenderer, ExplodedAssemblyScene, FloorPlanScene, CutawaySectionScene, AnimatedSequenceScene

- [ ] **9.5** Evaluate LabPanelLayout adoption for ExplodedAssembly, CutawaySection, AnimatedSequence:
  - These currently use absolute positioning which is fragile
  - Design: left panel for controls, right panel for info/annotations, center for canvas
  - **Decision gate:** Some templates may intentionally want full-canvas with floating overlays (e.g., AnimatedSequence timeline at bottom). Document which pattern is canonical for each.

**Verification gate:**
- Navigate between 2 modules of the same template type: store resets correctly
- Introduce intentional error in a test config: error boundary catches it, retry works
- No ESLint disable comments remain in template files
- `bun run type-check` passes

---

## 7. Regulatory & Legal Verification Protocol

### 7.1 Zero-Hallucination Policy

Every parametric 3D module in the SlateCamp 3D Lab encodes **legally binding building code constraints** that Philippine architects use for professional exam preparation. AI hallucination of dimensions, clearances, setbacks, or spatial requirements is **unacceptable** — it could lead to incorrect learning and real-world design errors.

**Absolute rule:** No parametric bound (min, max, default, threshold, violation trigger) may be coded without an explicit, verifiable citation to the source law.

### 7.2 Applicable Legal Framework

| Code | Full Name | Primary Modules |
|------|-----------|----------------|
| **PD 1096** | National Building Code of the Philippines (& IRR) | Cat 01: Room sizes, setbacks, heights, courts, ventilation, stairs, exits |
| **BP 344** | Accessibility Law (& IRR) | Cat 02: Ramps, wheelchair clearances, accessible toilets, signage |
| **RA 9514** | Fire Code of the Philippines (& IRR) | Cat 03: Travel distance, exits, sprinklers, fire ratings, smoke control |
| **NSCP** | National Structural Code of the Philippines | Cat 04: Seismic zones, load combinations, wind loads, soil profiles |
| **NPCP** | National Plumbing Code of the Philippines | Cat 05: Fixture units, pipe sizing, drainage, vents, septic |
| **PEC** | Philippine Electrical Code | Cat 06: Conductor sizing, grounding, GFCI, panel boards |
| **PMEC** | Philippine Mechanical Engineering Code | Cat 07: Air changes, duct sizing, HVAC |
| **BP 220** | Socialized Housing | Cat 13: Lot sizes, open space, road widths |
| **PD 957** | Subdivision and Condominium Act | Cat 13: Subdivision layouts, density ratios |
| **RA 386** | Civil Code (Easements) | Cat 16: Site development, easements |

### 7.3 Existing Citation Pattern (Verified)

Current modules already use two citation mechanisms:

**1. ViolationRule.codeCitation field** (in `types/templates.ts:58`):
```ts
// Example from room-size-minimums.ts:76
codeCitation: 'PD 1096 IRR Rule VIII §801'
```

**2. Module file header comments:**
```ts
// src/app/dashboard/3d-lab/_config/modules/fire-travel-distance.ts
// RA 9514 IRR Rule 10 — Travel distance, dead-end corridors, exit requirements
```

**3. Inline constant documentation:**
```ts
/** Travel distance max [no sprinkler, sprinklered] in meters */
const TRAVEL_LIMITS: Record<string, [number, number]> = {
  'Assembly/Business': [46, 61],  // RA 9514 IRR Rule 10
```

### 7.4 Gaps in Current Citation Practice

| Gap | Impact | Example |
|-----|--------|---------|
| Not all parameter min/max bounds have citations | Values may be approximate | Slider ranges like `min: 500, max: 6000` — is 6000mm a code limit or arbitrary? |
| Hardcoded constants lack per-value citations | Can't verify individual numbers | `ROOM_MINS` object has area/dim values but no per-value law reference |
| No distinction between code-mandated vs pedagogical values | Confuses mandatory vs suggested | Default values may be pedagogical choices, not code requirements |
| No verification audit trail | Can't track when values were last verified | Laws get amended; no timestamp on when a citation was last checked |
| Some modules use colors to indicate compliance but threshold is undocumented | Color meaning unclear | Green/red threshold is hardcoded in geometry function |

### 7.5 Mandatory Verification Workflow (New)

**For every new or modified module config:**

```
STEP 1: IDENTIFY PARAMETRIC BOUNDS
  └─ List every min, max, default, step, threshold in the config

STEP 2: CITE SOURCE LAW
  └─ For each value, add a structured citation:
     {
       law: 'PD 1096',
       section: 'IRR Rule VIII §801',
       article: 'Table VIII.1',
       value: '6.0 sqm minimum habitable room area',
       verified: '2026-04-08'
     }

STEP 3: CLASSIFY VALUE TYPE
  └─ 'code-mandated' — directly from law (min room size, max travel distance)
  └─ 'code-derived' — calculated from law (setback = f(lot width, zoning))
  └─ 'pedagogical' — chosen for teaching (default slider position, step increment)
  └─ 'ux-arbitrary' — no legal basis (animation speed, color choice)

STEP 4: CROSS-REFERENCE
  └─ If another module references the same law section, values must match
  └─ Single source of truth: constants in `config/constants/{law-id}.ts`

STEP 5: PEER REVIEW
  └─ Legal citations must be verified by a licensed architect or 
     cross-referenced against the actual law document text
```

### 7.6 Implementation: Structured Citation Type System

**Add to `src/features/3d-lab/types/templates.ts`:**

```ts
export type ValueClassification = 'code-mandated' | 'code-derived' | 'pedagogical' | 'ux-arbitrary'

export interface LegalCitation {
  law: string              // 'PD 1096', 'RA 9514', 'BP 344', etc.
  section: string          // 'IRR Rule VIII §801'
  article?: string         // 'Table VIII.1' (optional — for table references)
  description: string      // Human-readable: 'Minimum habitable room area'
  value?: string           // The specific value cited: '6.0 sqm'
  classification: ValueClassification
  verified?: string        // ISO date of last verification: '2026-04-08'
}

// Extend ParameterDef
export interface ParameterDef {
  // ... existing fields ...
  citation?: LegalCitation  // NEW — legal source for min/max/default
}

// Extend ViolationRule
export interface ViolationRule {
  // ... existing fields ...
  citation?: LegalCitation  // NEW — supplements existing codeCitation string
}
```

### 7.7 Implementation: Shared Legal Constants

**Create per-law constant files to prevent value drift:**

```
src/features/3d-lab/config/constants/
├── pd-1096.ts        # National Building Code constants
├── bp-344.ts         # Accessibility Law constants
├── ra-9514.ts        # Fire Code constants
├── nscp.ts           # Structural Code constants
├── npcp.ts           # Plumbing Code constants
├── pec.ts            # Electrical Code constants
├── pmec.ts           # Mechanical Code constants
├── bp-220-pd-957.ts  # Housing/Subdivision constants
└── index.ts          # Re-exports all
```

**Example (`pd-1096.ts`):**
```ts
// PD 1096 IRR Rule VIII — Room Requirements
export const PD1096_ROOM_MINIMUMS = {
  habitable: { area: 6.0, minDim: 2.0, citation: 'IRR Rule VIII §801, Table VIII.1' },
  kitchen:   { area: 3.0, minDim: 1.5, citation: 'IRR Rule VIII §801, Table VIII.1' },
  bathroom:  { area: 1.2, minDim: 0.9, citation: 'IRR Rule VIII §801, Table VIII.1' },
  laundry:   { area: 1.5, minDim: 0.9, citation: 'IRR Rule VIII §801, Table VIII.1' },
} as const

// PD 1096 IRR Rule VII — Ceiling Heights
export const PD1096_CEILING_HEIGHTS = {
  minHabitable: 2.7,  // meters — IRR Rule VII §701
  minMezzanine: 1.8,  // meters — IRR Rule VII §702
  minBasement: 2.4,   // meters — IRR Rule VII §703
} as const
```

**All 193 module configs should import from these constant files instead of hardcoding values inline.** This ensures:
1. Single source of truth per legal value
2. If a law is amended, update ONE file, all modules follow
3. Every value is traceable to a specific law section

### 7.8 Verification Audit Automation

**Create `scripts/audit-legal-citations.ts`:**
- Scans all module configs in `config/modules/`
- For each `ParameterDef`: checks if `citation` field exists
- For each `ViolationRule`: checks if `codeCitation` or `citation` is populated
- For each hardcoded number in `geometry()` functions: flags as potential uncited value
- Outputs a compliance report: `% of parameters cited`, `% of violations cited`, `uncited constants list`
- Can be run as `bun run audit:citations` in CI

### 7.9 Migration Path for 193 Existing Configs

**Phase approach (not blocking other work):**
1. Add `LegalCitation` type and `citation` field to `ParameterDef` and `ViolationRule` — optional field, no breakage
2. Create constant files for PD 1096 and RA 9514 first (highest module count)
3. Migrate Cat 01 (24 modules) and Cat 03 (19 modules) to use shared constants
4. Run audit script — report baseline compliance percentage
5. Migrate remaining categories incrementally
6. Target: 100% of `code-mandated` values have citations; `pedagogical` values are classified but don't require law citations

---

## 8. Module Catalogue Rollout: 500-Series Roadmap

### 8.1 Three Computational Layers

Every 3D module implements one or more of three computational layers. Understanding which layers a module requires determines its template type, performance budget, and implementation complexity.

| Layer | Description | Example | Template Fit |
|-------|-------------|---------|-------------|
| **L1: Procedural Geometry** | Runtime geometry generation from parametric inputs. Shape is computed, not static. | MOD-101 (Staircase): riser count = `Math.ceil(floorHeight / maxRiser)` | `parametric`, `animated` |
| **L2: Parametric Bounding Boxes** | Invisible collision volumes enforcing legal clearances around static or semi-static geometry. | MOD-201 (Wheelchair): 1.80m diameter cylinder tests intersection with fixtures | `floorplan`, `exploded` |
| **L3: Real-Time Data Binding** | UI controls (sliders, dropdowns) directly drive 3D state + compliance dashboards. | MOD-401 (Density): lot count slider updates 70/30 ratio scorecard in real-time | All templates |

**Layer combinations by module:**
- **L1 only:** MOD-101 (Staircase), MOD-202 (Ramp), MOD-305 (Fire Escape)
- **L1 + L3:** MOD-102 (Room Sizer), MOD-103 (Setback), MOD-106 (Fenestration), MOD-501 (USA Botanist)
- **L2 + L3:** MOD-201 (Wheelchair), MOD-204 (Reach Sphere), MOD-209 (Corridor Width)
- **L1 + L2 + L3:** MOD-104 (Firewall), MOD-301 (Egress Capacity), MOD-401 (Density Analyzer)

### 8.2 Module-to-Template Mapping

Each MOD-series module maps to an existing template type. Modules requiring capabilities beyond existing templates are flagged for new template development.

#### Series 100: PD 1096 — National Building Code

| Module | Template | Layers | Complexity | Dependencies |
|--------|----------|--------|------------|-------------|
| MOD-101: Parametric Staircase | `parametric` | L1+L3 | HIGH | Procedural step generation, multi-code constraint merge (PD 1096 + BP 344 + RA 9514) |
| MOD-102: Volumetric Room Sizer | `parametric` | L1+L3 | MEDIUM | Existing `room-size-minimums.ts` — ALREADY BUILT |
| MOD-103: Dynamic Setback Extruder | `parametric` | L1+L3 | MEDIUM | Existing `nbcp-envelope.ts` — ALREADY BUILT |
| MOD-104: Firewall Parapet Locator | `exploded` | L1+L2+L3 | HIGH | Boolean intersection for parapet extensions |
| MOD-105: Building Height Visualizer | `parametric` | L1+L3 | MEDIUM | Existing `building-height-limits.ts` — ALREADY BUILT |
| MOD-106: Door & Fenestration Rig | `parametric` | L1+L3 | MEDIUM | Natural light/ventilation % calculation |
| MOD-107: Structural Clearance | `cutaway` | L2+L3 | MEDIUM | Bounding box projection around beams/columns |
| MOD-108: Plumbing Layout Engine | `floorplan` | L1+L2 | HIGH | Isometric piping overlay, slope visualization |
| MOD-109: Parking Slot Array | `animated` | L1+L3 | MEDIUM | Procedural array with dimension constraints |

#### Series 200: BP 344 — Accessibility Law

| Module | Template | Layers | Complexity | Dependencies |
|--------|----------|--------|------------|-------------|
| MOD-201: Wheelchair Turning Sphere | `floorplan` | L2+L3 | HIGH | 1.80m collision cylinder, avatar rigging |
| MOD-202: 1:12 Ramp Builder | `parametric` | L1+L3 | HIGH | Procedural switchbacks, auto-landing insertion |
| MOD-203: Tactile Paving Router | `floorplan` | L2+L3 | MEDIUM | Brush tool for directional/hazard indicators |
| MOD-204: Ergonomic Reach Sphere | `parametric` | L2+L3 | MEDIUM | Translucent volumetric cones (0.70m–1.20m) |
| MOD-205: Accessible Washroom | `parametric` | L1+L2+L3 | HIGH | Multi-fixture constraint testing |
| MOD-206: Pedestrian Crossing Sim | `floorplan` | L2+L3 | MEDIUM | Refuge island placement (1500mm depth) |
| MOD-207: Accessible Parking | `parametric` | L1+L3 | LOW | 900mm clearance enforcement |
| MOD-208: Elevator Dimension Verifier | `parametric` | L2+L3 | LOW | Min 1.10m × 1.40m interior, 30m entrance proximity |
| MOD-209: Corridor Width Checker | `floorplan` | L2+L3 | MEDIUM | 1200mm clear width sweep volume |

#### Series 300: RA 9514 — Fire Code

| Module | Template | Layers | Complexity | Dependencies |
|--------|----------|--------|------------|-------------|
| MOD-301: Egress Capacity Simulator | **NEW: `simulation`** | L1+L2+L3 | VERY HIGH | 3D crowd population, bottleneck detection |
| MOD-302: Travel Distance Pathfinder | `floorplan` | L2+L3 | HIGH | NavMesh pathfinding algorithm |
| MOD-303: Fire Barrier Visualizer | `cutaway` | L2+L3 | MEDIUM | Fire-resistance rating color overlay |
| MOD-304: Sprinkler Coverage | `floorplan` | L2+L3 | MEDIUM | Hemispherical coverage radius overlay |
| MOD-305: Exterior Fire Escape | `parametric` | L1+L3 | HIGH | Spiral stair variant (0.24m max riser) |
| MOD-306: Smoke Proof Enclosure | `cutaway` | L2+L3 | HIGH | Positive pressure airflow visualization |
| MOD-307: Panic Hardware Checker | `exploded` | L2+L3 | MEDIUM | Door swing direction + occupant load threshold |

#### Series 400: BP 220 & PD 957 — Subdivision

| Module | Template | Layers | Complexity | Dependencies |
|--------|----------|--------|------------|-------------|
| MOD-401: Density Ratio Analyzer | `floorplan` | L1+L2+L3 | HIGH | 70/30 ratio real-time dashboard |
| MOD-402: Procedural Lot Sizer | **NEW: `site-planner`** | L1+L3 | VERY HIGH | Zoning brush, terrain mesh subdivision |
| MOD-403: Rowhouse Cluster System | `parametric` | L1+L3 | HIGH | Hard-stop at 20 units / 100m; auto-alley at 250m |
| MOD-404: Road Hierarchy Generator | **NEW: `site-planner`** | L1+L3 | VERY HIGH | Procedural street layers (10m major → 6m motor court) |
| MOD-405: Parks Ratio Calculator | `parametric` | L3 | MEDIUM | Density-to-% scaling (3.5%–9.0%) |
| MOD-406: Setback & Frontage Verifier | `floorplan` | L2+L3 | HIGH | Batch scanning thousands of generated lots |

#### Series 500: Green Building Code

| Module | Template | Layers | Complexity | Dependencies |
|--------|----------|--------|------------|-------------|
| MOD-501: USA Botanist | `parametric` | L1+L3 | MEDIUM | 50% vegetation calculation, asset placement |
| MOD-502: Erosion Fence Builder | `floorplan` | L2 | LOW | Silt fencing placement tool |
| MOD-503: Ventilation Airflow Sim | **NEW: `simulation`** | L1+L2+L3 | VERY HIGH | Cross-ventilation pathways, WWR calculation |
| MOD-504: Solar Reflectance Painter | `parametric` | L3 | MEDIUM | Material assignment with SRI calculation |

### 8.3 New Template Types Required

The catalogue identifies **3 new template types** not covered by the existing 7:

| New Template | Required By | Core Capability | Build Priority |
|-------------|------------|-----------------|---------------|
| **`simulation`** | MOD-301 (Egress), MOD-503 (Ventilation) | Real-time agent/particle simulation with crowd or airflow visualization | Phase 3 (after foundation phases) |
| **`site-planner`** | MOD-402 (Lot Sizer), MOD-404 (Road Hierarchy) | Large-scale terrain mesh with zoning brush, procedural lot generation, road networks | Phase 4 (most complex) |
| **`measurement`** | MOD-204 (Reach), MOD-209 (Corridor Width), MOD-406 (Setback Verifier) | Interactive measurement overlays with volumetric sweep/collision testing | Phase 2 (extends existing floorplan) |

**Note:** `measurement` may be implementable as an extension of `floorplan` rather than a fully new template. Evaluate during Phase 2.

### 8.4 Phased Rollout Schedule

#### Module Build Phase 0: Broken Existing Modules (Audit + Repair)
**Prerequisite:** Architecture Phase 0 (baseline) complete.
**Source:** `3DMI-ToDo_List.md` Phase 0

These modules EXIST in the codebase but are broken or need UX alignment with the new architecture. Fix before building new modules.

| Priority | Module | Status | Required Work |
|----------|--------|--------|--------------|
| 1 | Site Development Controls (PD 1096) | **Working** — existing flagship | Verify against new architecture; add DOM overlays |
| 2 | Stairway Geometry Configurator (PD 1096/BP 344) | **UX broken** | Git history review; implement SceneConfig + DOM overlay wrapper |
| 3 | Unified Wall Configurator | **UX broken** | Git history review; align with LabPanelLayout + new overlay system |
| 4 | Flooring / Tile Visualizer | **Empty viewport** | Rendering audit; fix Canvas mounting; apply new architecture |

#### Wave 1: Foundation & Quick Wins (Existing templates, LOW-MEDIUM complexity)
**Prerequisite:** Architecture Phases 0-2 complete. Module Build Phase 0 repaired.
**Modules:** Already-built configs verified + new LOW/MEDIUM modules using existing templates.

| Priority | Module | Template | Status | ToDo Source |
|----------|--------|----------|--------|------------|
| 1 | MOD-102 (Room Sizer) | `parametric` | **BUILT** — `room-size-minimums.ts` | ToDo P1 |
| 2 | MOD-103 (FLAR & Setback) | `parametric` | **BUILT** — `nbcp-envelope.ts` | ToDo P1 |
| 3 | MOD-105 (Height / High-Rise Visualizer) | `parametric` | **BUILT** — `building-height-limits.ts` | ToDo P1 + P3 |
| 4 | MOD-106 (Accessible Doorway + Fenestration) | `parametric` | **PARTIAL** — `accessible-door-clearances.ts` exists | ToDo P2 |
| 5 | MOD-207 (Accessible Parking) | `parametric` | LOW — config only | ToDo P5 |
| 6 | MOD-208 (Elevator Cab Dimensions) | `parametric` | LOW — config only | ToDo P2 |
| 7 | MOD-405 (Parks & Playground Ratio) | `parametric` | MEDIUM — data binding | ToDo P4 |
| 8 | MOD-504 (Solar Painter) | `parametric` | MEDIUM — material assignment | ToDo P5 |
| 9 | MOD-502 (Erosion Fence) | `floorplan` | LOW — placement tool | ToDo P5 |
| 10 | Light & Ventilation Well (PD 1096) | `parametric` | **BUILT** — `light-ventilation-openings.ts` | ToDo P5 |
| 11 | Fire Extinguisher Placement (RA 9514) | `floorplan` | **BUILT** — `fire-extinguisher-placement.ts` | ToDo P3 |
| 12 | FAR Massing (PD 1096) | `parametric` | **BUILT** — FAR Playground exists | ToDo P1 |
| 13 | ISA vs USA (PD 1096) | `parametric` | **BUILT** — in DevControls | ToDo P1 |

#### Wave 2: Parametric Powerhouses (HIGH complexity, existing templates)
**Prerequisite:** Wave 1 verified. Phase 3 (DOM overlay system) complete.

| Priority | Module | Template | Key Challenge | ToDo Source |
|----------|--------|----------|-------------|------------|
| 1 | MOD-101 (Staircase Generator) | `parametric` | Multi-code constraint merge (PD 1096 + BP 344 + RA 9514) | ToDo P1 |
| 2 | MOD-202 (Ramp + Zocalo Builder) | `parametric` | Procedural switchbacks, 100mm zocalo, dual handrails 700/900mm, auto-landings | ToDo P2 |
| 3 | MOD-104 (Firewall / Max Extension of Abutments) | `exploded` | Boolean intersection for parapet extensions (0.40m above roof, 0.60m from edges, 0.30m under eaves) | ToDo P1 |
| 4 | MOD-305 (Fire Escape) | `parametric` | Spiral variant with 0.24m max riser | ToDo P3 |
| 5 | MOD-205 (Accessible Toilet — Individual + Group) | `parametric` | Multi-fixture collision, grab bars, turning circle, group layout variant | ToDo P2 |
| 6 | MOD-403 (Rowhouse Cluster) | `parametric` | Hard-stop at 20 units/100m; auto-alley at 250m | ToDo P4 |
| 7 | MOD-109 (Parking Space Layout) | `animated` | Configurable stall size, aisle width, standard + articulated | ToDo P5 |
| 8 | Exit Width Calculator (RA 9514) | `parametric` | Occupant load → required min exit width | ToDo P3 |
| 9 | Number of Exits Required (RA 9514) | `floorplan` | Occupant count → exit count + placement | ToDo P3 |

#### Wave 3: Floor Plan & Measurement Modules
**Prerequisite:** Wave 2 verified. `measurement` template evaluated/built.

| Priority | Module | Template | Key Challenge | ToDo Source |
|----------|--------|----------|-------------|------------|
| 1 | MOD-302 (Travel Distance + Dead-End Corridor) | `floorplan` | NavMesh pathfinding; 6m dead-end max | ToDo P3 |
| 2 | MOD-304 (Sprinkler Head Coverage) | `floorplan` | Hemispherical coverage radius overlay | ToDo P3 |
| 3 | MOD-201 (Wheelchair Turning Sphere) | `floorplan` | 1.80m collision cylinder + 0.80m×1.10m footprint | ToDo P2 |
| 4 | MOD-209 (Corridor Width Checker) | `floorplan`/`measurement` | 1200mm clear width sweep volume | — |
| 5 | MOD-204 (Ergonomic Reach Sphere) | `parametric`/`measurement` | Volumetric cone 0.70m–1.20m | — |
| 6 | MOD-203 (Tactile Paving + Curb Cuts) | `floorplan` | Directional/hazard indicators; curb cut details | ToDo P5 |
| 7 | MOD-303 (Fire Barrier / Compartment) | `cutaway` | Fire rating color overlay | — |
| 8 | MOD-306 (Smoke Proof Enclosure) | `cutaway` | Positive pressure airflow mapping | — |
| 9 | MOD-401 (Saleable vs Non-Saleable Ratio) | `floorplan` | 70/30 real-time dashboard; draggable boundary | ToDo P4 |
| 10 | MOD-406 (Lot Dimensions / Frontage — PD 957) | `floorplan` | Min frontage + lot area with violation highlight | ToDo P1 |
| 11 | Socialized Housing Lot Minimums (BP 220) | `parametric` | Min dimensions with violation highlights | ToDo P4 |

#### Wave 4: Advanced Simulation & Site Planning (NEW templates required)
**Prerequisite:** Wave 3 verified. `simulation` and `site-planner` templates built.

| Priority | Module | Template | Key Challenge | ToDo Source |
|----------|--------|----------|-------------|------------|
| 1 | MOD-301 (Egress Capacity + Bottleneck) | `simulation` | 3D crowd population + exit door capacity | ToDo P3 |
| 2 | MOD-503 (Ventilation + WWR Configurator) | `simulation` | Cross-ventilation + window-to-wall ratio | ToDo P5 |
| 3 | MOD-402 (Lot Sizer — Open Market vs Socialized) | `site-planner` | Zoning brush + terrain subdivision | ToDo P4 |
| 4 | MOD-404 (Road Hierarchy + Right-of-Way) | `site-planner` | Major 10m → motor court 6m, cul-de-sac turnarounds | ToDo P4 |
| 5 | MOD-406 (Setback & Frontage Verifier — Batch) | `floorplan` | Batch lot scanning | — |
| 6 | MOD-501 (USA Botanist + 50% Vegetation) | `parametric` | DENR-approved species assets | ToDo P5 |
| 7 | Shading Device Effectiveness (GBC) | `parametric` | Horizontal fin shadow projection | ToDo P5 |
| 8 | Daylighting: Room Depth Rule (GBC) | `cutaway` | Daylight penetration limit section | ToDo P5 |

### 8.5 ToDo List Reconciliation (3DMI-ToDo_List.md → Master Plan)

Every module from `3DMI-ToDo_List.md` is accounted for below. This table serves as proof of complete consolidation.

| ToDo Phase | ToDo Module | → Master Plan Location | Status |
|-----------|-------------|----------------------|--------|
| **P0** | Site Development Controls (PD 1096) | Build Phase 0 #1 | Existing flagship |
| **P0** | Stairway Geometry Configurator | Build Phase 0 #2 | UX broken — repair |
| **P0** | Unified Wall Configurator | Build Phase 0 #3 | UX broken — repair |
| **P0** | Flooring / Tile Visualizer | Build Phase 0 #4 | Empty viewport — repair |
| **P1** | FLAR & Setback Configurator | Wave 1 #2 (MOD-103) | ALREADY BUILT |
| **P1** | BHL Envelope | Wave 1 #3 (MOD-105) | ALREADY BUILT |
| **P1** | FAR Massing | Wave 1 #12 | ALREADY BUILT (FAR Playground) |
| **P1** | ISA vs USA | Wave 1 #13 | ALREADY BUILT (DevControls) |
| **P1** | Max Extension of Abutments / Firewalls | Wave 2 #3 (MOD-104) | NEW — HIGH |
| **P1** | Minimum Room Dimensions | Wave 1 #1 (MOD-102) | ALREADY BUILT |
| **P1** | Lot Dimensions: Min Frontage (PD 957) | Wave 3 #10 (MOD-406) | NEW — HIGH |
| **P2** | Ramp: Slope, Width, Landings | Wave 2 #2 (MOD-202) | NEW — HIGH |
| **P2** | Ramp Zocalo (Curb Guard) | Wave 2 #2 (merged into MOD-202) | Part of ramp module |
| **P2** | Accessible Doorway | Wave 1 #4 (MOD-106) | PARTIAL — config exists |
| **P2** | Accessible Toilet (Individual) | Wave 2 #5 (MOD-205) | NEW — HIGH |
| **P2** | Accessible Toilet (Group) | Wave 2 #5 (MOD-205 variant) | Merged into MOD-205 |
| **P2** | Elevator Cab Dimensions | Wave 1 #6 (MOD-208) | NEW — LOW |
| **P3** | Exit Travel Distance | Wave 3 #1 (MOD-302) | ALREADY BUILT (`fire-travel-distance.ts`) |
| **P3** | Exit Width Calculator | Wave 2 #8 | NEW — MEDIUM |
| **P3** | Dead-End Corridor Limit | Wave 3 #1 (merged into MOD-302) | Part of travel distance |
| **P3** | Number of Exits Required | Wave 2 #9 | NEW — MEDIUM |
| **P3** | Sprinkler Head Coverage | Wave 3 #2 (MOD-304) | NEW — MEDIUM |
| **P3** | Fire Extinguisher Placement | Wave 1 #11 | ALREADY BUILT |
| **P3** | High-Rise Building Definition | Wave 1 #3 (MOD-105) | ALREADY BUILT |
| **P4** | Parks & Playground Density (PD 957) | Wave 1 #7 (MOD-405) | NEW — MEDIUM |
| **P4** | Saleable vs Non-Saleable (PD 957) | Wave 3 #9 (MOD-401) | NEW — HIGH |
| **P4** | Density vs Park Allocation (BP 220) | Wave 1 #7 (MOD-405 variant) | Merged into MOD-405 |
| **P4** | Socialized Housing Lot Minimums (BP 220) | Wave 3 #11 | NEW — MEDIUM |
| **P4** | Row House Layout (BP 220) | Wave 2 #6 (MOD-403) | NEW — HIGH |
| **P4** | Road Hierarchy (PD 957 / BP 220) | Wave 4 #4 (MOD-404) | NEW — VERY HIGH |
| **P5** | USA with Vegetation (GBC) | Wave 4 #6 (MOD-501) | NEW — MEDIUM |
| **P5** | WWR Configurator (GBC) | Wave 4 #2 (MOD-503) | NEW — VERY HIGH |
| **P5** | Shading Device Effectiveness (GBC) | Wave 4 #7 | NEW — MEDIUM |
| **P5** | Daylighting Room Depth (GBC) | Wave 4 #8 | NEW — MEDIUM |
| **P5** | Parking Space Layout (PD 1096) | Wave 2 #7 (MOD-109) | NEW — MEDIUM |
| **P5** | Accessible Parking (PD 1096/BP 344) | Wave 1 #5 (MOD-207) | NEW — LOW |
| **P5** | Light & Ventilation Well (PD 1096) | Wave 1 #10 | ALREADY BUILT |
| **P5** | Tactile Warning Strips (BP 344) | Wave 3 #6 (MOD-203) | NEW — MEDIUM |

**Result:** 38/38 ToDo items mapped. 0 items dropped. `3DMI-ToDo_List.md` is now fully consolidated and can be deleted.

### 8.6 Cross-Code Constraint Matrix

Some modules must merge constraints from multiple laws. This matrix identifies where conflict resolution logic is needed.

| Module | PD 1096 | RA 9514 | BP 344 | Notes |
|--------|---------|---------|--------|-------|
| MOD-101 (Staircase) | Max riser 0.20m, min door 900mm | Spiral riser 0.24m, min egress door 710mm | Max riser 0.20m, min door 800mm | **Most restrictive wins** per parameter. Mode toggle switches active constraint set. |
| MOD-106 (Fenestration) | Min door 900mm × 2000mm | Min egress 710mm × 2000mm | Min accessible 800mm × 2000mm | Width: PD 1096 wins (900mm); RA 9514 710mm only for secondary egress |
| MOD-202 (Ramp) | General ramp provisions | Fire escape ramp provisions | 1:12 gradient, 100mm zocalo, dual handrails 700/900mm | BP 344 dominates ramp design; PD 1096/RA 9514 add egress requirements |
| MOD-302 (Travel Distance) | — | Max 46m (no sprinkler), 61m (sprinklered) for Assembly | — | RA 9514 exclusive; existing `fire-travel-distance.ts` ALREADY BUILT |

**Resolution rule:** When multiple codes specify different values for the same parameter, the most restrictive value governs UNLESS the code explicitly exempts a specific condition (e.g., RA 9514 permits 0.24m spiral riser which PD 1096 does not address for fire escapes).

---

## 9. Backwards Compatibility Contract

### Immutable APIs (DO NOT CHANGE)

| API | Location | Consumers |
|-----|----------|-----------|
| `createModuleStore(defaults)` | `stores/createModuleStore.ts` | All 5 template entry components |
| `ModuleStoreState` interface | `stores/createModuleStore.ts` | All scene components |
| `TemplateType` union | `types/templates.ts` | Registry, loader, module viewer |
| `ModuleRegistryEntry` | `types/templates.ts` | Registry files, browser, card |
| `SceneTunnel` | `components/GlobalCanvasPortal.tsx` | CanvasWrapper, LabViewportFrame |
| `useRegisterInvalidate()` | `src/components/r3f/` | Multiple modules |
| `SceneInvalidator` | `src/components/r3f/` | CalculatorTemplate |
| `CanvasLoadingOverlay` | `src/components/r3f/` | CanvasWrapper |
| `ASSET_TAXONOMY` | `config/taxonomy.ts` | Browser, registry, routes |
| `GenericControlPanel` props | `components/templates/` | All parametric templates |
| `LabPanelLayout` props | `components/templates/` | All panel-based templates |
| `HotspotAnnotation` interaction design | N/A | Dot→card expand, quiz mode, wiki link — preserve in DOM overlay `HotspotCard.tsx` (Phase 3 migrates, props will change) |

### Identity Lock (MUST NOT TOUCH)

Per `.ai/rules/identity_preservation_lock.md`:
- `SlideToSubmit.tsx` — gesture physics, colors, animation timing LOCKED
- `GestureCaptureZone.tsx` — gesture capture wrapper LOCKED
- `src/lib/quiz/haptics.ts` — haptic feedback LOCKED

### DevControls Module Independence

`DevControlsModule/` has its own Canvas (`DevControlsCanvas.tsx`) and does NOT use CanvasWrapper, SceneBase, or LabViewportFrame. **All phases MUST leave DevControlsModule untouched.** It is the reference implementation for advanced patterns (PerformanceMonitor, InvalidateBridge, camera presets, layer system).

---

## 10. Template Expansion Readiness

After completing Phases 0-9, the system supports rapid creation of new modules. See **Section 8** for the complete module-to-template mapping and wave schedule.

### New Module Creation Workflow (Post-Architecture)
1. Create config file in `config/modules/{categoryDir}/{module-id}.ts`
2. Add legal citations per **Section 7.5** verification workflow
3. Import shared constants from `config/constants/{law-id}.ts`
4. Register in `config/registry/cat-{id}.ts`
5. Choose template type from existing 7 (or 10 after Wave 4 adds `simulation`, `site-planner`, `measurement`)
6. Define `parameters`, `geometry()` function, `violations`, `presets`
7. All text/labels/tooltips are handled by the DOM overlay system — **no `<Html>` inside Canvas**
8. Done — no new components needed for existing template types

### Template Capacity After Architecture Phases

| Template | Current Modules | Planned (Waves 1-4) | Total Capacity |
|----------|----------------|---------------------|---------------|
| `parametric` | ~120 | +15 | Unlimited — config-driven |
| `exploded` | ~25 | +2 | Unlimited |
| `floorplan` | ~15 | +8 | Unlimited |
| `cutaway` | ~10 | +4 | Unlimited |
| `animated` | ~10 | +1 | Unlimited |
| `calculator` | 4 | 0 | Fixed (4 tools) |
| `wall-configurator` | 1 | 0 | Fixed (1 tool) |
| `simulation` (NEW) | 0 | +2 | Build in Wave 4 |
| `site-planner` (NEW) | 0 | +2 | Build in Wave 4 |
| `measurement` (NEW) | 0 | +3 | Evaluate: may extend `floorplan` |

---

## 11. Acceptance Criteria

| ID | Criterion | Verification | Phase |
|----|-----------|-------------|-------|
| AC-01 | All 10 CanvasWrapper consumers render with their specified camera/FOV | Screenshot comparison | P1 |
| AC-02 | `disposeObject()` called on unmount for all 13 scene components | `grep` confirms import+usage | P2 |
| AC-03 | WebGL context loss shows error boundary with retry | `gl.getExtension('WEBGL_lose_context').loseContext()` | P2 |
| AC-04 | Zero hardcoded hex in templates/ and components/ (except scene-colors.ts) | `grep -rn '#[0-9a-fA-F]{6}'` returns only scene-colors.ts | P3 |
| AC-05 | ZERO `<Html>` or `<Text>` inside Canvas — all text in 2D DOM overlay | `grep -rn '<Html\|<Text' src/features/3d-lab/` returns 0 results (excluding comments) | P3 |
| AC-06 | `bun run type-check` passes after each phase | CI | All |
| AC-07 | `bun run build` succeeds after each phase | CI | All |
| AC-08 | DevControlsModule completely unchanged | `git diff` shows 0 changes | All |
| AC-09 | SlideToSubmit identity lock preserved | Post-phase check | All |
| AC-10 | Frame loop returns to idle after animations complete | React DevTools profiler | P7 |
| AC-11 | VRAM stays bounded across 10 module switches | `gl.info.memory.geometries` check | P2 |
| AC-12 | New template type addable with config + scene + registry only | Demonstrated in <50 lines | P1 |
| AC-13 | StudioLighting presets produce correct rendering | Visual comparison of 4 presets | P4 |
| AC-14 | Fast module navigation always shows correct module | 10 rapid switches, correct every time | P8 |
| AC-15 | Mobile orbit doesn't cause page scroll | Test on iOS Safari + Chrome Android | P8 |
| AC-16 | ExplodedAssembly and AnimatedSequence reset store on module switch | Navigate between 2 modules of same template: verify state resets | P9 |
| AC-17 | All 7 templates have SceneErrorBoundary | Introduce intentional error in test config: boundary catches, retry works | P9 |
| AC-18 | No ESLint disable comments in template files | `grep -rn 'eslint-disable' src/features/3d-lab/templates/` returns 0 | P9 |
| AC-19 | `LegalCitation` type exists on `ParameterDef` and `ViolationRule` | grep confirms field in types/templates.ts | P7 (Reg) |
| AC-20 | Shared legal constants exist for PD 1096 and RA 9514 | `config/constants/pd-1096.ts` and `config/constants/ra-9514.ts` exist | P7 (Reg) |
| AC-21 | `bun run audit:citations` reports baseline compliance | Script runs without error, outputs % cited | P7 (Reg) |
| AC-22 | Wave 1 modules (8 modules) pass regulatory verification | Each module's code-mandated values traced to law section | Wave 1 |
| AC-23 | Cross-code conflict resolution documented for multi-law modules | MOD-101 (Staircase) constraint merge logic has per-value citations | Wave 2 |

---

## 12. Risk Register

| Risk | Likelihood | Impact | Mitigation | Phase |
|------|-----------|--------|------------|-------|
| Phase 1 camera refactor breaks module framing | Medium | High | Screenshot comparison before/after for all modules | P1 |
| dispose() breaks R3F internal reference tracking | Low | High | Only apply to imperative objects, not declarative JSX | P2 |
| tunnel-rat state desync during hot reload | Low | Medium | Test HMR explicitly after Phase 1 | P1 |
| useLabStore split breaks deep selector chains | Medium | Medium | Keep backward-compatible re-export; run type-check | P5 |
| PerformanceMonitor adaptive DPR causes flickering | Low | Low | Conservative thresholds; match DevControls implementation | P1 |
| Ground plane extraction changes visual appearance | Low | Medium | Pixel-compare before/after | P3 |
| SceneConfig tunnel context lost on remount | Low | High | Test with React.StrictMode double-mount | P1 |
| Selective invalidation misses geometry changes | Medium | Medium | Explicit `geometryDirty` flag instead of guessing | P5 |
| GLTF preloader blocks Canvas initialization | Low | Medium | Load manifest async, don't block first frame | P6 |
| Camera preset system conflicts with module-specific cameras | Medium | Low | Module config always overrides presets | P8 |
| Store reset fix breaks modules that intentionally persist state | Low | Medium | Audit each template: verify no module relies on cross-navigation state | P9 |
| SceneErrorBoundary catches non-3D errors (React rendering) | Low | Low | Only wrap CanvasWrapper children, not full template | P9 |
| Legal citation migration creates noise in 193 config file diffs | Medium | Low | Batch by category; one PR per category for clean review | P7 (Reg) |
| Hallucinated law values pass review if citations are fabricated | Low | CRITICAL | Cross-reference with actual PDF law documents; licensed architect sign-off | P7 (Reg) |
| Wave 2 multi-code modules have conflicting constraints | Medium | High | Explicit conflict resolution rule: most restrictive wins unless law exempts | Wave 2 |
| `simulation` template (MOD-301, MOD-503) exceeds GPU budget | Medium | High | Budget: <100 agents for egress sim; particle system for airflow, not CFD | Wave 4 |
| `site-planner` template (MOD-402, MOD-404) exceeds memory with large terrain | Medium | High | LOD system + chunked terrain loading; max 10 hectare sites | Wave 4 |

---

## Execution Order & Dependencies

```
Phase 0 (baseline) ─── required by all
  │
  ├── Phase 1 (CanvasWrapper + SceneConfig) ─── CRITICAL PATH
  │     │
  │     ├── Phase 2 (WebGL lifecycle) ─── after P1
  │     │
  │     ├── Phase 3 (2D DOM overlays + colors) ─── after P1
  │     │
  │     └── Phase 4 (configurable lighting) ─── after P1
  │
  ├── Phase 5 (store lifecycle) ─── independent after P0
  │
  ├── Phase 6 (asset loading) ─── independent after P0
  │
  ├── Phase 7 (animation frames) ─── independent after P0
  │
  ├── Phase 8 (mobile + navigation) ─── independent after P0
  │
  └── Phase 9 (template normalization) ─── independent after P0
        │
        └─── MODULE ROLLOUT (after architecture phases complete) ───
              │
              ├── Wave 1 (13 modules — existing templates, LOW/MED) ─── after P0-P2
              │
              ├── Wave 2 (9 modules — parametric powerhouses, HIGH) ─── after P3 + Wave 1
              │
              ├── Wave 3 (11 modules — floorplan & measurement) ─── after Wave 2
              │     │
              │     └── Build `measurement` template if needed
              │
              └── Wave 4 (8 modules — simulation & site planning) ─── after Wave 3
                    │
                    ├── Build `simulation` template (MOD-301, MOD-503)
                    └── Build `site-planner` template (MOD-402, MOD-404)

  PARALLEL TRACK (runs alongside all phases):
  └── Regulatory Verification Protocol (Section 7)
        ├── LegalCitation type system
        ├── Shared constants (pd-1096.ts, ra-9514.ts, ...)
        └── Citation audit script
```

**Architecture phases (P0-P9):** P2-P4 depend on P1. P5-P9 independent after P0.
**Module waves:** Wave 1 after P0-P2. Wave 2 after P3 + Wave 1. Sequential thereafter.
**Regulatory track:** Runs in parallel with everything — non-blocking but mandatory before any module ships.

---

## Files Summary

### Files to CREATE (29 new)
| File | Phase |
|------|-------|
| `src/features/3d-lab/components/rendering/SceneConfig.tsx` | P1 |
| `src/components/r3f/WebGLErrorBoundary.tsx` | P2 |
| `src/components/r3f/useDisposeOnUnmount.ts` | P2 |
| `src/components/r3f/useWebGLMemoryMonitor.ts` | P2 |
| `src/features/3d-lab/constants/scene-colors.ts` | P3 |
| `src/features/3d-lab/stores/useOverlayStore.ts` | P3 |
| `src/features/3d-lab/hooks/useWorldToScreen.ts` | P3 |
| `src/features/3d-lab/components/overlays/DOMOverlayLayer.tsx` | P3 |
| `src/features/3d-lab/components/overlays/CameraSync.tsx` | P3 |
| `src/features/3d-lab/components/overlays/LabelOverlay.tsx` | P3 |
| `src/features/3d-lab/components/overlays/ViolationBadge.tsx` | P3 |
| `src/features/3d-lab/components/overlays/PartTooltip.tsx` | P3 |
| `src/features/3d-lab/components/overlays/HotspotCard.tsx` | P3 |
| `src/features/3d-lab/components/rendering/GroundPlane.tsx` | P3 |
| `src/features/3d-lab/hooks/useModuleLifecycle.ts` | P5 |
| `src/features/3d-lab/stores/useLabNavigationStore.ts` | P5 |
| `src/features/3d-lab/stores/useLabProgressStore.ts` | P5 |
| `src/features/3d-lab/components/rendering/AssetPreloader.tsx` | P6 |
| `src/components/r3f/LoadingProgress.tsx` | P6 |
| `src/features/3d-lab/hooks/useAnimationComplete.ts` | P7 |
| `src/features/3d-lab/constants/camera-presets.ts` | P8 |
| `src/features/3d-lab/components/SceneErrorBoundary.tsx` | P9 |
| `src/features/3d-lab/components/SceneEmptyState.tsx` | P9 |
| `src/features/3d-lab/config/constants/pd-1096.ts` | Reg |
| `src/features/3d-lab/config/constants/ra-9514.ts` | Reg |
| `src/features/3d-lab/config/constants/bp-344.ts` | Reg |
| `src/features/3d-lab/config/constants/nscp.ts` | Reg |
| `src/features/3d-lab/config/constants/index.ts` | Reg |
| `scripts/audit-legal-citations.ts` | Reg |

### Files to MODIFY (30+ existing)
| File | Phase | Change |
|------|-------|--------|
| `components/CanvasWrapper.tsx` | P1 | Strip dead props, add sceneConfig |
| `components/shell/LabViewportFrame.tsx` | P1, P2 | SceneConfig delegation, ErrorBoundary, PerformanceMonitor |
| `components/rendering/SceneBase.tsx` | P3 | Import from scene-colors.ts |
| `components/rendering/StudioLighting.tsx` | P4 | Accept LightingConfig props with presets |
| `components/ModuleViewer.tsx` | P8 | Stale-closure guard for config loading |
| `stores/useLabStore.ts` | P5 | Split into focused stores (keep re-export) |
| `stores/createModuleStore.ts` | P5 | resetOnUnmount, selective invalidation |
| `types/templates.ts` | P6, Reg | Add assets manifest + LegalCitation type |
| `src/components/r3f/index.ts` | P2 | Export new utilities |
| `src/components/r3f/CanvasLoadingOverlay.tsx` | P6 | Upgrade to progress tracking |
| All 7 template entry components | P1, P9 | sceneConfig prop + SceneErrorBoundary + store reset fix |
| All 13 scene components | P2, P3 | useDisposeOnUnmount, remove ALL `<Html>`/`<Text>`, write positions to overlayStore, use GroundPlane |
| `components/templates/HotspotAnnotation.tsx` | P3 | Rewrite as DOM overlay `HotspotCard.tsx` (remove drei `<Html>`) |
| `components/templates/HumanSilhouette.tsx` | P3 | Remove `<Html>` label; emit "1.7m" as overlay item |
| `components/templates/ViolationIndicator.tsx` | P3 | Migrate to `ViolationBadge.tsx` DOM overlay |
| `templates/ExplodedAssembly.tsx` | P9 | Fix `[]` deps → `[config.id]` |
| `templates/AnimatedSequence.tsx` | P9 | Fix `[]` deps → `[config.id]` |
| `templates/ParametricScene.tsx` | P9 | Remove ESLint disable, stabilize defaults |
| `templates/CutawaySection.tsx` | P9 | Remove ESLint disable, stabilize defaults |
| `templates/FloorPlanWalkthrough.tsx` | P9 | Remove ESLint disable, stabilize defaults |
| 193 module config files (incremental) | Reg | Add citations, import from shared constants |

### Files to DELETE (3)
| File | Phase |
|------|-------|
| `components/templates/CanvasWrapper.tsx` (re-export) | P1 |
| `components/templates/GlobalCanvasPortal.tsx` (re-export) | P1 |
| `hooks/useInvalidateOnChange.ts` (broken — targets non-existent field) | P5 |

### Files NEVER TOUCHED
- `src/features/3d-lab/DevControlsModule/**/*` (entire module — independent Canvas)
- `src/components/quiz-v2/SlideToSubmit.tsx` (identity lock)
- `src/components/quiz-v2/GestureCaptureZone.tsx` (identity lock)
- `src/lib/quiz/haptics.ts` (identity lock)
- `src/features/3d-lab/config/modules/**/*` (193 module configs — read-only during architecture phases)
- `src/features/3d-lab/config/registry/**/*` (category registries — read-only)
- `src/features/3d-lab/config/taxonomy.ts` (taxonomy — read-only)

---

## Appendix A: R3F Best Practices Research (Agent Findings)

Findings from deep research into R3F scaling patterns, sourced from R3F docs, drei docs, GitHub discussions, and community reports. These inform implementation details throughout the plan.

### A.1 Memory Management — Critical Corrections to Plan

**R3F auto-disposes declarative JSX.** When `<mesh>` unmounts, its geometry and material are disposed automatically. This means Phase 2's `useDisposeOnUnmount` should ONLY target:
- Imperative objects created via `useGLTF` / `useLoader` / `new THREE.*`
- Objects attached with `<primitive object={...}>`
- NOT standard `<mesh>`, `<boxGeometry>`, `<meshStandardMaterial>` JSX

**`disposeObject()` on cached GLTF is DANGEROUS.** The current `Workspace.tsx:119-121` pattern (`return () => disposeObject(scene)`) corrupts the drei cache because `useGLTF` returns a shared reference. Fix options:
1. Clone the scene: `const clone = useMemo(() => scene.clone(true), [scene])`
2. Use `dispose={null}` on the primitive: `<primitive object={scene} dispose={null} />`
3. Clear cache explicitly on route exit: `useGLTF.clear(url)`

**ImageBitmap leak in `three-utils.ts`.** Current `disposeMaterial()` does not call `texture.source.data.close?.()` for ImageBitmap textures. This leaks browser memory even after GPU texture is freed.

**VRAM tracking pattern:**
```ts
// Dev-only: mount inside Canvas
const gl = useThree((s) => s.gl)
console.log('Geometries:', gl.info.memory.geometries, 'Textures:', gl.info.memory.textures)
```

### A.2 WebGL Context Loss — Error Boundary Strategy Correction

**React error boundaries CANNOT catch WebGL context loss** — it's a browser event, not a JS exception. The plan's `WebGLErrorBoundary.tsx` (Phase 2) must use a **dual strategy:**

1. **React error boundary** for render-time exceptions (bad GLTF, shader errors, null refs)
2. **Canvas event listener** for `webglcontextlost` / `webglcontextrestored`:
```ts
const canvas = gl.domElement
canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); showFallback() })
canvas.addEventListener('webglcontextrestored', () => { hideFallback() })
```
THREE.WebGLRenderer handles restoration internally (recompiles shaders, re-uploads textures). No manual re-init needed.

**Context loss on Canvas unmount is INTENTIONAL.** R3F calls `forceContextLoss()` to release GPU memory. The "Context Lost" console message is informational. The key prevention: **never unmount the Canvas between route changes** — route scene contents via tunnel instead (which we already do).

### A.3 PerformanceMonitor — Oscillation Prevention

Current DevControls pattern is good but missing `flipflops` guard:
```tsx
<PerformanceMonitor
  flipflops={3}              // After 3 oscillations, trigger onFallback
  onFallback={() => setDpr(1)} // Hard baseline to stop oscillation
  onChange={({ factor }) => setDpr(Math.round((0.5 + 1.5 * factor) * 10) / 10)}
/>
```
Without `flipflops`, devices near the DPR threshold boundary oscillate indefinitely.

### A.4 Why `<Html>` is Banned — Performance Evidence

Each drei `<Html>` creates a **separate React renderer instance** (via `createRoot`). Community benchmarks:

| Count | Performance |
|-------|------------|
| 0-20 | Acceptable |
| 20-50 | Noticeable FPS degradation |
| 50-100 | Severe degradation |
| 100+ | Unusable even with `display: none` |

**SlateCamp decision: BAN `<Html>` entirely.** Instead of trying to optimize around its limits (frustum culling, pooling), we eliminate the problem at the architectural level. The 2D DOM overlay system (Phase 3) renders all text in the browser's native React renderer — zero additional renderer instances, unlimited scalability, full accessibility, and browser-native text rendering.

**The only R3F-side component for the overlay system is `CameraSync.tsx`** — a null-render component that writes the camera reference to the overlay store each frame. Everything else lives in the DOM.

### A.5 Single Canvas Architecture Validation

Browsers hard-limit WebGL contexts to 8-10. The project currently has 2 Canvas instances (LabViewportFrame + DevControlsCanvas). This is safe but leaves headroom for only 6-8 more simultaneous contexts.

**The tunnel-rat pattern is correct** for route-level scene switching (one visible at a time). Consider drei `<View>` (scissor-based) only if multiple 3D viewports need to appear simultaneously on one page.

### A.6 Asset Loading Best Practices

- **`useGLTF.preload(url)`** at module scope for critical models
- **KTX2 textures** reduce VRAM 10x (4K PNG: 64MB → KTX2: ~2MB)
- **Prefetch DRACO decoders** in HTML head for faster first-load
- **`useProgress` from drei** for loading progress tracking (not custom)
- **One KTX2Loader instance shared globally** to avoid "Multiple active KTX2 loaders" warning

---

## Appendix B: Store Audit Deep Dive (Agent Findings)

### B.1 Store Comparison Matrix

| Store | Lines | Invalidation Pattern | UI-Only Changes Skip Invalidation? | Reset? | Lifecycle Cleanup? |
|-------|-------|---------------------|-------------------------------------|--------|-------------------|
| `createModuleStore` | 47 | Per-action calls on ALL mutations | **NO** — `setActiveAnnotation` invalidates unnecessarily | Yes | None |
| `legacyLabStore` | 67 | Per-action on ALL | No | Yes | None |
| `useLabStore` | 192 | **NONE** (pure UI state) | N/A — correct | Yes | None |
| `useWallLabStore` | 425 | **Selective** — skips `setStep`, `setSponsor`, `setTopcoatCoats` | **YES** — best pattern | Yes | None |
| `useNBCPStore` | 90 | Atomic (compute + invalidate coupled) | N/A | Yes | None |
| `useDevControlsStore` | 425 | Aggressive — invalidates on `setActiveHotspot`, `setShowDimensions`, `setTourStep` | **NO** — over-invalidates | Yes | None |

### B.2 Potentially Broken Hook: `useInvalidateOnChange`
- **File:** `src/features/3d-lab/hooks/useInvalidateOnChange.ts`
- **Issue:** Selects `useLabStore((state) => state.setInvalidateFn)`. There are TWO stores with similar names:
  - `stores/useLabStore.ts` (192 lines, global UI state) — has NO `invalidateFn` field
  - `stores/legacyLabStore.ts` (67 lines, legacy parametric) — HAS `invalidateFn` and `setInvalidateFn`
- **Verification status:** NEEDS CONFIRMATION — check which store the hook actually imports from. If it imports the 192-line `useLabStore`, the selector returns `undefined` (broken). If it imports or re-exports from `legacyLabStore`, it works.
- **Action:** During Phase 5, read the import statement and trace resolution. Delete if broken; document if valid.

### B.3 Invalidation Efficiency by Store

| Store | Correct Invalidations | Unnecessary Invalidations | Fix |
|-------|----------------------|--------------------------|-----|
| `createModuleStore` | `setParam`, `setParams`, `reset` | `setActiveAnnotation` | Remove invalidate from `setActiveAnnotation` — only DOM overlays change (no 3D geometry affected) |
| `useDevControlsStore` | All geometry/view actions | `setActiveHotspot`, `setHighlightedMetric`, `setShowDimensions`, `setTourStep`, `nextTourStep`, `prevTourStep` | Audit: if these only affect React overlays, remove invalidation |
| `useWallLabStore` | Geometry actions | `setColor` (may be needed if 3D material changes) | Verify: does color change affect 3D material or just metadata? |

### B.4 State Leakage Risk

**ZERO stores call `reset()` on unmount.** All global stores (`useLabStore`, `useWallLabStore`, `useNBCPStore`, `useDevControlsStore`) persist state across navigation. If a user modifies parameters → navigates away → returns, previous state is retained. This may be intentional but must be documented per-store.

### B.5 InvalidateBridge vs Per-Action Pattern

| Pattern | Used By | Pros | Cons |
|---------|---------|------|------|
| Per-action `invalidateFn?.()` | createModuleStore, useWallLabStore, useNBCPStore | Selective; UI-only actions can skip | Must remember to add on every new geometry action |
| Subscribe-all `store.subscribe(() => invalidate())` | DevControls InvalidateBridge | Automatic; catches ALL mutations | Over-invalidates for UI-only changes |
| **Recommendation** | — | Per-action (useWallLabStore pattern) | Subscribe-all only for stores where every mutation affects geometry |
