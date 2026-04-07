-- Migration: 20260407_query_optimization.sql
-- Purpose: Partial indexes, routing RPC, and user capabilities view

-- ============================================================================
-- 1. PARTIAL INDEXES
-- ============================================================================

-- Partial index for published wiki articles (frequently filtered in queries)
CREATE INDEX IF NOT EXISTS idx_wiki_articles_published
ON wiki_articles (article_id)
WHERE status = 'published';

-- Partial index for in-progress quiz sessions (dashboard, resume flow)
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_active
ON quiz_sessions (session_id, user_id)
WHERE status = 'in_progress';

-- ============================================================================
-- 2. UNSEEN QUESTIONS RPC (replaces client-side array exclusion)
-- ============================================================================

-- Returns questions the user has NOT yet interacted with,
-- filtered by topics and optional difficulty range.
-- This avoids passing massive ID arrays through PostgREST.
CREATE OR REPLACE FUNCTION get_unseen_questions(
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
) AS $$
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
    q.metadata
  FROM questions q
  WHERE q.topic_id = ANY(p_topic_ids)
    AND NOT EXISTS (
      SELECT 1 FROM user_question_states uqs
      WHERE uqs.user_id = p_user_id
        AND uqs.question_id = q.question_id
    )
    AND (p_difficulty_min IS NULL OR q.difficulty >= p_difficulty_min)
    AND (p_difficulty_max IS NULL OR q.difficulty < p_difficulty_max)
  ORDER BY random()
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- 3. FALLBACK QUESTIONS RPC (for pool gap-filling)
-- ============================================================================

-- Returns questions not in the provided exclusion set,
-- filtered by topics. Used when the pool is short.
CREATE OR REPLACE FUNCTION get_fallback_questions(
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
) AS $$
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
    q.metadata
  FROM questions q
  WHERE q.topic_id = ANY(p_topic_ids)
    AND (p_exclude_ids IS NULL OR q.question_id != ALL(p_exclude_ids))
  ORDER BY random()
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- 4. USER CAPABILITIES VIEW
-- ============================================================================

-- Adapted: no user_subscriptions table exists, so tier defaults to 'free'.
-- When subscriptions are added, extend this view.
CREATE OR REPLACE VIEW user_capabilities AS
SELECT
  p.user_id,
  p.email,
  'free'::TEXT AS subscription_tier,
  ur.role AS user_role
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id;
