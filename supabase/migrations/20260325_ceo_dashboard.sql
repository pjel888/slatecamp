-- ============================================================================
-- SlateCamp CEO Dashboard — Consolidated Database Migration
-- Sections correspond to DB Implementation Plan migrations 001–010
-- ============================================================================

-- ── 001: Create ceo_financial_entries ──────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE public.financial_entry_type AS ENUM ('revenue', 'expense', 'investment');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.ceo_financial_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_date DATE NOT NULL,
  entry_type public.financial_entry_type NOT NULL,
  category TEXT NOT NULL,
  amount_php NUMERIC(12,2) NOT NULL CHECK (amount_php > 0),
  description TEXT,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ceo_financial_entries ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_ceo_financial_entries_entry_date
  ON public.ceo_financial_entries(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_ceo_financial_entries_entry_type
  ON public.ceo_financial_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_ceo_financial_entries_category
  ON public.ceo_financial_entries(category);
CREATE INDEX IF NOT EXISTS idx_ceo_financial_entries_type_date
  ON public.ceo_financial_entries(entry_type, entry_date DESC);


-- ── 002: Create ceo_team_members ──────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE public.team_department AS ENUM (
    'engineering', 'content', 'design', 'marketing', 'operations', 'consulting'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.system_role_type AS ENUM (
    'ceo', 'super_admin', 'admin', 'lead', 'member', 'consultant', 'viewer'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.ceo_team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  department public.team_department NOT NULL,
  monthly_cost_php NUMERIC(10,2),
  system_role public.system_role_type NOT NULL DEFAULT 'member',
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_team_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

ALTER TABLE public.ceo_team_members ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_ceo_team_members_department
  ON public.ceo_team_members(department);
CREATE INDEX IF NOT EXISTS idx_ceo_team_members_user_id
  ON public.ceo_team_members(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ceo_team_members_active
  ON public.ceo_team_members(end_date) WHERE end_date IS NULL;


-- ── 003: Create ceo_gate_status ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.ceo_gate_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gate_number SMALLINT NOT NULL CHECK (gate_number BETWEEN 0 AND 4),
  entered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  exit_conditions_met JSONB NOT NULL DEFAULT '{}',
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ceo_gate_status ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_ceo_gate_status_entered
  ON public.ceo_gate_status(entered_at DESC);

-- View: current gate (latest entry)
CREATE OR REPLACE VIEW public.v_current_gate AS
SELECT * FROM public.ceo_gate_status
ORDER BY entered_at DESC
LIMIT 1;


-- ── 004: Create ceo_cash_balance_entries ──────────────────────────────────

CREATE TABLE IF NOT EXISTS public.ceo_cash_balance_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  balance_date DATE NOT NULL,
  amount_php NUMERIC(14,2) NOT NULL CHECK (amount_php >= 0),
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ceo_cash_balance_entries ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_ceo_cash_balance_date
  ON public.ceo_cash_balance_entries(balance_date DESC);


-- ── 005: Patch existing tables ────────────────────────────────────────────

ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS amount NUMERIC(10,2);
ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS plan TEXT;
ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status
  ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status_plan
  ON public.user_subscriptions(status, plan);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_cancelled_at
  ON public.user_subscriptions(cancelled_at) WHERE cancelled_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_role
  ON public.profiles(role) WHERE role IN ('ceo', 'super_admin', 'admin');

ALTER TABLE public.user_global_stats
  ADD COLUMN IF NOT EXISTS global_readiness_score NUMERIC(5,2);


-- ── 006: Create materialized views ────────────────────────────────────────

-- 6.1 Monthly financial summary
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_monthly_financial_summary AS
SELECT
  DATE_TRUNC('month', entry_date)::DATE AS month,
  entry_type::TEXT AS entry_type,
  category,
  SUM(amount_php) AS total_amount,
  COUNT(*) AS entry_count,
  BOOL_OR(is_recurring) AS has_recurring
FROM public.ceo_financial_entries
GROUP BY DATE_TRUNC('month', entry_date), entry_type, category
ORDER BY month DESC, entry_type, category;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_financial_month_type_cat
  ON public.mv_monthly_financial_summary(month, entry_type, category);

-- 6.2 Cohort retention
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_cohort_retention AS
WITH cohort_base AS (
  SELECT
    ugs.user_id,
    DATE_TRUNC('month', ugs.first_session_at)::DATE AS cohort_month
  FROM public.user_global_stats ugs
  WHERE ugs.first_session_at IS NOT NULL
),
weekly_sessions AS (
  SELECT
    qs.user_id,
    DATE_TRUNC('week', qs.started_at)::DATE AS session_week
  FROM public.quiz_sessions qs
  WHERE qs.started_at IS NOT NULL
  GROUP BY qs.user_id, DATE_TRUNC('week', qs.started_at)
)
SELECT
  cb.cohort_month,
  COUNT(DISTINCT cb.user_id) AS cohort_size,
  FLOOR(EXTRACT(EPOCH FROM (ws.session_week - cb.cohort_month)) / 604800)::INT AS week_number,
  COUNT(DISTINCT ws.user_id) AS active_users,
  ROUND(
    COUNT(DISTINCT ws.user_id)::NUMERIC / NULLIF(COUNT(DISTINCT cb.user_id), 0),
    4
  ) AS retention_rate
FROM cohort_base cb
LEFT JOIN weekly_sessions ws ON cb.user_id = ws.user_id
  AND ws.session_week >= cb.cohort_month
WHERE FLOOR(EXTRACT(EPOCH FROM (ws.session_week - cb.cohort_month)) / 604800) BETWEEN 0 AND 12
GROUP BY cb.cohort_month, week_number
ORDER BY cb.cohort_month DESC, week_number ASC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_cohort_retention_month_week
  ON public.mv_cohort_retention(cohort_month, week_number);

-- 6.3 Churn risk distribution
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_churn_risk_distribution AS
SELECT
  CASE
    WHEN churn_risk_score < 0.25 THEN 'low'
    WHEN churn_risk_score < 0.50 THEN 'medium'
    WHEN churn_risk_score < 0.75 THEN 'high'
    ELSE 'critical'
  END AS risk_level,
  COUNT(*) AS user_count,
  ROUND(AVG(EXTRACT(DAY FROM NOW() - last_session_at))::NUMERIC, 1) AS avg_days_since_session,
  ROUND(AVG(COALESCE(global_readiness_score, 0))::NUMERIC, 1) AS avg_readiness_score,
  ROUND(AVG(score_velocity_7d)::NUMERIC, 3) AS avg_score_velocity
FROM public.user_global_stats
WHERE last_session_at IS NOT NULL
GROUP BY
  CASE
    WHEN churn_risk_score < 0.25 THEN 'low'
    WHEN churn_risk_score < 0.50 THEN 'medium'
    WHEN churn_risk_score < 0.75 THEN 'high'
    ELSE 'critical'
  END;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_churn_risk_level
  ON public.mv_churn_risk_distribution(risk_level);

-- 6.4 Engagement snapshot
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_engagement_snapshot AS
SELECT
  NOW()::DATE AS snapshot_date,
  COUNT(*) FILTER (WHERE last_session_at >= NOW() - INTERVAL '1 day') AS dau,
  COUNT(*) FILTER (WHERE last_session_at >= NOW() - INTERVAL '7 days') AS wau,
  COUNT(*) FILTER (WHERE last_session_at >= NOW() - INTERVAL '30 days') AS mau,
  ROUND(
    COUNT(*) FILTER (WHERE last_session_at >= NOW() - INTERVAL '1 day')::NUMERIC
    / NULLIF(COUNT(*) FILTER (WHERE last_session_at >= NOW() - INTERVAL '30 days'), 0),
    4
  ) AS dau_mau_ratio,
  ROUND(AVG(total_sessions)::NUMERIC / NULLIF(AVG(days_active), 0) * 7, 1) AS avg_sessions_per_week,
  ROUND(AVG(current_streak)::NUMERIC, 1) AS avg_streak_length
FROM public.user_global_stats
WHERE first_session_at IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_engagement_date
  ON public.mv_engagement_snapshot(snapshot_date);

-- 6.5 Time to value
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_time_to_value AS
SELECT
  PERCENTILE_CONT(0.5) WITHIN GROUP (
    ORDER BY EXTRACT(EPOCH FROM (ugs.first_session_at - u.created_at)) / 86400.0
  ) AS median_days_to_first_session,
  COUNT(*) FILTER (WHERE ugs.first_session_at IS NOT NULL)::NUMERIC
    / NULLIF(COUNT(*), 0) AS diagnostic_completion_rate,
  PERCENTILE_CONT(0.5) WITHIN GROUP (
    ORDER BY EXTRACT(EPOCH FROM (ugs.converted_at - ugs.first_session_at)) / 86400.0
  ) FILTER (WHERE ugs.converted_at IS NOT NULL) AS median_days_to_conversion,
  AVG(ugs.total_sessions) FILTER (WHERE ugs.converted_at IS NOT NULL) AS avg_sessions_before_conversion,
  AVG(ugs.global_readiness_score) FILTER (WHERE ugs.converted_at IS NOT NULL) AS avg_score_at_conversion,
  COUNT(*) FILTER (WHERE ugs.converted_at IS NOT NULL)::NUMERIC
    / NULLIF(COUNT(*), 0) AS free_to_paid_conversion_rate,
  NOW() AS computed_at
FROM public.user_global_stats ugs
JOIN auth.users u ON u.id = ugs.user_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_ttv_computed
  ON public.mv_time_to_value(computed_at);

-- 6.6 Churn signals
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_churn_signals AS
WITH base_churn AS (
  SELECT AVG(churn_risk_score) AS avg_churn
  FROM public.user_global_stats
  WHERE churn_risk_score IS NOT NULL
),
failed_week1 AS (
  SELECT
    'failed_2plus_quizzes_week1' AS signal_key,
    'Users who fail 2+ quizzes in Week 1 churn at elevated rates' AS signal_description,
    COUNT(DISTINCT sq.user_id) AS affected_users,
    ROUND(AVG(ugs.churn_risk_score)::NUMERIC / NULLIF((SELECT avg_churn FROM base_churn), 0), 1) AS churn_multiplier
  FROM (
    SELECT ui.user_id
    FROM public.user_interactions ui
    JOIN public.user_global_stats ugs2 ON ui.user_id = ugs2.user_id
    WHERE ui.is_correct = false
      AND ui.created_at <= ugs2.first_session_at + INTERVAL '7 days'
    GROUP BY ui.user_id
    HAVING COUNT(*) >= 2
  ) sq
  JOIN public.user_global_stats ugs ON sq.user_id = ugs.user_id
),
no_trail AS (
  SELECT
    'no_trail_enrollment' AS signal_key,
    'Users without Camp Trail enrollment churn at elevated rates' AS signal_description,
    COUNT(*) AS affected_users,
    ROUND(AVG(ugs.churn_risk_score)::NUMERIC / NULLIF((SELECT avg_churn FROM base_churn), 0), 1) AS churn_multiplier
  FROM public.user_global_stats ugs
  LEFT JOIN public.user_trail_enrollments ute ON ugs.user_id = ute.user_id
  WHERE ute.user_id IS NULL AND ugs.first_session_at IS NOT NULL
),
inactive_7d AS (
  SELECT
    'no_session_7d' AS signal_key,
    'Users with no session in 7+ days' AS signal_description,
    COUNT(*) AS affected_users,
    ROUND(AVG(churn_risk_score)::NUMERIC / NULLIF((SELECT avg_churn FROM base_churn), 0), 1) AS churn_multiplier
  FROM public.user_global_stats
  WHERE last_session_at < NOW() - INTERVAL '7 days' AND first_session_at IS NOT NULL
),
score_declining AS (
  SELECT
    'score_declining' AS signal_key,
    'Users with declining Readiness Score (7d)' AS signal_description,
    COUNT(*) AS affected_users,
    ROUND(AVG(churn_risk_score)::NUMERIC / NULLIF((SELECT avg_churn FROM base_churn), 0), 1) AS churn_multiplier
  FROM public.user_global_stats
  WHERE score_velocity_7d < 0 AND first_session_at IS NOT NULL
)
SELECT * FROM failed_week1
UNION ALL SELECT * FROM no_trail
UNION ALL SELECT * FROM inactive_7d
UNION ALL SELECT * FROM score_declining
ORDER BY churn_multiplier DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_churn_signals_key
  ON public.mv_churn_signals(signal_key);

-- 6.7 Acquisition source distribution
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_acquisition_source_distribution AS
SELECT
  COALESCE(acquisition_source, 'unknown') AS source,
  COUNT(*) AS total_users,
  COUNT(*) FILTER (WHERE converted_at IS NOT NULL) AS converted_users,
  ROUND(
    COUNT(*) FILTER (WHERE converted_at IS NOT NULL)::NUMERIC / NULLIF(COUNT(*), 0), 4
  ) AS conversion_rate,
  ROUND(AVG(EXTRACT(EPOCH FROM (converted_at - first_session_at)) / 86400.0)
    FILTER (WHERE converted_at IS NOT NULL)::NUMERIC, 1
  ) AS avg_days_to_conversion
FROM public.user_global_stats
WHERE first_session_at IS NOT NULL
GROUP BY COALESCE(acquisition_source, 'unknown')
ORDER BY total_users DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_acq_source
  ON public.mv_acquisition_source_distribution(source);


-- ── 006b: MV refresh function ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.refresh_ceo_materialized_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_monthly_financial_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_cohort_retention;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_churn_risk_distribution;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_engagement_snapshot;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_time_to_value;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_churn_signals;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_acquisition_source_distribution;
END;
$$;


-- ── 007: CEO helper functions ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.compute_mrr()
RETURNS NUMERIC
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM public.user_subscriptions
  WHERE status = 'active';
$$;

CREATE OR REPLACE FUNCTION public.compute_monthly_burn(target_month DATE DEFAULT CURRENT_DATE)
RETURNS NUMERIC
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(amount_php), 0)
  FROM public.ceo_financial_entries
  WHERE entry_type = 'expense'
    AND DATE_TRUNC('month', entry_date) = DATE_TRUNC('month', target_month);
$$;

CREATE OR REPLACE FUNCTION public.compute_runway_months()
RETURNS NUMERIC
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  WITH cash AS (
    SELECT amount_php FROM public.ceo_cash_balance_entries
    ORDER BY balance_date DESC LIMIT 1
  ),
  net_burn AS (
    SELECT public.compute_monthly_burn() - public.compute_mrr() AS monthly_net
  )
  SELECT
    CASE
      WHEN (SELECT monthly_net FROM net_burn) <= 0 THEN 999
      WHEN (SELECT amount_php FROM cash) IS NULL THEN NULL
      ELSE ROUND((SELECT amount_php FROM cash) / (SELECT monthly_net FROM net_burn), 1)
    END;
$$;

CREATE OR REPLACE FUNCTION public.compute_monthly_churn_rate()
RETURNS NUMERIC
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  WITH active_start AS (
    SELECT COUNT(*) AS cnt
    FROM public.user_subscriptions
    WHERE status = 'active'
      OR (cancelled_at IS NOT NULL
          AND cancelled_at >= DATE_TRUNC('month', CURRENT_DATE))
  ),
  cancelled AS (
    SELECT COUNT(*) AS cnt
    FROM public.user_subscriptions
    WHERE cancelled_at >= DATE_TRUNC('month', CURRENT_DATE)
      AND cancelled_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
  )
  SELECT
    CASE
      WHEN (SELECT cnt FROM active_start) = 0 THEN NULL
      ELSE ROUND((SELECT cnt FROM cancelled)::NUMERIC / (SELECT cnt FROM active_start), 4)
    END;
$$;

CREATE OR REPLACE FUNCTION public.compute_trail_completion_rate()
RETURNS NUMERIC
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  WITH enrolled AS (
    SELECT ute.user_id, COUNT(DISTINCT td.id) AS total_days
    FROM public.user_trail_enrollments ute
    JOIN public.trail_days td ON td.trail_id = ute.trail_id
    GROUP BY ute.user_id
  ),
  completed AS (
    SELECT tdc.user_id, COUNT(DISTINCT tdc.day_id) AS completed_days
    FROM public.trail_day_completions tdc
    GROUP BY tdc.user_id
  )
  SELECT ROUND(
    AVG(COALESCE(c.completed_days, 0)::NUMERIC / NULLIF(e.total_days, 0)), 4
  )
  FROM enrolled e
  LEFT JOIN completed c ON e.user_id = c.user_id;
$$;


-- ── 007b: Role sync trigger ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.sync_team_member_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.system_role IS DISTINCT FROM OLD.system_role
     AND NEW.user_id IS NOT NULL THEN
    UPDATE public.profiles
    SET role = NEW.system_role::TEXT,
        updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_sync_team_role ON public.ceo_team_members;
CREATE TRIGGER tr_sync_team_role
  AFTER UPDATE OF system_role ON public.ceo_team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_team_member_role();


-- ── 008: RLS policies ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_ceo_or_super_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid())
    AND role IN ('ceo', 'super_admin')
  );
$$;

-- ceo_financial_entries policies
DROP POLICY IF EXISTS "CEO can read financial entries" ON public.ceo_financial_entries;
CREATE POLICY "CEO can read financial entries"
  ON public.ceo_financial_entries FOR SELECT TO authenticated
  USING (public.is_ceo_or_super_admin());

DROP POLICY IF EXISTS "CEO can insert financial entries" ON public.ceo_financial_entries;
CREATE POLICY "CEO can insert financial entries"
  ON public.ceo_financial_entries FOR INSERT TO authenticated
  WITH CHECK (public.is_ceo_or_super_admin());

DROP POLICY IF EXISTS "CEO can update financial entries" ON public.ceo_financial_entries;
CREATE POLICY "CEO can update financial entries"
  ON public.ceo_financial_entries FOR UPDATE TO authenticated
  USING (public.is_ceo_or_super_admin())
  WITH CHECK (public.is_ceo_or_super_admin());

DROP POLICY IF EXISTS "CEO can delete financial entries" ON public.ceo_financial_entries;
CREATE POLICY "CEO can delete financial entries"
  ON public.ceo_financial_entries FOR DELETE TO authenticated
  USING (public.is_ceo_or_super_admin());

-- ceo_team_members policies
DROP POLICY IF EXISTS "CEO can read team members" ON public.ceo_team_members;
CREATE POLICY "CEO can read team members"
  ON public.ceo_team_members FOR SELECT TO authenticated
  USING (public.is_ceo_or_super_admin());

DROP POLICY IF EXISTS "CEO can insert team members" ON public.ceo_team_members;
CREATE POLICY "CEO can insert team members"
  ON public.ceo_team_members FOR INSERT TO authenticated
  WITH CHECK (public.is_ceo_or_super_admin());

DROP POLICY IF EXISTS "CEO can update team members" ON public.ceo_team_members;
CREATE POLICY "CEO can update team members"
  ON public.ceo_team_members FOR UPDATE TO authenticated
  USING (public.is_ceo_or_super_admin())
  WITH CHECK (public.is_ceo_or_super_admin());

DROP POLICY IF EXISTS "CEO can delete team members" ON public.ceo_team_members;
CREATE POLICY "CEO can delete team members"
  ON public.ceo_team_members FOR DELETE TO authenticated
  USING (public.is_ceo_or_super_admin());

-- ceo_gate_status policies
DROP POLICY IF EXISTS "CEO can read gate status" ON public.ceo_gate_status;
CREATE POLICY "CEO can read gate status"
  ON public.ceo_gate_status FOR SELECT TO authenticated
  USING (public.is_ceo_or_super_admin());

DROP POLICY IF EXISTS "CEO can insert gate status" ON public.ceo_gate_status;
CREATE POLICY "CEO can insert gate status"
  ON public.ceo_gate_status FOR INSERT TO authenticated
  WITH CHECK (public.is_ceo_or_super_admin());

-- ceo_cash_balance_entries policies
DROP POLICY IF EXISTS "CEO can read cash balance" ON public.ceo_cash_balance_entries;
CREATE POLICY "CEO can read cash balance"
  ON public.ceo_cash_balance_entries FOR SELECT TO authenticated
  USING (public.is_ceo_or_super_admin());

DROP POLICY IF EXISTS "CEO can insert cash balance" ON public.ceo_cash_balance_entries;
CREATE POLICY "CEO can insert cash balance"
  ON public.ceo_cash_balance_entries FOR INSERT TO authenticated
  WITH CHECK (public.is_ceo_or_super_admin());

DROP POLICY IF EXISTS "CEO can update cash balance" ON public.ceo_cash_balance_entries;
CREATE POLICY "CEO can update cash balance"
  ON public.ceo_cash_balance_entries FOR UPDATE TO authenticated
  USING (public.is_ceo_or_super_admin())
  WITH CHECK (public.is_ceo_or_super_admin());


-- ── 009: Seed initial gate ────────────────────────────────────────────────

-- Insert Gate 0 if no gate status exists
INSERT INTO public.ceo_gate_status (gate_number, notes, created_by)
SELECT 0, 'Initial gate — Zero to Validation', auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.ceo_gate_status)
  AND auth.uid() IS NOT NULL;


-- ── 010: Updated_at triggers ──────────────────────────────────────────────

-- Ensure the generic updated_at function exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_ceo_financial_entries_updated_at ON public.ceo_financial_entries;
CREATE TRIGGER tr_ceo_financial_entries_updated_at
  BEFORE UPDATE ON public.ceo_financial_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS tr_ceo_team_members_updated_at ON public.ceo_team_members;
CREATE TRIGGER tr_ceo_team_members_updated_at
  BEFORE UPDATE ON public.ceo_team_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
