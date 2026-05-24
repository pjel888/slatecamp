-- Resolve remaining Supabase Advisor SQL warnings that are safe to fix without changing learner-facing RPC contracts.
-- Scope:
--   1. Consolidate duplicate permissive RLS policies while preserving existing admin/owner/service semantics.
--   2. Revoke authenticated EXECUTE only from SECURITY DEFINER functions that are maintenance/trigger-only or CEO/service-only with no app callsite.
-- Not in scope:
--   - RPCs actively used by app code (quiz/SRS/wiki/notifications/adaptive flow).
--   - Helper SECURITY DEFINER functions used by RLS/admin checks.
--   - Hosted Auth leaked-password setting (dashboard configuration, not SQL).

BEGIN;

-- -----------------------------------------------------------------------------
-- SECURITY DEFINER RPC exposure: restrict maintenance/trigger-only functions.
-- -----------------------------------------------------------------------------

REVOKE ALL ON FUNCTION public."compute_monthly_burn"(target_month date) FROM authenticated;
REVOKE ALL ON FUNCTION public."compute_monthly_churn_rate"() FROM authenticated;
REVOKE ALL ON FUNCTION public."compute_mrr"() FROM authenticated;
REVOKE ALL ON FUNCTION public."compute_runway_months"() FROM authenticated;
REVOKE ALL ON FUNCTION public."refresh_ceo_materialized_views"() FROM authenticated;
REVOKE ALL ON FUNCTION public."refresh_user_question_states"() FROM authenticated;
REVOKE ALL ON FUNCTION public."log_mastery_history_on_update"() FROM authenticated;
REVOKE ALL ON FUNCTION public."refresh_user_question_stats"() FROM authenticated;
REVOKE ALL ON FUNCTION public."sync_team_member_role"() FROM authenticated;
REVOKE ALL ON FUNCTION public."update_user_question_state"() FROM authenticated;

GRANT EXECUTE ON FUNCTION public."compute_monthly_burn"(target_month date) TO service_role;
GRANT EXECUTE ON FUNCTION public."compute_monthly_churn_rate"() TO service_role;
GRANT EXECUTE ON FUNCTION public."compute_mrr"() TO service_role;
GRANT EXECUTE ON FUNCTION public."compute_runway_months"() TO service_role;
GRANT EXECUTE ON FUNCTION public."refresh_ceo_materialized_views"() TO service_role;
GRANT EXECUTE ON FUNCTION public."refresh_user_question_states"() TO service_role;
GRANT EXECUTE ON FUNCTION public."log_mastery_history_on_update"() TO service_role;
GRANT EXECUTE ON FUNCTION public."refresh_user_question_stats"() TO service_role;
GRANT EXECUTE ON FUNCTION public."sync_team_member_role"() TO service_role;
GRANT EXECUTE ON FUNCTION public."update_user_question_state"() TO service_role;

-- -----------------------------------------------------------------------------
-- RLS policy consolidation.
-- -----------------------------------------------------------------------------

-- code_updates: public/authenticated read remains broad; admin/service DML is isolated.
DROP POLICY IF EXISTS "Service role manages updates" ON public.code_updates;
DROP POLICY IF EXISTS "cu_admin_manage" ON public.code_updates;
DROP POLICY IF EXISTS "cu_select_all" ON public.code_updates;
CREATE POLICY "code_updates_service_role_all" ON public.code_updates
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
CREATE POLICY "code_updates_admin_insert" ON public.code_updates
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = (select auth.uid())
      AND (users.raw_app_meta_data ->> 'role') = 'admin'
  ));
CREATE POLICY "code_updates_admin_update" ON public.code_updates
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = (select auth.uid())
      AND (users.raw_app_meta_data ->> 'role') = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = (select auth.uid())
      AND (users.raw_app_meta_data ->> 'role') = 'admin'
  ));
CREATE POLICY "code_updates_admin_delete" ON public.code_updates
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = (select auth.uid())
      AND (users.raw_app_meta_data ->> 'role') = 'admin'
  ));

-- user_question_responses: service role policy must not apply to public/authenticated roles.
DROP POLICY IF EXISTS "uqr_service_all" ON public.user_question_responses;
CREATE POLICY "uqr_service_all" ON public.user_question_responses
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Admin/published read tables: collapse SELECT into one policy and split admin DML.
DROP POLICY IF EXISTS "dp_admin_manage" ON public.design_problems;
DROP POLICY IF EXISTS "dp_select_published" ON public.design_problems;
CREATE POLICY "design_problems_select_visible" ON public.design_problems
  FOR SELECT TO authenticated
  USING (
    is_published = true OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = (select auth.uid())
        AND (users.raw_app_meta_data ->> 'role') = 'admin'
    )
  );
CREATE POLICY "design_problems_admin_insert" ON public.design_problems
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = (select auth.uid())
      AND (users.raw_app_meta_data ->> 'role') = 'admin'
  ));
CREATE POLICY "design_problems_admin_update" ON public.design_problems
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = (select auth.uid())
      AND (users.raw_app_meta_data ->> 'role') = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = (select auth.uid())
      AND (users.raw_app_meta_data ->> 'role') = 'admin'
  ));
CREATE POLICY "design_problems_admin_delete" ON public.design_problems
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = (select auth.uid())
      AND (users.raw_app_meta_data ->> 'role') = 'admin'
  ));

DROP POLICY IF EXISTS "ots_admin_manage" ON public.oath_taking_schedules;
CREATE POLICY "ots_admin_insert" ON public.oath_taking_schedules
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM auth.users WHERE users.id = (select auth.uid()) AND (users.raw_app_meta_data ->> 'role') = 'admin'));
CREATE POLICY "ots_admin_update" ON public.oath_taking_schedules
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM auth.users WHERE users.id = (select auth.uid()) AND (users.raw_app_meta_data ->> 'role') = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM auth.users WHERE users.id = (select auth.uid()) AND (users.raw_app_meta_data ->> 'role') = 'admin'));
CREATE POLICY "ots_admin_delete" ON public.oath_taking_schedules
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM auth.users WHERE users.id = (select auth.uid()) AND (users.raw_app_meta_data ->> 'role') = 'admin'));

DROP POLICY IF EXISTS "ttbc_admin_manage" ON public.topic_teach_back_criteria;
CREATE POLICY "ttbc_admin_insert" ON public.topic_teach_back_criteria
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM auth.users WHERE users.id = (select auth.uid()) AND (users.raw_app_meta_data ->> 'role') = 'admin'));
CREATE POLICY "ttbc_admin_update" ON public.topic_teach_back_criteria
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM auth.users WHERE users.id = (select auth.uid()) AND (users.raw_app_meta_data ->> 'role') = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM auth.users WHERE users.id = (select auth.uid()) AND (users.raw_app_meta_data ->> 'role') = 'admin'));
CREATE POLICY "ttbc_admin_delete" ON public.topic_teach_back_criteria
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM auth.users WHERE users.id = (select auth.uid()) AND (users.raw_app_meta_data ->> 'role') = 'admin'));

DROP POLICY IF EXISTS "eip_admin_manage" ON public.wiki_ei_prompts;
CREATE POLICY "eip_admin_insert" ON public.wiki_ei_prompts
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM auth.users WHERE users.id = (select auth.uid()) AND (users.raw_app_meta_data ->> 'role') = 'admin'));
CREATE POLICY "eip_admin_update" ON public.wiki_ei_prompts
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM auth.users WHERE users.id = (select auth.uid()) AND (users.raw_app_meta_data ->> 'role') = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM auth.users WHERE users.id = (select auth.uid()) AND (users.raw_app_meta_data ->> 'role') = 'admin'));
CREATE POLICY "eip_admin_delete" ON public.wiki_ei_prompts
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM auth.users WHERE users.id = (select auth.uid()) AND (users.raw_app_meta_data ->> 'role') = 'admin'));

-- feature_flags: keep one runtime read policy; split admin DML.
DROP POLICY IF EXISTS "Admins can manage feature flags" ON public.feature_flags;
DROP POLICY IF EXISTS "Authenticated users can read feature flags" ON public.feature_flags;
CREATE POLICY "feature_flags_admin_insert" ON public.feature_flags
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM auth.users WHERE users.id = (select auth.uid()) AND (users.raw_app_meta_data ->> 'role') = 'admin'));
CREATE POLICY "feature_flags_admin_update" ON public.feature_flags
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM auth.users WHERE users.id = (select auth.uid()) AND (users.raw_app_meta_data ->> 'role') = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM auth.users WHERE users.id = (select auth.uid()) AND (users.raw_app_meta_data ->> 'role') = 'admin'));
CREATE POLICY "feature_flags_admin_delete" ON public.feature_flags
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM auth.users WHERE users.id = (select auth.uid()) AND (users.raw_app_meta_data ->> 'role') = 'admin'));

-- Legacy public owner policies duplicated newer authenticated owner policies; keep authenticated policies and restore missing owner DML where legacy ALL implied it.
DROP POLICY IF EXISTS "Users manage own outcomes" ON public.exam_outcomes;
CREATE POLICY "eo_update_own" ON public.exam_outcomes
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "eo_delete_own" ON public.exam_outcomes
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can manage own notes" ON public.notes;
CREATE POLICY "notes_delete" ON public.notes
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own readiness snapshots" ON public.readiness_score_snapshots;
DROP POLICY IF EXISTS "Users can read own readiness snapshots" ON public.readiness_score_snapshots;

DROP POLICY IF EXISTS "Users can insert own node mastery" ON public.user_node_mastery;
DROP POLICY IF EXISTS "Users can read own node mastery" ON public.user_node_mastery;
DROP POLICY IF EXISTS "Users can update own node mastery" ON public.user_node_mastery;

DROP POLICY IF EXISTS "enrollments_insert_own" ON public.user_trail_enrollments;
DROP POLICY IF EXISTS "enrollments_select_own" ON public.user_trail_enrollments;

DROP POLICY IF EXISTS "progress_insert_own" ON public.user_trail_progress;
DROP POLICY IF EXISTS "progress_select_own" ON public.user_trail_progress;

DROP POLICY IF EXISTS "Learners can create their own article reads" ON public.wiki_article_reads;
DROP POLICY IF EXISTS "Learners can read their own article reads" ON public.wiki_article_reads;
DROP POLICY IF EXISTS "Learners can update their own article reads" ON public.wiki_article_reads;
DROP POLICY IF EXISTS "war_update_own" ON public.wiki_article_reads;
CREATE POLICY "war_update_own" ON public.wiki_article_reads
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Learners can create their own wiki bookmarks" ON public.wiki_bookmarks;
DROP POLICY IF EXISTS "Learners can read their own wiki bookmarks" ON public.wiki_bookmarks;
DROP POLICY IF EXISTS "Learners can delete their own wiki bookmarks" ON public.wiki_bookmarks;

-- Organization/member select: owners/admins still see org members; members still read their org.
DROP POLICY IF EXISTS "Members can read own org members" ON public.organization_members;
DROP POLICY IF EXISTS "Org admins can manage members" ON public.organization_members;
CREATE POLICY "organization_members_select_visible" ON public.organization_members
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM organization_members self
    WHERE self.org_id = organization_members.org_id
      AND self.user_id = (select auth.uid())
  ));
CREATE POLICY "organization_members_admin_insert" ON public.organization_members
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM organization_members self
    WHERE self.org_id = organization_members.org_id
      AND self.user_id = (select auth.uid())
      AND self.role = ANY (ARRAY['owner'::text, 'admin'::text])
  ));
CREATE POLICY "organization_members_admin_update" ON public.organization_members
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM organization_members self
    WHERE self.org_id = organization_members.org_id
      AND self.user_id = (select auth.uid())
      AND self.role = ANY (ARRAY['owner'::text, 'admin'::text])
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM organization_members self
    WHERE self.org_id = organization_members.org_id
      AND self.user_id = (select auth.uid())
      AND self.role = ANY (ARRAY['owner'::text, 'admin'::text])
  ));
CREATE POLICY "organization_members_admin_delete" ON public.organization_members
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM organization_members self
    WHERE self.org_id = organization_members.org_id
      AND self.user_id = (select auth.uid())
      AND self.role = ANY (ARRAY['owner'::text, 'admin'::text])
  ));

-- Taxonomy public-read tables: public SELECT remains; admin DML is split out.
DROP POLICY IF EXISTS "Admins can manage taxonomy cross references" ON public.taxonomy_cross_references;
CREATE POLICY "taxonomy_cross_references_admin_insert" ON public.taxonomy_cross_references
  FOR INSERT TO authenticated
  WITH CHECK ((((select auth.jwt()) -> 'app_metadata') ->> 'role') = 'admin');
CREATE POLICY "taxonomy_cross_references_admin_update" ON public.taxonomy_cross_references
  FOR UPDATE TO authenticated
  USING ((((select auth.jwt()) -> 'app_metadata') ->> 'role') = 'admin')
  WITH CHECK ((((select auth.jwt()) -> 'app_metadata') ->> 'role') = 'admin');
CREATE POLICY "taxonomy_cross_references_admin_delete" ON public.taxonomy_cross_references
  FOR DELETE TO authenticated
  USING ((((select auth.jwt()) -> 'app_metadata') ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins can manage taxonomy prerequisites" ON public.taxonomy_prerequisites;
CREATE POLICY "taxonomy_prerequisites_admin_insert" ON public.taxonomy_prerequisites
  FOR INSERT TO authenticated
  WITH CHECK ((((select auth.jwt()) -> 'app_metadata') ->> 'role') = 'admin');
CREATE POLICY "taxonomy_prerequisites_admin_update" ON public.taxonomy_prerequisites
  FOR UPDATE TO authenticated
  USING ((((select auth.jwt()) -> 'app_metadata') ->> 'role') = 'admin')
  WITH CHECK ((((select auth.jwt()) -> 'app_metadata') ->> 'role') = 'admin');
CREATE POLICY "taxonomy_prerequisites_admin_delete" ON public.taxonomy_prerequisites
  FOR DELETE TO authenticated
  USING ((((select auth.jwt()) -> 'app_metadata') ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins can manage taxonomy sources" ON public.taxonomy_sources;
CREATE POLICY "taxonomy_sources_admin_insert" ON public.taxonomy_sources
  FOR INSERT TO authenticated
  WITH CHECK ((((select auth.jwt()) -> 'app_metadata') ->> 'role') = 'admin');
CREATE POLICY "taxonomy_sources_admin_update" ON public.taxonomy_sources
  FOR UPDATE TO authenticated
  USING ((((select auth.jwt()) -> 'app_metadata') ->> 'role') = 'admin')
  WITH CHECK ((((select auth.jwt()) -> 'app_metadata') ->> 'role') = 'admin');
CREATE POLICY "taxonomy_sources_admin_delete" ON public.taxonomy_sources
  FOR DELETE TO authenticated
  USING ((((select auth.jwt()) -> 'app_metadata') ->> 'role') = 'admin');

-- Subscription and EI response SELECT consolidation.
DROP POLICY IF EXISTS "Admins can read all subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can read own subscription" ON public.user_subscriptions;
CREATE POLICY "user_subscriptions_select_visible" ON public.user_subscriptions
  FOR SELECT TO authenticated
  USING (
    (select auth.uid()) = user_id OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = (select auth.uid())
        AND (users.raw_app_meta_data ->> 'role') = 'admin'
    )
  );

DROP POLICY IF EXISTS "eir_admin_read" ON public.wiki_ei_responses;
DROP POLICY IF EXISTS "eir_select_own" ON public.wiki_ei_responses;
CREATE POLICY "wiki_ei_responses_select_visible" ON public.wiki_ei_responses
  FOR SELECT TO authenticated
  USING (
    (select auth.uid()) = user_id OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = (select auth.uid())
        AND (users.raw_app_meta_data ->> 'role') = 'admin'
    )
  );

-- wiki_article_sources: avoid authenticated SELECT duplication between public-published and admin-all.
DROP POLICY IF EXISTS "Admins can manage wiki sources" ON public.wiki_article_sources;
DROP POLICY IF EXISTS "Published wiki article sources are publicly readable" ON public.wiki_article_sources;
CREATE POLICY "wiki_article_sources_anon_select_published" ON public.wiki_article_sources
  FOR SELECT TO anon
  USING (EXISTS (
    SELECT 1 FROM wiki_articles article
    WHERE article.article_id = wiki_article_sources.article_id
      AND article.status = 'published'
  ));
CREATE POLICY "wiki_article_sources_authenticated_select_visible" ON public.wiki_article_sources
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wiki_articles article
      WHERE article.article_id = wiki_article_sources.article_id
        AND article.status = 'published'
    ) OR has_admin_role()
  );
CREATE POLICY "wiki_article_sources_admin_insert" ON public.wiki_article_sources
  FOR INSERT TO authenticated
  WITH CHECK (has_admin_role());
CREATE POLICY "wiki_article_sources_admin_update" ON public.wiki_article_sources
  FOR UPDATE TO authenticated
  USING (has_admin_role())
  WITH CHECK (has_admin_role());
CREATE POLICY "wiki_article_sources_admin_delete" ON public.wiki_article_sources
  FOR DELETE TO authenticated
  USING (has_admin_role());

COMMIT;
