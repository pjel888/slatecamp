# Component Optimization Plan

## Objective
Prioritize structural component and boundary cleanup that materially reduces cognitive load, duplicated work, and render-path complexity without changing product behavior.

## Linked finding IDs
- `CLN-006`
- `CLN-007`
- `CLN-008`
- `CLN-009`
- `CLN-010`
- `CLN-011`

## Linked candidate IDs
- `L2-3DLAB-005`
- `L2-DEV-006`
- `L3-C01` through `L3-C06`

## Scope
- server/client boundary cleanup
- controller decomposition
- duplicated hydration/fetch consolidation
- giant file decomposition for high-leverage surfaces

## Non-goals
- broad UI redesign
- speculative memoization or arbitrary micro-optimization
- unmeasured performance rewrites

## Dependencies
- `component-optimization-audit.md`
- `client-server-boundary-audit.md`
- `cleanup-safety-validation-plan.md`

## Readiness gates
- route and save semantics must be understood before decomposition
- current telemetry/cache/3D behavior must be traced before 3D controller cleanup
- admin and notes flows need manual validation scripts/checklists before refactor

## Risks
- regressions in autosave, conflict handling, URL sync, and question filtering
- 3D-lab performance regressions from over-abstraction
- mobile/desktop wiki sidebar behavior divergence during consolidation

## Mitigation strategy
- start with the lowest-risk boundary wins
- extract shared controllers before reshaping UI trees
- keep 3D cleanup boundary-focused and avoid abstraction inflation

## Sequencing
1. `L3-C01` — serverify static wiki landing page
2. `L3-C02` — unify wiki sidebar hydration path
3. `L3-C05` — shared notes controller extraction
4. `L3-C03` and `L3-C04` — admin editor/knowledge flow decomposition
5. `L2-DEV-006` — split developer truth surfaces into source-backed vs manual/demo sections
6. `L3-C06` and `L2-3DLAB-005` — 3D controller and hotspot decomposition

## Validation strategy
- `bun run type-check`
- `bun run lint`
- targeted manual verification for wiki, admin knowledge, notes, developer, and 3D-lab surfaces
- later profiling/measurement before any performance-sensitive 3D work

## Rollback / containment
- split each surface into its own cleanup batch
- preserve current route contracts while internal controllers are being decomposed
- avoid combining admin and 3D refactors in one wave

## Open questions
- should mobile wiki sidebar continue lazy-fetch semantics by design?
- can developer portal truth surfaces be partly generated from source in a later run?

## Approval points needing human decision
- prioritization between admin knowledge cleanup and 3D-lab cleanup
- acceptable amount of manual verification before touching performance-sensitive 3D surfaces

