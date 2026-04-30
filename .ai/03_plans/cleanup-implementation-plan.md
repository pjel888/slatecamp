# Cleanup Implementation Plan

## Objective
Execute repository cleanup in safe, repository-specific waves that reduce dead weight, simplify architecture, and preserve behavior.

## Linked finding IDs
- `CLN-001` through `CLN-015`

## Linked candidate IDs
- `L1-C001` through `L5-C07`
- `DEP-01` through `DEP-05`
- `TOOL-01`
- `SCRIPT-01`
- `VAL-01`

## Scope
- confirmed dead code removal
- legacy/alias retirement
- component and boundary cleanup
- dependency/tooling rationalization
- validation hardening needed to support later cleanup waves

## Non-goals
- behavior-changing rewrites in one sweep
- stylistic churn
- speculative performance micro-optimizations

## Dependencies
- `cleanup-candidate-index.md`
- `cleanup-findings-register.md`
- `cleanup-safety-validation-plan.md`

## Readiness gates
- each wave must have explicit candidate confirmation
- no delete pass without path-by-path caller/registry/script validation
- higher-risk waves require stronger validation than the current baseline provides

## Risks
- false-positive deletions
- route/alias cleanup breaking bookmarks or operator workflows
- admin/3D cleanup causing regressions without adequate behavior locks
- auth/entitlement cleanup changing security semantics

## Mitigation strategy
- start with confirmed aliases and low-risk leaf dependencies
- separate compatibility-inventory work from actual deletion work
- require targeted validation and behavior locks before high-risk waves

## Sequencing

### Wave 1 — confirmed dead code and lowest-risk removals
- `L1-C001`
- `L1-C002`
- likely dead leaf deps from `DEP-01` to `DEP-05` after verification

### Wave 2 — duplicate and legacy surface consolidation
- `L2-ADM-001`
- `L2-QUIZ-002`
- `L2-CALC-003`
- `L2-3DLAB-004`
- `L2-DEV-006`

### Wave 3 — component and boundary optimization
- `L3-C01`
- `L3-C02`
- `L3-C03`
- `L3-C04`
- `L3-C05`
- `L3-C06`
- `L2-3DLAB-005`

### Wave 4 — dependency and tooling rationalization
- `TOOL-01`
- `SCRIPT-01`
- residual dependency candidates
- validation contract cleanup from `VAL-01`

### Wave 5 — higher-risk structural and compatibility cleanup
- `L1-L008` / `L1-L009`
- `L5-C02` through `L5-C06`
- any generated-type or seed/data cleanup still requiring manual validation

## Validation strategy
- use only real commands: `bun run type-check`, `bun run lint`, `bun run build`, `bun run check:storybook`, `bun run build-storybook`, `bun run check:entitlements`
- add targeted tests/observability in later approved runs where current coverage is insufficient
- require manual route/admin/developer verification where automation is weak

## Rollback / containment
- execute in small batches
- revert per wave, not after a giant sweep
- preserve compatibility inventories until post-validation confirmation

## Open questions
- resolved 2026-04-30: `/tools` is canonical; `/calculators` is redirect-only compatibility.
- which developer surfaces must stay manual/demo by design?
- which DB helper scripts are still operator-owned?

## Approval points needing human decision
- route namespace strategy for calculators/tools
- whether to preserve legacy admin aliases indefinitely
- how aggressive validation hardening should be before structural cleanup starts

