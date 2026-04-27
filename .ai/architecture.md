# Architecture

**Last Updated:** 2026-04-27

## System Overview

SlateCamp is a Next.js 16 App Router application with a server-first rendering philosophy. In practice, many surfaces are client-heavy due to interactive 3D rendering, real-time quiz state, and rich admin editors. The backend is Supabase (PostgreSQL 17) with Row Level Security (RLS), accessed via Next.js Server Actions and API route handlers.

## Directory Structure

```
src/
├── app/                    # App Router: pages, layouts, loading, error, route handlers
│   ├── (admin-public)/     # Public admin login (no portal chrome)
│   ├── (auth)/             # Login, register, forgot-password, onboarding
│   ├── (protected)/        # CEO portal (role-gated)
│   ├── admin/              # Admin portal pages
│   ├── api/                # Route handlers (AI, payments, cron, webhooks, OG)
│   ├── calculators/        # Construction calculators
│   ├── dashboard/          # Primary student surface (3D Lab, wiki, drills, notes, etc.)
│   ├── developer/          # Internal dev portal
│   ├── quiz/               # Quiz session setup, live session, results, review
│   └── tools/              # Standalone utility tools
├── components/             # UI components
│   ├── ui/                 # shadcn/ui primitives
│   ├── shared/             # Cross-cutting reusable components
│   ├── wiki/               # Article renderers, navigation, widgets
│   ├── quiz-v2/            # Quiz engine UI
│   ├── admin/              # Admin panel components
│   ├── dashboard/          # Student dashboard components
│   ├── analytics/          # Charts and metrics
│   ├── trails/             # Camp Trail UI
│   ├── calculators/        # Calculator UI
│   ├── r3f/                # React Three Fiber shared primitives
│   └── ...
├── features/               # Large feature modules
│   ├── 3d-lab/             # Interactive 3D learning (~500 files)
│   └── wall-configurator/  # Wall assembly configurator (~40 files)
├── lib/                    # Backend logic, server actions, queries
│   ├── actions/            # Next.js Server Actions (156 files)
│   ├── queries/            # Data-fetching queries (19 files)
│   ├── entitlements/       # Access control and subscription gating
│   ├── payments/           # Payment orchestration
│   ├── payrex/             # PayRex integration
│   ├── lemonsqueezy/       # LemonSqueezy integration
│   ├── ai/                 # AI/LLM helpers
│   ├── srs/                # Spaced repetition algorithms
│   ├── readiness/          # Readiness score calculations
│   ├── pd1096/             # Philippine Building Code helpers
│   ├── lot-geometry/       # Site/plot geometry
│   ├── supabase/           # Client/server/admin Supabase clients
│   ├── logging/            # Structured logging
│   ├── admin/              # Admin backend helpers
│   ├── wiki/               # Wiki data layer
│   └── ...
├── hooks/                  # Shared React hooks
├── stores/                 # Zustand stores
├── config/                 # Runtime configuration
├── data/                   # Fixtures and static data
└── types/                  # Shared TypeScript types
```

## Request / Data Flow

### Standard Page Request
1. **Edge / Middleware** (`middleware.ts`)
   - Sets `x-pathname` header
   - Calls `src/lib/supabase/middleware.ts` for session refresh
2. **Auth Middleware**
   - Refreshes Supabase auth cookies
   - Handles legacy redirects
   - Demo mode bypass
   - Dev bypass (`DEV_FORCE_USER_ID` on localhost)
   - Role-based gating for `/admin`, `/developer`, `/ceo`
3. **Layout / Page** (`src/app/.../layout.tsx`, `page.tsx`)
   - Server Components fetch data via queries or Server Actions
   - Client Components mount for interactive surfaces
4. **Data Access**
   - Reads: `src/lib/queries/` or inline Server Actions
   - Writes: `src/lib/actions/` (domain-organized)
   - Supabase clients: `server.ts` (RSC/SA), `client.ts` (browser), `admin.ts` (service role)

### API Route Handler Flow
- Used for: AI streaming, payments checkout, webhooks, cron jobs, OG image generation
- Edge runtime in some handlers (logging is console-only)
- Server runtime in others (can use `logServerEvent` to persist to `analytics_events`)

### Payment Webhook Flow
1. Provider (PayRex / LemonSqueezy) POSTs to `api/webhooks/{provider}`
2. Handler verifies signature
3. Idempotency check against `processed_webhook_events`
4. Updates `user_subscriptions` and related tables
5. Logs billing event

### Cron Job Flow
1. Vercel Cron triggers `api/cron/{job}`
2. Handler validates `Bearer ${CRON_SECRET}`
3. Executes business logic (focus review scan or signal computation)
4. Persists results to relevant tables

## Client / Server Boundaries

### Server Components (default)
- Data fetching, auth checks, entitlement resolution
- Use `src/lib/supabase/server.ts` for server client

### Client Components (`"use client"`)
- 677 files across `src/`
- Heavy concentration in:
  - `src/features/3d-lab/` (WebGL rendering, orbit controls, hotspots)
  - `src/components/quiz-v2/` (real-time quiz UI, timers)
  - `src/components/admin/` (rich editors, tables)
  - `src/components/wiki/` (interactive article widgets)

### Server Actions
- 156 files in `src/lib/actions/`
- Organized by domain: `quiz-v2/`, `admin/`, `analytics/`, `mastery/`, `wiki/`, etc.
- Called from Client Components for mutations

## Major Modules

### Quiz Engine (`src/components/quiz-v2/`, `src/lib/quiz/`, `src/lib/actions/quiz-v2/`)
- Session setup, live session UI, results, review
- State machine in `useQuizStore.ts` (~29 KB)
- Scoring, IRT difficulty tracking, error classification
- Server Actions for session creation, answer submission, completion

### Wiki System (`src/components/wiki/`, `src/lib/wiki/`, `src/lib/actions/wiki/`)
- Article rendering with MDX support
- Taxonomy-linked content via `wiki_article_taxonomy`
- Embedded quiz widgets and code-compliance widgets
- Bookmarks, highlights, feedback

### 3D Lab (`src/features/3d-lab/`)
- Scene registry and config system
- React Three Fiber canvases with custom controls, lighting, and materials
- Hotspot system for in-3D annotations and quizzes
- Dedicated Zustand stores for module state
- Heavy bundle; isolated in e2e and performance testing

### Admin Portal (`src/app/admin/`, `src/components/admin/`, `src/lib/actions/admin/`)
- Content editor with full-bleed detection
- Question bank (design problems, scenarios)
- Taxonomy tree management
- Pipeline and review workflows
- Search, assets, 3D model management
- Audit logs

### Entitlements (`src/lib/entitlements/`)
- Subscription tier resolution (`free`, `pro`, `enterprise`)
- Feature gating by tier and role
- Dev overrides (`DEV_FORCE_TIER`, `ALLOW_DEV_PORTAL_BYPASS`)
- Fallback admin/owner resolution via `ADMIN_EMAILS` / `OWNER_EMAILS`

### Payments (`src/lib/payments/`, `src/lib/payrex/`, `src/lib/lemonsqueezy/`)
- Provider abstraction (`PAYMENT_PROVIDER` env var)
- PayRex: primary Philippines gateway (GCash, Maya, card, QR Ph)
- LemonSqueezy: present but SDK not installed; config is stubbed
- Checkout route: `api/payments/checkout`
- Webhooks: `api/webhooks/payrex`, `api/webhooks/lemonsqueezy`

## Important Design Patterns

### Route Grouping
- `(auth)` — clean layout for login/register/onboarding
- `(protected)` — role-gated CEO portal
- `(admin-public)` — public admin login page

### Private Colocation
- `_components/`, `_lib/`, `_stores/` folders within route segments
- Keeps route-local code close to usage without exposing as public routes

### Loading States
- 92 `loading.tsx` files provide Suspense fallbacks across the app

### Demo Mode
- Mock Supabase client when `NEXT_PUBLIC_SUPABASE_URL` is empty and `NEXT_PUBLIC_ENABLE_DEMO_MODE` is set
- Allows local development without live backend

### Idempotency
- Payment webhooks check `processed_webhook_events` before processing
- Prevents duplicate subscription updates

### Dev Impersonation
- `DEV_FORCE_USER_ID` allows local dev to bypass auth and act as a specific user
- `DISABLE_DEV_FORCE_USER_ID` neutralizes this in CI/test environments
- **Risk:** Must never be enabled in production

## Evidence

- App structure: `src/app/`
- Components: `src/components/`
- Features: `src/features/3d-lab/`, `src/features/wall-configurator/`
- Actions: `src/lib/actions/`
- Queries: `src/lib/queries/`
- Supabase clients: `src/lib/supabase/server.ts`, `client.ts`, `admin.ts`
- Middleware: `middleware.ts`, `src/lib/supabase/middleware.ts`
- Config: `next.config.ts`
- Schema: `DATABASE_SCHEMA.sql`
