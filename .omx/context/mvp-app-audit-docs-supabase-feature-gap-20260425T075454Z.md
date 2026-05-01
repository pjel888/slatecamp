# MVP App Audit, Docs, Supabase, and Feature Gap Context

## Task Statement

Run a comprehensive pre-launch MVP planning pass for:
- whole-app UX/UI audit across all routes
- `.ai` documentation freshness review and archival plan for outdated/accomplished docs
- Supabase keepalive, live schema drift review, `DATABASE_SCHEMA.sql` update path, and outdated-table cleanup
- promised-feature gap audit with implementation handoff for missing launch-critical features

The user explicitly does not want legacy/backwards-compatibility accommodation. The active workflow is `$ralplan` / `$plan --consensus`; `$ultrawork` and `$autopilot` were detected but deferred until the planning gate is complete.

## Desired Outcome

A consensus-approved execution plan that can be handed to `$team`, `$ralph`, or `$autopilot` for staged implementation with clear lanes, acceptance criteria, and verification. The plan must protect production data, keep the MVP lean, and align `.ai`, `README.md`, `AGENTS.md`, `DATABASE_SCHEMA.sql`, app routes, and feature promises with live reality.

## Known Facts And Evidence

- Root `AGENTS.md` and `CLAUDE.md` define SlateCamp as a pre-launch MVP and explicitly deprioritize backwards compatibility.
- `package.json` has Bun commands: `dev`, `build`, `lint`, `type-check`, Storybook commands, `check:entitlements`, and `db:seed`; there is no root `test` script.
- Working tree had pre-existing modified `package.json` and `bun.lock` before this planning pass.
- Live route counts from `find` / `rg` on 2026-04-25:
  - 104 `src/app/**/page.tsx` files
  - 15 layouts
  - 91 loading files
  - 7 error boundaries
  - 12 route handlers
- Existing docs still cite older route counts such as 124/125 pages, 16 layouts, 95/96 loading files, 9 errors, and 89 migrations.
- Current migration count is 91 SQL files under `supabase/migrations`.
- `.ai` is large: `rg --files .ai` returned 992 files.
- Existing `.ai` docs already identify stale-doc risk, developer mock-vs-runtime truth issues, documentation hardening, and route/surface drift.
- Safe Supabase keepalive/introspection was run with env-provided keys and no secret output:
  - `questions` count: 7156
  - `wiki_articles` count: 566
  - `quiz_sessions` count: 197
  - OpenAPI status: 200
  - OpenAPI definitions: 97
- `DATABASE_SCHEMA.sql` header says updated 2026-04-07 and claims 86 tables / 2 views / 39 functions, but regex scan found 76 `CREATE TABLE` statements and only one function in the snapshot.
- Live OpenAPI definitions missing from `DATABASE_SCHEMA.sql` include `admin_draft_previews`, `behavioral_features`, `blindspot_queues`, `cage_binding_tokens`, `cognitive_state_indicators`, `interaction_signal_traces`, materialized-view definitions, `saved_session_configs`, `session_questions`, `submission_state_log`, `user_capabilities`, and others.
- `DATABASE_SCHEMA.sql` contains `focus_review_queues`, but live OpenAPI exposes `blindspot_queues`, suggesting the 20260418 absolute-unification migration is not applied to the live database or the schema snapshot is ahead of production.
- Live definitions still include legacy-like columns: `is_proof_simulation`, `proof_simulation_unlocked_at`, `simulation_count`, `last_simulation_score`, `best_simulation_score`, `stripe_customer_id`, and `stripe_subscription_id`.
- App code uses current names in places such as `src/app/api/cron/focus-review-scan/route.ts` and `src/lib/actions/quiz-v2/start-session.ts`, so live DB drift may be runtime-breaking.
- `src/lib/routes.ts` has static constants with no current page: `/admin/wiki`, `/auth/reset-password`, `/dashboard/campfire`, `/dashboard/library`, `/dashboard/settings/billing`, `/dashboard/settings/developer`, `/dashboard/trails`, and `/quiz/full_exam/setup`.
- Many live pages do not have static route constants, especially dynamic admin, dashboard, quiz, Area C, wiki, and onboarding routes.

## Constraints

- Planning gate is active; do not begin implementation until the ralplan consensus artifact is complete.
- Database work must be non-destructive until an execution plan explicitly sequences backup, drift proof, migration application, schema regeneration, and verification.
- Supabase service-role operations are high risk; use read-only checks first and do not expose secrets.
- Docs archival should be traceable and non-destructive unless a later execution lane explicitly moves files with index updates.
- Any future symbol edits must satisfy the repo GitNexus/impact-analysis contract if GitNexus tooling is available; if only CLI is available, document the fallback.
- Use Bun for commands and verify scripts against `package.json`.

## Unknowns / Open Questions

- Whether the live Supabase project should be migrated to match repository canonical schema, or whether `DATABASE_SCHEMA.sql` should be regenerated from current production first and then cleaned.
- Whether live materialized views and CAGE/behavioral/submission tables are launch-critical, experimental, or archive candidates.
- Which promised-feature documents are authoritative enough to define launch scope versus historical/archived product ideas.
- Whether every public marketing claim on `/`, `/pricing`, and onboarding should be treated as a promise that must be implemented before launch.
- Whether route constants without pages should be deleted, replaced with pages, or redirected.

## Likely Codebase Touchpoints

- `src/app/**`
- `src/components/**`
- `src/features/**`
- `src/lib/routes.ts`
- `src/lib/actions/**`
- `src/lib/queries/**`
- `src/lib/supabase/**`
- `src/types/supabase.ts`
- `DATABASE_SCHEMA.sql`
- `supabase/migrations/**`
- `scripts/*db*`, `scripts/test-supabase.ts`, `supabase/check_db*.ts`
- `.ai/00_system/**`
- `.ai/01_roadmap/**`
- `.ai/02_audits/**`
- `.ai/03_plans/**`
- `.ai/06_specs/**`
- `.ai/09_archive/**`
- `.ai/10_state/**`
- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
