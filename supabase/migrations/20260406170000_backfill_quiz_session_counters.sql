WITH session_counts AS (
  SELECT
    qs.session_id,
    COALESCE(stats.answered_count, 0)::INTEGER AS answered_count,
    COALESCE(stats.correct_count, 0)::INTEGER AS correct_count
  FROM public.quiz_sessions qs
  LEFT JOIN (
    SELECT
      ui.session_id,
      COUNT(*)::INTEGER AS answered_count,
      COUNT(*) FILTER (WHERE ui.is_correct IS TRUE)::INTEGER AS correct_count
    FROM public.user_interactions ui
    GROUP BY ui.session_id
  ) stats ON stats.session_id = qs.session_id
)
UPDATE public.quiz_sessions qs
SET
  answered_count = session_counts.answered_count,
  correct_count = session_counts.correct_count,
  updated_at = now()
FROM session_counts
WHERE qs.session_id = session_counts.session_id
  AND (
    qs.answered_count IS DISTINCT FROM session_counts.answered_count
    OR qs.correct_count IS DISTINCT FROM session_counts.correct_count
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'quiz_sessions_answered_count_non_negative'
  ) THEN
    ALTER TABLE public.quiz_sessions
      ADD CONSTRAINT quiz_sessions_answered_count_non_negative
      CHECK (answered_count >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'quiz_sessions_correct_count_non_negative'
  ) THEN
    ALTER TABLE public.quiz_sessions
      ADD CONSTRAINT quiz_sessions_correct_count_non_negative
      CHECK (correct_count >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'quiz_sessions_correct_count_lte_answered_count'
  ) THEN
    ALTER TABLE public.quiz_sessions
      ADD CONSTRAINT quiz_sessions_correct_count_lte_answered_count
      CHECK (correct_count <= answered_count);
  END IF;
END $$;

-- Verification query after deploy:
-- SELECT qs.session_id
-- FROM public.quiz_sessions qs
-- LEFT JOIN (
--   SELECT
--     ui.session_id,
--     COUNT(*)::INTEGER AS answered_count,
--     COUNT(*) FILTER (WHERE ui.is_correct IS TRUE)::INTEGER AS correct_count
--   FROM public.user_interactions ui
--   GROUP BY ui.session_id
-- ) stats ON stats.session_id = qs.session_id
-- WHERE qs.answered_count <> COALESCE(stats.answered_count, 0)
--    OR qs.correct_count <> COALESCE(stats.correct_count, 0);
