-- ============================================================
-- NOTIFICATIONS SYSTEM
-- Tables: notifications, notification_preferences
-- Helper: create_notification() — respects prefs + daily cap
-- ============================================================

-- Step 1: Create notification_type enum
CREATE TYPE public.notification_type AS ENUM (
  'score_change',
  'trail_ready',
  'blindspot',
  'zone_transition',
  'proof_unlocked',
  'campfire_story',
  'campfire_reply',
  'content_update',
  'weekly_digest',
  'coaching_tip',
  'billing',
  'system'
);

-- Step 2: Create notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Step 3: Indexes
CREATE INDEX idx_notifications_user_created
  ON public.notifications (user_id, created_at DESC);

CREATE INDEX idx_notifications_user_unread
  ON public.notifications (user_id)
  WHERE read_at IS NULL;

CREATE INDEX idx_notifications_created_at
  ON public.notifications (created_at);

-- Step 4: RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Service can insert notifications"
  ON public.notifications FOR INSERT TO service_role
  WITH CHECK (true);

-- Step 5: updated_at trigger
CREATE TRIGGER tr_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- NOTIFICATION PREFERENCES TABLE
-- ============================================================

CREATE TABLE public.notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  score_changes BOOLEAN NOT NULL DEFAULT true,
  trail_ready BOOLEAN NOT NULL DEFAULT true,
  blindspot BOOLEAN NOT NULL DEFAULT true,
  milestones BOOLEAN NOT NULL DEFAULT true,
  campfire BOOLEAN NOT NULL DEFAULT true,
  content_updates BOOLEAN NOT NULL DEFAULT true,
  weekly_digest BOOLEAN NOT NULL DEFAULT true,
  coaching_tips BOOLEAN NOT NULL DEFAULT false,
  billing BOOLEAN NOT NULL DEFAULT true,
  daily_digest BOOLEAN NOT NULL DEFAULT false,
  quiet_hours_start TIME DEFAULT NULL,
  quiet_hours_end TIME DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notification_preferences_user_id
  ON public.notification_preferences (user_id);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own preferences"
  ON public.notification_preferences FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.notification_preferences FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.notification_preferences FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Service can select all preferences"
  ON public.notification_preferences FOR SELECT TO service_role
  USING (true);

CREATE TRIGGER tr_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- HELPER: create_notification()
-- Called by Server Actions / Edge Functions
-- Respects user preferences and daily cap (max 3/day)
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type public.notification_type,
  p_title TEXT,
  p_body TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_is_enabled BOOLEAN := true;
  v_daily_count INTEGER;
  v_pref_column TEXT;
BEGIN
  -- 1. Map type to preference column
  v_pref_column := CASE p_type
    WHEN 'score_change'    THEN 'score_changes'
    WHEN 'trail_ready'     THEN 'trail_ready'
    WHEN 'blindspot'       THEN 'blindspot'
    WHEN 'zone_transition' THEN 'milestones'
    WHEN 'proof_unlocked'  THEN 'milestones'
    WHEN 'campfire_story'  THEN 'campfire'
    WHEN 'campfire_reply'  THEN 'campfire'
    WHEN 'content_update'  THEN 'content_updates'
    WHEN 'weekly_digest'   THEN 'weekly_digest'
    WHEN 'coaching_tip'    THEN 'coaching_tips'
    WHEN 'billing'         THEN 'billing'
    WHEN 'system'          THEN 'billing'
  END;

  -- 2. Check preferences (default true if no row)
  EXECUTE format(
    'SELECT COALESCE(
       (SELECT %I FROM public.notification_preferences WHERE user_id = $1),
       true
     )',
    v_pref_column
  ) INTO v_is_enabled USING p_user_id;

  IF NOT v_is_enabled THEN RETURN NULL; END IF;

  -- 3. Daily cap: max 3/day (excludes billing/system)
  IF p_type NOT IN ('billing', 'system') THEN
    SELECT COUNT(*) INTO v_daily_count
    FROM public.notifications
    WHERE user_id = p_user_id
      AND created_at >= (now() AT TIME ZONE 'Asia/Manila')::date::timestamptz
      AND type NOT IN ('billing', 'system');

    IF v_daily_count >= 3 THEN RETURN NULL; END IF;
  END IF;

  -- 4. Insert
  INSERT INTO public.notifications (user_id, type, title, body, metadata)
  VALUES (p_user_id, p_type, p_title, p_body, p_metadata)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_notification FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_notification TO service_role;
