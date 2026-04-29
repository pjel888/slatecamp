# Environment Contract

**Status:** Current after final launch hardening on 2026-04-29.
**Canonical detailed inventory:** `.ai/environment.md`.

Current launch is payment-free and live-AI-provider-free. LemonSqueezy is no longer a runtime launch integration. Do not require `LEMONSQUEEZY_*`, `PAYREX_*`, `OPENAI_API_KEY`, or `ANTHROPIC_API_KEY` variables for the current launch unless a future PR deliberately reintroduces paid/live-AI behavior.

## Required for baseline app

| Variable | Requirement | Used by | Failure mode |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Required | Supabase client/server/middleware | Auth/data access cannot initialize. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Required | Supabase client/server/middleware | Auth/data access cannot initialize. |
| `SUPABASE_SERVICE_ROLE_KEY` | Required for service-role/admin/cron paths | Supabase admin helpers | Admin/cron privileged writes fail. |
| `NEXT_PUBLIC_APP_URL` | Required for production URLs; checkout use is deferred | URL helpers and future payment checkout | Return URLs may point to local/default host. |

## Conditional launch variables

| Variable | Requirement | Used by | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_PAYMENTS_ENABLED` | Required only for paid launch | Payment UI/API feature gate | Keep false for no-payments launch. |
| `PAYMENT_PROVIDER` | Optional; only `payrex` is supported | `src/lib/payments/provider.ts` | Unsupported values throw. |
| `PAYREX_SECRET_KEY` | Deferred; required only before future live PayRex checkout | `src/lib/payrex/config.ts` | Not needed for current payment-free launch. |
| `PAYREX_WEBHOOK_SECRET` | Deferred; required only before future live PayRex webhooks | `src/app/api/webhooks/payrex/route.ts` | Verify in staging before future paid launch. |
| `CRON_SECRET` | Required for cron deployment | `src/app/api/cron/*/route.ts` | Bearer-token guard. |
| `AI_PROVIDER`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` | Deferred; required only before future live AI features | `src/lib/ai/`, `src/lib/actions/teach-back.ts` | Not needed for current live-AI-free launch. |
| `ADMIN_EMAILS`, `OWNER_EMAILS` | Required for configured admin/CEO bootstrap | role/access helpers | Use comma-separated placeholders, never real values in docs. |
| `PLAYWRIGHT_*`, `PERF_*`, `AUDIT_BASE_URL` | Test/performance automation only | E2E/perf scripts | Not production secrets. |
