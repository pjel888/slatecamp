# Environment and Configuration

**Last updated:** 2026-05-09 OpenRouter provider integration pass.
**Launch stance:** payment-free and live-AI-provider-free. PayRex, LemonSqueezy, and live OpenRouter/OpenAI/Anthropic variables are not required for the current launch scope.

No secret values are documented. Use placeholders only. Current source/search evidence found 65 distinct `process.env` names across app/scripts/perf code.

## Launch-required core variables

| Env Var | Current Launch Required? | Category | Referenced Where | Notes |
|---|---|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Yes | Core Supabase | `src/lib/supabase/client.ts`, server/middleware helpers | Client-exposed URL; placeholder only. |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Yes | Core Supabase | `src/lib/supabase/client.ts`, server/middleware helpers | Client-exposed anon key; placeholder only. |
| SUPABASE_SERVICE_ROLE_KEY | Yes for admin/cron/server operations | Core Supabase server-only | `src/lib/supabase/admin.ts` and admin/cron helpers | Server-only; never expose value. |
| NEXT_PUBLIC_APP_URL | Yes for production URLs; payment use deferred | Core URL config | URL helpers; `src/app/api/payments/checkout/route.ts` only if payments re-enabled | Use production origin placeholder. |

## Deferred provider variables

| Env Var | Current Launch Required? | Category | Referenced Where | Notes |
|---|---|---|---|---|
| NEXT_PUBLIC_PAYMENTS_ENABLED | No | Deferred payment provider | `src/lib/constants/feature-flags.ts`; pricing/upgrade/payment API | Keep `false` for current launch. |
| PAYMENT_PROVIDER | No | Deferred payment provider | `src/lib/payments/provider.ts` | Defaults to `payrex`; unsupported values throw. |
| PAYREX_SECRET_KEY | No | Deferred payment provider | `src/lib/payrex/config.ts` | Required only before future paid launch. |
| PAYREX_WEBHOOK_SECRET | No | Deferred payment provider | `src/app/api/webhooks/payrex/route.ts` | Required only before future paid launch webhooks. |
| AI_PROVIDER | No | Deferred AI provider | `src/lib/ai/provider.ts` | Prefer `openrouter`; legacy `openai` and `anthropic` direct modes remain fallback options. |
| OPENROUTER_API_KEY | No | Deferred AI provider | `src/lib/ai/provider.ts`, `src/lib/actions/teach-back.ts`, `scripts/normalize-distractors.ts`, `scripts/sanitize-article-refs.ts` | Required only when `AI_PROVIDER=openrouter`; put it in server/local env such as `.env.local`, never `NEXT_PUBLIC_*`. |
| OPENROUTER_BASE_URL | No | Deferred AI provider | `src/lib/ai/provider.ts` | Defaults to `https://openrouter.ai/api/v1`. |
| OPENROUTER_CHAT_MODEL | No | Deferred AI provider | `src/lib/ai/provider.ts` | Defaults to `openai/gpt-4o`. |
| OPENROUTER_EMBEDDING_MODEL | No | Deferred AI provider | `src/lib/ai/provider.ts` | Defaults to `openai/text-embedding-3-small`; keep 1536-dimensional embedding compatibility unless re-indexing. |
| OPENROUTER_HTTP_REFERER / OPENROUTER_APP_TITLE | No | Deferred AI provider attribution | `src/lib/ai/provider.ts` | Optional OpenRouter attribution headers; `OPENROUTER_HTTP_REFERER` falls back to `NEXT_PUBLIC_APP_URL`. |
| OPENAI_API_KEY | No | Deferred AI provider fallback | `src/lib/ai/provider.ts` | Required only when `AI_PROVIDER=openai`; not required for current launch or OpenRouter mode. |
| OPENAI_CHAT_MODEL / OPENAI_EMBEDDING_MODEL | No | Deferred AI provider fallback tuning | `src/lib/ai/provider.ts` | Optional direct OpenAI model overrides. |
| ANTHROPIC_API_KEY | No | Deferred AI provider fallback | `src/lib/ai/provider.ts` | Required only when `AI_PROVIDER=anthropic`; not required for current launch or OpenRouter mode. Anthropic direct mode covers chat; embedding calls still require direct OpenAI fallback because Anthropic has no native embedding endpoint. |
| ANTHROPIC_CHAT_MODEL | No | Deferred AI provider fallback tuning | `src/lib/ai/provider.ts` | Optional direct Anthropic chat model override. |
| AI_COMPLETION_TIMEOUT_MS | No | Deferred AI provider tuning | `src/lib/ai/provider.ts` | Optional/future AI tuning. |
| AI_EMBEDDING_TIMEOUT_MS | No | Deferred AI provider tuning | `src/lib/ai/provider.ts` | Optional/future AI tuning. |
| AI_STREAM_TIMEOUT_MS | No | Deferred AI provider tuning | `src/lib/ai/provider.ts` | Optional/future AI tuning. |
| LEMONSQUEEZY_API_KEY / LEMONSQUEEZY_WEBHOOK_SECRET | No | Removed/deferred legacy provider | Not referenced by current runtime source after Plan B cleanup | Do not require unless LemonSqueezy is deliberately reintroduced. |

## Conditional/internal/test variables

| Env Var | Current Launch Required? | Category | Referenced Where | Notes |
|---|---|---|---|---|
| CRON_SECRET | Only if cron endpoints are deployed | Launch-supporting cron | `src/app/api/cron/*/route.ts` | Bearer token for scheduled jobs. |
| ADMIN_EMAILS / OWNER_EMAILS | Yes if email allowlist bootstrap is used | Internal access | admin/CEO role helpers | Use placeholders; never commit real emails if sensitive. |
| NEXT_PUBLIC_DEMO_MODE / NEXT_PUBLIC_ENABLE_DEMO_MODE | No | Demo/local | `src/lib/demo/config.ts` | Demo behavior, not production requirement. |
| ALLOW_DEV_PORTAL_BYPASS | No | Local/dev only | `src/lib/developer/access.ts` | Must stay false in production. |
| DEV_FORCE_TIER / DEV_FORCE_USER_ID / DISABLE_DEV_FORCE_USER_ID | No | Local/dev/test only | entitlement/dev helpers and tests | Do not use in production. |
| PLAYWRIGHT_* | No | Test automation | `scripts/playwright-run.ts`, e2e/perf specs | Test-only. |
| PERF_* / THREED_* / AUDIT_BASE_URL | No | Performance/test automation | `.ai/00_performance/scripts/*` | Local/CI measurement only. |
| NODE_ENV / CI | Environment-provided | Runtime/build/test | Tooling and app checks | Not a secret. |

## Stale local variable names

Prior audits observed these names in local env files or old docs, but they are not current launch requirements from source/config/test automation: `GOOGLE_CLOUD_LOCATION`, `GOOGLE_CLOUD_PROJECT`, `NEXT_PUBLIC_PAYREX_PUBLIC_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `RESEND_API_KEY`, `STRIPE_MAX_PRICE_ID`, `STRIPE_PRO_PRICE_ID`.
