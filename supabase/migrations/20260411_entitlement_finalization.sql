-- Migration: 20260411_entitlement_finalization.sql
-- Purpose:
--   1. Normalize feature_flags.target_tier storage to canonical tier vocabulary
--   2. Document target_roles as deprecated for runtime entitlement decisions

UPDATE public.feature_flags
SET target_tier = CASE
  WHEN COALESCE(target_tier, ARRAY[]::text[]) @> ARRAY['camp', 'insurance', 'institutional']::text[]
    AND NOT COALESCE(target_tier, ARRAY[]::text[]) && ARRAY['pro', 'prime', 'enterprise']::text[]
  THEN ARRAY['pro', 'prime', 'institutional', 'enterprise']::text[]
  ELSE ARRAY(
    SELECT DISTINCT
      CASE value
        WHEN 'camp' THEN 'pro'
        WHEN 'insurance' THEN 'institutional'
        ELSE value
      END
    FROM unnest(COALESCE(target_tier, ARRAY[]::text[])) AS value
  )
END
WHERE EXISTS (
  SELECT 1
  FROM unnest(COALESCE(target_tier, ARRAY[]::text[])) AS value
  WHERE value IN ('camp', 'insurance')
);

COMMENT ON COLUMN public.feature_flags.target_tier IS
  'Canonical allowed tiers only: free, pro, prime, institutional, enterprise. Runtime access decisions must normalize here and not interpret legacy values elsewhere.';

COMMENT ON COLUMN public.feature_flags.target_roles IS
  'Deprecated for runtime entitlement decisions. Retained temporarily for legacy admin metadata only; canonical runtime policy is code-driven.';
