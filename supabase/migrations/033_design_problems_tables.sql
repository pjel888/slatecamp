-- ============================================================
-- Migration 033: design_problems + design_problem_sessions
-- Area C preparation system (40% of ALE)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.design_problems (
  problem_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  building_type     TEXT NOT NULL
    CHECK (building_type IN ('residential', 'commercial', 'institutional', 'mixed_use', 'industrial')),
  difficulty        INTEGER CHECK (difficulty BETWEEN 1 AND 4),
  time_limit_minutes INTEGER DEFAULT 180,
  brief             TEXT NOT NULL,
  program           JSONB NOT NULL DEFAULT '{}'::jsonb,
  site_data         JSONB NOT NULL DEFAULT '{}'::jsonb,
  code_references   TEXT[] DEFAULT '{}'::text[],
  is_published      BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.design_problems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dp_select_published" ON public.design_problems
  FOR SELECT TO authenticated USING (is_published = true);
CREATE POLICY "dp_admin_manage" ON public.design_problems
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM auth.users WHERE users.id = auth.uid()
    AND (users.raw_app_meta_data ->> 'role') = 'admin'));

CREATE TABLE IF NOT EXISTS public.design_problem_sessions (
  session_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id             UUID NOT NULL REFERENCES public.design_problems(problem_id) ON DELETE CASCADE,
  started_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at           TIMESTAMPTZ,
  time_elapsed_seconds   INTEGER,
  self_assessment_score  INTEGER CHECK (self_assessment_score BETWEEN 1 AND 5),
  checklist_completion   JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.design_problem_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dps_select_own" ON public.design_problem_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "dps_insert_own" ON public.design_problem_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "dps_update_own" ON public.design_problem_sessions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_design_sessions_user ON public.design_problem_sessions (user_id, started_at DESC);
CREATE INDEX idx_design_sessions_problem ON public.design_problem_sessions (problem_id);
