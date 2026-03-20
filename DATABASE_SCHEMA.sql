-- ============================================================
-- SlateCamp — Complete Database Schema
-- Regenerated from live Supabase instance: 2026-03-19
-- ============================================================
--
-- This file is DOCUMENTATION, not a migration.
-- It reflects the exact state of the production database.
--
-- 50 tables · 13 enums · 9 functions · 31 triggers · 89 RLS policies · 134 indexes
-- ============================================================


-- ═══════════════════════════════════════════════════════════════
-- ENUMS
-- ═══════════════════════════════════════════════════════════════

CREATE TYPE public.session_status AS ENUM ('in_progress', 'completed', 'abandoned');
CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'expired', 'trialing');
CREATE TYPE public.subscription_tier AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE public.test_mode AS ENUM ('camp', 'timed', 'practice');
CREATE TYPE public.trail_enrollment_status AS ENUM ('active', 'paused', 'completed', 'abandoned');
CREATE TYPE public.trail_intensity AS ENUM ('intensive', 'accelerated', 'standard', 'comprehensive', 'undergraduate');
CREATE TYPE public.trail_step_type AS ENUM ('quiz', 'wiki', 'lab', 'review');
CREATE TYPE public.trail_type AS ENUM ('time_gated', 'subject_mastery', 'code_deep_dive', 'remediation', 'exam_simulation');
CREATE TYPE public.user_type AS ENUM ('regular', 'educational', 'corporate');

-- Taxonomy v5.0 enums
CREATE TYPE public.taxonomy_node_type AS ENUM ('concept', 'code_provision', 'formula', 'case_study', 'person', 'building');
CREATE TYPE public.exam_frequency_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.taxonomy_source_type AS ENUM ('primary_law', 'implementing_rules', 'regulatory_body', 'reference_standard', 'prc_syllabus', 'heritage_body');
CREATE TYPE public.bloom_level_type AS ENUM ('remember', 'understand', 'apply', 'analyze');


-- ═══════════════════════════════════════════════════════════════
-- TABLES — Core
-- ═══════════════════════════════════════════════════════════════

-- ── disciplines ─────────────────────────────────────────────
CREATE TABLE public.disciplines (
  discipline_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL UNIQUE,
  acronym         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  passing_threshold_pct         SMALLINT NOT NULL DEFAULT 70,
  subject_floor_pct             SMALLINT NOT NULL DEFAULT 50,
  exam_day_1_subjects           TEXT[] DEFAULT '{}'::text[],
  exam_day_2_subjects           TEXT[] DEFAULT '{}'::text[],
  recent_passing_rates          JSONB DEFAULT '{}'::jsonb
);

-- ── taxonomy_tree ───────────────────────────────────────────
CREATE TABLE public.taxonomy_tree (
  node_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discipline_id   UUID NOT NULL REFERENCES public.disciplines(discipline_id),
  parent_id       UUID REFERENCES public.taxonomy_tree(node_id),
  level           SMALLINT NOT NULL,
  name            TEXT NOT NULL,
  subject_area    TEXT NOT NULL,
  slug            TEXT UNIQUE,
  is_leaf         BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Taxonomy v5.0 columns
  ale_id                          TEXT UNIQUE,                                                         -- Human-readable ALE identifier
  node_type                       public.taxonomy_node_type,                                           -- Content classification (subtopics only)
  exam_frequency                  public.exam_frequency_level,                                         -- SME-assessed exam frequency
  prc_area                        TEXT CHECK (prc_area IN ('A', 'B', 'C', 'cross-reference')),         -- PRC exam area (subjects only)
  area_weight_pct                 SMALLINT CHECK (area_weight_pct BETWEEN 0 AND 100),                  -- Area weight percentage
  subject_weight_within_area_pct  SMALLINT CHECK (subject_weight_within_area_pct BETWEEN 0 AND 100),   -- Subject weight
  description                     TEXT,                                                                -- Subject description
  is_cross_ref_only               BOOLEAN NOT NULL DEFAULT false,                                      -- ALE-LAWS flag
  deprecated_at                   TIMESTAMPTZ,                                                         -- Soft deprecation timestamp
  wiki_items                      JSONB NOT NULL DEFAULT '[]'::jsonb,                                  -- Typed wiki content
  bloom_level                     public.bloom_level_type,                                             -- Bloom taxonomy level
  difficulty                      SMALLINT CHECK (difficulty BETWEEN 1 AND 4),                         -- Difficulty 1-4
  typical_question_formats        TEXT[] NOT NULL DEFAULT '{}'::text[],                                 -- Question format array
  is_computation_heavy            BOOLEAN NOT NULL DEFAULT false,                                      -- Multi-step calculation flag
  three_d_lab_linked              BOOLEAN NOT NULL DEFAULT false,                                      -- 3D Lab module flag
  mastery_criteria                JSONB                                                                -- Subject-level mastery spec
);

-- ── profiles ────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id                                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name                         TEXT,
  display_name                      TEXT,
  avatar_url                        TEXT,
  user_type                         TEXT DEFAULT 'reviewee',
  discipline_id                     UUID REFERENCES public.disciplines(discipline_id),
  target_exam_date                  DATE,
  school_or_institution             TEXT,
  onboarding_completed_at           TIMESTAMPTZ,
  created_at                        TIMESTAMPTZ DEFAULT now(),
  updated_at                        TIMESTAMPTZ DEFAULT now(),
  preferred_study_window            TEXT DEFAULT 'any',
  -- Migration 032: Feature Implementation columns
  reviewer_type                     TEXT DEFAULT 'first_taker'
    CHECK (reviewer_type IN ('first_taker', 'returning_reviewer', 'undergrad', 'dae')),
  previous_exam_subjects_struggled  JSONB DEFAULT '[]'::jsonb,
  enrolled_review_center            TEXT DEFAULT NULL,
  comp_exam_scores                  JSONB DEFAULT NULL,
  comp_exam_date                    DATE DEFAULT NULL,
  ale_result                        TEXT DEFAULT NULL
    CHECK (ale_result IN ('passed', 'failed', 'pending', NULL)),
  oath_taking_date                  DATE DEFAULT NULL,
  account_mode                      TEXT DEFAULT 'review_mode'
    CHECK (account_mode IN ('review_mode', 'professional_mode', 'student_mode', 'dae_mode'))
);

-- ── organizations ───────────────────────────────────────────
CREATE TABLE public.organizations (
  org_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  type        public.user_type NOT NULL DEFAULT 'regular',
  logo_url    TEXT,
  max_seats   INTEGER NOT NULL DEFAULT 10,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── organization_members ────────────────────────────────────
CREATE TABLE public.organization_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES public.organizations(org_id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, user_id)
);


-- ═══════════════════════════════════════════════════════════════
-- TABLES — Content
-- ═══════════════════════════════════════════════════════════════

-- ── questions ────────────────────────────────────────────────
CREATE TABLE public.questions (
  question_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id             UUID NOT NULL REFERENCES public.taxonomy_tree(node_id),
  text                 TEXT NOT NULL,
  options              JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_option_id    TEXT NOT NULL,
  rationale            TEXT,
  difficulty           NUMERIC DEFAULT 0.50,
  difficulty_rating    NUMERIC,
  discrimination_rating NUMERIC,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  prompt_image_url     TEXT,
  explanation          TEXT,
  code_citation        TEXT,
  model_id             TEXT,
  is_assessment        BOOLEAN DEFAULT false,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  application_context  TEXT
);

-- ── models_3d ────────────────────────────────────────────────
CREATE TABLE public.models_3d (
  model_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name               TEXT NOT NULL,
  slug               TEXT NOT NULL UNIQUE,
  url                TEXT NOT NULL,
  thumbnail          TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  status             TEXT DEFAULT 'draft',
  metadata           JSONB DEFAULT '{}'::jsonb,
  reviewed_by        UUID,
  reviewed_at        TIMESTAMPTZ,
  context_scenario   TEXT,                          -- 2-sentence professional scenario
  ale_question_count INTEGER,                       -- estimated ALE questions per sitting
  ale_question_type  TEXT,                           -- code compliance / visual identification
  supported_phases   TEXT[] DEFAULT '{guided}',      -- guided, faded, sandbox, challenge
  has_challenge_mode BOOLEAN DEFAULT false
);

-- ── spatial_hotspots ─────────────────────────────────────────
CREATE TABLE public.spatial_hotspots (
  hotspot_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id     UUID NOT NULL REFERENCES public.models_3d(model_id),
  node_id      UUID REFERENCES public.taxonomy_tree(node_id),
  title        TEXT NOT NULL,
  description  TEXT,
  position_x   DOUBLE PRECISION NOT NULL,
  position_y   DOUBLE PRECISION NOT NULL,
  position_z   DOUBLE PRECISION NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  phase        TEXT DEFAULT 'guided',               -- guided, faded, sandbox, challenge
  question_id  UUID REFERENCES public.questions(question_id),
  reveal_order INTEGER DEFAULT 1                    -- sequence in guided tour Focus Mode
);

-- ── wiki_articles ────────────────────────────────────────────
CREATE TABLE public.wiki_articles (
  article_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  content           TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  status            TEXT DEFAULT 'draft',
  reviewed_by       UUID,
  reviewed_at       TIMESTAMPTZ,
  reviewer_comments TEXT,
  -- Wiki hero metadata (spec v1)
  ale_tests_you     TEXT,
  updated_note      TEXT,
  subject_label     TEXT,
  difficulty_label  TEXT CHECK (difficulty_label IN ('Foundational', 'Intermediate', 'Advanced'))
);

-- ── wiki_article_taxonomy ────────────────────────────────────
CREATE TABLE public.wiki_article_taxonomy (
  article_id  UUID NOT NULL REFERENCES public.wiki_articles(article_id),
  node_id     UUID NOT NULL REFERENCES public.taxonomy_tree(node_id),
  is_primary  BOOLEAN DEFAULT false,
  PRIMARY KEY (article_id, node_id)
);

-- ── wiki_ei_prompts ──────────────────────────────────────────
CREATE TABLE public.wiki_ei_prompts (
  prompt_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id         UUID NOT NULL REFERENCES public.wiki_articles(article_id) ON DELETE CASCADE,
  node_id            UUID REFERENCES public.taxonomy_tree(node_id),
  insert_after_heading TEXT NOT NULL,
  prompt_text        TEXT NOT NULL CHECK (length(trim(prompt_text)) > 0),
  reveal_text        TEXT NOT NULL CHECK (length(trim(reveal_text)) > 0),
  options            JSONB DEFAULT '[]'::jsonb CHECK (jsonb_typeof(options) = 'array'),
  sort_order         SMALLINT NOT NULL DEFAULT 0,
  is_active          BOOLEAN NOT NULL DEFAULT true,
  status             TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  reviewed_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at        TIMESTAMPTZ,
  reviewer_notes     TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── wiki_ei_responses ────────────────────────────────────────
CREATE TABLE public.wiki_ei_responses (
  response_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id            UUID NOT NULL REFERENCES public.wiki_ei_prompts(prompt_id) ON DELETE CASCADE,
  response_text        TEXT,
  selected_option_index SMALLINT,
  responded_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_ei_responses_user_prompt UNIQUE (user_id, prompt_id)
);

-- ── feature_flags ────────────────────────────────────────────
CREATE TABLE public.feature_flags (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key           TEXT NOT NULL UNIQUE,
  description   TEXT,
  enabled       BOOLEAN NOT NULL DEFAULT false,
  target_tier   TEXT[] DEFAULT '{}'::text[],
  target_roles  TEXT[] DEFAULT '{}'::text[],
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── campfire_testimonials ────────────────────────────────────
CREATE TABLE public.campfire_testimonials (
  testimonial_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name    TEXT NOT NULL,
  school_name     TEXT,
  starting_score  DOUBLE PRECISION,
  final_score     DOUBLE PRECISION,
  passed          BOOLEAN NOT NULL,
  exam_batch      TEXT NOT NULL,
  quote           TEXT,
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  is_verified     BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ═══════════════════════════════════════════════════════════════
-- TABLES — Taxonomy v5.0 Enrichment
-- ═══════════════════════════════════════════════════════════════

-- ── taxonomy_cross_references ─────────────────────────────────
CREATE TABLE public.taxonomy_cross_references (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_node_id   UUID NOT NULL REFERENCES public.taxonomy_tree(node_id),
  target_node_id   UUID NOT NULL REFERENCES public.taxonomy_tree(node_id),
  relationship_type TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_node_id, target_node_id)
);

-- ── taxonomy_sources ──────────────────────────────────────────
CREATE TABLE public.taxonomy_sources (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id      UUID NOT NULL REFERENCES public.taxonomy_tree(node_id),
  label        TEXT NOT NULL,
  url          TEXT,
  source_type  public.taxonomy_source_type NOT NULL,
  is_verified  BOOLEAN NOT NULL DEFAULT false,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── taxonomy_prerequisites ────────────────────────────────────
CREATE TABLE public.taxonomy_prerequisites (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subtopic_id      UUID NOT NULL REFERENCES public.taxonomy_tree(node_id),
  prerequisite_id  UUID NOT NULL REFERENCES public.taxonomy_tree(node_id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (subtopic_id, prerequisite_id)
);


-- ═══════════════════════════════════════════════════════════════
-- TABLES — Quiz Engine
-- ═══════════════════════════════════════════════════════════════

-- ── quiz_sessions ────────────────────────────────────────────
CREATE TABLE public.quiz_sessions (
  session_id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                        UUID NOT NULL REFERENCES auth.users(id),
  discipline_id                  UUID REFERENCES public.disciplines(discipline_id),
  test_mode                      public.test_mode NOT NULL DEFAULT 'camp',
  status                         public.session_status NOT NULL DEFAULT 'in_progress',
  config                         JSONB NOT NULL DEFAULT '{}'::jsonb,
  question_ids                   UUID[] NOT NULL DEFAULT '{}'::uuid[],
  subject_ids                    UUID[] NOT NULL DEFAULT '{}'::uuid[],
  current_question_index         INTEGER NOT NULL DEFAULT 0,
  started_at                     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                     TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at                   TIMESTAMPTZ,
  pre_session_confidence_ratings JSONB DEFAULT '{}'::jsonb,
  is_proof_simulation            BOOLEAN DEFAULT false,
  is_endurance_session           BOOLEAN DEFAULT false,
  accuracy_by_block              JSONB DEFAULT '[]'::jsonb,
  session_discovery              JSONB,
  mastery_snapshot_at_start      JSONB
);

-- ── user_interactions ────────────────────────────────────────
CREATE TABLE public.user_interactions (
  interaction_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES auth.users(id),
  session_id              UUID NOT NULL REFERENCES public.quiz_sessions(session_id),
  question_id             UUID NOT NULL REFERENCES public.questions(question_id),
  topic_id                UUID REFERENCES public.taxonomy_tree(node_id),
  selected_option_id      TEXT,
  is_correct              BOOLEAN NOT NULL,
  time_spent_ms           INTEGER DEFAULT 0,
  interaction_timestamp   TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_flagged              BOOLEAN NOT NULL DEFAULT false,
  answer_changes          INTEGER NOT NULL DEFAULT 0,
  options_eliminated      INTEGER NOT NULL DEFAULT 0,
  confidence              TEXT,
  rationale_view_ms       INTEGER DEFAULT 0,
  error_type              TEXT,
  question_order          INTEGER,
  is_suspected_lucky_guess BOOLEAN NOT NULL DEFAULT false,
  source_type             TEXT DEFAULT 'quiz',        -- quiz, 3d_lab, assessment, blindspot
  UNIQUE (user_id, session_id, question_id)
);

-- ── readiness_score_snapshots ────────────────────────────────
-- NOTE: analysis_available_at is computed by trigger compute_analysis_available_at()
CREATE TABLE public.readiness_score_snapshots (
  snapshot_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES auth.users(id),
  score                  DOUBLE PRECISION NOT NULL,
  sub_scores             JSONB NOT NULL DEFAULT '{}'::jsonb,
  computed_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id             UUID REFERENCES public.quiz_sessions(session_id),
  is_proof_simulation    BOOLEAN NOT NULL DEFAULT false,
  analysis_available_at  TIMESTAMPTZ  -- computed by trigger, not a generated column
);

-- ── blindspot_queues ─────────────────────────────────────────
CREATE TABLE public.blindspot_queues (
  queue_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id          UUID,
  node_ids            UUID[] NOT NULL,
  question_count      INTEGER DEFAULT 12,
  generated_at        TIMESTAMPTZ DEFAULT now(),
  deferred_until      TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  status              TEXT DEFAULT 'pending',
  pre_queue_mastery   JSONB DEFAULT '{}'::jsonb,
  post_queue_mastery  JSONB DEFAULT '{}'::jsonb,
  nodes_improved      INTEGER DEFAULT 0
);

-- ── anon_diagnostic_sessions ─────────────────────────────────
-- NOTE: RLS is NOT enabled — server-side only by design.
CREATE TABLE public.anon_diagnostic_sessions (
  anon_session_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  browser_session_id  TEXT NOT NULL,
  question_ids        UUID[] NOT NULL DEFAULT '{}'::uuid[],
  answers             JSONB NOT NULL DEFAULT '{}'::jsonb,
  questions_answered  INTEGER NOT NULL DEFAULT 0,
  started_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at          TIMESTAMPTZ NOT NULL DEFAULT (now() + '02:00:00'::interval),
  converted_user_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE
);


-- ═══════════════════════════════════════════════════════════════
-- TABLES — Mastery & Scoring
-- ═══════════════════════════════════════════════════════════════

-- ── user_node_mastery ────────────────────────────────────────
CREATE TABLE public.user_node_mastery (
  user_id                     UUID NOT NULL REFERENCES auth.users(id),
  topic_id                    UUID NOT NULL REFERENCES public.taxonomy_tree(node_id),
  total_attempts              INTEGER NOT NULL DEFAULT 0,
  total_correct               INTEGER NOT NULL DEFAULT 0,
  current_mastery_weight      DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  avg_time_ms                 INTEGER NOT NULL DEFAULT 0,
  last_encountered            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ DEFAULT now(),
  teach_back_attempted        BOOLEAN DEFAULT false,
  teach_back_gap_count        INTEGER DEFAULT 0,
  next_review_at              TIMESTAMPTZ,
  review_interval_days        INTEGER DEFAULT 1,
  ease_factor                 DOUBLE PRECISION DEFAULT 2.5,
  review_count                INTEGER NOT NULL DEFAULT 0,
  -- Anti-inflation columns (Migration 038)
  consecutive_correct_streak  INTEGER NOT NULL DEFAULT 0,
  highest_difficulty_correct  SMALLINT NOT NULL DEFAULT 0,
  has_bloom_apply_correct     BOOLEAN NOT NULL DEFAULT false,
  has_bloom_analyze_correct   BOOLEAN NOT NULL DEFAULT false,
  distinct_questions_seen     INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, topic_id)
);

-- ── user_mastery_history ─────────────────────────────────────
CREATE TABLE public.user_mastery_history (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id         UUID NOT NULL REFERENCES public.taxonomy_tree(node_id) ON DELETE RESTRICT,
  mastery_weight   NUMERIC(5,4) NOT NULL,
  total_correct    INTEGER NOT NULL DEFAULT 0,
  total_attempts   INTEGER NOT NULL DEFAULT 0,
  session_id       UUID REFERENCES public.quiz_sessions(session_id),
  snapshot_reason  TEXT DEFAULT 'session_complete',
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ── user_global_stats ────────────────────────────────────────
CREATE TABLE public.user_global_stats (
  user_id                         UUID PRIMARY KEY REFERENCES auth.users(id),
  current_discipline_id           UUID REFERENCES public.disciplines(discipline_id),
  global_readiness_score          DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  target_exam_date                TIMESTAMPTZ,
  final_stretch_upsell_shown      BOOLEAN DEFAULT false,
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
  signup_source                   TEXT,
  utm_campaign                    TEXT,
  utm_medium                      TEXT,
  utm_content                     TEXT,
  referral_code                   TEXT,
  first_session_at                TIMESTAMPTZ,
  onboarding_completed_at         TIMESTAMPTZ,
  assessment_completed_at         TIMESTAMPTZ,
  assessment_score                DOUBLE PRECISION,
  first_touch_source              TEXT,
  first_touch_campaign            TEXT,
  last_touch_source               TEXT,
  last_touch_campaign             TEXT,
  acquisition_touchpoints         JSONB DEFAULT '[]'::jsonb,
  exam_attempt_number             INTEGER DEFAULT 1,
  previous_exam_result            TEXT,
  customer_archetype              TEXT,
  churn_risk_score                DOUBLE PRECISION DEFAULT 0,
  churn_risk_updated_at           TIMESTAMPTZ,
  score_velocity_7d               DOUBLE PRECISION DEFAULT 0,
  score_velocity_updated_at       TIMESTAMPTZ,
  free_questions_today            INTEGER DEFAULT 0,
  free_questions_reset_date       DATE DEFAULT CURRENT_DATE,
  score_reveal_shown_at           TIMESTAMPTZ,
  global_current_streak           INTEGER NOT NULL DEFAULT 0,
  global_longest_streak           INTEGER NOT NULL DEFAULT 0,
  last_study_date                 DATE,
  is_retaker                      BOOLEAN NOT NULL DEFAULT false,
  onboarding_retaker_framing_shown BOOLEAN NOT NULL DEFAULT false,
  assessment_started_at           TIMESTAMPTZ,
  proof_simulation_unlocked_at    TIMESTAMPTZ,
  last_active_date                DATE,
  readiness_sub_scores            JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- ── user_computed_signals ────────────────────────────────────
CREATE TABLE public.user_computed_signals (
  user_id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  score_velocity_7d          DOUBLE PRECISION NOT NULL DEFAULT 0,
  score_velocity_updated_at  TIMESTAMPTZ,
  churn_risk_score           DOUBLE PRECISION NOT NULL DEFAULT 0,
  churn_risk_updated_at      TIMESTAMPTZ,
  days_since_last_session    INTEGER,
  sessions_last_7d           INTEGER NOT NULL DEFAULT 0,
  computed_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  endurance_baseline_items   INTEGER,
  endurance_window_items     INTEGER,
  endurance_target_items     INTEGER DEFAULT 150,
  endurance_last_updated     TIMESTAMPTZ,
  calibration_accuracy       DOUBLE PRECISION,
  calibration_updated_at     TIMESTAMPTZ,
  calibration_score          DOUBLE PRECISION,
  calibration_sessions_count INTEGER NOT NULL DEFAULT 0
);

-- ── user_endurance_profiles ──────────────────────────────────
CREATE TABLE public.user_endurance_profiles (
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
  endurance_gate_pct           DOUBLE PRECISION GENERATED ALWAYS AS (
    CASE
      WHEN pacing_target_seconds > 0 AND baseline_reliable_items > 0
      THEN LEAST(endurance_window_minutes / (pacing_target_seconds * baseline_reliable_items / 60.0), 1.0)
      ELSE 0
    END
  ) STORED,
  computed_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── exam_outcomes ────────────────────────────────────────────
CREATE TABLE public.exam_outcomes (
  outcome_id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  discipline_id            UUID,
  exam_batch               TEXT NOT NULL,
  result                   TEXT NOT NULL,
  self_reported_score      NUMERIC,
  peak_readiness_score     DOUBLE PRECISION,
  readiness_score_at_7d_before DOUBLE PRECISION,
  avg_session_accuracy     DOUBLE PRECISION,
  total_sessions_completed INTEGER,
  total_questions_answered INTEGER,
  days_active              INTEGER,
  signup_source            TEXT,
  customer_archetype       TEXT,
  reported_at              TIMESTAMPTZ DEFAULT now(),
  verified                 BOOLEAN DEFAULT false,
  created_at               TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, exam_batch)
);


-- ═══════════════════════════════════════════════════════════════
-- TABLES — Teach-Back
-- ═══════════════════════════════════════════════════════════════

-- ── teach_back_submissions ───────────────────────────────────
CREATE TABLE public.teach_back_submissions (
  submission_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id            UUID REFERENCES public.taxonomy_tree(node_id),
  entry_point         TEXT NOT NULL,
  trail_day_id        UUID REFERENCES public.trail_days(day_id),
  prompt_text         TEXT NOT NULL,
  student_response    TEXT NOT NULL,
  evaluation_result   JSONB DEFAULT '{}'::jsonb,
  gaps_identified     TEXT[] DEFAULT '{}'::text[],
  revised_response    TEXT,
  submitted_at        TIMESTAMPTZ DEFAULT now(),
  revised_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- ── topic_teach_back_criteria ────────────────────────────────
CREATE TABLE public.topic_teach_back_criteria (
  criteria_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id               UUID NOT NULL REFERENCES public.taxonomy_tree(node_id),
  required_concepts      TEXT[] NOT NULL DEFAULT '{}'::text[],
  required_exceptions    TEXT[] NOT NULL DEFAULT '{}'::text[],
  common_misconceptions  TEXT[] NOT NULL DEFAULT '{}'::text[],
  code_citations         TEXT[] NOT NULL DEFAULT '{}'::text[],
  authored_by            UUID,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now()
);


-- ═══════════════════════════════════════════════════════════════
-- TABLES — Trails (Guided Study Plans)
-- ═══════════════════════════════════════════════════════════════

-- ── camp_trails ──────────────────────────────────────────────
CREATE TABLE public.camp_trails (
  trail_id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discipline_id          UUID NOT NULL REFERENCES public.disciplines(discipline_id),
  name                   TEXT NOT NULL,
  slug                   TEXT NOT NULL UNIQUE,
  description            TEXT,
  trail_type             public.trail_type NOT NULL,
  intensity              public.trail_intensity,
  duration_days          INTEGER NOT NULL,
  total_steps            INTEGER NOT NULL DEFAULT 0,
  is_published           BOOLEAN NOT NULL DEFAULT false,
  is_featured            BOOLEAN NOT NULL DEFAULT false,
  recommended_min_score  DOUBLE PRECISION,
  recommended_max_score  DOUBLE PRECISION,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── trail_days ───────────────────────────────────────────────
CREATE TABLE public.trail_days (
  day_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trail_id           UUID NOT NULL REFERENCES public.camp_trails(trail_id) ON DELETE CASCADE,
  day_number         INTEGER NOT NULL,
  title              TEXT NOT NULL,
  description        TEXT,
  estimated_minutes  INTEGER DEFAULT 60,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (trail_id, day_number)
);

-- ── trail_steps ──────────────────────────────────────────────
CREATE TABLE public.trail_steps (
  step_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id             UUID NOT NULL REFERENCES public.trail_days(day_id) ON DELETE CASCADE,
  step_order         INTEGER NOT NULL,
  step_type          public.trail_step_type NOT NULL,
  title              TEXT NOT NULL,
  description        TEXT,
  target_node_ids    UUID[] DEFAULT '{}'::uuid[],
  question_count     INTEGER,
  difficulty_min     DOUBLE PRECISION DEFAULT 0.0,
  difficulty_max     DOUBLE PRECISION DEFAULT 1.0,
  article_id         UUID REFERENCES public.wiki_articles(article_id) ON DELETE SET NULL,
  model_id           UUID REFERENCES public.models_3d(model_id) ON DELETE SET NULL,
  estimated_minutes  INTEGER DEFAULT 15,
  is_optional        BOOLEAN NOT NULL DEFAULT false,
  preferred_time     TEXT,
  lab_phase          TEXT DEFAULT 'guided',          -- which 3D Lab phase the trail prescribes
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (day_id, step_order)
);

-- ── user_trail_enrollments ───────────────────────────────────
CREATE TABLE public.user_trail_enrollments (
  enrollment_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                    UUID NOT NULL REFERENCES auth.users(id),
  trail_id                   UUID NOT NULL REFERENCES public.camp_trails(trail_id),
  status                     public.trail_enrollment_status NOT NULL DEFAULT 'active',
  current_day                INTEGER NOT NULL DEFAULT 1,
  days_completed             INTEGER NOT NULL DEFAULT 0,
  last_activity_at           TIMESTAMPTZ,
  started_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  paused_at                  TIMESTAMPTZ,
  completed_at               TIMESTAMPTZ,
  target_completion_date     TIMESTAMPTZ,
  readiness_score_at_start   DOUBLE PRECISION,
  pace_status                TEXT DEFAULT 'on_track',
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_streak             INTEGER NOT NULL DEFAULT 0,
  longest_streak             INTEGER NOT NULL DEFAULT 0,
  grace_days_used_this_week  INTEGER NOT NULL DEFAULT 0,
  last_streak_date           DATE,
  streak_grace_week_start    DATE,
  milestones_shown           JSONB NOT NULL DEFAULT '[]'::jsonb,
  UNIQUE (user_id, trail_id)
);

-- ── user_trail_progress ──────────────────────────────────────
CREATE TABLE public.user_trail_progress (
  progress_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id  UUID NOT NULL REFERENCES public.user_trail_enrollments(enrollment_id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES auth.users(id),
  step_id        UUID NOT NULL REFERENCES public.trail_steps(step_id),
  completed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id     UUID REFERENCES public.quiz_sessions(session_id) ON DELETE SET NULL,
  time_spent_ms  INTEGER,
  UNIQUE (enrollment_id, step_id)
);

-- ── trail_day_completions ────────────────────────────────────
CREATE TABLE public.trail_day_completions (
  day_completion_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id                  UUID NOT NULL REFERENCES public.user_trail_enrollments(enrollment_id) ON DELETE CASCADE,
  day_id                         UUID NOT NULL REFERENCES public.trail_days(day_id),
  user_id                        UUID NOT NULL REFERENCES auth.users(id),
  completed_at                   TIMESTAMPTZ NOT NULL DEFAULT now(),
  readiness_score_at_completion  DOUBLE PRECISION,
  UNIQUE (enrollment_id, day_id)
);

-- ── session_trail_credits ────────────────────────────────────
CREATE TABLE public.session_trail_credits (
  session_id     UUID NOT NULL REFERENCES public.quiz_sessions(session_id) ON DELETE CASCADE,
  enrollment_id  UUID NOT NULL REFERENCES public.user_trail_enrollments(enrollment_id) ON DELETE CASCADE,
  step_id        UUID NOT NULL REFERENCES public.trail_steps(step_id),
  credited_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id, enrollment_id, step_id)
);


-- ═══════════════════════════════════════════════════════════════
-- TABLES — Subscriptions & Notifications
-- ═══════════════════════════════════════════════════════════════

-- ── user_subscriptions ───────────────────────────────────────
CREATE TABLE public.user_subscriptions (
  subscription_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                      UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  tier                         public.subscription_tier NOT NULL DEFAULT 'free',
  status                       public.subscription_status NOT NULL DEFAULT 'active',
  email_notifications_enabled  BOOLEAN DEFAULT true,
  marketing_emails_enabled     BOOLEAN DEFAULT false,
  stripe_customer_id           TEXT,
  stripe_subscription_id       TEXT,
  payrex_customer_id           TEXT,
  payrex_reference             TEXT,
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                   TIMESTAMPTZ NOT NULL DEFAULT now(),
  converted_from_source        TEXT,
  trial_started_at             TIMESTAMPTZ,
  readiness_score_at_conversion DOUBLE PRECISION,
  free_questions_today         INTEGER NOT NULL DEFAULT 0,
  free_cap_reset_date          DATE
);

-- ── user_push_tokens ─────────────────────────────────────────
CREATE TABLE public.user_push_tokens (
  token_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token       TEXT NOT NULL UNIQUE,
  platform    TEXT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── notification_log ─────────────────────────────────────────
CREATE TABLE public.notification_log (
  log_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger_type     TEXT NOT NULL,
  channel          TEXT NOT NULL,
  sent_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivery_status  TEXT DEFAULT 'sent'
);


-- ═══════════════════════════════════════════════════════════════
-- TABLES — Analytics & Notes
-- ═══════════════════════════════════════════════════════════════

-- ── analytics_events ─────────────────────────────────────────
CREATE TABLE public.analytics_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_name        TEXT NOT NULL,
  event_properties  JSONB DEFAULT '{}'::jsonb,
  page_path         TEXT,
  session_id        UUID,
  created_at        TIMESTAMPTZ DEFAULT now(),
  referrer          TEXT
);

-- ── wiki_article_reads ───────────────────────────────────────
CREATE TABLE public.wiki_article_reads (
  read_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id     UUID NOT NULL REFERENCES public.wiki_articles(article_id),
  read_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_pct       SMALLINT NOT NULL DEFAULT 0,
  time_spent_ms  INTEGER,
  trail_step_id  UUID REFERENCES public.trail_steps(step_id) ON DELETE SET NULL
);

-- ── note_folders ─────────────────────────────────────────────
CREATE TABLE public.note_folders (
  folder_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id),
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── notes ────────────────────────────────────────────────────
CREATE TABLE public.notes (
  note_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id),
  folder_id   UUID REFERENCES public.note_folders(folder_id),
  topic_id    UUID REFERENCES public.taxonomy_tree(node_id),
  title       TEXT NOT NULL DEFAULT 'Untitled Note',
  content     JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_pinned   BOOLEAN NOT NULL DEFAULT false,
  question_id UUID REFERENCES public.questions(question_id) ON DELETE SET NULL,
  session_id  UUID REFERENCES public.quiz_sessions(session_id) ON DELETE SET NULL,
  article_id  UUID REFERENCES public.wiki_articles(article_id) ON DELETE SET NULL,
  note_type   TEXT NOT NULL DEFAULT 'standard',
  tags        TEXT[] DEFAULT '{}'::text[],
  color       TEXT
);


-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on all tables EXCEPT anon_diagnostic_sessions
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blindspot_queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camp_trails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campfire_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.models_3d ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_score_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_trail_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spatial_hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxonomy_cross_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxonomy_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxonomy_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxonomy_tree ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teach_back_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_teach_back_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trail_day_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trail_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trail_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_computed_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_endurance_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_global_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mastery_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_node_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trail_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trail_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_article_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_article_taxonomy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_ei_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_ei_responses ENABLE ROW LEVEL SECURITY;
-- NOTE: anon_diagnostic_sessions does NOT have RLS — server-side only.


-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES (77 total)
-- ═══════════════════════════════════════════════════════════════

-- ── analytics_events ─────────────────────────────────────────
CREATE POLICY "Users can insert own events" ON public.analytics_events
  FOR INSERT TO public
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can view own events" ON public.analytics_events
  FOR SELECT TO public
  USING (auth.uid() = user_id);

-- ── blindspot_queues ─────────────────────────────────────────
CREATE POLICY "bq_insert_own" ON public.blindspot_queues
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bq_select_own" ON public.blindspot_queues
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "bq_update_own" ON public.blindspot_queues
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- ── camp_trails ──────────────────────────────────────────────
CREATE POLICY "camp_trails_select_authenticated" ON public.camp_trails
  FOR SELECT TO authenticated
  USING (true);

-- ── campfire_testimonials ────────────────────────────────────
CREATE POLICY "ct_select_featured" ON public.campfire_testimonials
  FOR SELECT TO public
  USING (is_featured = true AND is_verified = true);

-- ── disciplines ──────────────────────────────────────────────
CREATE POLICY "Anyone can read disciplines" ON public.disciplines
  FOR SELECT TO public
  USING (true);

-- ── exam_outcomes ────────────────────────────────────────────
CREATE POLICY "eo_insert_own" ON public.exam_outcomes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "eo_select_own" ON public.exam_outcomes
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ── feature_flags ────────────────────────────────────────────
CREATE POLICY "Admins can manage feature flags" ON public.feature_flags
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = auth.uid()
      AND (users.raw_app_meta_data ->> 'role') = 'admin'
  ));

CREATE POLICY "Authenticated users can read feature flags" ON public.feature_flags
  FOR SELECT TO authenticated
  USING (true);

-- ── models_3d ────────────────────────────────────────────────
CREATE POLICY "Anyone can read models_3d" ON public.models_3d
  FOR SELECT TO public
  USING (true);

-- ── note_folders ─────────────────────────────────────────────
CREATE POLICY "Users can manage own folders" ON public.note_folders
  FOR ALL TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── notes ────────────────────────────────────────────────────
CREATE POLICY "Users can manage own notes" ON public.notes
  FOR ALL TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── notification_log ─────────────────────────────────────────
CREATE POLICY "nl_admin_read" ON public.notification_log
  FOR SELECT TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ── organization_members ─────────────────────────────────────
CREATE POLICY "Members can read own org members" ON public.organization_members
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM organization_members self
    WHERE self.org_id = organization_members.org_id
      AND self.user_id = auth.uid()
  ));

CREATE POLICY "Org admins can manage members" ON public.organization_members
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM organization_members self
    WHERE self.org_id = organization_members.org_id
      AND self.user_id = auth.uid()
      AND self.role IN ('owner', 'admin')
  ));

-- ── organizations ────────────────────────────────────────────
CREATE POLICY "Members can read own organization" ON public.organizations
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.org_id = organizations.org_id
      AND organization_members.user_id = auth.uid()
  ));

CREATE POLICY "Org admins can update organization" ON public.organizations
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.org_id = organizations.org_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
  ));

-- ── profiles ─────────────────────────────────────────────────
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO public
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO public
  USING (auth.uid() = id);

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO public
  USING (auth.uid() = id);

-- ── questions ────────────────────────────────────────────────
CREATE POLICY "Anyone can read questions" ON public.questions
  FOR SELECT TO public
  USING (true);

-- ── quiz_sessions ────────────────────────────────────────────
CREATE POLICY "Users can delete own quiz sessions" ON public.quiz_sessions
  FOR DELETE TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz sessions" ON public.quiz_sessions
  FOR INSERT TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own quiz sessions" ON public.quiz_sessions
  FOR SELECT TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz sessions" ON public.quiz_sessions
  FOR UPDATE TO public
  USING (auth.uid() = user_id);

-- ── readiness_score_snapshots ────────────────────────────────
CREATE POLICY "Users can insert own readiness snapshots" ON public.readiness_score_snapshots
  FOR INSERT TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own readiness snapshots" ON public.readiness_score_snapshots
  FOR SELECT TO public
  USING (auth.uid() = user_id);

-- ── session_trail_credits ────────────────────────────────────
CREATE POLICY "credits_insert_own" ON public.session_trail_credits
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_trail_enrollments e
    WHERE e.enrollment_id = session_trail_credits.enrollment_id
      AND e.user_id = auth.uid()
  ));

CREATE POLICY "credits_select_own" ON public.session_trail_credits
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_trail_enrollments e
    WHERE e.enrollment_id = session_trail_credits.enrollment_id
      AND e.user_id = auth.uid()
  ));

-- ── spatial_hotspots ─────────────────────────────────────────
CREATE POLICY "Anyone can read spatial_hotspots" ON public.spatial_hotspots
  FOR SELECT TO public
  USING (true);

-- ── taxonomy_tree ────────────────────────────────────────────
CREATE POLICY "Anyone can read taxonomy_tree" ON public.taxonomy_tree
  FOR SELECT TO public
  USING (true);

-- ── taxonomy_cross_references ─────────────────────────────────
CREATE POLICY "txref_select_public" ON public.taxonomy_cross_references
  FOR SELECT TO public
  USING (true);

CREATE POLICY "txref_admin_manage" ON public.taxonomy_cross_references
  FOR ALL TO authenticated
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

-- ── taxonomy_sources ──────────────────────────────────────────
CREATE POLICY "tsrc_select_public" ON public.taxonomy_sources
  FOR SELECT TO public
  USING (true);

CREATE POLICY "tsrc_admin_manage" ON public.taxonomy_sources
  FOR ALL TO authenticated
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

-- ── taxonomy_prerequisites ────────────────────────────────────
CREATE POLICY "tpreq_select_public" ON public.taxonomy_prerequisites
  FOR SELECT TO public
  USING (true);

CREATE POLICY "tpreq_admin_manage" ON public.taxonomy_prerequisites
  FOR ALL TO authenticated
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

-- ── teach_back_submissions ───────────────────────────────────
CREATE POLICY "tbs_insert_own" ON public.teach_back_submissions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tbs_select_own" ON public.teach_back_submissions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "tbs_update_own" ON public.teach_back_submissions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- ── topic_teach_back_criteria ────────────────────────────────
CREATE POLICY "ttbc_admin_manage" ON public.topic_teach_back_criteria
  FOR ALL TO authenticated
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

CREATE POLICY "ttbc_select_all" ON public.topic_teach_back_criteria
  FOR SELECT TO authenticated
  USING (true);

-- ── trail_day_completions ────────────────────────────────────
CREATE POLICY "day_completions_insert_own" ON public.trail_day_completions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "day_completions_select_own" ON public.trail_day_completions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ── trail_days ───────────────────────────────────────────────
CREATE POLICY "trail_days_select_authenticated" ON public.trail_days
  FOR SELECT TO authenticated
  USING (true);

-- ── trail_steps ──────────────────────────────────────────────
CREATE POLICY "trail_steps_select_authenticated" ON public.trail_steps
  FOR SELECT TO authenticated
  USING (true);

-- ── user_computed_signals ────────────────────────────────────
CREATE POLICY "cs_select_own" ON public.user_computed_signals
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ── user_endurance_profiles ──────────────────────────────────
CREATE POLICY "ep_select_own" ON public.user_endurance_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ── user_global_stats ────────────────────────────────────────
CREATE POLICY "Users can insert own stats" ON public.user_global_stats
  FOR INSERT TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own stats" ON public.user_global_stats
  FOR SELECT TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON public.user_global_stats
  FOR UPDATE TO public
  USING (auth.uid() = user_id);

-- ── user_interactions ────────────────────────────────────────
CREATE POLICY "Users can insert own interactions" ON public.user_interactions
  FOR INSERT TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own interactions" ON public.user_interactions
  FOR SELECT TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own interactions" ON public.user_interactions
  FOR UPDATE TO public
  USING (auth.uid() = user_id);

-- ── user_mastery_history ─────────────────────────────────────
CREATE POLICY "mh_insert_own" ON public.user_mastery_history
  FOR INSERT TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "mh_select_own" ON public.user_mastery_history
  FOR SELECT TO public
  USING (auth.uid() = user_id);

-- ── user_node_mastery ────────────────────────────────────────
CREATE POLICY "Users can insert own node mastery" ON public.user_node_mastery
  FOR INSERT TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own node mastery" ON public.user_node_mastery
  FOR SELECT TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own node mastery" ON public.user_node_mastery
  FOR UPDATE TO public
  USING (auth.uid() = user_id);

-- ── user_push_tokens ─────────────────────────────────────────
CREATE POLICY "pt_manage_own" ON public.user_push_tokens
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── user_subscriptions ───────────────────────────────────────
CREATE POLICY "Admins can read all subscriptions" ON public.user_subscriptions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = auth.uid()
      AND (users.raw_app_meta_data ->> 'role') = 'admin'
  ));

CREATE POLICY "Users can read own subscription" ON public.user_subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.user_subscriptions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- ── user_trail_enrollments ───────────────────────────────────
CREATE POLICY "enrollments_insert_own" ON public.user_trail_enrollments
  FOR INSERT TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "enrollments_select_own" ON public.user_trail_enrollments
  FOR SELECT TO public
  USING (auth.uid() = user_id);

CREATE POLICY "enrollments_update_own" ON public.user_trail_enrollments
  FOR UPDATE TO public
  USING (auth.uid() = user_id);

-- ── user_trail_progress ──────────────────────────────────────
CREATE POLICY "progress_insert_own" ON public.user_trail_progress
  FOR INSERT TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "progress_select_own" ON public.user_trail_progress
  FOR SELECT TO public
  USING (auth.uid() = user_id);

-- ── wiki_article_reads ───────────────────────────────────────
CREATE POLICY "war_insert_own" ON public.wiki_article_reads
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "war_select_own" ON public.wiki_article_reads
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "war_update_own" ON public.wiki_article_reads
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id);

-- ── wiki_article_taxonomy ────────────────────────────────────
CREATE POLICY "Anyone can read wiki_article_taxonomy" ON public.wiki_article_taxonomy
  FOR SELECT TO public
  USING (true);

-- ── wiki_articles ────────────────────────────────────────────
CREATE POLICY "Anyone can read wiki_articles" ON public.wiki_articles
  FOR SELECT TO public
  USING (true);

-- ── wiki_ei_prompts ──────────────────────────────────────────
CREATE POLICY "eip_select_all" ON public.wiki_ei_prompts
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "eip_admin_manage" ON public.wiki_ei_prompts
  FOR ALL TO authenticated
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

-- ── wiki_ei_responses ────────────────────────────────────────
CREATE POLICY "eir_insert_own" ON public.wiki_ei_responses
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "eir_select_own" ON public.wiki_ei_responses
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "eir_update_own" ON public.wiki_ei_responses
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "eir_admin_read" ON public.wiki_ei_responses
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = auth.uid()
      AND (users.raw_app_meta_data ->> 'role') = 'admin'
  ));


-- ═══════════════════════════════════════════════════════════════
-- INDEXES (128 total, including PKs and unique constraints)
-- ═══════════════════════════════════════════════════════════════

-- ── analytics_events ─────────────────────────────────────────
CREATE INDEX idx_analytics_events_name_time ON public.analytics_events USING btree (event_name, created_at DESC);
CREATE INDEX idx_analytics_events_user ON public.analytics_events USING btree (user_id, created_at DESC);

-- ── anon_diagnostic_sessions ─────────────────────────────────
CREATE INDEX idx_anon_diagnostic_browser ON public.anon_diagnostic_sessions USING btree (browser_session_id);
CREATE INDEX idx_anon_diagnostic_expires ON public.anon_diagnostic_sessions USING btree (expires_at) WHERE (converted_user_id IS NULL);

-- ── blindspot_queues ─────────────────────────────────────────
CREATE INDEX idx_bq_user_generated ON public.blindspot_queues USING btree (user_id, generated_at DESC);
CREATE INDEX idx_bq_user_status ON public.blindspot_queues USING btree (user_id, status);

-- ── exam_outcomes ────────────────────────────────────────────
CREATE INDEX idx_eo_batch_result ON public.exam_outcomes USING btree (exam_batch, result);
CREATE INDEX idx_eo_score_result ON public.exam_outcomes USING btree (peak_readiness_score, result);
CREATE INDEX idx_eo_user ON public.exam_outcomes USING btree (user_id);

-- ── models_3d ────────────────────────────────────────────────
CREATE INDEX idx_models_3d_status ON public.models_3d USING btree (status);

-- ── notes ────────────────────────────────────────────────────
CREATE INDEX idx_notes_topic ON public.notes USING btree (topic_id) WHERE (topic_id IS NOT NULL);
CREATE INDEX idx_notes_user_article ON public.notes USING btree (user_id, article_id) WHERE (article_id IS NOT NULL);
CREATE INDEX idx_notes_user_pinned ON public.notes USING btree (user_id, is_pinned DESC, updated_at DESC);
CREATE INDEX idx_notes_user_question ON public.notes USING btree (user_id, question_id) WHERE (question_id IS NOT NULL);
CREATE INDEX idx_notes_user_topic ON public.notes USING btree (user_id, topic_id) WHERE (topic_id IS NOT NULL);
CREATE INDEX idx_notes_user_updated ON public.notes USING btree (user_id, updated_at DESC);

-- ── notification_log ─────────────────────────────────────────
CREATE INDEX idx_notif_log_trigger ON public.notification_log USING btree (trigger_type, sent_at DESC);
CREATE INDEX idx_notif_log_user_day ON public.notification_log USING btree (user_id, sent_at DESC);

-- ── questions ────────────────────────────────────────────────
CREATE INDEX idx_questions_application_context ON public.questions USING btree (topic_id, application_context);
CREATE INDEX idx_questions_assessment ON public.questions USING btree (is_assessment) WHERE (is_assessment = true);
CREATE INDEX idx_questions_topic_difficulty ON public.questions USING btree (topic_id, difficulty);
CREATE INDEX idx_questions_topic_id ON public.questions USING btree (topic_id);

-- ── quiz_sessions ────────────────────────────────────────────
CREATE INDEX idx_quiz_sessions_user_id ON public.quiz_sessions USING btree (user_id);
CREATE INDEX idx_quiz_sessions_user_status ON public.quiz_sessions USING btree (user_id, status);

-- ── readiness_score_snapshots ────────────────────────────────
CREATE INDEX idx_readiness_snapshots_user_id ON public.readiness_score_snapshots USING btree (user_id);
CREATE INDEX idx_readiness_snapshots_user_proof ON public.readiness_score_snapshots USING btree (user_id, computed_at DESC, is_proof_simulation);
CREATE INDEX idx_readiness_snapshots_user_time ON public.readiness_score_snapshots USING btree (user_id, computed_at DESC);

-- ── spatial_hotspots ─────────────────────────────────────────
CREATE INDEX idx_spatial_hotspots_model_id ON public.spatial_hotspots USING btree (model_id);
CREATE INDEX idx_spatial_hotspots_node_id ON public.spatial_hotspots USING btree (node_id);

-- ── teach_back_submissions ───────────────────────────────────
CREATE INDEX idx_teach_back_topic ON public.teach_back_submissions USING btree (topic_id);
CREATE INDEX idx_teach_back_user ON public.teach_back_submissions USING btree (user_id, created_at DESC);

-- ── taxonomy_tree (v5.0 indexes) ──────────────────────────────
CREATE UNIQUE INDEX idx_taxonomy_ale_id ON public.taxonomy_tree USING btree (ale_id) WHERE (ale_id IS NOT NULL);
CREATE INDEX idx_taxonomy_node_type ON public.taxonomy_tree USING btree (node_type) WHERE (node_type IS NOT NULL);
CREATE INDEX idx_taxonomy_type_frequency ON public.taxonomy_tree USING btree (node_type, exam_frequency) WHERE (is_leaf = true);
CREATE INDEX idx_taxonomy_prc_area ON public.taxonomy_tree USING btree (prc_area) WHERE (prc_area IS NOT NULL);
CREATE INDEX idx_taxonomy_active_leaves ON public.taxonomy_tree USING btree (discipline_id, is_leaf) WHERE (deprecated_at IS NULL AND is_leaf = true);
CREATE INDEX idx_taxonomy_3d_linked ON public.taxonomy_tree USING btree (discipline_id) WHERE (three_d_lab_linked = true);
CREATE INDEX idx_taxonomy_bloom_difficulty ON public.taxonomy_tree USING btree (bloom_level, difficulty) WHERE (is_leaf = true);

-- ── taxonomy_cross_references ─────────────────────────────────
CREATE INDEX idx_xref_source ON public.taxonomy_cross_references USING btree (source_node_id);
CREATE INDEX idx_xref_target ON public.taxonomy_cross_references USING btree (target_node_id);

-- ── taxonomy_sources ──────────────────────────────────────────
CREATE INDEX idx_taxonomy_sources_node ON public.taxonomy_sources USING btree (node_id);
CREATE INDEX idx_taxonomy_sources_verified ON public.taxonomy_sources USING btree (node_id, is_verified) WHERE (is_verified = true);

-- ── taxonomy_prerequisites ────────────────────────────────────
CREATE INDEX idx_prereq_subtopic ON public.taxonomy_prerequisites USING btree (subtopic_id);
CREATE INDEX idx_prereq_prerequisite ON public.taxonomy_prerequisites USING btree (prerequisite_id);

-- ── topic_teach_back_criteria ────────────────────────────────
CREATE INDEX idx_teach_back_criteria_topic ON public.topic_teach_back_criteria USING btree (topic_id);

-- ── trail_day_completions ────────────────────────────────────
CREATE INDEX idx_day_completions_enrollment ON public.trail_day_completions USING btree (enrollment_id);
CREATE INDEX idx_trail_day_completions_day_id ON public.trail_day_completions USING btree (day_id);
CREATE INDEX idx_trail_day_completions_user_id ON public.trail_day_completions USING btree (user_id);

-- ── user_computed_signals ────────────────────────────────────
CREATE INDEX idx_computed_signals_churn ON public.user_computed_signals USING btree (churn_risk_score DESC) WHERE (churn_risk_score > 0.6);

-- ── user_endurance_profiles ──────────────────────────────────
CREATE INDEX idx_endurance_profiles_pacing ON public.user_endurance_profiles USING btree (user_id, avg_seconds_per_question);

-- ── user_interactions ────────────────────────────────────────
CREATE INDEX idx_interactions_session_order ON public.user_interactions USING btree (session_id, question_order);
CREATE INDEX idx_user_interactions_question_id ON public.user_interactions USING btree (question_id);
CREATE INDEX idx_user_interactions_session_time ON public.user_interactions USING btree (session_id, interaction_timestamp);
CREATE INDEX idx_user_interactions_user_id ON public.user_interactions USING btree (user_id);

-- ── user_mastery_history ─────────────────────────────────────
CREATE INDEX idx_mastery_history_topic_id ON public.user_mastery_history USING btree (topic_id);
CREATE INDEX idx_mastery_history_user_topic ON public.user_mastery_history USING btree (user_id, topic_id, created_at DESC);

-- ── user_node_mastery ────────────────────────────────────────
CREATE INDEX idx_node_mastery_user_review ON public.user_node_mastery USING btree (user_id, next_review_at) WHERE (next_review_at IS NOT NULL);
CREATE INDEX idx_user_node_mastery_user ON public.user_node_mastery USING btree (user_id);

-- ── user_push_tokens ─────────────────────────────────────────
CREATE INDEX idx_push_tokens_user ON public.user_push_tokens USING btree (user_id) WHERE (is_active = true);

-- ── user_trail_enrollments ───────────────────────────────────
CREATE INDEX idx_trail_enrollments_trail ON public.user_trail_enrollments USING btree (trail_id, status);
CREATE INDEX idx_trail_enrollments_user ON public.user_trail_enrollments USING btree (user_id, status);

-- ── user_trail_progress ──────────────────────────────────────
CREATE INDEX idx_trail_progress_enrollment ON public.user_trail_progress USING btree (enrollment_id);
CREATE INDEX idx_trail_progress_user ON public.user_trail_progress USING btree (user_id);

-- ── wiki_article_reads ───────────────────────────────────────
CREATE INDEX idx_wiki_reads_user_article ON public.wiki_article_reads USING btree (user_id, article_id, read_at DESC);
CREATE INDEX idx_wiki_reads_user_recent ON public.wiki_article_reads USING btree (user_id, read_at DESC);

-- ── wiki_article_taxonomy ────────────────────────────────────
CREATE INDEX idx_wiki_article_taxonomy_node_id ON public.wiki_article_taxonomy USING btree (node_id);

-- ── wiki_articles ────────────────────────────────────────────
CREATE INDEX idx_wiki_articles_reviewed_by ON public.wiki_articles USING btree (reviewed_by) WHERE (reviewed_by IS NOT NULL);
CREATE INDEX idx_wiki_articles_status ON public.wiki_articles USING btree (status);

-- ── wiki_ei_prompts ──────────────────────────────────────────
CREATE INDEX idx_ei_prompts_article ON public.wiki_ei_prompts USING btree (article_id);
CREATE INDEX idx_ei_prompts_article_active ON public.wiki_ei_prompts USING btree (article_id, sort_order) WHERE (status = 'published' AND is_active = true);
CREATE INDEX idx_ei_prompts_status ON public.wiki_ei_prompts USING btree (status) WHERE (status IN ('draft', 'review'));

-- ── wiki_ei_responses ────────────────────────────────────────
CREATE INDEX idx_ei_responses_user ON public.wiki_ei_responses USING btree (user_id, responded_at DESC);
CREATE INDEX idx_ei_responses_user_prompt ON public.wiki_ei_responses USING btree (user_id, prompt_id);
CREATE INDEX idx_ei_responses_prompt ON public.wiki_ei_responses USING btree (prompt_id);


-- ═══════════════════════════════════════════════════════════════
-- FUNCTIONS (9 total)
-- ═══════════════════════════════════════════════════════════════

-- ── update_updated_at_column ─────────────────────────────────
-- Shared trigger function used by most tables to auto-update updated_at.
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql
SET search_path TO 'public'
AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

-- ── update_enrollment_updated_at ─────────────────────────────
-- Separate function for user_trail_enrollments.
CREATE OR REPLACE FUNCTION public.update_enrollment_updated_at()
RETURNS trigger LANGUAGE plpgsql
SET search_path TO 'public'
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ── compute_analysis_available_at ────────────────────────────
-- Sets analysis_available_at: +24h for proof sims, immediate otherwise.
CREATE OR REPLACE FUNCTION public.compute_analysis_available_at()
RETURNS trigger LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_proof_simulation THEN
    NEW.analysis_available_at := NEW.computed_at + INTERVAL '24 hours';
  ELSE
    NEW.analysis_available_at := NEW.computed_at;
  END IF;
  RETURN NEW;
END;
$$;

-- ── snapshot_readiness_on_session_complete ────────────────────
-- Auto-creates a readiness_score_snapshot when a session completes.
CREATE OR REPLACE FUNCTION public.snapshot_readiness_on_session_complete()
RETURNS trigger LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO public.readiness_score_snapshots (
      user_id, score, sub_scores, session_id, is_proof_simulation, computed_at
    )
    SELECT
      NEW.user_id,
      ugs.global_readiness_score,
      ugs.readiness_sub_scores,    -- reads real sub_scores from anti-inflation system
      NEW.session_id,
      COALESCE(NEW.is_proof_simulation, false),
      NOW()
    FROM public.user_global_stats ugs
    WHERE ugs.user_id = NEW.user_id
      AND ugs.global_readiness_score IS NOT NULL
      AND ugs.global_readiness_score > 0;
  END IF;
  RETURN NEW;
END;
$$;

-- ── flag_lucky_guess_on_insert ───────────────────────────────
-- Flags suspected lucky guesses: correct answer in Red zone + abnormally fast.
CREATE OR REPLACE FUNCTION public.flag_lucky_guess_on_insert()
RETURNS trigger LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  v_mastery_weight DOUBLE PRECISION;
  v_avg_time_ms    INTEGER;
BEGIN
  IF NEW.is_correct = false THEN
    RETURN NEW;
  END IF;

  SELECT current_mastery_weight, avg_time_ms
  INTO v_mastery_weight, v_avg_time_ms
  FROM public.user_node_mastery
  WHERE user_id = NEW.user_id AND topic_id = NEW.topic_id;

  IF v_mastery_weight IS NOT NULL
    AND v_mastery_weight < 0.4
    AND NEW.time_spent_ms < COALESCE(v_avg_time_ms * 0.4, 5000)
    AND NEW.time_spent_ms > 0
  THEN
    NEW.is_suspected_lucky_guess := true;
  END IF;

  RETURN NEW;
END;
$$;

-- ── log_mastery_history_on_update ─────────────────────────────
-- Snapshots mastery history when user_node_mastery is updated.
CREATE OR REPLACE FUNCTION public.log_mastery_history_on_update()
RETURNS trigger LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_mastery_history (
    user_id, topic_id, mastery_weight, total_correct, total_attempts, snapshot_reason
  ) VALUES (
    NEW.user_id, NEW.topic_id, NEW.current_mastery_weight,
    NEW.total_correct, NEW.total_attempts, 'session_complete'
  );
  RETURN NEW;
END;
$$;

-- ── update_enrollment_on_day_completion ───────────────────────
-- Increments days_completed and advances current_day when a trail day is completed.
CREATE OR REPLACE FUNCTION public.update_enrollment_on_day_completion()
RETURNS trigger LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    UPDATE public.user_trail_enrollments
    SET days_completed = days_completed + 1,
        current_day = GREATEST(current_day, (
            SELECT day_number + 1 FROM public.trail_days WHERE day_id = NEW.day_id
        )),
        last_activity_at = now()
    WHERE enrollment_id = NEW.enrollment_id;
    RETURN NEW;
END;
$$;

-- ── update_enrollment_on_progress ────────────────────────────
-- Updates last_activity_at when trail progress is recorded.
CREATE OR REPLACE FUNCTION public.update_enrollment_on_progress()
RETURNS trigger LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    UPDATE public.user_trail_enrollments
    SET last_activity_at = now()
    WHERE enrollment_id = NEW.enrollment_id;
    RETURN NEW;
END;
$$;

-- ── check_question_topic_not_cross_ref ────────────────────────
-- Prevents questions from being linked to cross-reference-only taxonomy nodes.
CREATE OR REPLACE FUNCTION public.check_question_topic_not_cross_ref()
RETURNS trigger LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.taxonomy_tree
    WHERE node_id = NEW.topic_id
      AND is_cross_ref_only = true
  ) THEN
    RAISE EXCEPTION 'Cannot assign question to a cross-reference-only taxonomy node: %', NEW.topic_id;
  END IF;
  RETURN NEW;
END;
$$;


-- ═══════════════════════════════════════════════════════════════
-- TRIGGERS (31 total)
-- ═══════════════════════════════════════════════════════════════

-- ── updated_at triggers (shared function) ────────────────────
CREATE TRIGGER tr_camp_trails_updated_at
  BEFORE UPDATE ON public.camp_trails FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_disciplines_updated_at
  BEFORE UPDATE ON public.disciplines FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_models_3d_updated_at
  BEFORE UPDATE ON public.models_3d FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_note_folders_updated_at
  BEFORE UPDATE ON public.note_folders FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_notes_updated_at
  BEFORE UPDATE ON public.notes FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_organizations_updated_at
  BEFORE UPDATE ON public.organizations FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_questions_updated_at
  BEFORE UPDATE ON public.questions FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_quiz_sessions_updated_at
  BEFORE UPDATE ON public.quiz_sessions FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_spatial_hotspots_updated_at
  BEFORE UPDATE ON public.spatial_hotspots FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_taxonomy_tree_updated_at
  BEFORE UPDATE ON public.taxonomy_tree FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_teach_back_submissions_updated_at
  BEFORE UPDATE ON public.teach_back_submissions FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_topic_teach_back_criteria_updated_at
  BEFORE UPDATE ON public.topic_teach_back_criteria FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_computed_signals_updated_at
  BEFORE UPDATE ON public.user_computed_signals FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_endurance_profiles_updated_at
  BEFORE UPDATE ON public.user_endurance_profiles FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_user_global_stats_updated_at
  BEFORE UPDATE ON public.user_global_stats FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_user_interactions_updated_at
  BEFORE UPDATE ON public.user_interactions FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER user_node_mastery_updated_at
  BEFORE UPDATE ON public.user_node_mastery FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_push_tokens_updated_at
  BEFORE UPDATE ON public.user_push_tokens FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_wiki_articles_updated_at
  BEFORE UPDATE ON public.wiki_articles FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_wiki_ei_prompts_updated_at
  BEFORE UPDATE ON public.wiki_ei_prompts FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_wiki_ei_responses_updated_at
  BEFORE UPDATE ON public.wiki_ei_responses FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ── domain-specific triggers ─────────────────────────────────

CREATE TRIGGER trg_snapshot_readiness
  AFTER UPDATE ON public.quiz_sessions FOR EACH ROW
  EXECUTE FUNCTION public.snapshot_readiness_on_session_complete();

CREATE TRIGGER tr_set_analysis_available_at
  BEFORE INSERT ON public.readiness_score_snapshots FOR EACH ROW
  EXECUTE FUNCTION public.compute_analysis_available_at();

CREATE TRIGGER trg_flag_lucky_guess
  BEFORE INSERT ON public.user_interactions FOR EACH ROW
  EXECUTE FUNCTION public.flag_lucky_guess_on_insert();

CREATE TRIGGER trg_log_mastery_history
  AFTER UPDATE ON public.user_node_mastery FOR EACH ROW
  EXECUTE FUNCTION public.log_mastery_history_on_update();

CREATE TRIGGER trg_day_completion_update_enrollment
  AFTER INSERT ON public.trail_day_completions FOR EACH ROW
  EXECUTE FUNCTION public.update_enrollment_on_day_completion();

CREATE TRIGGER trg_enrollment_updated_at
  BEFORE UPDATE ON public.user_trail_enrollments FOR EACH ROW
  EXECUTE FUNCTION public.update_enrollment_updated_at();

CREATE TRIGGER trg_progress_update_enrollment
  AFTER INSERT ON public.user_trail_progress FOR EACH ROW
  EXECUTE FUNCTION public.update_enrollment_on_progress();

CREATE TRIGGER trg_check_question_topic
  BEFORE INSERT OR UPDATE ON public.questions FOR EACH ROW
  EXECUTE FUNCTION public.check_question_topic_not_cross_ref();


-- ═══════════════════════════════════════════════════════════════
-- TABLES — Feature Implementation (Migrations 033–037)
-- ═══════════════════════════════════════════════════════════════

-- ── design_problems ───────────────────────────────────────────
CREATE TABLE public.design_problems (
  problem_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  building_type     TEXT NOT NULL
    CHECK (building_type IN ('residential', 'commercial', 'institutional', 'mixed_use', 'industrial')),
  difficulty        INTEGER CHECK (difficulty BETWEEN 1 AND 4),
  time_limit_minutes INTEGER DEFAULT 180,
  brief             TEXT NOT NULL,
  program           JSONB NOT NULL DEFAULT '{}'::jsonb,
  site_data         JSONB NOT NULL DEFAULT '{}'::jsonb,
  code_references   TEXT[] DEFAULT '{}'::text[],
  is_published      BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── design_problem_sessions ───────────────────────────────────
CREATE TABLE public.design_problem_sessions (
  session_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id             UUID NOT NULL REFERENCES public.design_problems(problem_id) ON DELETE CASCADE,
  started_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at           TIMESTAMPTZ,
  time_elapsed_seconds   INTEGER,
  self_assessment_score  INTEGER CHECK (self_assessment_score BETWEEN 1 AND 5),
  checklist_completion   JSONB DEFAULT '{}'::jsonb
);

-- ── study_pods ────────────────────────────────────────────────
CREATE TABLE public.study_pods (
  pod_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_name    TEXT,
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  max_members INTEGER NOT NULL DEFAULT 6,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── pod_members ───────────────────────────────────────────────
CREATE TABLE public.pod_members (
  pod_id     UUID NOT NULL REFERENCES public.study_pods(pod_id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (pod_id, user_id)
);

-- ── oath_taking_schedules ─────────────────────────────────────
CREATE TABLE public.oath_taking_schedules (
  schedule_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oath_date    DATE NOT NULL,
  region       TEXT NOT NULL,
  venue        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── code_updates ──────────────────────────────────────────────
CREATE TABLE public.code_updates (
  update_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ale_id          TEXT REFERENCES public.taxonomy_tree(ale_id) ON DELETE SET NULL,
  summary         TEXT NOT NULL,
  previous_value  TEXT,
  new_value       TEXT,
  effective_date  DATE,
  is_ale_testable BOOLEAN NOT NULL DEFAULT true,
  published_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── questions.practice_context (Migration 037) ────────────────
-- ALTER TABLE public.questions ADD COLUMN practice_context TEXT[] DEFAULT '{}'::text[];
-- GIN index: idx_questions_practice_context


-- ═══════════════════════════════════════════════════════════════
-- RLS — Feature Implementation Tables
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.design_problems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dp_select_published" ON public.design_problems
  FOR SELECT TO authenticated USING (is_published = true);
CREATE POLICY "dp_admin_manage" ON public.design_problems
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM auth.users WHERE users.id = auth.uid()
    AND (users.raw_app_meta_data ->> 'role') = 'admin'));

ALTER TABLE public.design_problem_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dps_select_own" ON public.design_problem_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "dps_insert_own" ON public.design_problem_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "dps_update_own" ON public.design_problem_sessions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

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

ALTER TABLE public.oath_taking_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ots_select_all" ON public.oath_taking_schedules
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "ots_admin_manage" ON public.oath_taking_schedules
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM auth.users WHERE users.id = auth.uid()
    AND (users.raw_app_meta_data ->> 'role') = 'admin'));

ALTER TABLE public.code_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cu_select_all" ON public.code_updates
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "cu_admin_manage" ON public.code_updates
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM auth.users WHERE users.id = auth.uid()
    AND (users.raw_app_meta_data ->> 'role') = 'admin'));


-- ═══════════════════════════════════════════════════════════════
-- INDEXES — Feature Implementation Tables
-- ═══════════════════════════════════════════════════════════════

CREATE INDEX idx_design_sessions_user ON public.design_problem_sessions (user_id, started_at DESC);
CREATE INDEX idx_design_sessions_problem ON public.design_problem_sessions (problem_id);
CREATE INDEX idx_pod_members_user ON public.pod_members (user_id);
CREATE INDEX idx_pod_members_pod ON public.pod_members (pod_id);
CREATE INDEX idx_code_updates_ale_id ON public.code_updates (ale_id) WHERE ale_id IS NOT NULL;
CREATE INDEX idx_code_updates_published ON public.code_updates (published_at DESC);
CREATE INDEX idx_questions_practice_context ON public.questions USING gin (practice_context) WHERE array_length(practice_context, 1) > 0;


-- ═══════════════════════════════════════════════════════════════
-- END OF SCHEMA
-- ═══════════════════════════════════════════════════════════════
