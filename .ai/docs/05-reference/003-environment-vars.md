# Environment Variables

**Status:** Active
**Analysis Date:** 2026-04-06
**Source:** `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/middleware.ts`, `src/lib/lemonsqueezy/config.ts`, `src/lib/payrex/config.ts`, `src/lib/ai/provider.ts`, `src/app/api/cron/*/route.ts`

## Overview

SlateCamp uses 19 environment variables across three categories: 6 `NEXT_PUBLIC_*` (client-safe), 11 server-only, and 2 configuration.

> **Security:** Never commit `.env` or `.env.local` to git. Server-only variables (keys, secrets) must stay out of client bundles.

---

## Public Variables (`NEXT_PUBLIC_*`)

These are exposed to the browser. Use for feature flags and non-sensitive config only.

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (e.g., `https://xxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/JWT key for client-side auth |
| `NEXT_PUBLIC_APP_URL` | Yes | Application URL (e.g., `http://localhost:3000`) |
| `NEXT_PUBLIC_DEMO_MODE` | No | Set to `"true"` to enable demo mode without database |
| `NEXT_PUBLIC_ENABLE_DEMO_MODE` | No | Alternative demo mode flag |
| `NEXT_PUBLIC_LEMONSQUEEZY_PUBLISHABLE_KEY` | No | LemonSqueezy publishable key (for future LemonSqueezy.js) |

**Usage locations:**
- `src/lib/supabase/client.ts` — Browser Supabase client
- `src/lib/supabase/middleware.ts` — Middleware auth
- `src/lib/demo/config.ts` — Demo mode detection
- `src/app/api/payments/checkout/route.ts` — CORS origin validation

---

## Server-Only Variables

These are never exposed to the browser.

### Supabase

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (prod) | Service role key for server-side operations. Bypasses RLS — never expose. |
| `DEV_FORCE_USER_ID` | Dev only | UUID to bypass auth in development. Set in `.env.local` only. |

**Usage locations:**
- `src/lib/supabase/server.ts` — Server Supabase client (with dev bypass)
- `src/lib/supabase/admin.ts` — Admin operations requiring service role

### Payments

| Variable | Required | Description |
|----------|----------|-------------|
| `LEMONSQUEEZY_API_KEY` | Yes (prod) | LemonSqueezy API secret key |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Yes (prod) | LemonSqueezy webhook signing secret (from `lemonsqueezy listen`) |
| `LEMONSQUEEZY_CAMP_PRICE_ID` | Yes (prod) | LemonSqueezy price ID for Camp subscription |
| `LEMONSQUEEZY_INSURANCE_PRICE_ID` | Yes (prod) | LemonSqueezy price ID for Insurance add-on |
| `LEMONSQUEEZY_INSTITUTIONAL_PRICE_ID` | Yes (prod) | LemonSqueezy price ID for Institutional tier |
| `PAYREX_SECRET_KEY` | Yes (prod) | PayRex API secret key |
| `PAYREX_WEBHOOK_SECRET` | Yes (prod) | PayRex webhook signing secret |

**Usage locations:**
- `src/lib/lemonsqueezy/config.ts` — LemonSqueezy client initialization
- `src/lib/payrex/config.ts` — PayRex client initialization
- `src/app/api/webhooks/lemonsqueezy/route.ts` — LemonSqueezy webhook handler
- `src/app/api/webhooks/payrex/route.ts` — PayRex webhook handler

### AI

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes (prod) | Anthropic API key for AI Contextual Tutor |

**Usage locations:**
- `src/lib/ai/provider.ts` — Claude API calls
- `src/lib/actions/teach-back.ts` — Teach-back action

### Cron / Internal

| Variable | Required | Description |
|----------|----------|-------------|
| `CRON_SECRET` | Yes (prod) | Bearer token for cron endpoint authentication |

**Usage locations:**
- `src/app/api/cron/blindspot-scan/route.ts` — Daily blindspot computation
- `src/app/api/cron/compute-signals/route.ts` — Daily competence signal update

---

## Configuration Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Auto | Set by Next.js: `development`, `production`, `test` |
| `APP_URL` | No | Alternative app URL (also `NEXT_PUBLIC_APP_URL`) |

---

## Setup

### Development

1. Copy `.env.local.example` to `.env.local` (if exists, otherwise create manually)
2. Fill in Supabase credentials from your Supabase project dashboard
3. For local development with auth bypass, add `DEV_FORCE_USER_ID=<your-user-uuid>`
4. Leave payment/AI keys empty for local dev unless testing those features

### Production (Vercel)

Set via Vercel dashboard or `vercel env add`:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# etc.
```

### LemonSqueezy Webhook Testing (Local)

```bash
lemonsqueezy listen --forward-to localhost:3000/api/webhooks/lemonsqueezy
# Returns webhook secret, set as LEMONSQUEEZY_WEBHOOK_SECRET
```

### PayRex Webhook Testing (Local)

```bash
payrex listen --forward-to localhost:3000/api/webhooks/payrex
# Returns webhook secret, set as PAYREX_WEBHOOK_SECRET
```

---

## Demo Mode

SlateCamp supports a demo mode for showcasing without database connection:

```bash
NEXT_PUBLIC_ENABLE_DEMO_MODE=true
NEXT_PUBLIC_SUPABASE_URL=   # Leave empty or set to placeholder
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Leave empty or set to placeholder
```

**Implementation:** `src/lib/demo/config.ts` checks `NEXT_PUBLIC_ENABLE_DEMO_MODE === "true"` and `src/lib/demo/data.ts` provides mock user, questions, and progress.

---

## Security Notes

1. **Service role key** — `SUPABASE_SERVICE_ROLE_KEY` bypasses all RLS. Only use in server-side code, never in API routes that accept user input without authorization checks.

2. **DEV_FORCE_USER_ID** — Only for local development. Never set in production `.env`.

3. **Webhook secrets** — Validate incoming webhooks using the secret to prevent replay attacks.

4. **Cron secret** — Bearer token authentication prevents unauthorized cron execution.

---

*Environment variables reference: 2026-04-06*

