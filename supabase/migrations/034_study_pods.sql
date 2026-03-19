-- ============================================================
-- Migration 034: study_pods + pod_members
-- Campfire community: accountability groups of 4-6 students
-- ============================================================

CREATE TABLE IF NOT EXISTS public.study_pods (
  pod_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_name    TEXT,
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  max_members INTEGER NOT NULL DEFAULT 6,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pod_members (
  pod_id     UUID NOT NULL REFERENCES public.study_pods(pod_id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (pod_id, user_id)
);

ALTER TABLE public.study_pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pod_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pod_select_member" ON public.study_pods
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pod_members pm
    WHERE pm.pod_id = study_pods.pod_id AND pm.user_id = auth.uid()));
CREATE POLICY "pod_insert_own" ON public.study_pods
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "pm_select_own_pod" ON public.pod_members
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pod_members self
    WHERE self.pod_id = pod_members.pod_id AND self.user_id = auth.uid()));
CREATE POLICY "pm_insert_own" ON public.pod_members
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pm_delete_own" ON public.pod_members
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_pod_members_user ON public.pod_members (user_id);
CREATE INDEX idx_pod_members_pod ON public.pod_members (pod_id);
