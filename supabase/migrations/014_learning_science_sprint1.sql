-- Sprint 1: Learning Science Integrations
-- Adds preferred_study_window to profiles for sleep-aware scheduling

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_study_window TEXT DEFAULT 'any';

-- Ensure valid values
ALTER TABLE public.profiles
  ADD CONSTRAINT chk_preferred_study_window
  CHECK (preferred_study_window IN ('morning', 'evening', 'both', 'any'));
