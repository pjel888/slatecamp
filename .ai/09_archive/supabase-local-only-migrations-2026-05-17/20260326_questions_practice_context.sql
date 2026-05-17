ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS practice_context TEXT[] DEFAULT '{}'::text[];

-- GIN index for array overlap queries
CREATE INDEX IF NOT EXISTS idx_questions_practice_context
  ON public.questions USING gin (practice_context)
  WHERE array_length(practice_context, 1) > 0;

-- Values: 'building_permit', 'construction_supervision', 'design_development',
--         'pre_design', 'government_practice', 'contract_administration'
