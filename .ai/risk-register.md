# Risk Register

**Last updated:** 2026-05-09 OpenRouter app-provider + Codex developer-AI pivot.
**Launch stance:** payment-free and learner-facing live-AI-provider-free. PayRex checkout/webhook QA and public learner AI provider verification are deferred post-launch items, not current launch blockers. Internal developer AI is separate local tooling and Codex-first with GPT-5.5 where available; OpenRouter is reserved for app/runtime learner and user AI when intentionally enabled.

| ID | Risk | Classification | Current evidence | Recommended action | Owner |
|---|---|---|---|---|---|
| R-001 | Broad optional/internal route surface | Launch warning | 109 page routes remain, including CEO/developer/studio/professional/pods/result-day/DAE optional/internal surfaces. | Keep internal/gated surfaces out of public navigation; run founder cutline review before public launch. | Product/engineering |
| R-002 | Legacy LemonSqueezy schema/type columns remain | Deferred technical debt | Runtime LemonSqueezy route/config/dependency are removed, but `lemonsqueezy_*` columns remain in `DATABASE_SCHEMA.sql`, `src/types/supabase.ts`, and `src/types/app.ts`. | Defer to explicit DB reset/squash cleanup PR. | Backend |
| R-003 | PayRex live checkout/webhook not verified | Deferred post-launch | `src/app/api/payments/checkout/route.ts` and `src/app/api/webhooks/payrex/route.ts` remain, but `NEXT_PUBLIC_PAYMENTS_ENABLED=false` keeps them outside current launch surface. | Run PayRex staging checkout/webhook QA before any paid launch. | Product/backend |
| R-004 | Learner-facing live AI provider behavior not verified | Deferred post-launch | `/api/ai/*` routes remain and now route through `src/lib/ai/provider.ts`; launch-facing quiz AI helper UI is disabled in `src/components/quiz-v2/FeedbackPanel.tsx`. | Run OpenRouter/provider-backed smoke tests, privacy review, rate-limit review, and copy review before exposing live learner AI UI/copy. | Product/backend |
| R-005 | Pre-existing dirty source changes | Commit/review risk | Dirty provenance logged before cleanup; landing/sidebar/3D Lab and generated artifacts had prior changes. | Review separately before commit; do not conflate with this hardening diff. | Engineering |
| R-006 | Full release/performance matrix not fully run | Release warning | Core suite and production smoke pass; full `test:e2e`, `validate:release`, and `perf:all` are broad/CI-oriented and not yet run in this pass. | Run full matrix in CI/staging before external launch if capacity allows. | Engineering |
| R-007 | Generated pycache artifact is dirty | Commit hygiene risk | `.codex/skills/ui-ux-pro-max/scripts/__pycache__/core.cpython-311.pyc` is tracked and modified; it was not removed to avoid overwriting existing work. | Remove/regenerate in a separate explicit hygiene step before commit if desired. | Engineering |
| R-008 | Developer/app AI provider confusion | Mitigated, monitor | User direction on 2026-05-09: do not force OpenRouter for development; make Codex/GPT-5.5 the primary developer model. Repo Hermes scaffold and active Hermes config now use `openai-codex` + `gpt-5.5`. | Keep Codex-first developer guidance separate from app/runtime OpenRouter docs. Do not put app OpenRouter keys in developer-agent defaults. | Engineering |
| R-009 | App AI data leaves local trust boundary | Privacy/security risk | OpenRouter may route learner/user prompts and app AI payloads through upstream third-party model providers when public AI is enabled. | Before exposing learner/user AI, complete privacy, data-retention, rate-limit, cost-cap, and copy review. Never send service-role keys or raw private env values through app AI. | Engineering/product |
| R-010 | App OpenRouter budget/rate limits not validated for learners | Product AI risk | Direct short-prompt OpenRouter API smoke passed, but public learner/user workloads have not been cost-, rate-, or abuse-tested. | Add product AI budget caps, rate limits, staging smoke tests, and monitoring before public enablement. | Engineering/product |

## Updated blocker reconciliation

| Risk | Previous Status | Updated Status | Reason | Current Launch Impact | Next Action |
|---|---|---|---|---|---|
| PayRex live staging checkout/webhook verification | Launch blocker if paid launch required | Deferred post-launch | Current launch is payment-free and payment UI/API stays disabled by default. | None if `NEXT_PUBLIC_PAYMENTS_ENABLED=false`. | Verify before future paid launch. |
| LemonSqueezy runtime integration | Stubbed/cleanup blocker | Removed/deferred | Runtime route/config/test/dependency were removed in Plan B cleanup. | None; only dormant schema/type columns remain. | DB cleanup/reset PR later. |
| Live AI provider behavior verification | Launch blocker if learner AI visible | Deferred post-launch for public learner AI | Current launch is learner-facing live-AI-provider-free; public copy and quiz helper UI no longer require live providers. OpenRouter is the preferred app/runtime AI provider when learner/user AI is intentionally enabled. | None for current learner-facing launch scope. | Verify OpenRouter app runtime before future AI launch; keep developer AI Codex-first. |

## Final verification update — 2026-04-29

| Risk | Previous Status | Updated Status | Reason | Current Launch Impact | Next Action |
|---|---|---|---|---|---|
| Missing local Playwright Chromium/headless-shell cache | Temporary verification blocker | Resolved locally | `bunx playwright install chromium` restored the local cache; `bun run test:e2e:prod` reran and passed 36/36. | None. | Ensure CI/staging has Playwright browser installation/caching. |
| Full `test:e2e`, `validate:release`, and `perf:all` not run | Release warning | Non-blocking for founder/product review | Core unit/type/lint/build/prod-smoke/entitlement/3D-gate suite passed; full matrices are broader and CI/staging-sized. | No blocker for current scope. | Run before broader public launch if required by release policy. |
