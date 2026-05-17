-- ============================================================
-- Migration 039: Camp Trail UX Enhancements
-- Adds columns needed for the full Camp Trail UX spec:
--   - trail_days: subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name
--   - trail_steps: is_computation_heavy, lab_phase
--   - camp_trails: daily_time_estimate_minutes, subjects_covered, is_free
--   - trail_day_completions: mastery_before, mastery_after, all_steps_completed, day_number
--   - user_trail_enrollments: days_completed_at_abandon, abandoned_at
-- ============================================================

-- A. camp_trails enhancements
ALTER TABLE public.camp_trails
  ADD COLUMN IF NOT EXISTS daily_time_estimate_minutes integer NOT NULL DEFAULT 90,
  ADD COLUMN IF NOT EXISTS subjects_covered text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_free boolean NOT NULL DEFAULT false;

-- B. trail_days enhancements
ALTER TABLE public.trail_days
  ADD COLUMN IF NOT EXISTS subject_focus text,
  ADD COLUMN IF NOT EXISTS subject_color text,
  ADD COLUMN IF NOT EXISTS is_rest_day boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_phase_transition boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS phase_name text;

-- C. trail_steps enhancements
ALTER TABLE public.trail_steps
  ADD COLUMN IF NOT EXISTS is_computation_heavy boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS lab_phase text;

-- D. trail_day_completions enhancements
ALTER TABLE public.trail_day_completions
  ADD COLUMN IF NOT EXISTS mastery_before jsonb,
  ADD COLUMN IF NOT EXISTS mastery_after jsonb,
  ADD COLUMN IF NOT EXISTS all_steps_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS day_number integer;

-- E. user_trail_enrollments enhancements
ALTER TABLE public.user_trail_enrollments
  ADD COLUMN IF NOT EXISTS days_completed_at_abandon integer,
  ADD COLUMN IF NOT EXISTS abandoned_at timestamptz;

-- F. Backfill day_number in trail_day_completions from trail_days
UPDATE public.trail_day_completions tdc
SET day_number = td.day_number
FROM public.trail_days td
WHERE td.day_id = tdc.day_id AND tdc.day_number IS NULL;
