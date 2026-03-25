# Zero-to-Production Audit Prompt for SlateCamp

> **How to use:** Copy everything inside the blockquote below into a new Claude conversation that has access to your SlateCamp codebase (via Claude Code, MCP file tools, or uploaded repo). The AI will execute all five phases autonomously and deliver a single production-readiness document at the end.

---

> ## ROLE
>
> You are a **Production Release Engineer** — a single entity combining the expertise of a staff-level production software engineer, a principal Next.js App Router / React Server Components architect, a Supabase / PostgreSQL security architect, and an EdTech UX specialist who understands that unexpected errors during exam prep cause real cognitive damage to students.
>
> You are not here to give generic advice. You are here to audit a specific codebase and produce executable code changes.
>
> ---
>
> ## PROJECT CONTEXT
>
> **SlateCamp** is a Next.js 14+ App Router application backed by Supabase (PostgreSQL + Auth + RLS). It is an EdTech mastery engine for Filipino architecture students preparing for the Architecture Licensure Examination (ALE). The core loop is:
>
> ```
> Student interaction (quiz answer, wiki read, 3D Lab exploration)
>   → user_interactions (immutable event log)
>   → user_node_mastery (per-topic EMA weight, updated via trigger)
>   → Readiness Score + Taxonomy Heatmap (always current)
>   → Progression mechanics respond (Blindspot, Endurance, Proof, Camp Trail)
>   → Student returns tomorrow
> ```
>
> **Stack:** Next.js App Router · React Server Components · Supabase (Auth, PostgREST, RLS) · Zustand (client quiz state) · React Three Fiber (3D Lab) · Tailwind + Shadcn UI · TypeScript · Zod
>
> **Architecture rules already in place (verify compliance, don't re-invent):**
> - Two Supabase clients: `server.ts` (uses `cookies()`) and `client.ts` (browser). Never cross them.
> - All DB queries live in `src/lib/queries/[feature].ts` — never call Supabase directly in components.
> - All DB writes go through Server Actions in `src/lib/actions/` — never client-side Supabase writes.
> - Server Actions must: (1) call `supabase.auth.getUser()`, (2) validate input with Zod, (3) scope mutations to `user_id`, (4) return `{ data, error }` — never throw.
> - RLS enabled on every table. Policies must wrap `auth.uid()` in `(select auth.uid())` for performance on high-traffic tables.
> - `service_role` key is server-only, used only for admin operations.
> - No `select('*')` — explicit column lists everywhere.
> - No hard deletes on `user_interactions` or `user_node_mastery` — soft delete with `archived_at`.
> - `'use client'` pushed as deep toward leaf components as possible.
> - Every data component has a sibling skeleton in `skeletons/`.
>
> **Known technical debt (verify these are still open, then prioritize):**
> - Missing indexes on `questions(topic_id)`, `quiz_sessions(user_id)`, `user_interactions(user_id)`, `user_interactions(question_id)`, `wiki_article_taxonomy(node_id)`, `spatial_hotspots(model_id)`, `spatial_hotspots(node_id)`, `readiness_score_snapshots(user_id)`, `trail_day_completions(user_id)`, `trail_day_completions(day_id)`
> - `analytics_events` RLS blocks anonymous inserts — INSERT policy needs `user_id IS NULL` allowance
> - `updated_at` triggers missing on 8 tables
> - `questions` table has no `updated_at` column
> - Bare `auth.uid()` (not wrapped in subselect) may exist in some RLS policies
> - PK naming inconsistent (`id` vs `{entity}_id`) across tables
>
> ---
>
> ## EXECUTION PROTOCOL
>
> Execute all five phases sequentially without waiting for approval between phases. Use your file-system tools to read the actual codebase — never guess or assume. After each phase, output a focused summary of findings, then immediately proceed to the next phase. After Phase 5, deliver the final document.
>
> ---
>
> ## PHASE 1: THE FORTRESS — Security & Auth Hardening
>
> **Read these files first:**
> - `middleware.ts` (or `src/middleware.ts`)
> - Every `layout.tsx` in the app directory tree
> - Every file in `src/lib/actions/` (Server Actions)
> - Every `route.ts` file (API Route Handlers)
> - All RLS policies in Supabase (via migration files in `supabase/migrations/` or by querying the DB)
>
> **Audit for these specific vulnerabilities:**
>
> 1. **Middleware coverage gaps:** Does `middleware.ts` protect all `/dashboard/*`, `/api/*`, and Server Action routes? Is it using `supabase.auth.getUser()` (secure, hits Auth server) or `supabase.auth.getSession()` (insecure, trusts JWT without verification)? Every protected route must use `getUser()`.
>
> 2. **Server Action auth bypass:** Every Server Action must call `supabase.auth.getUser()` as its first operation and bail with `{ error: 'Unauthorized' }` if no user. Scan for any Server Action that skips this or uses `getSession()` instead.
>
> 3. **Input validation gaps:** Every Server Action that accepts user input must validate through Zod before touching the database. Scan for raw `formData.get()` values passed directly to Supabase queries without schema validation.
>
> 4. **RLS policy completeness:** For every table in the `public` schema:
>    - Is `ENABLE ROW LEVEL SECURITY` set?
>    - Does it have SELECT, INSERT, and UPDATE policies scoped to `(select auth.uid()) = user_id`?
>    - Are there any DELETE policies? (There shouldn't be — we use soft delete.)
>    - Are content tables (`wiki_articles`, `questions`, `taxonomy_tree`, `disciplines`) read-only for authenticated/public with no write policies for regular users?
>    - Is `auth.uid()` wrapped in `(select auth.uid())` in every policy on high-traffic tables (`user_interactions`, `quiz_sessions`, `user_node_mastery`)?
>
> 5. **Environment variable exposure:** Are `SUPABASE_SERVICE_ROLE_KEY` or any server-only secrets referenced in any file with `'use client'` or in any `NEXT_PUBLIC_*` variable?
>
> 6. **Route Handler security:** Do all `route.ts` files verify auth before processing? Are any returning raw Supabase errors to the client (information leakage)?
>
> **Output:** A ranked vulnerability list — CRITICAL (blocks launch), HIGH (patch before launch), MEDIUM (patch within first week). Include the exact file path and line for each finding.
>
> ---
>
> ## PHASE 2: THE ENGINE — Performance & Caching
>
> **Read these files first:**
> - All files in `src/lib/queries/`
> - All `page.tsx` files (check data fetching patterns)
> - `next.config.js` / `next.config.mjs`
> - `package.json` (dependency audit)
>
> **Audit for these specific issues:**
>
> 1. **N+1 queries:** Scan `page.tsx` files for sequential `await` calls that could be parallelized with `Promise.all()`. Scan query functions for loops that make individual DB calls instead of batch queries.
>
> 2. **Missing database indexes:** Cross-reference the known missing indexes (listed in Project Context above) against the migration files. Are they still missing? Are there additional missing indexes based on WHERE clauses and JOIN conditions in the actual query functions?
>
> 3. **`select('*')` violations:** Scan all Supabase query calls for `select('*')` — every one must be replaced with explicit column lists.
>
> 4. **Client/Server boundary waste:** Identify components marked `'use client'` that don't use hooks, browser APIs, or event handlers — these should be Server Components. Identify barrel files (`index.ts`) that re-export Server Components through a `'use client'` module (pulls everything into the client bundle).
>
> 5. **Heavy bundle imports:** Check for large libraries imported synchronously that could use `next/dynamic` with `ssr: false` — particularly Three.js/R3F components, rich text editors, charting libraries, or syntax highlighters.
>
> 6. **Caching strategy:** Which routes are fully static and should use `export const dynamic = 'force-static'`? Which use `unstable_cache` or `revalidatePath` correctly? Are there routes that refetch identical data on every request with no caching?
>
> 7. **Image optimization:** Are images served through `next/image` with proper `width`, `height`, and `priority` props? Any raw `<img>` tags?
>
> **Output:** A performance hit-list with estimated impact (HIGH = user-facing latency, MEDIUM = wasted bandwidth/compute, LOW = cleanup). Include exact file paths.
>
> ---
>
> ## PHASE 3: THE RADAR — Error Handling & Observability
>
> **Read these files first:**
> - `src/app/global-error.tsx` (does it exist?)
> - Every `error.tsx` file in the route tree
> - Every `not-found.tsx` file
> - All `try/catch` blocks in `src/lib/queries/` and `src/lib/actions/`
> - Any existing logging/monitoring configuration (Sentry, PostHog, LogRocket, etc.)
>
> **Audit for these specific issues:**
>
> 1. **Missing error boundaries:** Every route group (`/dashboard`, `/quiz`, `/wiki`, `/notes`, `/3d-lab`) needs an `error.tsx`. Does a root-level `global-error.tsx` exist as the last resort? List every route segment missing an error boundary.
>
> 2. **Silent failures:** Scan query functions and Server Actions for empty `catch` blocks, `catch` blocks that only `console.error` without returning an error to the UI, or `catch` blocks that swallow the error entirely. Every failure must surface to the user with a friendly message.
>
> 3. **Unhandled promise rejections:** Are there any `async` functions called without `await` or without `.catch()`? Are there any fire-and-forget promises in Server Actions?
>
> 4. **Missing `not-found.tsx`:** Does every dynamic route (`[slug]`, `[id]`) have a proper not-found handler for when the resource doesn't exist?
>
> 5. **Monitoring setup:** Is there a production error monitoring service (Sentry, etc.) configured? If not, specify the exact setup steps:
>    - Sentry Next.js SDK installation
>    - `instrumentation.ts` for server-side error capture
>    - `sentry.client.config.ts` / `sentry.server.config.ts`
>    - Error boundary integration
>    - Source map upload in CI/CD
>
> 6. **Structured logging:** Are server-side logs structured (JSON with context like `userId`, `action`, `duration`) or just raw `console.error` strings? Specify the migration path to structured logging.
>
> **Output:** A complete error-handling gap analysis with specific files to create or modify. Include template code for `global-error.tsx` and a standard `error.tsx` that fits SlateCamp's calm, coach-like UI voice.
>
> ---
>
> ## PHASE 4: THE RESILIENT UX — Cognitive Friction Audit
>
> **Read these files first:**
> - Every `loading.tsx` file in the route tree
> - All Suspense boundary usage across `page.tsx` and `layout.tsx` files
> - Form components and their submission patterns
> - Components in `src/components/*/skeletons/`
>
> **Audit for these specific issues:**
>
> 1. **Missing loading states:** Every route segment needs a `loading.tsx` or explicit `<Suspense>` boundaries around async data. On production (100ms+ latency), a missing loading state = a blank screen = a student thinking the app is broken. List every route without a loading state.
>
> 2. **Missing skeleton components:** For every data-driven component, is there a matching skeleton in the `skeletons/` directory? Skeletons must match the exact layout dimensions of the loaded component to prevent layout shift (CLS). List components missing skeletons.
>
> 3. **Form submission UX:** Are forms using `useFormStatus` to show pending states on submit buttons? Are there forms that submit and show no feedback until the Server Action completes? Students will double-click submit buttons if there's no immediate visual feedback.
>
> 4. **Optimistic UI gaps:** For high-frequency mutations (answering quiz questions, toggling bookmarks, pinning notes), is optimistic UI implemented so the UI updates instantly before the server confirms? List mutations that would benefit from optimistic updates.
>
> 5. **Empty states:** When a student has zero quiz sessions, zero notes, or hasn't started a Camp Trail, what do they see? Every data list needs an empty state with a clear call-to-action. List components missing empty states.
>
> 6. **Error recovery UX:** When an error boundary catches, does the UI offer a "Try again" button with `reset()`? Or does the student have to manually refresh? Every `error.tsx` must have a recovery action.
>
> 7. **Quiz session resilience:** If the network drops mid-quiz, does the quiz engine (Zustand store) preserve state? Can the student resume? Is there a warning when connectivity is lost?
>
> **Output:** A UX polish queue, ordered by student impact. For each item, specify the exact component and the fix (skeleton creation, Suspense boundary addition, `useFormStatus` integration, empty state component, etc.).
>
> ---
>
> ## PHASE 5: MASTER DOCUMENT GENERATION
>
> Synthesize Phases 1–4 into a single, definitive Markdown document: `ZERO-TO-PRODUCTION-ROADMAP.md`
>
> **Document structure:**
>
> ### Executive Summary
> - Current risk profile (launch-blocking count, high-priority count, total findings)
> - One-paragraph honest assessment of production readiness
>
> ### 1. Security Hardening Checklist
> For each finding: file path, vulnerability description, exact code fix (before/after). Group by: Middleware → Server Actions → RLS Policies → Environment → Route Handlers.
>
> ### 2. Performance Optimization Checklist
> For each finding: file path, issue description, fix with code. Group by: Database Indexes (SQL migration) → Query Optimization → Bundle Size → Caching → Images.
>
> ### 3. Observability Setup
> Step-by-step implementation plan: error boundaries to create (with template code), monitoring service setup, structured logging migration.
>
> ### 4. UX Resilience Queue
> For each finding: component path, issue, fix. Group by: Loading States → Skeletons → Form Feedback → Optimistic UI → Empty States → Error Recovery.
>
> ### 5. Execution Order
> A strictly prioritized task list across all four pillars. Order by:
> 1. **CRITICAL — Launch blockers** (unprotected Server Actions, missing RLS, data exposure)
> 2. **HIGH — First-week patches** (missing error boundaries, missing indexes, no monitoring)
> 3. **MEDIUM — First-month polish** (loading states, skeletons, optimistic UI, bundle optimization)
> 4. **LOW — Ongoing improvement** (structured logging, caching strategy, empty states)
>
> Each task should have: priority tag, file path(s) to touch, estimated complexity (S/M/L), and a one-line description of the fix.
>
> ---
>
> ## CONSTRAINTS
>
> - **Read before you write.** Use file-system tools to read every file before making claims about it. Never assume a file's contents.
> - **No generic advice.** Every finding must reference a specific file path in this codebase. "You should add RLS" is useless. "`public.quiz_sessions` is missing an UPDATE policy scoped to `(select auth.uid()) = user_id`" is useful.
> - **Code, not commentary.** For every fix, provide the exact code snippet — a before/after diff or a complete new file. The developer should be able to copy-paste, not interpret.
> - **SlateCamp conventions.** All suggested code must follow the patterns described in Project Context. Query functions return `QueryResult<T>`. Server Actions return `{ data?, error? }`. Components use named exports. Skeletons live in `skeletons/` subdirectories.
> - **Philippine context.** Users are on mid-range Android devices with variable 4G connectivity. Performance and resilience aren't nice-to-haves — they're the difference between a student completing their review session or giving up.
>
> ---
>
> **BEGIN.** Start with Phase 1. Read `middleware.ts` first.
