-- Sprint 2: Learning Science Integrations
-- Feature 5: Contextual Variation Practice — application_context column
-- Feature 6: Successive Relearning — no schema changes needed

ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS application_context TEXT;

-- Valid values constraint
ALTER TABLE public.questions
  ADD CONSTRAINT chk_application_context
  CHECK (application_context IS NULL OR application_context IN (
    'recall', 'calculation', 'design_application', 'code_interpretation', 'client_scenario'
  ));

-- Index for contextual variation queries
CREATE INDEX IF NOT EXISTS idx_questions_application_context
  ON public.questions(topic_id, application_context);
