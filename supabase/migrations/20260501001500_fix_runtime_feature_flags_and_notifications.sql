-- Runtime cleanup for launch entitlement and notification drift observed on 2026-05-01.
-- Keeps the source-of-truth vocabulary aligned with src/lib/entitlements/feature-keys.ts
-- and src/types/notifications.ts so dashboard startup does not emit false config errors.

-- 1. Merge legacy feature flag aliases into the canonical launch keys, then remove
-- aliases that are no longer read by application code.
WITH aliases(legacy_key, canonical_key, canonical_description) AS (
  VALUES
    ('live_readiness_score', 'readiness_score_live', 'Live readiness score access'),
    ('full_heatmap', 'taxonomy_heatmap_full', 'Full taxonomy heatmap access'),
    ('trail_library', 'camp_trails_full_library', 'Full Camp Trails library access'),
    ('unlimited_questions', 'questions_unlimited', 'Unlimited quiz questions'),
    ('blindspot_protocol', 'focus_review_protocol', 'Focus review protocol access'),
    ('proof_simulation', 'full_exam', 'Full exam simulation access'),
    ('proof_simulation_enabled', 'full_exam_enabled', 'Full exam mode feature toggle')
), legacy_rows AS (
  SELECT
    aliases.legacy_key,
    aliases.canonical_key,
    COALESCE(NULLIF(feature_flags.description, ''), aliases.canonical_description) AS description,
    feature_flags.enabled,
    COALESCE(feature_flags.target_tier, '{}'::text[]) AS target_tier
  FROM aliases
  JOIN public.feature_flags ON feature_flags.key = aliases.legacy_key
)
INSERT INTO public.feature_flags (key, description, enabled, target_tier)
SELECT canonical_key, description, enabled, target_tier
FROM legacy_rows
ON CONFLICT (key) DO UPDATE
SET
  description = COALESCE(public.feature_flags.description, EXCLUDED.description),
  enabled = public.feature_flags.enabled OR EXCLUDED.enabled,
  target_tier = ARRAY(
    SELECT DISTINCT tier
    FROM unnest(
      COALESCE(public.feature_flags.target_tier, '{}'::text[])
      || COALESCE(EXCLUDED.target_tier, '{}'::text[])
    ) AS tier
    ORDER BY tier
  ),
  updated_at = now();

DELETE FROM public.feature_flags
WHERE key IN (
  'live_readiness_score',
  'full_heatmap',
  'trail_library',
  'unlimited_questions',
  'blindspot_protocol',
  'proof_simulation',
  'proof_simulation_enabled',
  'additional_grace_days',
  'wiki_ei_prompts'
);

-- 2. Canonicalize notification vocabulary from the retired blindspot label to the
-- current focus_review product language used by dashboard sync code.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'notification_type'
      AND e.enumlabel = 'blindspot'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'notification_type'
      AND e.enumlabel = 'focus_review'
  ) THEN
    ALTER TYPE public.notification_type RENAME VALUE 'blindspot' TO 'focus_review';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'notification_type'
      AND e.enumlabel = 'blindspot'
  ) AND EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'notification_type'
      AND e.enumlabel = 'focus_review'
  ) THEN
    EXECUTE 'UPDATE public.notifications SET type = ''focus_review''::public.notification_type WHERE type = ''blindspot''::public.notification_type';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'notification_preferences'
      AND column_name = 'blindspot'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'notification_preferences'
      AND column_name = 'focus_review'
  ) THEN
    ALTER TABLE public.notification_preferences RENAME COLUMN blindspot TO focus_review;
  ELSIF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'notification_preferences'
      AND column_name = 'blindspot'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'notification_preferences'
      AND column_name = 'focus_review'
  ) THEN
    UPDATE public.notification_preferences
    SET focus_review = focus_review OR blindspot;

    ALTER TABLE public.notification_preferences DROP COLUMN blindspot;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'notification_preferences'
      AND column_name = 'focus_review'
  ) THEN
    ALTER TABLE public.notification_preferences ADD COLUMN focus_review boolean NOT NULL DEFAULT true;
  END IF;
END $$;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.notification_preferences TO authenticated;
GRANT SELECT ON public.notification_preferences TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO service_role;

DROP POLICY IF EXISTS "Users can select own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can select own preferences" ON public.notification_preferences;
CREATE POLICY "Users can select own preferences"
  ON public.notification_preferences FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON public.notification_preferences;
CREATE POLICY "Users can insert own preferences"
  ON public.notification_preferences FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON public.notification_preferences;
CREATE POLICY "Users can update own preferences"
  ON public.notification_preferences FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

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
  v_pref_column := CASE p_type
    WHEN 'score_change'    THEN 'score_changes'
    WHEN 'trail_ready'     THEN 'trail_ready'
    WHEN 'focus_review'    THEN 'focus_review'
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

  EXECUTE format(
    'SELECT COALESCE(
       (SELECT %I FROM public.notification_preferences WHERE user_id = $1),
       true
     )',
    v_pref_column
  ) INTO v_is_enabled USING p_user_id;

  IF NOT v_is_enabled THEN RETURN NULL; END IF;

  IF p_type NOT IN ('billing', 'system') THEN
    SELECT COUNT(*) INTO v_daily_count
    FROM public.notifications
    WHERE user_id = p_user_id
      AND created_at >= (now() AT TIME ZONE 'Asia/Manila')::date::timestamptz
      AND type NOT IN ('billing', 'system');

    IF v_daily_count >= 3 THEN RETURN NULL; END IF;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, body, metadata)
  VALUES (p_user_id, p_type, p_title, p_body, p_metadata)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_notification(UUID, public.notification_type, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_notification(UUID, public.notification_type, TEXT, TEXT, JSONB) TO authenticated, service_role;
