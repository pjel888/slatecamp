-- Purpose: feature flag decisions are runtime configuration, not admin-only data.
-- The application reads feature_flags while resolving viewer entitlements for normal
-- users, so SELECT must be available to anon/authenticated clients. Admin mutation
-- remains protected by existing has_admin_role() policies.

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.feature_flags TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feature_flags TO service_role;

DROP POLICY IF EXISTS "feature_flags_read_runtime" ON public.feature_flags;
CREATE POLICY "feature_flags_read_runtime"
  ON public.feature_flags
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Keep service-role maintenance/data checks usable in environments where grants
-- were not initialized for editorial prompt tables.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wiki_ei_prompts TO service_role;
