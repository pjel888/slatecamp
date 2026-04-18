-- ============================================================
-- Drill / Quiz Data Integrity: Boundary Constraints
-- Enforces valid numeric ranges for scores and difficulty.
-- ============================================================

BEGIN;

-- 1. Accuracy constraints (0.0 to 1.0)
ALTER TABLE public.user_interactions
  ADD CONSTRAINT check_accuracy_range CHECK (accuracy >= 0 AND accuracy <= 1);

-- 2. Mastery constraints (0.0 to 1.0)
ALTER TABLE public.user_node_mastery
  ADD CONSTRAINT check_mastery_weight_range CHECK (current_mastery_weight >= 0 AND current_mastery_weight <= 1);

-- 3. Readiness Score constraints (0 to 100)
ALTER TABLE public.user_global_stats
  ADD CONSTRAINT check_global_readiness_range CHECK (global_readiness_score >= 0 AND global_readiness_score <= 100);

-- 4. Difficulty constraints (0.0 to 1.0)
ALTER TABLE public.taxonomy_tree
  ADD CONSTRAINT check_difficulty_range CHECK (difficulty >= 0 AND difficulty <= 1);

COMMIT;
