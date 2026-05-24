# Supabase Change Protocol v1

## Purpose

This is the mandatory protocol for any AI agent changing SlateCamp Supabase behavior.

It applies to:

- `supabase/migrations/**`
- RLS policies, grants, roles, schemas, functions, triggers, indexes, storage policies, and RPCs
- generated Supabase types
- `src/lib/supabase/**`
- server actions, route handlers, or query files that change Supabase access patterns
- webhook, cron, admin, quiz, SRS, wiki, notification, entitlement, payment, and AI-audit database flows

The goal is simple: no future database change should create avoidable Supabase Advisor warnings, RLS gaps, exposed SECURITY DEFINER functions, or hidden production drift.

## Non-negotiable rules

1. Do not treat Supabase warnings as cleanup trivia. Advisor findings are part of the acceptance criteria for database work.
2. Do not disable RLS to silence a warning.
3. Do not create a table in `public` without explicit RLS and at least one intentional access policy, unless it is a documented temporary migration object that is dropped in the same migration.
4. Do not create or replace a SECURITY DEFINER function without an explicit execute-grant plan.
5. Do not grant broad `PUBLIC`, `anon`, or `authenticated` privileges unless the product flow requires it and the audit note explains why.
6. Do not call service-role clients from browser/client code. Service role belongs only in trusted server contexts after explicit user/auth/ownership checks.
7. Do not mutate the linked remote database until lint, dry-run, rollback smoke, and review evidence exist, unless Philip explicitly authorizes an emergency exception.
8. Hosted Auth warnings, such as leaked-password protection, are not SQL migration work. Track them separately as dashboard/API configuration.

## Required preflight for any Supabase-related task

Before editing:

```bash
git status --short
bunx supabase db advisors --linked --output json
bunx supabase db lint --linked
bunx supabase db push --dry-run --linked
```

If the task is local-only and linked Supabase access is unavailable, state that clearly and still inspect local migrations, schema, and affected callsites. Do not claim advisor safety without live or staging advisor evidence.

Also inspect the relevant source of truth:

- `.ai/00_system/SUPABASE_VERIFICATION_RUNBOOK.md`
- `.ai/00_system/DATA_BOUNDARY_MAP.md`
- `.ai/00_system/VALIDATION_MATRIX.md`
- `DATABASE_SCHEMA.sql`
- relevant recent files in `supabase/migrations/`
- affected `src/lib/actions/**`, `src/lib/queries/**`, `src/app/**/route.ts`, and `src/lib/supabase/**`

## Design requirements before writing SQL

For every migration, write down the intended access matrix before SQL:

| Object | anon | authenticated | service_role | owner/admin rule | Notes |
| --- | --- | --- | --- | --- | --- |
| table/function/policy name | deny/allow | deny/allow | deny/allow | exact predicate | why |

Minimum checks:

- New table: RLS enabled, policies scoped by role and operation.
- Existing table: policy change preserves all required user/admin/service flows.
- Webhook/internal ledger: `anon` and `authenticated` denied; exact service-role operations granted; service-role-only policies added.
- User data: policies use `(select auth.uid())` / `(select auth.role())` initplan form where applicable.
- Admin data: admin predicates are explicit; do not rely only on client-side route protection.
- RPC: caller role, ownership guard, search path, and execute grants are explicit.
- SECURITY DEFINER: only used when necessary; `search_path` is fixed; exposed schemas and grants are minimized.
- Index work: duplicate or unused index changes are verified against live definitions before dropping anything.

## SECURITY DEFINER rules

Before creating, replacing, moving, or granting a SECURITY DEFINER function:

1. Search app callsites for the RPC/function name.
2. Classify it as one of:
   - internal helper for RLS/policies
   - backend-only service-role RPC
   - authenticated user RPC
   - admin/staff RPC
   - maintenance/cron function
3. Prefer internal helpers in a non-exposed schema such as `private`.
4. If an elevated RPC is needed by app code, prefer server-side service-role execution with explicit `getUser()` / ownership / role checks before the RPC call.
5. Revoke unnecessary `PUBLIC`, `anon`, and `authenticated` execute grants.
6. Re-run advisors and confirm no new `authenticated_security_definer_function_executable` or `anon_security_definer_function_executable` warning is introduced.

## Required validation before live apply

For schema, RLS, grant, RPC, policy, or migration changes:

```bash
bunx supabase db lint --linked
bunx supabase db push --dry-run --linked
```

Run a rollback smoke test by executing the migration body inside a transaction that ends with `ROLLBACK`. If the migration file contains its own `BEGIN;` / `COMMIT;`, strip those wrappers for the smoke file and wrap the body in:

```sql
BEGIN;
-- migration body
ROLLBACK;
```

For TypeScript callsite changes involving Supabase access:

```bash
bun run type-check
bun run lint
```

Run targeted tests or route checks when the affected flow has coverage.

## Required post-apply verification

After any live Supabase apply:

```bash
bunx supabase db advisors --linked --output json
bunx supabase db lint --linked
bunx supabase migration list --linked
```

Also read back affected objects from PostgreSQL metadata, as applicable:

- `pg_policies`
- `information_schema.table_privileges`
- `information_schema.routine_privileges`
- `pg_proc`
- `pg_indexes`

Do not call the change complete until the post-apply advisor count and remaining finding names are recorded.

## Audit note requirement

Every non-trivial Supabase pass must create or update an audit note under `.ai/02_audits/` with:

- baseline advisor counts by warning/error name
- files changed
- affected tables/functions/policies/grants
- validation commands and exact results
- whether live remote DB was mutated
- post-apply advisor counts by warning/error name
- unresolved warnings and why they remain

Use the language precisely:

- “Prepared migration branch” = committed but not applied.
- “Live remote DB mutated” = `db push --linked` or equivalent live apply actually ran and read-back verification passed.
- “Blocked dashboard setting” = hosted Supabase configuration not addressable by SQL.

## Acceptance criteria for Supabase work

A Supabase-related task is not done unless one of these is true:

1. The change is local/docs-only and the report says no live DB mutation occurred.
2. The migration was validated but intentionally not applied, with the remaining apply step explicit.
3. The migration was applied and post-apply advisor/lint/read-back evidence passed.

For any path, the final report must state whether new Supabase Advisor warnings were introduced. If advisor evidence was unavailable, say so directly.

## Known SlateCamp patterns from 2026-05-24

- `rls_enabled_no_policy`: add explicit policies; do not disable RLS. For backend-only ledgers, use service-role-only `SELECT`/`INSERT` policies and keep user roles denied.
- `authenticated_security_definer_function_executable`: do not blindly revoke. Inspect callsites first; move helpers to `private`; move app-critical RPCs behind server-only service-role calls with explicit user guards before revoking `authenticated`.
- `auth_rls_initplan`: wrap auth calls in `(select auth.uid())`, `(select auth.role())`, or equivalent initplan form.
- `multiple_permissive_policies`: consolidate only after table-by-table semantic review.
- `duplicate_index`: drop only after verifying equivalent live definitions.
- `auth_leaked_password_protection`: dashboard/Auth configuration, not SQL.
