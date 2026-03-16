-- Migration 009: Quiz session schema fixes
-- Fixes: missing completed_at, missing is_flagged, behavioral telemetry columns
-- Phase 3 of SlateCamp Testing UX Overhaul

-- Fix 1: Add completed_at to quiz_sessions
-- Required by: getReviewLockStatus() in quiz.ts (currently broken)
ALTER TABLE public.quiz_sessions
  ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;

-- Fix 2: Add is_flagged to user_interactions
-- Required by: QuizRenderer flag persistence (currently silently broken)
ALTER TABLE public.user_interactions
  ADD COLUMN IF NOT EXISTS is_flagged boolean DEFAULT false NOT NULL;

-- Fix 3: Behavioral telemetry columns
-- answer_changes: how many times student changed answer before checking
-- options_eliminated: how many options were struck through at check time
ALTER TABLE public.user_interactions
  ADD COLUMN IF NOT EXISTS answer_changes integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS options_eliminated integer DEFAULT 0 NOT NULL;

-- Update updated_at trigger to cover quiz_sessions
CREATE TRIGGER tr_quiz_sessions_updated_at
  BEFORE UPDATE ON public.quiz_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
