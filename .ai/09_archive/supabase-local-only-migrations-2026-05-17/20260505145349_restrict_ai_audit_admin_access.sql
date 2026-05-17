-- P0 remediation for 2026-05-05 codebase audit.
--
-- The AI audit overview views expose staff-only review data such as article
-- content previews, question text, answer keys/correct_option_id, and finding
-- snippets. The original 20260501085339 migration granted SELECT on those
-- views, and EXECUTE on the status-cache seeding function, to every
-- authenticated user. That was too broad for a learner-facing product.
--
-- Admin AI audit pages query these views through the server-side Supabase
-- service-role client after application-level admin permission checks. Direct
-- PostgREST/RPC access for ordinary authenticated learners should fail closed.

revoke select on public.ai_audit_article_overview from authenticated;
revoke select on public.ai_audit_question_overview from authenticated;
revoke select on public.ai_audit_design_scenario_question_overview from authenticated;
revoke select on public.ai_audit_all_question_overview from authenticated;
revoke select on public.ai_audit_dashboard_summary from authenticated;
revoke select on public.ai_audit_finding_overview from authenticated;

revoke execute on function public.seed_ai_audit_status_cache() from authenticated;

-- Keep server/admin maintenance access available for service-role operations.
grant select on public.ai_audit_article_overview to service_role;
grant select on public.ai_audit_question_overview to service_role;
grant select on public.ai_audit_design_scenario_question_overview to service_role;
grant select on public.ai_audit_all_question_overview to service_role;
grant select on public.ai_audit_dashboard_summary to service_role;
grant select on public.ai_audit_finding_overview to service_role;
grant execute on function public.seed_ai_audit_status_cache() to service_role;

comment on view public.ai_audit_article_overview is
  'Staff-only AI audit article overview. Direct authenticated learner access revoked 2026-05-05; use service-role admin surfaces with app-level permissions.';
comment on view public.ai_audit_question_overview is
  'Staff-only AI audit question overview containing question text and correct_option_id. Direct authenticated learner access revoked 2026-05-05.';
comment on view public.ai_audit_design_scenario_question_overview is
  'Staff-only AI audit design question overview containing answer keys. Direct authenticated learner access revoked 2026-05-05.';
comment on view public.ai_audit_all_question_overview is
  'Staff-only union of sensitive AI audit question views. Direct authenticated learner access revoked 2026-05-05.';
comment on view public.ai_audit_dashboard_summary is
  'Staff-only AI audit dashboard summary. Direct authenticated learner access revoked 2026-05-05.';
comment on view public.ai_audit_finding_overview is
  'Staff-only AI audit finding overview with content/question snippets. Direct authenticated learner access revoked 2026-05-05.';
comment on function public.seed_ai_audit_status_cache() is
  'Service-role-only AI audit cache seeding function. Authenticated learner execute revoked 2026-05-05.';
