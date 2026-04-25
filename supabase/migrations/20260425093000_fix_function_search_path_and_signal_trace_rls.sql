-- Issue summary:
-- - Supabase lint flagged mutable search_path settings on several public RPC/trigger functions.
-- - public.interaction_signal_traces allowed inserts under a policy whose WITH CHECK clause was overly broad.
-- Verification:
-- - bunx supabase db lint --local --fail-on warning
-- - bun run lint src/lib/actions/quiz-v2/submit-answer.ts
-- - bun run type-check

BEGIN;

SET LOCAL search_path = public, extensions, pg_temp;

DO $$
DECLARE
  function_record record;
BEGIN
  FOR function_record IN
    SELECT p.oid::regprocedure AS function_signature
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = ANY (ARRAY[
        'get_fallback_questions',
        'search_wiki_articles_pure',
        'get_unseen_questions',
        'update_user_question_state',
        -- These two live RPCs are surfaced in db-spec.json / generated types,
        -- but their defining migrations are not committed in this worktree.
        'fetch_normalization_batch',
        'search_wiki_articles_hybrid',
        'get_article_with_node',
        'submit_quiz_answer_v2',
        'refresh_user_question_states'
      ])
  LOOP
    EXECUTE format(
      'ALTER FUNCTION %s SET search_path = public, extensions, pg_temp',
      function_record.function_signature
    );
  END LOOP;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.interaction_signal_traces') IS NULL THEN
    RAISE NOTICE 'public.interaction_signal_traces does not exist in this schema snapshot; skipping policy repair.';
    RETURN;
  END IF;

  EXECUTE 'DROP POLICY IF EXISTS "Users can insert signal traces via service role" ON public.interaction_signal_traces';
  -- src/lib/actions/quiz-v2/submit-answer.ts stores traces with createAdminClient(),
  -- so inserts should stay server-only and never open an authenticated client path.
  EXECUTE $policy$
    CREATE POLICY "Users can insert signal traces via service role"
      ON public.interaction_signal_traces
      FOR INSERT
      TO service_role
      WITH CHECK ((SELECT auth.role()) = 'service_role')
  $policy$;
END
$$;

COMMIT;
