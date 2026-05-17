-- ============================================================
-- Migration 2: Proof Simulation context + Lucky Guess trigger
--              + Computed Signals table
-- Applied via Supabase MCP
-- ============================================================

-- Issue 2: Add proof simulation context to snapshots
ALTER TABLE public.readiness_score_snapshots
  ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.quiz_sessions(session_id),
  ADD COLUMN IF NOT EXISTS is_proof_simulation BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_readiness_snapshots_user_proof
  ON public.readiness_score_snapshots(user_id, computed_at DESC, is_proof_simulation);

-- Lucky Guess: dedicated column (NOT is_flagged)
ALTER TABLE public.user_interactions
  ADD COLUMN IF NOT EXISTS is_suspected_lucky_guess BOOLEAN NOT NULL DEFAULT false;

-- Issue 3a: Lucky Guess Detection trigger
CREATE OR REPLACE FUNCTION public.flag_lucky_guess_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_mastery_weight DOUBLE PRECISION;
  v_avg_time_ms    INTEGER;
BEGIN
  IF NEW.is_correct = false THEN
    RETURN NEW;
  END IF;

  SELECT current_mastery_weight, avg_time_ms
  INTO v_mastery_weight, v_avg_time_ms
  FROM public.user_node_mastery
  WHERE user_id = NEW.user_id
    AND topic_id = NEW.topic_id;

  IF v_mastery_weight IS NOT NULL
    AND v_mastery_weight < 0.4
    AND NEW.time_spent_ms < COALESCE(v_avg_time_ms * 0.4, 5000)
    AND NEW.time_spent_ms > 0
  THEN
    NEW.is_suspected_lucky_guess := true;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_flag_lucky_guess ON public.user_interactions;
CREATE TRIGGER trg_flag_lucky_guess
  BEFORE INSERT ON public.user_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.flag_lucky_guess_on_insert();

-- Issue 3b: user_computed_signals table
CREATE TABLE IF NOT EXISTS public.user_computed_signals (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  score_velocity_7d DOUBLE PRECISION NOT NULL DEFAULT 0,
  score_velocity_updated_at TIMESTAMPTZ,
  churn_risk_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  churn_risk_updated_at TIMESTAMPTZ,
  days_since_last_session INTEGER,
  sessions_last_7d INTEGER NOT NULL DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_computed_signals ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_computed_signals' AND policyname = 'cs_select_own') THEN
    CREATE POLICY cs_select_own ON public.user_computed_signals
      FOR SELECT TO authenticated
      USING ((select auth.uid()) = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_computed_signals_churn
  ON public.user_computed_signals(churn_risk_score DESC)
  WHERE churn_risk_score > 0.6;

DROP TRIGGER IF EXISTS tr_computed_signals_updated_at ON public.user_computed_signals;
CREATE TRIGGER tr_computed_signals_updated_at
  BEFORE UPDATE ON public.user_computed_signals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Issue 3c: Deprecation comments
COMMENT ON COLUMN public.user_global_stats.churn_risk_score IS
  'DEPRECATED — use user_computed_signals.churn_risk_score instead';
COMMENT ON COLUMN public.user_global_stats.score_velocity_7d IS
  'DEPRECATED — use user_computed_signals.score_velocity_7d instead';

-- Update snapshot trigger to include session_id and is_proof_simulation
CREATE OR REPLACE FUNCTION public.snapshot_readiness_on_session_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO public.readiness_score_snapshots (
      user_id, score, sub_scores, session_id, is_proof_simulation, computed_at
    )
    SELECT
      NEW.user_id,
      ugs.global_readiness_score,
      '{}'::jsonb,
      NEW.session_id,
      COALESCE(NEW.is_proof_simulation, false),
      NOW()
    FROM public.user_global_stats ugs
    WHERE ugs.user_id = NEW.user_id
      AND ugs.global_readiness_score IS NOT NULL
      AND ugs.global_readiness_score > 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
