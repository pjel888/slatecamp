-- ═══════════════════════════════════════════════════════════════
-- Migration 021: Sprint 2 — Study Streak + Engagement Columns
-- ═══════════════════════════════════════════════════════════════
-- UX Strategy Section 9: Study Streak (Trail Streak)
-- "Consecutive Camp Trail days completed. One Grace Day per week
--  (free), additional grace days Pro."
-- ═══════════════════════════════════════════════════════════════

-- ── Study Streak columns on user_trail_enrollments ───────────
ALTER TABLE public.user_trail_enrollments
  ADD COLUMN IF NOT EXISTS current_streak       INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak        INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS grace_days_used_this_week INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_streak_date      DATE;

-- ── Streak tracking on user_global_stats (cross-trail) ──────
ALTER TABLE public.user_global_stats
  ADD COLUMN IF NOT EXISTS global_current_streak  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS global_longest_streak   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_study_date         DATE;

-- ── Session Discovery: store generated insights per session ──
ALTER TABLE public.quiz_sessions
  ADD COLUMN IF NOT EXISTS session_discovery JSONB;

-- ── Heatmap Delta: snapshot mastery at session start ─────────
-- Allows before/after comparison per node after a session
ALTER TABLE public.quiz_sessions
  ADD COLUMN IF NOT EXISTS mastery_snapshot_at_start JSONB;

COMMENT ON COLUMN public.user_trail_enrollments.current_streak IS 'Consecutive days with at least one completed Camp Trail step';
COMMENT ON COLUMN public.user_trail_enrollments.longest_streak IS 'Highest streak achieved on this trail enrollment';
COMMENT ON COLUMN public.user_trail_enrollments.grace_days_used_this_week IS 'Grace days consumed this ISO week (resets Monday)';
COMMENT ON COLUMN public.user_trail_enrollments.last_streak_date IS 'Date of last streak-qualifying activity';
COMMENT ON COLUMN public.user_global_stats.global_current_streak IS 'Cross-trail consecutive study days';
COMMENT ON COLUMN public.user_global_stats.global_longest_streak IS 'All-time longest study streak';
COMMENT ON COLUMN public.user_global_stats.last_study_date IS 'Date of last completed study activity';
COMMENT ON COLUMN public.quiz_sessions.session_discovery IS 'Post-session insight JSON: { type, message, data }';
COMMENT ON COLUMN public.quiz_sessions.mastery_snapshot_at_start IS 'Node mastery weights at session start for delta calculation';
