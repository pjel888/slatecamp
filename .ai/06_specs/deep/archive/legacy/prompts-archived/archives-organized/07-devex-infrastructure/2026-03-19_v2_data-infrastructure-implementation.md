# SlateCamp — Data Infrastructure & Analytics Architecture
## Schema, Triggers, Functions, Pipelines. No UI. Pure Backend.

---

## SCOPE

This prompt implements the INFRASTRUCTURE layer from two internal reports:
- **Marketing Analytics Report** — 5-layer analytics stack (Acquisition → Funnel → Retention → Revenue → Exam Outcomes)
- **Data Science × Marketing Correlation Report** — Predictive models, churn scoring, LTV segmentation, outcome collection

**What this prompt IS:** Database tables, columns, triggers, functions, indexes, RLS policies, Server Actions, utility functions, scheduled jobs, and data pipelines.

**What this prompt IS NOT:** Dashboard cards, charts, UI components, visual changes, or frontend layout work. Assume the UI team will consume the infrastructure you build here. Your job is to make the data AVAILABLE, CORRECT, and QUERYABLE.

---

## ROLE

You are a Backend/Data Engineer building the analytics infrastructure for an edtech platform on Supabase (PostgreSQL). You write idempotent migrations, efficient indexes, proper RLS, and clean Server Actions. Every table you create must be queryable for the specific analytics questions identified in the reports. Every trigger must fire reliably without breaking the user-facing quiz flow.

---

## TOOLS

- **Supabase MCP** — ALL schema reads and writes. Query before every change.
- **File System** — Read existing Server Actions, lib utilities, and types before adding new ones.
- **grep/find** — Locate injection points for event tracking and score computation.

---

## PHASE 1: Full Schema Audit (Read-Only)

Run ALL queries in one batch:

```sql
-- 1. All tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- 2. All columns on tables we'll modify
SELECT table_name, column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name IN (
  'user_global_stats', 'user_node_mastery', 'user_interactions',
  'quiz_sessions', 'questions', 'readiness_score_snapshots',
  'user_subscriptions', 'taxonomy_tree'
)
ORDER BY table_name, ordinal_position;

-- 3. All existing triggers
SELECT trigger_name, event_object_table, action_timing, event_manipulation,
  action_statement
FROM information_schema.triggers WHERE trigger_schema = 'public';

-- 4. All existing functions
SELECT routine_name, data_type AS return_type
FROM information_schema.routines WHERE routine_schema = 'public';

-- 5. All existing RLS policies
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;

-- 6. Check which target tables already exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'analytics_events', 'exam_outcomes', 'user_node_mastery_history',
  'blindspot_queues', 'churn_risk_log', 'acquisition_touchpoints'
);

-- 7. Check existing enums
SELECT typname FROM pg_type
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'e';

-- 8. Readiness Score diagnostic — is it computing?
SELECT g.user_id, g.global_readiness_score,
  (SELECT COUNT(*) FROM user_interactions ui WHERE ui.user_id = g.user_id) as interactions,
  (SELECT COUNT(*) FROM readiness_score_snapshots r WHERE r.user_id = g.user_id) as snapshots,
  (SELECT MAX(created_at) FROM readiness_score_snapshots r WHERE r.user_id = g.user_id) as last_snapshot
FROM user_global_stats g
ORDER BY interactions DESC LIMIT 10;

-- 9. readiness_score_snapshots exact schema
SELECT column_name, data_type, column_default
FROM information_schema.columns WHERE table_name = 'readiness_score_snapshots' ORDER BY ordinal_position;

-- 10. quiz_sessions config JSONB sample
SELECT session_id, test_mode, status, config FROM quiz_sessions LIMIT 5;

-- 11. user_subscriptions schema
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_subscriptions' ORDER BY ordinal_position;

-- 12. Taxonomy tree — what subjects exist
SELECT DISTINCT subject_area FROM taxonomy_tree WHERE subject_area IS NOT NULL ORDER BY subject_area;

-- 13. Total taxonomy node count (needed for coverage calculations)
SELECT COUNT(*) as total_nodes, COUNT(*) FILTER (WHERE is_leaf = true) as leaf_nodes FROM taxonomy_tree;
```

Also read:
```bash
# Find readiness score computation logic
grep -rn "readiness\|computeScore\|calculateReadiness\|readiness_score" src/ --include="*.ts" --include="*.tsx" -l

# Find session completion handlers
grep -rn "status.*completed\|completeSession\|submitQuiz\|finishSession" src/ --include="*.ts" --include="*.tsx" | head -15

# Find existing Server Actions
find src/ -name "actions.ts" -o -name "actions.tsx" | sort

# Find Supabase client setup
grep -rn "createClient\|createServerClient\|createBrowserClient" src/lib/ --include="*.ts" | head -5

# Find auth callback / signup handlers
grep -rn "signUp\|auth.*callback\|handleSignUp\|onAuthStateChange" src/ --include="*.ts" --include="*.tsx" | head -10

# Find any existing analytics/tracking utilities
grep -rn "trackEvent\|analytics\|logEvent" src/ --include="*.ts" --include="*.tsx" -l
```

**Output:** Complete map of existing schema, triggers, functions, and the Readiness Score computation status.

**STOP.** "Phase 1 Complete. Schema audited. Reply 'Proceed.'"

---

## PHASE 2: Master Migration

One file. Everything. Fully idempotent.

### File: `supabase/migrations/YYYYMMDDHHMMSS_analytics_infrastructure.sql`

```sql
-- ============================================================
-- SlateCamp Analytics Infrastructure
-- Sources: Marketing Analytics Report (5 layers)
--          Data Science × Marketing Correlation Report
-- All statements idempotent. Safe to run multiple times.
-- ============================================================


-- ─── UTILITY ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;


-- ═══════════════════════════════════════════════════════════════
-- LAYER 1: ACQUISITION ATTRIBUTION
-- Marketing Report: "Zero acquisition attribution fields exist"
-- DS Report: "Multi-touch attribution modeling"
-- ═══════════════════════════════════════════════════════════════

-- Attribution columns on user_global_stats
ALTER TABLE public.user_global_stats
  ADD COLUMN IF NOT EXISTS signup_source TEXT,           -- 'facebook', 'tiktok', 'google', 'organic', 'referral', 'direct'
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,              -- 'paid', 'organic', 'email', 'referral'
  ADD COLUMN IF NOT EXISTS utm_content TEXT,
  ADD COLUMN IF NOT EXISTS referral_code TEXT,
  ADD COLUMN IF NOT EXISTS first_touch_source TEXT,      -- DS Report: first touchpoint in multi-touch journey
  ADD COLUMN IF NOT EXISTS first_touch_campaign TEXT,
  ADD COLUMN IF NOT EXISTS last_touch_source TEXT,       -- DS Report: closing touchpoint
  ADD COLUMN IF NOT EXISTS last_touch_campaign TEXT,
  ADD COLUMN IF NOT EXISTS acquisition_touchpoints JSONB DEFAULT '[]',  -- DS Report: full journey array
  ADD COLUMN IF NOT EXISTS first_session_at TIMESTAMPTZ, -- Marketing Report: activation timestamp
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- LTV segmentation columns (DS Report: 3 customer archetypes)
ALTER TABLE public.user_global_stats
  ADD COLUMN IF NOT EXISTS exam_attempt_number INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS previous_exam_result TEXT,    -- 'passed', 'failed', 'first_attempt'
  ADD COLUMN IF NOT EXISTS customer_archetype TEXT,      -- 'single_batch', 'retaker', 'undergrad'
  ADD COLUMN IF NOT EXISTS churn_risk_score DOUBLE PRECISION DEFAULT 0,  -- DS Report: daily computed
  ADD COLUMN IF NOT EXISTS churn_risk_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS score_velocity_7d DOUBLE PRECISION DEFAULT 0, -- DS Report: pts/day over 7d
  ADD COLUMN IF NOT EXISTS score_velocity_updated_at TIMESTAMPTZ;


-- ═══════════════════════════════════════════════════════════════
-- LAYER 2: FUNNEL ANALYTICS (analytics_events table)
-- Marketing Report: 5 micro-events
-- DS Report: "conversion probability model at each stage"
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  event_properties JSONB DEFAULT '{}',
  page_path TEXT,
  session_id UUID,                    -- FK to quiz_sessions if relevant
  referrer TEXT,                       -- Marketing L1: organic referral source
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ae_name_time ON public.analytics_events(event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ae_user_time ON public.analytics_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ae_user_name ON public.analytics_events(user_id, event_name);

-- DS Report: "time-between-events is the hidden variable"
-- Index to support fast sequential event queries per user
CREATE INDEX IF NOT EXISTS idx_ae_user_time_asc ON public.analytics_events(user_id, created_at ASC);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analytics_events' AND policyname = 'ae_insert_own') THEN
    CREATE POLICY ae_insert_own ON public.analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analytics_events' AND policyname = 'ae_select_own') THEN
    CREATE POLICY ae_select_own ON public.analytics_events FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;


-- ═══════════════════════════════════════════════════════════════
-- LAYER 3: RETENTION — Mastery History + Score Velocity
-- DS Report: "Topic Decay Rate (Forgetting Curve)"
-- DS Report: "No time-series on user_node_mastery"
-- ═══════════════════════════════════════════════════════════════

-- Mastery history table (append-only time series per node)
CREATE TABLE IF NOT EXISTS public.user_node_mastery_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL,
  mastery_weight DOUBLE PRECISION NOT NULL,
  total_correct INTEGER NOT NULL DEFAULT 0,
  total_attempts INTEGER NOT NULL DEFAULT 0,
  snapshot_reason TEXT DEFAULT 'session_complete'
    CHECK (snapshot_reason IN ('session_complete', 'daily_decay', 'blindspot_queue', 'manual')),
  session_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mh_user_topic_time ON public.user_node_mastery_history(user_id, topic_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mh_user_time ON public.user_node_mastery_history(user_id, created_at DESC);

ALTER TABLE public.user_node_mastery_history ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_node_mastery_history' AND policyname = 'mh_select_own') THEN
    CREATE POLICY mh_select_own ON public.user_node_mastery_history FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- Add updated_at to user_node_mastery if missing
ALTER TABLE public.user_node_mastery ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS user_node_mastery_updated_at ON public.user_node_mastery;
CREATE TRIGGER user_node_mastery_updated_at
  BEFORE UPDATE ON public.user_node_mastery
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: auto-log mastery changes to history
CREATE OR REPLACE FUNCTION public.log_mastery_history()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.current_mastery_weight IS DISTINCT FROM NEW.current_mastery_weight THEN
    INSERT INTO public.user_node_mastery_history
      (user_id, topic_id, mastery_weight, total_correct, total_attempts, snapshot_reason)
    VALUES
      (NEW.user_id, NEW.topic_id, NEW.current_mastery_weight, NEW.total_correct, NEW.total_attempts, 'session_complete');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_mastery_history ON public.user_node_mastery;
CREATE TRIGGER trg_log_mastery_history
  AFTER UPDATE ON public.user_node_mastery
  FOR EACH ROW EXECUTE FUNCTION public.log_mastery_history();


-- ═══════════════════════════════════════════════════════════════
-- LAYER 3 (cont): Readiness Score Auto-Snapshot
-- DS Report: "readiness_score_snapshots must write on every session"
-- ═══════════════════════════════════════════════════════════════

-- ADAPT: The INSERT columns below MUST match the actual
-- readiness_score_snapshots schema found in Phase 1, query #9.
-- Replace 'score' with the actual column name.

CREATE OR REPLACE FUNCTION public.snapshot_readiness_on_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO public.readiness_score_snapshots (user_id, score)  -- ADAPT column names
    SELECT NEW.user_id, g.global_readiness_score
    FROM public.user_global_stats g
    WHERE g.user_id = NEW.user_id
      AND g.global_readiness_score IS NOT NULL
      AND g.global_readiness_score > 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_snapshot_readiness ON public.quiz_sessions;
CREATE TRIGGER trg_snapshot_readiness
  AFTER UPDATE ON public.quiz_sessions
  FOR EACH ROW EXECUTE FUNCTION public.snapshot_readiness_on_complete();


-- ═══════════════════════════════════════════════════════════════
-- LAYER 4: REVENUE — Subscription analytics support
-- DS Report: "user_subscriptions is disconnected from behavioral data"
-- ═══════════════════════════════════════════════════════════════

-- No new tables needed — user_subscriptions already has tier + status.
-- Add a conversion timestamp for time-to-convert analysis.
ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS converted_from_source TEXT,   -- acquisition source at conversion time
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS readiness_score_at_conversion DOUBLE PRECISION;


-- ═══════════════════════════════════════════════════════════════
-- LAYER 5: EXAM OUTCOMES (The Asset)
-- Marketing Report: "The pass rate is the most powerful marketing asset"
-- DS Report: "Logistic regression on outcome data"
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.exam_outcomes (
  outcome_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  discipline_id UUID,
  exam_batch TEXT NOT NULL,                              -- 'ALE-JUN-2026', 'ALE-NOV-2026'
  result TEXT NOT NULL CHECK (result IN ('passed', 'failed', 'did_not_take')),
  self_reported_score NUMERIC,

  -- Pre-populated snapshots at survey time (for correlation model)
  peak_readiness_score DOUBLE PRECISION,                 -- MAX(score) from readiness_score_snapshots
  readiness_score_at_7d_before DOUBLE PRECISION,         -- DS Report: score 7 days before exam
  avg_session_accuracy DOUBLE PRECISION,                 -- AVG accuracy across all sessions
  total_sessions_completed INTEGER,
  total_questions_answered INTEGER,
  days_active INTEGER,                                   -- DISTINCT dates with completed sessions

  -- Acquisition correlation (Marketing L1 → L5 loop)
  signup_source TEXT,                                    -- copied from user_global_stats at survey time
  customer_archetype TEXT,                               -- copied from user_global_stats

  -- Meta
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  verified BOOLEAN DEFAULT false,                        -- admin-verified against PRC results
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eo_batch_result ON public.exam_outcomes(exam_batch, result);
CREATE INDEX IF NOT EXISTS idx_eo_user ON public.exam_outcomes(user_id);
CREATE INDEX IF NOT EXISTS idx_eo_score_result ON public.exam_outcomes(peak_readiness_score, result);

ALTER TABLE public.exam_outcomes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'exam_outcomes' AND policyname = 'eo_insert_own') THEN
    CREATE POLICY eo_insert_own ON public.exam_outcomes FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'exam_outcomes' AND policyname = 'eo_select_own') THEN
    CREATE POLICY eo_select_own ON public.exam_outcomes FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;


-- ═══════════════════════════════════════════════════════════════
-- BLINDSPOT PROTOCOL INFRASTRUCTURE
-- DS Report Part 3.4: "blindspot_queues table"
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.blindspot_queues (
  queue_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID,                                       -- FK to quiz session that resolves this queue
  node_ids UUID[] NOT NULL,                              -- weakest 3 taxonomy nodes
  question_count INTEGER DEFAULT 12,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  deferred_until TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'deferred', 'in_progress', 'completed', 'expired')),
  -- Post-completion analytics
  pre_queue_mastery JSONB DEFAULT '{}',                  -- {node_id: weight} before queue
  post_queue_mastery JSONB DEFAULT '{}',                 -- {node_id: weight} after queue
  nodes_improved INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_bq_user_status ON public.blindspot_queues(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bq_user_generated ON public.blindspot_queues(user_id, generated_at DESC);

ALTER TABLE public.blindspot_queues ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blindspot_queues' AND policyname = 'bq_select_own') THEN
    CREATE POLICY bq_select_own ON public.blindspot_queues FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blindspot_queues' AND policyname = 'bq_insert_own') THEN
    CREATE POLICY bq_insert_own ON public.blindspot_queues FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blindspot_queues' AND policyname = 'bq_update_own') THEN
    CREATE POLICY bq_update_own ON public.blindspot_queues FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;


-- ═══════════════════════════════════════════════════════════════
-- DATA SCIENCE INTEGRATION COLUMNS
-- DS Report: Metacognitive calibration, Error taxonomy
-- ═══════════════════════════════════════════════════════════════

-- Metacognitive calibration (pre-session confidence per subject)
ALTER TABLE public.quiz_sessions
  ADD COLUMN IF NOT EXISTS pre_session_confidence_ratings JSONB DEFAULT '{}';
  -- Shape: {"LAWS": 2, "STRUCT": 3, "UTIL": 1} — 1=not confident, 2=somewhat, 3=confident

-- Error taxonomy (post-wrong-answer self-report)
ALTER TABLE public.user_interactions
  ADD COLUMN IF NOT EXISTS error_type TEXT;
  -- Values: 'knowledge_gap' | 'misread' | 'distractor' | 'code_version' | 'time_pressure' | null

-- Assessment quiz support
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS is_assessment BOOLEAN DEFAULT false;

ALTER TABLE public.user_global_stats
  ADD COLUMN IF NOT EXISTS assessment_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS assessment_score DOUBLE PRECISION;
```

**CRITICAL before running:** ADAPT every `-- ADAPT` comment based on Phase 1 findings. Especially the `readiness_score_snapshots` INSERT — column names must match exactly.

**STOP.** "Phase 2 Complete. Migration executed. Reply 'Proceed.'"

---

## PHASE 3: Readiness Score Computation Fix

The DS report identifies this as P0: "Readiness Score is 0 on an account with 66 questions answered."

Based on Phase 1 diagnostic query #8, determine which scenario applies:

### Scenario A: No computation function exists → Build it

Create: `src/lib/readiness/compute.ts`

```typescript
interface MasteryNode {
  topic_id: string
  current_mastery_weight: number
  total_attempts: number
  avg_time_ms: number
  last_encountered: string | Date
}

interface ReadinessResult {
  score: number          // 0-100
  sub_scores: Record<string, number>  // per subject_area
  coverage: number       // 0-1 (% of taxonomy explored)
  node_count: number
}

export function computeReadinessScore(
  nodes: MasteryNode[],
  totalTaxonomyNodes: number  // from Phase 1 query #13
): ReadinessResult {
  const activeNodes = nodes.filter(n => n.total_attempts > 0)

  if (activeNodes.length === 0) {
    return { score: 0, sub_scores: {}, coverage: 0, node_count: 0 }
  }

  let weightedSum = 0
  let totalWeight = 0

  for (const node of activeNodes) {
    // Attempt confidence: more attempts = more reliable signal
    const attemptWeight = Math.min(node.total_attempts / 10, 1)

    // Recency: EMA-style decay with ~30-day half-life
    const lastSeen = new Date(node.last_encountered)
    const daysSince = (Date.now() - lastSeen.getTime()) / (1000 * 60 * 60 * 24)
    const recencyWeight = Math.exp(-0.023 * daysSince)

    const weight = attemptWeight * recencyWeight
    weightedSum += node.current_mastery_weight * weight
    totalWeight += weight
  }

  const rawScore = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0

  // Coverage penalty: partial exploration = partial score
  const coverage = activeNodes.length / totalTaxonomyNodes
  const coverageFactor = 0.3 + (0.7 * Math.min(coverage, 1))

  return {
    score: Math.round(Math.max(0, Math.min(100, rawScore * coverageFactor))),
    sub_scores: {},  // TODO: compute per subject_area grouping
    coverage,
    node_count: activeNodes.length
  }
}
```

### Scenario B: Function exists but trigger doesn't fire → Wire it

Find the session completion handler and add the score recomputation call:

```typescript
// INSIDE the existing session completion Server Action:

// 1. Fetch mastery data
const { data: masteryNodes } = await supabase
  .from('user_node_mastery')
  .select('topic_id, current_mastery_weight, total_attempts, avg_time_ms, last_encountered')
  .eq('user_id', userId)

// 2. Get total taxonomy nodes
const { count: totalNodes } = await supabase
  .from('taxonomy_tree')
  .select('*', { count: 'exact', head: true })

// 3. Compute
const result = computeReadinessScore(masteryNodes || [], totalNodes || 50)

// 4. Write to user_global_stats
await supabase
  .from('user_global_stats')
  .update({
    global_readiness_score: result.score,
    updated_at: new Date().toISOString()
  })
  .eq('user_id', userId)

// 5. The trigger trg_snapshot_readiness will auto-snapshot on session complete
```

### Scenario C: Function and trigger exist but have a bug → Fix the specific bug

Read the function. Trace the data. Fix. Test.

**Verify after fix:**
```sql
SELECT user_id, global_readiness_score
FROM user_global_stats
WHERE user_id IN (
  SELECT DISTINCT user_id FROM user_interactions
)
ORDER BY global_readiness_score DESC;
```

Every user with interactions should have score > 0.

**STOP.** "Phase 3 Complete. Readiness Score computes correctly. Reply 'Proceed.'"

---

## PHASE 4: Analytics Event Utility + Funnel Instrumentation

### 4a. Create `src/lib/analytics.ts`

```bash
# Find the Supabase client import path first
grep -rn "createClient\|createBrowserClient" src/lib/ --include="*.ts" | head -3
```

```typescript
// src/lib/analytics.ts
import { createClient } from '@/lib/supabase/client'  // ADAPT

type TrackParams = {
  event_name: string
  event_properties?: Record<string, unknown>
  page_path?: string
  session_id?: string
  referrer?: string
}

/**
 * Fire-and-forget analytics event.
 * NEVER throws. NEVER blocks UI. NEVER breaks the app.
 */
export async function trackEvent(params: TrackParams): Promise<void> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_name: params.event_name,
      event_properties: params.event_properties || {},
      page_path: params.page_path || (typeof window !== 'undefined' ? window.location.pathname : null),
      session_id: params.session_id || null,
      referrer: params.referrer || (typeof document !== 'undefined' ? document.referrer : null),
    })
  } catch {
    // Silent. Analytics never breaks the product.
  }
}
```

### 4b. Create Server-Side variant for Server Actions

```typescript
// src/lib/analytics-server.ts
import { createClient } from '@/lib/supabase/server'  // ADAPT

export async function trackServerEvent(
  userId: string,
  event_name: string,
  event_properties: Record<string, unknown> = {},
  session_id?: string
): Promise<void> {
  try {
    const supabase = await createClient()  // ADAPT: may or may not be async
    await supabase.from('analytics_events').insert({
      user_id: userId,
      event_name,
      event_properties,
      session_id: session_id || null,
    })
  } catch {
    // Silent
  }
}
```

### 4c. Wire the Events

Locate each injection point with grep results from Phase 1. Add ONE LINE at each.

**The event dictionary (from both reports combined):**

| Event | Trigger Point | Properties |
|---|---|---|
| `signup_completed` | Auth callback / post-signup | `{ source, utm_campaign, utm_medium, referrer }` |
| `diagnostic_started` | Assessment quiz session created | `{}` |
| `diagnostic_completed` | Assessment quiz submitted | `{ score, duration_ms }` |
| `score_revealed` | Score reveal page rendered | `{ score }` |
| `quiz_session_started` | Any quiz session created | `{ test_mode, question_count }` |
| `quiz_session_completed` | Any quiz session finished | `{ test_mode, score, accuracy, duration_ms }` |
| `quiz_session_abandoned` | Session status → abandoned | `{ test_mode, pct_complete }` |
| `readiness_score_viewed` | Analytics page loaded | `{ current_score }` |
| `upgrade_page_viewed` | Pricing/upgrade page loaded | `{ current_score, days_to_exam }` |
| `pro_subscribed` | Subscription created/activated | `{ plan, price, source }` |
| `wiki_article_read` | Wiki article page loaded | `{ article_id, topic_id }` |
| `heatmap_viewed` | Taxonomy heatmap opened | `{ score_at_view }` |
| `trail_enrolled` | Camp Trail enrollment | `{ trail_id, trail_type }` |
| `trail_day_completed` | Trail day marked complete | `{ trail_id, day_number }` |

### 4d. UTM Capture at Signup

Find the signup handler. Before or after account creation:

```typescript
// Client-side: capture UTMs and store for attribution
export function captureUtmParams(): Record<string, string | null> {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  return {
    signup_source: params.get('utm_source') || params.get('source') || 'direct',
    utm_campaign: params.get('utm_campaign') || null,
    utm_medium: params.get('utm_medium') || null,
    utm_content: params.get('utm_content') || null,
    referral_code: params.get('ref') || null,
    first_touch_source: params.get('utm_source') || params.get('source') || 'direct',
    first_touch_campaign: params.get('utm_campaign') || null,
    last_touch_source: params.get('utm_source') || params.get('source') || 'direct',
    last_touch_campaign: params.get('utm_campaign') || null,
  }
}

// In signup handler, AFTER user is created:
const attribution = captureUtmParams()
await supabase
  .from('user_global_stats')
  .update(attribution)
  .eq('user_id', newUser.id)
```

### 4e. First Session Tracking

In the session creation handler:

```typescript
// After creating the quiz session, check if this is user's first-ever session
const { data: stats } = await supabase
  .from('user_global_stats')
  .select('first_session_at')
  .eq('user_id', userId)
  .single()

if (stats && !stats.first_session_at) {
  await supabase
    .from('user_global_stats')
    .update({ first_session_at: new Date().toISOString() })
    .eq('user_id', userId)
}
```

**STOP.** "Phase 4 Complete. Analytics infrastructure wired. Reply 'Proceed.'"

---

## PHASE 5: Score Velocity + Churn Risk Functions

These are the DS Report's highest-ROI investment: server-side functions that compute derived metrics.

### 5a. Score Velocity Computation

Create: `src/lib/readiness/velocity.ts`

```typescript
/**
 * Compute 7-day Readiness Score velocity (points per day).
 * DS Report velocity states:
 *   > +0.8 pts/day  = Accelerating
 *   +0.2 to +0.8    = Steady
 *   -0.2 to +0.2    = Plateaued
 *   < -0.2          = Declining
 */
export function computeScoreVelocity(
  snapshots: { score: number; created_at: string }[]
): { velocity: number; state: 'accelerating' | 'steady' | 'plateaued' | 'declining' } {
  if (snapshots.length < 2) return { velocity: 0, state: 'plateaued' }

  const sorted = [...snapshots].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const latest = sorted[0]
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const baseline = sorted.find(s => new Date(s.created_at) <= sevenDaysAgo) || sorted[sorted.length - 1]

  const daysDelta = (new Date(latest.created_at).getTime() - new Date(baseline.created_at).getTime()) / (1000 * 60 * 60 * 24)
  if (daysDelta === 0) return { velocity: 0, state: 'plateaued' }

  const velocity = (latest.score - baseline.score) / daysDelta

  const state = velocity > 0.8 ? 'accelerating'
    : velocity > 0.2 ? 'steady'
    : velocity > -0.2 ? 'plateaued'
    : 'declining'

  return { velocity: Math.round(velocity * 100) / 100, state }
}
```

### 5b. Churn Risk Computation

```typescript
/**
 * DS Report triple-condition churn risk:
 * 1. Score velocity ≤ 0 for 10+ consecutive days
 * 2. Last session > 5 days ago
 * 3. Exam date > 45 days away
 */
export function computeChurnRisk(params: {
  scoreVelocity: number
  lastSessionAt: Date | null
  targetExamDate: Date | null
  velocityNegativeSinceDays: number  // how many consecutive days velocity ≤ 0
}): { risk: number; isHighRisk: boolean } {
  const { scoreVelocity, lastSessionAt, targetExamDate, velocityNegativeSinceDays } = params

  let riskFactors = 0

  // Condition 1: velocity stalled 10+ days
  if (velocityNegativeSinceDays >= 10) riskFactors++

  // Condition 2: last session > 5 days ago
  if (lastSessionAt) {
    const daysSinceSession = (Date.now() - lastSessionAt.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceSession > 5) riskFactors++
  } else {
    riskFactors++ // never had a session
  }

  // Condition 3: exam > 45 days away (low urgency)
  if (targetExamDate) {
    const daysToExam = (targetExamDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    if (daysToExam > 45) riskFactors++
  } else {
    riskFactors++ // no exam date set (low commitment)
  }

  const risk = riskFactors / 3  // 0, 0.33, 0.67, or 1.0
  return { risk, isHighRisk: riskFactors === 3 }
}
```

### 5c. Wire Into Session Completion

In the same Server Action that computes the Readiness Score (Phase 3), add:

```typescript
// After score computation...

// Compute velocity
const { data: recentSnapshots } = await supabase
  .from('readiness_score_snapshots')
  .select('score, created_at')  // ADAPT column names
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(30)

const velocity = computeScoreVelocity(recentSnapshots || [])

// Update velocity on user_global_stats
await supabase
  .from('user_global_stats')
  .update({
    score_velocity_7d: velocity.velocity,
    score_velocity_updated_at: new Date().toISOString()
  })
  .eq('user_id', userId)
```

Churn risk can be computed as a daily batch job or per-session — per-session is simpler for now.

**STOP.** "Phase 5 Complete. Velocity + churn risk functions built. Reply 'Proceed.'"

---

## PHASE 6: Exam Outcome Pre-Population Function

The DS Report says: "Pre-populate exam_outcomes with snapshots BEFORE the survey goes out." Build the function that does this.

Create: `src/lib/outcomes/prepopulate.ts`

```typescript
/**
 * Pre-populate exam_outcomes rows for all active users before an ALE batch.
 * Called manually (or via cron) 1 day before PRC results release.
 * Users then just confirm pass/fail — all analytics data is already there.
 */
export async function prepopulateExamOutcomes(
  supabase: SupabaseClient,  // ADAPT type
  examBatch: string,          // 'ALE-JUN-2026'
  disciplineId: string,
  examDate: Date
): Promise<{ created: number; errors: string[] }> {
  const errors: string[] = []
  let created = 0

  // Find all users active in 90 days before exam
  const ninetyDaysBefore = new Date(examDate.getTime() - 90 * 24 * 60 * 60 * 1000)

  const { data: activeUsers } = await supabase
    .from('quiz_sessions')
    .select('user_id')
    .gte('started_at', ninetyDaysBefore.toISOString())
    .eq('status', 'completed')

  const uniqueUserIds = [...new Set(activeUsers?.map(u => u.user_id) || [])]

  for (const userId of uniqueUserIds) {
    try {
      // Get peak readiness score
      const { data: peakSnapshot } = await supabase
        .from('readiness_score_snapshots')
        .select('score')  // ADAPT column name
        .eq('user_id', userId)
        .order('score', { ascending: false })  // ADAPT column name
        .limit(1)
        .single()

      // Get score 7 days before exam
      const sevenBefore = new Date(examDate.getTime() - 7 * 24 * 60 * 60 * 1000)
      const { data: weekBeforeSnapshot } = await supabase
        .from('readiness_score_snapshots')
        .select('score')  // ADAPT column name
        .eq('user_id', userId)
        .lte('created_at', sevenBefore.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // Get usage stats
      const { count: totalSessions } = await supabase
        .from('quiz_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed')

      const { count: totalQuestions } = await supabase
        .from('user_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      const { data: activeDaysData } = await supabase
        .rpc('count_active_days', { p_user_id: userId })  // or compute differently

      // Get attribution
      const { data: stats } = await supabase
        .from('user_global_stats')
        .select('signup_source, customer_archetype')
        .eq('user_id', userId)
        .single()

      // Insert pre-populated outcome (result = 'did_not_take' as placeholder)
      await supabase.from('exam_outcomes').upsert({
        user_id: userId,
        discipline_id: disciplineId,
        exam_batch: examBatch,
        result: 'did_not_take',  // placeholder until user confirms
        peak_readiness_score: peakSnapshot?.score || null,
        readiness_score_at_7d_before: weekBeforeSnapshot?.score || null,
        total_sessions_completed: totalSessions || 0,
        total_questions_answered: totalQuestions || 0,
        days_active: activeDaysData || 0,
        signup_source: stats?.signup_source || null,
        customer_archetype: stats?.customer_archetype || null,
      }, { onConflict: 'user_id,exam_batch' })  // ADAPT: may need unique constraint

      created++
    } catch (e) {
      errors.push(`User ${userId}: ${e}`)
    }
  }

  return { created, errors }
}
```

**NOTE:** This function may need a unique constraint on `(user_id, exam_batch)` for the upsert. Add it to the migration if it doesn't exist:

```sql
-- Add to migration if not already present:
ALTER TABLE public.exam_outcomes
  ADD CONSTRAINT IF NOT EXISTS exam_outcomes_user_batch_unique
  UNIQUE (user_id, exam_batch);
```

**STOP.** "Phase 6 Complete. Outcome pre-population function built. Reply 'Proceed.'"

---

## PHASE 7: Verification + DATABASE_SCHEMA.sql Update

### Schema verification:
```sql
-- All new tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('analytics_events', 'user_node_mastery_history', 'exam_outcomes', 'blindspot_queues');

-- All new columns on user_global_stats
SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_global_stats'
AND column_name IN (
  'signup_source', 'utm_campaign', 'utm_medium', 'first_touch_source',
  'last_touch_source', 'acquisition_touchpoints', 'first_session_at',
  'exam_attempt_number', 'customer_archetype', 'churn_risk_score',
  'score_velocity_7d', 'assessment_completed_at', 'assessment_score'
);

-- All new columns on other tables
SELECT table_name, column_name FROM information_schema.columns
WHERE (table_name = 'user_interactions' AND column_name = 'error_type')
   OR (table_name = 'quiz_sessions' AND column_name = 'pre_session_confidence_ratings')
   OR (table_name = 'questions' AND column_name = 'is_assessment')
   OR (table_name = 'user_subscriptions' AND column_name IN ('converted_from_source', 'readiness_score_at_conversion'))
   OR (table_name = 'user_node_mastery' AND column_name = 'updated_at');

-- All triggers
SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_schema = 'public';

-- RLS on all new tables
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('analytics_events', 'user_node_mastery_history', 'exam_outcomes', 'blindspot_queues');

-- Readiness Score is non-zero for users with data
SELECT user_id, global_readiness_score FROM user_global_stats
WHERE user_id IN (SELECT DISTINCT user_id FROM user_interactions)
AND global_readiness_score > 0;
```

### Code verification:
```bash
# TypeScript compiles
npx tsc --noEmit

# Check analytics utility exists
cat src/lib/analytics.ts
cat src/lib/analytics-server.ts

# Check readiness computation exists
find src/lib -name "*readiness*" -o -name "*compute*" | head -5

# Check velocity/churn functions exist
find src/lib -name "*velocity*" -o -name "*churn*" | head -5
```

### App verification:
- [ ] Dashboard loads without errors
- [ ] Starting a quiz session works
- [ ] Completing a quiz session triggers score recomputation
- [ ] Score is > 0 for users with quiz history
- [ ] New snapshot written to readiness_score_snapshots on session complete
- [ ] New mastery history row written on mastery change
- [ ] No console errors

### Then: Update DATABASE_SCHEMA.sql

Run the DATABASE_SCHEMA.sql sync prompt (separate prompt, already provided) to query the live schema and regenerate the documentation file. This MUST happen after the migration to capture all new tables, columns, triggers, and policies.

**STOP.** "Phase 7 Complete. All analytics infrastructure shipped."

---

## WHAT THIS PROMPT DOES NOT BUILD (Intentionally Deferred)

| Item | Why Deferred | Dependency |
|---|---|---|
| Churn risk email automation | Needs email provider (Resend/Postmark) integration | Phase 5 functions are ready |
| Post-exam survey email send | Needs email provider + PRC date trigger | Phase 6 function is ready |
| Score-gap paywall copy personalization | UI work, not infrastructure | Score computation ready |
| Readiness threshold logistic regression | Needs real exam outcome data (June 2026) | `exam_outcomes` table ready |
| Session cadence "golden hour" analysis | Compute job, not migration | Data in `quiz_sessions.started_at` |
| Cohort retention reports | Reporting/analytics view, not infrastructure | `analytics_events` table ready |
| B2B pipeline metrics | External tool (Notion/CRM), not Supabase | `organizations` table exists |

Every deferred item has its DATA INFRASTRUCTURE built by this prompt. The tables, columns, triggers, and functions exist. What remains is UI surfaces and external integrations — separate concerns, separate prompts.

---

## WHAT NOT TO DO

- **Don't build UI components.** This prompt is infrastructure only.
- **Don't change existing quiz flow behavior.** You're adding instrumentation alongside it.
- **Don't block on analytics.** `trackEvent()` and `trackServerEvent()` ALWAYS fail silently.
- **Don't drop or modify existing data.** All changes are additive.
- **Don't skip the Phase 1 audit.** The ADAPT comments exist because column names VARY. Query first, code second.
- **Don't hardcode taxonomy node counts or subject names.** Query them.
- **Don't create tables that already exist.** Every CREATE TABLE uses IF NOT EXISTS.
- **Don't forget RLS.** Every new table must have RLS enabled.

---

*Execute Phase 1 now. Query the full schema and diagnose the Readiness Score bug.*
