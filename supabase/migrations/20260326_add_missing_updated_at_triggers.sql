-- =============================================================
-- MIGRATION: Add missing updated_at triggers
-- Date: 2026-03-26
-- Source: Performance Implementation Roadmap §3b
-- Impact: Ensures updated_at is always set on modification for
--         all user-data tables that were missing the trigger.
-- Risk: Low (additive, no schema change)
-- =============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- quiz_sessions
-- ============================================================
DROP TRIGGER IF EXISTS set_updated_at_quiz_sessions ON public.quiz_sessions;
CREATE TRIGGER set_updated_at_quiz_sessions
  BEFORE UPDATE ON public.quiz_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- user_interactions
-- ============================================================
DROP TRIGGER IF EXISTS set_updated_at_user_interactions ON public.user_interactions;
CREATE TRIGGER set_updated_at_user_interactions
  BEFORE UPDATE ON public.user_interactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- user_node_mastery
-- ============================================================
DROP TRIGGER IF EXISTS set_updated_at_user_node_mastery ON public.user_node_mastery;
CREATE TRIGGER set_updated_at_user_node_mastery
  BEFORE UPDATE ON public.user_node_mastery
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- user_global_stats
-- ============================================================
DROP TRIGGER IF EXISTS set_updated_at_user_global_stats ON public.user_global_stats;
CREATE TRIGGER set_updated_at_user_global_stats
  BEFORE UPDATE ON public.user_global_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- readiness_score_snapshots
-- ============================================================
DROP TRIGGER IF EXISTS set_updated_at_readiness_score_snapshots ON public.readiness_score_snapshots;
CREATE TRIGGER set_updated_at_readiness_score_snapshots
  BEFORE UPDATE ON public.readiness_score_snapshots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- notes
-- ============================================================
DROP TRIGGER IF EXISTS set_updated_at_notes ON public.notes;
CREATE TRIGGER set_updated_at_notes
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- user_trail_enrollments
-- ============================================================
DROP TRIGGER IF EXISTS set_updated_at_user_trail_enrollments ON public.user_trail_enrollments;
CREATE TRIGGER set_updated_at_user_trail_enrollments
  BEFORE UPDATE ON public.user_trail_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- user_trail_progress
-- ============================================================
DROP TRIGGER IF EXISTS set_updated_at_user_trail_progress ON public.user_trail_progress;
CREATE TRIGGER set_updated_at_user_trail_progress
  BEFORE UPDATE ON public.user_trail_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
