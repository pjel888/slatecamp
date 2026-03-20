# External Integrations

## Database — Supabase (PostgreSQL)

- **Client creation:** `src/lib/supabase/server.ts` (server), `src/lib/supabase/client.ts` (browser)
- **Admin client:** `src/lib/supabase/admin.ts` — Service role key, bypasses RLS
- **Auth:** Cookie-based via `@supabase/ssr`, session refresh in middleware
- **Middleware:** `src/lib/supabase/middleware.ts` — Route protection, admin gating
- **Demo mode:** Mock Supabase client at `src/lib/demo/mock-supabase.ts` — returns fake data when `NEXT_PUBLIC_SUPABASE_URL` is absent
- **Seed data:** `src/lib/supabase/seed.sql`, `src/data/seed/`
- **Schema reference:** `DATABASE_SCHEMA.sql` (root)

### Env Vars
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## AI — Anthropic Claude

- **SDK:** `@anthropic-ai/sdk` (direct, not Vercel AI SDK)
- **Provider:** `src/lib/ai/provider.ts` — Abstraction over OpenAI + Anthropic
- **Endpoints:**
  - `src/app/api/ai/tutor/route.ts` — AI contextual tutor
  - `src/app/api/ai/study-agent/route.ts` — Study agent
  - `src/app/api/ai/generate-questions/route.ts` — AI question generation
  - `src/app/api/ai/embed/route.ts` — Text embeddings
- **Models used:** Claude Sonnet 4 (Anthropic), GPT-4o (OpenAI), text-embedding-3-small
- **Config:** `src/lib/ai/config.ts`, `src/lib/ai/prompts.ts`

### Env Vars
- `AI_PROVIDER` (default: "openai")
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`

## Payments — Stripe

- **Server:** `stripe` package
- **Client:** `@stripe/stripe-js`
- **Checkout:** `src/app/api/payments/checkout/route.ts`
- **Webhooks:** `src/app/api/webhooks/stripe/route.ts`
- **Config:** `src/lib/stripe/` directory

### Env Vars
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Payments — PayRex (Philippines)

- **SDK:** `payrex-node`
- **Webhooks:** `src/app/api/webhooks/payrex/route.ts`
- **Config:** `src/lib/payrex/config.ts`

### Env Vars
- `PAYREX_SECRET_KEY`

## Cron Jobs

- `src/app/api/cron/blindspot-scan/route.ts` — Identifies knowledge gaps
- `src/app/api/cron/compute-signals/route.ts` — Computes learning signals

### Env Vars
- `CRON_SECRET` — Vercel cron job authentication

## Authentication

- **Provider:** Supabase Auth (email/password, Google OAuth)
- **Flow:** Cookie-based SSR, middleware session refresh
- **Routes:** `src/app/(auth)/` — Login, register, forgot-password, onboarding
- **Callback:** `src/app/auth/callback/` — OAuth callback handler
- **Admin roles:** `src/lib/admin/roles.ts` — `canReviewContent()` for admin gating

## Image Hosting

- **Remote patterns:** Supabase Storage (`*.supabase.co`), Google avatars (`lh3.googleusercontent.com`)
- **Upload:** `src/lib/notes/uploadImage.ts`, `src/lib/wiki/uploadImage.ts`

## Analytics

- **Client:** `src/lib/analytics.ts` (browser)
- **Server:** `src/lib/analytics-server.ts` (server actions)
- **Custom events tracking** — No third-party analytics SDK detected

## Feature Flags

- **Config-driven:** `src/config/feature-flags.ts` — 7 flags (3d_lab, ai_tutor, srs_review, org_dashboard, seat_management, dev_badges, dev_console)
- **Resolution:** Dev override → DB value → config default
- **API:** `src/app/api/admin/flags/route.ts`
- **Hook:** `src/lib/hooks/useFeatureFlag.ts`
- **Actions:** `src/lib/actions/feature-flags.ts`
