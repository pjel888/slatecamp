# Ralph Context Snapshot: Auth/status/feature-flag cleanup preparation

## Task statement
Create a preparation-only planning package under `.ai/03_plans/` for the next high-risk cleanup sequence after tools/calculators and 3D Lab shim cleanup: auth/status/feature-flag compatibility branches `L5-C02`, `L5-C03`, and `L5-C06`.

## Desired outcome
No runtime implementation. Produce multiple planning artifacts: audits, readiness, observations, implementation sequence, blast-radius analysis, risk/error mitigation, and validation strategy.

## Known facts/evidence
- `.ai/03_plans/legacy-removal-plan.md` sequences `L5-C02`, `L5-C03`, and `L5-C06` after completed `L2-CALC-003` and `L2-3DLAB-004`.
- These candidates touch auth/admin role compatibility, feature flag legacy tier/target_roles paths, and `pending_review` fallback behavior.
- Repository is pre-launch MVP but auth/Supabase/admin status code is high-risk and must be behavior-locked first.

## Constraints
- Preparation-only; do not change runtime source, schema, migrations, tests, or policies in this pass.
- Payment and AI work are deferred.
- Use additive `.ai` docs and keep references evidence-backed.
- Verify referenced paths exist and run `git diff --check`.
- Team tmux runtime is unavailable in this native session; proceed locally without worker panes.

## Unknowns/open questions
- Which compatibility branches are currently exercised by live tests versus stale historical fallbacks?
- Which RLS/schema/type changes are required before `target_roles` or legacy status fallbacks can be removed?
- Which user roles/environments rely on local/dev bypasses versus production-like policies?

## Likely codebase touchpoints
- `src/lib/admin/roles.ts`
- `src/lib/entitlements/resolve-role.ts`
- `src/lib/entitlements/get-viewer-entitlements.ts`
- `src/lib/entitlements/normalize-feature-flag.ts`
- `src/lib/actions/admin/pipeline.ts`
- `src/lib/actions/admin/pipeline.test.ts`
- `scripts/check-entitlement-legacy-usage.ts`
- `DATABASE_SCHEMA.sql`
- `supabase/migrations/20260411_entitlement_finalization.sql`
- `supabase/migrations/20260412_normalize_admin_editor_statuses.sql`
- `src/types/app.ts`
- `src/types/supabase.ts`
