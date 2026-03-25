CREATE TABLE IF NOT EXISTS public.user_srs_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,
  ease_factor FLOAT NOT NULL DEFAULT 2.5,
  interval_days FLOAT NOT NULL DEFAULT 1.0,
  repetitions INTEGER NOT NULL DEFAULT 0,
  quality_last INTEGER,
  next_review_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, node_id)
);

CREATE INDEX IF NOT EXISTS idx_user_srs_cards_user
  ON public.user_srs_cards(user_id);

CREATE INDEX IF NOT EXISTS idx_user_srs_cards_review_due
  ON public.user_srs_cards(user_id, next_review_at)
  WHERE next_review_at <= now();

ALTER TABLE public.user_srs_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_srs_cards_select_own"
  ON public.user_srs_cards FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "user_srs_cards_insert_own"
  ON public.user_srs_cards FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "user_srs_cards_update_own"
  ON public.user_srs_cards FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "user_srs_cards_delete_own"
  ON public.user_srs_cards FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE TRIGGER tr_user_srs_cards_updated_at
  BEFORE UPDATE ON public.user_srs_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
