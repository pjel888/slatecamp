-- ============================================================
-- Migration 035: oath_taking_schedules
-- Track PRC oath-taking dates for automated email triggers
-- ============================================================

CREATE TABLE IF NOT EXISTS public.oath_taking_schedules (
  schedule_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oath_date    DATE NOT NULL,
  region       TEXT NOT NULL,
  venue        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.oath_taking_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ots_select_all" ON public.oath_taking_schedules
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "ots_admin_manage" ON public.oath_taking_schedules
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM auth.users WHERE users.id = auth.uid()
    AND (users.raw_app_meta_data ->> 'role') = 'admin'));
