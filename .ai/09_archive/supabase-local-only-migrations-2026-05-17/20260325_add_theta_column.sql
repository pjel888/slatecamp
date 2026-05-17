-- Add IRT theta (ability estimate) to user_node_mastery
-- Used by the 2PL IRT engine (src/lib/srs/irt.ts) to track per-node ability.
ALTER TABLE public.user_node_mastery
  ADD COLUMN IF NOT EXISTS theta DOUBLE PRECISION NOT NULL DEFAULT 0.0;

COMMENT ON COLUMN public.user_node_mastery.theta
  IS 'IRT 2PL ability estimate (θ) for this user × node pair. Updated after each answer via updateTheta().';
