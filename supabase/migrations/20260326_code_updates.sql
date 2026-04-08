CREATE TABLE IF NOT EXISTS public.code_updates (
  update_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lea_id TEXT,  -- affected taxonomy node
  code_name TEXT NOT NULL,  -- e.g., "BP 344 IRR 2024"
  summary TEXT NOT NULL,
  previous_value TEXT,
  new_value TEXT,
  effective_date DATE,
  is_lea_testable BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.code_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read code updates" ON public.code_updates FOR SELECT USING (true);
CREATE POLICY "Service role manages updates" ON public.code_updates FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX idx_code_updates_published ON public.code_updates(published_at DESC);
CREATE INDEX idx_code_updates_lea_id ON public.code_updates(lea_id);
