# Documents You Need Before Running the Zero-to-Production Audit

## The Problem

The audit prompt tells the AI to *read your codebase* and find issues. But the codebase alone isn't enough. Without supporting documents, the AI will:

- **Guess** at your intended route structure (and miss unprotected routes)
- **Invent** RLS policies that don't match your actual access model
- **Skip** business logic it can't infer from code alone (like "what happens when a student's subscription expires mid-quiz?")
- **Break** things by suggesting changes that conflict with decisions you've already made

Here's every document you need, split into three tiers: what you already have, what you must create before the audit, and what you should create after the audit to prevent regressions.

---

## TIER 1: You Already Have These

These exist in your skill reference files. Confirm they're current before running the audit.

| Document | Location | What It Does for the Audit |
|---|---|---|
| **Domain Model** (full schema) | `slatecamp-db-architect/references/domain-model.md` | The AI cross-references every table, column, FK, and index against actual queries. Without this, it guesses at schema shape. |
| **Mastery Engine Reference** | `slatecamp-db-architect/references/mastery-engine.md` | Explains the `user_interactions → user_node_mastery → Readiness Score` pipeline. Without it, the AI might suggest "optimizations" that break the core loop. |
| **RLS Patterns** | `slatecamp-db-architect/references/rls-patterns.md` | The AI's security audit (Phase 1) compares live policies against these patterns. Stale patterns = false negatives. |
| **Migration Checklist** | `slatecamp-db-architect/references/migration-checklist.md` | Ensures the AI's suggested schema changes follow your migration protocol, not generic Supabase advice. |
| **Component Library** | `slatecamp-ux-designer/references/component-library.md` | The UX audit (Phase 4) checks skeleton coverage against this. Missing components here = missing audit coverage. |
| **Flow Diagrams** | `slatecamp-ux-designer/references/flow-diagrams.md` | The AI traces user flows to find where loading states and error boundaries are missing. Incomplete flows = blind spots. |

**Action:** Before running the audit, open each of these and verify they reflect the current state of the codebase. If your schema has changed since March 19, 2026, update `domain-model.md` first.

---

## TIER 2: Create These Before the Audit

These don't exist yet but are critical for the AI to do its job without guessing.

### 1. `ROUTE-MAP.md` — Complete Route Inventory

**Why it's critical:** The AI can scan your `app/` directory, but it can't infer *intent*. It needs to know which routes are public, which require auth, which require a paid subscription, and which are admin-only.

**What to include:**
```
/                         → Public (marketing landing page)
/login                    → Public (auth)
/signup                   → Public (auth)
/onboarding               → Auth required, no subscription needed
/dashboard                → Auth + active subscription
/dashboard/quiz/[mode]    → Auth + active subscription
/dashboard/wiki           → Auth + free tier OK (read-only)
/dashboard/wiki/[slug]    → Auth + free tier OK (read-only)
/dashboard/notes          → Auth + active subscription
/dashboard/3d-lab         → Auth + active subscription
/dashboard/camp-trail     → Auth + active subscription
/dashboard/settings       → Auth required
/api/webhooks/stripe      → Public (webhook, verified by signature)
/api/webhooks/payrex      → Public (webhook, verified by signature)
/api/cron/readiness       → Protected (cron secret header)
```

For each route, specify: public/auth/subscription/admin, HTTP methods allowed (for API routes), and any special auth logic (webhook signature verification, cron secrets).

**Without this:** The AI will flag every route it can't determine the auth requirement for, wasting your time sorting real vulnerabilities from false positives. Or worse — it'll assume a route is protected when it isn't.

---

### 2. `ENV-REGISTRY.md` — Environment Variable Manifest

**Why it's critical:** Phase 1 checks for leaked secrets. The AI can scan `.env.example` and code references, but it needs to know *which variables are secret* and *which are safe to expose*.

**What to include:**
```
# Public (safe in NEXT_PUBLIC_*)
NEXT_PUBLIC_SUPABASE_URL          → Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     → Supabase anon key (safe, RLS enforced)
NEXT_PUBLIC_POSTHOG_KEY           → PostHog project key
NEXT_PUBLIC_SENTRY_DSN            → Sentry DSN (public by design)
NEXT_PUBLIC_APP_URL               → https://slatecamp.com

# Secret (server-only, NEVER in NEXT_PUBLIC_*)
SUPABASE_SERVICE_ROLE_KEY         → Bypasses RLS. Server Actions only.
STRIPE_SECRET_KEY                 → Stripe API key
STRIPE_WEBHOOK_SECRET             → Verifies Stripe webhook signatures
PAYREX_SECRET_KEY                 → Payrex API key
PAYREX_WEBHOOK_SECRET             → Verifies Payrex webhook signatures
ANTHROPIC_API_KEY                 → Claude API for AI features
CRON_SECRET                       → Verifies cron job requests
SENTRY_AUTH_TOKEN                 → Source map uploads in CI only

# Deployment
VERCEL_URL                        → Auto-set by Vercel
```

**Without this:** The AI might flag your anon key as a vulnerability (it's not — it's designed to be public with RLS). Or it might miss that a real secret is accidentally referenced in a client component.

---

### 3. `SERVER-ACTIONS-INVENTORY.md` — Every Mutation in the App

**Why it's critical:** Server Actions are the #1 security surface in Next.js App Router. They're callable as HTTP endpoints. The AI will scan `src/lib/actions/`, but it needs a checklist to verify against — otherwise it can only find actions that exist, not actions that are *missing* auth checks.

**What to include:**
```
# Quiz Engine
createQuizSession       → Auth required. Creates session, returns session ID.
submitAnswer            → Auth required. Records answer to user_interactions.
completeQuizSession     → Auth required. Marks session complete, triggers mastery recalc.
abandonQuizSession      → Auth required. Marks session abandoned.

# Notes
createNote              → Auth required. Validates title (1-200 chars), content.
updateNote              → Auth required. Scoped to user_id.
archiveNote             → Auth required. Soft delete (sets archived_at).
togglePinNote           → Auth required. Toggles pinned boolean.

# Profile
updateProfile           → Auth required. Only full_name, exam_date editable.
deleteAccount           → Auth required. Cascades via FK. Irreversible.

# Camp Trail
enrollInTrail           → Auth required + subscription. Creates enrollment record.
completeTrailStep       → Auth required. Marks step done, credits session.

# Subscription
createCheckoutSession   → Auth required. Redirects to Stripe/Payrex.
handleWebhook           → NO auth (public). Verified by webhook signature.
```

For each action: required auth level, what input it accepts, what it mutates, what it revalidates.

**Without this:** The AI can't tell the difference between "this action is missing an auth check" (critical vulnerability) and "this action intentionally skips auth" (webhook handler).

---

### 4. `DEPLOYMENT-CONFIG.md` — How the App Gets to Production

**Why it's critical:** Phase 2 (performance) and Phase 3 (observability) produce recommendations that depend on your deployment setup. Caching advice for Vercel is different from caching advice for a VPS. Sentry setup differs by platform.

**What to include:**
```
# Hosting
Platform:        Vercel (Pro plan)
Framework:       Next.js App Router
Node version:    20.x
Region:          sin1 (Singapore — closest to PH)
Edge Middleware:  Yes (Vercel Edge Runtime)

# Database
Supabase project region:  ap-southeast-1 (Singapore)
Connection pooling:       Supavisor (transaction mode)
Direct connection:        Used in migrations only

# CI/CD
Provider:        Vercel Git Integration (auto-deploy on push to main)
Preview deploys: Yes (every PR)
Branch strategy: main → production, feature branches → preview

# CDN / Assets
Images:          Vercel Image Optimization (next/image)
Static assets:   Vercel Edge Network
3D models:       Supabase Storage (public bucket, CDN via Supabase)

# Monitoring (current state — may be incomplete)
Error tracking:  [Sentry / not set up yet]
Analytics:       [PostHog / not set up yet]
Uptime:          [Vercel / BetterStack / none]
Logging:         [Vercel logs only / structured logging / none]

# Domain
Production:      slatecamp.com
Staging:         staging.slatecamp.com (if exists)
```

**Without this:** The AI might suggest Redis caching (you're on Vercel, use `unstable_cache`), or recommend a logging service that doesn't integrate with your host.

---

### 5. `THIRD-PARTY-SERVICES.md` — External Integrations Inventory

**Why it's critical:** Every external service is an attack surface, a failure point, and a performance dependency. The AI needs to know what's connected to your app.

**What to include:**
```
# Payments
Stripe           → International payments. Webhook at /api/webhooks/stripe.
Payrex           → Philippine payments (GCash, bank transfer). Webhook at /api/webhooks/payrex.

# AI
Anthropic API    → Claude for bounded RAG (wiki search, study recommendations).
                    Rate-limited. Server-side only. Citations mandatory.

# Monitoring
Sentry           → [Active / Not yet configured]
PostHog          → [Active / Not yet configured]

# Email
[Resend / SendGrid / not set up] → Transactional emails (password reset, welcome)

# Storage
Supabase Storage → 3D models (GLB), user avatars (if any), wiki images
```

For each: what it does, where the integration code lives, webhook endpoints, rate limits, and whether it's production-ready or still in development.

**Without this:** The AI can't audit webhook security, can't check if API keys are properly scoped, and can't assess failure modes when a third-party service goes down.

---

### 6. `SUBSCRIPTION-ACCESS-MATRIX.md` — What Each Tier Can Access

**Why it's critical:** Your middleware and Server Actions need to enforce subscription-level access control, not just "logged in or not." The AI needs to know the business rules to verify enforcement.

**What to include:**
```
Feature              | Free Tier      | Pro Tier        | Notes
---------------------|----------------|-----------------|------
Quiz: Camp Mode      | 5/day limit    | Unlimited       |
Quiz: Storm Mode     | Locked         | Unlimited       |
Quiz: Blindspot      | Locked         | Unlimited       |
Quiz: Proof Sim      | Locked         | Unlimited       |
Wiki articles        | All (read-only)| All (read-only) | Free to drive organic traffic
Notes                | 10 max         | Unlimited       |
Camp Trail           | Locked         | Unlimited       |
3D Lab               | 1 free module  | All modules     |
Readiness Score      | Basic (score)  | Full (heatmap)  |
AI Study Coach       | Locked         | Unlimited       |

# Grace period: If subscription lapses, user retains read-only access
# to their own data (notes, history) for 30 days. No new quiz sessions.
```

**Without this:** The AI can't verify that your middleware or Server Actions enforce tier limits. It'll either ignore subscription logic entirely or invent its own rules.

---

## TIER 3: Create These After the Audit (Prevent Regressions)

These are generated *from* the audit results and protect you going forward.

### 7. `PRODUCTION-RUNBOOK.md` — What to Do When Things Break

Create this after the audit implements error monitoring. Contents:
- How to check Sentry for new errors
- How to roll back a Vercel deployment
- How to check Supabase connection pool health
- How to verify RLS policies haven't been accidentally dropped
- Emergency contacts / escalation (even if it's just you)
- How to put the app in maintenance mode

### 8. `PRE-DEPLOY-CHECKLIST.md` — Gate Before Every Push to Main

Create this after the audit establishes your baseline. Contents:
- `npm run build` passes with zero errors
- `npx tsc --noEmit` passes
- No new `select('*')` in any query
- No new `any` types in exported functions
- Every new Server Action has auth check + Zod validation
- Every new route segment has `loading.tsx` and `error.tsx`
- Every new data component has a skeleton
- RLS policies reviewed for any schema changes
- Migration tested on local Supabase first

### 9. `INCIDENT-LOG.md` — Running Record of Production Issues

Start this on launch day. Every production incident gets an entry:
- Date, severity, what happened, root cause, fix, what we changed to prevent recurrence.
- This becomes your most valuable document over time.

---

## Summary: What to Prepare Before Running the Audit

| # | Document | Effort | Status |
|---|----------|--------|--------|
| 1 | Route Map | 30 min | Create new |
| 2 | Env Registry | 15 min | Create new |
| 3 | Server Actions Inventory | 45 min | Create new |
| 4 | Deployment Config | 20 min | Create new |
| 5 | Third-Party Services | 15 min | Create new |
| 6 | Subscription Access Matrix | 30 min | Create new |
| — | Domain Model | 15 min | Verify current |
| — | Mastery Engine Reference | 10 min | Verify current |
| — | RLS Patterns | 10 min | Verify current |
| — | Component Library | 15 min | Verify current |
| — | Flow Diagrams | 10 min | Verify current |

**Total estimated prep time: ~3.5 hours.** That investment prevents the AI from guessing at your business logic, which prevents it from producing a roadmap full of wrong fixes that break your app.

The six new documents are things you'd want to have regardless of the AI audit — they're standard operational documentation for any production app. The audit just forces you to write them now instead of discovering you needed them at 2am on launch night.
