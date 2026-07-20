# Plan 018 — Fix `db:seed` script + refresh stale doc counts

> Audit: 2026-07-20, commit `064e3a43a`. Category: DX/docs. Severity: MEDIUM. Effort: S. Risk: low.
> **Status: ✅ APPLIED.**

## Why this mattered

- `package.json` declared `"db:seed": "bun scripts/seed.ts"` but `scripts/seed.ts` didn't exist. New devs following the README got a module-not-found error. The actual seed SQL was at `supabase/01_RESET_AND_SEED.sql` + `supabase/02_RUN_ALL_SEEDS.sql`.
- `COMPREHENSIVE_AUDIT.md` carried count claims off by ~50 on migrations and ~9 on tables. The most-likely entry-point doc for reviewers was actively misleading.

## What was changed — Part A: db:seed

In `package.json`, replaced the dead `db:seed` target with:
```
"db:seed": "supabase db execute --local supabase/01_RESET_AND_SEED.sql && supabase db execute --local supabase/02_RUN_ALL_SEEDS.sql"
```
Runs the existing seed SQL via the Supabase CLI's local executor.

## What was changed — Part B: doc counts

Verified the live counts (2026-07-20): **130 `page.tsx` routes · 77 `CREATE TABLE` in `DATABASE_SCHEMA.sql` · 227 migrations · 95 test files**.

- `README.md` line 58: changed "118 `page.tsx` routes" → "130 `page.tsx` routes (verified 2026-07-20)".
- `COMPREHENSIVE_AUDIT.md`: added a "Historical document" banner at the top noting the audit was written 2026-05-15, its counts have drifted, and pointing to `README.md`, the `.ai/` corpus, and `plans/` for current architecture and findings. Refreshing counts in a 2-month-old audit gives false currency — the banner is preferred.

## Verification

- `bun run db:seed --help` — script target resolves (no module-not-found).
- Re-ran the count commands and diffed against the doc claims.

## Maintenance note

Count claims in docs are a maintenance burden. A tiny CI check (`scripts/check-doc-counts.ts`) that asserts README's claimed counts match the live repo — fails the build if they drift — would be a worthwhile follow-up.
