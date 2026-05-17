# 04 - Technical Implementation Plan

## Implementation Goal

Add LI as a data-driven 3D Lab interaction profile while preserving PI behavior. The implementation should be incremental, testable, reversible, and should reuse the existing shared viewport/canvas shell.

## 2026-05-13 Optimization Correction

Live-code review confirms the 3D Lab already has a unified route shell and viewport path: `ModuleViewer -> ViewportShell -> LabViewportFrame -> CanvasWrapper -> SceneConfig -> template scene content`.

Implementation should not start by creating a separate `learning` viewport or forking shell/canvas components. The P0 path is to add LI learning objects and slot adapters into the existing template system, beginning with a ramp LI surface that reuses the existing `bp344-accessible-route-ramp` module work.

See `15_3d_lab_pi_li_blast_radius_and_shared_viewport_optimization.md` for the live PI inventory and blast-radius result.

## Live Code Touchpoints To Re-Inspect Before Editing

The source plans and current repo lookup identify these likely touchpoints:

- `src/features/3d-lab/types/templates.ts`
- `src/features/3d-lab/hooks/useTemplateContent.tsx`
- `src/features/3d-lab/components/ModuleCard.tsx`
- `src/features/3d-lab/components/LabBrowser.tsx`
- `src/features/3d-lab/components/LabViewport.tsx`
- `src/features/3d-lab/components/shell/LabViewportFrame.tsx`
- `src/features/3d-lab/components/shell/ViewportShell.tsx`
- `src/features/3d-lab/components/CanvasWrapper.tsx`
- `src/features/3d-lab/components/templates/HotspotAnnotation.tsx`
- `src/features/3d-lab/components/templates/HotspotQuestion.tsx`
- `src/features/3d-lab/components/overlays/HotspotCard.tsx`
- `src/features/3d-lab/components/overlays/DOMOverlayLayer.tsx`
- `src/features/3d-lab/stores/useOverlayStore.ts`
- `src/features/3d-lab/config/registry/cat-01.ts`
- `src/features/3d-lab/config/registry/cat-02.ts`
- `src/features/3d-lab/config/dashboard-visibility.ts`
- `src/features/3d-lab/config/module-paths.ts`
- `src/features/3d-lab/config/registry/index.test.ts`
- `src/features/3d-lab/config/module-paths.test.ts`
- `e2e/authenticated-demo-3d-lab.spec.ts` or the current 3D Lab Playwright spec location

High-blast-radius files to avoid in the first LI PR unless strictly required:

- `src/features/3d-lab/components/shell/ViewportShell.tsx`
- `src/features/3d-lab/components/shell/LabViewportFrame.tsx`
- `src/features/3d-lab/components/CanvasWrapper.tsx`

Before source edits, run the repository's required blast-radius systems for functions/classes/methods being edited. Do not rely on this document as a current code-impact proof.

## Phase 0 - Readiness Gate

Objective: confirm live code still matches the source-plan assumptions.

Actions:

1. Re-read nearest `AGENTS.md` files for `src/features/3d-lab` and `src/app/dashboard/3d-lab`.
2. Inspect template unions, switch statements, registry loaders, overlay store, dashboard filtering, and active tests.
3. Confirm whether `HotspotQuestion` still has zero consumers.
4. Confirm current module registry count and dashboard-visible IDs.
5. Confirm current Playwright 3D Lab test entrypoints.

Exit criteria:

- exact source files to edit are listed,
- stale plan assumptions are corrected,
- blast-radius triad has been run for source symbol edits,
- first implementation PR scope is narrowed.

## Phase 1 - Interaction Metadata Widening

Objective: add LI metadata and learning-object types with no visible behavior change.

Planned changes:

- Add `InteractionMode = 'PI' | 'LI' | 'HYBRID'`.
- Add optional `interactionMode?: InteractionMode` to `ModuleRegistryEntry`.
- Add optional config-level `learningObjects` or equivalent LI payload.
- Add LI source/quiz/comparison/repair object types.
- Do not add `learning` to `TemplateType` in P0 unless the implementation review proves an interaction profile cannot work.
- Add Learning/Hybrid badge metadata separately from the rendering template badge.

Acceptance:

- `bun run type-check` passes.
- Existing tests that touch registry/module metadata pass.
- No LI module is dashboard-visible yet.

## Phase 2 - Hotspot Payload Contract

Objective: let the existing overlay system carry LI hotspot types.

Planned changes:

- Extend hotspot payload shape with optional `hotspotType`.
- Add optional `quizData` and `comparisonData`.
- Add optional answer recording method only if the UI needs persisted quiz state.
- Keep existing hotspots rendering unchanged when no new fields exist.

Acceptance:

- Existing hotspot overlays render unchanged.
- Unit tests cover default info behavior plus quiz/comparison payload rendering.
- No broad overlay rewrite.

## Phase 3 - Learning Slot Adapter and Right Panel

Objective: render LI learning objects in the shared viewport shell without creating a new viewport engine.

Planned new files:

- `src/features/3d-lab/components/learning/LearningHotspotList.tsx`
- `src/features/3d-lab/components/learning/LearningLayerToggles.tsx`
- `src/features/3d-lab/components/learning/LearningObjectPanel.tsx`
- `src/features/3d-lab/components/learning/LearningSourceDrawer.tsx`
- `src/features/3d-lab/components/learning/BoardDrillCard.tsx`
- `src/features/3d-lab/components/learning/index.ts`

Planned modifications:

- Add a learning-object branch inside the relevant existing template case in `useTemplateContent`, starting with `parametric`.
- Avoid changes to `LabViewport` unless live review proves the legacy fallback path is still required for the chosen module.
- Use existing `CanvasWrapper`, `GeometryMesh`/geometry instruction rendering, `HotspotAnnotation`, `DOMOverlayLayer`, and shell slots.

Acceptance:

- LI shell shows viewport plus compact right panel.
- Left sidebar is hidden for LI.
- Camera and toolbar primitives remain shared.
- Layer hiding also hides attached hotspots or marks them unavailable.

## Phase 4 - First MVP Module

Objective: prove one source-grounded LI module end to end.

Recommended first module:

- `bp344-ramp-hotspots`, composed from the existing `bp344-accessible-route-ramp` PI module/config where possible
- category: accessibility
- rendering substrate: existing parametric scene/template path
- route: existing `/dashboard/3d-lab/bp344-ramp-hotspots`

Implementation notes:

- Reuse existing ramp geometry, annotations, violations, and sourceTruth where safe.
- Avoid external GLB unless source/name/entitlement contracts are ready.
- Use 6-8 hotspots max.
- Use source cards from the final truth handoff.
- Keep the existing PI ramp module functional and visible according to current `DASHBOARD_VISIBLE_IDS`.

Acceptance:

- Dashboard card appears only when feature flag and visibility allow it.
- Card opens module route.
- Hotspots open info/quiz/comparison content.
- Layer toggles work if included.
- PI ramp module still works.

## Phase 5 - Additional MVP Modules

Add:

- `bp344-toilet-hotspots`
- `egress-stair-hotspots`

Acceptance:

- Each module has source-card-backed hotspots.
- Each has at least one quiz hotspot.
- Each has static fallback plan before public release.
- Each passes focused route and interaction tests.

## Phase 6 - Coverage and Remediation Integration

Objective: connect LI to wider SlateCamp learning system.

Deferred until MVP modules prove the interaction profile:

- `/dashboard/3d-lab?view=coverage`
- weak-topic-to-hotspot links,
- Wiki article/source card deep links,
- quiz remediation mini-drill links,
- analytics/progress recording.

## Rollback Strategy

| Phase | Rollback |
| --- | --- |
| Interaction metadata widening | Remove LI metadata, learning-object types, and badge handling. |
| Hotspot payload extension | Remove optional LI fields; existing fields remain. |
| Learning components | Delete new `components/learning` files and remove the learning-object adapter branch. |
| Module configs | Remove LI module registry entries and dashboard-visible IDs. |
| Dashboard filter | Hide behind feature flag or remove chips; cards still work. |

## Verification Commands

Use exact scripts from `package.json` at implementation time:

- `bun run type-check`
- targeted `bun test src/features/3d-lab/...`
- `bun run test:e2e:auth-demo:3d-lab`
- `bun run lint` when source/style/workflow changes require it
- `bun run perf:3d:smoke` or current focused 3D smoke gate before release candidate
- `git diff --check`
