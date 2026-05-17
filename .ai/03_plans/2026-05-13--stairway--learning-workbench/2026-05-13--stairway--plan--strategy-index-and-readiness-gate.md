# Stairway Learning Workbench — Strategy Index and Readiness Gate

Date: 2026-05-13
Status: final planning index before implementation

## 1. Document set

Use these documents together. Do not implement from only one file.

1. Research and strategy foundation
   - `.ai/03_plans/2026-05-13-stairway-configurator-3d-learning-ux-research-plan.md`

2. Exact implementation specification
   - `.ai/03_plans/2026-05-13-stairway-learning-workbench-implementation-spec.md`

3. UX wireflows and interaction states
   - `.ai/03_plans/2026-05-13-stairway-learning-workbench-ux-wireflows.md`

4. Pedagogy, curriculum, and copy specification
   - `.ai/03_plans/2026-05-13-stairway-learning-workbench-pedagogy-copy-spec.md`

5. Technical execution, testing, and source audit specification
   - `.ai/03_plans/2026-05-13-stairway-learning-workbench-technical-execution-and-source-audit-spec.md`

## 2. Strategic verdict

The strategy is now implementation-ready for Phase 1 only.

Phase 1 means:
- add dedicated stairway workbench layout path;
- create stairway-specific panel skeletons;
- widen/restructure panels;
- preserve live compliance behavior;
- collapse advanced controls;
- add diagnosis/status summary;
- no source-backed legal claims yet;
- no full challenge engine yet.

The strategy is not yet implementation-ready for:
- exact source-backed citation display;
- final exam-question engine;
- full Learn/Diagnose/Compare/Challenge sequencing;
- production sourceTruth gating;
- source quote display.

Those require source audit and later implementation slices.

## 3. Phase 1 readiness gate

A builder may begin Phase 1 only if all are true:

- [x] Product direction is approved: dedicated Stairway Learning Workbench.
- [x] Current route and code architecture have been inspected.
- [x] Relevant Vitruvius raw source folders have been located.
- [x] Implementation file targets are identified.
- [x] Non-goals are documented.
- [x] First implementation slice is constrained.
- [x] Validation commands are defined.
- [x] Legal/source limits are defined.
- [x] User explicitly approved planning-first approach.

## 4. Required builder prompt summary

Use this when delegating implementation:

“Implement Phase 1 of the Stairway Learning Workbench only. Read the five `.ai/03_plans/2026-05-13-stairway-*` documents first. Add a `stairway-configurator` special path in `useTemplateContent.tsx`, create stairway-specific left/right/status panel skeletons, widen/restructure sidebars, preserve existing geometry and compliance behavior, collapse advanced control groups by default, and show a diagnosis/status summary. Do not rewrite computation/geometry, do not add sourceTruth, do not present source-backed legal claims, do not remove existing controls, and do not build the full challenge engine yet. Run the stairway tests, type-check, and lint.”

## 5. Recommended AI orchestration

Planner/reviewer:
- Claude if available.
- Fallback: OpenCode Go, Kimi, Codex reviewer thread.

Builder:
- Codex first.

Review:
- Different model from builder.

Tester:
- Use repo-native commands first.
- Browser smoke after tests.

## 6. Phase 1 definition of done

The implementation is acceptable when:

- route loads;
- 3D stair renders;
- sliders update geometry;
- compliance updates live;
- left panel is no longer a flat cramped dump of all controls;
- advanced controls are collapsed by default;
- right panel gives overall status and critical diagnosis;
- status bar shows compact dimension pass/fail;
- mobile remains usable;
- no source-backed claims are introduced;
- tests/type-check/lint results are reported;
- changed files are limited to 3D Lab workbench UI unless explicitly justified.

## 7. What would still remain after Phase 1

- migrate click inspection fully out of viewport popover;
- build final selected-element right-panel inspector;
- implement learning modes beyond skeleton tabs;
- add deliberate error presets;
- add source audit table;
- add sourceTruth only after audit;
- add Challenge/Exam Transfer flow;
- add 2D/text-only transfer items;
- add visual QA and responsive polish.

## 8. Confidence statement

With this document set, the strategy is strong enough to produce a good Phase 1 implementation and avoid the main failure modes:

- generic cramped sidebar persistence;
- overbuilding a new shell;
- mixing source claims before verification;
- hiding live compliance feedback;
- polluting the renderer with more module-specific UI;
- losing exam-prep purpose.

It is not a promise that the first coded pass will be visually final. It is a strong enough strategy to make the first pass correctly structured, reviewable, and improvable without architectural regret.
