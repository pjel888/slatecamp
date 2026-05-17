# Scripts and Supabase Cleanup Audit

## Scripts and tooling opportunities

### Active but weakly rationalized
- `scripts/check-storybook.ts`
- `package.json` Storybook alias surface
- root validation surface split across multiple independent commands

### Candidate script cleanup
- `SCRIPT-01` — Storybook placeholder alias collapse
- `L5-C07` — inventory/quarantine `supabase/check_db*.ts` after ownership validation

## Risky cleanup areas in `supabase`

Do not treat these as delete-first targets:
- `supabase/migrations/` history
- status-normalization migrations still protecting runtime fallbacks
- role/RLS compatibility checks in migrations
- service-role DB helper scripts with unknown operator ownership

## Supabase cleanup blockers

- `L5-C01` entitlement cleanup guard currently fails against live code
- `L5-C02` admin role compatibility wrappers still back live runtime paths
- `L5-C03` `feature_flags.target_roles` and legacy tier normalization still span schema, types, and runtime
- `L5-C04` mixed-authority Supabase helper behavior needs behavior locks before refactor
- `L5-C05` bootstrap contract has inconsistent caller expectations
- `L5-C06` `pending_review` fallback remains behavior-locked by tests and migration chronology

## Historical artifacts that should remain preserved

- all migration history under `supabase/migrations/`
- reset/drop SQL unless explicitly retired by a later approved ops pass
- any DB helper scripts without confirmed non-use

## Linked findings and plans

- findings: `CLN-012`, `CLN-013`, `CLN-014`, `CLN-015`
- plans: `../03_plans/dependency-rationalization-plan.md`, `../03_plans/cleanup-safety-validation-plan.md`, `../03_plans/legacy-removal-plan.md`

