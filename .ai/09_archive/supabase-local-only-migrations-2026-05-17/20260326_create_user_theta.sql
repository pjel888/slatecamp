CREATE TABLE IF NOT EXISTS public.user_theta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  discipline_id UUID REFERENCES public.disciplines(discipline_id) ON DELETE CASCADE,
  theta FLOAT NOT NULL DEFAULT 0.0,
  theta_se FLOAT NOT NULL DEFAULT 1.0,
  responses_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, discipline_id),
  CHECK (theta BETWEEN -4 AND 4)
);

CREATE INDEX IF NOT EXISTS idx_user_theta_user
  ON public.user_theta(user_id);

CREATE INDEX IF NOT EXISTS idx_user_theta_discipline
  ON public.user_theta(discipline_id);

ALTER TABLE public.user_theta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_theta_select_own"
  ON public.user_theta FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "user_theta_insert_own"
  ON public.user_theta FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "user_theta_update_own"
  ON public.user_theta FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "user_theta_delete_own"
  ON public.user_theta FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE TRIGGER tr_user_theta_updated_at
  BEFORE UPDATE ON public.user_theta
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
