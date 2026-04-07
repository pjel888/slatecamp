<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# api

## Purpose

RESTful API routes. Serverless functions handling admin operations, AI interactions, scheduled cron jobs, payment processing, PDF parsing, and payment webhooks. All routes use Next.js App Router `route.ts` pattern (GET, POST, DELETE, etc.).

## Key Files

None at root level. All functionality is in subdirectories organized by domain.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `admin/` | Admin-only endpoints |
| `admin/flags/` | Feature flag management -- POST (set dev flag overrides via cookie), DELETE (clear overrides). Requires admin auth via `isAdmin()`. Cookie name: `cerebro_dev_flags`. |
| `ai/` | AI integrations using Anthropic Claude and embeddings |
| `ai/tutor/` | AI Contextual Tutor -- POST generates tutor responses with misconception + principle + wiki ref context. Uses `@anthropic-ai/sdk` directly. Rate-limited per user. |
| `ai/embed/` | Text embedding generation -- POST creates 1536-dimensional embeddings via AI provider. Returns mock embeddings in demo mode. |
| `ai/generate-questions/` | AI question generation -- POST generates questions with choices from topic/subject context. Uses `questionGenerationPrompt` template. |
| `ai/study-agent/` | Study agent actions -- POST handles summarize, flashcards, and code_check actions on user notes/content. |
| `cron/` | Scheduled serverless functions (Vercel Cron Jobs, configured in `vercel.json`) |
| `cron/blindspot-scan/` | Nightly blindspot scan -- GET scans Taxonomy Heatmap for red/grey nodes, compiles 10-15 item quiz queue. Schedule: `0 16 * * *` (midnight PHT). |
| `cron/compute-signals/` | Daily signal computation -- GET computes velocity, churn risk, and session stats for all active users. Schedule: `30 16 * * *` (00:30 PHT, after blindspot scan). |
| `payments/` | Payment and subscription management |
| `payments/checkout/` | Checkout session creation -- POST creates LemonSqueezy/PayRex checkout sessions. Returns checkout URL, session ID, and provider. Demo mode returns mock URL. |
| `pdf/` | PDF document processing |
| `pdf/process/` | PDF parsing endpoint -- reserved directory (currently empty, no route.ts). |
| `webhooks/` | Inbound webhooks from payment providers |
| `webhooks/lemonsqueezy/` | LemonSqueezy webhook handler -- POST verifies signature via `x-signature` header, processes subscription events (checkout.session.completed, customer.subscription.*), updates user tier. |
| `webhooks/payrex/` | PayRex webhook handler -- POST verifies signature via `payrex-signature` header, processes subscription status updates, maps payment amount to user tier. |

## For AI Agents

### Working In This Directory

- All routes are **serverless functions** (stateless, single request/response per invocation).
- API routes use Next.js App Router: `export async function GET/POST/DELETE(request: Request) { ... }`.
- Authentication is **inline** (check `supabase.auth.getUser()` or verify `CRON_SECRET`).
- Rate limiting is applied per-user for AI endpoints via `checkRateLimit()`.
- Errors are returned as JSON with appropriate HTTP status codes (401 Unauthorized, 403 Forbidden, 429 Rate Limited, 500 Server Error).
- Cron jobs verify `Authorization: Bearer ${CRON_SECRET}` header, defined in `vercel.json`.
- All AI routes support demo mode via `isDemoMode()` returning mock data.

### Common Patterns

- **Auth check:** `const { data: { user } } = await supabase.auth.getUser()` then `if (!user) return new Response("Unauthorized", { status: 401 })`.
- **Cron verification:** `const headersList = await headers()` then `headersList.get('authorization')` compared to `Bearer ${process.env.CRON_SECRET}`.
- **Webhook signature verification:** Read raw body with `request.text()`, verify signature from headers before processing.
- **Response format:** `NextResponse.json({ ...data })` or `new Response(message, { status: code })`.
- **Error logging:** `console.error(...)` for server-side debugging (visible in Vercel logs).
- **Admin check:** Use `isAdmin()` from `@/lib/admin/is-admin`.
- **Demo mode:** `isDemoMode()` returns mock/synthetic data without hitting external APIs.
- **Cron jobs use admin client:** `createAdminClient()` from `@/lib/supabase/admin` (service role, bypasses RLS).

## Dependencies

### Internal

- `@/lib/supabase/server` -- `createClient()` for authenticated endpoints
- `@/lib/supabase/admin` -- `createAdminClient()` for cron jobs (service role)
- `@/lib/admin/is-admin` -- `isAdmin()` for authorization checks
- `@/lib/rate-limit` -- `checkRateLimit(key)` for AI endpoint throttling
- `@/lib/payments/provider` -- `createCheckout()`, `tierFromAmount()` for payment integration
- `@/lib/ai/provider` -- `getAIProvider()` for AI model access
- `@/lib/ai/prompts` -- `questionGenerationPrompt` and other prompt templates
- `@/lib/demo/config` -- `isDemoMode()` to skip auth and return mock data in development
- `@/lib/validations` -- Zod schemas for request validation (e.g., `featureFlagsSchema`)
- `@/lib/lemonsqueezy/config` -- `getLemonSqueezy()` for LemonSqueezy client
- `@/lib/payrex/config` -- `getPayRex()` for PayRex client

### External

- `@anthropic-ai/sdk` -- Anthropic Claude API client for AI Tutor
- `lemonsqueezy` -- LemonSqueezy SDK for webhook signature verification and event processing
- `next/server` -- `NextResponse`, `Request` type definitions
- `next/headers` -- `headers()`, `cookies()` for request inspection

<!-- MANUAL: Cron jobs configured in vercel.json. Update schedule there, not in code. -->
