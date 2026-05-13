# 04 - Technical Implementation Plan

## Implementation Goal

Add LI as a data-driven 3D Lab module mode while preserving PI behavior. The implementation should be incremental, testable, and reversible.

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

## Phase 1 - Type and Template Widening

Objective: add LI types with no visible behavior change.

Planned changes:

- Add `InteractionMode = 'PI' | 'LI'`.
- Add optional `mode?: InteractionMode` to `ModuleRegistryEntry`.
- Add `learning` to `TemplateType`.
- Add `LearningSceneConfig`, `LearningLayerDef`, and `LearningHotspot`.
- Add `learning` to module config union if needed.
- Add `learning` shell defaults with right panel only and no left sidebar.
- Add `learning` template metadata for cards.

Acceptance:

- `bun run type-check` passes.
- Existing tests that touch registry/template metadata pass.
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

## Phase 3 - Learning Renderer and Right Panel

Objective: render LI configs in the shared viewport shell.

Planned new files:

- `src/features/3d-lab/components/learning/LearningSceneRenderer.tsx`
- `src/features/3d-lab/components/learning/LearningHotspotList.tsx`
- `src/features/3d-lab/components/learning/LearningLayerToggles.tsx`
- `src/features/3d-lab/components/learning/index.ts`

Planned modifications:

- Add `learning` case in `useTemplateContent`.
- Add `learning` handling in `LabViewport` if still needed.
- Use existing `CanvasWrapper`, `GeometryMesh`/geometry instruction rendering, `HotspotAnnotation`, `DOMOverlayLayer`, and shell slots.

Acceptance:

- LI shell shows viewport plus compact right panel.
- Left sidebar is hidden for LI.
- Camera and toolbar primitives remain shared.
- Layer hiding also hides attached hotspots or marks them unavailable.

## Phase 4 - First MVP Module

Objective: prove one source-grounded LI module end to end.

Recommended first module:

- `bp344-ramp-hotspots`
- category: accessibility
- template: `learning`
- route: existing `/dashboard/3d-lab/bp344-ramp-hotspots`

Implementation notes:

- Use programmatic geometry first.
- Avoid external GLB unless source/name/entitlement contracts are ready.
- Use 6-8 hotspots max.
- Use source cards from the final truth handoff.
- Keep existing PI ramp module separate.

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

Deferred until MVP modules prove the template:

- `/dashboard/3d-lab?view=coverage`
- weak-topic-to-hotspot links,
- Wiki article/source card deep links,
- quiz remediation mini-drill links,
- analytics/progress recording.

## Rollback Strategy

| Phase | Rollback |
| --- | --- |
| Types/template widening | Remove `learning` union entries and defaults. |
| Hotspot payload extension | Remove optional LI fields; existing fields remain. |
| Learning components | Delete new `components/learning` files and switch case. |
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
