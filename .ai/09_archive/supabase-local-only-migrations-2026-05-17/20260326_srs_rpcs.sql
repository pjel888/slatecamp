-- ============================================================
-- SRS RPCs: Review deck retrieval and due count
-- ============================================================

-- get_review_deck: Returns nodes due for review ordered by overdue priority
CREATE OR REPLACE FUNCTION public.get_review_deck(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  node_id TEXT,
  ease_factor FLOAT,
  interval_days FLOAT,
  repetitions INTEGER,
  quality_last INTEGER,
  next_review_at TIMESTAMPTZ,
  last_reviewed_at TIMESTAMPTZ,
  overdue_days FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.node_id,
    c.ease_factor,
    c.interval_days,
    c.repetitions,
    c.quality_last,
    c.next_review_at,
    c.last_reviewed_at,
    EXTRACT(EPOCH FROM (now() - c.next_review_at)) / 86400.0 AS overdue_days
  FROM public.user_srs_cards c
  WHERE c.user_id = p_user_id
    AND c.next_review_at <= now()
  ORDER BY c.next_review_at ASC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_review_deck(UUID, INTEGER) TO authenticated;


-- get_review_due_count: Returns count of cards due for review (dashboard widget)
CREATE OR REPLACE FUNCTION public.get_review_due_count(
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER
  INTO v_count
  FROM public.user_srs_cards c
  WHERE c.user_id = p_user_id
    AND c.next_review_at <= now();

  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_review_due_count(UUID) TO authenticated;
