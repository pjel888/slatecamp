-- ══════════════════════════════════════════════════════════════════════════════
-- Quiz Engine v2: saved_session_configs table
-- Doc 03 §2.3 — Stores Custom Session presets for reuse
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.saved_session_configs (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT 'Custom Preset',
  config      JSONB NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_session_configs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_saved_configs_user
  ON public.saved_session_configs(user_id);

-- RLS: Users can fully manage their own presets
CREATE POLICY "Users can CRUD own configs"
  ON public.saved_session_configs FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Auto-update updated_at on modification
CREATE OR REPLACE TRIGGER tr_saved_session_configs_updated_at
  BEFORE UPDATE ON public.saved_session_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
