# Component Optimization Audit

## Giant and mixed-responsibility components

### Admin editor stack
- `src/components/admin/unified-editor/UnifiedContentEditor.tsx`
- `src/components/admin/unified-editor/SaveAllBar.tsx`
- `src/components/admin/unified-editor/ContentEditorIndex.tsx`
- `src/components/admin/QuestionsTableClient.tsx`

Observed issues:
- UI composition mixed with autosave, conflict handling, routing sync, and broad data orchestration
- broad client-controller responsibilities
- overlapping server-hydration plus client-refetch behavior

### Notes surfaces
- `src/components/notes/NotesShell.tsx`
- `src/components/notes/QuickCaptureDrawer.tsx`

Observed issues:
- overlapping note hydration, create/select/update, and autosave behavior
- route already server-fetches initial notes, but client surfaces still duplicate orchestration

### 3D controller surfaces
- `src/features/3d-lab/components/ModuleViewer.tsx`
- `src/features/3d-lab/templates/CalculatorTemplate.tsx`
- stairway module/config files under `src/features/3d-lab/config/modules/08-vertical/`

Observed issues:
- controller logic, metadata shaping, config loading, onboarding, and render branching are concentrated in single components/files

## Relative performance and maintainability hotspots

- admin knowledge flow pays for broad server payloads plus follow-up client fetches
- wiki sidebar uses split desktop/mobile hydration paths
- unnecessary client wiki landing page keeps a static route on the client path

## Cleanup direction later

- split controller/orchestration from render composition
- consolidate duplicated hydration and save logic
- serverify where the current code is already static or cache-friendly
- avoid speculative memoization; prioritize structural simplification first

## Linked findings and plans

- findings: `CLN-008`, `CLN-009`, `CLN-010`, `CLN-011`
- plans: `../03_plans/component-optimization-plan.md`, `../03_plans/cleanup-implementation-plan.md`

