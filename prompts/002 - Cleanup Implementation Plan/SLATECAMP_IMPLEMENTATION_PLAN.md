# SlateCamp — Engineering Implementation Plan
**Version:** 1.0 · **Date:** 2026-03-19 · **Author:** Senior Full Stack Engineer
**Governing Rule:** The app must remain fully functional after every phase. Run `bun run build` before and after each phase. Zero regressions allowed.

---

## PART 1 — CODEBASE BACKGROUND
*This section is required context for Claude Code. Read it entirely before touching any file.*

### Product Identity
SlateCamp is the unified, AI-adaptive board exam review platform for Philippine professional licensure, currently focused on the Architecture Licensure Examination (ALE). It is not a quiz app — it is the infrastructure the board exam process should have always had: a taxonomy-mapped knowledge graph, an adaptive testing engine, a 3D spatial learning lab, a personal notes workspace, and a real-time readiness scoring system.

**Tagline:** "Know you'll win."
**Governing question for every decision:** *Does this make a student more likely to pass their board exam?*

### Tech Stack (exact versions)
```
Runtime:        Next.js 16.1.6 (App Router) · React 19.2.4 · TypeScript 5.9.3
Package mgr:    Bun
Database:       Supabase (PostgreSQL) — 50 tables, 89 RLS policies, 31 triggers
Auth:           Supabase Auth (Google OAuth primary)
Styling:        Tailwind CSS 4.2.1 · shadcn/ui 0.9.5
3D:             React Three Fiber 9.5.0 · @react-three/drei 10.7.7 · Three.js 0.183.2
State:          Zustand 5.0.12 (client only) · React 19 form actions
Payments:       Stripe 20.4.1 · PayRex (payrex-node 1.7.3)
AI:             Anthropic Claude claude-3-5-sonnet-20241022 (@anthropic-ai/sdk 0.78.0)
Testing:        Bun built-in test runner (bun:test) — no Jest/Vitest
Deployment:     Vercel (Next.js + serverless cron jobs)
Validation:     Zod 4.3.6
```

### Brand Design System
```
Primary:        Cobalt Blue   #1B3FC4   — primary actions, active states
Signal Gold:    #F5A623                  — positive deltas, highlights
Signal Red:     #E63329                  — functional errors only (NEVER anxiety)
Signal Green:   #1B7A3C                  — success, passing scores
Camp Orange:    #E8853A                  — next-mission CTA accent
Trail Purple:   #534AB7                  — CampTrails / progression system

Fonts:
  Display:      Syne 800                 — headings
  Hero:         GeistSans                — large names, numerics
  Body/UI:      Inter                    — all body text
  Labels:       DM Mono uppercase        — eyebrows, stats, codes
```

### Directory Structure (abbreviated)
```
src/
├── app/                   # Next.js App Router
│   ├── (auth)/            # Login, register, onboarding
│   ├── admin/             # Admin panel
│   ├── api/               # API routes
│   │   ├── ai/            # Claude AI tutor
│   │   ├── cron/          # blindspot-scan, compute-signals
│   │   ├── payments/      # checkout
│   │   └── webhooks/      # stripe, payrex
│   └── dashboard/         # Core app
│       ├── 3d-lab/
│       ├── analytics/
│       ├── assessment/
│       ├── focus-review/
│       ├── quiz/
│       ├── settings/
│       ├── trails/
│       ├── wiki/
│       └── page.tsx
├── components/            # React components by feature
├── lib/
│   ├── actions/           # Server actions ('use server')
│   ├── supabase/          # client.ts, server.ts, admin.ts
│   ├── srs/               # Spaced repetition
│   ├── readiness/         # Readiness score
│   ├── signals/           # Mastery signal computation
│   ├── blindspot/         # Blindspot queue generation
│   ├── constants/         # Routes, site config, thresholds
│   ├── validations/       # Zod schemas
│   └── analytics-server.ts
├── stores/                # Zustand (dev impersonation only)
├── types/
│   ├── app.ts             # Domain types
│   └── supabase.ts        # Auto-generated schema types
└── config/
    └── feature-flags.ts
```

### Architectural Rules (enforce on every change)
1. **Server Components by default.** Add `'use client'` only when needed for hooks, browser APIs, or Zustand.
2. **No Supabase calls inside components.** All DB calls go through `src/lib/actions/` or `src/lib/supabase/`.
3. **No `select('*')`** — always explicit column lists.
4. **Parallel fetching** — `Promise.all` / `Promise.allSettled` in page server components.
5. **Zod validation at every server action entry point.**
6. **Soft delete only** — `archived_at` timestamp, never hard DELETE user data.
7. **RLS on every user table** — policies enforce `auth.uid() = user_id`.
8. **`import type`** for type-only imports.
9. **Named exports** for all components except routing files (`page.tsx`, `layout.tsx`).
10. **`@/` absolute imports** — never relative paths like `../../`.

### Coding Conventions
- Files: PascalCase for components, camelCase for utilities/actions
- Constants: UPPER_SNAKE_CASE at module level
- Types/Interfaces: PascalCase
- Server actions: `'use server'` directive, async functions, typed I/O, Zod validation at entry
- Tests: co-located `.test.ts` files, `bun:test` runner, `test()` not `it()`
- Error handling in actions: return `{ ok: false, error: string }` for soft failures; throw for auth/critical failures
- Comments: JSDoc above exported functions, section dividers `// ── Section ─────`

### Subscription Tiers
- `camp` — PHP₱499/mo (Stripe) or PHP₱4,990/mo (PayRex)
- `insurance` — PHP₱1,499/mo (Stripe) or PHP₱14,990/mo (PayRex)
- `institutional` — PHP₱4,999/mo (Stripe) or PHP₱49,990/mo (PayRex)

### Critical Integrations
- **Anthropic:** `/api/ai/tutor` — Claude-3.5-sonnet, temp 0.0, max 512 tokens
- **Stripe:** Webhooks at `/api/webhooks/stripe` — `STRIPE_WEBHOOK_SECRET` required
- **PayRex:** Webhooks at `/api/webhooks/payrex` — `PAYREX_WEBHOOK_SECRET` required
- **Cron 1:** `/api/cron/blindspot-scan` — `0 16 * * *` UTC (midnight PHT)
- **Cron 2:** `/api/cron/compute-signals` — `30 16 * * *` UTC

---

## PART 2 — CONCERNS AUDIT SUMMARY
*Every concern from CONCERNS.md mapped to a fix, prioritized by risk.*

| # | Concern | Severity | Phase |
|---|---|---|---|
| C1 | Silent error suppression in `updateSrsSchedule` | CRITICAL | 1 |
| C2 | Silent failures in analytics actions (blank charts) | HIGH | 1 |
| C3 | Inconsistent error handling (throw vs null vs empty) | HIGH | 1 |
| C4 | Pre-migration fallback code still in `quiz.ts` | MEDIUM | 2 |
| C5 | Missing analytics tracking in 3D Lab Classical Orders | MEDIUM | 2 |
| C6 | DOMPurify audit — verify all `dangerouslySetInnerHTML` | HIGH | 2 |
| C7 | API route authorization audit | HIGH | 2 |
| C8 | Missing rate limiting on `/api/ai/*` endpoints | CRITICAL | 3 |
| C9 | Webhook signature verification (Stripe + PayRex) | CRITICAL | 3 |
| C10 | Missing Zod input validation on server actions | HIGH | 3 |
| C11 | `moduleRegistry.ts` — 1,741 lines loaded at runtime | MEDIUM | 4 |
| C12 | `Promise.allSettled` without error aggregation on dashboard | MEDIUM | 4 |
| C13 | Blindspot cron N+1 query problem | HIGH | 4 |
| C14 | In-memory array ops on large datasets (IRT, blindspot) | LOW | 5 |
| C15 | No tests for SRS update failure recovery | HIGH | 5 |
| C16 | No tests for concurrent quiz submissions | HIGH | 5 |
| C17 | No tests for analytics query timeouts | MEDIUM | 5 |
| C18 | No tests for blindspot with no weak nodes | MEDIUM | 5 |
| C19 | No tests for 3D Lab module render failures | MEDIUM | 5 |

---

## PART 3 — IMPLEMENTATION PLAN

### Pre-Flight Checklist (Do Before Every Phase)
```bash
bun run build           # Must pass with zero errors
bun run lint            # Must pass (warnings OK, errors not OK)
bun test                # All existing tests must pass
```

---

## PHASE 1 — Critical Error Handling Fixes
**Goal:** Stop silently swallowing critical failures. Nothing in this phase changes behavior for the happy path — it only makes failures visible.
**Risk:** LOW — additive changes only. No behavior change for successful operations.
**Run time:** 2–3 hours.

---

### Task 1.1 — Fix Silent Failure in `updateSrsSchedule`
**File:** `src/lib/srs/update.ts` lines 67–69
**Problem:** Empty catch block silently discards SRS update failures. Students' spaced repetition schedules stop progressing without any indication.

**Exact change — replace the empty catch:**
```typescript
// BEFORE (the problem)
} catch {
  // silently ignored
}

// AFTER (the fix)
} catch (err) {
  // SRS update failed — log for monitoring but do not break quiz flow
  console.error('[SRS] updateSrsSchedule failed for user. Session still completed.', {
    error: err instanceof Error ? err.message : String(err),
    timestamp: new Date().toISOString(),
  })
  // TODO Phase 5: Add Sentry.captureException(err) here when monitoring is added
}
```

**Verification:** Run `bun test` — existing tests must still pass. Manually test quiz completion — session should still complete even when logging fires.

---

### Task 1.2 — Fix Silent Failures in Analytics Actions
**File:** `src/lib/actions/analytics.ts`
**Problem:** Multiple functions return empty arrays/null on any error — including real database errors — making it impossible to distinguish "no data" from "query broke."

**Pattern to apply to every analytics function:**
```typescript
// BEFORE (loses the error)
} catch {
  return []
}

// AFTER (distinguishes error types)
} catch (err) {
  const message = err instanceof Error ? err.message : String(err)
  // "not found" / "no rows" is a valid empty state — don't log
  if (message.includes('no rows') || message.includes('not found')) {
    return []
  }
  // Actual database error — log it
  console.error('[ANALYTICS] Query failed:', {
    function: 'functionNameHere',
    error: message,
    timestamp: new Date().toISOString(),
  })
  return [] // still return empty so dashboard renders
}
```

**Files to update in this task:**
- `src/lib/actions/analytics.ts` — apply pattern to ALL catch blocks
- `src/lib/actions/heatmap.ts` — same pattern
- `src/lib/actions/dashboard-page.ts` — same pattern

**Important:** Do NOT change return types. These functions still return the same types (`[]`, `null`) — we are only adding logging to the error branches. The dashboard components do not need to change.

---

### Task 1.3 — Establish Unified Error Handling Convention
**Files to update:** `src/lib/actions/wiki.ts`, `src/lib/actions/quiz.ts`, `src/lib/blindspot/generate-queue.ts`
**Problem:** Different files use `throw`, `return null`, and `return []` inconsistently for similar error categories.

**Convention to enforce (add to CONVENTIONS.md after implementing):**

| Path type | Error strategy | Reason |
|---|---|---|
| Auth failures | `throw new Error('Unauthorized')` | Triggers Next.js error boundary, redirects to login |
| Critical quiz mutations | `throw error` (let it bubble) | Session integrity matters — fail loudly |
| Analytics / non-critical reads | `return null` or `return []` + `console.error` | Graceful degradation, dashboard still renders |
| Server action form returns | `return { ok: false, error: 'message' }` | Client can handle and show toast |

**Changes for this task:**
1. `src/lib/actions/wiki.ts` — already returns `[]`/`null`, just add `console.error` to catch blocks (same as 1.2)
2. `src/lib/blindspot/generate-queue.ts` — `return null` is correct for "no weak nodes"; add logging for actual DB errors
3. `CONVENTIONS.md` — add the error handling table above at the top under a new `## Error Handling Convention` section

---

### Phase 1 Verification
```bash
bun run build           # Must pass
bun test                # Must pass
# Manual: Complete a quiz session end-to-end — session must save correctly
# Manual: Load dashboard with no analytics data — must render (empty states visible)
```

---

## PHASE 2 — Bug Fixes and Security Audit (Non-Breaking)
**Goal:** Fix the known bugs and verify security is correct. No new features.
**Risk:** LOW to MEDIUM — only adding code and verifying existing code.

---

### Task 2.1 — Implement 3D Lab Analytics Tracking
**File:** `src/app/dashboard/3d-lab/_scenes/ClassicalOrders/ClassicalOrders.tsx`
**Problem:** Three `trackServerEvent` calls are commented out (lines 88, 91, 97).

**Step 1:** Read the full file before changing anything.
**Step 2:** Find the three TODO markers.
**Step 3:** Uncomment and implement:

```typescript
// Line 88 — correct answer on 3D quiz
await trackServerEvent('3d_quiz_answer', {
  scene: 'classical-orders',
  part: partId,
  correct: true,
})

// Line 91 — incorrect answer on 3D quiz
await trackServerEvent('3d_quiz_answer', {
  scene: 'classical-orders',
  part: partId,
  correct: false,
})

// Line 97 — user selects a part in the 3D scene
await trackServerEvent('3d_part_select', {
  scene: 'classical-orders',
  part: partId,
})
```

**Important:** `trackServerEvent` is in `src/lib/analytics-server.ts`. Import it if not already imported. Make the calls non-blocking (don't `await` if they'd block UI — use `void trackServerEvent(...)` pattern if the function is called from a client event handler).

**Verification:** Interact with the Classical Orders scene. Confirm events appear in the analytics backend (check Supabase `analytics` or `events` table, or whatever table `trackServerEvent` writes to — read the function first).

---

### Task 2.2 — DOMPurify Audit
**Goal:** Confirm every `dangerouslySetInnerHTML` usage is sanitized before render.

**Step 1 — Find all usages:**
```bash
grep -r "dangerouslySetInnerHTML" src/ --include="*.tsx" --include="*.ts" -l
```

**Step 2 — For each file found:**
- Verify the value passed to `dangerouslySetInnerHTML={{ __html: X }}` is sanitized with `DOMPurify.sanitize(X)` or `isomorphic-dompurify`
- If not sanitized, add sanitization:
```typescript
import DOMPurify from 'isomorphic-dompurify'
// ...
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
```

**Step 3 — Known files to check (from CONCERNS.md):**
- `src/components/wiki/WikiArticle.tsx`
- `src/components/quiz/RationaleDrawer.tsx`
- Any other wiki or quiz rendering components

**Do not** change the component signatures or props. Only add the sanitization call before the `__html` assignment.

---

### Task 2.3 — API Route Authorization Audit
**Goal:** Verify every `/api/*` route has appropriate auth. Document findings.

**Step 1 — List all API routes:**
```bash
find src/app/api -name "route.ts" | sort
```

**Step 2 — For each route, verify:**

| Route type | Required auth |
|---|---|
| `/api/cron/*` | `Authorization: Bearer ${CRON_SECRET}` header check |
| `/api/webhooks/stripe` | Stripe signature via `stripe.webhooks.constructEvent()` |
| `/api/webhooks/payrex` | PayRex signature check |
| `/api/ai/*` | Supabase session (user must be logged in) |
| `/api/payments/*` | Supabase session |

**For cron routes — verify this pattern exists:**
```typescript
const authHeader = request.headers.get('authorization')
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

**For Stripe webhooks — verify this pattern exists:**
```typescript
const sig = request.headers.get('stripe-signature')
const body = await request.text()
let event: Stripe.Event
try {
  event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!)
} catch (err) {
  console.error('[WEBHOOK] Stripe signature verification failed:', err)
  return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
}
```

**For PayRex webhooks — read `src/app/api/webhooks/payrex/route.ts` and verify equivalent signature checking. If missing, implement it per PayRex documentation (check `src/lib/payrex/config.ts` for how the SDK is initialized).**

**Step 3 — If any route is missing auth, add it. Do not change the route handler logic — only add the auth check at the top.**

---

### Task 2.4 — Remove Pre-Migration Compatibility Code
**File:** `src/lib/actions/quiz.ts` lines 95–105
**Problem:** Fallback retry logic for `completed_at` column that may not exist.

**Step 1:** Check Supabase migrations to confirm `completed_at` column exists in production:
```bash
grep -r "completed_at" supabase/migrations/ --include="*.sql"
```

**Step 2:** If the migration has been applied (column exists), remove the fallback:
```typescript
// REMOVE this fallback block:
if (error) {
  const { error: fallbackError } = await supabase.from(...) // retry without completed_at
  if (fallbackError) throw fallbackError
}
```

**Replace with:**
```typescript
if (error) {
  console.error('[QUIZ] updateQuizSession failed:', error)
  throw error  // fail loudly — migration should be applied
}
```

**If the migration has NOT been applied yet — DO NOT remove the code. Instead, create a migration first.**

**Step 3:** Run full quiz test to confirm session completion still works.

---

### Phase 2 Verification
```bash
bun run build
bun test
# Manual: Complete a quiz session
# Manual: Interact with Classical Orders 3D module, verify events tracked
# Manual: Attempt to hit /api/cron/blindspot-scan without CRON_SECRET — should get 401
```

---

## PHASE 3 — Security Hardening (Rate Limiting + Input Validation)
**Goal:** Close the two critical security gaps: unprotected AI endpoints and missing Zod validation.
**Risk:** MEDIUM — adds new middleware and validation layers. Test carefully.

---

### Task 3.1 — Rate Limiting on AI Endpoints
**Target files:** `src/app/api/ai/tutor/route.ts`, `src/app/api/ai/generate-questions/route.ts`
**Problem:** No rate limiting — malicious actor can exhaust Anthropic API quota.

**Implementation approach (using Vercel KV or in-memory for now):**

Since there's no Redis in the stack, implement a lightweight in-memory rate limiter using a Map. For production scale, this should be replaced with Vercel KV.

**Create:** `src/lib/rate-limit.ts`
```typescript
/**
 * Simple in-memory sliding window rate limiter.
 * For production: replace with Vercel KV or Redis.
 */

const WINDOW_MS = 60_000 // 1 minute
const MAX_REQUESTS = 10   // per user per window

interface Window {
  count: number
  resetAt: number
}

const store = new Map<string, Window>()

export function checkRateLimit(key: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const window = store.get(key)

  if (!window || now > window.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true }
  }

  if (window.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfter: Math.ceil((window.resetAt - now) / 1000),
    }
  }

  window.count++
  return { allowed: true }
}
```

**Apply to each AI route at the top of the handler:**
```typescript
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  // Auth check
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Rate limit check
  const rateLimit = checkRateLimit(`ai_tutor_${user.id}`)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait before sending another message.' },
      {
        status: 429,
        headers: { 'Retry-After': String(rateLimit.retryAfter) }
      }
    )
  }

  // ... rest of handler unchanged
}
```

---

### Task 3.2 — Zod Input Validation on Server Actions
**Problem:** Server actions accept parameters without validating UUID format, string length, or enum values.

**Files to update (from CONCERNS.md):**
- `src/lib/actions/quiz.ts` — `getQuizSession(sessionId)` and `updateQuizSession`
- `src/lib/actions/dashboard-page.ts` — various functions

**Add to `src/lib/validations/index.ts`:**
```typescript
import { z } from 'zod'

// ── Common primitives ────────────────────────────────────────
export const UUIDSchema = z.string().uuid('Must be a valid UUID')

export const QuizSessionIdSchema = UUIDSchema

export const TestModeSchema = z.enum(['camp', 'storm', 'blindspot', 'proof'])

export const SessionStatusSchema = z.enum(['in_progress', 'completed', 'abandoned'])

export const SubmitAnswerSchema = z.object({
  sessionId: UUIDSchema,
  questionId: UUIDSchema,
  selectedOptionId: UUIDSchema,
  timeSpentMs: z.number().min(0).max(600_000), // max 10 minutes per question
})
```

**Apply at top of each server action function:**
```typescript
import { QuizSessionIdSchema } from '@/lib/validations'

export async function getQuizSession(sessionId: string) {
  // Validate input first — before any DB call
  const parsed = QuizSessionIdSchema.safeParse(sessionId)
  if (!parsed.success) {
    throw new Error(`Invalid session ID: ${parsed.error.message}`)
  }

  // ... rest of function unchanged
}
```

**Important:** Use `safeParse` for non-auth inputs (return error object) and `parse` for inputs that should always be valid (throw directly). Do not change the existing function signatures or return types.

---

### Phase 3 Verification
```bash
bun run build
bun test
# Manual: Send 11 rapid requests to /api/ai/tutor — 11th should get 429
# Manual: Call getQuizSession with 'not-a-uuid' — should throw with clear message
# Manual: Normal quiz flow — must complete without errors
```

---

## PHASE 4 — Performance Improvements
**Goal:** Fix the three performance bottlenecks identified in CONCERNS.md.
**Risk:** MEDIUM to HIGH — cron job and registry changes. Test in staging first.

---

### Task 4.1 — Dashboard Error Aggregation for `Promise.allSettled`
**File:** `src/lib/actions/dashboard-page.ts`
**Problem:** `Promise.allSettled` silently accepts partial failures without telling the user or logging which parts failed.

**Read the full file first.** Then apply this pattern wherever `Promise.allSettled` is used:

```typescript
// BEFORE
const results = await Promise.allSettled([
  fetchHeatmapData(userId),
  fetchReadinessScore(userId),
  fetchRecentActivity(userId),
])
const [heatmap, readiness, activity] = results.map(r =>
  r.status === 'fulfilled' ? r.value : null
)

// AFTER — same external behavior, but logs failures
const results = await Promise.allSettled([
  fetchHeatmapData(userId),
  fetchReadinessScore(userId),
  fetchRecentActivity(userId),
])

const failedKeys: string[] = []
const [heatmapResult, readinessResult, activityResult] = results

if (heatmapResult.status === 'rejected') {
  failedKeys.push('heatmap')
  console.error('[DASHBOARD] heatmap fetch failed:', heatmapResult.reason)
}
if (readinessResult.status === 'rejected') {
  failedKeys.push('readiness')
  console.error('[DASHBOARD] readiness fetch failed:', readinessResult.reason)
}
if (activityResult.status === 'rejected') {
  failedKeys.push('activity')
  console.error('[DASHBOARD] activity fetch failed:', activityResult.reason)
}

// Return same shape as before + optional _partial flag
return {
  heatmap: heatmapResult.status === 'fulfilled' ? heatmapResult.value : null,
  readiness: readinessResult.status === 'fulfilled' ? readinessResult.value : null,
  activity: activityResult.status === 'fulfilled' ? activityResult.value : null,
  _partial: failedKeys.length > 0,       // NEW field — won't break existing consumers
  _failedKeys: failedKeys,               // NEW field — for future toast notification
}
```

**Do not** change how the dashboard components consume these values — they already handle `null`. The `_partial` and `_failedKeys` fields are additive.

---

### Task 4.2 — Blindspot Cron N+1 Query Optimization
**File:** `src/app/api/cron/blindspot-scan/route.ts`
**Problem:** Makes 6 DB queries per user in a loop — will timeout at scale.

**Current pattern (do NOT touch):**
```
for (const userId of userIds) {
  1. Check existing queue
  2. Check subscription tier
  3. Fetch weak nodes
  ...
}
```

**Optimized pattern:**

**Step 1:** Read the full file from top to bottom. Understand every query.

**Step 2:** Create batched versions of the individual queries:

```typescript
// Replace the per-user loop with batch queries

// BATCH QUERY 1: Get all users with active subscriptions in one query
const { data: activeUsers, error: usersError } = await adminClient
  .from('user_subscriptions')
  .select('user_id, tier, status')
  .eq('status', 'active')
  .in('tier', ['camp', 'insurance', 'institutional'])

if (usersError) {
  console.error('[CRON:BLINDSPOT] Failed to fetch active users:', usersError)
  return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
}

const userIds = activeUsers.map(u => u.user_id)

// BATCH QUERY 2: Get existing queues for ALL users at once
const { data: existingQueues } = await adminClient
  .from('blindspot_queues')
  .select('user_id, created_at, status')
  .in('user_id', userIds)
  .eq('status', 'active')
  .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

// Build a Set for O(1) lookup
const usersWithRecentQueues = new Set(existingQueues?.map(q => q.user_id) ?? [])

// BATCH QUERY 3: Get weak nodes for ALL users at once
const { data: weakNodes } = await adminClient
  .from('user_node_mastery')
  .select('user_id, node_id, mastery_weight')
  .in('user_id', userIds)
  .lt('mastery_weight', 0.4)  // threshold for "weak"
  .order('mastery_weight', { ascending: true })

// Group by user_id
const weakNodesByUser = new Map<string, typeof weakNodes>()
for (const node of weakNodes ?? []) {
  if (!weakNodesByUser.has(node.user_id)) weakNodesByUser.set(node.user_id, [])
  weakNodesByUser.get(node.user_id)!.push(node)
}

// NOW process each user with pre-fetched data (no more per-user DB calls)
const newQueues = []
for (const { user_id } of activeUsers) {
  if (usersWithRecentQueues.has(user_id)) continue  // already has queue
  const userWeakNodes = weakNodesByUser.get(user_id) ?? []
  if (userWeakNodes.length === 0) continue           // perfect mastery, skip

  newQueues.push({
    user_id,
    node_ids: userWeakNodes.slice(0, 15).map(n => n.node_id),
    status: 'active',
    created_at: new Date().toISOString(),
  })
}

// BATCH INSERT: All queues in one operation
if (newQueues.length > 0) {
  const { error: insertError } = await adminClient
    .from('blindspot_queues')
    .insert(newQueues)

  if (insertError) {
    console.error('[CRON:BLINDSPOT] Batch insert failed:', insertError)
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 })
  }
}

// SINGLE CLEANUP: Expire stale queues
await adminClient
  .from('blindspot_queues')
  .update({ status: 'expired' })
  .eq('status', 'active')
  .lt('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
```

**Important:** The table names (`user_node_mastery`, `blindspot_queues`, column names) MUST match your actual Supabase schema. Read `DATABASE_SCHEMA.sql` to confirm exact names before writing any query. If the schema differs, adjust accordingly — never guess column names.

**Verify:** Test with the `CRON_SECRET` header. Confirm queues are generated correctly. Run the original tests.

---

### Task 4.3 — 3D Lab Module Registry Lazy Loading
**File:** `src/app/dashboard/3d-lab/_config/moduleRegistry.ts` (1,741 lines)
**Problem:** Entire 40+ module registry loaded at bundle time.

**Step 1:** Read the file to understand its structure. Do NOT modify it yet.

**Step 2:** Identify what data is needed at index time (module list for nav) vs. at load time (full module config for a specific scene).

**Step 3:** Extract to a two-level structure:
- **Keep in `moduleRegistry.ts`:** A lean manifest (id, name, category, thumbnail, isPublished) — one small object per module
- **Extract to separate files:** Full scene configs (scenarios, questions, hotspots) — one file per module

**New structure:**
```
src/app/dashboard/3d-lab/_config/
├── moduleRegistry.ts          # Lean manifest only (~100 lines)
└── modules/
    ├── classical-orders.ts    # Full config for this module
    ├── stairway-pd1096.ts
    └── ...
```

**New registry pattern:**
```typescript
// moduleRegistry.ts — manifest only
export const MODULE_REGISTRY = [
  {
    id: 'classical-orders',
    name: 'Classical Orders',
    category: 'History of Architecture',
    isPublished: true,
    // NO scene config, NO questions here
  },
  // ...
] as const

// In the viewer component — lazy load the full config:
const moduleConfig = await import(`@/app/dashboard/3d-lab/_config/modules/${moduleId}`)
```

**Important:** Do NOT break the viewer if a module config file doesn't exist yet. Add a try-catch around the dynamic import and show a "Module configuration loading..." state.

---

### Phase 4 Verification
```bash
bun run build           # Must pass — dynamic imports are build-time checked
bun test
# Manual: Load dashboard — must render even when some queries fail
# Manual: Test cron endpoint with a small set of users
# Manual: Load the 3D Lab module list — must be fast
# Manual: Load a specific 3D module — must load its full config
```

---

## PHASE 5 — Test Coverage
**Goal:** Add tests for the five critical untested scenarios.
**Risk:** LOW — additive tests, no production code changes.

---

### Task 5.1 — Test SRS Update Failure Recovery
**File to create:** `src/lib/srs/update.test.ts`

```typescript
import { describe, test, expect, mock } from 'bun:test'

describe('updateSrsSchedule — failure recovery', () => {
  test('quiz session still completes when SRS update throws', async () => {
    // Mock Supabase to throw on SRS update
    // Verify the function does not re-throw (quiz completes)
    // Verify console.error is called with structured log
    // ...
  })

  test('returns null gracefully when user has no SRS records', async () => {
    // ...
  })
})
```

**Implementation note:** Use Bun's `mock()` to mock the Supabase client. See existing tests in `src/lib/srs/irt.test.ts` for the pattern used in this codebase.

---

### Task 5.2 — Test Blindspot Queue Generation Edge Cases
**File to create:** `src/lib/blindspot/generate-queue.test.ts`

```typescript
import { describe, test, expect } from 'bun:test'
import { generateBlindspotQueue } from './generate-queue'

describe('generateBlindspotQueue', () => {
  test('returns null when user has no weak nodes (perfect mastery)', async () => {
    // All nodes above 0.4 threshold
    const result = await generateBlindspotQueue({ userId: 'test', weakNodes: [] })
    expect(result).toBeNull()
  })

  test('caps queue at 15 items even when more weak nodes exist', async () => {
    // 30 weak nodes → queue should have max 15
  })

  test('prioritizes lowest mastery nodes', async () => {
    // Verify nodes are sorted by mastery_weight ascending
  })
})
```

---

### Task 5.3 — Test Analytics Query Timeout Handling
**File:** `src/lib/actions/analytics.test.ts` (create if it doesn't exist)

Test that when Supabase queries reject (simulate timeout), the analytics functions return `[]` or `null` rather than throwing — confirming dashboard renders gracefully.

---

### Task 5.4 — Test Dashboard Partial Data Rendering
Verify the `_partial` field added in Phase 4.1 is passed through correctly and that components render with null data without crashing.

---

### Task 5.5 — Test 3D Lab Error Boundary
**File:** Create or add to `src/components/3d/ModuleViewer.test.tsx`

Verify that when the React Three Fiber Canvas throws, the error boundary catches it and renders a fallback UI rather than crashing the whole page.

---

### Phase 5 Verification
```bash
bun test --coverage     # All new tests must pass, existing tests must still pass
bun run build
```

---

## PART 4 — CHANGE LOG TRACKING

Track every file touched. Fill in this table as you work.

| Phase | File | Change Type | Status |
|---|---|---|---|
| 1.1 | `src/lib/srs/update.ts` | Add error logging to catch | — |
| 1.2 | `src/lib/actions/analytics.ts` | Add error logging to catches | — |
| 1.2 | `src/lib/actions/heatmap.ts` | Add error logging to catches | — |
| 1.2 | `src/lib/actions/dashboard-page.ts` | Add error logging to catches | — |
| 1.3 | `src/lib/actions/wiki.ts` | Add error logging to catches | — |
| 1.3 | `src/lib/blindspot/generate-queue.ts` | Add error logging to catches | — |
| 1.3 | `CONVENTIONS.md` | Document error handling convention | — |
| 2.1 | `src/app/dashboard/3d-lab/_scenes/ClassicalOrders/ClassicalOrders.tsx` | Uncomment analytics | — |
| 2.2 | Various wiki/quiz components | Add DOMPurify where missing | — |
| 2.3 | `src/app/api/cron/*.ts` | Verify/add auth checks | — |
| 2.3 | `src/app/api/webhooks/stripe/route.ts` | Verify signature verification | — |
| 2.3 | `src/app/api/webhooks/payrex/route.ts` | Verify/add signature verification | — |
| 2.4 | `src/lib/actions/quiz.ts` | Remove pre-migration fallback | — |
| 3.1 | `src/lib/rate-limit.ts` | Create (new file) | — |
| 3.1 | `src/app/api/ai/tutor/route.ts` | Add rate limiting | — |
| 3.1 | `src/app/api/ai/generate-questions/route.ts` | Add rate limiting | — |
| 3.2 | `src/lib/validations/index.ts` | Add UUID, session, answer schemas | — |
| 3.2 | `src/lib/actions/quiz.ts` | Add Zod validation at entry | — |
| 4.1 | `src/lib/actions/dashboard-page.ts` | Add failure logging to allSettled | — |
| 4.2 | `src/app/api/cron/blindspot-scan/route.ts` | Batch query optimization | — |
| 4.3 | `src/app/dashboard/3d-lab/_config/moduleRegistry.ts` | Extract to lean manifest | — |
| 4.3 | `src/app/dashboard/3d-lab/_config/modules/*.ts` | Create per-module configs | — |
| 5.x | Various `*.test.ts` files | New tests | — |

---

## PART 5 — WHAT NOT TO TOUCH

These are explicitly out of scope. Do not modify them:

1. **`src/types/supabase.ts`** — Auto-generated. Run `supabase gen types` to update, never edit manually.
2. **`DATABASE_SCHEMA.sql`** and `supabase/migrations/`** — Database changes require separate migration PRs, not part of this plan.
3. **Any Zustand store in `src/stores/`** — Dev-only, low priority.
4. **`src/lib/demo/`** — Demo mode mock data, not in scope.
5. **Payment provider logic in `src/lib/stripe/` and `src/lib/payrex/`** — Only verify the webhook handlers, don't change the provider logic.
6. **React component UI logic** — This plan is backend/infrastructure focused. No UI changes.
7. **`src/lib/srs/irt.ts` algorithm logic** — The IRT algorithm is correct. The in-memory sort concern (C14) is a future optimization, not this plan.

---

## PART 6 — ROLLBACK PLAN

If any phase introduces a regression:

1. Immediately run `bun run build` — if build fails, the change is wrong
2. `git diff` to see exactly what changed
3. `git stash` to revert to last working state
4. Fix the specific issue, then re-apply

For Phase 4.2 (cron optimization) specifically:
- If the batch queries produce different results than the original, roll back to the N+1 version
- The N+1 version is correct — it just doesn't scale. Correctness beats optimization.

---

## PART 7 — PHASE ORDER RATIONALE

**Why this order:**
- **Phase 1 first** because silent error suppression is the root cause of the hardest-to-debug issues. Making errors visible before fixing anything else means every subsequent change is observable.
- **Phase 2 before Phase 3** because we need to verify existing security is intact before adding new security layers.
- **Phase 3 before Phase 4** because security hardening must come before performance optimization — we don't want to optimize code that has security gaps.
- **Phase 4 before Phase 5** because tests should test the final production code, not intermediate states.
- **Phase 5 last** because it's additive only — it doesn't unblock anything else.

---

*Implementation plan version 1.0 · SlateCamp · 2026-03-19*
*DO NOT implement more than one phase per session. Run the build after every phase.*
