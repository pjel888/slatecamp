-- Issue summary:
-- - Real drills E2E exposed "permission denied for table user_question_states"
--   during intelligent question routing.
-- - The table is trigger-maintained from user_interactions and is used as a
--   read model for unseen/remediation/spaced-repetition routing.
-- - Core answer/session persistence does not depend on reading this table, but
--   routing quality and authenticated user history should not silently degrade.
-- Verification:
-- - bun test src/lib/actions/quiz-v2/start-session.test.ts src/lib/actions/quiz-v2/submit-answer.test.ts
-- - bun --env-file=.env.local run test:e2e:drills-real

BEGIN;

SET LOCAL search_path = public, extensions, pg_temp;

ALTER TABLE IF EXISTS public.user_question_states
  ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.user_question_states
  TO service_role;

GRANT SELECT
  ON public.user_question_states
  TO authenticated;

DROP POLICY IF EXISTS "user_question_states_select_own" ON public.user_question_states;
CREATE POLICY "user_question_states_select_own"
  ON public.user_question_states
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_question_states_service_role_all" ON public.user_question_states;
CREATE POLICY "user_question_states_service_role_all"
  ON public.user_question_states
  FOR ALL
  TO service_role
  USING ((SELECT auth.role()) = 'service_role')
  WITH CHECK ((SELECT auth.role()) = 'service_role');

COMMIT;
