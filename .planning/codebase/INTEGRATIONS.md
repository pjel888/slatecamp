# External Integrations

**Analysis Date:** 2026-03-19

## APIs & External Services

**AI & LLM:**
- Claude API (Anthropic) - AI Contextual Tutor for pedagogical explanations
  - SDK: `@anthropic-ai/sdk` 0.78.0
  - Auth: `ANTHROPIC_API_KEY` environment variable
  - Client Implementation: `src/app/api/ai/tutor/route.ts`
  - Model: `claude-3-5-sonnet-20241022`
  - Configuration: Temperature 0.0 (deterministic), max_tokens: 512
  - Purpose: Generates structured rationales with Misconception/Principle/Wiki Reference format

**Image & Content:**
- Google OAuth - User authentication
  - Provider: Supabase auth integration
  - Configuration: OAuth provider "google" via Supabase
  - Used in: `src/app/(auth)/login/login-form.tsx`, `src/app/(auth)/register/register-form.tsx`
  - Callback URL: `/auth/callback`

## Data Storage

**Databases:**
- PostgreSQL via Supabase
  - Connection: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
  - Client: `@supabase/supabase-js` 2.98.0 + `@supabase/ssr` 0.9.0
  - Schema: 50 tables, 13 enums, 31 triggers, 89 RLS policies, 134 indexes
  - Core tables: `profiles`, `disciplines`, `taxonomy_tree`, `quiz_sessions`, `quiz_responses`, `blindspot_queues`, `user_subscriptions`, `notes`
  - Auth: Supabase built-in auth (via `auth.users` table)
  - File location: `src/lib/supabase/` (client.ts, server.ts, admin.ts, bootstrap.ts)
  - Documentation: `DATABASE_SCHEMA.sql` (50+ tables with full schema)

**File Storage:**
- Supabase Storage (implied)
  - Remote image domains configured: `*.supabase.co`
  - Used for user avatars and potentially generated assets

**Caching:**
- None detected (no Redis, Memcached, etc.)
- React Query/SWR not in dependencies
- State management via Zustand (in-memory only)

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (custom managed)
  - OAuth: Google (primary)
  - Session: Cookie-based for server-side auth
  - Server-side helpers: `@supabase/ssr` 0.9.0
  - Authentication check: `src/lib/supabase/server.ts` (hasAuthCookie, getUserIfPresent, getUser)
  - Middleware: `src/lib/supabase/middleware.ts` (auth session refresh)
  - Bootstrap: `src/lib/supabase/bootstrap.ts` (onboarding profile creation)

**Auth Modes:**
- Server-side rendering: Uses Supabase SSR client with cookie-based sessions
- Client-side: Browser client with ANON_KEY (read-only in RLS policies)
- Admin operations: Service Role Key for server-side admin tasks (`createAdminClient`)
- Demo mode: Mock Supabase client for testing (`src/lib/demo/mock-supabase.ts`)

## Monitoring & Observability

**Error Tracking:**
- Not detected (no Sentry, Datadog, etc.)

**Logs:**
- Vercel deployment logs (production)
- Server-side action logs and error formatting: `src/lib/supabase/format-error.ts`
- Admin logs/audit logs: `audit` table in database schema
- Analytics: `src/lib/analytics.ts` (client-side event tracking)

## CI/CD & Deployment

**Hosting:**
- Vercel - Next.js cloud platform
  - Deployment: `next build && next start`
  - Dev server: `node scripts/dev.js` or `next dev --turbopack`
  - Preview deployments on pull requests

**CI Pipeline:**
- GitHub Actions (implied by Vercel integration)
- Pre-commit hooks (configured in eslint.config.mjs)
- Type checking: `tsc --noEmit`
- Linting: `eslint .`

**Cron Jobs:**
- Vercel Serverless Functions (via `vercel.json`)
- Schedule 1: `/api/cron/blindspot-scan` at `0 16 * * *` (midnight PHT = 16:00 UTC)
  - Purpose: Nightly scan of Taxonomy Heatmap for red/grey nodes, compiles 10-15 item quiz queue
  - Protection: `CRON_SECRET` Bearer token validation
  - Implementation: `src/app/api/cron/blindspot-scan/route.ts`
- Schedule 2: `/api/cron/compute-signals` at `30 16 * * *` (16:30 UTC)
  - Purpose: Calculate mastery signals and readiness scores
  - Protection: `CRON_SECRET` Bearer token validation
  - Implementation: `src/app/api/cron/compute-signals/route.ts`

## Environment Configuration

**Required env vars (Production):**
```
NEXT_PUBLIC_SUPABASE_URL=https://{project}.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY={anon-key}
SUPABASE_SERVICE_ROLE_KEY={service-role-key}
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CAMP_PRICE_ID=price_...
STRIPE_INSURANCE_PRICE_ID=price_...
STRIPE_INSTITUTIONAL_PRICE_ID=price_...
PAYREX_SECRET_KEY=...
PAYREX_WEBHOOK_SECRET=...
CRON_SECRET=Bearer token for cron job verification
```

**Optional env vars:**
```
AI_PROVIDER=anthropic (or openai, defaults to openai)
NEXT_PUBLIC_DEMO_MODE=true (enables mock Supabase for testing)
```

**Secrets location:**
- `.env.local` - Local development (NOT committed)
- Vercel Environment Variables dashboard - Production and preview secrets
- No .env.example or template detected

## Webhooks & Callbacks

**Incoming Webhooks:**
- Stripe Webhook: `/api/webhooks/stripe`
  - Events: `checkout.session.completed`, `customer.subscription.updated`, `invoice.payment_failed`, etc.
  - Signature verification: Stripe webhook secret
  - Handler: `src/app/api/webhooks/stripe/route.ts`
  - Purpose: Sync subscription tier and status to `user_subscriptions` table
  - Tier mapping:
    - `camp` (PHP₱499 / USD$9.99)
    - `insurance` (PHP₱1499 / USD$29.99)
    - `institutional` (PHP₱4999 / USD$99.99)

- PayRex Webhook: `/api/webhooks/payrex`
  - Events: `payment_intent.succeeded`, etc.
  - Signature verification: PayRex webhook secret
  - Handler: `src/app/api/webhooks/payrex/route.ts`
  - Purpose: Sync subscription tier and status for PayRex payments (PHP-denominated)
  - Tier mapping:
    - `camp` (PHP₱4,990 / month)
    - `insurance` (PHP₱14,990 / month)
    - `institutional` (PHP₱49,990 / month)

**Outgoing Webhooks:**
- None detected

## Payment Integration

**Stripe:**
- SDK: `stripe` 20.4.1 (server-side) + `@stripe/stripe-js` 8.9.0 (client-side)
- API Version: `2026-02-25.clover`
- Configuration: `src/lib/stripe/config.ts`
- Checkout: `/api/payments/checkout` creates Stripe Checkout sessions
- Plans:
  - Camp: PHP₱499/month (or USD equivalent)
  - Insurance: PHP₱1,499/month (or USD equivalent)
  - Institutional: PHP₱4,999/month (or USD equivalent)

**PayRex (Alternative):**
- SDK: `payrex-node` 1.7.3
- Configuration: `src/lib/payrex/config.ts`
- Payment Methods: `card`, `gcash`, `maya`, `qrph` (QR code for Philippine payments)
- Plans (PHP-denominated):
  - Camp: PHP₱4,990/month
  - Insurance: PHP₱14,990/month
  - Institutional: PHP₱49,990/month
- Use case: Primary payment gateway for Philippine users
- Webhook: `/api/webhooks/payrex`

## Subscription & Licensing

**Model:**
- Tier-based subscription (free, pro, enterprise implied)
- Stored in `user_subscriptions` table
- Statuses: `active`, `cancelled`, `expired`, `trialing`
- Synced from Stripe or PayRex webhooks

## Knowledge Base & Content

**Wiki/Documentation:**
- Markdown-based with TipTap rich text editing
- Embedded in database: `taxonomy_tree.wiki_items` (JSONB)
- Rendering: Next MDX Remote, React Markdown, Marked
- Editor: TipTap with extensions for tables, images, code blocks, math (KaTeX)
- File: `src/lib/wiki-markdown.ts` (HTML↔Markdown conversion)

## Data Import/Export

**CSV/PDF Support:**
- CSV: PapaParse 5.5.3 - parsing CSV/TSV data
- PDF: pdf-parse 2.4.5 - text extraction from PDFs
- Canvas: html2canvas 1.4.1 - screenshot/export to PNG

## Third-Party Integrations Summary

| Service | Purpose | Auth | Webhook | Status |
|---------|---------|------|---------|--------|
| Anthropic Claude | AI Tutor | API Key | N/A | Active |
| Google OAuth | User Auth | OAuth | Callback | Active |
| Supabase | Database + Auth | Key-based | RLS | Active |
| Stripe | Payment Processing | API Key | Yes | Active |
| PayRex | Alt. Payments (PH) | API Key | Yes | Active |
| Vercel | Deployment + Cron | Native | N/A | Active |

---

*Integration audit: 2026-03-19*
