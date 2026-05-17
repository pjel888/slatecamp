-- Aggregate answered/correct counters for a quiz session in one round trip.
CREATE OR REPLACE FUNCTION public.get_quiz_session_interaction_stats(
  p_session_id UUID,
  p_user_id UUID
)
RETURNS TABLE (
  answered_count BIGINT,
  correct_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    COUNT(*)::BIGINT AS answered_count,
    COUNT(*) FILTER (WHERE ui.is_correct IS TRUE)::BIGINT AS correct_count
  FROM public.user_interactions ui
  WHERE ui.session_id = p_session_id
    AND ui.user_id = p_user_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_quiz_session_interaction_stats(UUID, UUID) TO authenticated;
