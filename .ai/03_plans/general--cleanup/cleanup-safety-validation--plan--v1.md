# Cleanup Safety Validation Plan

## Objective
Define how later cleanup work will be validated safely using the real current command surface and explicit manual checks, without assuming a nonexistent root test script.

## Linked finding IDs
- `CLN-002`
- `CLN-013`
- `CLN-014`
- `CLN-015`

## Linked candidate IDs
- `VAL-01`
- `L1-U011` through `L1-U014`
- `L5-C01` through `L5-C07`

## Scope
- validation mapping for cleanup waves
- manual validation requirements
- prerequisites for higher-risk structural cleanup

## Non-goals
- implementing new tests or observability in this run
- inventing a fake repo-wide test command

## Dependencies
- `cleanup-coverage-matrix.md`
- `VALIDATION_MATRIX.md`
- `scripts/check-entitlement-legacy-usage.ts`

## Readiness gates
- low-risk cleanup can use current repo commands plus targeted grep/path validation
- medium-risk cleanup requires surface-specific manual validation checklists
- high-risk auth/entitlement/Supabase cleanup requires stronger behavior locks and likely targeted tests in a later approved run

## Risks
- false confidence from typecheck/lint/build alone
- cleanup changes that only break low-traffic admin/dev/operator paths
- auth/session regressions from helper simplification

## Mitigation strategy
- classify each candidate by validation difficulty before implementation
- require explicit manual validation for route aliases, developer surfaces, admin save flows, notes flows, and 3D entrypoints
- keep entitlement/auth cleanup behind stronger gates

## Validation strategy by wave

### Wave 1 — confirmed dead code / low-risk dependency removal
- `bun run type-check`
- `bun run lint`
- `bun run check:storybook`
- path/registry/barrel verification

### Wave 2 — route/legacy consolidation
- `bun run type-check`
- `bun run lint`
- `bun run build`
- manual route verification for admin, quiz/testing/drills, tools/calculators, 3D-lab

### Wave 3 — component/boundary cleanup
- `bun run type-check`
- `bun run lint`
- `bun run build`
- manual verification for wiki, admin knowledge, notes, developer, and 3D-lab

### Wave 4 — dependency/tooling rationalization
- `bun run type-check`
- `bun run lint`
- `bun run check:storybook`
- `bun run build-storybook`
- `bun run build`

### Wave 5 — auth/entitlement/Supabase cleanup
- `bun run type-check`
- `bun run lint`
- `bun run build`
- `bun run check:entitlements`
- targeted later tests/observability additions before implementation if cleanup touches role resolution, feature flags, bootstrap, or privileged Supabase helpers

## Rollback / containment
- revert cleanup by candidate cluster
- keep compatibility docs until post-validation completion
- stop the wave if `check:entitlements` or manual auth/admin checks fail

## Open questions
- which high-risk flows need new targeted tests before cleanup is safe?
- should the repo add a canonical `validate` script in a later approved tooling pass?

## Approval points needing human decision
- acceptable validation bar for deleting low-traffic but operator-facing scripts or helper surfaces
- whether validation hardening should precede any medium/high-risk cleanup wave

