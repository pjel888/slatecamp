-- Resolve the safe subset of Supabase Advisor findings captured 2026-05-24.
-- Scope: no data deletion; enables missing RLS, removes anon/PUBLIC function execute defaults,
-- wraps auth/current_setting calls in RLS policies to avoid per-row init plans, and drops duplicate indexes.
-- Remaining advisor classes requiring product/security review: authenticated SECURITY DEFINER RPC exposure,
-- multiple permissive policy consolidation, and hosted Auth leaked-password protection setting.

BEGIN;

-- 0013_rls_disabled_in_public: user_question_states
ALTER TABLE public.user_question_states ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_question_states_select_own ON public.user_question_states;
CREATE POLICY user_question_states_select_own
  ON public.user_question_states
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS user_question_states_service_role_all ON public.user_question_states;
CREATE POLICY user_question_states_service_role_all
  ON public.user_question_states
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 0028_anon_security_definer_function_executable: remove PUBLIC/anon execute defaults; keep authenticated/service_role where RPCs are already part of the app contract.
REVOKE ALL ON FUNCTION public."can_review_content"() FROM PUBLIC;
REVOKE ALL ON FUNCTION public."can_review_content"() FROM anon;
GRANT EXECUTE ON FUNCTION public."can_review_content"() TO authenticated, service_role;
REVOKE ALL ON FUNCTION public."check_user_admin_role"(p_user_id uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public."check_user_admin_role"(p_user_id uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public."check_user_admin_role"(p_user_id uuid) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public."compute_monthly_burn"(target_month date) FROM PUBLIC;
REVOKE ALL ON FUNCTION public."compute_monthly_burn"(target_month date) FROM anon;
GRANT EXECUTE ON FUNCTION public."compute_monthly_burn"(target_month date) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public."compute_monthly_churn_rate"() FROM PUBLIC;
REVOKE ALL ON FUNCTION public."compute_monthly_churn_rate"() FROM anon;
GRANT EXECUTE ON FUNCTION public."compute_monthly_churn_rate"() TO authenticated, service_role;
REVOKE ALL ON FUNCTION public."compute_mrr"() FROM PUBLIC;
REVOKE ALL ON FUNCTION public."compute_mrr"() FROM anon;
GRANT EXECUTE ON FUNCTION public."compute_mrr"() TO authenticated, service_role;
REVOKE ALL ON FUNCTION public."compute_runway_months"() FROM PUBLIC;
REVOKE ALL ON FUNCTION public."compute_runway_months"() FROM anon;
GRANT EXECUTE ON FUNCTION public."compute_runway_months"() TO authenticated, service_role;
REVOKE ALL ON FUNCTION public."get_article_with_node"(p_slug text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public."get_article_with_node"(p_slug text) FROM anon;
GRANT EXECUTE ON FUNCTION public."get_article_with_node"(p_slug text) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public."get_fallback_questions"(p_topic_ids uuid[], p_exclude_ids uuid[], p_limit integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public."get_fallback_questions"(p_topic_ids uuid[], p_exclude_ids uuid[], p_limit integer) FROM anon;
GRANT EXECUTE ON FUNCTION public."get_fallback_questions"(p_topic_ids uuid[], p_exclude_ids uuid[], p_limit integer) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public."get_review_deck"(p_user_id uuid, p_limit integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public."get_review_deck"(p_user_id uuid, p_limit integer) FROM anon;
GRANT EXECUTE ON FUNCTION public."get_review_deck"(p_user_id uuid, p_limit integer) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public."get_review_due_count"(p_user_id uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public."get_review_due_count"(p_user_id uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public."get_review_due_count"(p_user_id uuid) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public."get_unseen_questions"(p_user_id uuid, p_topic_ids uuid[], p_limit integer, p_difficulty_min numeric, p_difficulty_max numeric) FROM PUBLIC;
REVOKE ALL ON FUNCTION public."get_unseen_questions"(p_user_id uuid, p_topic_ids uuid[], p_limit integer, p_difficulty_min numeric, p_difficulty_max numeric) FROM anon;
GRANT EXECUTE ON FUNCTION public."get_unseen_questions"(p_user_id uuid, p_topic_ids uuid[], p_limit integer, p_difficulty_min numeric, p_difficulty_max numeric) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public."has_admin_role"() FROM PUBLIC;
REVOKE ALL ON FUNCTION public."has_admin_role"() FROM anon;
GRANT EXECUTE ON FUNCTION public."has_admin_role"() TO authenticated, service_role;
REVOKE ALL ON FUNCTION public."is_ceo_or_super_admin"() FROM PUBLIC;
REVOKE ALL ON FUNCTION public."is_ceo_or_super_admin"() FROM anon;
GRANT EXECUTE ON FUNCTION public."is_ceo_or_super_admin"() TO authenticated, service_role;
REVOKE ALL ON FUNCTION public."is_super_admin"() FROM PUBLIC;
REVOKE ALL ON FUNCTION public."is_super_admin"() FROM anon;
GRANT EXECUTE ON FUNCTION public."is_super_admin"() TO authenticated, service_role;
REVOKE ALL ON FUNCTION public."log_mastery_history_on_update"() FROM PUBLIC;
REVOKE ALL ON FUNCTION public."log_mastery_history_on_update"() FROM anon;
GRANT EXECUTE ON FUNCTION public."log_mastery_history_on_update"() TO authenticated, service_role;
REVOKE ALL ON FUNCTION public."refresh_ceo_materialized_views"() FROM PUBLIC;
REVOKE ALL ON FUNCTION public."refresh_ceo_materialized_views"() FROM anon;
GRANT EXECUTE ON FUNCTION public."refresh_ceo_materialized_views"() TO authenticated, service_role;
REVOKE ALL ON FUNCTION public."refresh_user_question_states"() FROM PUBLIC;
REVOKE ALL ON FUNCTION public."refresh_user_question_states"() FROM anon;
GRANT EXECUTE ON FUNCTION public."refresh_user_question_states"() TO authenticated, service_role;
REVOKE ALL ON FUNCTION public."refresh_user_question_stats"() FROM PUBLIC;
REVOKE ALL ON FUNCTION public."refresh_user_question_stats"() FROM anon;
GRANT EXECUTE ON FUNCTION public."refresh_user_question_stats"() TO authenticated, service_role;
REVOKE ALL ON FUNCTION public."select_next_item"(p_user_id uuid, p_session_id uuid, p_discipline_id uuid, p_topic_id uuid, p_target_p double precision) FROM PUBLIC;
REVOKE ALL ON FUNCTION public."select_next_item"(p_user_id uuid, p_session_id uuid, p_discipline_id uuid, p_topic_id uuid, p_target_p double precision) FROM anon;
GRANT EXECUTE ON FUNCTION public."select_next_item"(p_user_id uuid, p_session_id uuid, p_discipline_id uuid, p_topic_id uuid, p_target_p double precision) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public."submit_quiz_answer_v2"(p_session_id uuid, p_question_id uuid, p_user_id uuid, p_selected_option_id text, p_is_correct boolean, p_time_spent_ms integer, p_confidence text, p_confidence_score numeric, p_is_suspected_lucky_guess boolean, p_question_order integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public."submit_quiz_answer_v2"(p_session_id uuid, p_question_id uuid, p_user_id uuid, p_selected_option_id text, p_is_correct boolean, p_time_spent_ms integer, p_confidence text, p_confidence_score numeric, p_is_suspected_lucky_guess boolean, p_question_order integer) FROM anon;
GRANT EXECUTE ON FUNCTION public."submit_quiz_answer_v2"(p_session_id uuid, p_question_id uuid, p_user_id uuid, p_selected_option_id text, p_is_correct boolean, p_time_spent_ms integer, p_confidence text, p_confidence_score numeric, p_is_suspected_lucky_guess boolean, p_question_order integer) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public."sync_team_member_role"() FROM PUBLIC;
REVOKE ALL ON FUNCTION public."sync_team_member_role"() FROM anon;
GRANT EXECUTE ON FUNCTION public."sync_team_member_role"() TO authenticated, service_role;
REVOKE ALL ON FUNCTION public."update_theta"(p_user_id uuid, p_discipline_id uuid, p_item_difficulty double precision, p_item_discrimination double precision, p_is_correct boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public."update_theta"(p_user_id uuid, p_discipline_id uuid, p_item_difficulty double precision, p_item_discrimination double precision, p_is_correct boolean) FROM anon;
GRANT EXECUTE ON FUNCTION public."update_theta"(p_user_id uuid, p_discipline_id uuid, p_item_difficulty double precision, p_item_discrimination double precision, p_is_correct boolean) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public."update_user_question_state"() FROM PUBLIC;
REVOKE ALL ON FUNCTION public."update_user_question_state"() FROM anon;
GRANT EXECUTE ON FUNCTION public."update_user_question_state"() TO authenticated, service_role;

-- 0003_auth_rls_initplan: preserve policy semantics while converting auth/current_setting calls to initplans.
DROP POLICY IF EXISTS "Admins can access draft previews" ON "public"."admin_draft_previews";
CREATE POLICY "Admins can access draft previews"
  ON "public"."admin_draft_previews"
  FOR ALL
  TO public
  USING (check_user_admin_role((select auth.uid())))
  WITH CHECK (check_user_admin_role((select auth.uid())));
DROP POLICY IF EXISTS "bq_insert_own" ON "public"."blindspot_queues";
CREATE POLICY "bq_insert_own"
  ON "public"."blindspot_queues"
  FOR INSERT
  TO authenticated
  WITH CHECK (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "bq_select_own" ON "public"."blindspot_queues";
CREATE POLICY "bq_select_own"
  ON "public"."blindspot_queues"
  FOR SELECT
  TO authenticated
  USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "bq_update_own" ON "public"."blindspot_queues";
CREATE POLICY "bq_update_own"
  ON "public"."blindspot_queues"
  FOR UPDATE
  TO authenticated
  USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Users insert own calibration" ON "public"."calibration_snapshots";
CREATE POLICY "Users insert own calibration"
  ON "public"."calibration_snapshots"
  FOR INSERT
  TO public
  WITH CHECK (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Users read own calibration" ON "public"."calibration_snapshots";
CREATE POLICY "Users read own calibration"
  ON "public"."calibration_snapshots"
  FOR SELECT
  TO public
  USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Service role manages updates" ON "public"."code_updates";
CREATE POLICY "Service role manages updates"
  ON "public"."code_updates"
  FOR ALL
  TO public
  USING (((select auth.role()) = 'service_role'::text));
DROP POLICY IF EXISTS "cu_admin_manage" ON "public"."code_updates";
CREATE POLICY "cu_admin_manage"
  ON "public"."code_updates"
  FOR ALL
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = (select auth.uid())) AND ((users.raw_app_meta_data ->> 'role'::text) = 'admin'::text)))));
DROP POLICY IF EXISTS "Users manage own doses" ON "public"."daily_doses";
CREATE POLICY "Users manage own doses"
  ON "public"."daily_doses"
  FOR ALL
  TO public
  USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "dps_insert_own" ON "public"."design_problem_sessions";
CREATE POLICY "dps_insert_own"
  ON "public"."design_problem_sessions"
  FOR INSERT
  TO authenticated
  WITH CHECK (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "dps_select_own" ON "public"."design_problem_sessions";
CREATE POLICY "dps_select_own"
  ON "public"."design_problem_sessions"
  FOR SELECT
  TO authenticated
  USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "dps_update_own" ON "public"."design_problem_sessions";
CREATE POLICY "dps_update_own"
  ON "public"."design_problem_sessions"
  FOR UPDATE
  TO authenticated
  USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "dp_admin_manage" ON "public"."design_problems";
CREATE POLICY "dp_admin_manage"
  ON "public"."design_problems"
  FOR ALL
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = (select auth.uid())) AND ((users.raw_app_meta_data ->> 'role'::text) = 'admin'::text)))));
DROP POLICY IF EXISTS "design_questions_write" ON "public"."design_questions";
CREATE POLICY "design_questions_write"
  ON "public"."design_questions"
  FOR ALL
  TO public
  USING (((select auth.role()) = 'service_role'::text))
  WITH CHECK (((select auth.role()) = 'service_role'::text));
DROP POLICY IF EXISTS "design_scenario_interactions_own" ON "public"."design_scenario_interactions";
CREATE POLICY "design_scenario_interactions_own"
  ON "public"."design_scenario_interactions"
  FOR ALL
  TO public
  USING (((select auth.uid()) = user_id))
  WITH CHECK (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "design_scenario_sessions_own" ON "public"."design_scenario_sessions";
CREATE POLICY "design_scenario_sessions_own"
  ON "public"."design_scenario_sessions"
  FOR ALL
  TO public
  USING (((select auth.uid()) = user_id))
  WITH CHECK (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Users manage own outcomes" ON "public"."exam_outcomes";
CREATE POLICY "Users manage own outcomes"
  ON "public"."exam_outcomes"
  FOR ALL
  TO public
  USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "eo_insert_own" ON "public"."exam_outcomes";
CREATE POLICY "eo_insert_own"
  ON "public"."exam_outcomes"
  FOR INSERT
  TO authenticated
  WITH CHECK (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "eo_select_own" ON "public"."exam_outcomes";
CREATE POLICY "eo_select_own"
  ON "public"."exam_outcomes"
  FOR SELECT
  TO authenticated
  USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Admins can manage feature flags" ON "public"."feature_flags";
CREATE POLICY "Admins can manage feature flags"
  ON "public"."feature_flags"
  FOR ALL
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = (select auth.uid())) AND ((users.raw_app_meta_data ->> 'role'::text) = 'admin'::text)))));
DROP POLICY IF EXISTS "Users can manage own folders" ON "public"."note_folders";
CREATE POLICY "Users can manage own folders"
  ON "public"."note_folders"
  FOR ALL
  TO public
  USING (((select auth.uid()) = user_id))
  WITH CHECK (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "nl_admin_read" ON "public"."notification_log";
CREATE POLICY "nl_admin_read"
  ON "public"."notification_log"
  FOR SELECT
  TO authenticated
  USING ((( SELECT (((select auth.jwt()) -> 'app_metadata'::text) ->> 'role'::text)) = 'admin'::text));
DROP POLICY IF EXISTS "Users can insert own preferences" ON "public"."notification_preferences";
CREATE POLICY "Users can insert own preferences"
  ON "public"."notification_preferences"
  FOR INSERT
  TO authenticated
  WITH CHECK (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Users can select own preferences" ON "public"."notification_preferences";
CREATE POLICY "Users can select own preferences"
  ON "public"."notification_preferences"
  FOR SELECT
  TO authenticated
  USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Users can update own preferences" ON "public"."notification_preferences";
CREATE POLICY "Users can update own preferences"
  ON "public"."notification_preferences"
  FOR UPDATE
  TO authenticated
  USING (((select auth.uid()) = user_id))
  WITH CHECK (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Users can update own notifications" ON "public"."notifications";
CREATE POLICY "Users can update own notifications"
  ON "public"."notifications"
  FOR UPDATE
  TO authenticated
  USING (((select auth.uid()) = user_id))
  WITH CHECK (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Users can view own notifications" ON "public"."notifications";
CREATE POLICY "Users can view own notifications"
  ON "public"."notifications"
  FOR SELECT
  TO authenticated
  USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "ots_admin_manage" ON "public"."oath_taking_schedules";
CREATE POLICY "ots_admin_manage"
  ON "public"."oath_taking_schedules"
  FOR ALL
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = (select auth.uid())) AND ((users.raw_app_meta_data ->> 'role'::text) = 'admin'::text)))));
DROP POLICY IF EXISTS "Members can read own org members" ON "public"."organization_members";
CREATE POLICY "Members can read own org members"
  ON "public"."organization_members"
  FOR SELECT
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM organization_members self
  WHERE ((self.org_id = organization_members.org_id) AND (self.user_id = (select auth.uid()))))));
DROP POLICY IF EXISTS "Org admins can manage members" ON "public"."organization_members";
CREATE POLICY "Org admins can manage members"
  ON "public"."organization_members"
  FOR ALL
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM organization_members self
  WHERE ((self.org_id = organization_members.org_id) AND (self.user_id = (select auth.uid())) AND (self.role = ANY (ARRAY['owner'::text, 'admin'::text]))))));
DROP POLICY IF EXISTS "Members can read own organization" ON "public"."organizations";
CREATE POLICY "Members can read own organization"
  ON "public"."organizations"
  FOR SELECT
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM organization_members
  WHERE ((organization_members.org_id = organizations.org_id) AND (organization_members.user_id = (select auth.uid()))))));
DROP POLICY IF EXISTS "Org admins can update organization" ON "public"."organizations";
CREATE POLICY "Org admins can update organization"
  ON "public"."organizations"
  FOR UPDATE
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM organization_members
  WHERE ((organization_members.org_id = organizations.org_id) AND (organization_members.user_id = (select auth.uid())) AND (organization_members.role = ANY (ARRAY['owner'::text, 'admin'::text]))))));
DROP POLICY IF EXISTS "pm_delete_own" ON "public"."pod_members";
CREATE POLICY "pm_delete_own"
  ON "public"."pod_members"
  FOR DELETE
  TO authenticated
  USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "pm_insert_own" ON "public"."pod_members";
CREATE POLICY "pm_insert_own"
  ON "public"."pod_members"
  FOR INSERT
  TO authenticated
  WITH CHECK (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "pm_select_own_pod" ON "public"."pod_members";
CREATE POLICY "pm_select_own_pod"
  ON "public"."pod_members"
  FOR SELECT
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM pod_members self
  WHERE ((self.pod_id = pod_members.pod_id) AND (self.user_id = (select auth.uid()))))));
DROP POLICY IF EXISTS "Users can insert own profile" ON "public"."profiles";
CREATE POLICY "Users can insert own profile"
  ON "public"."profiles"
  FOR INSERT
  TO public
  WITH CHECK (((select auth.uid()) = id));
DROP POLICY IF EXISTS "Users can update own profile" ON "public"."profiles";
CREATE POLICY "Users can update own profile"
  ON "public"."profiles"
  FOR UPDATE
  TO public
  USING (((select auth.uid()) = id));
DROP POLICY IF EXISTS "Users can view own profile" ON "public"."profiles";
CREATE POLICY "Users can view own profile"
  ON "public"."profiles"
  FOR SELECT
  TO public
  USING (((select auth.uid()) = id));
DROP POLICY IF EXISTS "Users insert own predictions" ON "public"."session_predictions";
CREATE POLICY "Users insert own predictions"
  ON "public"."session_predictions"
  FOR INSERT
  TO public
  WITH CHECK (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Users read own predictions" ON "public"."session_predictions";
CREATE POLICY "Users read own predictions"
  ON "public"."session_predictions"
  FOR SELECT
  TO public
  USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Users update own predictions" ON "public"."session_predictions";
CREATE POLICY "Users update own predictions"
  ON "public"."session_predictions"
  FOR UPDATE
  TO public
  USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "credits_insert_own" ON "public"."session_trail_credits";
CREATE POLICY "credits_insert_own"
  ON "public"."session_trail_credits"
  FOR INSERT
  TO authenticated
  WITH CHECK ((EXISTS ( SELECT 1
   FROM user_trail_enrollments e
  WHERE ((e.enrollment_id = session_trail_credits.enrollment_id) AND (e.user_id = (select auth.uid()))))));
DROP POLICY IF EXISTS "credits_select_own" ON "public"."session_trail_credits";
CREATE POLICY "credits_select_own"
  ON "public"."session_trail_credits"
  FOR SELECT
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM user_trail_enrollments e
  WHERE ((e.enrollment_id = session_trail_credits.enrollment_id) AND (e.user_id = (select auth.uid()))))));
DROP POLICY IF EXISTS "pod_insert_own" ON "public"."study_pods";
CREATE POLICY "pod_insert_own"
  ON "public"."study_pods"
  FOR INSERT
  TO authenticated
  WITH CHECK (((select auth.uid()) = created_by));
DROP POLICY IF EXISTS "pod_select_member" ON "public"."study_pods";
CREATE POLICY "pod_select_member"
  ON "public"."study_pods"
  FOR SELECT
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM pod_members pm
  WHERE ((pm.pod_id = study_pods.pod_id) AND (pm.user_id = (select auth.uid()))))));
DROP POLICY IF EXISTS "Users manage own SR cycles" ON "public"."successive_relearning_cycles";
CREATE POLICY "Users manage own SR cycles"
  ON "public"."successive_relearning_cycles"
  FOR ALL
  TO public
  USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Admins can manage taxonomy cross references" ON "public"."taxonomy_cross_references";
CREATE POLICY "Admins can manage taxonomy cross references"
  ON "public"."taxonomy_cross_references"
  FOR ALL
  TO authenticated
  USING (((((select auth.jwt()) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text))
  WITH CHECK (((((select auth.jwt()) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text));
DROP POLICY IF EXISTS "Admins can manage taxonomy prerequisites" ON "public"."taxonomy_prerequisites";
CREATE POLICY "Admins can manage taxonomy prerequisites"
  ON "public"."taxonomy_prerequisites"
  FOR ALL
  TO authenticated
  USING (((((select auth.jwt()) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text))
  WITH CHECK (((((select auth.jwt()) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text));
DROP POLICY IF EXISTS "Admins can manage taxonomy sources" ON "public"."taxonomy_sources";
CREATE POLICY "Admins can manage taxonomy sources"
  ON "public"."taxonomy_sources"
  FOR ALL
  TO authenticated
  USING (((((select auth.jwt()) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text))
  WITH CHECK (((((select auth.jwt()) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text));
DROP POLICY IF EXISTS "ttbc_admin_manage" ON "public"."topic_teach_back_criteria";
CREATE POLICY "ttbc_admin_manage"
  ON "public"."topic_teach_back_criteria"
  FOR ALL
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = (select auth.uid())) AND ((users.raw_app_meta_data ->> 'role'::text) = 'admin'::text)))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = (select auth.uid())) AND ((users.raw_app_meta_data ->> 'role'::text) = 'admin'::text)))));
DROP POLICY IF EXISTS "day_completions_insert_own" ON "public"."trail_day_completions";
CREATE POLICY "day_completions_insert_own"
  ON "public"."trail_day_completions"
  FOR INSERT
  TO authenticated
  WITH CHECK (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "day_completions_select_own" ON "public"."trail_day_completions";
CREATE POLICY "day_completions_select_own"
  ON "public"."trail_day_completions"
  FOR SELECT
  TO authenticated
  USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "ep_insert_own" ON "public"."user_endurance_profiles";
CREATE POLICY "ep_insert_own"
  ON "public"."user_endurance_profiles"
  FOR INSERT
  TO authenticated
  WITH CHECK (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "ep_update_own" ON "public"."user_endurance_profiles";
CREATE POLICY "ep_update_own"
  ON "public"."user_endurance_profiles"
  FOR UPDATE
  TO authenticated
  USING (((select auth.uid()) = user_id))
  WITH CHECK (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "uqr_insert_own" ON "public"."user_question_responses";
CREATE POLICY "uqr_insert_own"
  ON "public"."user_question_responses"
  FOR INSERT
  TO public
  WITH CHECK (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "uqr_select_own" ON "public"."user_question_responses";
CREATE POLICY "uqr_select_own"
  ON "public"."user_question_responses"
  FOR SELECT
  TO public
  USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "uqr_service_all" ON "public"."user_question_responses";
CREATE POLICY "uqr_service_all"
  ON "public"."user_question_responses"
  FOR ALL
  TO public
  USING (((select auth.role()) = 'service_role'::text))
  WITH CHECK (((select auth.role()) = 'service_role'::text));
DROP POLICY IF EXISTS "Users can read own roles" ON "public"."user_roles";
CREATE POLICY "Users can read own roles"
  ON "public"."user_roles"
  FOR SELECT
  TO public
  USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Admins can read all subscriptions" ON "public"."user_subscriptions";
CREATE POLICY "Admins can read all subscriptions"
  ON "public"."user_subscriptions"
  FOR SELECT
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = (select auth.uid())) AND ((users.raw_app_meta_data ->> 'role'::text) = 'admin'::text)))));
DROP POLICY IF EXISTS "Users can read own subscription" ON "public"."user_subscriptions";
CREATE POLICY "Users can read own subscription"
  ON "public"."user_subscriptions"
  FOR SELECT
  TO authenticated
  USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Users can update own subscription" ON "public"."user_subscriptions";
CREATE POLICY "Users can update own subscription"
  ON "public"."user_subscriptions"
  FOR UPDATE
  TO authenticated
  USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Learners can create their own wiki feedback" ON "public"."wiki_article_feedback";
CREATE POLICY "Learners can create their own wiki feedback"
  ON "public"."wiki_article_feedback"
  FOR INSERT
  TO authenticated
  WITH CHECK (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Learners can read their own wiki feedback" ON "public"."wiki_article_feedback";
CREATE POLICY "Learners can read their own wiki feedback"
  ON "public"."wiki_article_feedback"
  FOR SELECT
  TO authenticated
  USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Learners can update their own wiki feedback" ON "public"."wiki_article_feedback";
CREATE POLICY "Learners can update their own wiki feedback"
  ON "public"."wiki_article_feedback"
  FOR UPDATE
  TO authenticated
  USING (((select auth.uid()) = user_id))
  WITH CHECK (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Learners can create their own article reads" ON "public"."wiki_article_reads";
CREATE POLICY "Learners can create their own article reads"
  ON "public"."wiki_article_reads"
  FOR INSERT
  TO authenticated
  WITH CHECK (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Learners can read their own article reads" ON "public"."wiki_article_reads";
CREATE POLICY "Learners can read their own article reads"
  ON "public"."wiki_article_reads"
  FOR SELECT
  TO authenticated
  USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Learners can update their own article reads" ON "public"."wiki_article_reads";
CREATE POLICY "Learners can update their own article reads"
  ON "public"."wiki_article_reads"
  FOR UPDATE
  TO authenticated
  USING (((select auth.uid()) = user_id))
  WITH CHECK (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Learners can create their own wiki bookmarks" ON "public"."wiki_bookmarks";
CREATE POLICY "Learners can create their own wiki bookmarks"
  ON "public"."wiki_bookmarks"
  FOR INSERT
  TO authenticated
  WITH CHECK (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Learners can delete their own wiki bookmarks" ON "public"."wiki_bookmarks";
CREATE POLICY "Learners can delete their own wiki bookmarks"
  ON "public"."wiki_bookmarks"
  FOR DELETE
  TO authenticated
  USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Learners can read their own wiki bookmarks" ON "public"."wiki_bookmarks";
CREATE POLICY "Learners can read their own wiki bookmarks"
  ON "public"."wiki_bookmarks"
  FOR SELECT
  TO authenticated
  USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "wb_delete_own" ON "public"."wiki_bookmarks";
CREATE POLICY "wb_delete_own"
  ON "public"."wiki_bookmarks"
  FOR DELETE
  TO authenticated
  USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "wb_insert_own" ON "public"."wiki_bookmarks";
CREATE POLICY "wb_insert_own"
  ON "public"."wiki_bookmarks"
  FOR INSERT
  TO authenticated
  WITH CHECK (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "wb_select_own" ON "public"."wiki_bookmarks";
CREATE POLICY "wb_select_own"
  ON "public"."wiki_bookmarks"
  FOR SELECT
  TO authenticated
  USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "eip_admin_manage" ON "public"."wiki_ei_prompts";
CREATE POLICY "eip_admin_manage"
  ON "public"."wiki_ei_prompts"
  FOR ALL
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = (select auth.uid())) AND ((users.raw_app_meta_data ->> 'role'::text) = 'admin'::text)))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = (select auth.uid())) AND ((users.raw_app_meta_data ->> 'role'::text) = 'admin'::text)))));
DROP POLICY IF EXISTS "eir_admin_read" ON "public"."wiki_ei_responses";
CREATE POLICY "eir_admin_read"
  ON "public"."wiki_ei_responses"
  FOR SELECT
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = (select auth.uid())) AND ((users.raw_app_meta_data ->> 'role'::text) = 'admin'::text)))));
DROP POLICY IF EXISTS "Learners can create their own wiki highlights" ON "public"."wiki_highlights";
CREATE POLICY "Learners can create their own wiki highlights"
  ON "public"."wiki_highlights"
  FOR INSERT
  TO authenticated
  WITH CHECK (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Learners can delete their own wiki highlights" ON "public"."wiki_highlights";
CREATE POLICY "Learners can delete their own wiki highlights"
  ON "public"."wiki_highlights"
  FOR DELETE
  TO authenticated
  USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Learners can read their own wiki highlights" ON "public"."wiki_highlights";
CREATE POLICY "Learners can read their own wiki highlights"
  ON "public"."wiki_highlights"
  FOR SELECT
  TO authenticated
  USING (((select auth.uid()) = user_id));
DROP POLICY IF EXISTS "Learners can update their own wiki highlights" ON "public"."wiki_highlights";
CREATE POLICY "Learners can update their own wiki highlights"
  ON "public"."wiki_highlights"
  FOR UPDATE
  TO authenticated
  USING (((select auth.uid()) = user_id))
  WITH CHECK (((select auth.uid()) = user_id));

-- 0009_duplicate_index: drop exact duplicate indexes after retaining the clearer canonical names.
DROP INDEX IF EXISTS public.idx_readiness_snapshots_user_time;
DROP INDEX IF EXISTS public.idx_user_node_mastery_user_id;

COMMIT;
