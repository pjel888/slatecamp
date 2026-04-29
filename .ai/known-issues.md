| Issue / Gap | Evidence | Severity | Recommended action |
|---|---|---|---|
| Broad optional route surface remains | Current route count is 105 after shim removal; CEO/developer/studio/professional/pods/result-day/DAE surfaces remain gated/internal/optional rather than deleted. | Launch warning | Keep out of public navigation; perform founder/product cutline review before external launch. |
| Legacy LemonSqueezy schema columns remain | `DATABASE_SCHEMA.sql`, `src/types/supabase.ts`, and `src/types/app.ts` still include `lemonsqueezy_customer_id` / `lemonsqueezy_subscription_id`; runtime provider/webhook/dependency were removed. | Deferred technical debt | Decide whether to keep as dormant columns or remove in explicit DB cleanup/reset PR. |
| Payment provider launch is deferred | PayRex code remains in `src/lib/payments/provider.ts`, `src/lib/payrex/config.ts`, `/api/payments/checkout`, and `/api/webhooks/payrex`, but payment UI/API are disabled by default. | Deferred post-launch | Keep `NEXT_PUBLIC_PAYMENTS_ENABLED=false`; run live PayRex staging QA only before future paid launch. |
| Live AI provider behavior is deferred | `/api/ai/*` routes remain; `src/components/quiz-v2/FeedbackPanel.tsx` disables launch-facing live AI helper UI with `LIVE_AI_HELPERS_ENABLED=false`. | Deferred post-launch | Do not require `OPENAI_API_KEY`/`ANTHROPIC_API_KEY` for current launch; verify providers before future AI launch. |
| Full release/performance matrix not fully run | Core commands passed in Plan B; this final pass reruns the feasible suite, but full `test:e2e`, `validate:release`, and `perf:all` may remain CI/staging tasks. | Launch warning | Run full matrix before external release if time/CI capacity allows. |
| Pre-existing dirty source changes remain outside this cleanup | Dirty provenance logged in `.ai/cleanup-execution-log.md` before source edits. | Commit/review risk | Review landing/sidebar/3D Lab/generated artifact diffs separately before commit. |

## Final hardening note — 2026-04-29

`bun run test:e2e:prod` initially failed because the local Playwright Chromium/headless-shell cache was missing, not because of an app assertion. `bunx playwright install chromium` restored the local browser cache and the production E2E smoke rerun passed 36/36. This is now a local tooling note, not a product launch blocker.
