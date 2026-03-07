-- Add multi-select support and media URL to questions
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS is_multi_select BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS media_url TEXT;

COMMENT ON COLUMN public.questions.is_multi_select IS 'If true, question accepts multiple correct answers (checkbox). If false, single answer (radio).';
COMMENT ON COLUMN public.questions.media_url IS 'Primary media asset (image, diagram, 3D model ref) shown above the question prompt.';
