# Architecture

**Analysis Date:** 2026-03-19

## Pattern Overview

**Overall:** Next.js 16 App Router with server-centric composition, combining server components for data fetching with client components for interactivity. Uses Zustand for client state, server actions for mutations, and API routes for external integrations.

**Key Characteristics:**
- Server-first data fetching via server actions and server components
- Mixed RSC/client component composition with clear boundaries
- API routes for cron jobs, webhooks, and AI integrations
- Supabase for relational data + auth; mock support for demo mode
- Pedagogical domain layers (quiz, SRS, signals, readiness scoring)
- Zustand stores for client-only state (UI toggles, dev impersonation)

## Layers

**Presentation Layer:**
- Purpose: User-facing components, layouts, and interactive UI
- Location: `src/components/` (organized by feature: dashboard, quiz, wiki, assessment, 3d)
- Contains: React components (mix of server and client), page layouts, UI primitives
- Depends on: Application layer for data/actions, shared utilities
- Used by: Page routes in `src/app/`

**Application Layer (Server Actions & API Routes):**
- Purpose: Business logic orchestration, data mutations, external service calls
- Location: `src/lib/actions/` (server actions), `src/app/api/` (API routes)
- Contains: Server-side async operations, cron jobs, webhook handlers, payment/AI integrations
- Depends on: Data access layer (Supabase), external SDKs (Anthropic, Stripe, Payrex)
- Used by: Client components via form submissions, fetch calls; Pages via imports

**Domain Logic Layer (Pedagogical Modules):**
- Purpose: Specialized business logic for learning/testing domain
- Location: `src/lib/` subdirectories:
  - `srs/` — Spaced repetition scheduling
  - `readiness/` — Readiness score calculation (churn, velocity)
  - `signals/` — Signal computation for mastery tracking
  - `blindspot/` — Blindspot protocol queue generation
  - `proof-simulation/` — Full exam simulation logic
  - `outcomes/` — Exam outcome prediction
  - `quiz/` — Quiz session management
  - `srs/` — Spaced repetition scheduling
- Depends on: Data access layer
- Used by: Server actions, API routes, cron jobs

**Data Access Layer (Supabase):**
- Purpose: Database queries, auth, real-time subscriptions
- Location: `src/lib/supabase/`
- Contains: Client initialization (server + client), admin client, middleware, type definitions
- Depends on: Supabase client library, environment configuration
- Used by: Actions, API routes, server components

**Infrastructure & Configuration:**
- Purpose: Constants, types, utilities, validations
- Location:
  - `src/types/` — TypeScript type definitions (app.ts, supabase.ts, dashboard.ts)
  - `src/lib/constants/` — Routes, site config, readiness thresholds
  - `src/lib/utils/` — Helper functions (text, wiki, constants)
  - `src/lib/validations/` — Zod schemas for input validation
  - `src/config/` — Feature flags configuration
- Used by: All layers

## Data Flow

**Read Path (Server Component → Action → Supabase):**

1. Page route (Server Component) calls server action from `src/lib/actions/`
2. Server action creates Supabase client via `createClient()` or admin via `createAdminClient()`
3. Supabase executes query against PostgreSQL
4. Data returned to server component, rendered in RSC tree
5. Client component receives props, no additional fetches needed

Example: `src/app/dashboard/page.tsx` → `getDashboardPageData()` action → `src/lib/supabase/server.ts` → dashboard data rendered

**Write Path (Client Form → Server Action → Supabase):**

1. Client component (form) invokes server action via `action` prop or direct call
2. Validation applied via Zod schema from `src/lib/validations/`
3. Server action authenticates user, performs mutation
4. Supabase executes INSERT/UPDATE/DELETE
5. Revalidation or redirect returns user to updated state

Example: Quiz answer submission → `submitAnswer()` action → stores in `quiz_answers` table → session status updated

**Domain Logic Flow (Signal Computation):**

1. Cron job (`/api/cron/compute-signals`) triggers nightly
2. Fetches active user list from `quiz_sessions`
3. For each user, computes mastery signals via `src/lib/signals/compute.ts`
4. Updates `user_node_mastery` with EMA-weighted scores
5. Readiness scoring uses signals + churn/velocity metrics from `src/lib/readiness/`

**State Management:**

- **Server State:** Supabase (single source of truth); cached via React's `cache()` in `src/lib/supabase/server.ts`
- **Client State:** Zustand stores in `src/stores/` for UI flags, dev impersonation, feature flags
- **Form State:** Native React 19 form actions + `useActionState()` hook
- **Real-time Updates:** Supabase realtime subscriptions (used sparingly for live heatmap)

## Key Abstractions

**Server Action Pattern:**

- Purpose: Encapsulate async server operations with built-in CSRF protection
- Examples: `src/lib/actions/dashboard-page.ts`, `src/lib/actions/quiz.ts`, `src/lib/actions/assessment.ts`
- Pattern: `'use server'` directive, async function, typed inputs/outputs, error handling via try-catch
- Usage: Imported directly into server components or called from client forms

**Supabase Client Factory:**

- Purpose: Abstract Supabase initialization, support demo mode, cache auth state
- Files: `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`
- Pattern: `createClient()` returns configured Supabase instance; `createAdminClient()` for privileged ops
- Includes demo mode support via `isDemoMode()` check and mock client

**Type-Safe Database Schema:**

- Purpose: Ensure compile-time safety for queries
- Files: `src/types/supabase.ts` (auto-generated from schema), `src/types/app.ts` (domain types)
- Pattern: Query results typed against Supabase row types; custom interfaces extend with joins
- Used by: All data access operations

**Domain Service Modules:**

- Purpose: Encapsulate complex pedagogical calculations
- Examples:
  - `src/lib/srs/update.ts` — SRS interval scheduling
  - `src/lib/readiness/velocity.ts` — Learning velocity trend
  - `src/lib/blindspot/generate-queue.ts` — Blindspot queue creation
- Pattern: Pure functions receiving typed inputs, returning domain objects
- Used by: Server actions, API routes, cron jobs

**Validation & Input Schemas:**

- Purpose: Centralize input validation with Zod
- File: `src/lib/validations/index.ts`
- Pattern: Zod schemas defined once, typed via `z.infer`, used in server actions + API routes
- Ensures: Type safety + runtime validation without duplication

## Entry Points

**Web Application:**
- Location: `src/app/layout.tsx` (root layout)
- Triggers: Browser navigation to `https://slatecamp.app`
- Responsibilities: Configure fonts, theme provider, toast system, global styles, layout hierarchy

**Dashboard:**
- Location: `src/app/dashboard/page.tsx`
- Triggers: Authenticated user accessing `/dashboard`
- Responsibilities: Fetch user data via `getDashboardPageData()`, render heatmap/mastery/streak/SRS widgets

**API Routes (External Integrations):**
- AI Tutor: `/api/ai/tutor` (POST) — Claude-3.5 response generation
- Generate Questions: `/api/ai/generate-questions` (POST) — AI question synthesis
- Cron Jobs:
  - `/api/cron/blindspot-scan` (GET, protected by CRON_SECRET) — Generate blindspot queues nightly
  - `/api/cron/compute-signals` (GET) — Recompute user mastery signals
- Webhooks:
  - `/api/webhooks/stripe` — Payment webhook processing
  - `/api/webhooks/payrex` — Payrex payment confirmation

**Authentication:**
- Location: `src/app/(auth)/login`, `src/app/(auth)/register`, `src/app/(auth)/onboarding`
- Triggers: Unauthenticated user or first-time setup
- Responsibilities: Supabase Auth flow, profile creation, assessment kickoff

## Error Handling

**Strategy:** Try-catch at action/route level, validation via Zod pre-execution, typed error responses

**Patterns:**

- **Server Actions:** Wrap in try-catch, catch Supabase errors, return `{ error: string }` on failure
  ```typescript
  try {
    const result = await supabase.from('table').insert(data)
    return { success: true, data: result }
  } catch (err) {
    return { error: 'Operation failed' }
  }
  ```

- **API Routes:** Return HTTP status codes (400 validation, 401 auth, 500 internal)
  ```typescript
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  ```

- **Validation:** Zod schema parsing pre-operation; `.parse()` throws, `.safeParse()` returns result object
  ```typescript
  const validated = submitAnswerSchema.safeParse(body)
  if (!validated.success) return NextResponse.json({ errors: validated.error }, { status: 400 })
  ```

- **Auth Errors:** Check `user` existence before operations; redirect to login if missing
  ```typescript
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  ```

## Cross-Cutting Concerns

**Logging:**
- Approach: Server-side console logging + optional analytics events
- Pattern: `console.error/warn/log` in actions/routes; structured event tracking via `trackServerEvent()` from `src/lib/actions/analytics.ts`
- Used for: Debugging cron jobs, API errors, user interactions

**Validation:**
- Approach: Zod schemas in `src/lib/validations/index.ts` + type inference
- Applied at: Server action entry points, API route body parsing
- Pattern: Schema defined once, reused across multiple endpoints

**Authentication:**
- Approach: Supabase Auth (session-based via cookies)
- Enforcement: Middleware in `src/lib/supabase/middleware.ts` guards protected routes
- User context: Fetched via `getUser()` or `getUserIfPresent()` from `src/lib/supabase/server.ts`
- Demo mode: Bypasses Supabase when `NEXT_PUBLIC_SUPABASE_URL` is missing

**Authorization:**
- Approach: Role-based (admin checks in `src/lib/admin/is-admin.ts`) or tier-based
- Pattern: Server actions check user tier before allowing operations (e.g., AI tutor for non-free)
- Enforcement: Feature flags via `useFeatureFlag()` hook or `getFeatureFlags()` action

**Caching:**
- Approach: React's `cache()` for request-level deduplication in server components
- Used by: `getUserIfPresent()`, user fetch functions
- Ensures: Single Supabase call per request even if component tree calls multiple times

---

*Architecture analysis: 2026-03-19*
