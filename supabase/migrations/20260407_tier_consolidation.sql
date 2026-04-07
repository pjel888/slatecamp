-- Migration: 20260407_tier_consolidation.sql (applied as tier_consolidation_v2)
-- Purpose: Consolidate subscription_tier enum to strict 5-tier model
-- Target: free | pro | prime | institutional | enterprise
-- Removes: 'camp' (test mode, not a tier), 'insurance' (legacy typo)
-- Applied: 2026-04-07

-- ============================================================================
-- 1. MIGRATE EXISTING DATA (before enum change)
-- ============================================================================

UPDATE public.user_subscriptions SET tier = 'free' WHERE tier = 'camp';
UPDATE public.user_subscriptions SET tier = 'institutional' WHERE tier = 'insurance';

-- ============================================================================
-- 2. DROP DEPENDENT VIEWS (required before altering column type)
-- ============================================================================

DROP MATERIALIZED VIEW IF EXISTS mv_time_to_value;
DROP VIEW IF EXISTS user_capabilities;

-- ============================================================================
-- 3. RECREATE ENUM WITH STRICT 5-TIER VALUES
-- ============================================================================

ALTER TYPE public.subscription_tier RENAME TO subscription_tier_old;

CREATE TYPE public.subscription_tier AS ENUM (
  'free', 'pro', 'prime', 'institutional', 'enterprise'
);

ALTER TABLE public.user_subscriptions
  ALTER COLUMN tier DROP DEFAULT,
  ALTER COLUMN tier TYPE public.subscription_tier
    USING tier::TEXT::public.subscription_tier,
  ALTER COLUMN tier SET DEFAULT 'free'::public.subscription_tier;

DROP TYPE public.subscription_tier_old;

-- ============================================================================
-- 4. RECREATE DEPENDENT VIEWS
-- ============================================================================

CREATE OR REPLACE VIEW user_capabilities AS
SELECT
  p.id AS user_id,
  au.email,
  COALESCE(us.tier::TEXT, 'free') AS subscription_tier,
  COALESCE(us.status::TEXT, 'active') AS subscription_status,
  ur.role AS user_role
FROM profiles p
JOIN auth.users au ON p.id = au.id
LEFT JOIN user_subscriptions us ON p.id = us.user_id
LEFT JOIN user_roles ur ON p.id = ur.user_id;

CREATE MATERIALIZED VIEW mv_time_to_value AS
SELECT
  percentile_cont(0.5) WITHIN GROUP (ORDER BY (EXTRACT(epoch FROM ugs.first_session_at - u.created_at) / 86400.0)) AS median_days_to_first_session,
  count(*) FILTER (WHERE ugs.first_session_at IS NOT NULL)::numeric / NULLIF(count(*), 0)::numeric AS diagnostic_completion_rate,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY (EXTRACT(epoch FROM us.created_at - ugs.first_session_at) / 86400.0)) FILTER (WHERE us.user_id IS NOT NULL AND us.tier::text <> 'free') AS median_days_to_conversion,
  0::numeric AS avg_sessions_before_conversion,
  avg(ugs.global_readiness_score) FILTER (WHERE us.user_id IS NOT NULL AND us.tier::text <> 'free') AS avg_score_at_conversion,
  count(*) FILTER (WHERE us.user_id IS NOT NULL AND us.tier::text <> 'free')::numeric / NULLIF(count(*), 0)::numeric AS free_to_paid_conversion_rate,
  now() AS computed_at
FROM user_global_stats ugs
JOIN auth.users u ON u.id = ugs.user_id
LEFT JOIN user_subscriptions us ON us.user_id = ugs.user_id AND us.tier::text <> 'free';
