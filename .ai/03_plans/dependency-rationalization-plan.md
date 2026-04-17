# Dependency Rationalization Plan

## Objective
Reduce package and tooling surface area where overlap or inactivity is strongly indicated, while preserving the Bun-first workflow and avoiding false-positive removals.

## Linked finding IDs
- `CLN-012`
- `CLN-013`
- `CLN-015`

## Linked candidate IDs
- `DEP-01` through `DEP-05`
- `TOOL-01`
- `SCRIPT-01`
- `L5-C07`

## Scope
- likely dead or overlapping dependencies
- duplicate package-manager artifacts
- stale script aliases
- low-confidence operational script quarantine decisions

## Non-goals
- dependency upgrades for feature work
- lockfile churn without a package-manager decision
- DB script deletion without ownership confirmation

## Dependencies
- `dependency-rationalization-audit.md`
- `cleanup-safety-validation-plan.md`

## Readiness gates
- confirm no hidden Storybook/test/editor/runtime consumers exist
- decide whether Bun remains the sole supported package manager
- confirm operator ownership of `supabase/check_db*.ts`

## Risks
- removing packages indirectly used by tooling or transitive editor/runtime features
- lockfile cleanup changing local install expectations
- deleting operator scripts that are intentionally manual-only

## Mitigation strategy
- remove packages in the smallest independent batches
- validate after each batch with Bun-first commands only
- quarantine low-confidence scripts before deletion

## Sequencing
1. verify and remove `DEP-02`, `DEP-03`, `DEP-04`
2. verify/remove sanitizer overlap `DEP-01`
3. verify/remove Tiptap internals `DEP-05`
4. retire `SCRIPT-01` alias once no compatibility caller remains
5. decide on `TOOL-01` and remove `package-lock.json` only after human approval
6. inventory/quarantine `L5-C07` scripts rather than hard-delete them first

## Validation strategy
- `bun run type-check`
- `bun run lint`
- `bun run check:storybook`
- `bun run build-storybook`
- `bun run build`

## Rollback / containment
- one dependency cluster per change
- restore removed packages immediately if validation or runtime assumptions fail
- keep package-manager contract docs aligned with any lockfile decision

## Open questions
- should Storybook/testing packages be trimmed aggressively or retained for future expansion?
- are the ad hoc `supabase/check_db*.ts` files still used outside package scripts?

## Approval points needing human decision
- whether to fully retire npm lockfile support
- whether to quarantine or delete manual DB helper scripts

