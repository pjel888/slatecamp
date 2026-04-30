# Risk Register

**Last updated:** 2026-04-30 route consolidation verification pass.
**Launch stance:** payment-free and live-AI-provider-free. PayRex checkout/webhook QA and live OpenAI/Anthropic verification are deferred post-launch items, not current launch blockers.

| ID | Risk | Classification | Current evidence | Recommended action | Owner |
|---|---|---|---|---|---|
| R-001 | Broad optional/internal route surface | Launch warning | 109 page routes remain, including CEO/developer/studio/professional/pods/result-day/DAE optional/internal surfaces. | Keep internal/gated surfaces out of public navigation; run founder cutline review before public launch. | Product/engineering |
| R-002 | Legacy LemonSqueezy schema/type columns remain | Deferred technical debt | Runtime LemonSqueezy route/config/dependency are removed, but `lemonsqueezy_*` columns remain in `DATABASE_SCHEMA.sql`, `src/types/supabase.ts`, and `src/types/app.ts`. | Defer to explicit DB reset/squash cleanup PR. | Backend |
| R-003 | PayRex live checkout/webhook not verified | Deferred post-launch | `src/app/api/payments/checkout/route.ts` and `src/app/api/webhooks/payrex/route.ts` remain, but `NEXT_PUBLIC_PAYMENTS_ENABLED=false` keeps them outside current launch surface. | Run PayRex staging checkout/webhook QA before any paid launch. | Product/backend |
| R-004 | Live AI provider behavior not verified | Deferred post-launch | `/api/ai/*` routes remain; launch-facing quiz AI helper UI is disabled in `src/components/quiz-v2/FeedbackPanel.tsx`. | Run provider-backed smoke tests before exposing live AI UI/copy. | Product/backend |
| R-005 | Pre-existing dirty source changes | Commit/review risk | Dirty provenance logged before cleanup; landing/sidebar/3D Lab and generated artifacts had prior changes. | Review separately before commit; do not conflate with this hardening diff. | Engineering |
| R-006 | Full release/performance matrix not fully run | Release warning | Core suite and production smoke pass; full `test:e2e`, `validate:release`, and `perf:all` are broad/CI-oriented and not yet run in this pass. | Run full matrix in CI/staging before external launch if capacity allows. | Engineering |
| R-007 | Generated pycache artifact is dirty | Commit hygiene risk | `.codex/skills/ui-ux-pro-max/scripts/__pycache__/core.cpython-311.pyc` is tracked and modified; it was not removed to avoid overwriting existing work. | Remove/regenerate in a separate explicit hygiene step before commit if desired. | Engineering |

## Updated blocker reconciliation

| Risk | Previous Status | Updated Status | Reason | Current Launch Impact | Next Action |
|---|---|---|---|---|---|
| PayRex live staging checkout/webhook verification | Launch blocker if paid launch required | Deferred post-launch | Current launch is payment-free and payment UI/API stays disabled by default. | None if `NEXT_PUBLIC_PAYMENTS_ENABLED=false`. | Verify before future paid launch. |
| LemonSqueezy runtime integration | Stubbed/cleanup blocker | Removed/deferred | Runtime route/config/test/dependency were removed in Plan B cleanup. | None; only dormant schema/type columns remain. | DB cleanup/reset PR later. |
| Live AI provider behavior verification | Launch blocker if AI visible | Deferred post-launch | Current launch is live-AI-provider-free; public copy and quiz helper UI no longer require live providers. | None for current launch scope. | Verify before future AI launch. |

## Final verification update — 2026-04-29

| Risk | Previous Status | Updated Status | Reason | Current Launch Impact | Next Action |
|---|---|---|---|---|---|
| Missing local Playwright Chromium/headless-shell cache | Temporary verification blocker | Resolved locally | `bunx playwright install chromium` restored the local cache; `bun run test:e2e:prod` reran and passed 36/36. | None. | Ensure CI/staging has Playwright browser installation/caching. |
| Full `test:e2e`, `validate:release`, and `perf:all` not run | Release warning | Non-blocking for founder/product review | Core unit/type/lint/build/prod-smoke/entitlement/3D-gate suite passed; full matrices are broader and CI/staging-sized. | No blocker for current scope. | Run before broader public launch if required by release policy. |
