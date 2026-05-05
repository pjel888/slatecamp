# Supabase Verification Target, Migration Replay, and Type Regeneration Report

Date: 2026-05-05
Scope: Supabase verification target bootstrap, migration replay readiness, AI audit DB access-control verification readiness, generated type regeneration readiness, and release-governance status.

## 1. Executive Summary

### What was verified

- The application-layer validation gate still passes.
- Supabase CLI is available at `2.98.0`.
- Docker was unavailable in the latest verification environment.
- `supabase/config.toml` is missing.
- `supabase/seed.sql` is absent.
- Active migration count remains 101.
- `supabase/migrations/rollback_lea_to_ale.sql` is absent from active migrations.
- The archived rollback exists at `.ai/09_archive/store/DB_ROLLBACKS/2026-05-05/rollback_lea_to_ale.sql`.
- Static stale DB cleanup remains effective in active `src` code.

### What was not verified

- No safe local/staging Supabase verification target was available.
- The 101 active migrations were not replayed locally or in staging.
- The AI audit access-control migration was not DB-verified.
- Learner denial and `service_role`/admin success checks for AI audit views/RPC were not run.
- Actual production/staging deployment environment values were not platform-verified.

### What was changed

- No files were modified in that sprint.
- No Supabase config was created.
- No migrations were applied.
- No Supabase types were regenerated.
- No production or remote database was intentionally modified.

### Current production-readiness verdict

SlateCamp is **not production-ready**. Production remains blocked by database verification, AI audit DB permission verification, generated Supabase type drift, and deployment-platform environment review.

### Current beta-readiness verdict

The application layer is an **app-code beta candidate / validation-ready**. Full beta/release remains blocked until the Supabase verification path is completed.

## 2. Repository and Working Tree Status

| Check | Latest result | Notes |
| --- | --- | --- |
| Branch | `redesign/quiz-mode-hub` | Latest inspected branch. |
| `git status --short` | 112 changed entries | Broad existing remediation/docs diff remains. |
| `git diff --stat` | 100 files changed, 305 insertions, 4732 deletions | Includes prior P0 remediation, stale DB cleanup, `.ai` cleanup, deleted debug routes, PayRex SDK removal, and rollback archive move. |
| `git diff --check` | Pass | No whitespace errors. |
| Broad `.ai`/docs diff | Present | Requires human semantic review before commit/release. |

The latest Supabase verification attempt made no file changes, so repository docs needed this report to preserve the latest status.

## 3. Supabase Verification Target

| Item | Status |
| --- | --- |
| Target used | None |
| Docker | Unavailable in the latest environment |
| Supabase CLI | Available: `2.98.0` |
| `supabase/config.toml` | Missing |
| `supabase/seed.sql` | Absent |
| `bunx supabase status` | Blocked by Docker daemon/container unavailability |
| `bunx supabase migration list` | Reached an unclear remote/cached context and was not accepted as staging verification |
| Production database | Untouched |

Important warning: the remote/cached context reached by `bunx supabase migration list` must **not** be treated as staging verification. Do not regenerate types from that context. Do not apply migrations there.

## 4. Migration Replay / Migration Health

- Active migration count: 101.
- Migration replay was not run because no safe non-production target was available.
- `supabase/migrations/rollback_lea_to_ale.sql` is absent from active migrations.
- Archived rollback exists: `.ai/09_archive/store/DB_ROLLBACKS/2026-05-05/rollback_lea_to_ale.sql`.
- Archive README exists and states rollback SQL must not be treated as a forward migration.
- Static scan found many `SECURITY DEFINER` and grant statements; focused DB security review remains appropriate during replay/staging verification.

Migrations remain a deployable source-of-truth candidate, but only after clean local/staging replay verification.

## 5. AI Audit Access-Control Verification

Migration under review:

- `supabase/migrations/20260505145349_restrict_ai_audit_admin_access.sql`

Static review indicates the migration revokes authenticated `SELECT`/`EXECUTE` from sensitive AI audit views/RPC and grants intended access to `service_role`.

DB-level verification was not completed:

- Learner denial checks were not run.
- `service_role`/admin success checks were not run.
- Admin app path static review looked correct, but staging/app verification is still required.

### Manual DB verification checklist

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

Through the app:

- Authorized staff should access `/admin/ai-audit` and child routes.
- Learner/non-admin users should not access admin AI audit routes.
- Learner-facing APIs must not expose `correct_option_id`, answer keys, staff question text, article content previews, finding snippets, or AI rationale summaries.

## 6. Supabase Type Regeneration

Current type file:

- `src/types/supabase.ts`

Types were not regenerated because there was no verified local/staging schema target. Do not hand-edit generated database types.

Missing from current types:

- `ai_audit_article_overview`
- `ai_audit_question_overview`
- `ai_audit_design_scenario_question_overview`
- `ai_audit_all_question_overview`
- `ai_audit_dashboard_summary`
- `ai_audit_finding_overview`
- `seed_ai_audit_status_cache`

Present in current types:

- `taxonomy_tree`
- `user_srs_cards`
- `quiz_sessions`

Only regenerate from a verified local/staging schema.

Required commands once a verified target exists:

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

## 7. Stale DB Reference Recheck

Static stale DB cleanup remains effective.

No active `.from()` calls remain in `src` for:

- `taxonomy_nodes`
- `srs_queue`
- `exam_profiles`
- `subjects`
- `review_sessions`
- `cage_verifications`
- `teach_back_responses`

No active stale `quiz_sessions` query shape remains for:

- `total_questions`
- `correct_count`
- `mode`
- `score`

Docs, reports, comments, or tests may still mention those objects if clearly historical.

## 8. Production Environment Review

Docs/code were reviewed. Actual deployment/platform environment values were not verified.

Required production env:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — server-only
- `CRON_SECRET` — non-empty if cron routes are deployed
- `NEXT_PUBLIC_APP_URL`
- `ADMIN_EMAILS` / `OWNER_EMAILS` only if needed by bootstrap plan

Forbidden production env:

- `DEV_FORCE_USER_ID`
- `DEV_FORCE_TIER`
- `ALLOW_DEV_PORTAL_BYPASS=true`
- Any `NEXT_PUBLIC_*` service role key
- Any local/staging Supabase URL in production

Deferred/future env:

- `NEXT_PUBLIC_PAYMENTS_ENABLED`
- `PAYMENT_PROVIDER`
- `PAYREX_SECRET_KEY`
- `PAYREX_WEBHOOK_SECRET`
- `AI_PROVIDER`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`

Payment env vars are not required for the current launch. Live AI provider env vars are not required for the current launch. Actual deployment env review remains a human/platform checklist item.

## 9. `.ai` / Docs Diff Review

Required folders exist:

- `.ai/00_system/`
- `.ai/01_roadmap/`
- `.ai/02_audits/`
- `.ai/03_plans/`
- `.ai/09_archive/`
- `.ai/10_state/`

Preserved plan folder exists:

- `.ai/03_plans/preserved/2026-05-05-superseded-content-editorial-pipeline-inputs/`

53 preserved plan files were previously confirmed.

Broad `.ai`/docs diff still requires human semantic review before commit. Do not reorganize further unless a clear issue is found.

## 10. Validation Results

| Command | Result | Notes |
| --- | --- | --- |
| `git diff --check` | Pass | No whitespace errors. |
| `bun run type-check` | Pass | TypeScript validation passed. |
| `bun test src/` | Pass | 725 tests passed. |
| `bun run test:dom` | Pass | 53 tests passed. |
| `bun run lint` | Pass with warnings | 11 warnings, 0 errors. |
| `bun audit` | Pass | No vulnerabilities found. |
| `bun run build` | Pass | 101 static pages generated. |
| `bun run check:entitlements` | Pass | Entitlement legacy usage check passed. |
| `bun run test:e2e:prod` | Pass | 42 tests passed. |
| `bunx supabase --version` | Pass | `2.98.0`. |
| `docker --version` | Fail / not available | Docker unavailable. |
| `bunx supabase status` | Blocked | Docker unavailable. |
| Migration replay | Not run | No safe verification target. |
| AI audit learner denial SQL | Not run | No safe verification target. |
| AI audit `service_role` success SQL | Not run | No safe verification target. |
| Type generation | Not run | No verified schema target. |

## 11. Remaining Launch Blockers

### Still must fix before production

1. Safe Supabase verification target.
2. `supabase/config.toml` restored or created for local workflow.
3. Migration replay of all 101 active migrations.
4. DB verification of AI audit access-control migration.
5. Regeneration of `src/types/supabase.ts` from verified schema.
6. Production/staging env platform review.
7. Human semantic review of broad `.ai`/docs diff before commit/release.

### Should fix before beta

1. Clean remaining lint warnings.
2. Fix or explain `--localstorage-file` build warning.
3. Add DB verification runbook.
4. Add CI/schema drift check for generated Supabase types.
5. Add staging smoke tests for admin AI audit and learner denial.
6. Verify learner-facing APIs do not expose answer keys, `correct_option_id`, audit snippets, or content previews.

### Can fix after launch

1. Full schema squash/reset decision after source-of-truth stabilizes.
2. Broader `.ai` archive consolidation.
3. README/static count refresh.
4. Legacy payment schema/type residue cleanup.

### Future roadmap

1. Payment provider reintroduction.
2. PayRex checkout/webhook staging QA.
3. Live AI chatbot/provider launch.
4. AI-provider-backed tutoring QA.

## 12. Final Verdict

- Production-ready: **No**.
- App-layer beta candidate: **Yes**.
- Full beta/release: blocked until DB verification target, migration replay, AI audit permission verification, regenerated types, and env platform review are completed.
- Next engineering priority: create/restore local Supabase verification path on a Docker-enabled machine or provide an explicit staging project intended for testing.
