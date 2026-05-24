-- Remove remaining authenticated access from app SECURITY DEFINER RPCs.
--
-- The application callsites for these functions have been moved to server-side
-- service-role clients, so signed-in browser/PostgREST clients no longer need
-- direct EXECUTE on these elevated functions. service_role remains explicitly
-- allowed for trusted server actions and operational jobs.

BEGIN;

REVOKE ALL ON FUNCTION public.create_notification(uuid, public.notification_type, text, text, jsonb) FROM authenticated;
REVOKE ALL ON FUNCTION public.get_article_with_node(text) FROM authenticated;
REVOKE ALL ON FUNCTION public.get_fallback_questions(uuid[], uuid[], integer) FROM authenticated;
REVOKE ALL ON FUNCTION public.get_review_deck(uuid, integer) FROM authenticated;
REVOKE ALL ON FUNCTION public.get_review_due_count(uuid) FROM authenticated;
REVOKE ALL ON FUNCTION public.get_unseen_questions(uuid, uuid[], integer, numeric, numeric) FROM authenticated;
REVOKE ALL ON FUNCTION public.select_next_item(uuid, uuid, uuid, uuid, double precision) FROM authenticated;
REVOKE ALL ON FUNCTION public.submit_quiz_answer_v2(uuid, uuid, uuid, text, boolean, integer, text, numeric, boolean, integer) FROM authenticated;
REVOKE ALL ON FUNCTION public.update_theta(uuid, uuid, double precision, double precision, boolean) FROM authenticated;

GRANT EXECUTE ON FUNCTION public.create_notification(uuid, public.notification_type, text, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_article_with_node(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_fallback_questions(uuid[], uuid[], integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_review_deck(uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_review_due_count(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_unseen_questions(uuid, uuid[], integer, numeric, numeric) TO service_role;
GRANT EXECUTE ON FUNCTION public.select_next_item(uuid, uuid, uuid, uuid, double precision) TO service_role;
GRANT EXECUTE ON FUNCTION public.submit_quiz_answer_v2(uuid, uuid, uuid, text, boolean, integer, text, numeric, boolean, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_theta(uuid, uuid, double precision, double precision, boolean) TO service_role;

COMMIT;
