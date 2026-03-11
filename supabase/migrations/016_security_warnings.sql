-- =============================================================
-- Migration 016: Fix Supabase Security Warnings
-- =============================================================
-- Addresses:
--   1. function_search_path_mutable — 5 functions missing SET search_path
--   2. materialized_view_in_api    — question_user_performance exposed to API
--
-- NOT addressed here (manual steps required):
--   3. extension_in_public (vector) — moving extensions between schemas is
--      destructive; do it via Supabase Dashboard > Database > Extensions.
--   4. auth_leaked_password_protection — enable in Supabase Dashboard >
--      Authentication > Providers > Password > Leaked Password Protection.
-- =============================================================


-- =============================================================
-- 1. FIX: wiki_pages_fts_trigger — SET search_path = ''
--    (trigger body uses only pg_catalog functions + NEW row; no table refs)
-- =============================================================
CREATE OR REPLACE FUNCTION public.wiki_pages_fts_trigger()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fts_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.markdown_content, '')), 'C');
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';


-- =============================================================
-- 2. FIX: search_wiki — SET search_path = public
-- =============================================================
CREATE OR REPLACE FUNCTION public.search_wiki(search_term TEXT, max_results INT DEFAULT 20)
RETURNS TABLE (
    id UUID,
    title TEXT,
    slug TEXT,
    category_id UUID,
    tags TEXT[],
    is_deprecated BOOLEAN,
    is_free BOOLEAN,
    headline TEXT,
    rank REAL
) AS $$
DECLARE
    tsquery_val TSQUERY;
BEGIN
    tsquery_val := websearch_to_tsquery('english', search_term);
    RETURN QUERY
    SELECT
        wp.id, wp.title, wp.slug, wp.category_id, wp.tags,
        wp.is_deprecated, wp.is_free,
        ts_headline('english', wp.markdown_content, tsquery_val,
            'StartSel=<mark>, StopSel=</mark>, MaxWords=60, MinWords=20') AS headline,
        ts_rank_cd(wp.fts_vector, tsquery_val) AS rank
    FROM public.wiki_pages wp
    WHERE wp.fts_vector @@ tsquery_val
    ORDER BY rank DESC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;


-- =============================================================
-- 3. FIX: search_wiki_paginated — SET search_path = public
-- =============================================================
CREATE OR REPLACE FUNCTION public.search_wiki_paginated(
  search_term TEXT,
  subject_slug TEXT DEFAULT NULL,
  page_offset INT DEFAULT 0,
  page_limit INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  headline TEXT,
  tags TEXT[],
  category_id UUID,
  is_deprecated BOOLEAN,
  is_free BOOLEAN,
  rank REAL,
  total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tsq TSQUERY;
BEGIN
  tsq := websearch_to_tsquery('english', search_term);

  RETURN QUERY
  WITH matched AS (
    SELECT
      wp.id,
      wp.title,
      wp.slug,
      ts_headline(
        'english',
        wp.markdown_content,
        tsq,
        'MaxWords=20,MinWords=10,StartSel=<mark>,StopSel=</mark>'
      ) AS headline,
      wp.tags,
      wp.category_id,
      wp.is_deprecated,
      wp.is_free,
      ts_rank(wp.fts_vector, tsq) AS rank
    FROM public.wiki_pages wp
    JOIN public.wiki_categories wc ON wc.id = wp.category_id
    LEFT JOIN public.wiki_categories root_cat ON (
      CASE WHEN wc.parent_id IS NULL THEN wc.id ELSE wc.parent_id END = root_cat.id
    )
    WHERE
      wp.fts_vector @@ tsq
      AND (subject_slug IS NULL OR root_cat.slug = subject_slug)
    ORDER BY rank DESC
  )
  SELECT
    m.*,
    COUNT(*) OVER () AS total_count
  FROM matched m
  LIMIT page_limit
  OFFSET page_offset;
END;
$$;


-- =============================================================
-- 4. FIX: compute_readiness_score — SET search_path = public
-- =============================================================
CREATE OR REPLACE FUNCTION public.compute_readiness_score(p_exam_profile_id UUID)
RETURNS TABLE(
  score INTEGER,
  accuracy_score NUMERIC,
  coverage_score NUMERIC,
  srs_health_score NUMERIC,
  recency_score NUMERIC,
  weak_area_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_accuracy NUMERIC := 0;
  v_coverage NUMERIC := 0;
  v_srs_health NUMERIC := 50;
  v_recency NUMERIC := 0;
  v_weak_area NUMERIC := 100;
  v_total_questions BIGINT;
  v_answered_questions BIGINT;
  v_total_correct BIGINT;
  v_total_answered BIGINT;
  v_days_since_last NUMERIC;
  v_board_exam_id UUID;
  v_user_id UUID;
  v_weak_count NUMERIC := 0;
  v_total_subjects NUMERIC := 0;
  v_srs_total BIGINT;
  v_srs_not_overdue BIGINT;
BEGIN
  -- Get context
  SELECT ep.board_exam_id, ep.user_id INTO v_board_exam_id, v_user_id
  FROM public.exam_profiles ep WHERE ep.id = p_exam_profile_id;

  -- Accuracy: rolling 30-day
  SELECT COALESCE(SUM(CASE WHEN sq.is_correct THEN 1 ELSE 0 END), 0),
         COALESCE(COUNT(*) FILTER (WHERE sq.is_correct IS NOT NULL), 0)
  INTO v_total_correct, v_total_answered
  FROM public.session_questions sq
  JOIN public.review_sessions rs ON sq.session_id = rs.id
  WHERE rs.exam_profile_id = p_exam_profile_id
    AND sq.answered_at >= NOW() - INTERVAL '30 days';

  IF v_total_answered > 0 THEN
    v_accuracy := (v_total_correct::NUMERIC / v_total_answered) * 100;
  END IF;

  -- Coverage
  SELECT COUNT(DISTINCT id) INTO v_total_questions
  FROM public.questions WHERE subject_id IN (
    SELECT id FROM public.subjects WHERE board_exam_id = v_board_exam_id
  ) AND status = 'published';

  SELECT COUNT(DISTINCT sq.question_id) INTO v_answered_questions
  FROM public.session_questions sq
  JOIN public.review_sessions rs ON sq.session_id = rs.id
  WHERE rs.exam_profile_id = p_exam_profile_id
    AND sq.is_correct IS NOT NULL;

  IF v_total_questions > 0 THEN
    v_coverage := (v_answered_questions::NUMERIC / v_total_questions) * 100;
  END IF;

  -- SRS Health
  SELECT COUNT(*) INTO v_srs_total FROM public.srs_queue WHERE exam_profile_id = p_exam_profile_id;
  IF v_srs_total > 0 THEN
    SELECT COUNT(*) INTO v_srs_not_overdue FROM public.srs_queue
    WHERE exam_profile_id = p_exam_profile_id AND next_review_at >= NOW();
    v_srs_health := (v_srs_not_overdue::NUMERIC / v_srs_total) * 100;
  END IF;

  -- Recency
  SELECT EXTRACT(EPOCH FROM (NOW() - MAX(rs.completed_at))) / 86400
  INTO v_days_since_last
  FROM public.review_sessions rs
  WHERE rs.exam_profile_id = p_exam_profile_id AND rs.status = 'completed';

  IF v_days_since_last IS NULL THEN
    v_recency := 0;
  ELSIF v_days_since_last < 1 THEN
    v_recency := 100;
  ELSIF v_days_since_last < 2 THEN
    v_recency := 80;
  ELSIF v_days_since_last < 4 THEN
    v_recency := 60;
  ELSIF v_days_since_last < 8 THEN
    v_recency := 40;
  ELSIF v_days_since_last < 15 THEN
    v_recency := 20;
  ELSE
    v_recency := 0;
  END IF;

  -- Weak Area Score
  SELECT COUNT(*), COUNT(*) FILTER (WHERE sm.mastery_score < 60)
  INTO v_total_subjects, v_weak_count
  FROM public.subject_mastery sm
  WHERE sm.exam_profile_id = p_exam_profile_id AND sm.total_attempted > 0;

  IF v_total_subjects > 0 THEN
    v_weak_area := 100 - ((v_weak_count / v_total_subjects) * 100);
  END IF;

  RETURN QUERY SELECT
    ROUND(
      v_accuracy * 0.30 +
      v_coverage * 0.25 +
      v_srs_health * 0.20 +
      v_recency * 0.15 +
      v_weak_area * 0.10
    )::INTEGER AS score,
    ROUND(v_accuracy, 1) AS accuracy_score,
    ROUND(v_coverage, 1) AS coverage_score,
    ROUND(v_srs_health, 1) AS srs_health_score,
    ROUND(v_recency, 1) AS recency_score,
    ROUND(v_weak_area, 1) AS weak_area_score;
END;
$$;


-- =============================================================
-- 5. FIX: match_documents — SET search_path = public
--    (vector extension is currently in public schema)
-- =============================================================
CREATE OR REPLACE FUNCTION public.match_documents(
    query_embedding VECTOR(1536),
    match_threshold FLOAT,
    match_count INT,
    filter_user_id UUID
) RETURNS TABLE (id UUID, content TEXT, similarity FLOAT) AS $$
BEGIN
    RETURN QUERY
    SELECT dc.id, dc.content,
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM public.document_chunks dc
    JOIN public.documents d ON dc.document_id = d.id
    WHERE d.user_id = filter_user_id
        AND 1 - (dc.embedding <=> query_embedding) > match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql SET search_path = public;


-- =============================================================
-- 6. FIX: materialized_view_in_api
--    Revoke direct API access to question_user_performance.
--    The view has no RLS support, so any authenticated user could
--    read every user's performance data through the REST API.
--    The app queries it through server-side actions (service role)
--    so removing anon/authenticated access is safe.
-- =============================================================
REVOKE SELECT ON public.question_user_performance FROM anon, authenticated;
