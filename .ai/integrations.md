# Integrations

**Last updated:** 2026-05-09 OpenRouter provider + developer AI integration pass.
**Launch stance:** current learner-facing launch is payment-free and live-AI-provider-free. Deferred provider verification is not a launch blocker. Developer AI should prefer OpenRouter through local Hermes/tooling configuration.

| Service/library | Purpose in app | Relevant files | Configuration/env | Launch status |
|---|---|---|---|---|
| Supabase | Auth, database, service-role server operations, middleware session handling. | `src/lib/supabase/`, `middleware.ts`, `DATABASE_SCHEMA.sql`, `supabase/migrations/`, `src/types/supabase.ts` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Launch-critical |
| PayRex | Deferred checkout and payment webhook provider when payments are intentionally re-enabled. | `src/lib/payrex/config.ts`, `src/lib/payments/provider.ts`, `src/app/api/payments/checkout/route.ts`, `src/app/api/webhooks/payrex/route.ts` | `PAYMENT_PROVIDER=payrex`, `PAYREX_SECRET_KEY`, `PAYREX_WEBHOOK_SECRET`, `NEXT_PUBLIC_PAYMENTS_ENABLED` | Deferred; not current launch-blocking |
| AI provider abstraction | Deferred tutor, Socratic, study-agent, embeddings, question generation, teach-back, and maintenance AI endpoints/scripts. | `src/lib/ai/`, `src/app/api/ai/*/route.ts`, `src/lib/actions/teach-back.ts`, `scripts/normalize-distractors.ts`, `scripts/sanitize-article-refs.ts`, `src/components/quiz-v2/FeedbackPanel.tsx` | `AI_PROVIDER=openrouter`, app-runtime `OPENROUTER_API_KEY`, `OPENROUTER_*`, legacy direct `OPENAI_API_KEY`/`OPENAI_CHAT_MODEL`/`OPENAI_EMBEDDING_MODEL` and `ANTHROPIC_API_KEY`/`ANTHROPIC_CHAT_MODEL`, AI timeout vars | Deferred for learner/public launch; launch UI does not require live providers |
| Developer AI provider routing | Internal Hermes sessions, delegated agent calls, one-shot Hermes workers, companion review/planning, local developer automation, and provider-backed model-bench routing alongside Codex/OpenCode/Command Code/Kimi. | `.hermes/config.yaml`, `.hermes/.env.example`, `.hermes/docs/17-openrouter-developer-ai.md`, `.ai/00_system/OPENROUTER_DEVELOPER_AI_RUNBOOK.md`, `.ai/00_system/CODEX_ENABLEMENT_GUIDE.md`, `.ai/12_agents/repo-agent-model.md` | `OPENROUTER_API_KEY` in `~/.hermes/.env`; `model.provider=openrouter`; verified current default `model.default=deepseek/deepseek-chat`; `model.max_tokens=1000`; `delegation.provider=openrouter`; GPT-5.5 upgrade only after OpenRouter credits/limits allow it | Active/preferred for developers; separate from production launch env |
| Next.js ImageResponse | Dynamic OG score image. | `src/app/api/og/score/route.tsx` | none | Launch-supporting |
| Storybook | Component documentation/checking. | `.storybook/`, `src/**/*.stories.tsx`, `scripts/check-storybook.ts` | none required | Launch-supporting |
| Playwright | E2E and performance verification. | `e2e/`, `scripts/playwright-run.ts`, `.ai/00_performance/` | `PLAYWRIGHT_*`, `PERF_*` | Launch-supporting |

## Removed/deferred integrations

| Integration | Cleanup status | Evidence | Follow-up |
|---|---|---|---|
| LemonSqueezy | Removed from runtime launch path. | Deleted `src/lib/lemonsqueezy/config.ts`, `src/app/api/webhooks/lemonsqueezy/route.ts`, route test, and `@lemonsqueezy/lemonsqueezy.js` dependency. | Decide later whether to remove legacy schema/type columns in a DB cleanup/reset PR. |
| Stripe/PostHog/Resend/Google Cloud | Not active launch integrations from current source evidence. | Names appeared in local env docs/audit only, not active runtime code. | Do not require for launch unless reintroduced intentionally. |
