-- Issue summary:
-- - Supabase lint flagged mutable search_path settings on several public RPC/trigger functions.
-- - public.interaction_signal_traces allowed inserts under a policy whose WITH CHECK clause was overly broad.
-- Verification:
-- - bunx supabase db lint --local --fail-on warning
-- - bun run lint src/lib/actions/quiz-v2/submit-answer.ts
-- - bun run type-check

BEGIN;

SET LOCAL search_path = public, extensions;

ALTER FUNCTION IF EXISTS public.get_fallback_questions(uuid[], uuid[], integer)
  SET search_path = public, extensions;

ALTER FUNCTION IF EXISTS public.search_wiki_articles_pure(text, integer)
  SET search_path = public, extensions;

ALTER FUNCTION IF EXISTS public.get_unseen_questions(uuid, uuid[], integer, numeric, numeric)
  SET search_path = public, extensions;

ALTER FUNCTION IF EXISTS public.update_user_question_state()
  SET search_path = public, extensions;

ALTER FUNCTION IF EXISTS public.fetch_normalization_batch(integer)
  SET search_path = public, extensions;

ALTER FUNCTION IF EXISTS public.search_wiki_articles_hybrid(text, vector, integer, double precision, double precision)
  SET search_path = public, extensions;

ALTER FUNCTION IF EXISTS public.get_article_with_node(text)
  SET search_path = public, extensions;

ALTER FUNCTION IF EXISTS public.submit_quiz_answer_v2(uuid, uuid, uuid, text, boolean, integer, text, numeric, boolean, integer)
  SET search_path = public, extensions;

ALTER FUNCTION IF EXISTS public.refresh_user_question_states()
  SET search_path = public, extensions;

DO $$
BEGIN
  IF to_regclass('public.interaction_signal_traces') IS NULL THEN
    RAISE NOTICE 'public.interaction_signal_traces does not exist in this schema snapshot; skipping policy repair.';
    RETURN;
  END IF;

  EXECUTE 'DROP POLICY IF EXISTS "Users can insert signal traces via service role" ON public.interaction_signal_traces';
  EXECUTE $policy$
    CREATE POLICY "Users can insert signal traces via service role"
      ON public.interaction_signal_traces
      FOR INSERT
      TO authenticated, service_role
      WITH CHECK (
        (SELECT auth.role()) = 'service_role'
        OR public.has_admin_role()
      )
  $policy$;
END
$$;

COMMIT;
