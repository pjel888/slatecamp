-- Migration: Unify RLS admin patterns to use has_admin_role()
-- Replaces all raw_app_meta_data ->> 'role' = 'admin' checks with has_admin_role()
-- Also adds admin mutation policy to wiki_article_taxonomy junction table

-- ============================================================
-- 1. feature_flags
-- ============================================================
DROP POLICY IF EXISTS "Admins can manage feature flags" ON public.feature_flags;
CREATE POLICY "Admins can manage feature flags" ON public.feature_flags
  FOR ALL TO authenticated
  USING (has_admin_role())
  WITH CHECK (has_admin_role());

-- ============================================================
-- 2. taxonomy_cross_references
-- ============================================================
DROP POLICY IF EXISTS "txref_admin_manage" ON public.taxonomy_cross_references;
CREATE POLICY "txref_admin_manage" ON public.taxonomy_cross_references
  FOR ALL TO authenticated
  USING (has_admin_role())
  WITH CHECK (has_admin_role());

-- ============================================================
-- 3. taxonomy_sources
-- ============================================================
DROP POLICY IF EXISTS "tsrc_admin_manage" ON public.taxonomy_sources;
CREATE POLICY "tsrc_admin_manage" ON public.taxonomy_sources
  FOR ALL TO authenticated
  USING (has_admin_role())
  WITH CHECK (has_admin_role());

-- ============================================================
-- 4. taxonomy_prerequisites
-- ============================================================
DROP POLICY IF EXISTS "tpreq_admin_manage" ON public.taxonomy_prerequisites;
CREATE POLICY "tpreq_admin_manage" ON public.taxonomy_prerequisites
  FOR ALL TO authenticated
  USING (has_admin_role())
  WITH CHECK (has_admin_role());

-- ============================================================
-- 5. topic_teach_back_criteria
-- ============================================================
DROP POLICY IF EXISTS "ttbc_admin_manage" ON public.topic_teach_back_criteria;
CREATE POLICY "ttbc_admin_manage" ON public.topic_teach_back_criteria
  FOR ALL TO authenticated
  USING (has_admin_role())
  WITH CHECK (has_admin_role());

-- ============================================================
-- 6. notification_log (read-only for admins)
-- ============================================================
DROP POLICY IF EXISTS "nl_admin_read" ON public.notification_log;
CREATE POLICY "nl_admin_read" ON public.notification_log
  FOR SELECT TO authenticated
  USING (has_admin_role());

-- ============================================================
-- 7. wiki_ei_prompts
-- ============================================================
DROP POLICY IF EXISTS "eip_admin_manage" ON public.wiki_ei_prompts;
CREATE POLICY "eip_admin_manage" ON public.wiki_ei_prompts
  FOR ALL TO authenticated
  USING (has_admin_role())
  WITH CHECK (has_admin_role());

-- ============================================================
-- 8. wiki_article_taxonomy junction table (NEW - was missing)
-- ============================================================
CREATE POLICY "Admins can manage wiki_article_taxonomy"
  ON public.wiki_article_taxonomy FOR ALL
  USING (has_admin_role()) WITH CHECK (has_admin_role());
