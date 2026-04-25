# ENVIRONMENT_CONTRACT

## Current state

- There is currently **no committed root `.env.example`**
- Environment requirements must therefore be inferred from live code and this document

## Requiredness semantics

- `required` = local dev/build/runtime for the named surface likely breaks without it
- `optional` = code guards or fallbacks exist
- `unknown` = inferred from usage, but impact still needs implementation-time validation

## Variable contract

| Variable | Appears | Primary surfaces | Evidence paths | If missing |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | required | app runtime, auth, developer DB/tools, scripts, Supabase helpers | `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/middleware.ts`, `src/app/layout.tsx`, `src/app/developer/tools/console/page.tsx`, many `scripts/*` | local app auth/data surfaces degrade or switch to local/demo assumptions; many scripts cannot run |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | required | app runtime, auth, logout flow, demo mode | `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/middleware.ts`, `src/components/shared/LogoutButton.tsx`, `src/lib/demo/config.ts` | client/server Supabase auth path breaks |
| `SUPABASE_SERVICE_ROLE_KEY` | required for admin/scripts | admin/server-only Supabase access, webhooks, DB scripts | `src/lib/supabase/admin.ts`, `src/lib/supabase/server.ts`, many `scripts/*`, `supabase/check_db*.ts` | admin/service-role operations, scripts, and some webhook flows fail |
| `NEXT_PUBLIC_APP_URL` | optional but strongly expected | app metadata, redirects, checkout origin, developer env label | `src/app/layout.tsx`, `src/app/api/payments/checkout/route.ts`, `src/app/developer/layout.tsx` | origin and environment labeling fall back or become incorrect |
| `NEXT_PUBLIC_ENABLE_DEMO_MODE` | optional | demo mode toggle | `src/lib/demo/config.ts` | demo mode stays off |
| `NEXT_PUBLIC_PAYMENTS_ENABLED` | optional | payment feature flag | `src/lib/constants/feature-flags.ts` | payments stay disabled by default |
| `PAYMENT_PROVIDER` | optional | payment provider selection | `src/lib/payments/provider.ts` | defaults to `payrex` |
| `LEMONSQUEEZY_API_KEY` | optional unless LemonSqueezy is selected | LemonSqueezy checkout/provider path | `src/lib/payments/provider.ts`, `src/lib/lemonsqueezy/config.ts` | LemonSqueezy path stays unavailable |
| `LEMONSQUEEZY_PRO_VARIANT_ID` | required for LemonSqueezy tier checkout | payment plan config | `src/lib/lemonsqueezy/config.ts` | LemonSqueezy checkout cannot target Pro tier correctly |
| `LEMONSQUEEZY_PRIME_VARIANT_ID` | required for LemonSqueezy tier checkout | payment plan config | `src/lib/lemonsqueezy/config.ts` | LemonSqueezy checkout cannot target Prime tier correctly |
| `LEMONSQUEEZY_INSTITUTIONAL_VARIANT_ID` | required for LemonSqueezy tier checkout | payment plan config | `src/lib/lemonsqueezy/config.ts` | LemonSqueezy checkout cannot target Institutional tier correctly |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | required for live LemonSqueezy webhooks | webhook verification | `src/app/api/webhooks/lemonsqueezy/route.ts` | webhook signature validation fails |
| `PAYREX_SECRET_KEY` | required for live PayRex checkout | payment client | `src/lib/payrex/config.ts` | PayRex checkout path unavailable |
| `PAYREX_WEBHOOK_SECRET` | required for live PayRex webhooks | webhook verification | `src/app/api/webhooks/payrex/route.ts` | webhook signature validation fails |
| `OPENAI_API_KEY` | required for OpenAI-backed scripts/features | content scripts, AI provider path | `scripts/normalize-distractors.ts`, `scripts/sanitize-article-refs.ts`, `src/lib/ai/provider.ts` | related scripts/features fail |
| `ANTHROPIC_API_KEY` | required for Anthropic-backed features | AI provider, teach-back path | `src/lib/ai/provider.ts`, `src/lib/actions/teach-back.ts` | Anthropic-backed features fail |
| `AI_PROVIDER` | optional | provider selection | `src/lib/ai/provider.ts` | defaults to `openai` |
| `CRON_SECRET` | required for cron route protection | cron endpoints | `src/app/api/cron/blindspot-scan/route.ts`, `src/app/api/cron/compute-signals/route.ts` | cron auth fails |
| `ADMIN_EMAILS` | optional but operationally important | admin fallback role resolution | `src/lib/admin/is-admin.ts`, `src/lib/entitlements/resolve-role.ts` | email-based fallback admin access does not resolve |
| `OWNER_EMAILS` | optional but operationally important | owner fallback role resolution | `src/lib/admin/is-admin.ts`, `src/lib/entitlements/resolve-role.ts` | email-based owner fallback does not resolve |
| `DEV_FORCE_USER_ID` | optional, dev-only and risky | local dev impersonation and bypass paths | `src/lib/supabase/server.ts`, `src/lib/supabase/middleware.ts`, `src/lib/entitlements/dev-overrides.ts` | feature unavailable if unset; risky if misused |
| `DISABLE_DEV_FORCE_USER_ID` | optional, test/dev safety | Playwright and release validation environments that must neutralize local impersonation even when `.env.local` contains `DEV_FORCE_USER_ID` | `src/lib/supabase/server.ts`, `src/lib/supabase/middleware.ts`, `playwright.config.ts` | `DEV_FORCE_USER_ID` remains active in local dev if set |
| `DEV_FORCE_TIER` | optional, dev-only | entitlement override | `src/lib/entitlements/dev-overrides.ts` | dev tier forcing unavailable |
| `ALLOW_DEV_PORTAL_BYPASS` | optional, dev/ops-sensitive | developer portal access override | `src/lib/entitlements/dev-overrides.ts`, `src/lib/supabase/middleware.ts` | bypass unavailable; leaving it on is risky |
| `NODE_ENV` | framework-provided | multiple dev/prod branches | broad usage across app, dev overlays, Supabase helpers | behavior changes by environment; not usually manually set inside repo docs |
| `NEXT_PUBLIC_LEMONSQUEEZY_PUBLISHABLE_KEY` | unknown / likely optional | developer architecture doc display only in current evidence | `src/app/developer/architecture/page.tsx` | likely docs/inspection-only impact in current code |
| `NEXT_PUBLIC_DEMO_MODE` | unknown / likely stale alias | demo data path | `src/lib/demo/data.ts` | unclear whether this is active or legacy |

## Surface-level impact summary

- **Local dev boot** depends primarily on Supabase URL/key pair and Bun-installable dependencies
- **Auth/admin/developer access** depends on Supabase vars plus role/override vars
- **Payments** depend on feature flag plus provider-specific secrets and plan IDs
- **AI-assisted content/scripts** depend on OpenAI and/or Anthropic keys
- **Cron** depends on `CRON_SECRET`

## Unknowns

- exact minimum env set for a successful `bun run build` in a fully hydrated environment
- whether `NEXT_PUBLIC_LEMONSQUEEZY_PUBLISHABLE_KEY` is truly used outside developer docs/inspection
- whether `NEXT_PUBLIC_DEMO_MODE` is still a meaningful variable or stale alias

## Future recommendation

Create a committed `.env.example` in a later implementation-approved run.
Do not fake one in documentation-only passes.
