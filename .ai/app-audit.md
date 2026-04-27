# App Audit

**Audit date:** 2026-04-27
**Repository:** SlateCamp
**Purpose:** Comprehensive audit of the application as it exists today.

## Executive Summary

SlateCamp is a large, mature Next.js App Router codebase for Philippine Architecture Licensure Exam (ALE) preparation. It is in a **pre-launch MVP phase** with broad feature coverage across student study flows, admin content tooling, internal developer portals, and business analytics. The dominant risk is not missing features but **documentation drift, client/server boundary blur, and operational governance** across a large surface area.

## Verified Repository Metrics

| Metric | Count | Evidence |
|--------|-------|----------|
| `page.tsx` files | 112 | `find src/app -name "page.tsx" \| wc -l` |
| `layout.tsx` files | 15 | `find src/app -name "layout.tsx" \| wc -l` |
| `loading.tsx` files | 92 | `find src/app -name "loading.tsx" \| wc -l` |
| `error.tsx` files | 7 | `find src/app -name "error.tsx" \| wc -l` |
| Route handlers | 12 | `find src/app -name "route.ts" -o -name "route.tsx" \| wc -l` |
| Component files | 716 | `find src/components -type f \| wc -l` |
| Feature files | 551 | `find src/features -type f \| wc -l` |
| Server action files | 156 | `find src/lib/actions -type f \| wc -l` |
| Query files | 19 | `find src/lib/queries -type f \| wc -l` |
| Test files (`*.test.ts`) | 69 | `find src -name "*.test.ts" \| wc -l` |
| Migration files | 92 | `ls supabase/migrations/ \| wc -l` |
| Tables | 86 | `DATABASE_SCHEMA.sql` |
| Views | 2 | `DATABASE_SCHEMA.sql` |
| Functions | 39 | `DATABASE_SCHEMA.sql` |
| Story files | 106+ | `find src -name "*.stories.tsx" \| wc -l` |
| Client components | 677 | `grep -r "use client" src --include="*.tsx" \| wc -l` |
| `AGENTS.md` files | 122 | `find . -name "AGENTS.md" \| wc -l` |

## Stack

- **Framework:** Next.js 16.2.3 (App Router, not static export)
- **React:** 19.2.5
- **TypeScript:** 5.9.3 (`strict: false`)
- **Styling:** Tailwind CSS 4.2.4
- **UI Primitives:** shadcn/ui, Radix UI, Framer Motion, Phosphor Icons, Lucide React
- **Database:** PostgreSQL 17 via Supabase
- **Auth:** Supabase Auth with RLS
- **State:** Zustand (client), Server Actions (server)
- **3D:** React Three Fiber 9.6.0, Three.js 0.183.2, @react-three/drei
- **Charts:** Recharts
- **Payments:** PayRex (primary), LemonSqueezy
- **AI:** OpenAI GPT-4o, Anthropic Claude (direct fetch, no SDK wrapper)
- **Testing:** Playwright 1.59.1, Bun native test runner
- **Package Manager:** Bun 1.3.11+
- **Deployment:** Vercel (inferred)

## Architecture

See [`.ai/architecture.md`](architecture.md) for the full architecture document.

High-level layers:
1. **App Router** (`src/app/`) — routes, layouts, loading, error boundaries
2. **Components** (`src/components/`) — UI surface spanning all portals
3. **Features** (`src/features/`) — 3D Lab and wall-configurator
4. **Library** (`src/lib/`) — server actions, queries, domain logic, integrations
5. **Data** — Supabase/PostgreSQL with 86 tables, RLS, migrations

## Feature Inventory

See [`.ai/features.md`](features.md) for the detailed feature catalogue.

### Implemented and verified
- Quiz engine (multiple modes, IRT, SRS, session review)
- Wiki with taxonomy linking, bookmarks, highlights, feedback
- 3D Lab (classical orders, FAR playground, NBCP envelope, stairway, etc.)
- Camp Trails (structured study paths)
- Admin portal (content, questions, taxonomy, pipeline, search, assets, audit)
- Developer portal (architecture docs, API reference, DB tools, console)
- CEO portal (financials, analytics, team metrics)
- Payment checkout and webhooks (PayRex + LemonSqueezy)
- Calculators and tools (CHB, drywall, flooring, paint, tiles, lot plotter)
- Notes with rich-text editing
- Analytics dashboard and readiness score
- Daily cron jobs (focus review, signal computation)
- AI tutor and embedding endpoints

### Status notes
- **LemonSqueezy SDK** is not installed; config returns `null` with a warning. LemonSqueezy webhooks exist but the checkout path may be stubbed.
- **Stripe** is referenced in `.env.local` but no implementing code exists.
- **PostHog, Resend, Google Cloud** are referenced in `.env.local` but no implementing code exists.

## Important Findings

### Strengths
- Broad feature coverage across student, admin, developer, and business surfaces
- Strong RLS and auth policy infrastructure in Supabase
- Meaningful test presence in logic-heavy areas (SRS, entitlements, quiz, calculators)
- Extensive `AGENTS.md` hierarchy for scoped guidance
- Heavy use of loading.tsx for Suspense boundaries
- Payment webhooks include idempotency guards (`processed_webhook_events`)

### Risks
- **Documentation drift:** Large surface + many docs = high staleness risk
- **Client/server boundary:** 677 client-component files indicates significant client-heavy surfaces that may affect bundle size and performance
- **Monolithic stores:** `useQuizStore.ts` is ~29 KB, suggesting concentrated client-side business logic
- **TypeScript strictness off:** `strict: false` reduces type safety guarantees
- **ESLint hooks rules disabled:** Increases risk of stale closures and effect bugs
- **Env contract incomplete:** Several env vars have no code usage; no `.env.example` exists
- **Bun install reliability:** Reported manifest resolution failures in clean environments
- **Build stability:** Historical `ENOENT: .next/required-server-files.json` failures reported

## Risks and Unknowns

1. **RLS snapshot lag:** `DATABASE_SCHEMA.sql` is authoritative but may not reflect the latest RLS/authz migrations (e.g., April 2026 fixes).
2. **Payment path readiness:** PayRex appears implemented; LemonSqueezy SDK is missing; Stripe is unimplemented.
3. **AI feature completeness:** AI routes exist (`api/ai/*`), but coverage and error handling in production are unverified.
4. **3D Lab performance:** Large bundle and runtime memory footprint; isolated in e2e tests for a reason.
5. **Demo mode safety:** `DEV_FORCE_USER_ID` and `ALLOW_DEV_PORTAL_BYPASS` are powerful local overrides that must not leak to production.
6. **External analytics gap:** No external analytics SDK integrated despite PostHog env vars present. Only internal `analytics_events` table logging exists.

## Evidence

- Repository metrics: `find src/app -name "page.tsx"`, `find src/components -type f`, etc.
- Schema: `DATABASE_SCHEMA.sql`
- Migrations: `supabase/migrations/`
- Actions: `src/lib/actions/`
- Components: `src/components/`
- Features: `src/features/3d-lab/`, `src/features/wall-configurator/`
- Tests: `e2e/`, `src/**/*.test.ts`
- Package scripts: `package.json`
- CI: `.github/workflows/storybook.yml`
- Env usage: `grep -r "process.env" src/`, `grep -r "NEXT_PUBLIC_" src/`
