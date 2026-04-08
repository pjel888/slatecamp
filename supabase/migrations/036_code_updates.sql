-- ============================================================
-- Migration 036: code_updates
-- Track building code changes for targeted user notifications
-- ============================================================

CREATE TABLE IF NOT EXISTS public.code_updates (
  update_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lea_id          TEXT REFERENCES public.taxonomy_tree(lea_id) ON DELETE SET NULL,
  summary         TEXT NOT NULL,
  previous_value  TEXT,
  new_value       TEXT,
  effective_date  DATE,
  is_lea_testable BOOLEAN NOT NULL DEFAULT true,
  published_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.code_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cu_select_all" ON public.code_updates
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "cu_admin_manage" ON public.code_updates
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM auth.users WHERE users.id = auth.uid()
    AND (users.raw_app_meta_data ->> 'role') = 'admin'));

CREATE INDEX idx_code_updates_lea_id ON public.code_updates (lea_id)
  WHERE lea_id IS NOT NULL;
CREATE INDEX idx_code_updates_published ON public.code_updates (published_at DESC);
