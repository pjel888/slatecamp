# SlateCamp 3D Lab — Repo-Level Audit & Implementation Plan  
_Working Draft – tailored for:_  
- `/slatecamp-3d-arch-diagram-modeler`  
- `/slatecamp-3d-parametric-engine`  
- `/slatecamp-r3f-api-master`  
- `/slatecamp-ux-designer`  
- `/slatecamp-ux-researcher`  

> This document assumes 01_master_architecture.md, 02_phase_tracker-2.md, 03_regulatory_ledger-3.md, 04_ux_ui_gatekeeper-4.md, and 3DMI-audit_and_implementation-7.md are **source of truth** for rules, phases, and acceptance gates. [file:28][file:27][file:30][file:29][file:33]

---

## 0. Scope & Principles

**Goal**  
Prepare the SlateCamp 3D Lab for massive 3D module expansion while guaranteeing:  
- Zero regression on existing modules and legacy scenes  
- Zero-hallucination compliance for all parametric building code logic  
- A single, governed 3D runtime and UX layer for both existing and new modules [file:33][file:30]

**Non‑negotiable global rules (imported from Master Architecture)**  
- **2D DOM-only text rendering**: No text, labels, tooltips, or annotations rendered inside Canvas. Drei `<Html>` and `<Text>` are banned except in DevControls. [file:33][file:28]  
- **Single Canvas pattern** via tunnel-rat + SceneTunnel, with frameloop="demand" and invalidation bridge. [file:33][file:28]  
- **Immutable APIs**: `createModuleStore`, `ModuleStoreState`, `TemplateType`, `ModuleRegistryEntry`, `SceneTunnel`, `useRegisterInvalidate`, `SceneInvalidator`, quiz gesture components, and config registry are locked and must not be broken. [file:28][file:33]  
- **Zero-hallucination regulatory policy**: No new parametric bound is allowed without a verifiable law citation or an explicit “pedagogical / UX-arbitrary” tag. [file:30]

---

## 1. Repo-by-Repo Audit Template

Use this template as a **checklist** when inspecting each repo. Capture findings inline under each section.

### 1.1 `/slatecamp-r3f-api-master` — 3D Runtime & Scene Platform

**Mission**  
Own the shared 3D runtime for all SlateCamp 3D modules: Canvas host, scene shell, WebGL lifecycle safety, camera/controls presets, invalidation bridge, overlays infrastructure, and performance monitoring. This repo is where F-01–F-03, F-06, F-09, F-13, F-14, F-17, F-19, F-20 are implemented and governed. [file:33][file:28][file:27][file:29]

#### A. Inventory & Ownership

1. List all Canvas hosts and scene shells:  
   - `LabViewportFrame.tsx` (canonical host)  
   - `CanvasWrapper.tsx` (legacy, currently broken props)  
   - `DevControlsCanvas` (independent runtime, must stay untouched)  
   - Any calculator-specific Canvas wrappers. [file:33][file:28]

2. Confirm **single-Canvas policy**:  
   - All 3D Lab modules (templates + standalone scenes) should ultimately run through **one** shared Canvas shell and SceneConfig.  
   - DevControls remains its own isolated Canvas by contract. [file:28][file:29]

3. Map all R3F “platform pieces”:  
   - `SceneBase`, `StudioLighting`, ground plane, sky/fog, shadow, tone mapping.  
   - `useRegisterInvalidate`, `SceneInvalidator`.  
   - (Future) `WebGLErrorBoundary`, `useDisposeOnUnmount`, `useWebGLMemoryMonitor`. [file:33][file:27]

> **Output:** A short “Runtime Ownership” table listing each file, its current status (OK/BROKEN/LEGACY), and which phase will touch it (P1–P9). [file:33][file:27]

#### B. Canvas & SceneConfig audit

1. Verify F-01 / F-06 baseline from 3DMI:  
   - `CanvasWrapperProps` currently declares ~15 props but uses only `children`. This is the “dead props” critical finding. [file:33]  
   - 3 divergent Canvas configs exist (LabViewportFrame, DevControls, CalculatorTemplate). [file:33]

2. Plan P1 changes (from Phase Tracker): [file:27]  
   - Create `rendering/SceneConfig.tsx` as the **only** way to configure: DPR, camera type/FOV, lighting preset, shadows, tone mapping, clearColor.  
   - Strip dead props from `CanvasWrapper` and replace with a single `sceneConfig` prop.  
   - Refactor `LabViewportFrame` to consume `SceneConfig` and remove hardcoded config.  
   - Delete template-level re-exports `templates/CanvasWrapper.tsx` and `templates/GlobalCanvasPortal.tsx`. [file:27][file:28]

3. Acceptance (Phase 1 gate): [file:29]  
   - `grep CanvasWrapperProps` shows only `children` + `sceneConfig`.  
   - No template passes “dead” props.  
   - Visual compare of cameras against Phase 0 screenshots passes.

> **Decision:** All future 3D repos must treat `/slatecamp-r3f-api-master` `SceneConfig` as the **only** authority for 3D runtime parameters (no local `<Canvas>` with custom props). [file:28][file:27]

#### C. WebGL safety & lifecycle

1. Implement F-02 / F-03 in this repo: [file:33][file:27]  
   - `WebGLErrorBoundary.tsx` class/FC that:  
     - Catches render errors and context loss (`WEBGL_lose_context` listener).  
     - Displays a retry UI and allows re-mount of the Canvas.  
   - `useDisposeOnUnmount` hook that disposes imperative objects only (R3F auto-disposes JSX, per master doc guidance). [file:28][file:33]

2. Add `useWebGLMemoryMonitor` (dev-only):  
   - Poll `gl.info.memory` across module switches to catch VRAM leaks. [file:33][file:27]

3. Wire it in:  
   - Wrap `LabViewportFrame` Canvas in `WebGLErrorBoundary`.  
   - Add `useDisposeOnUnmount` to all 13 scene components listed in Phase 2. [file:27][file:33]

4. Acceptance (Phase 2 gate): [file:29]  
   - Injected context loss displays retry UI instead of white screen.  
   - `gl.info.memory.geometries` stays bounded across 10 rapid module switches.

#### D. Invalidation & frameloop governance

1. Study current invalidation patterns:  
   - `useRegisterInvalidate`, `SceneInvalidator`, all 50+ `invalidateFn?.()` call sites. [file:33][file:28]  
   - Note that `setActiveAnnotation` currently over-invalidates, firing full scene refresh for DOM-only changes. [file:33]

2. Implement P5 rules (Store Lifecycle Isolation): [file:27][file:33]  
   - Restrict invalidation to geometry-affecting actions only.  
   - Keep `frameloop="demand"` but ensure idle scenes return to zero GPU usage after animations settle (paired with P7 animation completion). [file:33][file:27]

3. Acceptance:  
   - Profiling shows no Canvas re-render on purely DOM actions (annotation selection, overlay-only UI). [file:29]

#### E. Performance monitoring & mobile

1. Normalize DPR and performance:  
   - Extract PerformanceMonitor usage from DevControlsCanvas into `SceneConfig` presets. [file:33][file:27]  
   - Implement F-13 (shared PerformanceMonitor) and F-17 (mobile DPR + `touch-action: none`). [file:33][file:27]

2. Add a **central camera preset registry** (`camera-presets.ts`):  
   - Consolidate DevControls’ `CAMERA_PRESETS` and calculator `getCalcCameraPresets` into a single exported registry. [file:33][file:27]

3. Acceptance (Phase 7–8 gates): [file:29]  
   - `useFrame` callbacks stop when animations settle.  
   - Mobile orbit no longer scrolls the page, and DPR is reduced on mobile.

---

### 1.2 `/slatecamp-3d-parametric-engine` — Geometry & Code Logic

**Mission**  
Provide a pure, testable, and law-verified parametric engine for all 3D modules. This repo should contain **no** React or R3F; only TypeScript geometry functions, parametric bounds, and validation logic that import from shared legal constants and respect the regulatory ledger. [file:33][file:30]

#### A. Inventory & layers

Map all geometry functions and classify them by the 3 computational layers: [file:33][file:30]

- **L1 Procedural Geometry**: builds shapes from inputs (stairs, ramps, lots, envelopes).  
- **L2 Parametric Bounding Boxes**: invisible collision volumes enforcing clearances and reach volumes.  
- **L3 Real-Time Data Binding**: outputs used directly by UI dashboards and scorecards.

> **Output:** Table: `functionName` → `moduleId` → layers (L1/L2/L3) → law category (PD 1096, BP 344, RA 9514, etc.). [file:33][file:30]

#### B. Legal constants & citations

1. Implement the constants files defined in the ledger: [file:30][file:33]  
   - `config/constants/pd-1096.ts`  
   - `config/constants/ra-9514.ts`  
   - `config/constants/bp-344.ts`  
   - `config/constants/nscp.ts`  
   - `config/constants/bp-220-pd-957.ts`  
   - `config/constants/index.ts` (barrel export).

2. Enforce `LegalCitation` usage:  
   - Add `LegalCitation` and `ValueClassification` types to the parametric engine’s public interfaces (mirroring templates’ types). [file:30][file:33]  
   - For each `ParameterDef` and `ViolationRule` consumed by this engine, require at least:  
     - `classification` (code-mandated, code-derived, pedagogical, ux-arbitrary)  
     - `citation` for the first two. [file:30]

3. Hook up the audit script:  
   - Ensure `scripts/audit-legal-citations.ts` can scan all engine configs and output: % of parameters cited, violations cited, uncited constants. [file:33][file:30]

4. Acceptance (Regulatory track gate): [file:27][file:29]  
   - `bun run auditcitations` runs without errors and reports baseline compliance.  
   - All code-mandated values in newly added modules have citations.

#### C. Engine contracts for templates

1. Define a stable `GeometryContract` and `ValidationContract` that all templates consume: [file:33]  
   - `GeometryContract`: input params, output `GeometryInstruction[]`, derived metrics, bounding volumes.  
   - `ValidationContract`: list of violations with severity, codes, citations, and recommended fix.

2. Confirm that the engine never hardcodes Canvas behavior:  
   - No algorithm here can assume camera, lighting, or UI; everything is expressed as pure parametric outputs. [file:28][file:33]

3. Acceptance:  
   - All template geometry functions consume this engine contract instead of duplicating logic per template. [file:33]

---

### 1.3 `/slatecamp-3d-arch-diagram-modeler` — Product Workflows & Scenes

**Mission**  
Own the **product-level** workflows for 3D architectural diagrams (envelopes, floor plans, cutaways, animated sequences, etc.) using the shared engine and runtime. This repo implements templates, module configs, and UX flows, but not the runtime or raw geometry math. [file:33][file:28]

#### A. Template structure audit

Use the structural comparison from Master Architecture and 3DMI: [file:28][file:33]

Current template map (from master doc):

| Template        | Entry Component               | Scene Component               | Store Pattern              | Configs |
|----------------|-------------------------------|-------------------------------|----------------------------|---------|
| `parametric`   | `ParametricScene.tsx`         | `ParametricSceneRenderer.tsx` | `createModuleStore`        | 120     |
| `exploded`     | `ExplodedAssembly.tsx`        | `ExplodedAssemblyScene.tsx`   | `createModuleStore`        | 25      |
| `floorplan`    | `FloorPlanWalkthrough.tsx`    | `FloorPlanScene.tsx`          | `createModuleStore`        | 15      |
| `cutaway`      | `CutawaySection.tsx`          | `CutawaySectionScene.tsx`     | `createModuleStore`        | 10      |
| `animated`     | `AnimatedSequence.tsx`        | `AnimatedSequenceScene.tsx`   | `createModuleStore`        | 10      |
| `calculator`   | `CalculatorTemplate.tsx`      | per-tool scenes               | per-tool stores            | 4 tools |
| `wall-config`  | `WallConfiguratorTemplate.tsx`| `WallConfiguratorRenderer.tsx`| `useWallLabStore`          | 1 tool  |

> **Task:** For each template, confirm:  
> - Uses `SceneConfig` via `LabViewportFrame`.  
> - Uses `LabPanelLayout` where possible instead of absolute overlays (F-23).  
> - No direct `<Canvas>` usage. [file:33][file:28]

#### B. Overlay & annotation system (Phase 3)

This repo is where F-04, F-05, F-07, F-20, F-25 get fixed via the new overlay system. [file:33][file:27]

1. Implement overlay infrastructure:  
   - `scene-colors.ts` for all 3D colors (no hardcoded hex in templates).  
   - `useOverlayStore.ts` Zustand store for overlay items (labels, badges, tooltips).  
   - `useWorldToScreen.ts` hook for Vector3 → screen coordinates.  
   - `DOMOverlayLayer.tsx`, `CameraSync.tsx`, `LabelOverlay.tsx`, `ViolationBadge.tsx`, `PartTooltip.tsx`, `HotspotCard.tsx`. [file:27][file:33]

2. Migrate current violations:  
   - Remove all `<Html>` usage from:  
     - `ExplodedAssemblyScene.tsx`, `CutawaySectionScene.tsx`, `FloorPlanScene.tsx`, `AnimatedSequenceScene.tsx`, `HotspotAnnotation.tsx`, `HumanSilhouette.tsx`, `ViolationIndicator.tsx`. [file:33]  
   - Scenes write world positions into `useOverlayStore`; overlays render in a sibling DOM layer.

3. Overlay behavior spec:  
   - All overlays must respect severity colors and law tags.  
   - Overlapping labels handled by `OverlayManager` (culling or priority-based z-order). [file:33][file:29]

4. Acceptance (Phase 3 gate): [file:29]  
   - Zero `<Html>`/`<Text>` usage in 3D Lab (excluding DevControls).  
   - All text appears as real DOM elements, visible in Elements panel.  
   - All scene ground planes use shared `GroundPlane.tsx` and `SCENE_COLORS`.

#### C. Store & lifecycle normalization (Phase 5 & 9)

1. Fix F-11, F-21, F-24 across templates: [file:33][file:27]  
   - Split `useLabStore` into navigation/progress/view stores.  
   - Add `resetOnUnmount` to `createModuleStore`.  
   - Fix ExplodedAssembly & AnimatedSequence `useMemo` deps to include `config.id` and stabilize defaults. [file:33]

2. Add template-level error and empty states (F-22, F-25): [file:33][file:27]  
   - `SceneErrorBoundary.tsx` and `SceneEmptyState.tsx` used by all templates.  
   - Ensure blank Canvas is never shown without explanation.

3. Acceptance (Phase 9 gate): [file:29]  
   - Navigation between modules shows no stale state for exploded/animated templates.  
   - Intentional errors are caught and show retry UI.  
   - No ESLint disables in `templates/` for hooks.

#### D. Module rollout alignment

Align this repo’s roadmap with the 500-series schedule and L1–L3 layers: [file:33]

- Build/repair modules in **Build Phase 0** using the new architecture: Site Dev Controls, Stairway Configurator, Unified Wall Configurator, Flooring Visualizer.  
- Then follow Waves 1–4 as defined in 3DMI and Phase Tracker, ensuring each new module picks a template type and uses the shared overlay + engine contracts. [file:33][file:27]

---

### 1.4 `/slatecamp-ux-designer` — UI Kit & 3D UX Patterns

**Mission**  
Act as the **UI and UX source of truth** for all 3D-related components and patterns: Lab layout, controls, overlays, panels, status messages, and regression checklists. This repo must bridge the web design-system rules (typography, color, layout) with 3D-specific UX rules. [file:29][file:31][file:32]

#### A. Design tokens & 3D alignment

1. Confirm that 3D Lab uses the same design tokens as the Campfire design system:  
   - Color tokens used instead of hex in overlays and panels.  
   - Severity and code family colors (e.g., red = Fire Code, orange = Housing, blue/green = guidance). [file:33][file:29]

2. Ensure `scene-colors.ts` is derived from the main token system, not hardcoded hex. [file:28][file:33]

#### B. 3D component library & Flowbite integration

1. Align with `flowbite-integration-and-component-optimization-5.md`: [file:31]  
   - Decide which 3D-specific UI components are built as Campfire primitives vs. Flowbite wrappers, e.g.,:  
     - Lab toolbars, panels, tabbed inspectors, validation legends, empty/error states.

2. Maintain `regression-checklist-6.md` as the standard for 3D UX regression: [file:32]  
   - Expand it to cover 3D specifics like overlay legibility, camera controls, mode indicators, and violation color semantics.

#### C. UX rules for 3D

Codify 3D UX rules here (not the Lab repo): [file:29][file:33]

- One consistent camera grammar and presets across all modules.  
- One selection model (single/multi, keyboard modifiers, hover rules).  
- One language for violation overlays (severity, code family, shapes).  
- One inspector pattern for param editing and dimension display.  
- Required states: loading, empty, partial, error, and “unsupported device”.  

> **Output:** `3d-ux-rules.md` living document referenced before every 3D change.

---

### 1.5 `/slatecamp-ux-researcher` — Evidence & Validation

**Mission**  
Provide the evidence base: task analysis, observation logs, usability issues, and severity ratings for all 3D interactions. This repo should determine **which UX issues get prioritized** during architecture phases and which are deferred. [file:29][file:33]

#### A. Connect research to phases

- Map each of the 25 findings (F-01–F-25) to UX-research evidence:  
  - Which ones are user-visible pain vs. purely technical debt?  
  - For example, F-04 (in-canvas annotations) has both performance and accessibility research backing; it’s Phase 3 critical. [file:33][file:29]

#### B. Define evaluation plans

For each architecture phase and each rollout wave, define: [file:27][file:29]

- Task scripts to test (e.g., “Use MOD-302 to check travel distance in a sprinklered corridor”).  
- Metrics to collect (time, errors, misinterpretations, camera confusion).  
- Exit criteria per wave (e.g., no user misreads a red vs. orange violation).

---

## 2. Cross-Repo Implementation Plan (Condensed)

This aligns repos with the existing architecture phases and waves. [file:27][file:33][file:29]

### Phase 0 – Pre-Flight

- Run `bun run type-check`, `bun run build`.  
- Record `gl.info.memory` baselines and regression screenshots.  
- Confirm no changes to configs/registry/taxonomy during P0–P9. [file:27][file:29]

### Phase 1 – SceneConfig & CanvasWrapper

- Work mainly in `/slatecamp-r3f-api-master` and `/slatecamp-3d-arch-diagram-modeler`.  
- Fix F-01, F-06, F-13, F-15 (dead props, Canvas divergence, shared PerformanceMonitor, duplicate exports). [file:33][file:27]

### Phase 2 – WebGL Lifecycle Safety

- R3F runtime repo implements error boundary, disposal hook, memory monitor.  
- 3D Lab repo updates scenes to use new hooks.  
- Fix F-02, F-03. [file:33][file:27]

### Phase 3 – DOM-Only Overlays & Colors

- Lab repo implements overlay system and `scene-colors.ts`.  
- UX Designer repo defines overlay patterns and severity styles.  
- Fix F-04, F-05, F-07, F-20. [file:33][file:27][file:29]

### Phase 4–9 – Lighting, Stores, Assets, Animations, Mobile, Templates

- R3F runtime: lighting presets, camera presets, mobile behavior, animation completion.  
- Lab: store splits, reset, error/empty states, template normalization.  
- UX Designer: ensures consistent layout and states.  
- Fix remaining findings F-08–F-25 per Phase Tracker. [file:27][file:33][file:29]

### Regulatory Track (Parallel)

- Parametric engine + Lab + Regulatory Ledger repos:  
  - Add `LegalCitation` and constants.  
  - Wire `audit-legal-citations.ts`.  
  - Migrate PD 1096 and RA 9514 modules first. [file:30][file:33][file:27]

### Module Waves

- Only after P0–P2 (and especially P3) are complete do new modules proceed through Waves 1–4. [file:27][file:33]  
- Each new module must:  
  - Use an existing template type (or one of the three new ones once built).  
  - Conform to overlay rules (no Html).  
  - Import legal constants instead of hardcoding.  
  - Pass UX/UI gatekeeper checks. [file:33][file:29][file:30]

---

## 3. How to Use This Document

- Before touching any repo, read:  
  - `01_master_architecture.md` (immutable rules)  
  - `04_ux_ui_gatekeeper-4.md` (gates)  
  - This document for repo-specific focus. [file:28][file:29]

- For each repo:  
  1. Duplicate the relevant section.  
  2. Fill in **Inventory & Ownership** tables.  
  3. Mark which findings apply and in which phase they will be addressed.  
  4. Use `02_phase_tracker-2.md` to track status and blockers. [file:27][file:33]

- Do not modify 01_master_architecture.md; update only Phase Tracker and implementation code. [file:28][file:27]

---

If you want, I can next generate **repo-specific filled-in versions** (e.g., a concrete `/slatecamp-r3f-api-master_AUDIT.md` with the tables already pre-populated from the 3DMI findings so you can drop them straight into each repo.  
