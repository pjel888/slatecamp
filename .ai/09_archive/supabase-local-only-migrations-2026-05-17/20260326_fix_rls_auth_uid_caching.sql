-- =============================================================
-- MIGRATION: Fix auth.uid() caching in RLS policies
-- Date: 2026-03-26
-- Source: Performance Implementation Roadmap §3a
-- Impact: Prevents auth.uid() from re-evaluating per-row; wraps
--         all bare auth.uid() calls in (select auth.uid()) for
--         per-statement caching. Applies to all user-scoped tables.
-- Risk: Low (policy replacement, same semantics)
-- =============================================================

-- ============================================================
-- 1. user_interactions
-- ============================================================
DROP POLICY IF EXISTS "user_interactions_select" ON public.user_interactions;
CREATE POLICY "user_interactions_select"
  ON public.user_interactions FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_interactions_insert" ON public.user_interactions;
CREATE POLICY "user_interactions_insert"
  ON public.user_interactions FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_interactions_update" ON public.user_interactions;
CREATE POLICY "user_interactions_update"
  ON public.user_interactions FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- 2. quiz_sessions
-- ============================================================
DROP POLICY IF EXISTS "quiz_sessions_select" ON public.quiz_sessions;
CREATE POLICY "quiz_sessions_select"
  ON public.quiz_sessions FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "quiz_sessions_insert" ON public.quiz_sessions;
CREATE POLICY "quiz_sessions_insert"
  ON public.quiz_sessions FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "quiz_sessions_update" ON public.quiz_sessions;
CREATE POLICY "quiz_sessions_update"
  ON public.quiz_sessions FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- 3. user_node_mastery
-- ============================================================
DROP POLICY IF EXISTS "user_node_mastery_select" ON public.user_node_mastery;
CREATE POLICY "user_node_mastery_select"
  ON public.user_node_mastery FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_node_mastery_insert" ON public.user_node_mastery;
CREATE POLICY "user_node_mastery_insert"
  ON public.user_node_mastery FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_node_mastery_update" ON public.user_node_mastery;
CREATE POLICY "user_node_mastery_update"
  ON public.user_node_mastery FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- 4. user_global_stats
-- ============================================================
DROP POLICY IF EXISTS "user_global_stats_select" ON public.user_global_stats;
CREATE POLICY "user_global_stats_select"
  ON public.user_global_stats FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_global_stats_insert" ON public.user_global_stats;
CREATE POLICY "user_global_stats_insert"
  ON public.user_global_stats FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_global_stats_update" ON public.user_global_stats;
CREATE POLICY "user_global_stats_update"
  ON public.user_global_stats FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- 5. readiness_score_snapshots
-- ============================================================
DROP POLICY IF EXISTS "readiness_score_snapshots_select" ON public.readiness_score_snapshots;
CREATE POLICY "readiness_score_snapshots_select"
  ON public.readiness_score_snapshots FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "readiness_score_snapshots_insert" ON public.readiness_score_snapshots;
CREATE POLICY "readiness_score_snapshots_insert"
  ON public.readiness_score_snapshots FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "readiness_score_snapshots_update" ON public.readiness_score_snapshots;
CREATE POLICY "readiness_score_snapshots_update"
  ON public.readiness_score_snapshots FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- 6. notes
-- ============================================================
DROP POLICY IF EXISTS "notes_select" ON public.notes;
CREATE POLICY "notes_select"
  ON public.notes FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "notes_insert" ON public.notes;
CREATE POLICY "notes_insert"
  ON public.notes FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "notes_update" ON public.notes;
CREATE POLICY "notes_update"
  ON public.notes FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- 7. user_trail_enrollments
-- ============================================================
DROP POLICY IF EXISTS "user_trail_enrollments_select" ON public.user_trail_enrollments;
CREATE POLICY "user_trail_enrollments_select"
  ON public.user_trail_enrollments FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_trail_enrollments_insert" ON public.user_trail_enrollments;
CREATE POLICY "user_trail_enrollments_insert"
  ON public.user_trail_enrollments FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_trail_enrollments_update" ON public.user_trail_enrollments;
CREATE POLICY "user_trail_enrollments_update"
  ON public.user_trail_enrollments FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- 8. user_trail_progress
-- ============================================================
DROP POLICY IF EXISTS "user_trail_progress_select" ON public.user_trail_progress;
CREATE POLICY "user_trail_progress_select"
  ON public.user_trail_progress FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_trail_progress_insert" ON public.user_trail_progress;
CREATE POLICY "user_trail_progress_insert"
  ON public.user_trail_progress FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_trail_progress_update" ON public.user_trail_progress;
CREATE POLICY "user_trail_progress_update"
  ON public.user_trail_progress FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id);
