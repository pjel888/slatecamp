CREATE TABLE IF NOT EXISTS public.study_pods (
  pod_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_name TEXT NOT NULL,
  invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pod_members (
  pod_id UUID REFERENCES public.study_pods(pod_id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (pod_id, user_id)
);

-- RLS
ALTER TABLE public.study_pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pod_members ENABLE ROW LEVEL SECURITY;

-- Pod members can read their own pod
CREATE POLICY "Members can read own pod" ON public.study_pods
  FOR SELECT USING (
    pod_id IN (SELECT pod_id FROM public.pod_members WHERE user_id = auth.uid())
    OR created_by = auth.uid()
  );

CREATE POLICY "Authenticated users can create pods" ON public.study_pods
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Members can read pod members" ON public.pod_members
  FOR SELECT USING (
    pod_id IN (SELECT pod_id FROM public.pod_members pm WHERE pm.user_id = auth.uid())
  );

CREATE POLICY "Users can join pods" ON public.pod_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave pods" ON public.pod_members
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_pod_members_user ON public.pod_members(user_id);
CREATE INDEX idx_pods_invite_code ON public.study_pods(invite_code);
