# Final Launch Readiness Snapshot

**Date:** 2026-04-29
**Scope:** post-Plan-B final hardening with payments and live AI providers deferred.
**Recommendation:** **Ready for founder/product review** and ready for staging handoff of the payment-free/live-AI-provider-free scope after dirty-tree review.

## Launch Scope

### Included

- Public acquisition/auth/onboarding: `/`, `/about`, `/contact`, `/pricing`, `/try`, auth/reset/callback/onboarding routes.
- Core learner loop: dashboard, drills/quiz v2 setup/session/results/review, wiki, notes, Camp Trails, readiness analytics, flash/SRS, assessment, and 3D Lab.
- Internal launch support: admin content/taxonomy/question/assets/review/audit/settings operations, developer observability, and gated CEO/owner views where authorized.
- Supabase-backed auth/data, cron routes when `CRON_SECRET` is configured, route/API tests, Storybook/design checks, and 3D performance gates.

### Excluded from current launch

- Paid checkout/subscription launch.
- LemonSqueezy runtime behavior.
- Live OpenAI/Anthropic provider behavior in launch-facing UI.
- Destructive DB cleanup/reset/squash.

### Deferred

- PayRex staging checkout/webhook verification and paid-launch UX.
- LemonSqueezy schema/type cleanup.
- Live AI provider smoke tests and AI product copy/UI re-enablement.
- Full DB reset/squash decision.
- Full broad release/performance suites (`test:e2e`, `validate:release`, `perf:all`) in CI/staging if desired.

## Current Codebase Counts

| Metric | Current Count | Evidence |
|---|---:|---|
| Page routes | 105 | `find src/app -name page.tsx` |
| Route handlers | 12 total / 11 under `/api` | `find src/app -type f \( -name route.ts -o -name route.tsx \)` |
| Features | 27 documented | `.ai/features.md` |
| Test/spec files | 88 | `src`, `e2e`, `tests`, `.ai/00_performance/playwright` test/spec inventory |
| Storybook stories | 100 | `find . ... -name '*.stories.tsx'` excluding generated/vendor folders |
| Launch-required env vars | 4 core vars | `.ai/environment.md`: Supabase URL/anon/service role + app URL |
| Deferred provider env vars | 11 | PayRex/payment vars, AI provider vars, and LemonSqueezy legacy vars grouped in `.ai/environment.md` |
| Known deferred integrations | 3 | PayRex, LemonSqueezy, AI providers in `.ai/deferred-integrations.md` |

## Current Verification Status

| Command | Result | Notes |
|---|---|---|
| `git status --short` | Completed | Dirty provenance recorded in `.ai/cleanup-execution-log.md`; no reset/stash/checkout/discard performed. |
| `bun run test` | Passed | 620 pass / 0 fail across 73 Bun test files. |
| `bun run type-check` | Passed | TypeScript check completed after source/docs hardening. |
| `bun run lint` | Passed | Includes Storybook precheck. |
| `bun run check:storybook` | Passed | 100 story files scanned. |
| `bun run design:lint` | Passed with warnings | 0 errors, 10 existing warnings, 1 info. |
| `bun run build` | Passed | First attempt was blocked by a live local Next dev server; after stopping local dev-server PIDs, rerun passed. |
| `bunx playwright install chromium` | Completed | Restored missing local Playwright Chromium/headless-shell cache after first `test:e2e:prod` attempt failed due missing browser binary. |
| `bun run test:e2e:prod` | Passed on rerun | 36/36 production smoke/access-boundary tests passed. |
| `bun run check:entitlements` | Passed | Entitlement legacy usage check passed. |
| `bun run perf:3d:gates` | Passed | Warning/read-existing-artifact mode; no failures or warnings. |
| `git diff --check` | Passed | No whitespace errors. |

## Current Launch Blockers

No product launch blocker is currently identified for the **payment-free/live-AI-provider-free** launch scope.

## Launch Warnings

| Warning | Evidence | Mitigation |
|---|---|---|
| Broad optional/internal route surface remains | 109 page routes, including optional/internal surfaces. | Keep public navigation focused; founder cutline review before external launch. |
| Full broad suites not run in this final pass | `test:e2e`, `validate:release`, and `perf:all` are larger CI/staging-sized matrices. | Run in CI/staging before broader public launch if desired. |
| Dirty tree provenance | `.ai/cleanup-execution-log.md` records pre-existing dirty files and generated artifacts. | Review before commit; do not mix unrelated provenance. |
| Dormant LemonSqueezy schema/type fields | `DATABASE_SCHEMA.sql`, `src/types/supabase.ts`, `src/types/app.ts`. | Defer to explicit DB cleanup/reset PR. |

## Deferred Post-Launch Work

- PayRex: staging checkout, webhook, billing/cancel/support UX, and entitlement-grant verification.
- LemonSqueezy: keep removed from runtime unless deliberately reintroduced; clean dormant schema/type columns in DB cleanup PR.
- AI providers: provider-backed smoke tests, source/citation QA, rate-limit/error fallback review, and UI/copy re-enablement.
- DB reset/squash: decide before real production data if simplifying migrations/schema.
- Full suites: run `bun run test:e2e`, `bun run validate:release`, and `bun run perf:all` in CI/staging if required by release policy.

## Final Recommendation

**Ready for founder/product review.** The codebase is also a reasonable staging candidate for the payment-free/live-AI-provider-free scope once the dirty working tree is reviewed and intentionally committed. Do not treat PayRex live QA, LemonSqueezy cleanup, or live AI provider verification as blockers for this launch scope.
