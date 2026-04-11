-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: 20260325_testing_review_schema_gaps.sql
-- Purpose:   Address schema gaps identified in the Testing & Review UX master
--            plan (PART 6). Applies additive-safe changes only.
--
-- Pre-flight audit results (verified against DATABASE_SCHEMA.sql):
--
--   ALREADY PRESENT — no action needed:
--     • quiz_sessions.is_endurance_session        (added in 018_proof_simulation_and_signals)
--     • quiz_sessions.accuracy_by_block           (added in 018_proof_simulation_and_signals)
--     • user_interactions.source_type             (TEXT DEFAULT 'quiz', fully defined)
--     • user_global_stats.free_questions_today    (INTEGER DEFAULT 0, fully defined)
--     • user_global_stats.free_questions_reset_date (DATE, fully defined)
--     • user_endurance_profiles table             (fully defined with RLS + indexes)
--
--   REQUIRES ACTION:
--     • feature_flags seeding — 10 flags for paywall and mode gating
--
--   GUARDED WITH IF NOT EXISTS / ON CONFLICT — all ALTER TABLE blocks are
--   retained as no-ops so this migration is safe to re-run and documents the
--   gap-closure intent for future schema readers.
-- ═══════════════════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────────────────
-- SECTION 1: quiz_sessions — endurance and block-accuracy columns
--
-- Both columns are already present in DATABASE_SCHEMA.sql (lines 341-342).
-- These guards are retained as documentation and re-run safety only.
-- ───────────────────────────────────────────────────────────────────────────

ALTER TABLE public.quiz_sessions
  ADD COLUMN IF NOT EXISTS is_endurance_session BOOLEAN DEFAULT false;

ALTER TABLE public.quiz_sessions
  ADD COLUMN IF NOT EXISTS accuracy_by_block JSONB DEFAULT '[]'::jsonb;


-- ───────────────────────────────────────────────────────────────────────────
-- SECTION 2: user_interactions — source_type column
--
-- Already present (TEXT DEFAULT 'quiz'). Guard retained for re-run safety.
-- Valid values: 'quiz' | '3d_lab' | 'assessment' | 'blindspot' | 'ei_prompt'
-- ───────────────────────────────────────────────────────────────────────────

ALTER TABLE public.user_interactions
  ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'quiz';


-- ───────────────────────────────────────────────────────────────────────────
-- SECTION 3: user_global_stats — free tier daily cap columns
--
-- Already present (lines 486-487 of DATABASE_SCHEMA.sql).
-- Guards retained for re-run safety.
-- ───────────────────────────────────────────────────────────────────────────

ALTER TABLE public.user_global_stats
  ADD COLUMN IF NOT EXISTS free_questions_today INT DEFAULT 0;

ALTER TABLE public.user_global_stats
  ADD COLUMN IF NOT EXISTS free_questions_reset_date DATE DEFAULT CURRENT_DATE;


-- ───────────────────────────────────────────────────────────────────────────
-- SECTION 4: user_endurance_profiles — table, RLS, and index
--
-- The full table is defined in DATABASE_SCHEMA.sql (lines 521-545) with:
--   • user_id as PRIMARY KEY (not a separate profile_id UUID)
--   • RLS enabled with policy "ep_select_own"
--   • Index idx_endurance_profiles_pacing on (user_id, avg_seconds_per_question)
--   • Trigger tr_endurance_profiles_updated_at
--   • Generated column endurance_gate_pct
--
-- The CREATE TABLE below uses IF NOT EXISTS so it is a no-op when the table
-- already exists. It is included here to satisfy migration completeness and
-- to serve as a reference for the schema gap that was reported.
-- ───────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_endurance_profiles (
  user_id                      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  baseline_reliable_items      INTEGER,
  baseline_accuracy_decay_at   INTEGER,
  baseline_avg_accuracy        DOUBLE PRECISION,
  baseline_calibrated_at       TIMESTAMPTZ,
  current_endurance_target     INTEGER,
  endurance_window_minutes     DOUBLE PRECISION,
  endurance_sessions_completed INTEGER NOT NULL DEFAULT 0,
  avg_seconds_per_question     DOUBLE PRECISION,
  pacing_target_seconds        DOUBLE PRECISION NOT NULL DEFAULT 96,
  pacing_updated_at            TIMESTAMPTZ,
  consecutive_plateau_weeks    INTEGER NOT NULL DEFAULT 0,
  last_endurance_session_at    TIMESTAMPTZ,
  computed_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                   TIMESTAMPTZ NOT NULL DEFAULT now()
  -- NOTE: endurance_gate_pct is a GENERATED ALWAYS AS (STORED) column defined
  -- in the canonical schema. It is omitted here because IF NOT EXISTS on CREATE
  -- TABLE skips the body entirely — no column-level conflict can occur.
);

-- RLS: enable (idempotent)
ALTER TABLE public.user_endurance_profiles ENABLE ROW LEVEL SECURITY;

-- Read policy (guard against duplicate name)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'user_endurance_profiles'
      AND policyname = 'ep_select_own'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "ep_select_own" ON public.user_endurance_profiles
        FOR SELECT TO authenticated
        USING (auth.uid() = user_id)
    $policy$;
  END IF;
END;
$$;

-- Update policy (users may update their own row)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'user_endurance_profiles'
      AND policyname = 'ep_update_own'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "ep_update_own" ON public.user_endurance_profiles
        FOR UPDATE TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id)
    $policy$;
  END IF;
END;
$$;

-- Insert policy (upsert from server actions on session completion)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'user_endurance_profiles'
      AND policyname = 'ep_insert_own'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "ep_insert_own" ON public.user_endurance_profiles
        FOR INSERT TO authenticated
        WITH CHECK (auth.uid() = user_id)
    $policy$;
  END IF;
END;
$$;

-- Index on user_id for point-lookups (composite index on pacing already exists
-- in canonical schema; this covers simple user_id lookups via the PK, so the
-- separate index below is a no-op-safe guard only)
CREATE INDEX IF NOT EXISTS idx_endurance_profiles_user_id
  ON public.user_endurance_profiles USING btree (user_id);


-- ───────────────────────────────────────────────────────────────────────────
-- SECTION 5: feature_flags seeding
--
-- 10 flags required for paywall gating and mode availability.
-- feature_flags schema: id (UUID), key (TEXT UNIQUE), description (TEXT),
--   enabled (BOOLEAN), target_tier (TEXT[] canonical tiers only), target_roles (TEXT[] deprecated),
--   created_by (UUID), created_at (TIMESTAMPTZ), updated_at (TIMESTAMPTZ)
--
-- All rows use ON CONFLICT (key) DO NOTHING — safe to re-run.
-- enabled defaults: paywall on, all modes on. Adjust per environment via
--   admin console or direct UPDATE after deploy.
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO public.feature_flags (key, description, enabled, target_tier, target_roles)
VALUES
  (
    'paywall_enabled',
    'Master switch for the free-tier question cap and upgrade prompts. When false, all users have unrestricted access regardless of subscription tier.',
    true,
    '{}'::text[],
    '{}'::text[]
  ),
  (
    'storm_mode_enabled',
    'Enables Storm Mode (timed, high-pressure sessions) in the Review Hub. Disable to hide the mode card and block session creation with config.source=storm_mode.',
    true,
    '{}'::text[],
    '{}'::text[]
  ),
  (
    'proof_simulation_enabled',
    'Enables Full Exam Simulation (formerly Proof Simulation). Requires proof_simulation_unlocked_at to be set on user_global_stats. Disable to hide gate entirely.',
    true,
    '{}'::text[],
    '{}'::text[]
  ),
  (
    'endurance_mode_enabled',
    'Enables Extended Practice (endurance) sessions. Requires a completed endurance calibration stored in user_endurance_profiles. Disable to suppress mode card.',
    true,
    '{}'::text[],
    '{}'::text[]
  ),
  (
    'custom_session_enabled',
    'Enables the Custom Session builder where users select subjects, question count, and mode. Disable to hide the builder entry point.',
    true,
    '{}'::text[],
    '{}'::text[]
  ),
  (
    'subject_mode_enabled',
    'Enables Subject Mode sessions scoped to a single taxonomy subject. Disable to hide per-subject launch buttons across the taxonomy heatmap.',
    true,
    '{}'::text[],
    '{}'::text[]
  ),
  (
    'focus_review_enabled',
    'Enables Focus Review sessions (formerly Blindspot Protocol). Targets nodes that have not improved recently. Disable to suppress smart suggestion card variant.',
    true,
    '{}'::text[],
    '{}'::text[]
  ),
  (
    'chill_mode_enabled',
    'Enables Chill Mode (untimed, low-pressure practice). Maps to DB test_mode=practice with config.source=chill_mode. Disable to hide mode card.',
    true,
    '{}'::text[],
    '{}'::text[]
  ),
  (
    'ai_tutor_enabled',
    'Enables the AI Contextual Tutor panel during and after sessions. When false, the tutor icon and panel are hidden; rationale text remains visible.',
    true,
    '{}'::text[],
    '{}'::text[]
  ),
  (
    'calibration_enabled',
    'Enables the endurance calibration flow that establishes baseline_reliable_items in user_endurance_profiles. Disable to block calibration session creation.',
    true,
    '{}'::text[],
    '{}'::text[]
  )
ON CONFLICT (key) DO NOTHING;
