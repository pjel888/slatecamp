-- Fix Supabase database-linter RPC contract failures found during P0 preflight.
-- Non-destructive: reconciles function definitions with the current table contracts.

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

ALTER TABLE public.wiki_articles
  ADD COLUMN IF NOT EXISTS embedding extensions.vector(1536);

CREATE INDEX IF NOT EXISTS idx_wiki_articles_embedding
  ON public.wiki_articles USING hnsw (embedding extensions.vector_cosine_ops);

CREATE OR REPLACE FUNCTION public.get_review_deck(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  node_id TEXT,
  ease_factor DOUBLE PRECISION,
  interval_days DOUBLE PRECISION,
  repetitions INTEGER,
  quality_last INTEGER,
  next_review_at TIMESTAMPTZ,
  last_reviewed_at TIMESTAMPTZ,
  overdue_days DOUBLE PRECISION
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
    c.ease_factor::DOUBLE PRECISION,
    c.interval_days::DOUBLE PRECISION,
    c.repetitions,
    c.quality_last,
    c.next_review_at,
    c.last_reviewed_at,
    (EXTRACT(EPOCH FROM (now() - c.next_review_at)) / 86400.0)::DOUBLE PRECISION AS overdue_days
  FROM public.user_srs_cards c
  WHERE c.user_id = p_user_id
    AND c.next_review_at <= now()
  ORDER BY c.next_review_at ASC
  LIMIT p_limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_unseen_questions(
  p_user_id UUID,
  p_topic_ids UUID[],
  p_limit INTEGER DEFAULT 20,
  p_difficulty_min NUMERIC DEFAULT NULL,
  p_difficulty_max NUMERIC DEFAULT NULL
)
RETURNS TABLE (
  question_id UUID,
  topic_id UUID,
  text TEXT,
  options JSONB,
  difficulty NUMERIC,
  prompt_image_url TEXT,
  question_type TEXT,
  metadata JSONB
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    q.question_id,
    q.topic_id,
    q.text,
    q.options,
    q.difficulty,
    q.prompt_image_url,
    q.question_type,
    '{}'::JSONB AS metadata
  FROM public.questions q
  WHERE q.topic_id = ANY(p_topic_ids)
    AND NOT EXISTS (
      SELECT 1
      FROM public.user_question_states uqs
      WHERE uqs.user_id = p_user_id
        AND uqs.question_id = q.question_id
    )
    AND (p_difficulty_min IS NULL OR q.difficulty >= p_difficulty_min)
    AND (p_difficulty_max IS NULL OR q.difficulty < p_difficulty_max)
  ORDER BY random()
  LIMIT p_limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_fallback_questions(
  p_topic_ids UUID[],
  p_exclude_ids UUID[],
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  question_id UUID,
  topic_id UUID,
  text TEXT,
  options JSONB,
  difficulty NUMERIC,
  prompt_image_url TEXT,
  question_type TEXT,
  metadata JSONB
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    q.question_id,
    q.topic_id,
    q.text,
    q.options,
    q.difficulty,
    q.prompt_image_url,
    q.question_type,
    '{}'::JSONB AS metadata
  FROM public.questions q
  WHERE q.topic_id = ANY(p_topic_ids)
    AND (p_exclude_ids IS NULL OR q.question_id != ALL(p_exclude_ids))
  ORDER BY random()
  LIMIT p_limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.search_wiki_articles_hybrid(
  query_text TEXT,
  query_embedding extensions.vector(1536),
  match_count INTEGER DEFAULT 10,
  fts_weight DOUBLE PRECISION DEFAULT 1.0,
  semantic_weight DOUBLE PRECISION DEFAULT 1.0
)
RETURNS TABLE (
  article_id UUID,
  title TEXT,
  slug TEXT,
  snippet TEXT,
  rank DOUBLE PRECISION
)
LANGUAGE plpgsql
STABLE
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  WITH fts_results AS (
    SELECT
      wa.article_id,
      ts_rank(wa.fts, websearch_to_tsquery('english', query_text))::DOUBLE PRECISION AS fts_rank,
      ts_headline(
        'english',
        wa.content,
        websearch_to_tsquery('english', query_text),
        'MaxWords=25, MinWords=15, ShortWord=3, HighlightAll=FALSE, StartSel="<mark>", StopSel="</mark>"'
      ) AS fts_snippet
    FROM public.wiki_articles wa
    WHERE wa.fts @@ websearch_to_tsquery('english', query_text)
    LIMIT match_count * 2
  ),
  semantic_results AS (
    SELECT
      wa.article_id,
      (1 - (wa.embedding <=> query_embedding))::DOUBLE PRECISION AS semantic_similarity
    FROM public.wiki_articles wa
    WHERE wa.embedding IS NOT NULL
    ORDER BY wa.embedding <=> query_embedding
    LIMIT match_count * 2
  )
  SELECT
    wa.article_id,
    wa.title,
    wa.slug,
    COALESCE(fr.fts_snippet, substring(wa.content FROM 1 FOR 150) || '...') AS snippet,
    (
      COALESCE(fr.fts_rank, 0)::DOUBLE PRECISION * fts_weight
      + COALESCE(sr.semantic_similarity, 0)::DOUBLE PRECISION * semantic_weight
    )::DOUBLE PRECISION AS rank
  FROM public.wiki_articles wa
  LEFT JOIN fts_results fr ON wa.article_id = fr.article_id
  LEFT JOIN semantic_results sr ON wa.article_id = sr.article_id
  WHERE fr.article_id IS NOT NULL OR sr.article_id IS NOT NULL
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_review_deck(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_unseen_questions(UUID, UUID[], INTEGER, NUMERIC, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_fallback_questions(UUID[], UUID[], INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_wiki_articles_hybrid(TEXT, extensions.vector(1536), INTEGER, DOUBLE PRECISION, DOUBLE PRECISION) TO authenticated;
