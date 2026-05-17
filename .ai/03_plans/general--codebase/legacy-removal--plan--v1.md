# Legacy Removal Plan

## Objective
Remove or consolidate superseded routes, wrappers, aliases, and compatibility surfaces in a safe, evidence-backed sequence.

## Linked finding IDs
- `CLN-001`
- `CLN-002`
- `CLN-003`
- `CLN-004`
- `CLN-005`
- `CLN-006`
- `CLN-014`
- `CLN-015`

## Linked candidate IDs
- `L1-C001`
- `L1-C002`
- `L1-L003` through `L1-L010`
- `L2-ADM-001`
- `L2-QUIZ-002`
- `L2-CALC-003`
- `L2-3DLAB-004`
- `L5-C02`
- `L5-C03`
- `L5-C06`
- `L5-C07`

## Scope
- wrapper/alias deletions
- route alias retirement
- legacy business-logic namespace consolidation
- compatibility branch retirement planning

## Non-goals
- broad component rewrites
- auth helper refactors without behavior locks
- migration history deletion

## Dependencies
- `dead-code-audit.md`
- `legacy-code-audit.md`
- `cleanup-safety-validation-plan.md`

## Readiness gates
- confirmed alias files must be re-validated against barrel exports and registries
- route alias retirement must have explicit redirect/bookmark/operator-impact review
- compatibility branch retirement must prove no remaining live callers or schema dependence

## Risks
- breaking MDX/widget references
- breaking bookmarks or internal admin links
- removing compatibility logic that still protects live status/role behavior

## Mitigation strategy
- remove confirmed file aliases first
- inventory compatibility routes and wrappers before deleting them
- keep schema/type/runtime compatibility retirement in one coordinated later wave

## Sequencing
1. remove `L1-C001` and `L1-C002`
2. validate likely-dead UI/hooks/helpers (`L1-L003`–`L1-L007`)
3. inventory and consolidate admin aliases (`L2-ADM-001`)
4. converge quiz/testing/drills routing (`L2-QUIZ-002`)
5. completed 2026-04-30: rationalize calculator namespace after product decision (`L2-CALC-003`)
6. completed 2026-04-30: retire 3D-lab legacy shims and stale route docs (`L2-3DLAB-004`) by keeping the canonical feature-layer registry, removing stale 18-category generator artifacts, removing empty placeholder registry files, and updating route-local path drift
7. only then tackle auth/status/feature-flag compatibility branches (`L5-C02`, `L5-C03`, `L5-C06`)
8. quarantine or archive ad hoc DB helper scripts (`L5-C07`) after explicit ownership review

## Validation strategy
- grep/registry/barrel revalidation before each delete
- `bun run type-check`
- `bun run lint`
- targeted route/manual verification for admin, quiz/testing, calculators, and 3D-lab entrypoints
- `bun run check:entitlements` before and after entitlement-related cleanup

## Rollback / containment
- keep compatibility inventories in docs until each cluster is validated
- revert by cluster, not by whole wave
- do not combine route retirement and auth compatibility cleanup in the same PR

## Open questions
- which route aliases still need to preserve inbound bookmarks or analytics continuity?
- are any of the likely-dead hooks/helpers intentionally parked for future use?

## Approval points needing human decision
- whether admin and calculator aliases remain long-lived compatibility surfaces
- whether manual DB helper scripts should be archived, retained, or moved under a clearer ops surface
