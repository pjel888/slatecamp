-- ============================================================
-- Migration 013: Analytics Infrastructure
-- Applied via Supabase MCP on 2026-03-19
-- Sources: Marketing Analytics Report (5 layers)
--          Data Science × Marketing Correlation Report
-- ============================================================

-- LAYER 1: Multi-touch attribution + LTV columns on user_global_stats
ALTER TABLE public.user_global_stats
  ADD COLUMN IF NOT EXISTS first_touch_source TEXT,
  ADD COLUMN IF NOT EXISTS first_touch_campaign TEXT,
  ADD COLUMN IF NOT EXISTS last_touch_source TEXT,
  ADD COLUMN IF NOT EXISTS last_touch_campaign TEXT,
  ADD COLUMN IF NOT EXISTS acquisition_touchpoints JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS exam_attempt_number INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS previous_exam_result TEXT,
  ADD COLUMN IF NOT EXISTS customer_archetype TEXT,
  ADD COLUMN IF NOT EXISTS churn_risk_score DOUBLE PRECISION DEFAULT 0,
  ADD COLUMN IF NOT EXISTS churn_risk_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS score_velocity_7d DOUBLE PRECISION DEFAULT 0,
  ADD COLUMN IF NOT EXISTS score_velocity_updated_at TIMESTAMPTZ;

-- LAYER 2: analytics_events missing column
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS referrer TEXT;

-- LAYER 4: Subscription analytics
ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS converted_from_source TEXT,
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS readiness_score_at_conversion DOUBLE PRECISION;

-- LAYER 5: Exam Outcomes
CREATE TABLE IF NOT EXISTS public.exam_outcomes (
  outcome_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  discipline_id UUID,
  exam_batch TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('passed', 'failed', 'did_not_take')),
  self_reported_score NUMERIC,
  peak_readiness_score DOUBLE PRECISION,
  readiness_score_at_7d_before DOUBLE PRECISION,
  avg_session_accuracy DOUBLE PRECISION,
  total_sessions_completed INTEGER,
  total_questions_answered INTEGER,
  days_active INTEGER,
  signup_source TEXT,
  customer_archetype TEXT,
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_eo_batch_result ON public.exam_outcomes(exam_batch, result);
CREATE INDEX IF NOT EXISTS idx_eo_user ON public.exam_outcomes(user_id);
CREATE INDEX IF NOT EXISTS idx_eo_score_result ON public.exam_outcomes(peak_readiness_score, result);
ALTER TABLE public.exam_outcomes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'exam_outcomes' AND policyname = 'eo_insert_own') THEN
    CREATE POLICY eo_insert_own ON public.exam_outcomes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'exam_outcomes' AND policyname = 'eo_select_own') THEN
    CREATE POLICY eo_select_own ON public.exam_outcomes FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'exam_outcomes_user_batch_unique') THEN
    ALTER TABLE public.exam_outcomes ADD CONSTRAINT exam_outcomes_user_batch_unique UNIQUE (user_id, exam_batch);
  END IF;
END $$;

-- Blindspot Protocol
CREATE TABLE IF NOT EXISTS public.blindspot_queues (
  queue_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID,
  node_ids UUID[] NOT NULL,
  question_count INTEGER DEFAULT 12,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  deferred_until TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'deferred', 'in_progress', 'completed', 'expired')),
  pre_queue_mastery JSONB DEFAULT '{}',
  post_queue_mastery JSONB DEFAULT '{}',
  nodes_improved INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_bq_user_status ON public.blindspot_queues(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bq_user_generated ON public.blindspot_queues(user_id, generated_at DESC);
ALTER TABLE public.blindspot_queues ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blindspot_queues' AND policyname = 'bq_select_own') THEN
    CREATE POLICY bq_select_own ON public.blindspot_queues FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blindspot_queues' AND policyname = 'bq_insert_own') THEN
    CREATE POLICY bq_insert_own ON public.blindspot_queues FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blindspot_queues' AND policyname = 'bq_update_own') THEN
    CREATE POLICY bq_update_own ON public.blindspot_queues FOR UPDATE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;
