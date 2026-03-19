-- ============================================================
-- Migration 037: questions.practice_context
-- DAE Mode context tags for practice-aware question filtering
-- ============================================================

ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS practice_context TEXT[] DEFAULT '{}'::text[];

COMMENT ON COLUMN public.questions.practice_context IS
  'DAE Mode context tags. Values: building_permit, construction_supervision, design_development,
   pre_design, government_practice, contract_administration.
   Used by DAE Mode (Task 3.1) to surface contextually relevant questions.';

CREATE INDEX IF NOT EXISTS idx_questions_practice_context
  ON public.questions USING gin (practice_context)
  WHERE array_length(practice_context, 1) > 0;
