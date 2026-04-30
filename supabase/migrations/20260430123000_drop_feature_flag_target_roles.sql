-- Purpose: remove the deprecated role-targeted feature flag column after runtime
-- entitlement decisions stopped reading it and launch DB checks proved it empty.
-- Canonical feature access now uses target_tier plus code-owned role policy.

ALTER TABLE public.feature_flags
  DROP COLUMN IF EXISTS target_roles;

-- Keep service-role maintenance/data checks usable for final tier cleanup gates.
GRANT SELECT ON public.user_subscriptions TO service_role;
