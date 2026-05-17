-- ============================================================
-- Absolute Unification: Pre-Launch Backend Alignment
-- Renames legacy identifiers to match unified app-layer keys.
-- ============================================================

BEGIN;

-- 1. Rename Enum Values for TEST_MODE
-- Note: PostgreSQL doesn't support RENAME VALUE until v10, 
-- but we are on v17 (Supabase default).
ALTER TYPE public.test_mode RENAME VALUE 'blindspot' TO 'focus_review';
ALTER TYPE public.test_mode RENAME VALUE 'proof_sim' TO 'full_exam';
ALTER TYPE public.test_mode RENAME VALUE 'practice' TO 'subject';
ALTER TYPE public.test_mode ADD VALUE IF NOT EXISTS 'article_review';

-- 2. Rename Tables
ALTER TABLE IF EXISTS public.blindspot_queues RENAME TO focus_review_queues;

-- 3. Rename Columns in user_global_stats
ALTER TABLE public.user_global_stats RENAME COLUMN proof_simulation_unlocked_at TO full_exam_unlocked_at;
ALTER TABLE public.user_global_stats RENAME COLUMN simulation_count TO full_exam_count;
ALTER TABLE public.user_global_stats RENAME COLUMN last_simulation_score TO last_full_exam_score;
ALTER TABLE public.user_global_stats RENAME COLUMN best_simulation_score TO best_full_exam_score;

-- 4. Rename Columns in quiz_sessions
ALTER TABLE public.quiz_sessions RENAME COLUMN is_proof_simulation TO is_full_exam;
ALTER TABLE public.quiz_sessions RENAME COLUMN is_endurance_session TO is_endurance;

-- 5. Update existing data (Backfill)
-- Ensure 'article_review' is correctly typed if it was previously 'practice'
-- Since we are pre-launch, we can also just wipe if preferred, but let's be surgical.
UPDATE public.quiz_sessions 
SET test_mode = 'article_review'::public.test_mode
WHERE test_mode = 'subject'::public.test_mode 
  AND config->'setup'->>'isArticleReview' = 'true';

COMMIT;
