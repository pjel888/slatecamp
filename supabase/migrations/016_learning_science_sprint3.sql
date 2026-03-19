-- Sprint 3: Learning Science Integrations
-- Feature 7: Feynman Teach-Back

-- Teach-back submissions table
CREATE TABLE IF NOT EXISTS public.teach_back_submissions (
  submission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  topic_id UUID REFERENCES public.taxonomy_tree(node_id),
  entry_point TEXT NOT NULL CHECK (entry_point IN ('wiki', 'blindspot', 'trail')),
  trail_day_id UUID REFERENCES public.trail_days(day_id),
  prompt_text TEXT NOT NULL,
  student_response TEXT NOT NULL,
  evaluation_result JSONB DEFAULT '{}',
  gaps_identified TEXT[] DEFAULT '{}',
  revised_response TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  revised_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teach_back_user ON public.teach_back_submissions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_teach_back_topic ON public.teach_back_submissions(topic_id);

ALTER TABLE public.teach_back_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tbs_select_own"
  ON public.teach_back_submissions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "tbs_insert_own"
  ON public.teach_back_submissions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "tbs_update_own"
  ON public.teach_back_submissions FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE TRIGGER tr_teach_back_submissions_updated_at
  BEFORE UPDATE ON public.teach_back_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- Topic teach-back criteria table (populated by SMEs)
CREATE TABLE IF NOT EXISTS public.topic_teach_back_criteria (
  criteria_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.taxonomy_tree(node_id),
  required_concepts TEXT[] NOT NULL DEFAULT '{}',
  required_exceptions TEXT[] NOT NULL DEFAULT '{}',
  common_misconceptions TEXT[] NOT NULL DEFAULT '{}',
  code_citations TEXT[] NOT NULL DEFAULT '{}',
  authored_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teach_back_criteria_topic ON public.topic_teach_back_criteria(topic_id);

ALTER TABLE public.topic_teach_back_criteria ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read criteria (this is content, not user data)
CREATE POLICY "ttbc_select_all"
  ON public.topic_teach_back_criteria FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can manage criteria (same pattern as feature_flags)
CREATE POLICY "ttbc_admin_manage"
  ON public.topic_teach_back_criteria FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = auth.uid()
    AND (users.raw_app_meta_data ->> 'role') = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = auth.uid()
    AND (users.raw_app_meta_data ->> 'role') = 'admin'
  ));

CREATE TRIGGER tr_topic_teach_back_criteria_updated_at
  BEFORE UPDATE ON public.topic_teach_back_criteria
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- Add teach-back tracking to user_node_mastery
ALTER TABLE public.user_node_mastery
  ADD COLUMN IF NOT EXISTS teach_back_attempted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS teach_back_gap_count INTEGER DEFAULT 0;
