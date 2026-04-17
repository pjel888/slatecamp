# Cleanup Executive Roadmap

## Objective
Summarize the repository-wide cleanup strategy for decision-making and later implementation approval.

## Linked finding IDs
- `CLN-001` through `CLN-015`

## Linked candidate IDs
- `L1-C001` through `L5-C07`
- `DEP-01` through `DEP-05`
- `TOOL-01`
- `SCRIPT-01`
- `VAL-01`

## Top opportunities

1. remove confirmed wiki alias files immediately in a later implementation run
2. collapse admin legacy aliases into one explicit canonical route family
3. converge quiz/testing/drills route families
4. decompose admin editor + knowledge data flow
5. reduce wiki client work and duplicated sidebar hydration
6. rationalize likely dead leaf dependencies and Bun/npm lockfile drift
7. harden validation enough to make deeper cleanup safer

## Top risks

1. false-positive deletion in registry/story/MDX/route-convention surfaces
2. auth/entitlement cleanup changing runtime security behavior
3. 3D-lab cleanup mixing doc drift, alias retirement, and hotspot decomposition in one pass
4. operator-only DB scripts being removed without ownership confirmation
5. weak validation making medium/high-risk cleanup too guessy

## What should happen first

- confirmed alias removals (`L1-C001`, `L1-C002`)
- low-risk dependency verification/removal (`DEP-02`, `DEP-03`, `DEP-04`)
- route/namespace compatibility inventory for admin and quiz/testing

## What should wait

- auth/entitlement compatibility retirement
- bootstrap/Supabase helper refactors
- generated-type and seed/data contract deletions
- high-risk 3D structural cleanup without explicit performance/manual validation gates

## What is blocked by weak validation

- any delete pass in auth, entitlements, Supabase helpers, or admin status logic
- broad likely-dead file removal in hooks/helpers/data without path-specific revalidation
- major admin editor decomposition without stronger manual/targeted test coverage

## What requires explicit human approval

- Bun-only vs dual-package-manager contract (`TOOL-01`)
- calculators/tools namespace strategy (`L2-CALC-003`)
- long-term admin alias retention policy (`L2-ADM-001`)
- archive vs delete policy for ad hoc DB helper scripts (`L5-C07`)

## Recommended first implementation wave

- `L1-C001`
- `L1-C002`
- `DEP-02`
- `DEP-03`
- `DEP-04`
- supporting validation with `bun run type-check`, `bun run lint`, and `bun run check:storybook`

