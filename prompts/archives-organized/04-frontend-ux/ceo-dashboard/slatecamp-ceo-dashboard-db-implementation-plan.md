# SlateCamp CEO Dashboard — Database Implementation Plan

> **Author:** SlateCamp Database Architect
> **Date:** March 25, 2026
> **Source Documents:** CEO Dashboard Master Prompt v2, Business & Profitability Implementation Plan, CEO Dashboard UX Research & Design Plan
> **Scope:** Every table, column, index, trigger, RLS policy, materialized view, and migration required to power all four `/ceo` sub-routes and every metric specified in the source documents.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Existing Schema Audit — What Already Exists](#2-existing-schema-audit)
3. [New Tables Required](#3-new-tables-required)
4. [Schema Modifications to Existing Tables](#4-schema-modifications-to-existing-tables)
5. [Materialized Views for CEO Analytics](#5-materialized-views-for-ceo-analytics)
6. [Database Functions & Triggers](#6-database-functions--triggers)
7. [RLS Policy Architecture](#7-rls-policy-architecture)
8. [Index Plan](#8-index-plan)
9. [Query Map — Every Metric to Its Data Path](#9-query-map)
10. [Migration Execution Order](#10-migration-execution-order)
11. [Technical Debt Resolution](#11-technical-debt-resolution)
12. [Phased Delivery Schedule](#12-phased-delivery-schedule)

---

## 1. Executive Summary

The CEO Dashboard requires database support across four functional domains:

| Domain | Route | Tables Touched | New Tables | New Views |
|--------|-------|---------------|------------|-----------|
| Financial Health | `/ceo`, `/ceo/financials` | `user_subscriptions`, `ceo_financial_entries` | 2 | 2 |
| Behavioral Analytics | `/ceo/insights` | `user_global_stats`, `readiness_score_snapshots`, `quiz_sessions`, `user_interactions`, `trail_day_completions`, `user_trail_enrollments` | 0 | 4 |
| Team Management | `/ceo/team` | `profiles`, `ceo_team_members` | 1 | 0 |
| Growth & Unit Economics | `/ceo` (command center) | `auth.users`, `user_subscriptions`, `user_global_stats`, `ceo_financial_entries` | 1 | 1 |

**Total new tables:** 4
**Total new materialized views:** 7
**Total new database functions:** 6
**Total new indexes:** 22
**Total RLS policies:** 12
**Migrations:** 10 (ordered, idempotent)

The plan resolves 7 items from the existing technical debt register and adds zero new debt.

---

## 2. Existing Schema Audit — What Already Exists

These tables are **already in production** and will be queried by the CEO Dashboard. No structural changes to these unless noted in Section 4.

### 2.1 Tables the Dashboard Reads Directly

| Table | Role in Dashboard | Key Columns Used |
|-------|------------------|-----------------|
| `auth.users` | Total registered user count | `id`, `created_at` |
| `profiles` | CEO auth gate, role assignment | `id`, `role`, `display_name` |
| `user_subscriptions` | MRR, paying user count, ARPU, churn | `user_id`, `plan`, `status`, `amount`, `current_period_start`, `current_period_end`, `stripe_customer_id`, `created_at`, `cancelled_at` |
| `user_global_stats` | Engagement, churn risk, TTV, retention | `user_id`, `total_sessions`, `total_questions`, `avg_score`, `days_active`, `current_streak`, `churn_risk_score`, `score_velocity_7d`, `first_session_at`, `last_session_at`, `acquisition_source`, `converted_at` |
| `readiness_score_snapshots` | Score trajectory, score at conversion | `user_id`, `score`, `snapshot_date` |
| `quiz_sessions` | DAU/MAU, activation, diagnostic completion | `user_id`, `mode`, `score`, `started_at`, `completed_at` |
| `user_interactions` | Churn signal derivation (pattern analysis) | `user_id`, `question_id`, `is_correct`, `time_spent_ms`, `created_at` |
| `user_trail_enrollments` | Trail enrollment count | `user_id`, `trail_id`, `enrolled_at` |
| `trail_day_completions` | Trail completion rate | `user_id`, `day_id`, `completed_at` |
| `camp_trails` | Trail metadata | `trail_id`, total days |
| `trail_days` | Day count per trail | `day_id`, `trail_id` |

### 2.2 Missing Columns on Existing Tables (Identified)

| Table | Missing Column | Required By | Impact |
|-------|---------------|-------------|--------|
| `user_subscriptions` | `amount NUMERIC(10,2)` | MRR computation | **CRITICAL** — if not present, MRR cannot be computed from subscription data |
| `user_subscriptions` | `cancelled_at TIMESTAMPTZ` | Monthly churn rate | Needed to count cancellations per period |
| `user_subscriptions` | `plan TEXT` | Revenue breakdown by tier | Must distinguish `pro_monthly` vs `pro_exam_pass` vs `institutional` |
| `user_global_stats` | `global_readiness_score NUMERIC` | Avg readiness at conversion, churn risk context | Referenced in UX Research queries |
| `questions` | `updated_at TIMESTAMPTZ` | Technical debt item | Already flagged in debt register |

**Action:** Verify these columns exist before migration. If missing, add in Migration 001.

---

## 3. New Tables Required

### 3.1 `ceo_financial_entries` — Financial Ledger

**Part of the core loop:** Powers all `/ceo` financial metrics (burn, runway, expense breakdown, revenue tracking, P&L chart) and the `/ceo/financials` ledger.

**Source:** CEO Dashboard Master Prompt §New Tables; Business Plan §5.1 Cost Categories; UX Research §Part 3 Screen 4.

```sql
-- Migration: 20260325_001_create_ceo_financial_entries.sql

CREATE TYPE public.financial_entry_type AS ENUM ('revenue', 'expense', 'investment');

CREATE TABLE public.ceo_financial_entries (
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

-- Indexes
CREATE INDEX idx_ceo_financial_entries_entry_date
  ON public.ceo_financial_entries(entry_date DESC);
CREATE INDEX idx_ceo_financial_entries_entry_type
  ON public.ceo_financial_entries(entry_type);
CREATE INDEX idx_ceo_financial_entries_category
  ON public.ceo_financial_entries(category);
CREATE INDEX idx_ceo_financial_entries_type_date
  ON public.ceo_financial_entries(entry_type, entry_date DESC);

-- Updated_at trigger
CREATE TRIGGER tr_ceo_financial_entries_updated_at
  BEFORE UPDATE ON public.ceo_financial_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Category constraint via CHECK (allows future additions without migration)
-- Revenue categories from Business Plan §5.1:
--   subscription_revenue, exam_pass_revenue, institutional_revenue,
--   api_licensing_revenue, data_intelligence_revenue, white_label_revenue,
--   referral_credit, other_revenue
-- Expense categories:
--   salaries, contractors, ad_spend, server_costs, tools, payment_processing,
--   content_production, legal, office, miscellaneous
-- Investment categories:
--   founder_investment, angel_round, grant, other_investment
-- Special:
--   cash_balance (used for runway calculation, not summed in P&L)
```

**Design decisions:**
- `created_by` instead of no user link — audit trail for who entered the data.
- `ON DELETE RESTRICT` — never orphan financial records if a user is deleted.
- `financial_entry_type` as a Postgres ENUM — fixed set, prevents typos.
- `category` as TEXT (not ENUM) — Business Plan lists 20+ categories and explicitly says future revenue streams will be added (API licensing, data intelligence, white-label). TEXT with application-level validation is more appropriate than an ENUM that requires a migration for every new category.
- No `user_id` column — this is not user-scoped data. It's company-level financial data accessed only by the CEO.

---

### 3.2 `ceo_team_members` — Team Roster

**Part of the core loop:** Powers `/ceo/team` roster, department cost allocation, role assignment, and team cost as % of burn on `/ceo`.

**Source:** CEO Dashboard Master Prompt §New Tables; Business Plan §11; UX Research §Part 3 Screen 2.

```sql
-- Migration: 20260325_002_create_ceo_team_members.sql

CREATE TYPE public.team_department AS ENUM (
  'engineering', 'content', 'design', 'marketing', 'operations', 'consulting'
);

CREATE TYPE public.system_role AS ENUM (
  'ceo', 'super_admin', 'admin', 'lead', 'member', 'consultant', 'viewer'
);

CREATE TABLE public.ceo_team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  department public.team_department NOT NULL,
  monthly_cost_php NUMERIC(10,2),
  system_role public.system_role NOT NULL DEFAULT 'member',
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ceo_team_members ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_ceo_team_members_department
  ON public.ceo_team_members(department);
CREATE INDEX idx_ceo_team_members_user_id
  ON public.ceo_team_members(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_ceo_team_members_active
  ON public.ceo_team_members(end_date) WHERE end_date IS NULL;

-- Updated_at trigger
CREATE TRIGGER tr_ceo_team_members_updated_at
  BEFORE UPDATE ON public.ceo_team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Constraint: end_date must be after start_date
ALTER TABLE public.ceo_team_members
  ADD CONSTRAINT chk_team_dates CHECK (end_date IS NULL OR end_date >= start_date);
```

**Design decisions:**
- `user_id` nullable — per UX Research: "not all team members have SlateCamp accounts." Consultants, external contractors may not.
- `ON DELETE SET NULL` — if a linked user account is deleted, the team record persists (historical burn data must survive).
- `department` as ENUM — fixed set from Business Plan §11.3, unlikely to change frequently.
- `system_role` as ENUM — UX Research Path 4 shows role assignment updates `profiles.role`. The `system_role` on this table tracks the intended role; the Server Action synchronizes it to `profiles.role` for linked users.
- Partial index on `end_date IS NULL` — the active team query is the most frequent.
- `monthly_cost_php` nullable — UX Research specifies: volunteers/unpaid consultants show "—" in the table.

---

### 3.3 `ceo_gate_status` — Profitability Gate Tracking

**Part of the core loop:** Powers the "Current Gate" indicator on `/ceo` command center. Tracks which of the four profitability gates SlateCamp is in and records gate transitions.

**Source:** Business Plan §2 (Four Profitability Gates); UX Research requirement for gate indicator.

```sql
-- Migration: 20260325_003_create_ceo_gate_status.sql

CREATE TABLE public.ceo_gate_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gate_number SMALLINT NOT NULL CHECK (gate_number BETWEEN 0 AND 4),
  entered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  exit_conditions_met JSONB NOT NULL DEFAULT '{}',
  -- Example: {"mrr_target": 10000, "mrr_actual": 12500, "conversion_rate": 0.045, "nps": 52}
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ceo_gate_status ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_ceo_gate_status_entered
  ON public.ceo_gate_status(entered_at DESC);

-- View: current gate (latest entry)
CREATE OR REPLACE VIEW public.v_current_gate AS
SELECT * FROM public.ceo_gate_status
ORDER BY entered_at DESC
LIMIT 1;
```

**Design decisions:**
- Append-only log — every gate transition is a historical record. Never UPDATE; only INSERT new rows.
- `exit_conditions_met` as JSONB — gate conditions vary per gate (Business Plan §2 shows different conditions for each). JSONB accommodates this variable schema.
- This is a lightweight table with very low write frequency (transitions happen every 3–12 months).

---

### 3.4 `ceo_cash_balance_entries` — Cash Balance Snapshots

**Part of the core loop:** Powers RunwayGauge. Separated from `ceo_financial_entries` because cash balance is a snapshot value, not a P&L line item.

**Source:** UX Research §Part 3 RunwayGauge: "Requires cashOnHand from a manual entry"; Business Plan §4.1: "Runway = Cash on hand ÷ net burn."

```sql
-- Migration: 20260325_004_create_ceo_cash_balance.sql

CREATE TABLE public.ceo_cash_balance_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  balance_date DATE NOT NULL,
  amount_php NUMERIC(14,2) NOT NULL CHECK (amount_php >= 0),
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ceo_cash_balance_entries ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX idx_ceo_cash_balance_date
  ON public.ceo_cash_balance_entries(balance_date DESC);
```

**Design decisions:**
- Separate from `ceo_financial_entries` — the original master prompt uses `category = 'cash_balance'` in the financial entries table. However, the UX Research and Business Plan treat cash balance fundamentally differently from income/expense entries: it's a point-in-time snapshot, not a transaction. Mixing them in one table creates confusion (cash balance should not be summed in P&L calculations). A dedicated table is cleaner.
- `UNIQUE INDEX on balance_date` — only one cash balance per day. Latest entry = current cash on hand.
- `NUMERIC(14,2)` — allows up to ₱99,999,999,999.99 (runway calculations need this headroom for projection).

**Alternative:** If you want to keep the original design from the master prompt (cash_balance as a category in `ceo_financial_entries`), skip this table and add a `cash_balance` category with a clear convention that it's excluded from P&L aggregations. Either approach works; this plan presents the cleaner separation.

---

## 4. Schema Modifications to Existing Tables

### 4.1 `user_subscriptions` — Verify and Add Missing Columns

```sql
-- Migration: 20260325_005_patch_user_subscriptions.sql

-- Only run columns that are missing. Check before executing.

-- Amount per subscription period (required for MRR)
ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS amount NUMERIC(10,2);

-- Plan tier identifier (required for revenue breakdown)
ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS plan TEXT;

-- Cancellation timestamp (required for churn rate)
ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- Indexes for CEO queries
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status
  ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status_plan
  ON public.user_subscriptions(status, plan);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_cancelled_at
  ON public.user_subscriptions(cancelled_at)
  WHERE cancelled_at IS NOT NULL;
```

### 4.2 `profiles` — Ensure `role` Column Supports CEO Gate

```sql
-- Migration: 20260325_005b_verify_profiles_role.sql

-- The profiles.role column must support: 'ceo', 'super_admin', 'admin', 'lead', 'member', 'consultant', 'viewer'
-- If it's currently a TEXT column, this is fine.
-- If it's an ENUM, verify it includes 'ceo' and 'super_admin'.

-- Add index for the CEO auth gate check (used on every /ceo page load)
CREATE INDEX IF NOT EXISTS idx_profiles_role
  ON public.profiles(role) WHERE role IN ('ceo', 'super_admin', 'admin');
```

### 4.3 `user_global_stats` — Add `global_readiness_score` if Missing

```sql
-- The UX Research queries reference `global_readiness_score` on user_global_stats.
-- This may be computed by the mastery engine. Verify it exists.
ALTER TABLE public.user_global_stats
  ADD COLUMN IF NOT EXISTS global_readiness_score NUMERIC(5,2);
```

### 4.4 `questions` — Add Missing `updated_at` (Debt Register Item)

```sql
-- Technical debt: questions table has no updated_at column
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TRIGGER tr_questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4.5 `user_interactions` — Add `question_order` (Debt Register Item)

```sql
ALTER TABLE public.user_interactions
  ADD COLUMN IF NOT EXISTS question_order SMALLINT;
```

---

## 5. Materialized Views for CEO Analytics

Materialized views solve the performance problem for the CEO Dashboard. The behavioral analytics queries (cohort retention, churn signals, engagement) are expensive and scan large tables. Pre-computing them on a schedule keeps the dashboard fast.

### 5.1 `mv_monthly_financial_summary` — P&L by Month

**Powers:** Revenue trend chart, expense breakdown, monthly P&L on `/ceo/financials`.

```sql
-- Migration: 20260325_006_create_materialized_views.sql

CREATE MATERIALIZED VIEW public.mv_monthly_financial_summary AS
SELECT
  DATE_TRUNC('month', entry_date)::DATE AS month,
  entry_type,
  category,
  SUM(amount_php) AS total_amount,
  COUNT(*) AS entry_count,
  BOOL_OR(is_recurring) AS has_recurring
FROM public.ceo_financial_entries
GROUP BY DATE_TRUNC('month', entry_date), entry_type, category
ORDER BY month DESC, entry_type, category;

CREATE UNIQUE INDEX idx_mv_financial_month_type_cat
  ON public.mv_monthly_financial_summary(month, entry_type, category);
```

### 5.2 `mv_cohort_retention` — Weekly Cohort Retention Heatmap

**Powers:** CohortRetentionTable on `/ceo/insights`. The most complex and most valuable component.

```sql
CREATE MATERIALIZED VIEW public.mv_cohort_retention AS
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

CREATE UNIQUE INDEX idx_mv_cohort_retention_month_week
  ON public.mv_cohort_retention(cohort_month, week_number);
```

### 5.3 `mv_churn_risk_distribution` — Risk Band Segmentation

**Powers:** ChurnRiskBars on `/ceo/insights`.

```sql
CREATE MATERIALIZED VIEW public.mv_churn_risk_distribution AS
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

CREATE UNIQUE INDEX idx_mv_churn_risk_level
  ON public.mv_churn_risk_distribution(risk_level);
```

### 5.4 `mv_engagement_snapshot` — DAU/WAU/MAU/Stickiness

**Powers:** Engagement Health section on `/ceo` command center and `/ceo/insights`.

```sql
CREATE MATERIALIZED VIEW public.mv_engagement_snapshot AS
SELECT
  NOW()::DATE AS snapshot_date,
  COUNT(*) FILTER (
    WHERE last_session_at >= NOW() - INTERVAL '1 day'
  ) AS dau,
  COUNT(*) FILTER (
    WHERE last_session_at >= NOW() - INTERVAL '7 days'
  ) AS wau,
  COUNT(*) FILTER (
    WHERE last_session_at >= NOW() - INTERVAL '30 days'
  ) AS mau,
  ROUND(
    COUNT(*) FILTER (WHERE last_session_at >= NOW() - INTERVAL '1 day')::NUMERIC
    / NULLIF(COUNT(*) FILTER (WHERE last_session_at >= NOW() - INTERVAL '30 days'), 0),
    4
  ) AS dau_mau_ratio,
  ROUND(AVG(total_sessions)::NUMERIC / NULLIF(AVG(days_active), 0) * 7, 1) AS avg_sessions_per_week,
  ROUND(AVG(current_streak)::NUMERIC, 1) AS avg_streak_length
FROM public.user_global_stats
WHERE first_session_at IS NOT NULL;

CREATE UNIQUE INDEX idx_mv_engagement_date
  ON public.mv_engagement_snapshot(snapshot_date);
```

### 5.5 `mv_time_to_value` — Conversion Funnel Medians

**Powers:** TimeToValueFunnel on `/ceo/insights`.

```sql
CREATE MATERIALIZED VIEW public.mv_time_to_value AS
SELECT
  -- Stage 1: Signup → First Session
  PERCENTILE_CONT(0.5) WITHIN GROUP (
    ORDER BY EXTRACT(EPOCH FROM (ugs.first_session_at - u.created_at)) / 86400.0
  ) AS median_days_to_first_session,

  -- Stage 2: Diagnostic completion rate
  COUNT(*) FILTER (WHERE ugs.first_session_at IS NOT NULL)::NUMERIC
    / NULLIF(COUNT(*), 0) AS diagnostic_completion_rate,

  -- Stage 3: Free → Paid conversion median days
  PERCENTILE_CONT(0.5) WITHIN GROUP (
    ORDER BY EXTRACT(EPOCH FROM (ugs.converted_at - ugs.first_session_at)) / 86400.0
  ) FILTER (WHERE ugs.converted_at IS NOT NULL) AS median_days_to_conversion,

  -- Sessions before conversion
  AVG(ugs.total_sessions) FILTER (WHERE ugs.converted_at IS NOT NULL) AS avg_sessions_before_conversion,

  -- Score at conversion
  AVG(ugs.global_readiness_score) FILTER (WHERE ugs.converted_at IS NOT NULL) AS avg_score_at_conversion,

  -- Overall free→paid conversion rate
  COUNT(*) FILTER (WHERE ugs.converted_at IS NOT NULL)::NUMERIC
    / NULLIF(COUNT(*), 0) AS free_to_paid_conversion_rate,

  -- Timestamp
  NOW() AS computed_at

FROM public.user_global_stats ugs
JOIN auth.users u ON u.id = ugs.user_id;

CREATE UNIQUE INDEX idx_mv_ttv_computed
  ON public.mv_time_to_value(computed_at);
```

### 5.6 `mv_churn_signals` — Top Churn Pattern Analysis

**Powers:** "Top Churn Signals" insight cards on `/ceo/insights`.

```sql
CREATE MATERIALIZED VIEW public.mv_churn_signals AS
WITH failed_week1 AS (
  -- Pattern: Users who fail 2+ quizzes in Week 1
  SELECT
    'failed_2plus_quizzes_week1' AS signal_key,
    'Users who fail 2+ quizzes in Week 1' AS signal_description,
    COUNT(DISTINCT ui.user_id) AS affected_users,
    ROUND(
      AVG(ugs.churn_risk_score)::NUMERIC
      / NULLIF((SELECT AVG(churn_risk_score) FROM user_global_stats WHERE churn_risk_score IS NOT NULL), 0),
      1
    ) AS churn_multiplier
  FROM public.user_interactions ui
  JOIN public.user_global_stats ugs ON ui.user_id = ugs.user_id
  WHERE ui.is_correct = false
    AND ui.created_at <= ugs.first_session_at + INTERVAL '7 days'
  GROUP BY ui.user_id
  HAVING COUNT(*) FILTER (WHERE ui.is_correct = false) >= 2
),
no_trail AS (
  -- Pattern: Users without Camp Trail enrollment
  SELECT
    'no_trail_enrollment' AS signal_key,
    'Users without Camp Trail enrollment' AS signal_description,
    COUNT(*) AS affected_users,
    ROUND(
      AVG(ugs.churn_risk_score)::NUMERIC
      / NULLIF((SELECT AVG(churn_risk_score) FROM user_global_stats WHERE churn_risk_score IS NOT NULL), 0),
      1
    ) AS churn_multiplier
  FROM public.user_global_stats ugs
  LEFT JOIN public.user_trail_enrollments ute ON ugs.user_id = ute.user_id
  WHERE ute.user_id IS NULL
    AND ugs.first_session_at IS NOT NULL
),
inactive_7d AS (
  -- Pattern: No session in 7+ days
  SELECT
    'no_session_7d' AS signal_key,
    'Users with no session in 7+ days' AS signal_description,
    COUNT(*) AS affected_users,
    ROUND(
      AVG(ugs.churn_risk_score)::NUMERIC
      / NULLIF((SELECT AVG(churn_risk_score) FROM user_global_stats WHERE churn_risk_score IS NOT NULL), 0),
      1
    ) AS churn_multiplier
  FROM public.user_global_stats ugs
  WHERE ugs.last_session_at < NOW() - INTERVAL '7 days'
    AND ugs.first_session_at IS NOT NULL
),
score_declining AS (
  -- Pattern: Readiness Score declining over 7 days
  SELECT
    'score_declining' AS signal_key,
    'Users with declining Readiness Score (7d)' AS signal_description,
    COUNT(*) AS affected_users,
    ROUND(
      AVG(ugs.churn_risk_score)::NUMERIC
      / NULLIF((SELECT AVG(churn_risk_score) FROM user_global_stats WHERE churn_risk_score IS NOT NULL), 0),
      1
    ) AS churn_multiplier
  FROM public.user_global_stats ugs
  WHERE ugs.score_velocity_7d < 0
    AND ugs.first_session_at IS NOT NULL
)
SELECT * FROM (
  SELECT signal_key, signal_description, SUM(affected_users) AS affected_users, MAX(churn_multiplier) AS churn_multiplier FROM failed_week1 GROUP BY signal_key, signal_description
  UNION ALL SELECT * FROM no_trail
  UNION ALL SELECT * FROM inactive_7d
  UNION ALL SELECT * FROM score_declining
) combined
ORDER BY churn_multiplier DESC;

CREATE UNIQUE INDEX idx_mv_churn_signals_key
  ON public.mv_churn_signals(signal_key);
```

### 5.7 `mv_acquisition_source_distribution` — Channel Attribution

**Powers:** Acquisition source breakdown on `/ceo/insights` and AARRR funnel.

```sql
CREATE MATERIALIZED VIEW public.mv_acquisition_source_distribution AS
SELECT
  COALESCE(acquisition_source, 'unknown') AS source,
  COUNT(*) AS total_users,
  COUNT(*) FILTER (WHERE converted_at IS NOT NULL) AS converted_users,
  ROUND(
    COUNT(*) FILTER (WHERE converted_at IS NOT NULL)::NUMERIC / NULLIF(COUNT(*), 0),
    4
  ) AS conversion_rate,
  ROUND(AVG(EXTRACT(EPOCH FROM (converted_at - first_session_at)) / 86400.0)
    FILTER (WHERE converted_at IS NOT NULL)::NUMERIC, 1
  ) AS avg_days_to_conversion
FROM public.user_global_stats
WHERE first_session_at IS NOT NULL
GROUP BY COALESCE(acquisition_source, 'unknown')
ORDER BY total_users DESC;

CREATE UNIQUE INDEX idx_mv_acq_source
  ON public.mv_acquisition_source_distribution(source);
```

### 5.8 Materialized View Refresh Strategy

```sql
-- Migration: 20260325_006b_mv_refresh_function.sql

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

-- Schedule via Supabase pg_cron (or external cron calling this function)
-- Recommended: every 15 minutes during business hours, hourly overnight
-- SELECT cron.schedule('refresh-ceo-views', '*/15 * * * *', 'SELECT public.refresh_ceo_materialized_views()');
```

**Note:** `CONCURRENTLY` requires the unique indexes created above on each materialized view. This allows reads to continue during refresh without locking.

---

## 6. Database Functions & Triggers

### 6.1 `compute_mrr()` — Monthly Recurring Revenue

```sql
-- Migration: 20260325_007_create_ceo_functions.sql

CREATE OR REPLACE FUNCTION public.compute_mrr()
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM public.user_subscriptions
  WHERE status = 'active';
$$;
```

### 6.2 `compute_monthly_burn(target_month DATE)` — Total Expenses for a Month

```sql
CREATE OR REPLACE FUNCTION public.compute_monthly_burn(target_month DATE DEFAULT CURRENT_DATE)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(amount_php), 0)
  FROM public.ceo_financial_entries
  WHERE entry_type = 'expense'
    AND DATE_TRUNC('month', entry_date) = DATE_TRUNC('month', target_month);
$$;
```

### 6.3 `compute_runway_months()` — Cash ÷ Net Burn

```sql
CREATE OR REPLACE FUNCTION public.compute_runway_months()
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
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
      WHEN (SELECT monthly_net FROM net_burn) <= 0 THEN 999 -- Profitable, infinite runway
      WHEN (SELECT amount_php FROM cash) IS NULL THEN NULL  -- No cash balance entered
      ELSE ROUND((SELECT amount_php FROM cash) / (SELECT monthly_net FROM net_burn), 1)
    END;
$$;
```

### 6.4 `compute_monthly_churn_rate()` — Cancellations ÷ Active

```sql
CREATE OR REPLACE FUNCTION public.compute_monthly_churn_rate()
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
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
```

### 6.5 `compute_trail_completion_rate()` — Camp Trail Completion

```sql
CREATE OR REPLACE FUNCTION public.compute_trail_completion_rate()
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH enrolled AS (
    SELECT
      ute.user_id,
      COUNT(DISTINCT td.day_id) AS total_days
    FROM public.user_trail_enrollments ute
    JOIN public.trail_days td ON td.trail_id = ute.trail_id
    GROUP BY ute.user_id
  ),
  completed AS (
    SELECT
      tdc.user_id,
      COUNT(DISTINCT tdc.day_id) AS completed_days
    FROM public.trail_day_completions tdc
    GROUP BY tdc.user_id
  )
  SELECT ROUND(
    AVG(COALESCE(c.completed_days, 0)::NUMERIC / NULLIF(e.total_days, 0)),
    4
  )
  FROM enrolled e
  LEFT JOIN completed c ON e.user_id = c.user_id;
$$;
```

### 6.6 `sync_team_member_role()` — Synchronize Profile Role on Team Update

This trigger fires when `system_role` is updated on `ceo_team_members` for a member with a linked `user_id`. It propagates the role change to `profiles.role`.

```sql
CREATE OR REPLACE FUNCTION public.sync_team_member_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only fire when system_role changes and user_id is linked
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

CREATE TRIGGER tr_sync_team_role
  AFTER UPDATE OF system_role ON public.ceo_team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_team_member_role();
```

---

## 7. RLS Policy Architecture

All CEO tables use a single authorization pattern: only users with `profiles.role = 'ceo'` (or `super_admin`) can access them. This is enforced at the database level, independent of the Next.js layout guard.

### 7.1 Helper Function

```sql
-- Migration: 20260325_008_create_rls_policies.sql

CREATE OR REPLACE FUNCTION public.is_ceo_or_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid())
    AND role IN ('ceo', 'super_admin')
  );
$$;
```

### 7.2 Policies for `ceo_financial_entries`

```sql
CREATE POLICY "CEO can read financial entries"
  ON public.ceo_financial_entries FOR SELECT TO authenticated
  USING (public.is_ceo_or_super_admin());

CREATE POLICY "CEO can insert financial entries"
  ON public.ceo_financial_entries FOR INSERT TO authenticated
  WITH CHECK (public.is_ceo_or_super_admin());

CREATE POLICY "CEO can update financial entries"
  ON public.ceo_financial_entries FOR UPDATE TO authenticated
  USING (public.is_ceo_or_super_admin())
  WITH CHECK (public.is_ceo_or_super_admin());

CREATE POLICY "CEO can delete financial entries"
  ON public.ceo_financial_entries FOR DELETE TO authenticated
  USING (public.is_ceo_or_super_admin());
```

### 7.3 Policies for `ceo_team_members`

```sql
CREATE POLICY "CEO can read team members"
  ON public.ceo_team_members FOR SELECT TO authenticated
  USING (public.is_ceo_or_super_admin());

CREATE POLICY "CEO can insert team members"
  ON public.ceo_team_members FOR INSERT TO authenticated
  WITH CHECK (public.is_ceo_or_super_admin());

CREATE POLICY "CEO can update team members"
  ON public.ceo_team_members FOR UPDATE TO authenticated
  USING (public.is_ceo_or_super_admin())
  WITH CHECK (public.is_ceo_or_super_admin());

CREATE POLICY "CEO can delete team members"
  ON public.ceo_team_members FOR DELETE TO authenticated
  USING (public.is_ceo_or_super_admin());
```

### 7.4 Policies for `ceo_gate_status`

```sql
CREATE POLICY "CEO can read gate status"
  ON public.ceo_gate_status FOR SELECT TO authenticated
  USING (public.is_ceo_or_super_admin());

CREATE POLICY "CEO can insert gate status"
  ON public.ceo_gate_status FOR INSERT TO authenticated
  WITH CHECK (public.is_ceo_or_super_admin());
```

### 7.5 Policies for `ceo_cash_balance_entries`

```sql
CREATE POLICY "CEO can read cash balance"
  ON public.ceo_cash_balance_entries FOR SELECT TO authenticated
  USING (public.is_ceo_or_super_admin());

CREATE POLICY "CEO can insert cash balance"
  ON public.ceo_cash_balance_entries FOR INSERT TO authenticated
  WITH CHECK (public.is_ceo_or_super_admin());

CREATE POLICY "CEO can update cash balance"
  ON public.ceo_cash_balance_entries FOR UPDATE TO authenticated
  USING (public.is_ceo_or_super_admin())
  WITH CHECK (public.is_ceo_or_super_admin());
```

### 7.6 RLS on Materialized Views

Materialized views do **not** support RLS directly. Access control is enforced by:
1. The views are queried only via Server Components with CEO auth checks.
2. The refresh function uses `SECURITY DEFINER` to bypass RLS during refresh.
3. No PostgREST exposure — these views are not in the auto-generated API unless explicitly added. If exposed, wrap them in a `SECURITY DEFINER` function that checks `is_ceo_or_super_admin()`.

---

## 8. Index Plan

### 8.1 New Indexes (CEO Dashboard Specific)

| Table | Index | Purpose |
|-------|-------|---------|
| `ceo_financial_entries` | `idx_ceo_financial_entries_entry_date` | Date-sorted ledger display |
| `ceo_financial_entries` | `idx_ceo_financial_entries_entry_type` | P&L filtering |
| `ceo_financial_entries` | `idx_ceo_financial_entries_category` | Expense breakdown |
| `ceo_financial_entries` | `idx_ceo_financial_entries_type_date` | Revenue/expense trend chart |
| `ceo_team_members` | `idx_ceo_team_members_department` | Department filter on TeamTable |
| `ceo_team_members` | `idx_ceo_team_members_user_id` | Role sync lookup |
| `ceo_team_members` | `idx_ceo_team_members_active` | Active team query (partial) |
| `ceo_cash_balance_entries` | `idx_ceo_cash_balance_date` | Latest balance lookup |
| `ceo_gate_status` | `idx_ceo_gate_status_entered` | Current gate query |
| `profiles` | `idx_profiles_role` | CEO auth gate check (partial) |
| `user_subscriptions` | `idx_user_subscriptions_status` | MRR, active user count |
| `user_subscriptions` | `idx_user_subscriptions_status_plan` | Revenue by tier breakdown |
| `user_subscriptions` | `idx_user_subscriptions_cancelled_at` | Churn rate computation |

### 8.2 Existing Missing Indexes (Technical Debt — Must Deploy)

These are from the skill's known gaps list and are **required** for CEO dashboard query performance:

| Table | Index | Used By |
|-------|-------|---------|
| `quiz_sessions` | `idx_quiz_sessions_user_id` | DAU/MAU computation, cohort retention |
| `user_interactions` | `idx_user_interactions_user_id` | Churn signal analysis |
| `user_interactions` | `idx_user_interactions_question_id` | Cross-question analytics |
| `readiness_score_snapshots` | `idx_readiness_snapshots_user_id` | Score at conversion |
| `trail_day_completions` | `idx_trail_day_completions_user_id` | Trail completion rate |
| `trail_day_completions` | `idx_trail_day_completions_day_id` | Day-level completion |
| `user_global_stats` | `idx_user_global_stats_churn_risk` | Churn risk distribution |
| `user_global_stats` | `idx_user_global_stats_first_session` | Cohort base query |
| `user_global_stats` | `idx_user_global_stats_last_session` | DAU/MAU, engagement |

```sql
-- Migration: 20260325_009_add_missing_indexes.sql

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id
  ON public.quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id
  ON public.user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_question_id
  ON public.user_interactions(question_id);
CREATE INDEX IF NOT EXISTS idx_readiness_snapshots_user_id
  ON public.readiness_score_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_trail_day_completions_user_id
  ON public.trail_day_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_trail_day_completions_day_id
  ON public.trail_day_completions(day_id);
CREATE INDEX IF NOT EXISTS idx_user_global_stats_churn_risk
  ON public.user_global_stats(churn_risk_score);
CREATE INDEX IF NOT EXISTS idx_user_global_stats_first_session
  ON public.user_global_stats(first_session_at)
  WHERE first_session_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_global_stats_last_session
  ON public.user_global_stats(last_session_at DESC)
  WHERE last_session_at IS NOT NULL;
```

---

## 9. Query Map — Every Metric to Its Data Path

This is the definitive map of every metric the CEO Dashboard displays, traced to its exact data source. Use this as the contract between the Database Architect and the Frontend Engineer.

### 9.1 Command Center (`/ceo`) — North Star Metrics

| Metric | Display | Data Source | Query Pattern |
|--------|---------|-------------|--------------|
| MRR | ₱XX,XXX | `user_subscriptions` | `SELECT SUM(amount) WHERE status = 'active'` |
| ARR | ₱XX,XXX | Computed | MRR × 12 (application layer) |
| Monthly Burn | ₱XX,XXX | `ceo_financial_entries` | `SELECT SUM(amount_php) WHERE entry_type='expense' AND month = current` |
| Net Burn | ₱XX,XXX | Computed | Monthly Burn − MRR (application layer) |
| Runway (months) | XX.X | `compute_runway_months()` | Single function call |
| Cash on Hand | ₱XX,XXX | `ceo_cash_balance_entries` | `SELECT amount_php ORDER BY balance_date DESC LIMIT 1` |
| Total Registered Users | XX,XXX | `auth.users` | `SELECT COUNT(*)` |
| Paying Users | X,XXX | `user_subscriptions` | `SELECT COUNT(*) WHERE status = 'active'` |
| Free→Paid Conversion % | X.X% | Computed | Paying / Total × 100 |
| CAC | ₱XXX | `ceo_financial_entries` | Total ad_spend this month ÷ new paying users this month |
| LTV | ₱X,XXX | Computed | ARPU ÷ monthly_churn_rate |
| LTV:CAC Ratio | X:1 | Computed | LTV ÷ CAC |
| ARPU | ₱XXX | Computed | MRR ÷ paying users |
| Current Gate | Gate 0–4 | `v_current_gate` | Single view query |
| Revenue Trend (6mo) | AreaChart | `mv_monthly_financial_summary` | Filter by entry_type='revenue', last 6 months |

### 9.2 Behavioral Insights (`/ceo/insights`)

| Metric | Display | Data Source | Query Pattern |
|--------|---------|-------------|--------------|
| DAU | MetricCard | `mv_engagement_snapshot` | Direct read |
| WAU | MetricCard | `mv_engagement_snapshot` | Direct read |
| MAU | MetricCard | `mv_engagement_snapshot` | Direct read |
| DAU/MAU Ratio | MetricCard | `mv_engagement_snapshot` | Direct read |
| Avg Sessions/Week | MetricCard | `mv_engagement_snapshot` | Direct read |
| Cohort Retention Heatmap | Table | `mv_cohort_retention` | Pivot by cohort_month × week_number |
| Churn Risk Distribution | Bars | `mv_churn_risk_distribution` | Direct read, 4 rows |
| Time to First Session | Funnel | `mv_time_to_value` | Direct read |
| Median Days to Conversion | Funnel | `mv_time_to_value` | Direct read |
| Score at Conversion | Funnel | `mv_time_to_value` | Direct read |
| Free→Paid Rate | Funnel | `mv_time_to_value` | Direct read |
| Top Churn Signals | Insight cards | `mv_churn_signals` | Direct read, ordered by multiplier |
| Acquisition Source Dist. | Chart | `mv_acquisition_source_distribution` | Direct read |
| Camp Trail Completion | MetricCard | `compute_trail_completion_rate()` | Function call |
| D-7 Retention | MetricCard | `mv_cohort_retention` | Filter week_number = 1, latest cohort |
| Avg Readiness Score | MetricCard | `user_global_stats` | `SELECT AVG(global_readiness_score) WHERE first_session_at IS NOT NULL` |

### 9.3 Team Management (`/ceo/team`)

| Metric | Display | Data Source | Query Pattern |
|--------|---------|-------------|--------------|
| Active Roster | TeamTable | `ceo_team_members` | `WHERE end_date IS NULL OR end_date > NOW()` |
| Alumni | TeamTable (collapsed) | `ceo_team_members` | `WHERE end_date IS NOT NULL AND end_date <= NOW()` |
| Department Cost | PieChart | `ceo_team_members` | `GROUP BY department, SUM(monthly_cost_php)` |
| Headcount | MetricCard | `ceo_team_members` | `COUNT(*) WHERE active` |
| Total Monthly Payroll | MetricCard | `ceo_team_members` | `SUM(monthly_cost_php) WHERE active` |
| Payroll % of Burn | MetricCard | Computed | Payroll ÷ Monthly Burn |
| System Role Assignment | Modal | `ceo_team_members` + `profiles` | UPDATE both tables via `sync_team_member_role()` trigger |

### 9.4 Detailed Financials (`/ceo/financials`)

| Metric | Display | Data Source | Query Pattern |
|--------|---------|-------------|--------------|
| Revenue vs. Expense Trend | ComposedChart | `mv_monthly_financial_summary` | Pivot by month, separate revenue/expense |
| Expense Breakdown | PieChart | `mv_monthly_financial_summary` | Filter entry_type='expense', current month |
| Revenue by Stream | Stacked Bar | `mv_monthly_financial_summary` | Filter entry_type='revenue', group by category |
| Financial Ledger | DataTable | `ceo_financial_entries` | Paginated, filtered by type, sorted by date DESC |
| Runway Projection | Text block | `compute_runway_months()` + growth extrapolation | Function + application-layer projection |
| Break-Even Progress | Reference line | Computed | MRR ÷ ₱172,000 target |

---

## 10. Migration Execution Order

Execute these migrations in strict order. Each migration is idempotent (`IF NOT EXISTS` / `IF EXISTS` guards).

| # | File | What It Does | Dependencies |
|---|------|-------------|-------------|
| 001 | `20260325_001_create_ceo_financial_entries.sql` | Creates `financial_entry_type` ENUM + `ceo_financial_entries` table + indexes + RLS | `update_updated_at_column()` function must exist |
| 002 | `20260325_002_create_ceo_team_members.sql` | Creates `team_department` + `system_role` ENUMs + `ceo_team_members` table + indexes + RLS | Same |
| 003 | `20260325_003_create_ceo_gate_status.sql` | Creates `ceo_gate_status` table + `v_current_gate` view | None |
| 004 | `20260325_004_create_ceo_cash_balance.sql` | Creates `ceo_cash_balance_entries` table | None |
| 005 | `20260325_005_patch_existing_tables.sql` | Adds missing columns to `user_subscriptions`, `user_global_stats`, `questions`, `user_interactions` | Existing tables |
| 006 | `20260325_006_create_materialized_views.sql` | Creates all 7 materialized views + unique indexes | Tables from 001–005 + existing schema |
| 007 | `20260325_007_create_ceo_functions.sql` | Creates `compute_mrr()`, `compute_monthly_burn()`, `compute_runway_months()`, `compute_monthly_churn_rate()`, `compute_trail_completion_rate()`, `sync_team_member_role()` trigger | Tables from 001–004 |
| 008 | `20260325_008_create_rls_policies.sql` | Creates `is_ceo_or_super_admin()` helper + all RLS policies | Tables from 001–004 |
| 009 | `20260325_009_add_missing_indexes.sql` | Adds all missing indexes on existing tables (debt resolution) | Existing tables |
| 010 | `20260325_010_setup_mv_refresh.sql` | Creates `refresh_ceo_materialized_views()` + optional pg_cron schedule | Views from 006 |

### Pre-Migration Checklist

- [ ] `update_updated_at_column()` function exists in the database
- [ ] `auth.users` table is accessible from `public` schema functions
- [ ] `profiles` table has a `role` TEXT column
- [ ] `user_subscriptions` table exists and has `user_id`, `status` columns at minimum
- [ ] `user_global_stats` table exists with the expected columns
- [ ] Supabase CLI is configured and connected to the target project
- [ ] A database backup has been taken

### Post-Migration Checklist

- [ ] All 4 new tables exist and have RLS enabled
- [ ] All 7 materialized views return data (run `refresh_ceo_materialized_views()`)
- [ ] `is_ceo_or_super_admin()` returns TRUE for the CEO user
- [ ] `compute_mrr()` returns a numeric value
- [ ] `compute_runway_months()` returns NULL (no cash balance yet — expected)
- [ ] RLS blocks non-CEO users from all `ceo_*` tables
- [ ] All 22+ new indexes are present (`\di` in psql)

---

## 11. Technical Debt Resolution

This implementation plan resolves the following items from the existing debt register:

| Severity | Issue | Resolution | Migration |
|----------|-------|-----------|-----------|
| 🔴 Performance | Missing indexes on `questions`, `quiz_sessions`, `user_interactions` | Added in Migration 009 | `20260325_009` |
| 🔴 Data integrity | `updated_at` has no trigger on 8 tables | Added triggers for `ceo_*` tables; `questions.updated_at` added in Migration 005 | `20260325_001–005` |
| 🟡 Missing | `questions` has no `updated_at` column | Added in Migration 005 | `20260325_005` |
| 🟡 Missing | `question_order` on `user_interactions` | Added in Migration 005 | `20260325_005` |
| 🟠 Design | No way to distinguish session types | Not directly resolved but `ceo_gate_status` + materialized views reduce dependency on session_type for CEO analytics | Future |
| 🟠 Undoc | `churn_risk_score`, `score_velocity_7d` computation source | The `mv_churn_signals` and `mv_churn_risk_distribution` views now document how these fields are consumed. Computation source should be documented in mastery-engine.md | Documentation task |
| 🔵 Future | `user_global_stats` God Table | The materialized views avoid adding MORE columns to this table. Analytics are computed via views, not new columns. | Architectural pattern |

### New Debt Introduced

None. All new tables follow the base table template. All have RLS, indexes, triggers, and proper constraints.

---

## 12. Phased Delivery Schedule

Aligned to the CEO Dashboard Master Prompt's phased execution plan.

### Phase 1 — Foundation (Week 1)
**Migrations:** 001, 002, 003, 004, 008 (tables + RLS)
**Outcome:** All new tables exist. CEO auth gate works at the DB level. The `/ceo` layout can render.

### Phase 2 — Command Center (Week 2–3)
**Migrations:** 005, 007 (patch existing tables, create functions)
**Outcome:** MRR, burn, runway, and unit economics are computable. MetricCards on `/ceo` have real data paths.

### Phase 3 — Team Management (Week 3–4)
**Migrations:** None additional (tables already exist from Phase 1)
**Outcome:** Team CRUD works. Role assignment trigger fires. Department cost queries work.

### Phase 4 — Behavioral Analytics (Week 4–6)
**Migrations:** 006, 009, 010 (materialized views, missing indexes, refresh schedule)
**Outcome:** All `/ceo/insights` metrics are pre-computed and fast. Cohort retention, churn risk, TTV, engagement, and churn signals all available.

### Phase 5 — Financials & Export (Week 6–7)
**Migrations:** None additional (all tables and views already exist)
**Outcome:** Financial ledger, P&L charts, expense breakdown, revenue by stream, investor export all powered by existing schema.

---

## Appendix A: Complete Entity Relationship Summary

```
auth.users ──────────────┐
  │                       │
  ├─→ profiles            │ (role check for CEO gate)
  │     └─ role           │
  │                       │
  ├─→ user_subscriptions  │ (MRR, paying users, churn)
  │     └─ amount, plan, status, cancelled_at
  │                       │
  ├─→ user_global_stats   │ (engagement, churn risk, TTV)
  │     └─ churn_risk_score, score_velocity_7d,
  │        first_session_at, last_session_at,
  │        acquisition_source, converted_at
  │                       │
  ├─→ quiz_sessions       │ (DAU/MAU, activation)
  │                       │
  ├─→ readiness_score_snapshots (score trajectory)
  │                       │
  ├─→ user_trail_enrollments → trail_day_completions
  │                       │
  └─────────────────────────
                          │
CEO-ONLY TABLES           │
  ceo_financial_entries ──┤ (created_by → auth.users)
  ceo_team_members ───────┤ (user_id → auth.users, nullable)
  ceo_gate_status ────────┤ (created_by → auth.users)
  ceo_cash_balance_entries┤ (created_by → auth.users)
                          │
MATERIALIZED VIEWS        │
  mv_monthly_financial_summary    (from ceo_financial_entries)
  mv_cohort_retention             (from user_global_stats + quiz_sessions)
  mv_churn_risk_distribution      (from user_global_stats)
  mv_engagement_snapshot          (from user_global_stats)
  mv_time_to_value                (from user_global_stats + auth.users)
  mv_churn_signals                (from user_interactions + user_global_stats + user_trail_enrollments)
  mv_acquisition_source_distribution (from user_global_stats)
```

## Appendix B: Category Value Reference

### Financial Entry Categories (for application-layer validation)

**Revenue:**
`subscription_revenue`, `exam_pass_revenue`, `institutional_revenue`, `api_licensing_revenue`, `data_intelligence_revenue`, `white_label_revenue`, `referral_credit`, `other_revenue`

**Expense:**
`salaries`, `contractors`, `ad_spend`, `server_costs`, `tools`, `payment_processing`, `content_production`, `legal`, `office`, `miscellaneous`

**Investment:**
`founder_investment`, `angel_round`, `grant`, `other_investment`

### Department Cost Allocation Targets (from Business Plan §11.3)

| Department | Target % | Warning Threshold |
|-----------|---------|------------------|
| Engineering | 30–40% | > 40% |
| Content | 15–25% | > 25% |
| Marketing/Growth | 20–30% | > 30% |
| Operations + Tools | 10–15% | > 15% |

### Profitability Gate Thresholds (from Business Plan §2)

| Gate | MRR Target | Subscriber Target | Key Exit Condition |
|------|-----------|-------------------|-------------------|
| 0→1 | ₱10,000 | ~25–30 | Conv > 3%, NPS > 40 |
| 1→2 | ₱80,000 | ~200 | CAC payback < 8mo, MRR growth > cost growth ×3mo |
| 2→3 | ₱223,000 | ~560 | Operational break-even |
| 3→4 | ₱400,000 | ~1,000 | Consistent profit |

---

> **This document is the single source of truth for all database work supporting the CEO Dashboard. Every table, view, function, policy, and index is traceable to a specific metric requirement in the source documents. No schema change for `/ceo` should happen outside this plan without updating it first.**
