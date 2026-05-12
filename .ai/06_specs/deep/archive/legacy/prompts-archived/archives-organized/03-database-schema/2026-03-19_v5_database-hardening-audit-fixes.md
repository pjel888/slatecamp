# SlateCamp — Database Schema Hardening
## Every Index, Trigger, RLS Fix, and Column Addition from the Schema Audit

---

## SCOPE

This prompt implements EVERY finding from the database schema audit report, organized by severity. It is pure SQL — no frontend code, no UI changes, no Server Actions. One migration file, fully idempotent, safe to run on a live database with real user data.

**Nothing is dropped. Nothing is renamed. Nothing is destructive.** Every statement is additive: CREATE INDEX IF NOT EXISTS, ALTER TABLE ADD COLUMN IF NOT EXISTS, DROP TRIGGER IF EXISTS + CREATE TRIGGER.

---

## ROLE

You are a PostgreSQL Database Administrator working on a Supabase-hosted database. You understand: index selection for RLS-heavy workloads, trigger cascading, the difference between `auth.uid()` and `(select auth.uid())` for performance, and idempotent migration patterns. You NEVER run a statement without first verifying the current state.

---

## PHASE 1: Pre-Flight Verification

Run ALL of these via Supabase MCP in ONE batch. Do not write any SQL until you have the results.

```sql
-- 1. All existing indexes (so we don't create duplicates)
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 2. All existing triggers (so we don't create duplicates)
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 3. All existing RLS policies (so we can fix the broken ones)
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 4. Check which columns already exist on tables we'll modify
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('questions', 'user_interactions')
AND column_name IN ('updated_at', 'question_order')
ORDER BY table_name, column_name;

-- 5. Verify the update_updated_at_column function exists
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'update_updated_at_column';

-- 6. Check analytics_events RLS policies specifically (the known bug)
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'analytics_events';

-- 7. Check if (select auth.uid()) or auth.uid() is used in high-traffic policies
SELECT tablename, policyname, qual, with_check
FROM pg_policies
WHERE tablename IN ('quiz_sessions', 'user_interactions', 'user_node_mastery', 'readiness_score_snapshots')
ORDER BY tablename;

-- 8. Check sub_scores population on readiness_score_snapshots
SELECT
  COUNT(*) as total_snapshots,
  COUNT(*) FILTER (WHERE sub_scores IS NOT NULL AND sub_scores != '{}' AND sub_scores != 'null') as has_sub_scores
FROM readiness_score_snapshots;

-- 9. Check if is_flagged is being set (Lucky Guess Detection)
SELECT
  COUNT(*) as total_interactions,
  COUNT(*) FILTER (WHERE is_flagged = true) as flagged_count
FROM user_interactions;

-- 10. Check quiz_sessions test_mode values (for Proof Simulation distinction)
SELECT DISTINCT test_mode FROM quiz_sessions ORDER BY test_mode;

-- 11. Verify no DELETE policies exist on immutable tables
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('user_interactions', 'user_node_mastery') AND cmd = 'DELETE';
```

**Output:** A checklist showing which fixes are needed vs. already done. Some indexes may already exist. Some triggers may already be in place. The Phase 1 results determine exactly which statements go into the migration.

**STOP.** "Phase 1 Complete. Here's the current state. Reply 'Proceed' to run the migration."

---

## PHASE 2: Master Migration

### File: `supabase/migrations/YYYYMMDDHHMMSS_schema_hardening_audit.sql`

Every statement below is tagged with the audit finding number and severity. SKIP any statement where Phase 1 confirmed it already exists.

```sql
-- ============================================================
-- SlateCamp Schema Hardening — From Database Audit Report
-- All statements idempotent. Safe on live data. Nothing dropped.
-- ============================================================


-- ─── PREREQUISITE: Ensure utility function exists ────────────

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;


-- ═══════════════════════════════════════════════════════════════
-- 🔴 CRITICAL — FIX NOW
-- ═══════════════════════════════════════════════════════════════


-- ── Finding #1: Missing index on questions.topic_id ──────────
-- Impact: Every quiz session generation does a full table scan.
-- At 10,000+ questions this becomes a real performance problem.

CREATE INDEX IF NOT EXISTS idx_questions_topic_id
  ON public.questions(topic_id);


-- ── Finding #2: Missing index on quiz_sessions.user_id ───────
-- Impact: Active session retrieval, session history, Analytics
-- Dashboard, and RLS SELECT policy all scan the entire table.

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id
  ON public.quiz_sessions(user_id);


-- ── Finding #3: Missing index on user_interactions.user_id ───
-- Impact: Highest-write table. RLS checks user_id on every read.
-- The UNIQUE constraint on (user_id, session_id, question_id)
-- is NOT reliably used for single-column user_id filters.

CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id
  ON public.user_interactions(user_id);


-- ── Finding #4: analytics_events RLS blocks anonymous inserts ─
-- Bug: WITH CHECK (auth.uid() = user_id) rejects NULL user_id
-- because auth.uid() = NULL evaluates to NULL, not TRUE.
-- Anonymous events silently fail.

-- ADAPT: Only run this if Phase 1 query #6 confirms the broken policy exists.
-- First drop the broken policy, then create the fixed one.

-- DROP POLICY IF EXISTS "ae_insert_own" ON public.analytics_events;
-- DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;
-- DROP POLICY IF EXISTS "analytics_events_insert_own" ON public.analytics_events;

-- ADAPT: Use the ACTUAL policy name from Phase 1 query #6 results:
-- DROP POLICY IF EXISTS "[actual_policy_name]" ON public.analytics_events;

-- CREATE POLICY ae_insert_fixed ON public.analytics_events
--   FOR INSERT
--   WITH CHECK (
--     (user_id IS NULL) OR ((select auth.uid()) = user_id)
--   );

-- IMPORTANT: Uncomment and run the above ONLY after confirming the
-- exact policy name to drop from Phase 1 results. Getting the name
-- wrong will leave TWO insert policies (the broken one still active).


-- ── Finding #5: updated_at columns with no trigger ───────────
-- 8 tables have updated_at but no trigger to auto-update it.
-- The column currently lies — it always shows the creation time.

DROP TRIGGER IF EXISTS tr_disciplines_updated_at ON public.disciplines;
CREATE TRIGGER tr_disciplines_updated_at
  BEFORE UPDATE ON public.disciplines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS tr_taxonomy_tree_updated_at ON public.taxonomy_tree;
CREATE TRIGGER tr_taxonomy_tree_updated_at
  BEFORE UPDATE ON public.taxonomy_tree
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS tr_wiki_articles_updated_at ON public.wiki_articles;
CREATE TRIGGER tr_wiki_articles_updated_at
  BEFORE UPDATE ON public.wiki_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS tr_user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER tr_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS tr_feature_flags_updated_at ON public.feature_flags;
CREATE TRIGGER tr_feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS tr_camp_trails_updated_at ON public.camp_trails;
CREATE TRIGGER tr_camp_trails_updated_at
  BEFORE UPDATE ON public.camp_trails
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS tr_user_global_stats_updated_at ON public.user_global_stats;
CREATE TRIGGER tr_user_global_stats_updated_at
  BEFORE UPDATE ON public.user_global_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS tr_organizations_updated_at ON public.organizations;
CREATE TRIGGER tr_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ═══════════════════════════════════════════════════════════════
-- 🟡 IMPORTANT — FIX SOON
-- ═══════════════════════════════════════════════════════════════


-- ── Finding #7: questions table has no updated_at column ──────
-- IRT parameters will be recalibrated. model_id will change.
-- No way to know when a question was last touched.

ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DROP TRIGGER IF EXISTS tr_questions_updated_at ON public.questions;
CREATE TRIGGER tr_questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ── Finding #8: Missing secondary indexes on lookup tables ────

-- wiki_article_taxonomy: queries by node_id ("articles for this topic")
-- PK is (article_id, node_id) — node_id-first queries scan the whole table.
CREATE INDEX IF NOT EXISTS idx_wiki_article_taxonomy_node_id
  ON public.wiki_article_taxonomy(node_id);

-- spatial_hotspots: FK columns model_id and node_id have no indexes.
-- 3D Lab hotspot queries will scan the whole table.
CREATE INDEX IF NOT EXISTS idx_spatial_hotspots_model_id
  ON public.spatial_hotspots(model_id);
CREATE INDEX IF NOT EXISTS idx_spatial_hotspots_node_id
  ON public.spatial_hotspots(node_id);

-- user_interactions.question_id: "has this user seen this question before?"
CREATE INDEX IF NOT EXISTS idx_user_interactions_question_id
  ON public.user_interactions(question_id);

-- trail_day_completions: RLS checks user_id, queries by day_id
CREATE INDEX IF NOT EXISTS idx_trail_day_completions_user_id
  ON public.trail_day_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_trail_day_completions_day_id
  ON public.trail_day_completions(day_id);

-- readiness_score_snapshots.user_id: trajectory chart reads all per user
CREATE INDEX IF NOT EXISTS idx_readiness_snapshots_user_id
  ON public.readiness_score_snapshots(user_id);

-- readiness_score_snapshots: chronological reads for trajectory
-- ADAPT: use actual timestamp column name (created_at or computed_at)
CREATE INDEX IF NOT EXISTS idx_readiness_snapshots_user_time
  ON public.readiness_score_snapshots(user_id, created_at DESC);


-- ── Finding #8 (cont): Endurance analysis needs question order ─
-- Two interactions at the same millisecond makes ordering ambiguous.
-- Endurance Cycle accuracy-per-10-item-block needs deterministic order.

ALTER TABLE public.user_interactions
  ADD COLUMN IF NOT EXISTS question_order INTEGER;


-- ═══════════════════════════════════════════════════════════════
-- 🟡 IMPORTANT — RLS PERFORMANCE (Finding #10)
-- ═══════════════════════════════════════════════════════════════

-- The correct RLS pattern uses (select auth.uid()) which caches
-- the value per-statement. Bare auth.uid() is called per-row,
-- which is potentially 100x slower on large tables.
--
-- ADAPT: Phase 1 query #7 shows the current USING clauses.
-- For each high-traffic table, if the policy uses bare auth.uid()
-- instead of (select auth.uid()), recreate it.
--
-- TEMPLATE (uncomment and adapt per table):
--
-- DROP POLICY IF EXISTS "[policy_name]" ON public.quiz_sessions;
-- CREATE POLICY "[policy_name]" ON public.quiz_sessions
--   FOR SELECT USING ((select auth.uid()) = user_id);
--
-- Repeat for: quiz_sessions, user_interactions, user_node_mastery,
-- readiness_score_snapshots, user_global_stats, analytics_events,
-- user_trail_enrollments, user_trail_progress
--
-- CRITICAL: Get the exact policy names from Phase 1 query #7.
-- Each table may have multiple policies (SELECT, INSERT, UPDATE).
-- Recreate ALL of them with (select auth.uid()).


-- ═══════════════════════════════════════════════════════════════
-- 🟠 PLAN — Future-Proofing
-- ═══════════════════════════════════════════════════════════════


-- ── Proof Simulation distinction (Audit: design observation) ──
-- Currently Proof Simulations are indistinguishable from Storm Mode.
-- The readiness score recalibration logic needs to know which is which.

ALTER TABLE public.quiz_sessions
  ADD COLUMN IF NOT EXISTS is_proof_simulation BOOLEAN DEFAULT false;

-- This allows the score engine to query:
-- WHERE is_proof_simulation = true → apply pressure-tested recalibration
-- WHERE is_proof_simulation = false → standard score update


-- ── Document immutable tables (no DELETE policies) ────────────
-- user_interactions and user_node_mastery must NEVER have DELETE policies.
-- Phase 1 query #11 should confirm no DELETE policies exist.
-- If any are found, they must be dropped:
--
-- DROP POLICY IF EXISTS "[delete_policy_name]" ON public.user_interactions;
-- DROP POLICY IF EXISTS "[delete_policy_name]" ON public.user_node_mastery;


-- ═══════════════════════════════════════════════════════════════
-- COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- (Derived from the quiz engine's actual access patterns)
-- ═══════════════════════════════════════════════════════════════

-- Session lookup: "get active sessions for this user"
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_status
  ON public.quiz_sessions(user_id, status);

-- Question selection: "get questions for these topics at this difficulty"
CREATE INDEX IF NOT EXISTS idx_questions_topic_difficulty
  ON public.questions(topic_id, difficulty);

-- Assessment question pool: "get high-discrimination assessment questions"
CREATE INDEX IF NOT EXISTS idx_questions_assessment
  ON public.questions(is_assessment) WHERE is_assessment = true;

-- Mastery lookup: "get all mastery data for this user"
CREATE INDEX IF NOT EXISTS idx_user_node_mastery_user
  ON public.user_node_mastery(user_id);

-- Interaction timeline: "get interactions for this session in order"
CREATE INDEX IF NOT EXISTS idx_user_interactions_session_time
  ON public.user_interactions(session_id, interaction_timestamp);

-- Notes by topic: "get all notes for this taxonomy node"
CREATE INDEX IF NOT EXISTS idx_notes_topic
  ON public.notes(topic_id) WHERE topic_id IS NOT NULL;

-- Trail enrollment lookup: "get active trails for this user"
CREATE INDEX IF NOT EXISTS idx_trail_enrollments_user_status
  ON public.user_trail_enrollments(user_id, status);
```

**STOP.** "Phase 2 Complete. Migration executed. Reply 'Proceed' for RLS performance fix."

---

## PHASE 3: RLS Policy Performance Fix

This phase is SEPARATE because it requires dropping and recreating policies — the most dangerous operation in the migration. Each policy must be handled individually with the EXACT name from Phase 1.

### Process for each high-traffic table:

1. Read the exact policy name and current USING/WITH CHECK clause from Phase 1 query #7
2. Check if it uses bare `auth.uid()` or `(select auth.uid())`
3. If bare: drop + recreate with `(select auth.uid())`
4. If already wrapped: skip

### Tables to check (in order of traffic volume):

```
1. user_interactions    — highest write volume
2. quiz_sessions        — read on every dashboard load + session management
3. user_node_mastery    — read on every analytics view + score computation
4. readiness_score_snapshots — read for trajectory charts
5. user_global_stats    — read on every page load
6. analytics_events     — high write volume
7. user_trail_enrollments — read on dashboard
8. user_trail_progress   — read on trail daily view
9. notes                — read on notes page
```

### Template for each table:

```sql
-- Step 1: Identify current policies (from Phase 1 results)
-- Example for quiz_sessions:
--   Policy: "quiz_sessions_select_own" | SELECT | USING: auth.uid() = user_id
--   Policy: "quiz_sessions_insert_own" | INSERT | WITH CHECK: auth.uid() = user_id

-- Step 2: Drop and recreate with (select auth.uid())
DROP POLICY IF EXISTS "quiz_sessions_select_own" ON public.quiz_sessions;
CREATE POLICY "quiz_sessions_select_own" ON public.quiz_sessions
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "quiz_sessions_insert_own" ON public.quiz_sessions;
CREATE POLICY "quiz_sessions_insert_own" ON public.quiz_sessions
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- Repeat for UPDATE policies if they exist
```

**Do this for EVERY policy on the 9 tables listed above.** The performance difference at scale is massive — `(select auth.uid())` is evaluated ONCE per query, while bare `auth.uid()` is evaluated per ROW. On a table with 100,000 rows, that's 99,999 unnecessary function calls.

**ALSO FIX** the analytics_events INSERT policy (Finding #4) in the same pass:

```sql
DROP POLICY IF EXISTS "[actual_insert_policy_name]" ON public.analytics_events;
CREATE POLICY ae_insert_fixed ON public.analytics_events
  FOR INSERT
  WITH CHECK (
    (user_id IS NULL) OR ((select auth.uid()) = user_id)
  );
```

**STOP.** "Phase 3 Complete. RLS policies optimized. Reply 'Proceed' for verification."

---

## PHASE 4: Verification

### Index verification:
```sql
-- All indexes we created — verify they exist
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname IN (
  'idx_questions_topic_id',
  'idx_quiz_sessions_user_id',
  'idx_user_interactions_user_id',
  'idx_wiki_article_taxonomy_node_id',
  'idx_spatial_hotspots_model_id',
  'idx_spatial_hotspots_node_id',
  'idx_user_interactions_question_id',
  'idx_trail_day_completions_user_id',
  'idx_trail_day_completions_day_id',
  'idx_readiness_snapshots_user_id',
  'idx_readiness_snapshots_user_time',
  'idx_quiz_sessions_user_status',
  'idx_questions_topic_difficulty',
  'idx_questions_assessment',
  'idx_user_node_mastery_user',
  'idx_user_interactions_session_time',
  'idx_notes_topic',
  'idx_trail_enrollments_user_status'
)
ORDER BY tablename, indexname;
```

### Trigger verification:
```sql
-- All triggers we created — verify they exist
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name IN (
  'tr_disciplines_updated_at',
  'tr_taxonomy_tree_updated_at',
  'tr_wiki_articles_updated_at',
  'tr_user_subscriptions_updated_at',
  'tr_feature_flags_updated_at',
  'tr_camp_trails_updated_at',
  'tr_user_global_stats_updated_at',
  'tr_organizations_updated_at',
  'tr_questions_updated_at'
)
ORDER BY event_object_table;
```

### Column verification:
```sql
-- New columns exist
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE (table_name = 'questions' AND column_name = 'updated_at')
   OR (table_name = 'user_interactions' AND column_name = 'question_order')
   OR (table_name = 'quiz_sessions' AND column_name = 'is_proof_simulation')
ORDER BY table_name;
```

### RLS verification:
```sql
-- All policies now use (select auth.uid()) — spot check high-traffic tables
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('quiz_sessions', 'user_interactions', 'user_node_mastery', 'analytics_events')
ORDER BY tablename, policyname;

-- Verify analytics_events allows anonymous inserts
-- The INSERT policy should show: (user_id IS NULL) OR ((select auth.uid()) = user_id)
SELECT with_check FROM pg_policies
WHERE tablename = 'analytics_events' AND cmd = 'INSERT';
```

### Immutability verification:
```sql
-- Confirm no DELETE policies on immutable tables
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('user_interactions', 'user_node_mastery')
AND cmd = 'DELETE';
-- Should return 0 rows
```

### App smoke test:
- [ ] Dashboard loads without errors
- [ ] Starting a quiz works (tests quiz_sessions + questions indexes)
- [ ] Answering a question works (tests user_interactions write + RLS)
- [ ] Analytics page loads (tests readiness_score_snapshots read)
- [ ] Wiki article loads (tests wiki_article_taxonomy index)
- [ ] No console errors on any page
- [ ] No Supabase RLS errors in browser network tab

**STOP.** "Phase 4 Complete. All findings addressed."

---

## PHASE 5: Update DATABASE_SCHEMA.sql

After all changes are verified, run the DATABASE_SCHEMA.sql sync prompt to regenerate the documentation from the live schema. This captures all new indexes, triggers, columns, and policy changes.

---

## AUDIT FINDINGS STATUS AFTER THIS MIGRATION

| # | Finding | Severity | Status |
|---|---|---|---|
| 1 | Missing index `questions.topic_id` | 🔴 Critical | ✅ Fixed |
| 2 | Missing index `quiz_sessions.user_id` | 🔴 Critical | ✅ Fixed |
| 3 | Missing index `user_interactions.user_id` | 🔴 Critical | ✅ Fixed |
| 4 | analytics_events RLS blocks anonymous inserts | 🔴 Critical | ✅ Fixed |
| 5 | 8 tables missing updated_at triggers | 🔴 Critical | ✅ Fixed |
| 6 | Inconsistent PK naming | 🟠 Plan | 📝 Documented — standardize on `id` for new tables |
| 7 | questions table missing updated_at | 🟡 Important | ✅ Fixed |
| 8 | Missing secondary indexes on 6 lookup tables | 🟡 Important | ✅ Fixed |
| 9 | user_global_stats is a God Table | 🟠 Plan | 📝 Documented — split to user_attribution later |
| 10 | RLS auth.uid() not wrapped in subselect | 🟡 Important | ✅ Fixed |
| — | question_order for Endurance analysis | 🟡 Important | ✅ Added |
| — | is_proof_simulation for score recalibration | 🟠 Plan | ✅ Added |
| — | Composite indexes for common query patterns | 🟡 Bonus | ✅ Added |
| — | No DELETE policies on immutable tables | ✅ Verified | ✅ Confirmed |

---

## WHAT NOT TO DO

- **Don't rename any primary keys.** The audit notes inconsistency but recommends against renaming existing PKs. Standardize on `id` for NEW tables only.
- **Don't create a session_questions junction table.** The audit says to defer this to Phase 2 when the question bank reaches 5,000+ items.
- **Don't split user_global_stats.** The audit says it's fine for now. Plan the split for B2B expansion.
- **Don't add DELETE policies to user_interactions or user_node_mastery.** These are immutable tables by design.
- **Don't guess policy names.** Every DROP POLICY must use the EXACT name from Phase 1 query results. A wrong name leaves the broken policy active.
- **Don't skip Phase 1.** Some of these indexes and triggers may already exist from previous migrations. Creating a duplicate index wastes disk space. IF NOT EXISTS handles this for indexes but NOT for policies.

---

*Execute Phase 1 now. Query every existing index, trigger, and policy before touching anything.*
