# Environment

**Last Updated:** 2026-04-27

This document lists all environment variables used or referenced by SlateCamp. **No secret values are included.**

## Legend

| Requiredness | Meaning |
|--------------|---------|
| Required | Local dev/build/runtime likely breaks without it |
| Required for surface | Only needed if you use that feature |
| Optional | Code guards or fallbacks exist |
| Dev-only | Local development override; risky in production |
| Unknown | Variable exists in `.env.local` but no code usage found |

---

## Core / Auth

| Variable | Requiredness | Purpose | Where Used |
|----------|--------------|---------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Required | Supabase project URL | `src/lib/supabase/server.ts`, `client.ts`, `middleware.ts`, `src/app/layout.tsx`, many scripts |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Required | Supabase anonymous key | `src/lib/supabase/server.ts`, `client.ts`, `middleware.ts`, logout flow, demo config |
| `SUPABASE_SERVICE_ROLE_KEY` | Required for admin/scripts | Supabase service-role key | `src/lib/supabase/admin.ts`, `server.ts`, scripts, webhooks |
| `NEXT_PUBLIC_APP_URL` | Optional but expected | App origin for redirects, checkout, metadata | `src/app/layout.tsx`, `api/payments/checkout`, `developer/layout.tsx` |
| `NEXT_PUBLIC_ENABLE_DEMO_MODE` | Optional | Enable mock-data demo mode | `src/lib/demo/config.ts` |

## Payments

| Variable | Requiredness | Purpose | Where Used |
|----------|--------------|---------|------------|
| `NEXT_PUBLIC_PAYMENTS_ENABLED` | Optional | Payment feature flag | `src/lib/constants/feature-flags.ts` |
| `PAYMENT_PROVIDER` | Optional | `payrex` (default) or `lemonsqueezy` | `src/lib/payments/provider.ts` |
| `PAYREX_SECRET_KEY` | Required for PayRex | PayRex API key | `src/lib/payrex/config.ts`, checkout |
| `PAYREX_WEBHOOK_SECRET` | Required for PayRex webhooks | Webhook signature verification | `api/webhooks/payrex/route.ts` |
| `LEMONSQUEEZY_API_KEY` | Optional unless LS selected | LemonSqueezy API key | `src/lib/lemonsqueezy/config.ts` |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Required for LS webhooks | Webhook signature verification | `api/webhooks/lemonsqueezy/route.ts` |
| `LEMONSQUEEZY_PRO_VARIANT_ID` | Required for LS checkout | Pro tier plan ID | `src/lib/lemonsqueezy/config.ts` |
| `LEMONSQUEEZY_PRIME_VARIANT_ID` | Required for LS checkout | Prime tier plan ID | `src/lib/lemonsqueezy/config.ts` |
| `LEMONSQUEEZY_INSTITUTIONAL_VARIANT_ID` | Required for LS checkout | Institutional tier plan ID | `src/lib/lemonsqueezy/config.ts` |

## AI

| Variable | Requiredness | Purpose | Where Used |
|----------|--------------|---------|------------|
| `OPENAI_API_KEY` | Required for OpenAI features | OpenAI API access | `src/lib/ai/provider.ts`, content scripts |
| `ANTHROPIC_API_KEY` | Required for Anthropic features | Anthropic API access | `src/lib/ai/provider.ts`, `src/lib/actions/teach-back.ts` |
| `AI_PROVIDER` | Optional | `openai` (default) or `anthropic` | `src/lib/ai/provider.ts` |
| `AI_COMPLETION_TIMEOUT_MS` | Optional | AI completion timeout | `src/lib/ai/provider.ts` (inferred) |
| `AI_EMBEDDING_TIMEOUT_MS` | Optional | AI embedding timeout | `src/lib/ai/provider.ts` (inferred) |
| `AI_STREAM_TIMEOUT_MS` | Optional | AI streaming timeout | `src/lib/ai/provider.ts` (inferred) |

## Cron & Security

| Variable | Requiredness | Purpose | Where Used |
|----------|--------------|---------|------------|
| `CRON_SECRET` | Required for cron | Bearer token for cron route protection | `api/cron/focus-review-scan/route.ts`, `api/cron/compute-signals/route.ts` |
| `ADMIN_EMAILS` | Optional but important | Fallback admin role resolution | `src/lib/admin/is-admin.ts`, `src/lib/entitlements/resolve-role.ts` |
| `OWNER_EMAILS` | Optional but important | Fallback owner role resolution | `src/lib/admin/is-admin.ts`, `src/lib/entitlements/resolve-role.ts` |

## Dev / Test Overrides

| Variable | Requiredness | Purpose | Where Used |
|----------|--------------|---------|------------|
| `DEV_FORCE_USER_ID` | Dev-only, risky | Local user impersonation bypass | `src/lib/supabase/server.ts`, `middleware.ts`, `src/lib/entitlements/dev-overrides.ts` |
| `DISABLE_DEV_FORCE_USER_ID` | Optional, test safety | Neutralize `DEV_FORCE_USER_ID` in CI/test | `src/lib/supabase/server.ts`, `middleware.ts`, `playwright.config.ts` |
| `DEV_FORCE_TIER` | Dev-only | Override subscription tier locally | `src/lib/entitlements/dev-overrides.ts` |
| `ALLOW_DEV_PORTAL_BYPASS` | Dev-only, risky | Bypass developer portal entitlement checks | `src/lib/entitlements/dev-overrides.ts`, `middleware.ts` |

## Playwright

| Variable | Requiredness | Purpose | Where Used |
|----------|--------------|---------|------------|
| `PLAYWRIGHT_DEMO_EMAIL` | Optional | Demo auth email for e2e | `playwright.config.ts`, test fixtures |
| `PLAYWRIGHT_DEMO_ROLE` | Optional | Demo auth role for e2e | `playwright.config.ts`, test fixtures |
| `PLAYWRIGHT_DEMO_TIER` | Optional | Demo auth tier for e2e | `playwright.config.ts`, test fixtures |

## Variables with No Code Usage Found

The following variables exist in `.env.local` but no implementing code was found in `src/` or `scripts/` as of this audit. They may be planned, legacy, or used in external workflows.

| Variable | Inferred Purpose |
|----------|------------------|
| `NEXT_PUBLIC_PAYREX_PUBLIC_KEY` | PayRex client-side/public key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe client-side key |
| `STRIPE_PRO_PRICE_ID` | Stripe Pro plan price ID |
| `STRIPE_MAX_PRICE_ID` | Stripe Max plan price ID |
| `RESEND_API_KEY` | Email service (Resend) |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog analytics key |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog analytics host |
| `GOOGLE_CLOUD_PROJECT` | Google Cloud project ID |
| `GOOGLE_CLOUD_LOCATION` | Google Cloud region |

## Future Recommendation

Create a committed `.env.example` in a later implementation-approved run. Do not fabricate one during documentation-only passes.

## Evidence

- `.env.local` (redacted names only)
- `src/lib/supabase/server.ts`, `client.ts`, `admin.ts`, `middleware.ts`
- `src/lib/ai/provider.ts`
- `src/lib/payments/provider.ts`
- `src/lib/payrex/config.ts`
- `src/lib/lemonsqueezy/config.ts`
- `src/lib/entitlements/dev-overrides.ts`
- `src/lib/constants/feature-flags.ts`
- `api/cron/*/route.ts`
- `api/webhooks/*/route.ts`
- `playwright.config.ts`
