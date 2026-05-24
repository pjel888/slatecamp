-- Resolve exposed helper SECURITY DEFINER RPC warnings by moving helper logic
-- out of the exposed public API schema. These helpers are still available to
-- RLS policies and server-side SECURITY DEFINER functions, but no longer
-- callable through /rest/v1/rpc/* by signed-in users.

BEGIN;

CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.can_review_content()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM public.user_roles
        WHERE user_id = (SELECT auth.uid())
        AND role IN ('super_admin', 'content_admin', 'sme_reviewer')
    );
END;
$function$;

CREATE OR REPLACE FUNCTION private.check_user_admin_role(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    IF (SELECT auth.role()) IS DISTINCT FROM 'service_role'
       AND (SELECT auth.uid()) IS DISTINCT FROM p_user_id THEN
        RETURN false;
    END IF;

    RETURN EXISTS(
        SELECT 1 FROM public.user_roles
        WHERE user_id = p_user_id
        AND role IN ('super_admin', 'content_admin')
    );
END;
$function$;

CREATE OR REPLACE FUNCTION private.has_admin_role()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM public.user_roles
        WHERE user_id = (SELECT auth.uid())
        AND role IN ('super_admin', 'content_admin')
    );
END;
$function$;

CREATE OR REPLACE FUNCTION private.is_ceo_or_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role IN ('ceo', 'super_admin')
  );
$function$;

CREATE OR REPLACE FUNCTION private.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM public.user_roles
        WHERE user_id = (SELECT auth.uid())
        AND role = 'super_admin'
    );
END;
$function$;

REVOKE ALL ON FUNCTION private.can_review_content() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.check_user_admin_role(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.has_admin_role() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_ceo_or_super_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_super_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.can_review_content() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.check_user_admin_role(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.has_admin_role() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_ceo_or_super_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_super_admin() TO authenticated, service_role;

-- Move live policy dependencies off exposed public helper functions.
DROP POLICY IF EXISTS "Admins can access draft previews" ON public.admin_draft_previews;
CREATE POLICY "Admins can access draft previews"
ON public.admin_draft_previews
FOR ALL
TO authenticated
USING (private.check_user_admin_role((SELECT auth.uid())))
WITH CHECK (private.check_user_admin_role((SELECT auth.uid())));

DROP POLICY IF EXISTS wiki_article_sources_authenticated_select_visible ON public.wiki_article_sources;
CREATE POLICY wiki_article_sources_authenticated_select_visible
ON public.wiki_article_sources
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.wiki_articles article
    WHERE article.article_id = wiki_article_sources.article_id
      AND article.status = 'published'::text
  )
  OR private.has_admin_role()
);

DROP POLICY IF EXISTS wiki_article_sources_admin_insert ON public.wiki_article_sources;
CREATE POLICY wiki_article_sources_admin_insert
ON public.wiki_article_sources
FOR INSERT
TO authenticated
WITH CHECK (private.has_admin_role());

DROP POLICY IF EXISTS wiki_article_sources_admin_update ON public.wiki_article_sources;
CREATE POLICY wiki_article_sources_admin_update
ON public.wiki_article_sources
FOR UPDATE
TO authenticated
USING (private.has_admin_role())
WITH CHECK (private.has_admin_role());

DROP POLICY IF EXISTS wiki_article_sources_admin_delete ON public.wiki_article_sources;
CREATE POLICY wiki_article_sources_admin_delete
ON public.wiki_article_sources
FOR DELETE
TO authenticated
USING (private.has_admin_role());

-- Keep create_notification callable, but stop its admin bypass from depending on
-- the exposed public has_admin_role() RPC.
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type public.notification_type,
  p_title text,
  p_body text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_id UUID;
  v_is_enabled BOOLEAN := true;
  v_daily_count INTEGER;
  v_pref_column TEXT;
BEGIN
  IF (SELECT auth.role()) IS DISTINCT FROM 'service_role'
     AND (SELECT auth.uid()) IS DISTINCT FROM p_user_id
     AND NOT private.has_admin_role() THEN
    RAISE EXCEPTION 'create_notification may only target the current user'
      USING ERRCODE = '42501';
  END IF;

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
$function$;

-- Remove authenticated API access from exposed helper RPCs. service_role remains
-- for server-side/operator compatibility. These functions can be dropped after
-- generated API types and any unknown external callers have aged out.
REVOKE ALL ON FUNCTION public.can_review_content() FROM authenticated;
REVOKE ALL ON FUNCTION public.check_user_admin_role(uuid) FROM authenticated;
REVOKE ALL ON FUNCTION public.has_admin_role() FROM authenticated;
REVOKE ALL ON FUNCTION public.is_ceo_or_super_admin() FROM authenticated;
REVOKE ALL ON FUNCTION public.is_super_admin() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.can_review_content() TO service_role;
GRANT EXECUTE ON FUNCTION public.check_user_admin_role(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.has_admin_role() TO service_role;
GRANT EXECUTE ON FUNCTION public.is_ceo_or_super_admin() TO service_role;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO service_role;

COMMIT;
