ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS irt_difficulty FLOAT DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS irt_discrimination FLOAT DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS irt_guessing FLOAT DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS irt_calibrated_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_questions_irt_params
  ON public.questions(topic_id, irt_difficulty, irt_discrimination)
  WHERE irt_discrimination > 0;

-- Backfill from difficulty_label
UPDATE public.questions SET irt_difficulty = CASE
  WHEN difficulty_label = 'easy' THEN -1.5
  WHEN difficulty_label = 'medium' THEN 0.0
  WHEN difficulty_label = 'hard' THEN 1.5
  ELSE 0.0
END WHERE irt_difficulty = 0.0;
