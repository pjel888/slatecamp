ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS dae_work_contexts TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS dae_contexts_updated_at TIMESTAMPTZ DEFAULT NULL;
