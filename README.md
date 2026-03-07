# Project Cerebro

AI-Adaptive Board Exam Prep Platform — a cognitive-first test prep system that measures what you know, identifies what you don't, adapts in real-time, and provides an AI-powered study partner.

Built for board exam takers across professions (architecture, medicine, law, engineering), starting with the Philippine Architecture Licensure Exam (ALE).

---

## Architecture Overview

### Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | [Next.js](https://nextjs.org) (App Router) | 16.1.6 |
| Bundler | [Turbopack](https://turbo.build/pack) (Rust-based, built into Next.js) | — |
| Language | TypeScript (strict mode) | 5.9 |
| Database | [Supabase](https://supabase.com) (PostgreSQL + pgvector + RLS) | — |
| Auth | Supabase Auth (email/password, Google OAuth, cookie sessions via `@supabase/ssr`) | — |
| Styling | [Tailwind CSS](https://tailwindcss.com) v4 + [shadcn/ui](https://ui.shadcn.com) | 4.2 |
| UI Components | shadcn/ui (Base Nova style, Rams Standard custom theme) | 4.0 |
| Payments | [PayRex](https://payrex.com) (primary — GCash, Maya, Card, QR Ph) + [Stripe](https://stripe.com) (international fallback) | — |
| AI | OpenAI (GPT-4o, text-embedding-3-small) / Anthropic Claude (configurable) | — |
| SRS Engine | SM-2 algorithm + Item Response Theory (IRT) | — |
| Charts | [Recharts](https://recharts.org) | 3.8 |
| Email | [Resend](https://resend.com) | — |
| PDF Processing | pdf-parse | — |
| Analytics | [PostHog](https://posthog.com) | — |
| Deployment | [Vercel](https://vercel.com) | — |

### Design System — "Rams Standard"

Braun-inspired minimal aesthetic. Achromatic palette (warm whites, greys, charcoal) with functional accent colors (amber for CTAs, green for correct, red for errors, blue for informational). No gradients. Transitions at 150ms ease. Mobile-first with 44px minimum touch targets.

### Architecture Principles

- **Server Components First** — `'use client'` only for interactivity (`useState`, `useEffect`, event handlers)
- **Server Actions for Mutations** — all database writes through Server Actions, never client-side Supabase writes
- **Cookie-based Auth** — `@supabase/ssr`, no localStorage for auth state
- **RLS on Everything** — every Supabase table has Row Level Security policies
- **Type Safety End-to-End** — Supabase-generated types flow DB → Server → Client
- **Admin Tier Override** — `getAdminAwareProfile()` + `hasTierAccess()` for all tier checks

---

## Project Structure

```
project-cerebro/
├── middleware.ts                 # Next.js auth middleware (Supabase session refresh)
├── next.config.ts               # Next.js + Turbopack configuration
├── postcss.config.mjs           # PostCSS with Tailwind CSS v4
├── components.json              # shadcn/ui configuration
├── .cursorrules                 # AI coding assistant rules
├── .env.local                   # Environment variables (not committed)
│
├── supabase/
│   └── migrations/              # SQL migrations
│       ├── 001_initial_schema.sql
│       └── 002_admin_and_payrex.sql
│
├── public/                      # Static assets
│
└── src/
    ├── app/                     # Next.js App Router
    │   ├── layout.tsx           # Root layout (fonts, providers, metadata)
    │   ├── page.tsx             # Landing page
    │   ├── globals.css          # Tailwind + CSS variables (Rams Standard theme)
    │   │
    │   ├── (auth)/              # Auth route group (unprotected)
    │   │   ├── login/           # Email/password + Google OAuth login
    │   │   ├── register/        # Registration flow
    │   │   ├── forgot-password/ # Password reset
    │   │   └── onboarding/      # Post-registration wizard (profession, exam target)
    │   │
    │   ├── dashboard/           # Protected dashboard routes (/dashboard/*)
    │   │   ├── layout.tsx       # Dashboard shell (sidebar + navbar)
    │   │   ├── page.tsx         # Dashboard home (stats overview, streak, SRS due)
    │   │   ├── quiz/            # Quiz engine
    │   │   │   ├── page.tsx     # Quiz setup (bank, domain, difficulty selection)
    │   │   │   └── [sessionId]/ # Active quiz session
    │   │   ├── review/          # Spaced repetition review queue
    │   │   ├── library/         # Question banks
    │   │   │   ├── upload/      # PDF upload + AI question generation
    │   │   │   └── marketplace/ # Community question bank marketplace
    │   │   ├── 3d-lab/          # 3D interactivity module (Pro+ tier)
    │   │   ├── tutor/           # Socratic AI tutor (Max tier)
    │   │   ├── analytics/       # Performance charts, domain radar, streaks
    │   │   └── settings/        # Profile, billing, developer tools
    │   │       ├── billing/     # Subscription management + PayRex/Stripe checkout
    │   │       └── developer/   # Admin-only feature flag panel
    │   │
    │   ├── api/                 # API routes
    │   │   ├── ai/              # AI endpoints (tutor, embed, generate-questions)
    │   │   ├── payments/        # Checkout session creation
    │   │   ├── pdf/             # PDF processing pipeline
    │   │   ├── webhooks/        # Payment webhooks (PayRex + Stripe)
    │   │   └── admin/           # Admin feature flag management
    │   │
    │   └── auth/
    │       └── callback/        # Supabase OAuth callback handler
    │
    ├── components/
    │   ├── ui/                  # shadcn/ui primitives (button, card, dialog, etc.)
    │   ├── quiz/                # Quiz-specific (QuestionCard, ChoiceButton, Timer, etc.)
    │   ├── analytics/           # Charts (PerformanceChart, DomainRadar, StreakCalendar)
    │   └── shared/              # Layout (Sidebar, Navbar, BottomNav, ThemeToggle)
    │
    ├── lib/
    │   ├── supabase/            # Supabase clients (server, client, admin, middleware)
    │   ├── demo/                # Demo mode: config, mock data, mock Supabase client
    │   ├── ai/                  # AI provider abstraction + system prompts
    │   ├── srs/                 # SM-2 algorithm + IRT implementation
    │   ├── payments/            # Payment provider abstraction (PayRex/Stripe)
    │   ├── payrex/              # PayRex client + plan config
    │   ├── stripe/              # Stripe client config
    │   ├── admin/               # Feature flags + admin-aware profile logic
    │   └── utils/               # Constants, helpers
    │
    └── types/
        ├── app.ts               # App-specific types (Profile, Question, Session, etc.)
        └── payrex-node.d.ts     # PayRex SDK type declarations
```

---

## Prerequisites

- **Node.js** >= 18.17 (LTS recommended)
- **npm** >= 9 (included with Node.js)
- **(Optional)** A Supabase project, AI API keys, payment keys — all optional thanks to Demo Mode

---

## Environment Variables

Copy the template and fill in your keys:

```bash
cp .env.local.example .env.local
```

Or create `.env.local` manually with these variables:

```env
# ─── Supabase ───────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ─── AI ─────────────────────────────────────────────────
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...          # optional, for Claude provider
AI_PROVIDER=openai                     # "openai" or "anthropic"

# ─── Payments ───────────────────────────────────────────
PAYMENT_PROVIDER=payrex                # "payrex" (default) or "stripe"

# PayRex (Philippines — GCash, Maya, Card, QR Ph)
PAYREX_SECRET_KEY=
PAYREX_WEBHOOK_SECRET=
NEXT_PUBLIC_PAYREX_PUBLIC_KEY=

# Stripe (international fallback)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRO_PRICE_ID=
STRIPE_MAX_PRICE_ID=

# ─── Email ──────────────────────────────────────────────
RESEND_API_KEY=

# ─── Analytics ──────────────────────────────────────────
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# ─── App ────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start in Demo Mode (no external services needed)

```bash
npm run dev
```

That's it. Open [http://localhost:3000](http://localhost:3000). The app detects that `NEXT_PUBLIC_SUPABASE_URL` is empty and automatically runs in **Demo Mode**:

- Auth is bypassed — you're auto-logged in as an admin user (Philip Lewis, Max tier)
- All pages display realistic mock data (profile stats, question banks, quiz sessions, analytics)
- The AI Tutor returns pre-written Socratic responses
- Payment checkout simulates success
- All feature gates are unlocked (3D Lab, SRS, AI Tutor)
- Developer Settings panel is accessible with full flag controls

Navigate to `/dashboard` to see the app in action.

### 3. (Optional) Connect Real Services

When you're ready to connect real services, fill in the values in `.env.local`:

**Minimum for real auth + database:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Then run the database migrations:

```bash
# Option A: Supabase CLI
supabase db push

# Option B: Paste into Supabase SQL Editor
# 1. Run supabase/migrations/001_initial_schema.sql
# 2. Run supabase/migrations/002_admin_and_payrex.sql
```

Enable required extensions:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with Turbopack (fast HMR) |
| `npm run build` | Create production build |
| `npm run start` | Start production server (requires `build` first) |
| `npm run lint` | Run ESLint on all files |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run type-check` | Run TypeScript compiler check (no emit) |

---

## Running Modes

### Development Mode

```bash
npm run dev
```

- Turbopack-powered dev server at `http://localhost:3000`
- Hot Module Replacement (HMR) — changes reflect instantly
- Reads `.env.local` automatically
- Full error overlay with source maps
- TypeScript errors shown in terminal and browser

### Production Mode

```bash
# 1. Build the optimized production bundle
npm run build

# 2. Start the production server
npm run start
```

- Turbopack-compiled production build
- Static pages pre-rendered, dynamic pages server-rendered on demand
- Server at `http://localhost:3000` by default (or set `PORT` env var)

### Production Preview (local)

To test the production build locally before deploying:

```bash
npm run build && npm run start
```

### Type Checking

```bash
npm run type-check
```

Runs the TypeScript compiler in `--noEmit` mode to verify all types are correct without producing output files. Useful for CI or pre-commit checks.

### Linting

```bash
# Check for issues
npm run lint

# Auto-fix what's possible
npm run lint:fix
```

Uses ESLint 9 with the Next.js recommended config (core-web-vitals + TypeScript rules).

---

## Database Migrations

Migrations are in `supabase/migrations/` and should be applied in order:

| Migration | Description |
|---|---|
| `001_initial_schema.sql` | Full schema — profiles, question_banks, questions, user_responses, test_sessions, srs_queue, documents, document_chunks, exam_domains, domain_mastery, daily_user_stats, marketplace_purchases. All with RLS policies. |
| `002_admin_and_payrex.sql` | Adds `is_admin` flag and `payrex_customer_id` to profiles, `payment_provider` to marketplace_purchases. |

### Applying migrations

```bash
# With Supabase CLI linked to your project
supabase link --project-ref your-project-ref
supabase db push

# Or manually via SQL Editor in Supabase Dashboard
```

### Making yourself an admin

After creating your account, run this in the Supabase SQL Editor:

```sql
UPDATE profiles SET is_admin = TRUE WHERE email = 'your@email.com';
```

This gives you access to the Developer Settings panel at `/dashboard/settings/developer` where you can spoof tier levels and bypass feature gates for testing.

---

## Payment Configuration

The app uses a provider abstraction layer (`src/lib/payments/provider.ts`) that switches between PayRex and Stripe based on the `PAYMENT_PROVIDER` env var.

### PayRex (default — Philippines)

PayRex supports GCash, Maya, Card, and QR Ph payments. Set up:

1. Create a PayRex account at [payrex.com](https://payrex.com)
2. Get your API keys from the PayRex dashboard
3. Set up a webhook endpoint pointing to `https://your-domain.com/api/webhooks/payrex`
4. Fill in `PAYREX_SECRET_KEY`, `PAYREX_WEBHOOK_SECRET`, and `NEXT_PUBLIC_PAYREX_PUBLIC_KEY`

### Stripe (international fallback)

For non-PH users or if PayRex is unavailable:

1. Create Stripe products/prices for Pro (₱499/mo) and Max (₱999/mo)
2. Set `PAYMENT_PROVIDER=stripe` in `.env.local`
3. Configure webhook at `https://your-domain.com/api/webhooks/stripe`
4. Fill in all `STRIPE_*` env vars

### Subscription Tiers

| Tier | Price | Features |
|---|---|---|
| Free | ₱0 | 50 questions/day, basic analytics |
| Pro | ₱499/mo | Unlimited questions, 3D Lab, SRS, AI PDF ingestion (10 docs/mo), detailed analytics |
| Max | ₱999/mo | Everything in Pro + Socratic AI Tutor, predictive modeling, unlimited PDF ingestion |

---

## Admin & Developer Tools

### Feature Flag System

Admin users (`is_admin = TRUE` in profiles) have access to a Developer Settings panel at `/dashboard/settings/developer`. This allows:

- **Tier Spoofing** — temporarily act as Free, Pro, or Max user
- **Gate Bypassing** — skip 3D Lab, AI, or SRS tier gates individually
- **Session-only** — stored in cookies, never modifies database records

Feature flags are checked via `getAdminAwareProfile()` and `hasTierAccess()` from `src/lib/admin/`. All tier-gated pages use these functions.

### Admin Override Logic

- Admins default to Max-tier access
- Can downgrade their effective tier via Developer Settings to test lower-tier experiences
- The sidebar and navbar show a "Dev Settings" link for admin users

---

## Deploying to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or link and deploy to production
vercel --prod
```

### Required Vercel environment variables

Add all variables from `.env.local` to your Vercel project settings (Settings > Environment Variables). Make sure to set:

- All `NEXT_PUBLIC_*` variables for both Preview and Production environments
- All server-side keys (`SUPABASE_SERVICE_ROLE_KEY`, `PAYREX_SECRET_KEY`, etc.) for Production only
- `NEXT_PUBLIC_APP_URL` to your production domain

### Webhook URLs

After deploying, update your webhook endpoints:

- **PayRex**: `https://your-domain.com/api/webhooks/payrex`
- **Stripe**: `https://your-domain.com/api/webhooks/stripe`

---

## Development Modes

The app supports two developer-facing modes. Both include a **floating Dev Toolbar** in the bottom-right corner of every dashboard page for instant tier switching and feature gate control.

### Mode 1: Demo Mode (No Services)

Run the entire app without Supabase, AI, payments, or any external service. Activates automatically when `NEXT_PUBLIC_SUPABASE_URL` is empty.

```bash
# Just install and run — no .env.local configuration needed
npm install
npm run dev
```

| Layer | Demo Behavior |
|---|---|
| **Auth** | Middleware passes all requests through. `supabase.auth.getUser()` returns a demo user. |
| **Database** | A mock Supabase client (`src/lib/demo/mock-supabase.ts`) intercepts all `.from().select()` chains and returns data from `src/lib/demo/data.ts`. |
| **AI Tutor** | The `/api/ai/tutor` endpoint returns pre-written Socratic responses that cycle through a set of realistic architecture exam discussions. |
| **AI Embeddings** | Returns random 1536-dimensional vectors. |
| **Question Generation** | Returns demo structural engineering questions. |
| **Payments** | Checkout redirects to the billing page with `?success=true`. |
| **PDF Processing** | Returns success immediately. |
| **Feature Flags** | All gates (3D Lab, AI, SRS) are bypassed. Admin is `true`. |

**Demo user profile:**

| Field | Value |
|---|---|
| Name | Philip Lewis |
| Email | philip@cerebro.dev |
| Tier | Max (admin override) |
| Profession | Architecture |
| Exam Target | ALE 2026 |
| Streak | 14 days |

**Mock data included:**

- 5 question banks (3 official, 2 marketplace)
- 5 architecture questions with full explanations
- 5 test sessions with scores and timing
- 6 exam domains with mastery scores
- 15 days of daily study stats
- 3 uploaded documents (2 ready, 1 processing)
- SRS queue with 3 items (2 due, 1 future)

### Mode 2: Dev Mode with Real Services

Connect to real Supabase, AI, and payment services while retaining full control over which tier you're experiencing. Requires a Supabase project and (optionally) API keys.

```bash
# 1. Fill in .env.local with at minimum:
#    NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
#
# 2. Run migrations (see Database Migrations section)
#
# 3. Make yourself an admin:
#    UPDATE profiles SET is_admin = TRUE WHERE email = 'your@email.com';
#
# 4. Start the dev server
npm run dev
```

Once your profile has `is_admin = TRUE`, the Dev Toolbar appears and you can:

- Switch your effective tier to **Free**, **Pro**, or **Max** instantly
- Toggle individual feature gates (3D Lab, AI, SRS) on or off
- Test the exact UX a user on any plan would see — without changing your database record
- Access the full Developer Settings page at `/dashboard/settings/developer`

### The Dev Toolbar

A floating widget in the bottom-right corner of every dashboard page. Visible when in Demo Mode (always) or Live Mode (admin users only).

**Collapsed state:** Shows a small pill with the current mode (DEMO/LIVE) and effective tier. Click to expand.

**Expanded state:**
- **Mode indicator** — Purple "DEMO" badge or green "LIVE" badge with connection status
- **Tier switcher** — One-click buttons to switch between Free / Pro / Max / Auto (admin default)
- **Feature gates** — Toggle 3D Lab, AI Features, and SRS Review on or off individually
- **Reset** — Clears all overrides back to defaults
- **Link** — Opens the full Developer Settings page

All changes take effect immediately (page refreshes automatically). Flags are stored in a session cookie and never modify your database.

**Hide the toolbar:** Click the X button to hide it. A small wrench icon remains in the corner to bring it back.

### Switching between modes

| To switch to... | Do this |
|---|---|
| Demo Mode | Clear `NEXT_PUBLIC_SUPABASE_URL` in `.env.local` (or leave it empty), restart dev server |
| Live Dev Mode | Fill in `NEXT_PUBLIC_SUPABASE_URL` + keys in `.env.local`, restart dev server, set `is_admin = TRUE` on your profile |

---

## Key Technical Decisions

| Decision | Reasoning |
|---|---|
| **Next.js 16 + Turbopack** (not Vite) | The app relies heavily on Server Components, Server Actions, and middleware — all Next.js-specific features that Vite doesn't support. Turbopack provides Vite-equivalent (or faster) dev speeds as a Rust-based bundler integrated into Next.js. |
| **Tailwind CSS v4** (CSS-based config) | No `tailwind.config.ts` — Tailwind v4 uses CSS-based configuration via `@theme` directives in `globals.css`. |
| **shadcn/ui v4** (Base Nova style) | Copy-paste component library — components live in `src/components/ui/` and are fully customizable. Uses `@base-ui/react` primitives under the hood. |
| **PayRex over Stripe as default** | Primary market is Philippines; PayRex natively supports GCash, Maya, and QR Ph. Stripe is retained as an international fallback. |
| **Cookie-based feature flags** | Admin tier spoofing uses cookies (not database) so testing doesn't affect actual user records. |
| **SM-2 + IRT** | SM-2 handles basic spaced repetition scheduling. IRT (Item Response Theory) provides adaptive difficulty for Max-tier users. |

---

## Troubleshooting

### "Module not found" for `payrex-node` or `pdf-parse`

These packages are listed in `serverExternalPackages` in `next.config.ts` to prevent bundling issues. If you still see errors:

```bash
npm install payrex-node pdf-parse
```

### Supabase connection errors

Verify your `.env.local` has valid Supabase URL and keys. The anon key is safe to expose client-side; the service role key must stay server-side only.

### Turbopack lockfile warning

If you see "detected multiple lockfiles", the `turbopack.root` is already configured in `next.config.ts` to suppress this. Delete any stale lockfiles in parent directories if the warning persists.

### TypeScript errors after updating dependencies

```bash
npm run type-check
```

If types are mismatched after an update, try:

```bash
rm -rf node_modules .next
npm install
npm run build
```
