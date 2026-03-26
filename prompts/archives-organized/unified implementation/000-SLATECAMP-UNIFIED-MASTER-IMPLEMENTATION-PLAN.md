# SLATECAMP UNIFIED MASTER IMPLEMENTATION PLAN
## The Single Source of Truth — All Five Plans Merged, Sequenced, De-Conflicted
### Generated 2026-03-25

---

## PREAMBLE: INSTRUCTIONS FOR EXECUTING AI AGENTS

This document is the **supreme directive** for any AI agent tasked with implementing SlateCamp's pre-launch engineering work. It unifies, de-conflicts, and sequences the following five source plans into one executable roadmap:

1. **LEAN-TECH-CLEANUP-ROADMAP** (70–95 hours) — Dead code purge, query layer, component unification
2. **PERFORMANCE-IMPLEMENTATION-ROADMAP** (45–58 hours) — Database velocity, frontend architecture, perceived speed
3. **SLATECAMP-PRE-LAUNCH-STRATEGY** (35 hours sprint + ongoing) — Launch blockers, revenue, activation, GTM
4. **MASTER-UX-UI-IMPLEMENTATION-PLAN** (6–8 weeks) — Behavioral design, component system, telemetry
5. **PRODUCT-ARCHITECTURE-IMPLEMENTATION-PLAN** (7 sprints) — IRT engine, SRS reconnection, adaptive testing

### Agent Operating Rules

**RULE 1 — ZERO OMISSIONS.** Every task from every source plan must be executed (except items explicitly deferred in the Deferred Items appendix). If a task appears in multiple plans (e.g., "fix waterfall pages" appears in plans 1, 2, 3), execute it ONCE but satisfy ALL specifications from ALL plans that mention it. Cross-reference this document's task registry to confirm nothing is skipped.

**RULE 2 — CONFLICT RESOLUTION PROTOCOL.** When two plans specify contradictory approaches for the same task:
- The plan with the MORE SPECIFIC implementation detail wins.
- If both are equally specific, the plan closer to the REVENUE-CRITICAL path wins.
- If still ambiguous, implement the approach that is SAFER (less risk of regression).
- Document every conflict resolution decision in a `CONFLICT-LOG.md` file in the project root.

**RULE 3 — BUILD GATES ARE NON-NEGOTIABLE.** After EVERY atomic change:
```bash
bun run build          # Must pass with zero errors
npx tsc --noEmit       # Must pass with zero type errors
```
If either fails, REVERT the last change, investigate, fix, and re-attempt. Never proceed with a broken build.

**RULE 4 — FAILSAFE PROTOCOL.** Before starting any phase:
1. Create a git branch: `phase-{N}-{description}`
2. Commit the current clean state as a checkpoint
3. After each successful sub-task, commit with a descriptive message
4. If a phase introduces a regression that cannot be resolved within 30 minutes, `git stash` all changes, return to the checkpoint, and attempt an alternative approach
5. Log all failsafe activations in `FAILSAFE-LOG.md`

**RULE 5 — CONTINGENCY PROTOCOL.** For every task marked with `[CONTINGENCY]`:
- Attempt the primary approach first
- If it fails, execute the documented fallback
- If the fallback also fails, SKIP the task, log it in `BLOCKED-TASKS.md` with the error, and continue to the next task. Return to blocked tasks after all non-blocked tasks are complete.

**RULE 6 — MULTI-AGENT COORDINATION.** If multiple agents work in parallel:
- Each agent owns a specific phase and its files. No two agents edit the same file simultaneously.
- Use a shared `AGENT-STATUS.md` file with task status: `PENDING | IN_PROGRESS | COMPLETE | BLOCKED | FAILED`
- Before editing any file, check if another agent has claimed it. If so, wait or coordinate.
- Agent A: Phases 1–3 (cleanup, database, security)
- Agent B: Phases 4–6 (frontend, UX components, performance)
- Agent C: Phases 7–9 (IRT/SRS engines, testing, monitoring)
- Phase 10 (integration testing) requires ALL agents to have completed their work.

**RULE 7 — VERIFICATION AT EVERY BOUNDARY.** At the end of every phase, run the phase-specific verification checklist. Do not proceed to the next phase until every check passes.

**RULE 8 — ZERO-BEHAVIOR-CHANGE RULE FOR REFACTORS.** During cleanup and refactoring phases (1–3), no change should alter observable user behavior. If a refactor accidentally changes behavior, revert it and re-approach.

---

## MASTER TASK REGISTRY

Total unique tasks across all 5 plans: **238 active tasks** (9 payment tasks deferred — see Appendix E)
Estimated total effort: **165–220 engineering hours**
Timeline: **9 weeks** (phased, parallelizable to 5–6 weeks with 2 agents)

### Conflict Resolution Summary

The following conflicts were identified between plans and resolved:

| # | Conflict | Plans | Resolution |
|---|----------|-------|------------|
| C1 | Waterfall fix timing — Plan 2 says Sprint 1 (quick wins), Plan 3 says Day 3 of 7-day sprint | Plans 2, 3 | Resolved: Execute in Phase 1 (Day 1–2). Both plans agree on the fix; only timing differs. Earliest wins. |
| C2 | Query layer — Plan 1 estimates 8–12 hours, Plan 2 estimates 8–12 hours as Sprint 2, Plan 3 defers to Tier 2 | Plans 1, 2, 3 | Resolved: Execute in Phase 3 (after security fixes and launch blockers). Plan 1's detailed module structure is the implementation spec. |
| C3 | `select('*')` replacement — appears in Plans 1, 2, and 4 | Plans 1, 2, 4 | Resolved: Execute as part of query layer migration (Phase 3). Plan 2's priority ordering (critical path first) is the execution order. |
| C4 | SRS reconnection — Plan 3 says Day 2 (1 hour), Plan 5 says Sprint 1 Task 1.1 (1 hour) | Plans 3, 5 | Resolved: Execute in Phase 1 (Day 1). Both agree on the fix and effort. Plan 5's detailed code pattern is the implementation spec. |
| C5 | *(Removed — payment integration deferred)* | — | — |
| C6 | Hex migration timing — Plan 1 says Week 3, Plan 4 says it should follow token system unification | Plans 1, 4 | Resolved: Unify token system first (Phase 6), then migrate hex values. Plan 4's accessibility color fixes must happen BEFORE token migration. |
| C7 | Icon library decision — Plan 1 says "pick one," Plan 4 doesn't specify | Plan 1 | Resolved: Consolidate to Phosphor Icons (135 files already using it vs. 57 Lucide-only files). Fewer migrations needed. |
| C8 | Dashboard redesign — Plan 4 specifies "One-Action" redesign, Plan 1 focuses on extraction of inline components | Plans 1, 4 | Resolved: Extract inline components first (Phase 3/cleanup), then apply One-Action redesign (Phase 5/UX). Plan 4's behavioral design is the target state. |
| C9 | IRT wiring timing — Plan 3 says Tier 2 (post-launch), Plan 5 says Sprint 2 (Week 2) | Plans 3, 5 | Resolved: Plan 3 is correct — IRT is NOT a launch blocker. SRS reconnection (Phase 1) is critical. IRT integration is Phase 7 (post-launch-readiness). |
| C10 | Readiness Score tests — Plan 3 says Day 3 (4 hours), Plan 5 says "separate hardening sprint" | Plans 3, 5 | Resolved: Execute in Phase 2. Plan 3 is right — this is the most important computation in the product and needs tests before launch. |

---

## PHASE 0: PRE-FLIGHT CHECKLIST
**Time: 30 minutes | Agent: Any**

Before any implementation begins, execute these setup tasks:

### 0.1 — Environment Verification
```bash
# Verify build passes in current state
bun run build
npx tsc --noEmit

# Capture baseline metrics
find src -name "*.tsx" | wc -l > /tmp/baseline-total-tsx.txt
grep -rl "'use client'" src --include="*.tsx" | wc -l > /tmp/baseline-client-tsx.txt
grep -r "select('\*')" src/ --include="*.ts" --include="*.tsx" | wc -l > /tmp/baseline-select-star.txt
```

### 0.2 — Create Tracking Files
```bash
touch CONFLICT-LOG.md FAILSAFE-LOG.md BLOCKED-TASKS.md AGENT-STATUS.md
```

### 0.3 — Git Branch Strategy
```
main
├── phase-1-launch-blockers
├── phase-2-data-integrity
├── phase-3-purge-and-query-layer
├── phase-4-database-velocity
├── phase-5-ux-components
├── phase-6-design-system
├── phase-7-irt-srs-engines
├── phase-8-frontend-architecture
├── phase-9-perceived-speed
└── phase-10-integration-testing
```

### 0.4 — Install Bundle Analyzer (Baseline)
```bash
bun add -d @next/bundle-analyzer
# Add to next.config.ts:
# const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' })
ANALYZE=true npx next build  # Capture baseline bundle sizes
```

**Phase 0 Exit Gate:** `bun run build` passes. Baseline metrics captured. Tracking files created.

---

## PHASE 1: LAUNCH BLOCKERS — SECURITY & CORE LOOP
**Time: 6–8 hours | Priority: CRITICAL | Agent A**
**Source plans: Pre-Launch Strategy (LB-2 through LB-8), Performance (Sprint 1)**

These tasks fix security vulnerabilities, reconnect the core learning loop, and eliminate critical performance bottlenecks. Nothing else ships until Phase 1 is complete.

> **NOTE: Payment integration (LB-1, RB-1, RB-2, PaywallSheet, Billing Page, Upgrade Page) has been deferred.** See Appendix E for the full list of deferred payment tasks. When payment work resumes, those tasks slot back into Phases 1, 2, and 5 respectively.

### 1.1 — *(DEFERRED — Payment integration removed from current scope. See Appendix E.)*

### 1.2 — Reconnect SRS to Testing Flow (LB-2 + Architecture Plan 1.1)
**File:** `src/lib/actions/testing.ts` (lines ~492–544)
**Time:** 1 hour
**Source:** Pre-Launch §2.1 LB-2, Architecture §2.2, §5.1

**Implementation:**
Add `deriveQualityRating()` + `updateSrsSchedule()` after the interaction upsert in `saveTestingInteraction()`, matching the existing pattern in `src/lib/actions/quiz.ts:388-395`:

```typescript
// After the interaction INSERT succeeds:
try {
  if (config.nodeId) {
    const quality = deriveQualityRating({
      isCorrect,
      responseTimeMs,
    })
    await updateSrsSchedule(user.id, config.nodeId, quality)
  }
} catch (srsError) {
  // SRS failure must NOT block the quiz flow
  console.error('[TESTING: SRS] updateSrsSchedule failed:', srsError)
}
```

**Critical:** SRS failure is caught and logged but NEVER blocks the quiz interaction. The student's answer is always saved regardless of SRS status.

**Verification:**
```bash
bun run build
npx tsc --noEmit
# Verify: start a quiz session, answer a question, check user_srs_cards table for update
```

### 1.3 — Security Headers (LB-3)
**File:** `next.config.ts`
**Time:** 15 minutes
**Source:** Pre-Launch §2.1 LB-3

**Implementation:** Add `headers()` function:
```typescript
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co;" },
    ]
  }]
}
```

**[CONTINGENCY]:** If CSP breaks any feature (3D Lab, Supabase), loosen the specific directive. Log which directive was loosened and why.

### 1.4 — Sanitize XSS in Question Card (LB-4)
**File:** `src/components/shared/question-card.tsx` (lines 233, 243, 409)
**Time:** 15 minutes
**Source:** Pre-Launch §2.1 LB-4

**Implementation:** Wrap all 3 instances of `dangerouslySetInnerHTML` with `DOMPurify.sanitize()`:
```typescript
import DOMPurify from 'dompurify'
// Change: dangerouslySetInnerHTML={{ __html: content }}
// To: dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
```
Reference: existing implementation in `src/components/wiki/ElaborativeInterrogation.tsx`.

### 1.5 — Delete Debug Route (LB-5)
**File:** `src/app/api/debug-taxonomy/route.ts`
**Time:** 5 minutes
**Source:** Pre-Launch §2.1 LB-5

**Implementation:** Delete the file entirely. Verify no imports reference it.

### 1.6 — Fix Social Proof Auth (LB-6)
**File:** `src/lib/actions/social-proof.ts`
**Time:** 15 minutes
**Source:** Pre-Launch §2.1 LB-6

**Implementation:** Add `getUser()` check to top of `getQuestionSocialProof()`, `getTopicDailyStudiers()`, `getTopicDailyStudiersBatch()`.

### 1.7 — Fix Admin Auth (LB-7)
**Files:** `src/lib/actions/admin/dashboard.ts`, `coverage.ts`, `wiki-queries.ts`
**Time:** 30 minutes
**Source:** Pre-Launch §2.1 LB-7

**Implementation:** Add `canReviewContent()` check to each of the 5 admin query functions.

### 1.8 — Fix WCAG Zoom Blocking (LB-8 + UX 3.4)
**File:** `src/app/layout.tsx:51`
**Time:** 1 minute
**Source:** Pre-Launch §2.1 LB-8, UX §3.4

**Implementation:** Remove `maximumScale: 1` from viewport metadata.

### 1.9 — Add "use server" to All Action Files
**Files:** 52 files in `src/lib/actions/`
**Time:** 15 minutes
**Source:** Cleanup §2, Violation 5A; Pre-Launch Day 2

**Implementation:**
```bash
for file in src/lib/actions/**/*.ts; do
  if ! head -1 "$file" | grep -q "use server"; then
    sed -i '1s/^/"use server"\n\n/' "$file"
  fi
done
bun run build
```

### 1.10 — Fix analytics_events RLS
**Time:** 30 minutes
**Source:** Pre-Launch §7.1

**Implementation:** Fix RLS policy on `analytics_events` table to allow anonymous inserts for pre-signup tracking.

### 1.11 — Deploy Missing Database Indexes
**Time:** 15 minutes
**Source:** Performance §2a

**Implementation:** Run the full index migration from Performance Plan §2a:
- `idx_questions_topic_id`
- `idx_quiz_sessions_user_id`
- `idx_user_interactions_user_id`
- `idx_user_interactions_question_id`
- `idx_quiz_sessions_user_id_status` (composite)
- `idx_user_interactions_user_id_session` (composite)
- `idx_wiki_article_taxonomy_node_id`
- `idx_spatial_hotspots_model_id`
- `idx_spatial_hotspots_node_id`
- `idx_readiness_snapshots_user_id`
- `idx_readiness_snapshots_user_id_created` (composite)
- `idx_trail_day_completions_user_id`
- `idx_trail_day_completions_day_id`
- `idx_user_node_mastery_user_id`
- `idx_user_node_mastery_user_id_node` (composite)

Run as a single migration file. This is additive, zero risk.

### 1.12 — Fix ALL 22 Waterfall Pages
**Files:** 22 page files (see Performance §Phase 5, Sprint 1)
**Time:** 3 hours
**Source:** Performance §Phase 2 (Violation 2), Pre-Launch §AF-1/AF-2/AF-3, UX §3.6

**Priority execution order:**
1. `dashboard/testing/session/[sessionId]/page.tsx` — 6 awaits (critical path)
2. `dashboard/testing/page.tsx` — 8 awaits (most visited)
3. `dashboard/testing/session/[sessionId]/debrief/page.tsx` — 7 awaits
4. `dashboard/score-reveal/page.tsx` — 6 awaits (revenue-critical)
5. `(auth)/onboarding/page.tsx` — 10 awaits (first impression)
6. Remaining 17 pages — 3–6 awaits each

**Pattern for every page:**
```typescript
// Auth must remain sequential
const user = await getUser()
// Everything else parallelized
const [sessions, readiness, mastery] = await Promise.all([
  fetchSessions(user.id),
  fetchReadiness(user.id),
  fetchMastery(user.id),
])
```

**Verification per page:** `bun run build` after each transformation.

**Phase 1 Exit Gate:**
```
[ ] bun run build → zero errors
[ ] npx tsc --noEmit → zero errors
[ ] Security headers present (check response headers)
[ ] XSS sanitized (inspect question-card.tsx)
[ ] Debug route deleted
[ ] Social proof + admin auth added
[ ] Zoom not blocked
[ ] "use server" on all 52 action files
[ ] analytics_events RLS fixed
[ ] Database indexes deployed
[ ] All 22 waterfall pages parallelized
[ ] SRS fires on testing interaction (check DB)
```

---

## PHASE 2: DATA INTEGRITY & TESTING
**Time: 6–8 hours | Priority: CRITICAL | Agent A**
**Source plans: Pre-Launch (DI-1 through DI-3, RB-3)**

### 2.1 — Readiness Score Unit Tests (DI-3)
**File:** `src/lib/__tests__/readiness-score.test.ts` (new)
**Time:** 4 hours
**Source:** Pre-Launch §2.3 DI-3

Write comprehensive unit tests for `src/lib/readiness-score.ts` (330-line pure function). Cover:
- All zone thresholds (0, 39, 40, 69, 70, 84, 85, 100)
- Anti-inflation behavior (score should NOT inflate with repeated easy questions)
- Edge cases: zero mastery, all mastery maxed, single node, all nodes
- The 6-vector computation with various input combinations
- Regression guard: output for a fixed input set must match expected values exactly

### 2.2 — Deprecate Legacy Readiness Score (DI-2)
**File:** `src/lib/actions/readiness.ts`
**Time:** 1 hour
**Source:** Pre-Launch §2.3 DI-2

1. Find ALL consumers of the legacy readiness function
2. Route them to `user_global_stats.global_readiness_score`
3. Add `@deprecated` JSDoc to the legacy function
4. Log a warning if the legacy function is ever called

### 2.3 — *(DEFERRED — Billing Settings Page removed from current scope. See Appendix E.)*

### 2.4 — *(DEFERRED — Upgrade Page completion removed from current scope. See Appendix E.)*

### 2.5 — Build Profile Editing (RB-3)
**Route:** `/dashboard/settings/profile`
**Time:** 4 hours
**Source:** Pre-Launch §2.2 RB-3

Build profile editing UI:
- Name editing
- Avatar upload (to Supabase Storage)
- Notification preferences (wire to existing `email-preferences.ts` backend)

### 2.6 — Error Handling for All Server Actions
**Files:** 44 files in `src/lib/actions/`
**Time:** 4–6 hours
**Source:** Cleanup §2 Violation 5B

Add try/catch to all 44 unhandled action files. Use this template:
```typescript
'use server'
export async function someAction(args: ValidatedInput) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'You must be logged in.' }
    // ... existing logic ...
    revalidatePath('/relevant-path')
    return { success: true }
  } catch (err) {
    console.error('[FEATURE: ActionName] someAction:', err)
    return { error: 'Something went wrong. Please try again.' }
  }
}
```

**Critical:** Never leak raw Supabase error messages to the client.

**Phase 2 Exit Gate:**
```
[ ] Readiness score tests pass (all edge cases)
[ ] Legacy readiness function deprecated
[ ] Profile editing works
[ ] All 56 server action files have try/catch
[ ] All server action files have "use server" directive
[ ] bun run build → zero errors
```

---

## PHASE 3: THE PURGE + QUERY ABSTRACTION LAYER
**Time: 16–22 hours | Priority: HIGH | Agent A**
**Source plans: Cleanup (Steps 1–2), Performance (Sprint 2)**

### 3.1 — Delete Unused Packages
**Time:** 10 minutes
**Source:** Cleanup §1A

```bash
bun remove camera-controls katex next-devtools-mcp pdf-parse react-markdown rehype-katex remark-math shadcn-ui three-stdlib
bun run build
```

### 3.2 — Delete Orphaned Components
**Time:** 30 minutes
**Source:** Cleanup §1B

Delete these 9 files (1,292 lines):
- `src/components/dashboard/TestingHub.tsx`
- `src/components/marketing/FloatingTestimonialMarquee.tsx`
- `src/components/dashboard/QuizRenderer.test.tsx`
- `src/components/dashboard/ModeIntroScreen.tsx`
- `src/components/shared/TransitionLink.tsx`
- `src/components/shared/TierBadge.tsx`
- `src/components/dashboard/GradientImage.tsx` (then `bun remove @shadergradient/react` — saves ~200KB)
- `src/components/auth/SignOutButton.tsx`
- `src/components/ceo/skeletons/TableSkeleton.tsx` (verify WIP status first)

**After GradientImage deletion:**
```bash
bun remove @shadergradient/react
bun run build
```

### 3.3 — Delete Duplicate Route Trees
**Time:** 15 minutes
**Source:** Cleanup §1C

- Delete `src/app/dashboard/developer/*` (canonical: `src/app/(protected)/developer/*`)
- Delete `src/app/dashboard/trails/*` (canonical: `src/app/dashboard/camptrails/*`)
- Delete `src/app/admin/wiki/*` (canonical: `src/app/admin/articles/*`)

### 3.4 — Delete Dead Utility Files
**Time:** 30 minutes
**Source:** Cleanup §1D

- `src/lib/demo/data.ts`
- `src/lib/workflow/content-workflow.ts`
- `src/lib/constants/ads.ts`
- `src/lib/admin/permissions.ts`
- `src/lib/wiki/wiki-actions.ts` (duplicate)
- `src/lib/wiki-markdown.ts`
- 13 empty/stub files (verify each first)

### 3.5 — Font Cleanup
**Time:** 15 minutes
**Source:** Cleanup §1G

Remove GeistSans font loading from `src/app/layout.tsx`. Replace usage in `HeroHeadline.tsx` with Syne.

### 3.6 — Move Dev Data
**Time:** 15 minutes
**Source:** Cleanup §1F

Move 6 dev-only data files to `src/lib/__dev__/` or delete if unused.

### 3.7 — Move Misplaced Dependencies
**Time:** 5 minutes
**Source:** Cleanup §1A

```bash
bun remove @types/dompurify && bun add -d @types/dompurify
bun remove @types/papaparse && bun add -d @types/papaparse
bun remove supabase && bun add -d supabase
```

### 3.8 — Purge Verification Gate
```bash
bun run build  # MUST pass with zero errors
```
If errors: restore the file that caused breakage, investigate import chain, fix, re-attempt.

### 3.9 — Build Query Abstraction Layer
**Time:** 8–12 hours
**Source:** Cleanup §2 Violation 1, Performance §2b

Create domain-scoped query modules following this exact pattern:

| Module | Queries to Extract From |
|--------|------------------------|
| `src/lib/queries/testing.ts` | testing pages, session pages, debrief pages |
| `src/lib/queries/dashboard.ts` | dashboard page, dashboard layout |
| `src/lib/queries/assessment.ts` | assessment page, score-reveal page |
| `src/lib/queries/wiki.ts` | wiki pages |
| `src/lib/queries/trails.ts` | camptrails pages |
| `src/lib/queries/analytics.ts` | analytics page |
| `src/lib/queries/admin.ts` | admin pages |
| `src/lib/queries/ceo.ts` | ceo pages |

**Every query function MUST:**
1. Have a comment: `// FEATURE: ComponentName`
2. Use explicit column list — never `select('*')`
3. Always `.eq('user_id', userId)` — even with RLS
4. Return typed `QueryResult<T>` — never raw Supabase response
5. Transform data in the query function, not in the component
6. Handle errors: return `{ data: null, error: message }` — never throw

This simultaneously resolves:
- Cleanup §2 Violation 1 (query abstraction)
- Cleanup §2 Violation 3 (all 47 `select('*')` eliminated)
- Performance §2b (explicit columns)
- Cleanup §2 Violation 5C (reads separated from writes)

### 3.10 — Remove Unnecessary 'use client' Directives
**Time:** 4–6 hours
**Source:** Cleanup §2 Violation 4, Performance §3a

Apply decision tree to all 387 client components:
```
Uses useState/useEffect/useRef/useCallback/useMemo? → keep
Uses browser APIs (window, document, navigator)? → keep
Uses event handlers (onClick, onChange, onSubmit)? → keep
Uses Zustand store? → keep
NONE OF THE ABOVE → REMOVE 'use client'
```

Process in batches by directory. `bun run build` after each batch.

Target: remove 60–70 unnecessary directives. Client ratio from 56% to <40%.

**Phase 3 Exit Gate:**
```
[ ] 9 unused packages removed
[ ] 9 orphaned components deleted
[ ] 3 duplicate route trees deleted
[ ] 6 dead utility files deleted
[ ] @shadergradient/react removed (~200KB savings)
[ ] GeistSans font removed
[ ] All queries extracted to src/lib/queries/
[ ] ZERO select('*') in entire codebase
[ ] Client component ratio < 40%
[ ] bun run build → zero errors
[ ] npx tsc --noEmit → zero errors
```

---

## PHASE 4: DATABASE VELOCITY
**Time: 8–12 hours | Priority: HIGH | Agent A**
**Source plans: Performance (Phase 2), Cleanup (Step 2)**

### 4.1 — RLS Policy Audit and Fix
**Time:** 1.5 hours
**Source:** Performance §2c

1. Run audit query in Supabase SQL editor to identify bare `auth.uid()` policies
2. For every policy found, replace `auth.uid()` with `(select auth.uid())`
3. Deploy as migration: `20260326_fix_rls_auth_uid_caching.sql`

### 4.2 — Deploy updated_at Triggers
**Time:** 30 minutes
**Source:** Performance §2e

Deploy `update_updated_at_column()` function and triggers for all 8 tables missing them.

### 4.3 — Profile Readiness Score Computation
**Time:** 1 hour
**Source:** Performance §2d

Measure actual Readiness Score computation time. If < 100ms, no further action. If > 200ms, create materialized view `mv_user_readiness`.

### 4.4 — Dynamic Import Recharts
**Time:** 30 minutes
**Source:** Performance §Phase 3, 3c

Dynamic import Recharts in 3 CEO chart components:
```typescript
import dynamic from 'next/dynamic'
const RevenueChart = dynamic(
  () => import('@/components/ceo/RevenueChartClient'),
  { ssr: false, loading: () => <ChartSkeleton /> }
)
```

Saves ~90KB deferred loading.

**Phase 4 Exit Gate:**
```
[ ] All RLS policies use (select auth.uid())
[ ] updated_at triggers on all tables
[ ] Readiness Score profiled
[ ] Recharts dynamically imported in CEO charts
[ ] bun run build → zero errors
```

---

## PHASE 5: UX COMPONENT SYSTEM
**Time: 24–32 hours | Priority: HIGH | Agent B**
**Source plans: UX/UI (Sections 3–4), Pre-Launch (Sections 5–6)**

### 5.1 — Build ReadinessScoreRing Component
**File:** `src/components/score/ReadinessScoreRing.tsx`
**Time:** 3 hours
**Source:** UX §4.1

Full spec from UX Plan §4.1. SVG ring with animated fill, zone-colored stroke, delta display. Accessibility: `aria-label`, `role="img"`.

### 5.2 — Score Reveal Emotional Redesign
**File:** `src/app/dashboard/score-reveal/page.tsx`
**Time:** 4 hours
**Source:** UX §3.2, Pre-Launch §5.2

Three-layer redesign:
- Layer 1 (0ms): Skeleton with animating ring
- Layer 2 (<500ms): Parallel data fetch, ring animates to score, zone color
- Layer 3 (immediate): Zone-specific copy + CTAs

Zone copy (from UX §3.2):
- Strong (≥85%): "Strong foundation. Your Trail will sharpen the edges."
- Green (70–84%): "Solid ground. Your Trail targets the [X] topics that will push you higher."
- Amber (40–69%): "You know more than you think. Your Trail builds on what's already working."
- Needs Review (<40%): "Every camper starts somewhere. Your Trail focuses on the topics with the most room to grow."

**NEVER use red for low scores. NEVER use words like "failed," "weak," "bad," "behind."**

### 5.3 — Build HeatmapNode + HeatmapGrid
**Time:** 4 hours
**Source:** UX §4.2

Full spec from UX Plan §4.2. Color + shape mapping for accessibility (never color alone).

### 5.4 — Build StatCard Component
**Time:** 1 hour
**Source:** UX §4.3

Universal metric display: eyebrow/title/value/delta pattern.

### 5.5 — Build TrailDayCard Component
**Time:** 2 hours
**Source:** UX §4.4

Camp Orange left-border accent for current day. Locked state for gated days.

### 5.6 — Build SessionResultsPanel
**Time:** 2 hours
**Source:** UX §4.5

Score display follows zone color logic. Primary CTA always in bottom 40% thumb zone.

### 5.7 — *(DEFERRED — PaywallSheet Component removed from current scope. See Appendix E.)*

### 5.8 — Build EmptyState Component
**Time:** 1 hour
**Source:** UX §4.7

Copy pattern: "[Honest observation]. [What to do next]." Never "No data found."

### 5.9 — Build TodayActionCard + QuickStatsRow
**Time:** 2 hours
**Source:** UX §3.5

Dashboard One-Action principle components.

### 5.10 — Dashboard One-Action Redesign
**Time:** 4 hours
**Source:** UX §3.5

Restructure dashboard: ReadinessScoreWidget → TodayActionCard → QuickStatsRow above fold. Everything else below fold.

### 5.11 — Accessibility Critical Fixes
**Time:** 4 hours
**Source:** UX §3.4

- Button 44px touch target override (`@media (pointer: coarse)`)
- Darken 5 failing contrast colors
- Add `alt` text to all images (dashboard + wiki first)
- Add `aria-label` to all heatmap nodes

**Phase 5 Exit Gate:**
```
[ ] All new components built and rendering (7 components; PaywallSheet deferred)
[ ] Score reveal page redesigned with zone framing
[ ] Dashboard shows One-Action layout
[ ] Touch targets ≥ 44px on mobile
[ ] Color contrast passes WCAG AA
[ ] All images have alt text
[ ] bun run build → zero errors
```

---

## PHASE 6: DESIGN SYSTEM UNIFICATION
**Time: 16–20 hours | Priority: MEDIUM | Agent B**
**Source plans: Cleanup (Step 3), UX/UI (3.3)**

### 6.1 — Resolve Dual Token System
**Time:** 2 hours
**Source:** Cleanup §3D, UX §3.3

Deprecate Camp Standard tokens (`--camp-cobalt`, `--camp-red`, etc.). Unify to shadcn semantic tokens in `globals.css`. Map Camp values to their semantic equivalents.

### 6.2 — Hex → Design Token Migration (Top 10)
**Time:** 8–12 hours
**Source:** Cleanup §3D, UX §3.3

Migrate 2,080 instances (81% of 2,576):

| Hex | Count | Replace With |
|-----|-------|-------------|
| `#1B3FC4` | 406 | `text-primary` / `bg-primary` |
| `#D4DAE3` | 343 | `border-border` |
| `#8896A7` | 315 | `text-muted-foreground` |
| `#4A5568` | 223 | `text-text-secondary` |
| `#1A2332` | 221 | `text-foreground` |
| `#EEF2FC` | 141 | `bg-primary-50` |
| `#D64545` | 113 | `text-destructive` |
| `#D4951A` | 110 | `text-warning` |
| `#1535A8` | 106 | `text-primary-700` |
| `#2D9F6F` | 102 | `text-success` |

Context-aware replacement: `bg-[#1B3FC4]` → `bg-primary`, `text-[#1B3FC4]` → `text-primary`, `border-[#1B3FC4]` → `border-primary`.

Enable ESLint hex-color rule as error after migration.

### 6.3 — Card Component Migration
**Time:** 4–6 hours
**Source:** Cleanup §3B

Migrate 465 ad-hoc card divs to shared `<Card>` component. Priority: dashboard → testing → wiki → admin → ceo.

### 6.4 — Icon Library Consolidation
**Time:** 4–6 hours
**Source:** Cleanup §3C, Performance §3d

**Decision: Consolidate to Phosphor Icons.**

1. Create mapping file: `icon-migration-map.ts`
2. Migrate 57 Lucide-only files to Phosphor equivalents
3. `bun remove lucide-react`
4. Savings: ~60KB bundle reduction

### 6.5 — Voice Guide Compliance
**Time:** 2 hours
**Source:** Cleanup §3F

Rename "drill" → "practice/review" across 28+ instances: component files, UI labels, mission IDs.

### 6.6 — Inline Component Extraction
**Time:** 4–6 hours
**Source:** Cleanup §3A

Extract inline components from routing files:
- `dashboard/page.tsx` (29 changes — HIGH churn)
- `dashboard/layout.tsx` (27 changes — HIGH churn)
- `ResultsSummary.tsx` → extract `CalibrationSection`, `ErrorPatternSection`
- `QuizRenderer.tsx` → extract `NoQuestionsLoaded`

### 6.7 — Loading + Empty States
**Time:** 4–6 hours
**Source:** Cleanup §3E, Performance §4c

- Add `loading.tsx` to remaining 18 pages
- Create skeleton components for high-traffic data components
- Add empty state with CTA for all data-dependent components

**Phase 6 Exit Gate:**
```
[ ] Single token system (no dual tokens)
[ ] 2,080+ hex instances migrated to tokens
[ ] ESLint hex rule set to error
[ ] 465 ad-hoc cards migrated to shared Card
[ ] Single icon library (Phosphor)
[ ] All "drill" renamed to "practice/review"
[ ] All inline components extracted from routing files
[ ] 100% loading.tsx coverage
[ ] bun run build → zero errors
```

---

## PHASE 7: IRT & SRS ENGINE INTEGRATION
**Time: 20–28 hours | Priority: MEDIUM | Agent C**
**Source plan: Product Architecture (Phases 2–5)**

**Note:** This phase begins AFTER Phase 1's SRS reconnection is verified working. The SRS reconnection (Phase 1.2) is the critical 1-hour fix. This phase builds the FULL adaptive testing infrastructure on top of it.

### 7.1 — Schema Migrations
**Time:** 1 hour
**Source:** Architecture §3.2, §4.2

Deploy three migrations:
1. `20260326_add_irt_columns_to_questions.sql` — Add `irt_difficulty`, `irt_discrimination`, `irt_guessing`, `irt_calibrated_at` to questions table
2. `20260326_create_user_theta.sql` — Per-discipline ability estimates
3. `20260326_create_user_srs_cards.sql` — SRS scheduling cards

Backfill IRT defaults from `difficulty_label`: easy → -1.5, medium → 0.0, hard → 1.5.

### 7.2 — Deploy IRT RPCs
**Time:** 3 hours
**Source:** Architecture §3.3

Deploy and test:
- `select_next_item` — Maximum Fisher Information item selection
- `update_theta` — Newton-Raphson MLE single-step theta update
- `calibrate_irt_batch()` — Offline calibration function

### 7.3 — Deploy SRS RPCs
**Time:** 1.5 hours
**Source:** Architecture §4.3

Deploy and test:
- `get_review_deck` — Due nodes ordered by overdue priority
- `get_review_due_count` — Dashboard widget count

### 7.4 — Create Query + Action Modules
**Time:** 3 hours
**Source:** Architecture §5.2

- `src/lib/queries/srs.ts` — fetchReviewDueCount, fetchReviewDeck
- `src/lib/queries/adaptive-quiz.ts` — fetchQuestionById, fetchUserTheta
- `src/lib/actions/srs.ts` — startReviewSession, completeReviewSession

### 7.5 — Modify saveTestingInteraction for IRT
**Time:** 2 hours
**Source:** Architecture §5.1

Add theta update + next question selection after interaction INSERT. Use the exact pattern from Architecture Plan §5.1. IRT failure must NOT block quiz flow (try/catch with logging).

### 7.6 — Modify Session Creation for Adaptive Selection
**Time:** 3 hours
**Source:** Architecture §5.1

For adaptive modes (camp, storm, review): use `select_next_item` RPC.
For non-adaptive modes: use existing selection logic.
Add fallback to random selection when IRT fails.

### 7.7 — Modify useSessionStore for Streaming Delivery
**Time:** 3 hours
**Source:** Architecture §6.3

Change from storing full question array to storing current question + fetchNext callback. Add `currentNodeId` for SRS context.

### 7.8 — Backfill SRS Cards
**Time:** 1 hour
**Source:** Architecture §Sprint 3, Task 3.4

Generate `user_srs_cards` from existing `user_node_mastery` data. **Critical:** Stagger `next_review_at` across the next 7 days to prevent "87 topics due" on day 1.

### 7.9 — Write RPC Tests
**Time:** 3 hours
**Source:** Architecture §Sprint 1, Tasks 1.7–1.8

Comprehensive tests for `select_next_item` and `update_theta` RPCs.

**Phase 7 Exit Gate:**
```
[ ] All 3 schema migrations deployed
[ ] IRT RPCs deployed and tested
[ ] SRS RPCs deployed and tested
[ ] saveTestingInteraction calls IRT + SRS
[ ] Session creation uses adaptive selection for camp/storm/review modes
[ ] Fallback to random works when IRT fails
[ ] useSessionStore supports streaming delivery
[ ] SRS cards backfilled
[ ] bun run build → zero errors
```

---

## PHASE 8: FRONTEND ARCHITECTURE OPTIMIZATION
**Time: 12–16 hours | Priority: MEDIUM | Agent B**
**Source plans: Performance (Phase 3), UX/UI (telemetry)**

### 8.1 — Split Chart Components (Server/Client)
**Time:** 4 hours
**Source:** Performance §3a

Split CEO charts (8 components) and analytics charts (7 components) into Server parent + Client chart child pattern.

### 8.2 — Suspense Streaming for Dashboard
**Time:** 2 hours
**Source:** Performance §3b

Add 4 independent Suspense boundaries to dashboard:
1. Readiness Score (highest priority)
2. Taxonomy Heatmap
3. Recent Activity
4. Mastery Trajectory Chart

### 8.3 — Wiki Static Generation
**Time:** 1 hour
**Source:** Performance §3c

Add `generateStaticParams` + ISR (`revalidate: 3600`) to wiki article routes.

### 8.4 — Barrel File Audit
**Time:** 1 hour
**Source:** Performance §Sprint 3, Task 3.10

Audit all `index.ts` barrel files in `src/components/` for Server/Client mixing.

### 8.5 — Build ReviewDueCount Widget
**Time:** 1 hour
**Source:** Architecture §6.2

Server Component on dashboard showing due review count + "Start Review" CTA. Wrapped in Suspense.

### 8.6 — Add SRS Indicators to Heatmap
**Time:** 1 hour
**Source:** Architecture §6.2

Add pulsing dot indicator to heatmap nodes due for SRS review.

### 8.7 — Telemetry Event Implementation
**Time:** 4 hours
**Source:** UX §5A

Implement all 16 analytics events from UX Plan §5A:
- diagnostic_started, diagnostic_completed, diagnostic_abandoned
- score_reveal_viewed, score_reveal_cta_clicked
- session_started, session_completed, session_abandoned
- heatmap_viewed, heatmap_node_tapped
- trail_day_started, trail_day_completed
- app_opened

### 8.8 — A/B Test Infrastructure
**Time:** 2 hours
**Source:** UX §6

Create lightweight feature flag system:
- `src/lib/experiments.ts` — Experiment interface + variant assignment (hash-based)
- `user_experiments` table for analytics joins
- Feature flag check component

**Phase 8 Exit Gate:**
```
[ ] Chart components split (Server/Client)
[ ] Dashboard has 4 Suspense boundaries
[ ] Wiki routes statically generated with ISR
[ ] Barrel files clean (no Server/Client mixing)
[ ] ReviewDueCount widget on dashboard
[ ] SRS indicators on heatmap
[ ] All 16 telemetry events firing
[ ] A/B test infrastructure deployed
[ ] bun run build → zero errors
```

---

## PHASE 9: PERCEIVED SPEED + POLISH
**Time: 12–16 hours | Priority: MEDIUM | Agent B**
**Source plans: Performance (Phase 4), Pre-Launch (Polish), UX/UI (Principles)**

### 9.1 — Optimistic Quiz Answer Selection
**Time:** 2 hours
**Source:** Performance §4a

Immediate visual feedback on tap (0ms perceived). Background Server Action write. Rollback toast on failure.

### 9.2 — Answer Button Press Feedback
**Time:** 30 minutes
**Source:** Performance §4d

`pointerdown` + `scale-[0.98]` transform for instant tactile feedback.

### 9.3 — Question Prefetching
**Time:** 2 hours
**Source:** Performance §4b

Prefetch next 2–3 questions while student reads current question.

### 9.4 — Animated Score Count-Up
**Time:** 1 hour
**Source:** Performance §4d

Smooth count-up animation for Readiness Score changes. CSS ease-out cubic, 600ms duration.

### 9.5 — Optimistic Note Save
**Time:** 1 hour
**Source:** Performance §4a

Instant "Saved" feedback, auto-retry on failure.

### 9.6 — Stale-While-Revalidate for Heatmap
**Time:** 1 hour
**Source:** Performance §4c

Show cached heatmap instantly, refresh in background.

### 9.7 — Write About Page
**Time:** 2 hours
**Source:** Pre-Launch §AF-4

Philip's story, architect credibility, SlateCamp mission. This is credibility infrastructure.

### 9.8 — Write Contact Page
**Time:** 1 hour
**Source:** Pre-Launch §AF-4

Support email, response time commitment.

### 9.9 — Fix Color Contrast
**Time:** 1 hour
**Source:** Pre-Launch §2.5, UX §3.4

Darken 5 failing colors per UX Plan specifications.

### 9.10 — AI Tutor Citations Clickable
**Time:** 30 minutes
**Source:** Pre-Launch §2.5

### 9.11 — Exam Countdown Component
**Time:** 2 hours
**Source:** Pre-Launch §6.1

Build countdown component for dashboard: "X days until the ALE."

### 9.12 — Daily Streak Counter
**Time:** 2 hours
**Source:** Pre-Launch §6.3

Simple counter in dashboard header. Query `trail_day_completions` for consecutive days.

**Phase 9 Exit Gate:**
```
[ ] Quiz answer selection feels instant (0ms perceived)
[ ] Press feedback on answer buttons
[ ] Next questions prefetched
[ ] Score animates on change
[ ] Notes save optimistically
[ ] Heatmap shows cached data instantly
[ ] About page live and credible
[ ] Contact page live
[ ] All colors pass WCAG AA
[ ] AI Tutor citations clickable
[ ] Exam countdown on dashboard
[ ] Streak counter on dashboard
[ ] bun run build → zero errors
```

---

## PHASE 10: INTEGRATION TESTING + LAUNCH READINESS
**Time: 8–10 hours | Priority: CRITICAL | All Agents**
**Source plans: Pre-Launch (Day 7), All plans (verification protocols)**

### 10.1 — Full Build Verification
```bash
bun run build          # Zero errors
npx tsc --noEmit       # Zero type errors
```

### 10.2 — Metrics Verification
```bash
# Client component ratio
find src -name "*.tsx" | wc -l                              # total
grep -rl "'use client'" src --include="*.tsx" | wc -l       # client
# Target: client / total < 0.40

# Zero select('*')
grep -r "select('\*')" src/ --include="*.ts" --include="*.tsx"
# Should return 0

# Bundle analysis
ANALYZE=true npx next build
# Compare to Phase 0 baseline
```

### 10.3 — End-to-End Flow Testing
Execute this exact sequence manually:

```
1. NEW USER SIGNUP
   □ Email signup works
   □ Google OAuth signup works
   □ Onboarding page loads in < 1s (no waterfall)
   □ Security headers present in response

2. DIAGNOSTIC FLOW
   □ Start 20-question diagnostic
   □ Answer all questions (SRS updates fire — check DB)
   □ Score reveal page loads with zone-colored ring
   □ Zone-specific copy displays correctly
   □ "See Your Trail" CTA visible in thumb zone

3. CAMP TRAIL DAY 1
   □ Trail auto-populated from diagnostic results
   □ Day 1 targets weakest area
   □ Session start → first question in < 500ms
   □ Answer 15 questions (IRT adapts difficulty — check theta table)
   □ Post-session heatmap delta displayed
   □ "Come back tomorrow for Day 2" prompt visible

4. HEATMAP VERIFICATION
   □ Heatmap loads with colored nodes
   □ Nodes have aria-labels
   □ SRS due indicators show on applicable nodes
   □ Tapping a node shows topic detail sheet

5. UPGRADE FLOW (DEFERRED — payment integration not in current scope)

6. PRO FEATURE VERIFICATION (DEFERRED — requires payment integration)

7. BILLING PAGE (DEFERRED — requires payment integration)

8. REVIEW SESSION
   □ ReviewDueCount shows on dashboard (if topics are due)
   □ "Start Review" button creates review session
   □ Questions are from due SRS nodes
   □ Session completion updates SRS next_review_at

9. SCORE TRAJECTORY
   □ Readiness score history chart renders
   □ Score delta displays in gold
   □ Multiple sessions create visible trajectory

10. ACCESSIBILITY SPOT CHECK
    □ Pinch-to-zoom works on mobile
    □ Touch targets ≥ 44px
    □ Tab navigation works through core flow
    □ Score ring has aria-label
```

### 10.4 — Post-Cleanup Checklist
Execute the full checklist from Cleanup Plan §Post-Cleanup:

```
ARCHITECTURE
[ ] No inline components in routing files
[ ] No 'use client' on pure display components
[ ] No Supabase calls outside src/lib/queries/ (reads) or src/lib/actions/ (writes)
[ ] No select('*') queries anywhere
[ ] All 22 waterfall pages converted to Promise.all()
[ ] Duplicate route trees deleted

TYPESCRIPT
[ ] No new 'any' types introduced
[ ] No new @ts-ignore without explanation
[ ] All query functions have return types (QueryResult<T>)
[ ] All server action files have "use server" directive

ERROR HANDLING
[ ] All server action files have try/catch
[ ] All query functions return { data, error } — never throw
[ ] No raw Supabase error messages leak to client

IMPORTS
[ ] No unused imports
[ ] All imports use @/ absolute paths
[ ] No barrel files mixing Server/Client re-exports
[ ] 9 unused dependencies removed
[ ] Misplaced dependencies in devDependencies

DESIGN SYSTEM
[ ] Top 10 hex values migrated (2,080 instances)
[ ] Dual token system resolved
[ ] ESLint hex rule set to error

DEAD CODE
[ ] 9 orphaned components deleted
[ ] 6 dead utility files deleted
[ ] 78+ dead exports removed
[ ] 3 duplicate route trees deleted
[ ] GeistSans font removed

IRT/SRS
[ ] SRS fires on every testing interaction
[ ] IRT adaptive selection working in camp/storm/review modes
[ ] Theta updates after every answer
[ ] SRS cards backfilled
[ ] Review sessions functional

SECURITY
[ ] Security headers present
[ ] XSS sanitized
[ ] Debug route deleted
[ ] Social proof + admin auth checks in place
[ ] Zoom not blocked

BUILD
[ ] bun run build → zero errors
[ ] npx tsc --noEmit → zero errors
[ ] Bundle size reduced by ≥260KB from baseline
```

### 10.5 — Decision Gate

**IF all checks pass:** SlateCamp is launch-ready. Open beta doors to first 50 users.

**IF any checks fail:** Log failures in `LAUNCH-BLOCKERS-REMAINING.md`. Fix before launch. Re-run Phase 10.

---

## PHASE DEPENDENCY MAP

```
Phase 0 (Setup)
  ↓
Phase 1 (Launch Blockers) ←── MUST complete first
  ↓
Phase 2 (Data Integrity) ←── Depends on Phase 1
  ↓
Phase 3 (Purge + Query Layer) ←── Can start after Phase 1
  ↓
Phase 4 (Database Velocity) ←── Can start after Phase 1
  ↓
Phase 5 (UX Components) ←── Can start after Phase 1
  ↓
Phase 6 (Design System) ←── Depends on Phase 3 (purge first, then migrate)
  ↓
Phase 7 (IRT/SRS) ←── Depends on Phase 1.2 (SRS reconnect) + Phase 3.9 (query layer)
  ↓
Phase 8 (Frontend Arch) ←── Depends on Phases 3, 5, 7
  ↓
Phase 9 (Perceived Speed) ←── Depends on Phase 5 (components exist)
  ↓
Phase 10 (Integration) ←── ALL phases complete
```

### Parallel Execution Strategy (2 Agents)

```
Week 1:  Agent A: Phase 1 (launch blockers)
         Agent B: (waiting — Phase 1 must complete)

Week 2:  Agent A: Phase 2 (data integrity) + Phase 3 (purge)
         Agent B: Phase 5 (UX components)

Week 3:  Agent A: Phase 3 cont. (query layer) + Phase 4 (DB velocity)
         Agent B: Phase 6 (design system)

Week 4:  Agent A: Phase 7 (IRT/SRS engines)
         Agent B: Phase 8 (frontend arch)

Week 5:  Agent A: Phase 7 cont.
         Agent B: Phase 9 (perceived speed)

Week 6:  Both: Phase 10 (integration testing)
```

### Parallel Execution Strategy (3 Agents)

```
Week 1:  Agent A: Phase 1
         Agent B: (waiting)
         Agent C: (waiting)

Week 2:  Agent A: Phase 2 + Phase 3 (purge only)
         Agent B: Phase 5
         Agent C: Phase 4

Week 3:  Agent A: Phase 3 (query layer)
         Agent B: Phase 6
         Agent C: Phase 7

Week 4:  Agent A: Phase 7 cont.
         Agent B: Phase 8
         Agent C: Phase 9

Week 5:  All: Phase 10
```

---

## APPENDIX A: FILES TOUCHED BY MULTIPLE PHASES

These files are edited in more than one phase. Agents MUST coordinate or sequence edits:

| File | Phases | Coordination |
|------|--------|-------------|
| `src/lib/actions/testing.ts` | 1 (SRS reconnect), 7 (IRT integration) | Phase 1 first, Phase 7 builds on it |
| `src/app/dashboard/page.tsx` | 3 (inline extraction), 5 (One-Action redesign), 8 (Suspense) | Phase 3 → 5 → 8 strict order |
| `src/app/layout.tsx` | 1 (zoom fix), 3 (font cleanup), 1 (security headers) | All Phase 1 changes in single commit |
| `src/app/dashboard/score-reveal/page.tsx` | 1 (waterfall fix), 5 (emotional redesign) | Phase 1 fix first, Phase 5 redesign on top |
| `src/app/dashboard/testing/page.tsx` | 1 (waterfall fix), 3 (query extraction) | Phase 1 first, Phase 3 migrates queries |
| `src/components/dashboard/QuizRenderer.tsx` | 3 (inline extraction), 7 (streaming delivery), 9 (optimistic UI) | Strict Phase 3 → 7 → 9 order |
| `globals.css` | 6 (token unification) | Single phase only |
| `package.json` | 1 (no changes), 3 (dependency removal), 6 (icon library) | Phase 3 first, Phase 6 after |
| `next.config.ts` | 1 (security headers), 4 (bundle analyzer) | Phase 1 first |

---

## APPENDIX B: TOTAL TASK COUNT BY SOURCE PLAN

| Source Plan | Original Tasks | Tasks Merged (duplicates) | Deferred (payment) | Active Tasks in This Plan |
|------------|---------------|--------------------------|---------------------|---------------------------|
| Lean Tech Cleanup | 89 | 23 merged with Performance | 0 | 66 |
| Performance Roadmap | 73 | 23 merged with Cleanup | 0 | 50 |
| Pre-Launch Strategy | 52 | 12 merged with others | 5 | 35 |
| UX/UI Plan | 67 | 8 merged with others | 3 | 56 |
| Product Architecture | 48 | 6 merged with Pre-Launch | 1 | 41 |
| **Total** | **329** | **72 duplicates eliminated** | **9 deferred** | **238 active tasks** |

Every non-payment task from every source plan is accounted for. Zero omissions. Payment tasks are preserved in Appendix E for future reintegration.

---

## APPENDIX C: RISK REGISTER (UNIFIED)

| # | Risk | Probability | Impact | Mitigation | Source Plan |
|---|------|-------------|--------|------------|-------------|
| 1 | *(Removed — payment integration deferred)* | — | — | — | — |
| 2 | SRS card backfill creates too many due reviews on day 1 | HIGH | MEDIUM | Stagger `next_review_at` over 7 days during backfill | Architecture |
| 3 | IRT RPC exceeds 20ms latency | MEDIUM | HIGH | Index on `(topic_id, irt_difficulty, irt_discrimination)`. Fallback to TypeScript implementation. | Architecture |
| 4 | Query layer migration breaks consuming components | MEDIUM | HIGH | Verify every component gets all fields it needs. Build gate after each migration. | Cleanup |
| 5 | 'use client' removal breaks components | LOW | LOW | Build immediately catches. Restore directive if build fails. | Cleanup |
| 6 | Hex migration causes visual regressions | LOW | LOW | Visual review in browser after each batch. Purely cosmetic, no behavior change. | Cleanup |
| 7 | CSP headers break Supabase/3D Lab | MEDIUM | HIGH | Loosen specific directive if breakage occurs. Test each service after adding headers. | Pre-Launch |
| 8 | Missing exam season window | HIGH if delayed | CRITICAL | Work backward from ALE date. Phases 1–2 unlock revenue. Everything else is optimization. | Pre-Launch |
| 9 | Solo developer burnout | HIGH | CRITICAL | 273 commits in 18 days is unsustainable. Phase 1–2 is the survival sprint. Everything after that can be paced. | Pre-Launch |
| 10 | Newton-Raphson theta diverges | LOW | MEDIUM | Clamped to [-4, 4]. Step size clamped to [-1, 1]. Bayesian prior for first 10 responses. | Architecture |

---

## APPENDIX D: POST-IMPLEMENTATION MONITORING

After all 10 phases are complete, monitor these metrics:

| Metric | Target | Red Flag | How to Measure |
|--------|--------|----------|---------------|
| Quiz completion rate | +5–10% | Drop from baseline | `quiz_sessions` completed/started ratio |
| Time-to-first-question | < 500ms | > 1s | Telemetry: `session_started` timestamp delta |
| Dashboard load (FCP) | < 1s | > 2s | Lighthouse |
| D7 retention | ≥ 40% | < 25% | `app_opened` events with 7-day window |
| Score reveal → Session 2 | ≥ 55% | < 35% | `score_reveal_cta_clicked` → `session_started` |
| Diagnostic completion | ≥ 85% | < 70% | `diagnostic_completed` / `diagnostic_started` |
| Bundle size | ≥ 260KB reduction from baseline | < 100KB reduction | `@next/bundle-analyzer` comparison |
| Client component ratio | < 40% | > 45% | `grep -rl "'use client'" src | wc -l` / total |
| Supabase egress | 40–60% reduction | No change | Supabase dashboard |

---

*This unified implementation plan was generated 2026-03-25 by synthesizing all 5 source implementation plans. Every task is traceable to its source plan. Every conflict is documented and resolved. Every phase has verification gates. Every critical path has contingencies. The total scope is 247 unique tasks across 10 phases, estimated at 180–240 engineering hours, executable in 6–10 weeks depending on team size.*

---

## APPENDIX E: DEFERRED PAYMENT INTEGRATION TASKS

These 9 tasks have been removed from the current implementation scope. They are preserved here in full so that when payment integration resumes, they can be slotted back into the plan with zero re-analysis.

**Reintegration instructions:** When payment work begins, insert these tasks into the phases indicated. All dependencies on non-payment tasks (security headers, query layer, component system) will already be complete.

### DEFERRED-1: Wire Payment Buttons (was Phase 1.1)
**Reintegration phase:** Phase 1 (or standalone sprint)
**File:** `src/app/dashboard/upgrade/page.tsx`
**Time:** 2 hours
**Source:** Pre-Launch §2.1 LB-1, UX §3.1

**Implementation:**
1. Locate GCash and Card payment buttons on the upgrade page
2. Add `onClick` handlers that call the existing checkout route at `src/app/api/payments/checkout/route.ts`
3. GCash button → PayRex checkout flow
4. Card button → Stripe checkout flow
5. Add loading state on button press (disable button, show spinner)
6. Add error state with retry capability
7. Success redirects to `/dashboard/welcome-pro`

**Contingency:** If PayRex integration is incomplete, ship Card-only first.

### DEFERRED-2: Build Billing Settings Page (was Phase 2.3)
**Reintegration phase:** Phase 2 (or standalone sprint)
**Route:** `/dashboard/settings/billing`
**Time:** 4 hours
**Source:** Pre-Launch §2.2 RB-1

Build billing management page showing:
- Current plan (Free/Pro)
- Next billing date
- Payment method on file
- Invoice history (from Stripe)
- Cancel subscription button (with confirmation dialog)
- Resubscribe CTA for canceled users

Use Stripe Customer Portal API if available, or custom UI from `user_subscriptions` table.

### DEFERRED-3: Complete Upgrade Page (was Phase 2.4)
**Reintegration phase:** Phase 2 (or standalone sprint)
**Time:** 4 hours
**Source:** Pre-Launch §2.2 RB-2, UX §3.7

Add to existing upgrade page:
- Social proof counter ("X students enrolled for [exam month]")
- ₱99 trial option (if business decision confirms)
- Annual pricing toggle (₱1,499/year, save 58% — annual shown first per UX Plan)
- Trust signals: "Secure payment · GCash, card, or bank transfer · Cancel anytime"

### DEFERRED-4: Build PaywallSheet Component (was Phase 5.7)
**Reintegration phase:** Phase 5 (or standalone sprint)
**Time:** 4 hours
**Source:** UX §3.7, §4.6

Bottom sheet (not modal). Full spec in UX Plan §4.6. Includes:
- Score → Value → Comparison → Social Proof → CTA flow
- Annual price shown first (price anchoring)
- GCash trust signals
- "Not yet — continue free" always visible
- `triggerContext` tracking for analytics

### DEFERRED-5: Payment Telemetry Events
**Reintegration phase:** Phase 8 (telemetry)
**Time:** 1 hour
**Source:** UX §5A

Add these 3 analytics events:
- `paywall_shown` — PaywallSheet mounts (trigger_context, score_at_time, sessions_completed, days_since_signup)
- `paywall_decision` — User taps Upgrade or Dismiss (action, time_on_paywall_ms, score_at_time)
- `payment_completed` — Webhook confirms payment (plan, amount, method, days_since_signup)

### DEFERRED-6: Upgrade Flow E2E Test
**Reintegration phase:** Phase 10 (integration testing)
**Time:** 1 hour

```
□ PaywallSheet triggers after score tap (or manual navigation)
□ Annual price shown first
□ GCash and Card buttons both functional
□ ₱399 test payment via Stripe test mode succeeds
□ Redirects to /dashboard/welcome-pro
□ Pro features unlocked after payment
```

### DEFERRED-7: Pro Feature Verification E2E Test
**Reintegration phase:** Phase 10
**Time:** 30 minutes

```
□ Readiness Score live (not blurred)
□ Full Heatmap accessible
□ Camp Trail Day 4+ accessible
□ Storm Mode accessible
□ 3D Lab accessible
□ Full analytics dashboard accessible
```

### DEFERRED-8: Billing Page E2E Test
**Reintegration phase:** Phase 10
**Time:** 30 minutes

```
□ Subscription visible
□ Next billing date correct
□ Cancel button works (with confirmation)
□ Resubscribe CTA appears after cancellation
```

### DEFERRED-9: CSP Stripe Domain + Payment Risk Register Items
**Reintegration phase:** Phase 1 (security headers)
**Time:** 15 minutes

When payment integration resumes:
- Add `https://*.stripe.com` to CSP `connect-src` directive in `next.config.ts`
- Re-add risk register item: "Payment integration failure on launch day" with mitigation: "Test E2E with Stripe test cards + PayRex sandbox. Manual subscription activation as backup."
- Re-add monitoring metric: "Free→Paid conversion | ≥ 8% | < 4% | `paywall_decision` events"

### Deferred Task Summary

| # | Task | Original Phase | Effort | Dependencies When Reintegrated |
|---|------|---------------|--------|-------------------------------|
| D-1 | Wire payment buttons | 1 | 2 hours | None (checkout route exists) |
| D-2 | Billing settings page | 2 | 4 hours | D-1 |
| D-3 | Complete upgrade page | 2 | 4 hours | D-1 |
| D-4 | PaywallSheet component | 5 | 4 hours | D-1, Phase 5 components |
| D-5 | Payment telemetry | 8 | 1 hour | D-1, D-4, telemetry infra |
| D-6 | Upgrade flow E2E | 10 | 1 hour | D-1, D-3, D-4 |
| D-7 | Pro feature E2E | 10 | 30 min | D-1 |
| D-8 | Billing page E2E | 10 | 30 min | D-2 |
| D-9 | CSP + risk items | 1 | 15 min | D-1 |
| **Total deferred** | | | **~17.25 hours** | |

**When to reintegrate:** These tasks can be executed as a standalone 2–3 day sprint at any point after Phase 5 is complete. All non-payment infrastructure (security headers, query layer, component system, design tokens) will be in place.

*Source plans: LEAN-TECH-CLEANUP-ROADMAP.md, PERFORMANCE-IMPLEMENTATION-ROADMAP.md, SLATECAMP-PRE-LAUNCH-STRATEGY.md, MASTER-UX-UI-IMPLEMENTATION-PLAN.md, PRODUCT-ARCHITECTURE-IMPLEMENTATION-PLAN.md*
