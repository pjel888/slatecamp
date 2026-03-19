-- ============================================================
-- Migration 1: Fix RLS + Add FK
-- Applied via Supabase MCP
-- ============================================================

-- Issue 1: Fix user_mastery_history RLS — use cached (select auth.uid())
DROP POLICY IF EXISTS "Users can insert own mastery history" ON public.user_mastery_history;
DROP POLICY IF EXISTS "Users can view own mastery history" ON public.user_mastery_history;

CREATE POLICY "mh_insert_own"
  ON public.user_mastery_history FOR INSERT
  TO public
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "mh_select_own"
  ON public.user_mastery_history FOR SELECT
  TO public
  USING ((select auth.uid()) = user_id);

-- Issue 4: Add topic_id FK to user_mastery_history
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'user_mastery_history'
      AND constraint_name = 'fk_mastery_history_topic_id'
  ) THEN
    ALTER TABLE public.user_mastery_history
      ADD CONSTRAINT fk_mastery_history_topic_id
      FOREIGN KEY (topic_id) REFERENCES public.taxonomy_tree(node_id)
      ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_mastery_history_topic_id
  ON public.user_mastery_history(topic_id);
