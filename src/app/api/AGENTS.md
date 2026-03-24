<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# api

## Purpose

RESTful API routes. Serverless functions handling admin operations, AI interactions, scheduled cron jobs, payment webhooks, and content processing. All routes use Next.js App Router `route.ts` pattern (GET, POST, DELETE, etc.).

## Key Files

None at root level. All functionality is in subdirectories organized by domain.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `admin/` | Admin-only endpoints. Feature flags management (POST/DELETE for dev toggles). Requires admin auth check. |
| `ai/` | AI integrations using Anthropic Claude and embeddings. Tutor response generation (misconception + principle + wiki ref), question generation, study agent, embeddings. All require user auth + rate limiting. |
| `cron/` | Scheduled serverless functions (Vercel Cron Jobs, configured in `vercel.json`). Blindspot queue generation (nightly), signal computation. Protected by CRON_SECRET bearer token. |
| `payments/` | Payment & subscription management. Stripe/Payrex checkout creation, webhook handlers for subscription events. |
| `pdf/` | PDF document processing. Parse exam PDFs, extract question data. |
| `webhooks/` | Inbound webhooks from payment providers. Payrex and Stripe subscription status updates. |

## For AI Agents

### Working In This Directory

- All routes are **serverless functions** (stateless, single request/response per invocation).
- API routes use Next.js App Router: `export async function GET/POST/DELETE(request: Request) { ... }`.
- Authentication is **inline** (check `supabase.auth.getUser()` or verify `CRON_SECRET`).
- Rate limiting is applied per-user for AI endpoints via `checkRateLimit()`.
- Errors are returned as JSON with appropriate HTTP status codes (401 Unauthorized, 403 Forbidden, 429 Rate Limited, 500 Server Error).
- Cron jobs verify `Authorization: Bearer ${CRON_SECRET}` header, defined in `vercel.json`.

### Common Patterns

- **Auth check:** `const { data: { user } } = await supabase.auth.getUser()` then `if (!user) return new Response("Unauthorized", { status: 401 })`.
- **Cron verification:** `const authHeader = await headers().get('authorization')` then `if (authHeader !== \`Bearer ${process.env.CRON_SECRET}\`) return 401`.
- **Response format:** `NextResponse.json({ ...data })` or `new Response(message, { status: code })`.
- **Error logging:** `console.error(...)` for server-side debugging (visible in Vercel logs).
- **Admin check:** Use `isAdmin()` or `canReviewContent()` from `@/lib/admin/roles`.
- **Database operations:** Use Supabase client (server-side for regular auth, admin client for cron jobs).

## Dependencies

### Internal

- `@/lib/supabase/server` — `createClient()`, `getUser()` for authenticated endpoints.
- `@/lib/supabase/admin` — `createAdminClient()` for cron jobs (service role).
- `@/lib/admin/roles` — `isAdmin()`, `canReviewContent()` for authorization checks.
- `@/lib/rate-limit` — `checkRateLimit(key)` for AI endpoint throttling.
- `@/lib/payments/provider` — `createCheckout()` for payment integration.
- `@/lib/admin/feature-flags` — flag validation and retrieval.
- `@/lib/validations` — Zod schemas for request validation (e.g., `featureFlagsSchema`).
- `@/lib/demo/config` — `isDemoMode()` to skip auth in development.
- `@anthropic-ai/sdk` — Anthropic Claude API client for AI Tutor.
- `next/server` — `NextResponse`, `Request`, type definitions.
- `next/headers` — `headers()` for request header inspection.

<!-- MANUAL: Cron jobs configured in vercel.json. Update schedule there, not in code. -->
