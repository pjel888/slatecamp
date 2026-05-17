-- ============================================================
-- Migration 019: Application Layer Schema Support
-- Adds all columns required by the application layer implementation.
-- Corresponds to DB Audit v3 Action Items #1–5, #8, #11, #13.
-- ============================================================

-- ── Critical #1: Endurance Cycle columns on user_computed_signals ──
ALTER TABLE public.user_computed_signals
  ADD COLUMN IF NOT EXISTS endurance_baseline_items INTEGER,
  ADD COLUMN IF NOT EXISTS endurance_window_items INTEGER,
  ADD COLUMN IF NOT EXISTS endurance_target_items INTEGER DEFAULT 150,
  ADD COLUMN IF NOT EXISTS endurance_last_updated TIMESTAMPTZ;

-- ── Critical #2: Endurance session flag on quiz_sessions ──
ALTER TABLE public.quiz_sessions
  ADD COLUMN IF NOT EXISTS is_endurance_session BOOLEAN DEFAULT false;

-- ── Critical #4: Free tier daily cap columns on user_global_stats ──
ALTER TABLE public.user_global_stats
  ADD COLUMN IF NOT EXISTS free_questions_today INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS free_questions_reset_date DATE DEFAULT CURRENT_DATE;

-- ── Critical #5: Score reveal "shown once" tracking ──
ALTER TABLE public.user_global_stats
  ADD COLUMN IF NOT EXISTS score_reveal_shown_at TIMESTAMPTZ;

-- ── High #8: SRS scheduling columns on user_node_mastery ──
ALTER TABLE public.user_node_mastery
  ADD COLUMN IF NOT EXISTS srs_due_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS srs_interval_days INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS srs_ease_factor DOUBLE PRECISION DEFAULT 2.5;

-- Index for SRS due-at queries (items due for review)
CREATE INDEX IF NOT EXISTS idx_mastery_srs_due
  ON public.user_node_mastery(user_id, srs_due_at ASC)
  WHERE srs_due_at IS NOT NULL;

-- ── Medium #11: Calibration accuracy signal ──
ALTER TABLE public.user_computed_signals
  ADD COLUMN IF NOT EXISTS calibration_accuracy DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS calibration_updated_at TIMESTAMPTZ;

-- ── Medium #13: Accuracy-by-block for Endurance Cycle ──
ALTER TABLE public.quiz_sessions
  ADD COLUMN IF NOT EXISTS accuracy_by_block JSONB DEFAULT '[]';

-- ── Medium #15: Index for session accuracy-by-block reconstruction ──
CREATE INDEX IF NOT EXISTS idx_interactions_session_order
  ON public.user_interactions(session_id, question_order);

-- ── High #3: Populate feature_flags with all paywall rules ──
-- Canonical target_tier values:
--   free | pro | prime | institutional | enterprise
-- Legacy values such as camp / insurance are deprecated.
-- Only insert if the table is empty (avoid duplicates on re-run)
INSERT INTO public.feature_flags (key, description, enabled, target_tier)
SELECT * FROM (VALUES
  ('readiness_score_live',      'Always-live Readiness Score',                true, ARRAY['camp','insurance','institutional']),
  ('taxonomy_heatmap_full',     'Full heatmap access',                       true, ARRAY['camp','insurance','institutional']),
  ('questions_all_difficulty',  'Access to hard/medium questions',            true, ARRAY['camp','insurance','institutional']),
  ('questions_unlimited',       'Unlimited daily questions',                  true, ARRAY['camp','insurance','institutional']),
  ('camp_trails_full_library',  'Full trail library access',                 true, ARRAY['camp','insurance','institutional']),
  ('blindspot_protocol',        'Focus Review mechanic',                     true, ARRAY['camp','insurance','institutional']),
  ('endurance_cycle',           'Extended Practice mechanic',                true, ARRAY['camp','insurance','institutional']),
  ('proof_simulation',          'Full Exam Simulation access',               true, ARRAY['camp','insurance','institutional']),
  ('3d_lab_full',               '3D Lab full interaction mode',              true, ARRAY['camp','insurance','institutional']),
  ('analytics_dashboard_full',  'Full analytics dashboard',                  true, ARRAY['camp','insurance','institutional']),
  ('ai_assistant_unlimited',    'Unlimited AI Reference queries',            true, ARRAY['camp','insurance','institutional'])
) AS v(key, description, enabled, target_tier)
WHERE NOT EXISTS (SELECT 1 FROM public.feature_flags LIMIT 1);
