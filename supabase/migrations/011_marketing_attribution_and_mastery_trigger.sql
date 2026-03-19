-- ============================================================
-- Marketing Attribution + Mastery History Auto-Log
-- Applied: 2026-03-19
-- Safe to run multiple times (all statements are idempotent)
-- ============================================================

-- 1. MARKETING ATTRIBUTION on user_global_stats
ALTER TABLE public.user_global_stats
  ADD COLUMN IF NOT EXISTS signup_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_content TEXT,
  ADD COLUMN IF NOT EXISTS referral_code TEXT,
  ADD COLUMN IF NOT EXISTS first_session_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- 2. MASTERY HISTORY AUTO-LOG TRIGGER
CREATE OR REPLACE FUNCTION public.log_mastery_history_on_update()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_mastery_history (
    user_id, topic_id, mastery_weight, total_correct, total_attempts, snapshot_reason
  ) VALUES (
    NEW.user_id,
    NEW.topic_id,
    NEW.current_mastery_weight,
    NEW.total_correct,
    NEW.total_attempts,
    'session_complete'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_log_mastery_history ON public.user_node_mastery;
CREATE TRIGGER trg_log_mastery_history
  AFTER UPDATE ON public.user_node_mastery
  FOR EACH ROW EXECUTE FUNCTION public.log_mastery_history_on_update();
