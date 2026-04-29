# Audit Log — Codebase Documentation Sync

**Audit date:** 2026-04-29

## Summary of what was inspected

- Root docs and `.ai/` docs.
- `package.json`, Next/TS/ESLint/Playwright config, middleware, design files.
- `src/app/**` page routes, route handlers, layouts/loading/error files.
- `src/lib/actions/**`, `src/lib/queries/**`, Supabase clients, entitlements/auth/security files.
- `DATABASE_SCHEMA.sql` and `supabase/migrations/` inventory.
- `src/components/`, `src/features/`, `src/hooks/`, `src/stores/`, `src/config/`, `scripts/`, `public/` high-level inventories.
- Tests in `src/`, `e2e/`, and `.ai/00_performance/playwright/`.
- Environment variable references in current code/script files and variable names in `.env.local`.

## Documentation files updated

README.md; .ai/README.md; .ai/project-overview.md; .ai/app-audit.md; .ai/features.md; .ai/routes.md; .ai/architecture.md; .ai/api-and-server.md; .ai/api-surface.md; .ai/data-models.md; .ai/data-model.md; .ai/ip-inventory.md; .ai/testing.md; .ai/testing-and-quality.md; .ai/developer-workflow.md; .ai/environment.md; .ai/integrations.md; .ai/ui-design-system.md; .ai/security.md; .ai/known-issues.md; .ai/known-gaps.md; .ai/codebase-map.md; .ai/audit-log.md.

## Counts

| Item | Count |
| --- | --- |
| Routes documented | 114 |
| API route handlers documented | 13 |
| Server/action/query files documented | 157 |
| Features documented | 27 |
| IP-relevant items documented | 16 |
| Test/spec files documented | 89 |
| Story files inventoried | 106 |
| Environment variables referenced in code/scripts documented | 69 |
| Schema tables documented | 76 |
| Migration files counted | 92 |


## Commands run

### Verification results

- `bun run test` — PASS: 623 tests passed, 0 failed across 74 files.
- `bun run type-check` — PASS.
- `bun run lint` — PASS (includes `check:storybook`).
- `bun run check:storybook` — PASS: 106 story files scanned, 0 placeholder marker files.
- `bun run design:lint` — PASS with warnings: 0 errors, 10 warnings, 1 info.
- `git diff --check -- README.md .ai` — PASS.
- `bun run build` — BLOCKED: refused to start while Next dev server PID 17441 was alive.


- `pwd && tmux -V && git status --short`
- `cat package.json`
- `find` inventories for AGENTS/docs/config/app/API/test files
- Python inventory generation into `.omx/audit/inventory.json`
- Python env inventory generation into `.omx/audit/env-inventory.json`
- `sed` inspections of middleware, Supabase/auth/entitlement files, config files, design files, route handlers
- `omx team ...` attempted from leader and then launched from a copied snapshot for read-only evidence lanes because the leader worktree was dirty

## Commands that failed or could not be completed

- Initial `omx team` launch from `/Users/philiplewis/slatecamp` failed with `leader_workspace_dirty_for_worktrees` because the repository had pre-existing uncommitted source changes.
- Full release/e2e suite was not run during this documentation-only audit. `bun run test`, `bun run type-check`, `bun run lint`, `bun run check:storybook`, `bun run design:lint`, and `git diff --check` were run. `bun run build` was blocked by an existing Next dev server process.

## Major discoveries

- Current page route count is 114, not older documented 125/112 counts.
- Current route handler count is 13, including `src/app/api/og/score/route.tsx`.
- Current schema parse found 76 tables in `DATABASE_SCHEMA.sql` and 92 migration SQL files.
- `.env.local` contains variable names not referenced by current code (not secrets copied): GOOGLE_CLOUD_LOCATION, GOOGLE_CLOUD_PROJECT, LEMONSQUEEZY_API_KEY, NEXT_PUBLIC_PAYREX_PUBLIC_KEY, NEXT_PUBLIC_POSTHOG_HOST, NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, RESEND_API_KEY, STRIPE_MAX_PRICE_ID, STRIPE_PRO_PRICE_ID.
- Historical finding at the time of the first documentation audit: LemonSqueezy config was stubbed despite webhook route/package presence. Resolved by the Plan B cleanup: runtime route/config/test/dependency removed; only dormant schema/type fields remain documented in `.ai/db-cleanup-deferred.md`.

## Known uncertainties

- Live external services and real credentials were not tested.
- Production hosting/deployment provider was not fully verified from repository config.
- Historical `.ai/06_specs/deep` docs may contain stale claims and should be treated as reference history unless re-verified.
- Pre-existing uncommitted source changes should be reviewed separately.

## Verifier follow-up

- A post-update verifier rejected the first pass because data-model coverage was too summarized. The follow-up update expanded `README.md`, `.ai/data-models.md`, and `.ai/data-model.md` with all 76 schema tables individually listed, including domain family, purpose/current use, field count, and representative fields in `.ai`.
- A second-pass script rechecked route/API/env/test/table coverage after that fix and reported zero missing routes, APIs, env vars, test/spec files, or schema tables.

## Follow-up recommendations

- Commit or stash current implementation changes, stop any conflicting dev server, then rerun `bun run build` and selected Playwright suites.
- Add sanitized `.env.example`.
- For current launch, PayRex/payment, LemonSqueezy, live AI, Stripe/PostHog/Resend/Google Cloud extras are deferred or non-launch; revisit only when those integrations enter scope.
- Add coverage tooling and cron/AI integration tests.

## Pre-launch readiness / cleanup audit — 2026-04-29

### Scope inspected

- Current README and root `.ai` docs from the documentation audit.
- `src/app` route inventory, `src/lib/routes.ts`, sidebar constants, middleware, route handlers, server actions/query inventory, schema tables, migrations, tests, Storybook, package scripts, environment variable docs, payment/AI/cron/demo/dev integrations, and marker searches for legacy/stub/demo/TODO/placeholder terms.
- Parallel OMX team read-only evidence lanes were launched from a snapshot because the leader worktree was dirty.

### Files created/updated by this cleanup audit

Created/updated: `.ai/prelaunch-readiness.md`, `.ai/cleanup-plan.md`, `.ai/legacy-retirement-plan.md`, `.ai/do-not-maintain.md`, `.ai/launch-cutline.md`, `.ai/risk-register.md`, `.ai/known-issues.md`, `.ai/audit-log.md`, and a concise README readiness section.

### Counts

| Item | Count |
| --- | --- |
| Routes classified | 114 |
| API route handlers classified | 13 |
| Features classified | 27 |
| Schema tables classified | 76 |
| Test/spec files classified | 89 |
| Legacy/cleanup candidates in retirement inventory | 25 |
| Do-not-maintain items | 14 |
| Readiness score categories | 12 |

### Commands run / status

- `git status --short` — completed; dirty tree includes prior docs plus pre-existing source changes.
- `tmux -V` and `command -v omx` — completed; team runtime available.
- `omx team 4:executor ...` from leader — blocked by dirty worktree; snapshot workaround launched successfully.
- `bun run type-check` — PASS.
- `bun run build` — PASS during this audit.
- `bun run check:storybook` — PASS, 106 story files scanned.
- `bun run test` — PASS, 623 tests, 74 files.
- `bun run lint` — PASS.
- `bun run design:lint` — PASS with 0 errors, 10 warnings, 1 info; warnings are unused design-token findings already suitable for cleanup planning.
- Marker searches for legacy/deprecated/old/v1/v2/compat/shim/temp/TODO/FIXME/stub/placeholder/mock/demo/experimental/beta — completed.
- Route literal reference scan and table usage scan — completed.

### Unresolved items

- Full Playwright/release/performance suite still needs a dedicated post-cleanup run.
- Team worker evidence lanes were read-only support; final docs synthesize leader + worker evidence.
- Source-code cleanup was intentionally not performed.
- Current `git status --short` still shows pre-existing source modifications and deletions outside the documentation cleanup deliverables. This audit did not revert or normalize those files, so exact provenance of those source diffs must be resolved by committing/stashing/reviewing the existing implementation branch before any cleanup PR.

### Team evidence reconciliation note

- Worker route lane was run from a snapshot and reported `/admin/taxonomy/coverage` absent; main repository verification showed `src/app/admin/taxonomy/coverage/page.tsx` exists, so that specific removal recommendation was rejected. Other worker findings were path-checked in the main worktree before being reflected in cleanup docs.

### Verifier note

- Post-update verifier found the required readiness files, tables, counts, README section, audit log, and known-issues updates present and plausible.
- The verifier could not issue an unconditional approval because the repository already contains unrelated source-code changes/deletions. Treat this as a provenance risk, not evidence that source cleanup was performed during this planning task.


## 2026-04-29 — Plan B cleanup execution

- Scope: executed recommended pre-launch Plan B cleanup for clear route shims, LemonSqueezy runtime removal, obsolete 3D/UI shims, tests, and documentation synchronization.
- Dirty tree provenance: captured in `.ai/cleanup-execution-log.md` before source edits; no reset/stash/checkout/discard performed.
- Current counts after cleanup: 105 page routes, 12 App Router route handlers (11 under `/api`), 88 test/spec files, 100 Storybook stories, 14 layouts, 92 loading states, 7 error boundaries.
- Removed route pages: `/settings`, `/test-3d`, `/admin/wiki`, `/dashboard/heatmap`, `/dashboard/trail`, `/dashboard/trails`, `/dashboard/settings/billing`, `/dashboard/settings/developer`, `/quiz`.
- Removed API/integration: `/api/webhooks/lemonsqueezy`, `src/lib/lemonsqueezy/`, `@lemonsqueezy/lemonsqueezy.js`.
- Tests updated: obsolete redirect shim assertions removed; LemonSqueezy webhook test removed; targeted route/payment/3D tests passed.
- Documentation updated: README, `.ai/routes.md`, `.ai/api-and-server.md`, `.ai/environment.md`, `.ai/integrations.md`, `.ai/testing.md`, `.ai/known-issues.md`, `.ai/risk-register.md`, `.ai/cleanup-execution-log.md`, and duplicate-doc pointers.
- Unresolved: live PayRex staging verification if paid launch is required; live AI provider verification if AI is launch-visible; database cleanup for dormant LemonSqueezy schema/type columns; full final verification matrix pending in cleanup execution log.


### Plan B verification results (2026-04-29)

- `bun run test`: passed, 620 pass / 0 fail.
- `bun run type-check`: passed.
- `bun run check:storybook`: passed, 100 stories scanned.
- `bun run lint`: passed after fixing two warnings introduced by cleanup.
- `bun run design:lint`: passed with 0 errors / 10 warnings.
- `bun run build`: passed; route manifest confirms removed route shims and LemonSqueezy webhook are absent.
- `bun run test:e2e:prod`: passed, 36 Playwright tests.
- `bun run check:entitlements`: passed.
- `bun run perf:3d:gates`: passed in warning/read-existing-artifact mode.
- `git diff --check`: passed.
- Not run: full `bun run test:e2e`, `bun run validate:release`, and `bun run perf:all`; see `.ai/cleanup-execution-log.md` for rationale.

- Post-verifier follow-up: removed residual `ROUTES.quiz.legacy` helpers and the version-0 quiz persisted-state mode migration from `src/stores/useQuizStore.ts`; reran `type-check`, `test`, `lint`, `build`, and `git diff --check` successfully.


## 2026-04-29 — Final launch hardening — payment/live AI deferred

- Scope: final post-Plan-B hardening for a payment-free and live-AI-provider-free launch.
- Created: `.ai/deferred-integrations.md`, `.ai/db-cleanup-deferred.md`, `.ai/final-launch-readiness.md`.
- Updated: README, `.ai/README.md`, environment/integrations/risk/known-issues/testing/security/data-model docs, `.ai/00_system` data/env maps, and root docs bridge pointer.
- Source hardening: public marketing copy no longer claims live AI answers; quiz Socratic/mnemonic helpers are gated off; wiki/admin preview teach-back prompts are not rendered; developer PayRex webhook copy now says upsert and single PayRex handler.
- Team: read-only evidence team `read-only-evidence-lanes-for-f` completed 3/3 tasks and was shut down.
- Counts from current source: 105 page routes; 12 route handlers total / 11 under `/api`; 88 test/spec files; 100 Storybook stories; 14 layouts; 92 loading states; 7 error boundaries.
- Deferred/not blockers for current launch: PayRex live staging checkout/webhook verification, LemonSqueezy runtime, live OpenAI/Anthropic provider verification.
- DB cleanup: dormant LemonSqueezy schema/type columns documented in `.ai/db-cleanup-deferred.md`; no destructive schema changes performed.
- Secrets: no secret values copied; docs use placeholders only.


### Final hardening verification results (2026-04-29)

- `bun run test`: passed, 620 pass / 0 fail across 73 Bun files.
- `bun run type-check`: passed.
- `bun run lint`: passed.
- `bun run check:storybook`: passed, 100 stories scanned.
- `bun run design:lint`: passed with 0 errors / 10 existing warnings.
- `bun run build`: first attempt was blocked by an existing local Next dev server; after stopping the local dev-server PIDs, rerun passed.
- `bun run test:e2e:prod`: first final-pass attempt failed because the local Playwright Chromium/headless-shell cache was missing; `bunx playwright install chromium` restored the local browser cache; rerun passed, 36/36.
- `bun run check:entitlements`: passed.
- `bun run perf:3d:gates`: passed in warning/read-existing-artifact mode.
- `git diff --check`: passed after final doc edits.
- Not run: full `bun run test:e2e`, `bun run validate:release`, and `bun run perf:all`; they remain broader CI/staging-sized checks, not current blockers for the payment-free/live-AI-free launch scope.
