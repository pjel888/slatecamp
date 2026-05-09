# Decisions

**Last updated:** 2026-05-09
**Methodology:** Decisions inferred from codebase evidence, existing documentation, and observed patterns. Uncertain conclusions are marked as assumptions.

---

## Confirmed Decisions

### D-1: Payment-Free Launch
**Decision:** Launch without payment processing. PayRex code retained but disabled.
**Evidence:** `NEXT_PUBLIC_PAYMENTS_ENABLED=false` in feature flags; `src/app/dashboard/upgrade/page.tsx` redirects to dashboard when payments disabled; `/api/payments/checkout` and `/api/webhooks/payrex` routes exist but are gated.
**Consequence:** No revenue at launch. Payment integration is deferred post-launch work. Simplifies launch scope.

### D-2: Live-AI-Provider-Free Launch
**Decision:** Launch without live AI provider calls. AI endpoints retain demo/canned paths.
**Evidence:** `src/components/quiz-v2/FeedbackPanel.tsx` has `LIVE_AI_HELPERS_ENABLED=false`; AI routes (`/api/ai/*`) have demo mode paths; public copy emphasizes source-backed learning.
**Consequence:** Reduced operational cost and complexity at launch. AI features are deferred. Quiz AI helper UI is hidden.

### D-3: Supabase as Sole Backend
**Decision:** Supabase (PostgreSQL + Auth) is the only backend. No separate API server.
**Evidence:** All database access through `src/lib/supabase/` (client, server, admin, middleware variants); all auth through Supabase Auth; RLS for row-level security; no Express/Fastify/other backend framework.
**Consequence:** Tight coupling to Supabase. Migration to another backend would be expensive. Simpler architecture with fewer moving parts.

### D-4: Server Actions for Mutations
**Decision:** Use Next.js Server Actions (not REST endpoints) for most data mutations.
**Evidence:** `src/lib/actions/` contains 160 files of server actions; API route handlers limited to 11 endpoints for specific cross-cutting concerns (AI, cron, payments, webhooks).
**Consequence:** Simpler data flow (no API client layer). Tighter coupling to Next.js. Progressive enhancement works naturally.

### D-5: Single Payment Provider (PayRex)
**Decision:** PayRex is the sole payment provider. LemonSqueezy was removed.
**Evidence:** `PAYMENT_PROVIDER=payrex` in env; `src/lib/payments/provider.ts` only handles payrex; LemonSqueezy runtime code, webhooks, and dependency removed in Plan B cleanup.
**Consequence:** Single provider risk. Simpler integration surface. Cleaner codebase after LemonSqueezy removal.

### D-6: Quiz v2 as Canonical Quiz Engine
**Decision:** `/dashboard/quiz` is the single canonical quiz surface. Old `/quiz/*` and `/dashboard/drills/*` are redirect-only compatibility.
**Evidence:** `next.config.ts` redirects; `src/app/quiz/` and `src/app/dashboard/drills/` contain only redirect pages; all new quiz work goes to `src/app/dashboard/quiz/`.
**Consequence:** Clean URL structure. Sidebar shell preserved for quiz. Legacy URLs continue to work.

### D-7: Bun as Package Manager and Runtime
**Decision:** Use Bun for all package management, script execution, and testing.
**Evidence:** `package.json` scripts all use `bun`; `bun test src/` for unit tests; `bun run dev`, `bun run build`.
**Consequence:** Faster installs and test execution. Some Node.js ecosystem edge cases possible.

### D-8: Tailwind CSS + shadcn/Radix UI Component Architecture
**Decision:** Tailwind for styling; shadcn-style primitives built on Radix UI and Base UI.
**Evidence:** `tailwindcss` in dependencies; `src/components/ui/` with Radix/Base UI wrappers; `DESIGN.md` for design tokens.
**Consequence:** Consistent design language. Accessible primitives (Radix). Utility-first CSS approach.

### D-9: Zustand for Client State
**Decision:** Zustand for client-side state management (not Redux, not Context API).
**Evidence:** `src/stores/` contains 5 Zustand stores: `useQuizStore.ts`, `useDevControlsStore.ts`, `useNotificationStore.ts`, `useTimerStore.ts`, `useQuizTimerStore.ts`.
**Consequence:** Lightweight state management. Quiz store grew large — a known complexity risk.

### D-10: Server Components by Default
**Decision:** Next.js App Router with Server Components as default rendering strategy.
**Evidence:** Most page files are server components; `"use client"` directive only where needed; 92+ loading states and 7 error boundaries.
**Consequence:** Better initial load performance. Clear client/server boundary. Some components (3D, quiz, editors) must be client.

---

## Assumptions

### A-1: Target Users Are Primarily Mobile
**Assumption:** LEA candidates primarily access on mobile devices (phones), not desktops.
**Why it seems likely:** Philippine internet usage is predominantly mobile; competitors optimize for mobile; 3D Lab has mobile performance tests.
**What needs confirmation:** Actual device analytics from beta users.

### A-2: Freemium Model Will Be the Monetization Strategy
**Assumption:** Core features (quiz, wiki, trails, analytics) will be free; advanced features (AI tutor, premium content, institutional access) will be paid.
**Why it seems likely:** `NEXT_PUBLIC_PAYMENTS_ENABLED` gating; pricing page exists; subscription tiers in code (pro/prime/institutional); deferred payment launch implies freemium-first launch.
**What needs confirmation:** Final pricing tiers and feature gates.

### A-3: Content Is the Primary Moat
**Assumption:** The taxonomy-linked question bank, wiki articles, and 3D models are the primary competitive differentiators, not the technology platform itself.
**Why it seems likely:** 76 database tables heavily weighted toward content (questions, wiki, taxonomy); admin portal is content-operations focused; IP inventory documents proprietary implementations.
**What needs confirmation:** Competitive landscape analysis.

### A-4: Review Center Partnerships Are Part of GTM
**Assumption:** SlateCamp will partner with review centers rather than compete with them.
**Why it seems likely:** Landing page positioning includes "review-center complementarity" language; messaging gate explicitly says SlateCamp "supports instruction, does not replace review centers."
**What needs confirmation:** Actual partnership agreements or discussions.

---

## Open Questions

### Q-1: What Is the Production Deployment Target?
**Question:** Is this deployed on Vercel? Self-hosted? Other platform?
**Why it matters:** Affects cron job setup, environment variable management, build configuration, and monitoring.
**Evidence gap:** `next.config.ts` has Vercel-compatible patterns but no explicit platform choice documented. README says "hosting/deployment configuration was not fully verified."

### Q-2: How Many Users Are Expected at Launch?
**Question:** What is the expected user count (hundreds? thousands? tens of thousands?)
**Why it matters:** Affects infrastructure scaling, database connection pooling, and performance requirements.
**Evidence gap:** No capacity planning or load testing results documented.

### Q-3: Is There a Production Database With Real Data?
**Question:** Does a production Supabase project exist with real user data, or is everything still in development?
**Why it matters:** Determines migration strategy (destructive vs non-destructive), reset safety, and data migration complexity.
**Evidence gap:** README says "pre-launch can reset if no prod data" but doesn't confirm whether prod data exists.

### Q-4: What Is the Timeline for Payment Launch?
**Question:** When will paid subscriptions be enabled?
**Why it matters:** Affects prioritization of payment-related tasks, cash flow planning, and feature roadmap.
**Evidence gap:** Deferred but no target date.

### Q-5: What Is the Content Pipeline Status?
**Question:** How much content (questions, wiki articles, 3D models) is ready for launch vs still being created?
**Why it matters:** Content is the primary moat; incomplete content limits launch quality.
**Evidence gap:** Extensive content pipeline scripts in `package.json` but no content inventory or completion metrics.

### Q-6: Should Optional Surfaces Be Hidden or Removed?
**Question:** For CEO portal, developer portal, pods, DAE, studio, professional, results-day — hide from navigation or delete entirely?
**Why it matters:** Affects launch surface, maintenance burden, and security surface.
**Evidence gap:** Needs founder product decision.

### Q-7: Is the Database Migration Squash Planned?
**Question:** Plan to squash 92 migrations into a baseline schema?
**Why it matters:** 92 migrations are hard to replay from scratch; squashing simplifies new environment setup.
**Evidence gap:** Discussed in legacy retirement plan but no decision documented.
