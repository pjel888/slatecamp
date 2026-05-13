# 15 - 3D Lab PI/LI Blast Radius And Shared Viewport Optimization

Date: 2026-05-13
Status: active plan correction

## Purpose

This addendum reconciles the LI plan with the live 3D Lab implementation. The key correction is that SlateCamp already has a unified 3D Lab shell and viewport stack. LI should reuse that shared PI infrastructure instead of creating a separate viewport, canvas, or route shell.

## Evidence Used

Live files inspected:

- `src/app/dashboard/3d-lab/page.tsx`
- `src/app/dashboard/3d-lab/[moduleId]/page.tsx`
- `src/features/3d-lab/components/ModuleViewer.tsx`
- `src/features/3d-lab/components/shell/ViewportShell.tsx`
- `src/features/3d-lab/components/shell/LabViewportFrame.tsx`
- `src/features/3d-lab/components/CanvasWrapper.tsx`
- `src/features/3d-lab/hooks/useTemplateContent.tsx`
- `src/features/3d-lab/types/templates.ts`
- `src/features/3d-lab/config/registry/index.ts`
- `src/features/3d-lab/config/module-paths.ts`
- `src/features/3d-lab/config/dashboard-visibility.ts`
- `.ai/00_performance/39_3d_lab_module_smoke_and_mobile.md`
- `.ai/00_performance/41_3d_lab_layout_and_controls_unification.md`

Live commands run:

- registry/config import inventory with `bun`
- code-review-graph minimal context, impact radius, and affected flows
- ChunkHound regex search through a temporary database copy because the live ChunkHound MCP process held the repo database lock
- GitNexus metadata and CLI availability checks

## Live Architecture Finding

The current module route already uses a shared structure:

```text
/dashboard/3d-lab/[moduleId]
-> ModuleViewer
-> ViewportShell
-> LabViewportFrame
-> SceneTunnel
-> CanvasWrapper
-> SceneConfig
-> template scene content
```

Important live details:

- `ModuleViewer` calls `useTemplateContent` before render branching and wraps template canvas content in `LabViewportFrame`.
- `ViewportShell` owns header, sidebars, toolbar overlay, status bar, mobile bottom sheet, context menu, command palette, and recovery overlays.
- `LabViewportFrame` owns the actual R3F `Canvas`, DPR/performance monitor, WebGL support check, context error boundary, slow-scene notice, and DOM overlay layer.
- `CanvasWrapper` portals scene content into the shared frame through `SceneTunnel.In`, then applies `SceneConfig`, camera sync, and scene ground.
- `useTemplateContent` is already the slot adapter that maps each rendering template into shell sidebars, toolbar extras, status content, layers content, and canvas content.

This means the existing PI system is already optimized around shared infrastructure. LI should become another interaction profile inside this slot architecture.

## Existing PI Module Reality

Current registry inventory from live imports:

| Metric | Value |
| --- | ---: |
| Registry entries | 210 |
| Configs successfully imported | 210 / 210 |
| Parametric modules | 75 |
| Animated modules | 15 |
| Cutaway modules | 50 |
| Floorplan modules | 29 |
| Exploded modules | 37 |
| Calculator modules | 4 |
| Dashboard-visible modules today | 5 |

Dashboard-visible modules today are allowlisted in `DASHBOARD_VISIBLE_IDS`:

| Module | Template | Status | LI relevance |
| --- | --- | --- | --- |
| `site-development-controls` | parametric | ready | Strong PI base, but too broad for first LI release |
| `stairway-configurator` | parametric | ready | Strong egress/stair LI candidate, higher complexity |
| `calculator-flooring` | calculator | built | Not a P0 LI spatial-code module |
| `unified-wall-configurator` | parametric | ready | Good later materials LI candidate |
| `bp344-accessible-route-ramp` | parametric | built | Best P0 ramp LI seed because it has sourceTruth, violations, and annotations |

Plan correction: the first LI ramp should reuse the existing `bp344-accessible-route-ramp` geometry/source work. The public LI slug can still be `bp344-ramp-hotspots`, but implementation should compose from the existing ramp config rather than starting from a new 3D scene.

## Blast Radius Result

### GitNexus

GitNexus is present on disk, but the index is stale:

- current `HEAD`: `cf95ddad45b0e18ed1fe84351b08bf5fe684c392`
- `.gitnexus/meta.json` indexed commit: `41bce18b45db1eb3235394abcca7bba66458a0da`

The GitNexus MCP tools were not available through tool discovery, and `npx gitnexus status` failed with `gitnexus: command not found`. Therefore this addendum does not claim a complete GitNexus blast-radius proof. The first implementation run must refresh or restore GitNexus before editing source symbols.

### code-review-graph

Shared viewport touch set analyzed:

- `ModuleViewer.tsx`
- `useTemplateContent.tsx`
- `templates.ts`
- `ViewportShell.tsx`
- `LabViewportFrame.tsx`
- `CanvasWrapper.tsx`
- `registry/index.ts`
- `module-paths.ts`

Result:

- 23 directly changed nodes if those files are edited together
- 523 impacted nodes within two hops
- 155 additional files affected
- 11 affected flows
- key affected flow: `LabModulePage`
- other affected surfaces include admin 3D model registry, wiki `Lab3DWidget`, legacy workspace path, module path tests, registry tests, and 3D performance Playwright specs

Risk interpretation: editing shared viewport/frame/shell files is high blast radius. Do not touch `ViewportShell`, `LabViewportFrame`, or `CanvasWrapper` for the first LI implementation unless absolutely necessary.

### ChunkHound

ChunkHound search corroborated:

- `DevControlsCanvas` now states canvas, camera, controls, DPR, and pointer/control mapping are owned by `LabViewportFrame`, `CanvasWrapper`, and `SceneConfig`.
- `ViewportShell` is the single shell container for active 3D Lab modules.
- `.ai/00_performance/41_3d_lab_layout_and_controls_unification.md` records prior proof that active module routes use the shared shell/control contract.
- Performance docs show previous full-route smoke, mobile-emulated WebGL, fallback, layout, and interaction consistency evidence.

Operational note: direct ChunkHound access initially failed because `.chunkhound/db` was locked by the running `chunkhound mcp` process. A temporary copied DB was used for read-only searches.

## Optimization Decision

LI should not be a new viewport system.

LI should be a learning interaction profile layered into existing rendering templates:

- `templateType` remains the rendering substrate: parametric, cutaway, floorplan, exploded, animated, calculator, wall-configurator.
- `interactionMode` or equivalent metadata distinguishes PI, LI, and hybrid modules.
- `learningObjects` or equivalent config carries topic atlas entries, hotspot payloads, source cards, quiz prompts, comparison rows, and repair steps.
- `useTemplateContent` remains the adapter that slots learning panels into `ViewportShell`.
- `LabViewportFrame`, `CanvasWrapper`, `SceneConfig`, and `ViewportShell` remain unchanged in the first LI PR.

This keeps the first implementation smaller, reduces WebGL risk, and leverages existing 3D performance gates.

## Revised Implementation Shape

### Phase A - Source-Safe Inventory

Before code edits:

1. Refresh or restore GitNexus and rerun impact on symbols to edit.
2. Re-run code-review-graph impact for the narrowed file set.
3. Run ChunkHound search for the narrowed file set.
4. Confirm current `DASHBOARD_VISIBLE_IDS`.
5. Confirm current 3D performance script names in `package.json`.

### Phase B - LI Metadata Without A New TemplateType

Preferred first implementation:

- Add optional registry metadata such as `interactionMode?: 'PI' | 'LI' | 'HYBRID'`.
- Add optional config-level learning payload such as `learningObjects`.
- Do not add `learning` to `TemplateType` in P0.
- Update registry metadata tests for the new metadata key.
- Update module cards to show Learning/Hybrid as a second badge, not as the rendering template badge.

Rationale: `TemplateType` is a renderer contract. LI is an interaction contract.

### Phase C - Learning Slot Components

Add new LI content components without changing the frame:

- `LearningObjectPanel`
- `LearningTopicAtlas`
- `LearningSourceDrawer`
- `BoardDrillCard`
- `LearningRepairStep`

These should render inside existing shell slots:

- left sidebar: optional topic atlas
- right sidebar: learning object list and active object detail
- layers panel: optional source/layer filters
- canvas overlay: hotspot markers through existing overlay infrastructure

### Phase D - First Hybrid Ramp Module

Use `bp344-accessible-route-ramp` as the geometry/source seed.

Implementation options:

1. Create a new dashboard-visible module slug, `bp344-ramp-hotspots`, that composes/reuses the existing ramp geometry and sourceTruth.
2. Or introduce a route/query profile for `bp344-accessible-route-ramp`, only if route state handling is already clean and testable.

Default recommendation: use a new module slug that reuses code. This avoids changing route search-param behavior and keeps student navigation clear.

### Phase E - Broaden Only After Ramp Proof

Next candidates:

- `ramp-accessible-toilet`
- `accessible-toilet-detailed`
- `wheelchair-maneuvering`
- `stairway-configurator`

Do not promote these until sourceTruth/source-card coverage is ready. Many modules have violations and annotations but do not yet have `sourceTruth`.

## No-Go Rules For First LI PR

- Do not create a second R3F `Canvas` for LI.
- Do not fork `ViewportShell`.
- Do not fork `LabViewportFrame`.
- Do not add a second global camera/control provider.
- Do not activate inactive legacy scenes with direct controls.
- Do not make broad 210-module dashboard changes as part of the first LI module.
- Do not claim source-backed learning unless the source card ID, locator, and review status are present.

## Verification Updates

First LI implementation should run, at minimum:

- `bun test src/features/3d-lab/config/registry/index.test.ts`
- `bun test src/features/3d-lab/config/module-paths.test.ts`
- focused LI component tests
- `bun run type-check`
- `bun run perf:3d:layout-audit`
- `bun run perf:3d:controls-audit`
- focused route smoke for `bp344-accessible-route-ramp`
- focused route smoke for the new LI ramp route
- `git diff --check`

Release-candidate LI work should also run the 3D smoke/mobile/gates scripts from current `package.json`.

## Updated Verdict

Yes, the plan can improve. The win is to stop thinking of PI and LI as separate module engines. They should share the same viewport, canvas, camera, overlay, shell, and performance gates.

The first LI build should be a learning adapter over existing PI/module infrastructure, beginning with the source-backed BP 344 ramp work. Refactoring the shared shell before proving one LI lesson would spend risk in the wrong place.
