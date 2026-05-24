# Supabase Verification Runbook

## Goal

Verify migrations, AI audit DB access control, and generated Supabase types against a safe non-production target.

For any AI-authored Supabase change, first follow `.ai/00_system/supabase-change--protocol--v1.md`. This runbook is the deeper verification path for migration replay, permission checks, and type regeneration.

This runbook exists because the 2026-05-05 Supabase verification attempt could not complete: Docker was unavailable, `supabase/config.toml` was missing, and `bunx supabase migration list` reached an unclear remote/cached context that must not be treated as staging verification.

## Allowed targets

- Local Supabase with Docker.
- Explicit staging Supabase project.
- Explicit preview/branch database.

## Forbidden targets

- Production.
- Unknown remote context.
- Cached Supabase CLI context whose project identity is unclear.
- Any remote database without explicit staging/test confirmation.

## Step 1: Safe discovery

Run:

```bash
bunx supabase --version
docker --version
test -f supabase/config.toml && cat supabase/config.toml || true
test -f supabase/seed.sql && echo "seed.sql exists" || echo "no seed.sql"
bunx supabase status || true
bunx supabase migration list || true
```

Warning: if `bunx supabase migration list` connects to an unclear remote, do not use that target for verification, migration application, or type generation. First prove the project identity is local/staging/preview and not production.

## Step 2: Local setup

If using local Supabase and `supabase/config.toml` is missing, initialize local config only after confirming no important config would be overwritten.

```bash
bunx supabase init
bunx supabase start
bunx supabase db reset
```

Notes:

- Only run `db reset` on local.
- Do not import production data.
- Document every file created by `bunx supabase init`.
- Do not link to production.
- Do not use production secrets.

## Step 3: Migration replay

- Confirm all 101 active migrations replay cleanly.
- Capture the first failing migration if any.
- Classify the failure as ordering, syntax, missing extension, missing table/function, duplicate object, policy/grant issue, or seed-related.
- Do not rewrite old migrations unless human-approved.
- Prefer a new forward repair migration for histories that may already be applied in staging/production.

Also confirm:

- `supabase/migrations/rollback_lea_to_ale.sql` does not exist.
- `.ai/09_archive/store/DB_ROLLBACKS/2026-05-05/rollback_lea_to_ale.sql` exists.
- `.ai/09_archive/store/DB_ROLLBACKS/2026-05-05/README.md` explains rollback SQL is not a forward migration.

## Step 4: AI audit access checks

Migration to verify:

- `supabase/migrations/20260505145349_restrict_ai_audit_admin_access.sql`

As ordinary authenticated learner, these should fail:

```sql
select * from public.ai_audit_article_overview limit 1;
select * from public.ai_audit_question_overview limit 1;
select * from public.ai_audit_design_scenario_question_overview limit 1;
select * from public.ai_audit_all_question_overview limit 1;
select * from public.ai_audit_dashboard_summary limit 1;
select * from public.ai_audit_finding_overview limit 1;
select public.seed_ai_audit_status_cache();
```

As `service_role`, these should work if intended and objects exist:

```sql
select * from public.ai_audit_dashboard_summary limit 1;
select * from public.ai_audit_article_overview limit 1;
select * from public.ai_audit_question_overview limit 1;
select public.seed_ai_audit_status_cache();
```

Interpretation notes:

- Empty result with permission allowed is different from permission denied.
- If a function or view does not exist after migration replay, treat it as migration replay/schema drift failure.
- Do not expose or print tokens.
- Use `service_role` only for staff/admin server-side checks.

## Step 5: Generate types

Only after a verified schema exists.

Local:

```bash
bunx supabase gen types typescript --local --schema public > src/types/supabase.ts
```

Linked staging:

```bash
bunx supabase gen types typescript --linked --schema public > src/types/supabase.ts
```

Explicit staging project:

```bash
bunx supabase gen types typescript --project-id <staging_project_id> --schema public > src/types/supabase.ts
```

Do not hand-edit generated database types.

## Step 6: Validate type diff

Confirm generated types include:

- `ai_audit_article_overview`
- `ai_audit_question_overview`
- `ai_audit_design_scenario_question_overview`
- `ai_audit_all_question_overview`
- `ai_audit_dashboard_summary`
- `ai_audit_finding_overview`
- `seed_ai_audit_status_cache`

Confirm these remain:

- `taxonomy_tree`
- `user_srs_cards`
- `quiz_sessions`

If a huge suspicious diff appears, stop and verify target identity before proceeding. A target that drops expected current objects is wrong or stale.

## Step 7: Final validation

Run:

```bash
git diff --check
bun run type-check
bun test src/
bun run test:dom
bun run lint
bun audit
bun run build
bun run check:entitlements
bun run test:e2e:prod
```

## Step 8: Final release decision

Do not mark SlateCamp production-ready unless all are true:

- Migration replay passed on a safe target.
- AI audit DB permission checks passed.
- `src/types/supabase.ts` was regenerated from a verified schema.
- Full validation gate passed after type regeneration.
- Production/staging environment values were verified without exposing secrets.
- Broad `.ai`/docs diff was human-reviewed.

Payment and live AI provider variables are not blockers for the current payment-free/live-AI-free launch cutline.
