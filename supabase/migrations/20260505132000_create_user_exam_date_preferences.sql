-- Persist dashboard-selected LEA exam dates per user.
-- Keeps the existing single target_exam_date columns as compatibility fields
-- while storing the dashboard heatmap's multi-day selection in one canonical row.

CREATE TABLE IF NOT EXISTS public.user_exam_date_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_dates DATE[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_exam_date_preferences_max_dates CHECK (array_length(exam_dates, 1) IS NULL OR array_length(exam_dates, 1) <= 14)
);

ALTER TABLE public.user_exam_date_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_exam_date_preferences_select_own ON public.user_exam_date_preferences;
CREATE POLICY user_exam_date_preferences_select_own
  ON public.user_exam_date_preferences
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS user_exam_date_preferences_insert_own ON public.user_exam_date_preferences;
CREATE POLICY user_exam_date_preferences_insert_own
  ON public.user_exam_date_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS user_exam_date_preferences_update_own ON public.user_exam_date_preferences;
CREATE POLICY user_exam_date_preferences_update_own
  ON public.user_exam_date_preferences
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS user_exam_date_preferences_delete_own ON public.user_exam_date_preferences;
CREATE POLICY user_exam_date_preferences_delete_own
  ON public.user_exam_date_preferences
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_exam_date_preferences TO authenticated;

DROP TRIGGER IF EXISTS tr_user_exam_date_preferences_updated_at ON public.user_exam_date_preferences;
CREATE TRIGGER tr_user_exam_date_preferences_updated_at
  BEFORE UPDATE ON public.user_exam_date_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.save_user_exam_date_preferences(p_exam_dates DATE[])
RETURNS DATE[]
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_exam_dates DATE[];
  v_target_exam_date DATE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT COALESCE(array_agg(exam_date ORDER BY exam_date), ARRAY[]::DATE[])
  INTO v_exam_dates
  FROM (
    SELECT DISTINCT exam_date
    FROM unnest(COALESCE(p_exam_dates, ARRAY[]::DATE[])) AS selected_dates(exam_date)
  ) AS normalized_dates;

  IF COALESCE(array_length(v_exam_dates, 1), 0) > 14 THEN
    RAISE EXCEPTION 'Select up to 14 exam dates.';
  END IF;

  v_target_exam_date := v_exam_dates[1];

  INSERT INTO public.user_exam_date_preferences (user_id, exam_dates)
  VALUES (v_user_id, v_exam_dates)
  ON CONFLICT (user_id) DO UPDATE
    SET exam_dates = EXCLUDED.exam_dates;

  INSERT INTO public.profiles (id, target_exam_date)
  VALUES (v_user_id, v_target_exam_date)
  ON CONFLICT (id) DO UPDATE
    SET target_exam_date = EXCLUDED.target_exam_date;

  INSERT INTO public.user_global_stats (user_id, target_exam_date)
  VALUES (v_user_id, v_target_exam_date)
  ON CONFLICT (user_id) DO UPDATE
    SET target_exam_date = EXCLUDED.target_exam_date;

  RETURN v_exam_dates;
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_user_exam_date_preferences(DATE[]) TO authenticated;
