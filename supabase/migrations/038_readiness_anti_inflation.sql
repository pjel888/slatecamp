-- ============================================================
-- Migration 038: Readiness Score Anti-Inflation Schema
--
-- Adds 5 columns to user_node_mastery for inflation protection:
--   1. consecutive_correct_streak  (grinding diminishing returns)
--   2. highest_difficulty_correct   (difficulty ceiling enforcement)
--   3. has_bloom_apply_correct      (cognitive level ceiling)
--   4. has_bloom_analyze_correct    (cognitive level ceiling)
--   5. distinct_questions_seen      (question bank depth)
--
-- Adds readiness_sub_scores JSONB to user_global_stats
-- Replaces snapshot trigger to use real sub_scores
--
-- All changes are additive — zero existing data affected.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. user_node_mastery: new columns for inflation vectors
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.user_node_mastery
  ADD COLUMN IF NOT EXISTS consecutive_correct_streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS highest_difficulty_correct SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS has_bloom_apply_correct BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_bloom_analyze_correct BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS distinct_questions_seen INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.user_node_mastery.consecutive_correct_streak IS
  'Consecutive correct answers on this node without interruption.
   Resets to 0 on wrong answer. Used to apply diminishing returns:
   contribution_weight = 1 / (streak ^ 0.7). Prevents grinding easy questions.';

COMMENT ON COLUMN public.user_node_mastery.highest_difficulty_correct IS
  'Highest taxonomy_tree.difficulty (1-4) this user has correctly answered on this node.
   Score ceiling of 70% applies if no Level 3+ questions have been answered correctly
   across all nodes. Updated only on correct answers.';

COMMENT ON COLUMN public.user_node_mastery.has_bloom_apply_correct IS
  'True once user correctly answers an apply-level question on this node.
   One-way flag — never resets. Used for Bloom cognitive ceiling enforcement.';

COMMENT ON COLUMN public.user_node_mastery.has_bloom_analyze_correct IS
  'True once user correctly answers an analyze-level question on this node.
   One-way flag — never resets. Used for Bloom cognitive ceiling enforcement.';

COMMENT ON COLUMN public.user_node_mastery.distinct_questions_seen IS
  'Count of unique question_ids answered (any result) for this node.
   < 5 → node contributes at 40% weight (thin_coverage state in heatmap)
   5-9 → node contributes at 85% weight
   >= 10 → node contributes at 100% weight
   Prevents question bank memorization at low question counts.';

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_node_mastery_difficulty
  ON public.user_node_mastery (user_id, highest_difficulty_correct)
  WHERE highest_difficulty_correct > 0;

CREATE INDEX IF NOT EXISTS idx_node_mastery_bloom
  ON public.user_node_mastery (user_id, has_bloom_analyze_correct)
  WHERE has_bloom_analyze_correct = true;

-- ─────────────────────────────────────────────────────────────
-- 2. user_global_stats: sub_scores storage column
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.user_global_stats
  ADD COLUMN IF NOT EXISTS readiness_sub_scores JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.user_global_stats.readiness_sub_scores IS
  'Per-subject sub-scores written by lib/readiness-score.ts after each session.
   Read by snapshot trigger to populate readiness_score_snapshots.sub_scores.
   Also read by SubjectFloorAlert component and HeroCommandBar ceiling display.';

-- ─────────────────────────────────────────────────────────────
-- 3. Replace snapshot trigger to use real sub_scores
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.snapshot_readiness_on_session_complete()
RETURNS trigger LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO public.readiness_score_snapshots (
      user_id, score, sub_scores, session_id, is_proof_simulation, computed_at
    )
    SELECT
      NEW.user_id,
      ugs.global_readiness_score,
      ugs.readiness_sub_scores,    -- WAS: '{}'::jsonb — now reads real computed sub_scores
      NEW.session_id,
      COALESCE(NEW.is_proof_simulation, false),
      NOW()
    FROM public.user_global_stats ugs
    WHERE ugs.user_id = NEW.user_id
      AND ugs.global_readiness_score IS NOT NULL
      AND ugs.global_readiness_score > 0;
  END IF;
  RETURN NEW;
END;
$$;
