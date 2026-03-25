-- =============================================================
-- MIGRATION: Add missing indexes for critical query paths
-- Date: 2026-03-26
-- Source: Performance Implementation Roadmap §2a
-- Impact: Quiz engine, content lookups, analytics, trails
-- Risk: Low (additive, no schema change)
-- =============================================================

-- Quiz engine (highest traffic tables)
CREATE INDEX IF NOT EXISTS idx_questions_topic_id
  ON public.questions(topic_id);

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id
  ON public.quiz_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id
  ON public.user_interactions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_interactions_question_id
  ON public.user_interactions(question_id);

-- Composite index for common quiz session access pattern
-- (fetching a user's sessions filtered by status)
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id_status
  ON public.quiz_sessions(user_id, status);

-- Composite index for user interactions by session
-- (loading all interactions for a specific session)
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id_session
  ON public.user_interactions(user_id, session_id);

-- Content lookups
CREATE INDEX IF NOT EXISTS idx_wiki_article_taxonomy_node_id
  ON public.wiki_article_taxonomy(node_id);

CREATE INDEX IF NOT EXISTS idx_spatial_hotspots_model_id
  ON public.spatial_hotspots(model_id);

CREATE INDEX IF NOT EXISTS idx_spatial_hotspots_node_id
  ON public.spatial_hotspots(node_id);

-- Analytics (readiness trajectory chart)
CREATE INDEX IF NOT EXISTS idx_readiness_snapshots_user_id
  ON public.readiness_score_snapshots(user_id);

CREATE INDEX IF NOT EXISTS idx_readiness_snapshots_user_id_created
  ON public.readiness_score_snapshots(user_id, created_at DESC);

-- Trail completions
CREATE INDEX IF NOT EXISTS idx_trail_day_completions_user_id
  ON public.trail_day_completions(user_id);

CREATE INDEX IF NOT EXISTS idx_trail_day_completions_day_id
  ON public.trail_day_completions(day_id);

-- Mastery engine (the core analytical table)
CREATE INDEX IF NOT EXISTS idx_user_node_mastery_user_id
  ON public.user_node_mastery(user_id);

CREATE INDEX IF NOT EXISTS idx_user_node_mastery_user_id_node
  ON public.user_node_mastery(user_id, node_id);
