# SlateCamp Performance Implementation Roadmap
### Generated 2026-03-25 from Global Codebase Audit

---

## Executive Summary

SlateCamp's codebase has strong performance foundations in several areas — the analytics page Suspense architecture (8 independent boundaries), the 3D Lab demand rendering (`frameloop="demand"`), wiki widget lazy-loading, and quiz session offline persistence are all production-quality. However, the audit reveals systemic performance issues that compound across the critical user path: **22 waterfall pages**, **47 `select('*')` over-fetching calls**, **56% client component ratio** (target <40%), and an estimated **~200KB dead shader gradient** bundled for a single orphaned component.

### Current Baseline (from audit)

| Metric | Current | Target |
|--------|---------|--------|
| Waterfall pages (sequential awaits) | 22 pages | 0 pages |
| `select('*')` overfetching calls | 47 | 0 |
| Client component ratio | 56% (387/692 files) | <40% |
| Unnecessary `'use client'` directives | ~60-70 files | 0 |
| Dynamic imports / client components | 10/371 (2.7%) | >20% for heavy deps |
| Loading.tsx skeleton coverage | 83% (87/105 pages) | 100% |
| Query abstraction layer coverage | 5 files (vs 40+ inline) | 100% centralized |
| Dead bundle weight (shader gradient) | ~200KB | 0KB |
| Estimated quiz session page latency (waterfall) | ~300ms wasted | <50ms total query time |
| Estimated testing hub page latency (waterfall) | ~400ms wasted | <50ms total query time |
| Estimated onboarding page latency (waterfall) | ~500ms wasted | <80ms total query time |

### Expected Impact After Full Implementation

- **Quiz session start → first question visible**: ~300ms faster (waterfall elimination + query optimization)
- **Answer tap → feedback render**: Near-instant with optimistic UI (0ms perceived, ~50ms actual)
- **Dashboard initial load**: ~400ms faster (parallel fetching + Suspense streaming + RSC conversion)
- **Bundle size reduction**: ~260KB+ savings (shader gradient removal, icon consolidation, `'use client'` pruning)
- **Supabase egress reduction**: ~40-60% less data transferred (explicit column selects replace `select('*')`)

These improvements directly affect the metrics that matter: quiz completion rate, session return rate, and time-to-value for new users.

---

## Phase 1: The Performance Audit — Top 10 Issues Ranked by User Impact

The following table is ordered by impact on the critical path (quiz session flow first, then dashboard, then secondary pages). Every finding is evidence-based from the audit report.

| Rank | Issue | Location | Estimated Impact | Fix Complexity |
|------|-------|----------|-----------------|----------------|
| **1** | **Quiz session page: 6 sequential awaits** | `src/app/dashboard/testing/session/[sessionId]/page.tsx` | ~300ms wasted latency on every question load — directly breaks flow state | **Quick** — wrap in `Promise.all` |
| **2** | **Testing hub: 8 sequential awaits** | `src/app/dashboard/testing/page.tsx` | ~400ms wasted on the page students visit most frequently | **Quick** — wrap in `Promise.all` |
| **3** | **47 `select('*')` calls across actions/queries** | `src/lib/actions/wiki-actions.ts` (10), `src/lib/actions/trails.ts` (6), `src/lib/queries/trails.ts` (5), 26+ others | Over-fetching full rows when 3-5 columns needed; increases Supabase egress, response size, and parse time | **Medium** — requires reading each query to determine needed columns |
| **4** | **No query abstraction layer (40+ inline Supabase calls)** | 40+ `page.tsx` files with inline queries | Zero query reuse, no caching boundary, changing a table name requires editing 40+ files. Every page re-implements auth + fetch + error handling | **Deep** — 8-12 hours to create `src/lib/queries/` modules |
| **5** | **56% client component ratio (60-70 unnecessary `'use client'`)** | 387/692 `.tsx` files; worst: marketing (10), CEO charts (8), analytics (7), testing debrief (6) | ~60-70 components ship JS to client for display-only rendering; Philippine mobile data users pay the cost | **Medium** — audit each file for hook/event handler usage |
| **6** | **~200KB shader gradient for orphaned component** | `src/components/dashboard/GradientImage.tsx` (dead code) + `@shadergradient/react` | Bundles full Three.js shader pipeline for a decorative gradient that is never imported anywhere | **Quick** — delete file + remove dependency |
| **7** | **Session debrief: 7 sequential awaits** | `src/app/dashboard/testing/session/[sessionId]/debrief/page.tsx` | ~350ms wasted after quiz completion, when student wants immediate results | **Quick** — wrap in `Promise.all` |
| **8** | **Recharts not dynamically imported** | 3 CEO chart files (~90KB) | Loads chart library on all CEO routes even when chart not visible | **Quick** — `next/dynamic` with `ssr: false` |
| **9** | **Dual icon libraries (~60KB combined)** | Lucide (189 files) + Phosphor (135 files) | Two rendering engines, two tree-shaking boundaries; students download both | **Deep** — 4-6 hours to consolidate |
| **10** | **Score reveal: 6 sequential awaits** | `src/app/dashboard/score-reveal/page.tsx` | ~300ms wasted on the page that converts free users to paid — the most revenue-sensitive page in the app | **Quick** — wrap in `Promise.all` |

### Additional Database-Specific Findings

These cannot be fully measured without `pg_stat_statements` or `EXPLAIN ANALYZE` output (the audit is static code analysis only), but the code patterns guarantee these issues exist:

- **Missing indexes**: The DB architect skill documents missing indexes on `questions.topic_id`, `quiz_sessions.user_id`, `user_interactions.user_id`, `user_interactions.question_id`, `wiki_article_taxonomy.node_id`, `spatial_hotspots.model_id`, `spatial_hotspots.node_id`, `readiness_score_snapshots.user_id`, `trail_day_completions.user_id`, `trail_day_completions.day_id`
- **Bare `auth.uid()` in RLS policies**: Suspected on high-traffic tables. On `user_interactions` at scale, bare `auth.uid()` re-evaluates per row vs `(select auth.uid())` which caches per-statement — the difference between 2ms and 2000ms at 100K+ rows
- **`updated_at` triggers missing on 8 tables**: Data staleness risk for any cache invalidation strategy
- **`user_global_stats` God Table**: 20+ columns mixing 5 concerns — every query that touches this table fetches all 20+ columns even if it needs 3

### Data Gaps — Measurements Needed Before Deeper Optimization

The audit is code-level (static analysis). To calibrate Phases 2-4 with precision, these measurements should be collected:

1. **`pg_stat_statements`** output from Supabase dashboard (top 20 by `mean_exec_time`)
2. **`EXPLAIN ANALYZE`** on the quiz session creation query, question fetch query, and interaction save query
3. **`@next/bundle-analyzer`** output (`ANALYZE=true npx next build`) to get per-route JS sizes
4. **Lighthouse** on `/dashboard` and `/dashboard/testing/session/[sessionId]`
5. **Supabase RLS policy audit**: run `SELECT * FROM pg_policies WHERE tablename IN ('user_interactions', 'quiz_sessions', 'user_node_mastery', 'questions')` to confirm `auth.uid()` wrapping

The roadmap below proceeds with high-confidence fixes that are guaranteed wins regardless of measurement, while flagging where measurement would sharpen the approach.

---

## Phase 2: Database Velocity — Supabase + PostgreSQL Optimization

### 2a. Index Plan — Quick Wins (Deploy in 5 Minutes)

**Migration file: `20260326_add_missing_performance_indexes.sql`**

```sql
-- =============================================================
-- MIGRATION: Add missing indexes for critical query paths
-- Date: 2026-03-26
-- Impact: Quiz engine, content lookups, analytics, trails
-- Risk: Low (additive, no schema change)
-- =============================================================

-- Quiz engine (highest traffic tables)
CREATE INDEX IF NOT EXISTS idx_questions_topic_id
  ON public.questions(topic_id);

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id
  ON public.quiz_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id
  ON public.user_interactions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_interactions_question_id
  ON public.user_interactions(question_id);

-- Composite index for common quiz session access pattern
-- (fetching a user's sessions filtered by status)
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id_status
  ON public.quiz_sessions(user_id, status);

-- Composite index for user interactions by session
-- (loading all interactions for a specific session)
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id_session
  ON public.user_interactions(user_id, session_id);

-- Content lookups
CREATE INDEX IF NOT EXISTS idx_wiki_article_taxonomy_node_id
  ON public.wiki_article_taxonomy(node_id);

CREATE INDEX IF NOT EXISTS idx_spatial_hotspots_model_id
  ON public.spatial_hotspots(model_id);

CREATE INDEX IF NOT EXISTS idx_spatial_hotspots_node_id
  ON public.spatial_hotspots(node_id);

-- Analytics (readiness trajectory chart)
CREATE INDEX IF NOT EXISTS idx_readiness_snapshots_user_id
  ON public.readiness_score_snapshots(user_id);

CREATE INDEX IF NOT EXISTS idx_readiness_snapshots_user_id_created
  ON public.readiness_score_snapshots(user_id, created_at DESC);

-- Trail completions
CREATE INDEX IF NOT EXISTS idx_trail_day_completions_user_id
  ON public.trail_day_completions(user_id);

CREATE INDEX IF NOT EXISTS idx_trail_day_completions_day_id
  ON public.trail_day_completions(day_id);

-- Mastery engine (the core analytical table)
CREATE INDEX IF NOT EXISTS idx_user_node_mastery_user_id
  ON public.user_node_mastery(user_id);

CREATE INDEX IF NOT EXISTS idx_user_node_mastery_user_id_node
  ON public.user_node_mastery(user_id, node_id);
```

### 2b. Query Rewrites — Replace `select('*')` with Explicit Columns

**Priority order (by traffic and critical path position):**

**Tier 1 — Critical Path (quiz session flow):**

All quiz session, interaction, and mastery queries must specify exact columns. The pattern to apply:

```typescript
// BEFORE (current pattern across 47 calls)
const { data } = await supabase
  .from('quiz_sessions')
  .select('*')
  .eq('user_id', userId)

// AFTER (explicit columns — only what the component renders)
const { data } = await supabase
  .from('quiz_sessions')
  .select('id, user_id, mode, status, question_count, score_percent, subject_name, topic_name, started_at, completed_at')
  .eq('user_id', userId)
```

**Files to fix (ranked by call count):**

| File | `select('*')` Count | Priority |
|------|---------------------|----------|
| `src/lib/actions/wiki-actions.ts` | 10 | High — wiki is second most-used feature |
| `src/lib/actions/trails.ts` | 6 | High — Camp Trail is daily-use feature |
| `src/lib/queries/trails.ts` | 5 | High — same domain |
| Remaining 26+ files | 1-3 each | Medium — fix during query layer migration |

**Tier 2 — Dashboard widgets:**

Each dashboard query should select only the columns the component renders. For `user_global_stats` (the 20+ column God Table), this is critical — most widgets need 3-5 columns from a 20+ column table.

**Tier 3 — Admin/CEO (lower traffic but still wasteful):**

Fix during the query abstraction layer migration.

### 2c. RLS Policy Corrections

**Audit required**: Run this query in Supabase SQL editor to identify bare `auth.uid()` policies:

```sql
SELECT schemaname, tablename, policyname, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
  AND tablename IN (
    'user_interactions', 'quiz_sessions', 'user_node_mastery',
    'user_global_stats', 'readiness_score_snapshots', 'notes',
    'user_trail_enrollments', 'user_trail_progress'
  );
```

**For every policy returned, apply this correction pattern:**

```sql
-- BEFORE (bare auth.uid() — re-evaluates per row)
CREATE POLICY "Users can select own interactions"
  ON public.user_interactions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- AFTER (subselect — cached per statement)
DROP POLICY IF EXISTS "Users can select own interactions" ON public.user_interactions;
CREATE POLICY "Users can select own interactions"
  ON public.user_interactions FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);
```

**Migration file: `20260326_fix_rls_auth_uid_caching.sql`**

Generate this migration after running the audit query above. The template for each policy:

```sql
-- Fix RLS on {table}: wrap auth.uid() in subselect for per-statement caching
-- Impact: On user_interactions at 100K+ rows, reduces per-query auth check
-- from O(n) function calls to O(1)

DROP POLICY IF EXISTS "{policy_name}" ON public.{table};
CREATE POLICY "{policy_name}"
  ON public.{table} FOR {SELECT|INSERT|UPDATE} TO authenticated
  USING ((select auth.uid()) = user_id);
```

### 2d. Mastery Engine — Trigger Path Analysis

**Current architecture**: `user_interactions` INSERT → synchronous trigger → `user_node_mastery` EMA update → caller gets response.

**Recommendation**: Keep synchronous for now. Here's why:

1. The EMA update is a single-row upsert on `user_node_mastery` — this should be <5ms with the index in place.
2. Async would add complexity (pg_cron, Edge Function, eventual consistency) without proportional benefit at current scale.
3. The student needs to see their mastery change *immediately* after answering — async would break this feedback loop.

**When to revisit**: If `pg_stat_statements` shows the trigger exceeding 50ms, or when `user_interactions` exceeds 500K rows, evaluate converting to an async queue with `pg_notify` + Edge Function listener.

**Readiness Score computation**: This is the stronger candidate for optimization. If the Readiness Score is recomputed on every dashboard load from raw `user_node_mastery` rows, this should be moved to a materialized view or precomputed column:

```sql
-- Option A: Materialized view (refresh on demand or via pg_cron)
CREATE MATERIALIZED VIEW mv_user_readiness AS
SELECT
  user_id,
  -- Readiness Score computation (6-vector anti-inflation formula)
  -- Exact SQL depends on reading src/lib/readiness-score.ts
  computed_score,
  refreshed_at
FROM user_node_mastery
GROUP BY user_id;

CREATE UNIQUE INDEX idx_mv_user_readiness_user_id
  ON mv_user_readiness(user_id);

-- Refresh after quiz session completion (call from Server Action)
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_readiness;
```

**Measurement needed**: Profile the actual Readiness Score computation. If it runs in <100ms from indexed `user_node_mastery`, a materialized view is premature. If it exceeds 200ms, it's necessary.

### 2e. `updated_at` Trigger Fixes

**Migration file: `20260326_add_missing_updated_at_triggers.sql`**

```sql
-- Ensure the trigger function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add to all tables missing the trigger
-- (Run SELECT tgname FROM pg_trigger WHERE tgrelid = '{table}'::regclass
--  to verify which tables are missing before applying)

-- Template for each table:
CREATE TRIGGER tr_{table}_updated_at
  BEFORE UPDATE ON public.{table}
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Phase 3: Frontend Architecture — Next.js Rendering Optimization

### 3a. Client Boundary Audit — Components to Convert

**60-70 files have `'use client'` without client-side justification.** The audit identifies these categories:

| Category | Est. Files | Conversion Strategy |
|----------|-----------|-------------------|
| Marketing/landing components | ~10 | Direct conversion — these are display-only, no hooks/events |
| CEO chart wrappers | ~8 | Split: Server parent fetches data, tiny Client child wraps Recharts |
| Analytics chart wrappers | ~7 | Same split pattern as CEO charts |
| Testing debrief display | ~6 | Direct conversion for summary displays; keep Client for interactive elements |
| Portal shell components | ~3 | Direct conversion — layout shells don't need client JS |
| Remaining (~30-40) | ~30-40 | Audit individually — check for hidden useState/useEffect |

**The conversion pattern for chart components:**

```tsx
// BEFORE: Entire component is 'use client' including data fetching wrapper
// File: src/components/ceo/RevenueChart.tsx
'use client'
import { LineChart } from 'recharts'
export function RevenueChart({ data }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <h3>Revenue</h3>
      <p className="text-sm text-muted-foreground">Monthly recurring revenue</p>
      <LineChart data={data} ... />
    </div>
  )
}

// AFTER: Server component renders layout, Client child renders only the chart
// File: src/components/ceo/RevenueChart.tsx (Server Component — no directive)
import { RevenueChartClient } from './RevenueChartClient'
export function RevenueChart({ data }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <h3>Revenue</h3>
      <p className="text-sm text-muted-foreground">Monthly recurring revenue</p>
      <RevenueChartClient data={data} />
    </div>
  )
}

// File: src/components/ceo/RevenueChartClient.tsx
'use client'
import { LineChart } from 'recharts'
export function RevenueChartClient({ data }) {
  return <LineChart data={data} ... />
}
```

**Bundle impact estimate**: Each unnecessary `'use client'` component ships its full module to the browser. Removing 60-70 directives conservatively saves **30-50KB of JS** depending on component size and import tree.

### 3b. Suspense Streaming Plan

**Dashboard Page** (`/dashboard`)

```
┌─────────────────────────────────────────────────┐
│ Layout (Server) — renders immediately            │
│ ┌─────────────────────────────────────────────┐ │
│ │ Suspense #1: Readiness Score                 │ │
│ │ Skeleton: Score circle + number placeholder  │ │
│ │ Data: user_global_stats.global_readiness_score│ │
│ │ Priority: FIRST (most important number)      │ │
│ └─────────────────────────────────────────────┘ │
│ ┌───────────────────┐ ┌───────────────────────┐ │
│ │ Suspense #2:       │ │ Suspense #3:           │ │
│ │ Taxonomy Heatmap   │ │ Recent Activity        │ │
│ │ Skeleton: Grid of  │ │ Skeleton: 5 line items │ │
│ │ grey squares       │ │ Data: quiz_sessions    │ │
│ │ Data: user_node_   │ │ .order(completed_at)   │ │
│ │ mastery (all nodes)│ │ .limit(10)             │ │
│ └───────────────────┘ └───────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ Suspense #4: Mastery Trajectory Chart        │ │
│ │ Skeleton: Empty chart axes                   │ │
│ │ Data: readiness_score_snapshots (30 days)    │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

The analytics page already implements this pattern with 8 boundaries — use it as the reference implementation.

**Quiz Session Page** (`/dashboard/testing/session/[sessionId]`)

```
┌─────────────────────────────────────────────────┐
│ Layout (Server) — auth guard + session lookup     │
│ ┌─────────────────────────────────────────────┐ │
│ │ Immediate: Question stem + answer options     │ │
│ │ (Server-rendered from session data)           │ │
│ │ Data: questions WHERE id IN session.question_ │ │
│ │ ids[current_index]                            │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ Lazy/Prefetched: Next 2 questions             │ │
│ │ (Fetched in background while student reads)   │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ Suspense: AI Tutor Drawer (if opened)         │ │
│ │ Skeleton: Loading text animation              │ │
│ │ Data: Anthropic API call (on-demand only)     │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**Wiki Article Page** (`/dashboard/wiki/[slug]`)

```
┌─────────────────────────────────────────────────┐
│ Suspense #1: Article content (MDX rendered)       │
│ Skeleton: Text block placeholders                 │
│ Data: wiki_articles WHERE slug = [slug]           │
│ Priority: FIRST                                   │
├─────────────────────────────────────────────────┤
│ Suspense #2: Interactive widgets (lazy-loaded)    │
│ Already implemented via widget registry — CLEAN   │
├─────────────────────────────────────────────────┤
│ Suspense #3: Sidebar (related articles)           │
│ Skeleton: 5 link placeholders                     │
│ Data: wiki_article_taxonomy JOIN for related      │
└─────────────────────────────────────────────────┘
```

### 3c. Route-Level Optimization

**Static Generation Candidates:**

| Route Pattern | Strategy | Reason |
|--------------|----------|--------|
| `/wiki/[slug]` | `generateStaticParams` + ISR (`revalidate: 3600`) | Wiki articles change infrequently; statically generate all published articles, revalidate hourly |
| `/about`, `/contact` | Static (no revalidation needed) | Pure marketing pages |
| `/pricing`, `/upgrade` (marketing) | ISR (`revalidate: 86400`) | Pricing changes rarely |
| `/dashboard/*` | Dynamic (no caching) | User-specific data, always fresh |
| `/admin/*` | Dynamic | Admin content changes frequently |

**Dynamic Import Targets:**

```typescript
// 3D Lab — already properly lazy-loaded (CLEAN per audit)
// No changes needed

// Recharts — NOT dynamically imported (audit finding)
// File: CEO chart components (3 files)
import dynamic from 'next/dynamic'
const RevenueChart = dynamic(
  () => import('@/components/ceo/RevenueChartClient'),
  { ssr: false, loading: () => <ChartSkeleton /> }
)

// TipTap — already mitigated via NotesShell dynamic import (CLEAN per audit)
// No changes needed

// @shadergradient/react — DELETE entirely (orphaned component)
// File to delete: src/components/dashboard/GradientImage.tsx
// Package to remove: @shadergradient/react
```

### 3d. Bundle Reduction — Immediate Actions

| Action | Savings | Effort |
|--------|---------|--------|
| Delete `GradientImage.tsx` + remove `@shadergradient/react` | ~200KB | 5 min |
| Remove 8 unused packages (`camera-controls`, `katex`, `pdf-parse`, `react-markdown`, `rehype-katex`, `remark-math`, `shadcn-ui`, `three-stdlib`) | ~50-100KB (tree-shaking dependent) | 10 min |
| Dynamic import Recharts in CEO charts | ~90KB (deferred, not eliminated) | 30 min |
| Consolidate to single icon library (Phosphor) | ~30KB | 4-6 hours |
| Remove 60-70 unnecessary `'use client'` | ~30-50KB | 4-6 hours |
| Move `@types/dompurify`, `@types/papaparse`, `supabase` CLI to devDependencies | Negligible runtime, cleaner deps | 5 min |

**Total estimated savings: ~260-450KB** (exact numbers require bundle analyzer)

---

## Phase 4: Perceived Speed — The Psychology Layer

### 4a. Optimistic UI Specifications

**Quiz Answer Selection** (highest impact — happens 20-100 times per session)

| Aspect | Specification |
|--------|--------------|
| Optimistic behavior | On tap: immediately highlight selected answer, show confidence animation (border glow), advance progress bar |
| Actual behavior | Server Action writes to `user_interactions`, trigger updates `user_node_mastery` |
| State management | Zustand `useSessionStore` — `setAnswer(questionId, answerId)` already exists |
| Rollback on failure | Show toast "Answer not saved — tap to retry", revert highlight, keep answer in Zustand for retry |
| Latency budget | 0ms perceived (optimistic), <200ms actual write |

```typescript
// Pattern for optimistic answer selection
// In the quiz renderer's answer handler:
const handleAnswerSelect = async (questionId: string, answerId: string) => {
  // 1. Optimistic: update Zustand immediately
  useSessionStore.getState().setAnswer(questionId, answerId)

  // 2. Actual: write to server in background
  const result = await saveTestingInteraction({
    sessionId, questionId, answerId, /* ... */
  })

  // 3. Rollback on failure
  if (result.error) {
    toast.error('Answer not saved — tap to retry')
    // Don't revert Zustand — let user retry from current state
  }
}
```

**Note Save** (frequent during wiki reading)

| Aspect | Specification |
|--------|--------------|
| Optimistic behavior | Show "Saved" status immediately, update note in local list |
| Actual behavior | Server Action upserts to `notes` table |
| State management | Local `useState` or `useOptimistic` in NotesEditor |
| Rollback on failure | Show "Save failed — retrying..." and auto-retry once |

**Session Start** (critical — the moment of commitment)

| Aspect | Specification |
|--------|--------------|
| Optimistic behavior | Navigate to session page immediately, show first question from prefetched data while session record is created |
| Actual behavior | Server Action creates `quiz_sessions` row, fetches question IDs |
| Gap mitigation | Prefetch question pool during Testing Hub page load (see 4b) |

### 4b. Prefetching Strategy

**Quiz Questions — Prefetch Next 2-3 While Student Reads Current**

```typescript
// In the quiz session component, after rendering current question:
useEffect(() => {
  const nextIndexes = [currentIndex + 1, currentIndex + 2, currentIndex + 3]
    .filter(i => i < session.questionIds.length)

  // Prefetch via router or manual fetch
  nextIndexes.forEach(i => {
    const qId = session.questionIds[i]
    if (!questionCache.has(qId)) {
      prefetchQuestion(qId).then(q => questionCache.set(qId, q))
    }
  })
}, [currentIndex])
```

**Dashboard → Testing Hub (most likely next route)**

```tsx
// In Dashboard layout or sidebar
import Link from 'next/link'

// Next.js App Router prefetches <Link> by default when visible in viewport
// Ensure Testing Hub link is in the sidebar (it is) — prefetching is automatic
<Link href="/dashboard/testing" prefetch={true}>
  Testing Hub
</Link>
```

**Testing Hub → Session Start (prefetch question pool)**

When the student lands on the Testing Hub and selects a mode/topic, prefetch the question pool before they tap "Start Session":

```typescript
// When mode + topic are selected but before session starts:
const prefetchQuestions = async (topicId: string, mode: string) => {
  // Fetch candidate question IDs only (lightweight)
  const { data } = await supabase
    .from('questions')
    .select('id, difficulty_b')  // Just IDs and difficulty for IRT selection
    .eq('topic_id', topicId)
    .limit(50)

  questionPoolCache.set(`${topicId}:${mode}`, data)
}
```

**Wiki Sidebar — Prefetch Related Articles**

Already partially handled by Next.js `<Link>` prefetching. Ensure sidebar links use `<Link>` (not `<a>`) for automatic prefetching.

### 4c. Loading State Hierarchy

The audit shows 83% loading.tsx coverage (87/105 pages) with 494 Skeleton usages. The gap:

**Missing Loading States (18 pages without `loading.tsx`):**

Audit and add `loading.tsx` to all 18 remaining pages. Priority order:

1. Any page in the quiz session flow
2. Any page in the dashboard
3. Admin/CEO pages (lower traffic)

**Progressive Disclosure Pattern for Dashboard:**

```
T+0ms:    Shell renders (sidebar, header) — cached layout
T+0ms:    Readiness Score skeleton appears
T+50ms:   Readiness Score NUMBER renders (just the number, no chart)
T+100ms:  Heatmap skeleton fills with colored squares (streaming)
T+150ms:  Activity feed skeleton fills with session items (streaming)
T+300ms:  Trajectory chart renders last (least urgent, most data-heavy)
```

**Stale-While-Revalidate Candidates:**

| Data | Stale Duration | Rationale |
|------|---------------|-----------|
| Taxonomy Heatmap | Show cached version instantly, refresh in background | Mastery changes slowly (per session, not per second) |
| Readiness Score | Show last-known score, refresh after page hydrates | The number changes at most once per quiz session |
| Wiki article content | Cache for 1 hour (ISR) | Articles change infrequently |
| Question social proof ("423 students answered this") | Cache for 5 minutes | Approximate is fine, exact count doesn't matter |

### 4d. Micro-Interactions That Signal Speed

**Answer Button Press Feedback:**

```tsx
// Use pointerdown (not click) for 0ms perceived response
<button
  onPointerDown={() => setPressed(true)}
  onPointerUp={() => {
    setPressed(false)
    handleAnswerSelect(questionId, answerId)
  }}
  className={cn(
    'transition-transform duration-75',
    pressed && 'scale-[0.98] opacity-90'
  )}
>
```

**Score Update Animation:**

```tsx
// Count-up animation for Readiness Score changes
// Use CSS counter or lightweight animation (not Framer Motion for this)
function AnimatedScore({ value }: { value: number }) {
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const start = display
    const diff = value - start
    const duration = 600 // ms
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setDisplay(Math.round(start + diff * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [value])

  return <span className="font-mono tabular-nums">{display}</span>
}
```

**Page Transition Indicator:**

```tsx
// Use Next.js App Router's built-in loading states
// The existing loading.tsx coverage (83%) handles this
// For the remaining 18 pages: add loading.tsx with appropriate skeletons

// For client-side navigations, add a top progress bar:
// Install: npx shadcn-ui add progress (or use nprogress)
// Place in root layout — shows thin bar at top during route transitions
```

---

## Phase 5: The Master Roadmap — Sprint Plan

### Sprint 1: Quick Wins (1-2 days)

These require no architectural changes. Each is a targeted fix deployable independently.

| # | Task | File(s) | Effort | Impact |
|---|------|---------|--------|--------|
| 1.1 | Delete `GradientImage.tsx` + remove `@shadergradient/react` | `src/components/dashboard/GradientImage.tsx`, `package.json` | 5 min | ~200KB bundle reduction |
| 1.2 | Remove 8 unused packages | `package.json` | 10 min | Cleaner deps, minor bundle savings |
| 1.3 | Move misplaced deps to devDependencies | `package.json` | 5 min | Cleaner production deps |
| 1.4 | Deploy missing indexes migration | New migration file | 15 min | Query performance on all critical tables |
| 1.5 | Fix waterfall: quiz session page (6 awaits → `Promise.all`) | `src/app/dashboard/testing/session/[sessionId]/page.tsx` | 20 min | ~300ms faster session load |
| 1.6 | Fix waterfall: testing hub (8 awaits → `Promise.all`) | `src/app/dashboard/testing/page.tsx` | 20 min | ~400ms faster hub load |
| 1.7 | Fix waterfall: session debrief (7 awaits → `Promise.all`) | `src/app/dashboard/testing/session/[sessionId]/debrief/page.tsx` | 20 min | ~350ms faster debrief |
| 1.8 | Fix waterfall: score reveal (6 awaits → `Promise.all`) | `src/app/dashboard/score-reveal/page.tsx` | 15 min | ~300ms faster — revenue-critical page |
| 1.9 | Fix waterfall: simulation results (6 awaits → `Promise.all`) | `src/app/dashboard/testing/simulation/[sessionId]/results/page.tsx` | 15 min | ~300ms faster results |
| 1.10 | Fix waterfall: onboarding (10 awaits → `Promise.all`) | `src/app/(auth)/onboarding/page.tsx` | 20 min | ~500ms faster onboarding |
| 1.11 | Fix remaining 12 waterfall pages (3 awaits each) | 12 page files | 1 hour | ~150ms each |
| 1.12 | Dynamic import Recharts in CEO charts | 3 CEO chart components | 30 min | ~90KB deferred |
| 1.13 | Set up `@next/bundle-analyzer` + capture baseline | `next.config.ts`, `package.json` | 15 min | Measurement baseline for all future work |

**Sprint 1 total: ~4-6 hours**
**Expected impact: ~300-500ms faster on critical path, ~290KB+ bundle reduction**

### Sprint 2: Database Velocity (3-5 days)

| # | Task | File(s) | Effort | Impact |
|---|------|---------|--------|--------|
| 2.1 | Audit RLS policies for bare `auth.uid()` | Supabase SQL editor | 30 min | Identifies policies to fix |
| 2.2 | Deploy RLS `auth.uid()` → `(select auth.uid())` migration | New migration file | 1 hour | Prevents O(n) auth check on high-traffic tables |
| 2.3 | Replace `select('*')` in quiz/testing actions (critical path) | `src/lib/actions/testing.ts`, related files | 2 hours | Reduced response size on every question |
| 2.4 | Replace `select('*')` in wiki actions (10 calls) | `src/lib/actions/wiki-actions.ts` | 1 hour | Reduced egress on wiki browsing |
| 2.5 | Replace `select('*')` in trails actions (11 calls) | `src/lib/actions/trails.ts`, `src/lib/queries/trails.ts` | 1 hour | Reduced egress on Camp Trail |
| 2.6 | Replace remaining `select('*')` calls (20+) | Multiple action files | 2-3 hours | Complete overfetching elimination |
| 2.7 | Build query abstraction layer — testing domain | New `src/lib/queries/testing.ts` | 2 hours | Centralized, cacheable, reusable |
| 2.8 | Build query abstraction layer — dashboard domain | New `src/lib/queries/dashboard.ts` | 2 hours | Same benefits |
| 2.9 | Build query abstraction layer — remaining domains | New `src/lib/queries/{wiki,trails,assessment,analytics,admin,ceo}.ts` | 4-6 hours | Complete query centralization |
| 2.10 | Deploy `updated_at` trigger migration (8 tables) | New migration file | 30 min | Prerequisite for cache invalidation |
| 2.11 | Profile Readiness Score computation (measure before optimizing) | Supabase SQL editor + application profiling | 1 hour | Determines if materialized view is needed |

**Sprint 2 total: ~16-20 hours (3-4 days)**
**Expected impact: 40-60% Supabase egress reduction, sub-50ms query latency on critical path**

### Sprint 3: Frontend Architecture (3-5 days)

| # | Task | File(s) | Effort | Impact |
|---|------|---------|--------|--------|
| 3.1 | Remove `'use client'` from marketing/landing components (~10) | 10 component files | 1 hour | ~5-10KB JS savings |
| 3.2 | Split CEO chart components (Server parent + Client chart child) | 8 chart components → 16 files | 2 hours | Chart JS only loads when chart renders |
| 3.3 | Split analytics chart components | 7 chart components → 14 files | 2 hours | Same pattern |
| 3.4 | Remove `'use client'` from testing debrief displays (~6) | 6 component files | 1 hour | Debrief renders server-side |
| 3.5 | Remove `'use client'` from portal shells (~3) | 3 component files | 30 min | Layout renders server-side |
| 3.6 | Audit and convert remaining ~30-40 unnecessary client components | 30-40 component files | 3-4 hours | Complete client ratio reduction |
| 3.7 | Add Suspense boundaries to dashboard page (4 boundaries per plan) | `src/app/dashboard/page.tsx` + skeleton components | 2 hours | Streaming dashboard load |
| 3.8 | Add `generateStaticParams` + ISR to wiki article routes | `src/app/dashboard/wiki/[slug]/page.tsx` | 1 hour | Static wiki pages, instant loads |
| 3.9 | Add `loading.tsx` to remaining 18 pages | 18 new files | 2 hours | 100% skeleton coverage |
| 3.10 | Audit barrel files for Server/Client mixing | All `index.ts` files in `src/components/` | 1 hour | Prevent accidental client bundling |

**Sprint 3 total: ~16-20 hours (3-4 days)**
**Expected impact: Client ratio from 56% to <40%, 30-50KB JS reduction**

### Sprint 4: Perceived Speed (2-3 days)

| # | Task | File(s) | Effort | Impact |
|---|------|---------|--------|--------|
| 4.1 | Implement optimistic answer selection in quiz renderer | `src/components/dashboard/QuizRenderer.tsx` + Zustand store | 2 hours | 0ms perceived answer response |
| 4.2 | Add `pointerdown` press feedback to answer buttons | Quiz answer button component | 30 min | Instant tactile feedback |
| 4.3 | Implement question prefetching (next 2-3 questions) | Quiz session component | 2 hours | Near-instant question transitions |
| 4.4 | Add animated score count-up for Readiness Score | Readiness Score display component | 1 hour | Smooth, satisfying score updates |
| 4.5 | Implement optimistic note save | Notes editor component | 1 hour | Instant "saved" feedback |
| 4.6 | Add stale-while-revalidate for Taxonomy Heatmap | Dashboard Heatmap component | 1 hour | Instant Heatmap on return visits |
| 4.7 | Ensure all sidebar links use `<Link>` for auto-prefetch | Sidebar component | 30 min | Automatic route prefetching |
| 4.8 | Prefetch question pool on Testing Hub mode selection | Testing Hub component | 1 hour | Faster session start |

**Sprint 4 total: ~9-12 hours (2 days)**
**Expected impact: Quiz interaction feels instant; dashboard shows data within 50ms on return visits**

---

## Verification Protocol

Run these after each sprint to measure improvement.

### After Sprint 1 (Quick Wins)

```bash
# Bundle analysis — compare to baseline from task 1.13
ANALYZE=true npx next build

# Confirm no waterfall pages remain
grep -r "await.*\n.*await" src/app/ --include="page.tsx" -l
# Should return 0 files (or only files with genuinely sequential dependencies)

# Verify no select('*') on critical path
grep -r "select('\*')" src/lib/actions/testing.ts src/lib/actions/quiz.ts
# Should return 0
```

### After Sprint 2 (Database)

```sql
-- Verify indexes exist
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('questions', 'quiz_sessions', 'user_interactions',
                     'user_node_mastery', 'readiness_score_snapshots')
ORDER BY tablename;

-- Verify RLS policies use (select auth.uid())
SELECT policyname, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('user_interactions', 'quiz_sessions', 'user_node_mastery')
  AND qual LIKE '%auth.uid()%'
  AND qual NOT LIKE '%(select auth.uid())%';
-- Should return 0 rows

-- Check P95 query latency
SELECT query, calls, mean_exec_time, max_exec_time,
       percentile_cont(0.95) WITHIN GROUP (ORDER BY mean_exec_time) as p95
FROM pg_stat_statements
WHERE query LIKE '%user_interactions%' OR query LIKE '%quiz_sessions%'
ORDER BY mean_exec_time DESC
LIMIT 20;
```

### After Sprint 3 (Frontend)

```bash
# Client component ratio
find src -name "*.tsx" | wc -l  # total
grep -rl "'use client'" src --include="*.tsx" | wc -l  # client
# Target: client / total < 0.40

# Bundle size per route (from analyzer output)
# Compare critical routes: /dashboard, /dashboard/testing/session/[id]

# Verify no select('*') anywhere
grep -r "select('\*')" src/ --include="*.ts" --include="*.tsx"
# Should return 0
```

### After Sprint 4 (Perceived Speed)

```bash
# Lighthouse on critical routes
npx lighthouse http://localhost:3000/dashboard --output json --output-path dashboard.json
npx lighthouse http://localhost:3000/dashboard/testing --output json --output-path testing.json

# Key metrics to compare:
# - First Contentful Paint (FCP)
# - Largest Contentful Paint (LCP)
# - Time to Interactive (TTI)
# - Total Blocking Time (TBT)
# - Cumulative Layout Shift (CLS) — should be near 0 with proper skeletons
```

### Ongoing User Metrics (Post-Implementation)

These are the metrics that prove the optimization worked for students, not just for Lighthouse:

| Metric | How to Measure | Expected Change |
|--------|---------------|-----------------|
| Quiz completion rate | % of started sessions that reach completion | +5-10% (fewer rage-quits from lag) |
| Session return rate | % of users who start a second session within 24h | +3-5% (faster = more satisfying = return) |
| Average session duration | Time from session start to completion | Slight decrease (faster = shorter, but that's good) |
| Time-to-first-question | Measured from "Start" tap to question visible | Target: <500ms |
| Dashboard load time | FCP on /dashboard for authenticated users | Target: <1s |

---

## Summary: Total Estimated Effort

| Sprint | Effort | Impact |
|--------|--------|--------|
| Sprint 1: Quick Wins | 4-6 hours | ~300-500ms critical path, ~290KB bundle |
| Sprint 2: Database Velocity | 16-20 hours | Sub-50ms queries, 40-60% less egress |
| Sprint 3: Frontend Architecture | 16-20 hours | <40% client ratio, 30-50KB JS savings |
| Sprint 4: Perceived Speed | 9-12 hours | 0ms perceived quiz response |
| **Total** | **45-58 hours (~2 weeks solo dev)** | **Transformative UX improvement** |

This aligns with the audit's recommendation of a 2-week hardening sprint before adding new features. Performance optimization and the audit's other Tier 2 recommendations (query layer, TypeScript strict, error handling) can be interleaved across the same period.
