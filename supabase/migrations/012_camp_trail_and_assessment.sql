-- ============================================================
-- Migration 012: Camp Trail + Assessment Pipeline
-- Applied via Supabase MCP on 2026-03-19
-- Adds: 4 enums, 7 tables, assessment columns, integration columns,
--        RLS policies, indexes, and triggers
-- ============================================================

-- A. New Enums
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trail_type') THEN
    CREATE TYPE public.trail_type AS ENUM ('time_gated','subject_mastery','code_deep_dive','remediation','exam_simulation');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trail_intensity') THEN
    CREATE TYPE public.trail_intensity AS ENUM ('intensive','accelerated','standard','comprehensive','undergraduate');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trail_step_type') THEN
    CREATE TYPE public.trail_step_type AS ENUM ('quiz','wiki','lab','review');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trail_enrollment_status') THEN
    CREATE TYPE public.trail_enrollment_status AS ENUM ('active','paused','completed','abandoned');
  END IF;
END $$;

-- B. New Tables
CREATE TABLE IF NOT EXISTS public.camp_trails (
    trail_id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    discipline_id uuid NOT NULL REFERENCES public.disciplines(discipline_id),
    name text NOT NULL, slug text NOT NULL UNIQUE,
    description text, trail_type public.trail_type NOT NULL,
    intensity public.trail_intensity, duration_days integer NOT NULL,
    total_steps integer NOT NULL DEFAULT 0,
    is_published boolean NOT NULL DEFAULT false, is_featured boolean NOT NULL DEFAULT false,
    recommended_min_score double precision, recommended_max_score double precision,
    created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.trail_days (
    day_id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    trail_id uuid NOT NULL REFERENCES public.camp_trails(trail_id) ON DELETE CASCADE,
    day_number integer NOT NULL, title text NOT NULL, description text,
    estimated_minutes integer DEFAULT 60, created_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE (trail_id, day_number)
);

CREATE TABLE IF NOT EXISTS public.trail_steps (
    step_id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    day_id uuid NOT NULL REFERENCES public.trail_days(day_id) ON DELETE CASCADE,
    step_order integer NOT NULL, step_type public.trail_step_type NOT NULL,
    title text NOT NULL, description text,
    target_node_ids uuid[] DEFAULT '{}', question_count integer,
    difficulty_min double precision DEFAULT 0.0, difficulty_max double precision DEFAULT 1.0,
    article_id uuid REFERENCES public.wiki_articles(article_id) ON DELETE SET NULL,
    model_id uuid REFERENCES public.models_3d(model_id) ON DELETE SET NULL,
    estimated_minutes integer DEFAULT 15, is_optional boolean DEFAULT false NOT NULL,
    preferred_time text, created_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE (day_id, step_order)
);

CREATE TABLE IF NOT EXISTS public.user_trail_enrollments (
    enrollment_id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    trail_id uuid NOT NULL REFERENCES public.camp_trails(trail_id),
    status public.trail_enrollment_status DEFAULT 'active' NOT NULL,
    current_day integer DEFAULT 1 NOT NULL, days_completed integer DEFAULT 0 NOT NULL,
    last_activity_at timestamptz,
    started_at timestamptz DEFAULT now() NOT NULL, paused_at timestamptz,
    completed_at timestamptz, target_completion_date timestamptz,
    readiness_score_at_start double precision, pace_status text DEFAULT 'on_track',
    created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE (user_id, trail_id)
);

CREATE TABLE IF NOT EXISTS public.user_trail_progress (
    progress_id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    enrollment_id uuid NOT NULL REFERENCES public.user_trail_enrollments(enrollment_id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    step_id uuid NOT NULL REFERENCES public.trail_steps(step_id),
    completed_at timestamptz DEFAULT now() NOT NULL,
    session_id uuid REFERENCES public.quiz_sessions(session_id) ON DELETE SET NULL,
    time_spent_ms integer, UNIQUE (enrollment_id, step_id)
);

CREATE TABLE IF NOT EXISTS public.trail_day_completions (
    day_completion_id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    enrollment_id uuid NOT NULL REFERENCES public.user_trail_enrollments(enrollment_id) ON DELETE CASCADE,
    day_id uuid NOT NULL REFERENCES public.trail_days(day_id),
    user_id uuid NOT NULL REFERENCES auth.users(id),
    completed_at timestamptz DEFAULT now() NOT NULL,
    readiness_score_at_completion double precision, UNIQUE (enrollment_id, day_id)
);

CREATE TABLE IF NOT EXISTS public.session_trail_credits (
    session_id uuid NOT NULL REFERENCES public.quiz_sessions(session_id) ON DELETE CASCADE,
    enrollment_id uuid NOT NULL REFERENCES public.user_trail_enrollments(enrollment_id) ON DELETE CASCADE,
    step_id uuid NOT NULL REFERENCES public.trail_steps(step_id),
    credited_at timestamptz DEFAULT now() NOT NULL,
    PRIMARY KEY (session_id, enrollment_id, step_id)
);

-- C. Assessment columns
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS is_assessment boolean DEFAULT false;
ALTER TABLE public.user_global_stats ADD COLUMN IF NOT EXISTS assessment_completed_at timestamptz;
ALTER TABLE public.user_global_stats ADD COLUMN IF NOT EXISTS assessment_score double precision;

-- D. Integration columns
ALTER TABLE public.quiz_sessions ADD COLUMN IF NOT EXISTS pre_session_confidence_ratings jsonb DEFAULT '{}';
ALTER TABLE public.user_interactions ADD COLUMN IF NOT EXISTS error_type text;

-- E. RLS Policies
ALTER TABLE public.camp_trails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "camp_trails_select_authenticated" ON public.camp_trails FOR SELECT TO authenticated USING (true);
ALTER TABLE public.trail_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trail_days_select_authenticated" ON public.trail_days FOR SELECT TO authenticated USING (true);
ALTER TABLE public.trail_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trail_steps_select_authenticated" ON public.trail_steps FOR SELECT TO authenticated USING (true);
ALTER TABLE public.user_trail_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "enrollments_select_own" ON public.user_trail_enrollments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "enrollments_insert_own" ON public.user_trail_enrollments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "enrollments_update_own" ON public.user_trail_enrollments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
ALTER TABLE public.user_trail_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "progress_select_own" ON public.user_trail_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "progress_insert_own" ON public.user_trail_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
ALTER TABLE public.trail_day_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "day_completions_select_own" ON public.trail_day_completions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "day_completions_insert_own" ON public.trail_day_completions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
ALTER TABLE public.session_trail_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "credits_select_own" ON public.session_trail_credits FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_trail_enrollments e WHERE e.enrollment_id = session_trail_credits.enrollment_id AND e.user_id = auth.uid()));
CREATE POLICY "credits_insert_own" ON public.session_trail_credits FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.user_trail_enrollments e WHERE e.enrollment_id = session_trail_credits.enrollment_id AND e.user_id = auth.uid()));

-- F. Indexes
CREATE INDEX IF NOT EXISTS idx_trail_enrollments_user ON public.user_trail_enrollments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_trail_enrollments_trail ON public.user_trail_enrollments(trail_id, status);
CREATE INDEX IF NOT EXISTS idx_trail_progress_enrollment ON public.user_trail_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_trail_progress_user ON public.user_trail_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_day_completions_enrollment ON public.trail_day_completions(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_questions_assessment ON public.questions(is_assessment) WHERE is_assessment = true;

-- G. Triggers
CREATE OR REPLACE FUNCTION public.update_enrollment_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_enrollment_updated_at ON public.user_trail_enrollments;
CREATE TRIGGER trg_enrollment_updated_at BEFORE UPDATE ON public.user_trail_enrollments FOR EACH ROW EXECUTE FUNCTION public.update_enrollment_updated_at();

CREATE OR REPLACE FUNCTION public.update_enrollment_on_progress() RETURNS TRIGGER AS $$ BEGIN UPDATE public.user_trail_enrollments SET last_activity_at = now() WHERE enrollment_id = NEW.enrollment_id; RETURN NEW; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_progress_update_enrollment ON public.user_trail_progress;
CREATE TRIGGER trg_progress_update_enrollment AFTER INSERT ON public.user_trail_progress FOR EACH ROW EXECUTE FUNCTION public.update_enrollment_on_progress();

CREATE OR REPLACE FUNCTION public.update_enrollment_on_day_completion() RETURNS TRIGGER AS $$ BEGIN UPDATE public.user_trail_enrollments SET days_completed = days_completed + 1, current_day = GREATEST(current_day, (SELECT day_number + 1 FROM public.trail_days WHERE day_id = NEW.day_id)), last_activity_at = now() WHERE enrollment_id = NEW.enrollment_id; RETURN NEW; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_day_completion_update_enrollment ON public.trail_day_completions;
CREATE TRIGGER trg_day_completion_update_enrollment AFTER INSERT ON public.trail_day_completions FOR EACH ROW EXECUTE FUNCTION public.update_enrollment_on_day_completion();
