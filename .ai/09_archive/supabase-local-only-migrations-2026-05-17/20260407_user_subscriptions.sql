-- Migration: 20260407_user_subscriptions.sql
-- Purpose: Ensure user_subscriptions table exists with correct enums, RLS, and indexes
-- Safe for both fresh DBs and existing DBs where the table was created via dashboard/seed

-- ============================================================================
-- 1. ENUM TYPES (safe creation — IF NOT EXISTS not supported for types, use DO block)
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'expired', 'trialing');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.subscription_tier AS ENUM ('free', 'pro', 'enterprise');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add the app's actual tier values (UserTier: 'camp', 'insurance', 'institutional')
-- Postgres allows extending enums safely
DO $$ BEGIN
  ALTER TYPE public.subscription_tier ADD VALUE IF NOT EXISTS 'camp';
  ALTER TYPE public.subscription_tier ADD VALUE IF NOT EXISTS 'insurance';
  ALTER TYPE public.subscription_tier ADD VALUE IF NOT EXISTS 'institutional';
END $$;

-- ============================================================================
-- 2. TABLE (safe creation)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  subscription_id          UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier                     public.subscription_tier NOT NULL DEFAULT 'free',
  status                   public.subscription_status NOT NULL DEFAULT 'active',
  amount                   NUMERIC(10,2),
  email_notifications_enabled  BOOLEAN DEFAULT TRUE,
  marketing_emails_enabled     BOOLEAN DEFAULT FALSE,
  lemon_squeezy_customer_id    TEXT,
  lemon_squeezy_subscription_id TEXT,
  payrex_customer_id       TEXT,
  payrex_reference         TEXT,
  free_questions_today     INTEGER NOT NULL DEFAULT 0,
  free_cap_reset_date      DATE,
  converted_from_source    TEXT,
  trial_started_at         TIMESTAMPTZ,
  readiness_score_at_conversion DOUBLE PRECISION,
  cancelled_at             TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraint on user_id (required for bootstrap upsert onConflict: 'user_id')
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_user_id
ON public.user_subscriptions (user_id);

-- ============================================================================
-- 3. PERFORMANCE INDEXES (based on query audit — 26 files, 21 SELECTs)
-- ============================================================================

-- Most common query pattern: WHERE user_id = ? AND status = 'active'
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status
ON public.user_subscriptions (user_id, status);

-- CEO financial queries: WHERE status = 'active' (aggregate amounts)
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_active
ON public.user_subscriptions (status)
WHERE status = 'active';

-- Churn tracking: WHERE status = 'cancelled'
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_cancelled
ON public.user_subscriptions (cancelled_at)
WHERE status = 'cancelled';

-- ============================================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscription
CREATE POLICY "Users can read own subscription"
ON public.user_subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own email preferences only
CREATE POLICY "Users can update own email preferences"
ON public.user_subscriptions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can read all subscriptions (for CEO dashboard, admin panels)
CREATE POLICY "Admins can read all subscriptions"
ON public.user_subscriptions FOR SELECT
TO authenticated
USING (public.has_admin_role());

-- Service role handles webhook updates + bootstrap inserts (bypasses RLS)

-- ============================================================================
-- 5. UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_user_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER trg_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_user_subscriptions_updated_at();
