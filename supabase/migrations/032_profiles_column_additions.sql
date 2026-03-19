-- ============================================================
-- Migration 032: profiles column additions
-- Adds columns needed for Sprint 0 feature implementation:
--   reviewer_type (Task 0.4 Retaker Flow)
--   previous_exam_subjects_struggled (Task 0.4)
--   enrolled_review_center (Task 1.5 Review Center)
--   comp_exam_scores (Task 2.3 Comp Exam Bridge)
--   comp_exam_date (Task 2.3)
--   ale_result (Task 0.7 Results Day)
--   oath_taking_date (Task 0.7, Task 2.7 Oath Email)
--   account_mode (Task 2.6 Professional Mode)
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS reviewer_type TEXT DEFAULT 'first_taker'
    CHECK (reviewer_type IN ('first_taker', 'returning_reviewer', 'undergrad', 'dae')),
  ADD COLUMN IF NOT EXISTS previous_exam_subjects_struggled JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS enrolled_review_center TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS comp_exam_scores JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS comp_exam_date DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ale_result TEXT DEFAULT NULL
    CHECK (ale_result IN ('passed', 'failed', 'pending', NULL)),
  ADD COLUMN IF NOT EXISTS oath_taking_date DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS account_mode TEXT DEFAULT 'review_mode'
    CHECK (account_mode IN ('review_mode', 'professional_mode', 'student_mode', 'dae_mode'));

COMMENT ON COLUMN public.profiles.reviewer_type IS
  'Onboarding type. first_taker = first ALE attempt. returning_reviewer = has reviewed before.
   NEVER use "retaker" or "failed" in user-facing copy. Use "returning reviewer" always.';

COMMENT ON COLUMN public.profiles.ale_result IS
  'Set by user on Results Day flow. ''failed'' is stored internally but NEVER shown to user.
   User-facing copy: "returning reviewer", "next cycle", "your data is saved".';

COMMENT ON COLUMN public.profiles.account_mode IS
  'review_mode = default (ALE prep). professional_mode = post-pass.
   student_mode = BSA student (Studio Mode). dae_mode = licensed architect in DAE period.';
