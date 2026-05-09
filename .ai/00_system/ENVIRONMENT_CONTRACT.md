# Environment Contract

**Status:** Current after 2026-05-09 OpenRouter provider integration pass.
**Canonical detailed inventory:** `.ai/environment.md`.

Current launch is payment-free and live-AI-provider-free. LemonSqueezy is no longer a runtime launch integration. Do not require `LEMONSQUEEZY_*`, `PAYREX_*`, `OPENROUTER_API_KEY`, `OPENAI_API_KEY`, or `ANTHROPIC_API_KEY` variables for the current launch unless a future PR deliberately reintroduces paid/live-AI behavior.

Payment and live AI provider env vars are not blockers for the current launch.

## Required for current launch

| Variable | Requirement | Used by | Failure mode |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Required; must point to the intended production Supabase project in production | Supabase client/server/middleware | Auth/data access cannot initialize. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Required | Supabase client/server/middleware | Auth/data access cannot initialize. |
| `SUPABASE_SERVICE_ROLE_KEY` | Required for service-role/admin/cron paths; server-only | Supabase admin helpers | Admin/cron privileged writes fail. |
| `CRON_SECRET` | Required and non-empty if cron routes are deployed | `src/app/api/cron/*/route.ts` | Cron endpoints fail closed or cannot be safely invoked. |
| `NEXT_PUBLIC_APP_URL` | Required for production URLs; checkout use is deferred | URL helpers and future payment checkout | Return URLs may point to local/default host. |
| `ADMIN_EMAILS`, `OWNER_EMAILS` | Required only if the current bootstrap plan depends on env fallback | role/access helpers | Admin/owner bootstrap may fail or depend only on DB roles. |

## Forbidden in production

| Variable/configuration | Production rule | Reason |
|---|---|---|
| `DEV_FORCE_USER_ID` | Must be absent | Local impersonation only. |
| `DEV_FORCE_TIER` | Must be absent | Local entitlement simulation only. |
| `ALLOW_DEV_PORTAL_BYPASS=true` | Must be absent or false | Developer portal bypass is not production-safe. |
| Any client-exposed service role key | Must never exist as `NEXT_PUBLIC_*` | Service role bypasses RLS and must stay server-only. |
| Local/staging Supabase URL | Must not be used in production | Prevents data/environment mixups. |

## Deferred/future variables — not required now

| Variable | Requirement | Used by | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_PAYMENTS_ENABLED` | Required only for paid launch | Payment UI/API feature gate | Keep false/absent for no-payments launch. |
| `PAYMENT_PROVIDER` | Future paid launch only; only `payrex` is supported | `src/lib/payments/provider.ts` | Unsupported values throw. |
| `PAYREX_SECRET_KEY` | Deferred; required only before future live PayRex checkout | `src/lib/payrex/config.ts` | Not needed for current payment-free launch. |
| `PAYREX_WEBHOOK_SECRET` | Deferred; required only before future live PayRex webhooks | `src/app/api/webhooks/payrex/route.ts` | Verify in staging before future paid launch. |
| `AI_PROVIDER` | Deferred; required only before future live AI features. Use `openrouter` for the preferred provider path; `openai` and `anthropic` remain direct fallback modes. | `src/lib/ai/` | Not needed for current live-AI-free launch. |
| `OPENROUTER_API_KEY` | Deferred; required only when `AI_PROVIDER=openrouter` for future live AI features | `src/lib/ai/provider.ts`, `src/lib/actions/teach-back.ts`, `scripts/normalize-distractors.ts`, `scripts/sanitize-article-refs.ts` | Paste only in server/local env such as `.env.local`; never expose as `NEXT_PUBLIC_*`. |
| `OPENROUTER_BASE_URL`, `OPENROUTER_CHAT_MODEL`, `OPENROUTER_EMBEDDING_MODEL`, `OPENROUTER_HTTP_REFERER`, `OPENROUTER_APP_TITLE` | Deferred/optional OpenRouter tuning and attribution | `src/lib/ai/provider.ts` | Defaults exist for base URL, chat model, embedding model, and app title. `OPENROUTER_HTTP_REFERER` falls back to `NEXT_PUBLIC_APP_URL`; keep embedding dimension compatibility unless re-indexing. |
| `OPENAI_API_KEY`, `OPENAI_CHAT_MODEL`, `OPENAI_EMBEDDING_MODEL` | Deferred; required/used only for legacy direct OpenAI fallback | `src/lib/ai/provider.ts` | Not required for current launch or OpenRouter mode. Model override vars are optional. |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_CHAT_MODEL` | Deferred; required/used only for legacy direct Anthropic fallback | `src/lib/ai/provider.ts` | Not required for current launch or OpenRouter mode. Chat model override var is optional. Anthropic direct mode covers chat; embedding calls still require direct OpenAI fallback because Anthropic has no native embedding endpoint. |
| `PLAYWRIGHT_*`, `PERF_*`, `AUDIT_BASE_URL` | Test/performance automation only | E2E/perf scripts | Not production secrets. |

## Platform verification status

Docs/code have been reviewed, but actual production/staging deployment environment values were not platform-verified during the latest Supabase verification attempt. Before production, confirm required variables are present and forbidden variables are absent without printing secret values.
