# Preparation Plan - Lighting Room Simulator

Mode: planning only
Implementation status: P0 documentation gates cleared for hidden QA; learner release still requires SME source approval
Primary target: make the later implementation deterministic, learner-centered, source-safe, and visually aligned with the stairway 3D Lab workbench.

## RALPLAN-DR Summary

### Principles

1. Teach one concept at a time: learners must understand the current visual change before being asked to manage another parameter.
2. Separate learning truth from legal truth: simplified formulas can teach, but source cards decide what can be called compliance.
3. Match the existing workbench: use the stairway shell density, side-panel discipline, camera toolbar, and scan-friendly law cards.
4. Fail closed on source uncertainty: source-pending and located-but-unapproved values are shown as review items, not pass/fail law claims.
5. Preserve calm under pressure: under-lit states are corrective and actionable, not shameful.

### Decision Drivers

| Driver | Why it matters |
|---|---|
| Learner comprehension | The module is for LEA learners, not lighting engineers. |
| Source accuracy | Wrong law attribution would damage trust. |
| Implementation determinism | The later builder needs unambiguous formulas, presets, and gates. |
| Visual consistency | The user explicitly referenced the stairway route as the UI model. |

### Viable Options

| Option | Description | Pros | Cons | Decision |
|---|---|---|---|---|
| A | Build full 3D lighting simulator with source-gated law cards | Best learner value; differentiated from 2D modules | Needs stronger source and math gates | Chosen |
| B | Build only a 2D lux calculator extension | Easier; reuses existing modules | Does not satisfy "room is the visualization" promise | Rejected |
| C | Build photometric/professional model with IES/CU/LLF | More technically complete | Too large for v0, risks false precision | Rejected |

## ADR

### Decision

Proceed with a v0 3D single-room, single-fixture lighting laboratory, but require source-card approval and corrected preset math before implementation begins.

### Drivers

- The 3D visual model can teach lumens, watts, beam angle, and color temperature more effectively than a static floor plan.
- Learners need immediate perception plus simple formulas, not professional photometric tooling.
- Source uncertainty is currently the largest quality risk.

### Alternatives Considered

- Use the existing `illumination-levels` and `lighting-layout` modules as-is. Rejected because they are 2D and do not teach through real-time scene lighting.
- Expand to multi-fixture and lumen method in v0. Rejected because it creates too many controls and would bury the first learning insight.
- Remove compliance until all sources are approved. Rejected because source status itself is educational and can be shown safely if it fails closed.

### Consequences

- v0 will be smaller but much clearer.
- The module must include visible source status.
- A later implementation must write deterministic computation tests before any 3D rendering.
- The visual brightness gradient must be described as approximate learning visualization, not measured lux output.

## Work Plan For This Documentation Pass

### Phase 1 - Source Truth Preparation

Owner: researcher / subject matter expert
Output:
- `05-source-locator-workbook.csv`
- source-card seeds from `10-source-card-schema-and-approval.md`
- conflict resolutions in `09-conflict-register.md`

Acceptance:
- P0 values have located source records, are explicitly deferred as `CONFLICT`, or are marked internal/pedagogical.
- No learner-facing law card can render `PASS` or `FAIL` from a `SOURCE_PENDING` or `LOCATED` value.

### Phase 2 - Calculation Contract

Owner: executor / test-engineer in later implementation
Output:
- pure `computeLightingState()` contract before React/Three work
- deterministic formula tests from `06-formula-testcase-seeds.csv`

Acceptance:
- Preset values compute to their displayed targets.
- Formula tests cover average lux, LPD, efficacy, beam coverage, target checks, and source fail-closed behavior.
- Calculation docs explicitly distinguish simplified average lux from visual falloff.

### Phase 3 - Learner UX Contract

Owner: designer / frontend developer in later implementation
Output:
- `12-learner-ux-blueprint.md` as UX source of truth
- left panel information hierarchy
- right panel check/source status hierarchy
- microcopy and first-run guidance

Acceptance:
- First load teaches a single primary concept within 60 seconds.
- No default desktop panel requires page scroll at 1440x820.
- Mobile uses a bottom sheet/tabs and keeps the scene visible.

### Phase 4 - 3D Implementation Handoff

Owner: 3D/frontend executor in later implementation
Output:
- module config
- computation engine
- custom left panel
- special path registration
- hidden QA route

Acceptance:
- Later implementation follows `13-implementation-handoff-spec.md`.
- Renderer/light behavior follows `14-lighting-architecture-bridge.md`.
- Formula behavior follows `15-formula-contract.md`.
- No new dependency unless explicitly approved.
- Uses the existing 3D Lab primitives and stairway workbench pattern.

### Phase 5 - Release Gate

Owner: verifier / QA
Output:
- completed `08-release-gate-checklist.md`
- screenshots for required states
- source status evidence

Acceptance:
- Hidden QA can ship only after calculations, UI, source status, and visual smoke checks pass.
- Learner release requires SME source approval for all law cards.

## Staffing Guidance For Later Execution

### Sequential `ralph` route

Use when one owner should implement and verify end to end.

Recommended lanes:
- Implementation lane: `frontend-developer` or `nextjs-developer`, reasoning `medium`
- Formula/test lane: `test-writer`, reasoning `medium`
- Verification lane: `architect-reviewer`, reasoning `high`
- UX sign-off: `ui-ux-designer`, reasoning `medium`

### Parallel `team` route

Use when source, calculation, UI, and 3D work are ready to run in parallel with disjoint write scopes.

Suggested write scopes:
- Calculation/tests: `src/features/3d-lab/config/modules/06-electrical/lighting-computation.ts` and test file only
- Module config/geometry: `src/features/3d-lab/config/modules/06-electrical/lighting-room-simulator.ts`
- Panels/shell: `src/features/3d-lab/components/templates/LightingRoomPanels.tsx` and `useTemplateContent.tsx`
- QA/docs: planning folder and release gate only

## Stop Conditions

Stop planning when:
- Source gate is explicit.
- Preset math is corrected.
- Learner flow is concrete.
- Later implementation has file-level acceptance criteria.

Do not start code until these conditions are satisfied.
