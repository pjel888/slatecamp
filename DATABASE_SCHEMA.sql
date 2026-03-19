-- ============================================================
-- SlateCamp — Complete Database Schema
-- Regenerated from live Supabase instance: 2026-03-19
-- ============================================================
--
-- This file is DOCUMENTATION, not a migration.
-- It reflects the exact state of the production database.
--
-- 33 tables · 9 enums · 7 functions · 26 triggers · 63 policies · 94 indexes
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


-- ═══════════════════════════════════════════════════════════════
-- TABLES — Core
-- ═══════════════════════════════════════════════════════════════

-- ── disciplines ─────────────────────────────────────────────
CREATE TABLE public.disciplines (
  discipline_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL UNIQUE,
  acronym         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── taxonomy_tree ───────────────────────────────────────────
CREATE TABLE public.taxonomy_tree (
  node_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discipline_id   UUID NOT NULL REFERENCES public.disciplines(discipline_id),
  parent_id       UUID REFERENCES public.taxonomy_tree(node_id),
  level           SMALLINT NOT NULL CHECK (level >= 1 AND level <= 6),
  name            TEXT NOT NULL,
  subject_area    TEXT NOT NULL,
  slug            TEXT UNIQUE,
  is_leaf         BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── profiles ────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id                      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name               TEXT,
  display_name            TEXT,
  avatar_url              TEXT,
  user_type               TEXT DEFAULT 'reviewee'
                            CHECK (user_type IN ('undergrad', 'reviewee', 'professional', 'instructor')),
  discipline_id           UUID REFERENCES public.disciplines(discipline_id),
  target_exam_date        DATE,
  school_or_institution   TEXT,
  onboarding_completed_at TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now(),
  preferred_study_window  TEXT DEFAULT 'any'
                            CHECK (preferred_study_window IN ('morning', 'evening', 'both', 'any'))
);


-- ═══════════════════════════════════════════════════════════════
-- TABLES — Content
-- ═══════════════════════════════════════════════════════════════

-- ── questions ───────────────────────────────────────────────
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
                         CHECK (application_context IS NULL OR application_context IN
                           ('recall', 'calculation', 'design_application', 'code_interpretation', 'client_scenario'))
);

-- ── wiki_articles ───────────────────────────────────────────
CREATE TABLE public.wiki_articles (
  article_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  content           TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  status            TEXT DEFAULT 'draft'
                      CONSTRAINT chk_wiki_articles_status CHECK (status IN ('draft', 'published', 'archived')),
  reviewed_by       UUID,
  reviewed_at       TIMESTAMPTZ,
  reviewer_comments TEXT
);

-- ── wiki_article_taxonomy ───────────────────────────────────
CREATE TABLE public.wiki_article_taxonomy (
  article_id  UUID NOT NULL REFERENCES public.wiki_articles(article_id),
  node_id     UUID NOT NULL REFERENCES public.taxonomy_tree(node_id),
  is_primary  BOOLEAN DEFAULT false,
  PRIMARY KEY (article_id, node_id)
);

-- ── models_3d ───────────────────────────────────────────────
CREATE TABLE public.models_3d (
  model_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  url         TEXT NOT NULL,
  thumbnail   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  status      TEXT DEFAULT 'draft'
                CONSTRAINT chk_models_3d_status CHECK (status IN ('draft', 'published', 'archived')),
  metadata    JSONB DEFAULT '{}'::jsonb,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ
);

-- ── spatial_hotspots ────────────────────────────────────────
CREATE TABLE public.spatial_hotspots (
  hotspot_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id    UUID NOT NULL REFERENCES public.models_3d(model_id),
  node_id     UUID REFERENCES public.taxonomy_tree(node_id),
  title       TEXT NOT NULL,
  description TEXT,
  position_x  DOUBLE PRECISION NOT NULL,
  position_y  DOUBLE PRECISION NOT NULL,
  position_z  DOUBLE PRECISION NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ═══════════════════════════════════════════════════════════════
-- TABLES — Quiz Engine
-- ═══════════════════════════════════════════════════════════════

-- ── quiz_sessions ───────────────────────────────────────────
CREATE TABLE public.quiz_sessions (
  session_id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                       UUID NOT NULL REFERENCES auth.users(id),
  discipline_id                 UUID REFERENCES public.disciplines(discipline_id),
  test_mode                     test_mode NOT NULL DEFAULT 'camp',
  status                        session_status NOT NULL DEFAULT 'in_progress',
  config                        JSONB NOT NULL DEFAULT '{}'::jsonb,
  question_ids                  UUID[] NOT NULL DEFAULT '{}'::uuid[],
  subject_ids                   UUID[] NOT NULL DEFAULT '{}'::uuid[],
  current_question_index        INTEGER NOT NULL DEFAULT 0,
  started_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at                  TIMESTAMPTZ,
  pre_session_confidence_ratings JSONB DEFAULT '{}'::jsonb,
  is_proof_simulation           BOOLEAN DEFAULT false
);

-- ── user_interactions ───────────────────────────────────────
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
  confidence              TEXT CHECK (confidence IN ('sure', 'unsure')),
  rationale_view_ms       INTEGER DEFAULT 0,
  error_type              TEXT,
  question_order          INTEGER,
  is_suspected_lucky_guess BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (user_id, session_id, question_id)
);


-- ═══════════════════════════════════════════════════════════════
-- TABLES — Mastery & Readiness
-- ═══════════════════════════════════════════════════════════════

-- ── user_node_mastery ───────────────────────────────────────
CREATE TABLE public.user_node_mastery (
  user_id                UUID NOT NULL REFERENCES auth.users(id),
  topic_id               UUID NOT NULL REFERENCES public.taxonomy_tree(node_id),
  total_attempts          INTEGER NOT NULL DEFAULT 0,
  total_correct           INTEGER NOT NULL DEFAULT 0,
  current_mastery_weight  DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  avg_time_ms             INTEGER NOT NULL DEFAULT 0,
  last_encountered        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now(),
  teach_back_attempted    BOOLEAN DEFAULT false,
  teach_back_gap_count    INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, topic_id)
);

-- ── user_mastery_history ────────────────────────────────────
CREATE TABLE public.user_mastery_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id        UUID NOT NULL REFERENCES public.taxonomy_tree(node_id) ON DELETE RESTRICT,
  mastery_weight  NUMERIC NOT NULL,
  total_correct   INTEGER NOT NULL DEFAULT 0,
  total_attempts  INTEGER NOT NULL DEFAULT 0,
  session_id      UUID REFERENCES public.quiz_sessions(session_id),
  snapshot_reason TEXT DEFAULT 'session_complete'
                    CHECK (snapshot_reason IN ('session_complete', 'daily_snapshot', 'manual')),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── user_global_stats ───────────────────────────────────────
CREATE TABLE public.user_global_stats (
  user_id                   UUID PRIMARY KEY REFERENCES auth.users(id),
  current_discipline_id     UUID REFERENCES public.disciplines(discipline_id),
  global_readiness_score    DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  target_exam_date          TIMESTAMPTZ,
  final_stretch_upsell_shown BOOLEAN DEFAULT false,
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Marketing attribution
  signup_source             TEXT,
  utm_campaign              TEXT,
  utm_medium                TEXT,
  utm_content               TEXT,
  referral_code             TEXT,
  -- Lifecycle timestamps
  first_session_at          TIMESTAMPTZ,
  onboarding_completed_at   TIMESTAMPTZ,
  assessment_completed_at   TIMESTAMPTZ,
  assessment_score          DOUBLE PRECISION,
  -- Multi-touch attribution
  first_touch_source        TEXT,
  first_touch_campaign      TEXT,
  last_touch_source         TEXT,
  last_touch_campaign       TEXT,
  acquisition_touchpoints   JSONB DEFAULT '[]'::jsonb,
  -- Exam history
  exam_attempt_number       INTEGER DEFAULT 1,
  previous_exam_result      TEXT,
  customer_archetype        TEXT,
  -- DEPRECATED — use user_computed_signals instead
  churn_risk_score          DOUBLE PRECISION DEFAULT 0,        -- DEPRECATED
  churn_risk_updated_at     TIMESTAMPTZ,                       -- DEPRECATED
  score_velocity_7d         DOUBLE PRECISION DEFAULT 0,        -- DEPRECATED
  score_velocity_updated_at TIMESTAMPTZ                        -- DEPRECATED
);

-- ── readiness_score_snapshots ───────────────────────────────
CREATE TABLE public.readiness_score_snapshots (
  snapshot_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id),
  score               DOUBLE PRECISION NOT NULL,
  sub_scores          JSONB NOT NULL DEFAULT '{}'::jsonb,
  computed_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id          UUID REFERENCES public.quiz_sessions(session_id),
  is_proof_simulation BOOLEAN NOT NULL DEFAULT false
);

-- ── user_computed_signals ───────────────────────────────────
CREATE TABLE public.user_computed_signals (
  user_id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  score_velocity_7d        DOUBLE PRECISION NOT NULL DEFAULT 0,
  score_velocity_updated_at TIMESTAMPTZ,
  churn_risk_score         DOUBLE PRECISION NOT NULL DEFAULT 0,
  churn_risk_updated_at    TIMESTAMPTZ,
  days_since_last_session  INTEGER,
  sessions_last_7d         INTEGER NOT NULL DEFAULT 0,
  computed_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ═══════════════════════════════════════════════════════════════
-- TABLES — Camp Trails
-- ═══════════════════════════════════════════════════════════════

-- ── camp_trails ─────────────────────────────────────────────
CREATE TABLE public.camp_trails (
  trail_id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discipline_id          UUID NOT NULL REFERENCES public.disciplines(discipline_id),
  name                   TEXT NOT NULL,
  slug                   TEXT NOT NULL UNIQUE,
  description            TEXT,
  trail_type             trail_type NOT NULL,
  intensity              trail_intensity,
  duration_days          INTEGER NOT NULL,
  total_steps            INTEGER NOT NULL DEFAULT 0,
  is_published           BOOLEAN NOT NULL DEFAULT false,
  is_featured            BOOLEAN NOT NULL DEFAULT false,
  recommended_min_score  DOUBLE PRECISION,
  recommended_max_score  DOUBLE PRECISION,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── trail_days ──────────────────────────────────────────────
CREATE TABLE public.trail_days (
  day_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trail_id          UUID NOT NULL REFERENCES public.camp_trails(trail_id) ON DELETE CASCADE,
  day_number        INTEGER NOT NULL,
  title             TEXT NOT NULL,
  description       TEXT,
  estimated_minutes INTEGER DEFAULT 60,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (trail_id, day_number)
);

-- ── trail_steps ─────────────────────────────────────────────
CREATE TABLE public.trail_steps (
  step_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id            UUID NOT NULL REFERENCES public.trail_days(day_id) ON DELETE CASCADE,
  step_order        INTEGER NOT NULL,
  step_type         trail_step_type NOT NULL,
  title             TEXT NOT NULL,
  description       TEXT,
  target_node_ids   UUID[] DEFAULT '{}'::uuid[],
  question_count    INTEGER,
  difficulty_min    DOUBLE PRECISION DEFAULT 0.0,
  difficulty_max    DOUBLE PRECISION DEFAULT 1.0,
  article_id        UUID REFERENCES public.wiki_articles(article_id) ON DELETE SET NULL,
  model_id          UUID REFERENCES public.models_3d(model_id) ON DELETE SET NULL,
  estimated_minutes INTEGER DEFAULT 15,
  is_optional       BOOLEAN NOT NULL DEFAULT false,
  preferred_time    TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (day_id, step_order)
);

-- ── user_trail_enrollments ──────────────────────────────────
CREATE TABLE public.user_trail_enrollments (
  enrollment_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES auth.users(id),
  trail_id               UUID NOT NULL REFERENCES public.camp_trails(trail_id),
  status                 trail_enrollment_status NOT NULL DEFAULT 'active',
  current_day            INTEGER NOT NULL DEFAULT 1,
  days_completed         INTEGER NOT NULL DEFAULT 0,
  last_activity_at       TIMESTAMPTZ,
  started_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  paused_at              TIMESTAMPTZ,
  completed_at           TIMESTAMPTZ,
  target_completion_date TIMESTAMPTZ,
  readiness_score_at_start DOUBLE PRECISION,
  pace_status            TEXT DEFAULT 'on_track',
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, trail_id)
);

-- ── user_trail_progress ─────────────────────────────────────
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

-- ── trail_day_completions ───────────────────────────────────
CREATE TABLE public.trail_day_completions (
  day_completion_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id                  UUID NOT NULL REFERENCES public.user_trail_enrollments(enrollment_id) ON DELETE CASCADE,
  day_id                         UUID NOT NULL REFERENCES public.trail_days(day_id),
  user_id                        UUID NOT NULL REFERENCES auth.users(id),
  completed_at                   TIMESTAMPTZ NOT NULL DEFAULT now(),
  readiness_score_at_completion  DOUBLE PRECISION,
  UNIQUE (enrollment_id, day_id)
);

-- ── session_trail_credits ───────────────────────────────────
CREATE TABLE public.session_trail_credits (
  session_id    UUID NOT NULL REFERENCES public.quiz_sessions(session_id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES public.user_trail_enrollments(enrollment_id) ON DELETE CASCADE,
  step_id       UUID NOT NULL REFERENCES public.trail_steps(step_id),
  credited_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id, enrollment_id, step_id)
);


-- ═══════════════════════════════════════════════════════════════
-- TABLES — Notes
-- ═══════════════════════════════════════════════════════════════

-- ── note_folders ────────────────────────────────────────────
CREATE TABLE public.note_folders (
  folder_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id),
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── notes ───────────────────────────────────────────────────
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
-- TABLES — Organizations
-- ═══════════════════════════════════════════════════════════════

-- ── organizations ───────────────────────────────────────────
CREATE TABLE public.organizations (
  org_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  type        user_type NOT NULL DEFAULT 'regular',
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
  role        TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'instructor', 'member')),
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, user_id)
);


-- ═══════════════════════════════════════════════════════════════
-- TABLES — Billing
-- ═══════════════════════════════════════════════════════════════

-- ── user_subscriptions ──────────────────────────────────────
CREATE TABLE public.user_subscriptions (
  subscription_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  tier                        subscription_tier NOT NULL DEFAULT 'free',
  status                      subscription_status NOT NULL DEFAULT 'active',
  email_notifications_enabled BOOLEAN DEFAULT true,
  marketing_emails_enabled    BOOLEAN DEFAULT false,
  stripe_customer_id          TEXT,
  stripe_subscription_id      TEXT,
  payrex_customer_id          TEXT,
  payrex_reference            TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  converted_from_source       TEXT,
  trial_started_at            TIMESTAMPTZ,
  readiness_score_at_conversion DOUBLE PRECISION
);


-- ═══════════════════════════════════════════════════════════════
-- TABLES — Analytics & Outcomes
-- ═══════════════════════════════════════════════════════════════

-- ── analytics_events ────────────────────────────────────────
CREATE TABLE public.analytics_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_name       TEXT NOT NULL,
  event_properties JSONB DEFAULT '{}'::jsonb,
  page_path        TEXT,
  session_id       UUID,
  created_at       TIMESTAMPTZ DEFAULT now(),
  referrer         TEXT
);

-- ── exam_outcomes ───────────────────────────────────────────
CREATE TABLE public.exam_outcomes (
  outcome_id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  discipline_id            UUID,
  exam_batch               TEXT NOT NULL,
  result                   TEXT NOT NULL CHECK (result IN ('passed', 'failed', 'did_not_take')),
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
-- TABLES — Blindspot
-- ═══════════════════════════════════════════════════════════════

-- ── blindspot_queues ────────────────────────────────────────
CREATE TABLE public.blindspot_queues (
  queue_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id        UUID,
  node_ids          UUID[] NOT NULL,
  question_count    INTEGER DEFAULT 12,
  generated_at      TIMESTAMPTZ DEFAULT now(),
  deferred_until    TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  status            TEXT DEFAULT 'pending'
                      CHECK (status IN ('pending', 'deferred', 'in_progress', 'completed', 'expired')),
  pre_queue_mastery  JSONB DEFAULT '{}'::jsonb,
  post_queue_mastery JSONB DEFAULT '{}'::jsonb,
  nodes_improved    INTEGER DEFAULT 0
);


-- ═══════════════════════════════════════════════════════════════
-- TABLES — Teach-Back
-- ═══════════════════════════════════════════════════════════════

-- ── teach_back_submissions ──────────────────────────────────
CREATE TABLE public.teach_back_submissions (
  submission_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id           UUID REFERENCES public.taxonomy_tree(node_id),
  entry_point        TEXT NOT NULL CHECK (entry_point IN ('wiki', 'blindspot', 'trail')),
  trail_day_id       UUID REFERENCES public.trail_days(day_id),
  prompt_text        TEXT NOT NULL,
  student_response   TEXT NOT NULL,
  evaluation_result  JSONB DEFAULT '{}'::jsonb,
  gaps_identified    TEXT[] DEFAULT '{}'::text[],
  revised_response   TEXT,
  submitted_at       TIMESTAMPTZ DEFAULT now(),
  revised_at         TIMESTAMPTZ,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

-- ── topic_teach_back_criteria ───────────────────────────────
-- TODO: Admin policy uses raw_app_meta_data instead of has_admin_role().
--       Future standardization task — do not change in this migration.
CREATE TABLE public.topic_teach_back_criteria (
  criteria_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id              UUID NOT NULL REFERENCES public.taxonomy_tree(node_id),
  required_concepts     TEXT[] NOT NULL DEFAULT '{}'::text[],
  required_exceptions   TEXT[] NOT NULL DEFAULT '{}'::text[],
  common_misconceptions TEXT[] NOT NULL DEFAULT '{}'::text[],
  code_citations        TEXT[] NOT NULL DEFAULT '{}'::text[],
  authored_by           UUID,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);


-- ═══════════════════════════════════════════════════════════════
-- TABLES — Feature Management
-- ═══════════════════════════════════════════════════════════════

-- ── feature_flags ───────────────────────────────────────────
CREATE TABLE public.feature_flags (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key          TEXT NOT NULL UNIQUE,
  description  TEXT,
  enabled      BOOLEAN NOT NULL DEFAULT false,
  target_tier  TEXT[] DEFAULT '{}'::text[],
  target_roles TEXT[] DEFAULT '{}'::text[],
  created_by   UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ═══════════════════════════════════════════════════════════════
-- INDEXES (non-PK, non-UNIQUE-constraint)
-- ═══════════════════════════════════════════════════════════════

-- analytics_events
CREATE INDEX idx_analytics_events_name_time ON public.analytics_events USING btree (event_name, created_at DESC);
CREATE INDEX idx_analytics_events_user ON public.analytics_events USING btree (user_id, created_at DESC);

-- blindspot_queues
CREATE INDEX idx_bq_user_generated ON public.blindspot_queues USING btree (user_id, generated_at DESC);
CREATE INDEX idx_bq_user_status ON public.blindspot_queues USING btree (user_id, status);

-- exam_outcomes
CREATE INDEX idx_eo_batch_result ON public.exam_outcomes USING btree (exam_batch, result);
CREATE INDEX idx_eo_score_result ON public.exam_outcomes USING btree (peak_readiness_score, result);
CREATE INDEX idx_eo_user ON public.exam_outcomes USING btree (user_id);

-- models_3d
CREATE INDEX idx_models_3d_status ON public.models_3d USING btree (status);

-- notes
CREATE INDEX idx_notes_topic ON public.notes USING btree (topic_id) WHERE (topic_id IS NOT NULL);
CREATE INDEX idx_notes_user_article ON public.notes USING btree (user_id, article_id) WHERE (article_id IS NOT NULL);
CREATE INDEX idx_notes_user_pinned ON public.notes USING btree (user_id, is_pinned DESC, updated_at DESC);
CREATE INDEX idx_notes_user_question ON public.notes USING btree (user_id, question_id) WHERE (question_id IS NOT NULL);
CREATE INDEX idx_notes_user_topic ON public.notes USING btree (user_id, topic_id) WHERE (topic_id IS NOT NULL);
CREATE INDEX idx_notes_user_updated ON public.notes USING btree (user_id, updated_at DESC);

-- questions
CREATE INDEX idx_questions_application_context ON public.questions USING btree (topic_id, application_context);
CREATE INDEX idx_questions_assessment ON public.questions USING btree (is_assessment) WHERE (is_assessment = true);
CREATE INDEX idx_questions_topic_difficulty ON public.questions USING btree (topic_id, difficulty);
CREATE INDEX idx_questions_topic_id ON public.questions USING btree (topic_id);

-- quiz_sessions
CREATE INDEX idx_quiz_sessions_user_id ON public.quiz_sessions USING btree (user_id);
CREATE INDEX idx_quiz_sessions_user_status ON public.quiz_sessions USING btree (user_id, status);

-- readiness_score_snapshots
CREATE INDEX idx_readiness_snapshots_user_id ON public.readiness_score_snapshots USING btree (user_id);
CREATE INDEX idx_readiness_snapshots_user_proof ON public.readiness_score_snapshots USING btree (user_id, computed_at DESC, is_proof_simulation);
CREATE INDEX idx_readiness_snapshots_user_time ON public.readiness_score_snapshots USING btree (user_id, computed_at DESC);

-- spatial_hotspots
CREATE INDEX idx_spatial_hotspots_model_id ON public.spatial_hotspots USING btree (model_id);
CREATE INDEX idx_spatial_hotspots_node_id ON public.spatial_hotspots USING btree (node_id);

-- teach_back_submissions
CREATE INDEX idx_teach_back_topic ON public.teach_back_submissions USING btree (topic_id);
CREATE INDEX idx_teach_back_user ON public.teach_back_submissions USING btree (user_id, created_at DESC);

-- topic_teach_back_criteria
CREATE INDEX idx_teach_back_criteria_topic ON public.topic_teach_back_criteria USING btree (topic_id);

-- trail_day_completions
CREATE INDEX idx_day_completions_enrollment ON public.trail_day_completions USING btree (enrollment_id);
CREATE INDEX idx_trail_day_completions_day_id ON public.trail_day_completions USING btree (day_id);
CREATE INDEX idx_trail_day_completions_user_id ON public.trail_day_completions USING btree (user_id);

-- user_computed_signals
CREATE INDEX idx_computed_signals_churn ON public.user_computed_signals USING btree (churn_risk_score DESC) WHERE (churn_risk_score > 0.6);

-- user_interactions
CREATE INDEX idx_user_interactions_question_id ON public.user_interactions USING btree (question_id);
CREATE INDEX idx_user_interactions_session_time ON public.user_interactions USING btree (session_id, interaction_timestamp);
CREATE INDEX idx_user_interactions_user_id ON public.user_interactions USING btree (user_id);

-- user_mastery_history
CREATE INDEX idx_mastery_history_topic_id ON public.user_mastery_history USING btree (topic_id);
CREATE INDEX idx_mastery_history_user_topic ON public.user_mastery_history USING btree (user_id, topic_id, created_at DESC);

-- user_node_mastery
CREATE INDEX idx_user_node_mastery_user ON public.user_node_mastery USING btree (user_id);

-- user_trail_enrollments
CREATE INDEX idx_trail_enrollments_trail ON public.user_trail_enrollments USING btree (trail_id, status);
CREATE INDEX idx_trail_enrollments_user ON public.user_trail_enrollments USING btree (user_id, status);

-- user_trail_progress
CREATE INDEX idx_trail_progress_enrollment ON public.user_trail_progress USING btree (enrollment_id);
CREATE INDEX idx_trail_progress_user ON public.user_trail_progress USING btree (user_id);

-- wiki_article_taxonomy
CREATE INDEX idx_wiki_article_taxonomy_node_id ON public.wiki_article_taxonomy USING btree (node_id);

-- wiki_articles
CREATE INDEX idx_wiki_articles_reviewed_by ON public.wiki_articles USING btree (reviewed_by) WHERE (reviewed_by IS NOT NULL);
CREATE INDEX idx_wiki_articles_status ON public.wiki_articles USING btree (status);


-- ═══════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

-- Flag lucky guesses on insert into user_interactions
CREATE OR REPLACE FUNCTION public.flag_lucky_guess_on_insert()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  v_mastery_weight DOUBLE PRECISION;
  v_avg_time_ms    INTEGER;
BEGIN
  IF NEW.is_correct = false THEN RETURN NEW; END IF;
  SELECT current_mastery_weight, avg_time_ms INTO v_mastery_weight, v_avg_time_ms
  FROM public.user_node_mastery WHERE user_id = NEW.user_id AND topic_id = NEW.topic_id;
  IF v_mastery_weight IS NOT NULL AND v_mastery_weight < 0.4
    AND NEW.time_spent_ms < COALESCE(v_avg_time_ms * 0.4, 5000) AND NEW.time_spent_ms > 0
  THEN NEW.is_suspected_lucky_guess := true; END IF;
  RETURN NEW;
END;
$$;

-- Log mastery history on user_node_mastery update
CREATE OR REPLACE FUNCTION public.log_mastery_history_on_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_mastery_history (user_id, topic_id, mastery_weight, total_correct, total_attempts, snapshot_reason)
  VALUES (NEW.user_id, NEW.topic_id, NEW.current_mastery_weight, NEW.total_correct, NEW.total_attempts, 'session_complete');
  RETURN NEW;
END;
$$;

-- Snapshot readiness score when quiz session completes
CREATE OR REPLACE FUNCTION public.snapshot_readiness_on_session_complete()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO public.readiness_score_snapshots (user_id, score, sub_scores, session_id, is_proof_simulation, computed_at)
    SELECT NEW.user_id, ugs.global_readiness_score, '{}'::jsonb, NEW.session_id, COALESCE(NEW.is_proof_simulation, false), NOW()
    FROM public.user_global_stats ugs
    WHERE ugs.user_id = NEW.user_id AND ugs.global_readiness_score IS NOT NULL AND ugs.global_readiness_score > 0;
  END IF;
  RETURN NEW;
END;
$$;

-- Update enrollment when a day is completed
CREATE OR REPLACE FUNCTION public.update_enrollment_on_day_completion()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  UPDATE public.user_trail_enrollments
  SET days_completed = days_completed + 1,
      current_day = GREATEST(current_day, (SELECT day_number + 1 FROM public.trail_days WHERE day_id = NEW.day_id)),
      last_activity_at = now()
  WHERE enrollment_id = NEW.enrollment_id;
  RETURN NEW;
END;
$$;

-- Update enrollment last_activity_at on progress insert
CREATE OR REPLACE FUNCTION public.update_enrollment_on_progress()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  UPDATE public.user_trail_enrollments SET last_activity_at = now() WHERE enrollment_id = NEW.enrollment_id;
  RETURN NEW;
END;
$$;

-- Enrollment updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_enrollment_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;


-- ═══════════════════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════════════════

-- updated_at triggers (BEFORE UPDATE → update_updated_at_column)
CREATE TRIGGER tr_camp_trails_updated_at BEFORE UPDATE ON public.camp_trails FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_disciplines_updated_at BEFORE UPDATE ON public.disciplines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_feature_flags_updated_at BEFORE UPDATE ON public.feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_models_3d_updated_at BEFORE UPDATE ON public.models_3d FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_note_folders_updated_at BEFORE UPDATE ON public.note_folders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_questions_updated_at BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_quiz_sessions_updated_at BEFORE UPDATE ON public.quiz_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_spatial_hotspots_updated_at BEFORE UPDATE ON public.spatial_hotspots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_taxonomy_tree_updated_at BEFORE UPDATE ON public.taxonomy_tree FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_teach_back_submissions_updated_at BEFORE UPDATE ON public.teach_back_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_topic_teach_back_criteria_updated_at BEFORE UPDATE ON public.topic_teach_back_criteria FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_computed_signals_updated_at BEFORE UPDATE ON public.user_computed_signals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_user_global_stats_updated_at BEFORE UPDATE ON public.user_global_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_user_interactions_updated_at BEFORE UPDATE ON public.user_interactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER user_node_mastery_updated_at BEFORE UPDATE ON public.user_node_mastery FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_wiki_articles_updated_at BEFORE UPDATE ON public.wiki_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enrollment updated_at
CREATE TRIGGER trg_enrollment_updated_at BEFORE UPDATE ON public.user_trail_enrollments FOR EACH ROW EXECUTE FUNCTION update_enrollment_updated_at();

-- Business logic triggers
CREATE TRIGGER trg_flag_lucky_guess BEFORE INSERT ON public.user_interactions FOR EACH ROW EXECUTE FUNCTION flag_lucky_guess_on_insert();
CREATE TRIGGER trg_log_mastery_history AFTER UPDATE ON public.user_node_mastery FOR EACH ROW EXECUTE FUNCTION log_mastery_history_on_update();
CREATE TRIGGER trg_snapshot_readiness AFTER UPDATE ON public.quiz_sessions FOR EACH ROW EXECUTE FUNCTION snapshot_readiness_on_session_complete();
CREATE TRIGGER trg_day_completion_update_enrollment AFTER INSERT ON public.trail_day_completions FOR EACH ROW EXECUTE FUNCTION update_enrollment_on_day_completion();
CREATE TRIGGER trg_progress_update_enrollment AFTER INSERT ON public.user_trail_progress FOR EACH ROW EXECUTE FUNCTION update_enrollment_on_progress();


-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════
-- All tables have RLS enabled.
-- Policies using (select auth.uid()) use the cached form — Postgres stores
-- these as ( SELECT auth.uid() AS uid) — which avoids re-evaluating the
-- function once per row and is the preferred pattern for all user-scoped rules.

-- ── analytics_events ────────────────────────────────────────
-- INSERT: Users can insert own events (user_id IS NULL OR (select auth.uid()) = user_id)
-- SELECT: Users can view own events ((select auth.uid()) = user_id)

-- ── blindspot_queues ────────────────────────────────────────
-- INSERT: bq_insert_own ((select auth.uid()) = user_id) [authenticated]
-- SELECT: bq_select_own ((select auth.uid()) = user_id) [authenticated]
-- UPDATE: bq_update_own ((select auth.uid()) = user_id) [authenticated]

-- ── camp_trails ─────────────────────────────────────────────
-- SELECT: camp_trails_select_authenticated (true) [authenticated]

-- ── disciplines ─────────────────────────────────────────────
-- SELECT: Anyone can read disciplines (true) [public]

-- ── exam_outcomes ───────────────────────────────────────────
-- INSERT: eo_insert_own ((select auth.uid()) = user_id) [authenticated]
-- SELECT: eo_select_own ((select auth.uid()) = user_id) [authenticated]

-- ── feature_flags ───────────────────────────────────────────
-- ALL:    Admins can manage (raw_app_meta_data->>'role' = 'admin') [authenticated]
-- SELECT: Authenticated users can read (true) [authenticated]

-- ── models_3d ───────────────────────────────────────────────
-- SELECT: Anyone can read models_3d (true) [public]

-- ── note_folders ────────────────────────────────────────────
-- ALL: Users can manage own folders ((select auth.uid()) = user_id) [public]

-- ── notes ───────────────────────────────────────────────────
-- ALL: Users can manage own notes ((select auth.uid()) = user_id) [public]

-- ── organization_members ────────────────────────────────────
-- SELECT: Members can read own org members (EXISTS subquery with (select auth.uid())) [authenticated]
-- ALL:    Org admins can manage members (role IN ('owner','admin')) [authenticated]

-- ── organizations ───────────────────────────────────────────
-- SELECT: Members can read own organization (EXISTS subquery with (select auth.uid())) [authenticated]
-- UPDATE: Org admins can update organization (role IN ('owner','admin')) [authenticated]

-- ── profiles ────────────────────────────────────────────────
-- INSERT: Users can insert own profile ((select auth.uid()) = id) [public]
-- UPDATE: Users can update own profile ((select auth.uid()) = id) [public]
-- SELECT: Users can view own profile ((select auth.uid()) = id) [public]

-- ── questions ───────────────────────────────────────────────
-- SELECT: Anyone can read questions (true) [public]

-- ── quiz_sessions ───────────────────────────────────────────
-- INSERT: Users can insert own ((select auth.uid()) = user_id) [public]
-- SELECT: Users can read own ((select auth.uid()) = user_id) [public]
-- UPDATE: Users can update own ((select auth.uid()) = user_id) [public]
-- DELETE: Users can delete own ((select auth.uid()) = user_id) [public]

-- ── readiness_score_snapshots ───────────────────────────────
-- INSERT: Users can insert own ((select auth.uid()) = user_id) [public]
-- SELECT: Users can read own ((select auth.uid()) = user_id) [public]

-- ── session_trail_credits ───────────────────────────────────
-- INSERT: credits_insert_own (enrollment owned by (select auth.uid())) [authenticated]
-- SELECT: credits_select_own (enrollment owned by (select auth.uid())) [authenticated]

-- ── spatial_hotspots ────────────────────────────────────────
-- SELECT: Anyone can read spatial_hotspots (true) [public]

-- ── taxonomy_tree ───────────────────────────────────────────
-- SELECT: Anyone can read taxonomy_tree (true) [public]

-- ── teach_back_submissions ──────────────────────────────────
-- INSERT: tbs_insert_own ((select auth.uid()) = user_id) [authenticated]
-- SELECT: tbs_select_own ((select auth.uid()) = user_id) [authenticated]
-- UPDATE: tbs_update_own ((select auth.uid()) = user_id) [authenticated]

-- ── topic_teach_back_criteria ───────────────────────────────
-- ALL:    ttbc_admin_manage (raw_app_meta_data->>'role' = 'admin') [authenticated]
-- SELECT: ttbc_select_all (true) [authenticated]
-- TODO: Uses raw_app_meta_data check instead of has_admin_role(). Standardize later.

-- ── trail_day_completions ───────────────────────────────────
-- INSERT: day_completions_insert_own ((select auth.uid()) = user_id) [authenticated]
-- SELECT: day_completions_select_own ((select auth.uid()) = user_id) [authenticated]

-- ── trail_days ──────────────────────────────────────────────
-- SELECT: trail_days_select_authenticated (true) [authenticated]

-- ── trail_steps ─────────────────────────────────────────────
-- SELECT: trail_steps_select_authenticated (true) [authenticated]

-- ── user_computed_signals ───────────────────────────────────
-- SELECT: cs_select_own ((select auth.uid()) = user_id) [authenticated]

-- ── user_global_stats ───────────────────────────────────────
-- INSERT: Users can insert own stats ((select auth.uid()) = user_id) [public]
-- SELECT: Users can read own stats ((select auth.uid()) = user_id) [public]
-- UPDATE: Users can update own stats ((select auth.uid()) = user_id) [public]

-- ── user_interactions ───────────────────────────────────────
-- INSERT: Users can insert own ((select auth.uid()) = user_id) [public]
-- SELECT: Users can read own ((select auth.uid()) = user_id) [public]
-- UPDATE: Users can update own ((select auth.uid()) = user_id) [public]

-- ── user_mastery_history ────────────────────────────────────
-- INSERT: mh_insert_own ((select auth.uid()) = user_id) [public]
-- SELECT: mh_select_own ((select auth.uid()) = user_id) [public]

-- ── user_node_mastery ───────────────────────────────────────
-- INSERT: Users can insert own ((select auth.uid()) = user_id) [public]
-- SELECT: Users can read own ((select auth.uid()) = user_id) [public]
-- UPDATE: Users can update own ((select auth.uid()) = user_id) [public]

-- ── user_subscriptions ──────────────────────────────────────
-- SELECT: Users can read own ((select auth.uid()) = user_id) [authenticated]
-- SELECT: Admins can read all (raw_app_meta_data->>'role' = 'admin') [authenticated]
-- UPDATE: Users can update own ((select auth.uid()) = user_id) [authenticated]

-- ── user_trail_enrollments ──────────────────────────────────
-- INSERT: enrollments_insert_own ((select auth.uid()) = user_id) [public]
-- SELECT: enrollments_select_own ((select auth.uid()) = user_id) [public]
-- UPDATE: enrollments_update_own ((select auth.uid()) = user_id) [public]

-- ── user_trail_progress ─────────────────────────────────────
-- INSERT: progress_insert_own ((select auth.uid()) = user_id) [public]
-- SELECT: progress_select_own ((select auth.uid()) = user_id) [public]

-- ── wiki_article_taxonomy ───────────────────────────────────
-- SELECT: Anyone can read (true) [public]

-- ── wiki_articles ───────────────────────────────────────────
-- SELECT: Anyone can read (true) [public]


-- ═══════════════════════════════════════════════════════════════
-- COLUMN COMMENTS (deprecated markers)
-- ═══════════════════════════════════════════════════════════════

COMMENT ON COLUMN public.user_global_stats.churn_risk_score IS 'DEPRECATED — use user_computed_signals.churn_risk_score instead';
COMMENT ON COLUMN public.user_global_stats.score_velocity_7d IS 'DEPRECATED — use user_computed_signals.score_velocity_7d instead';


-- ═══════════════════════════════════════════════════════════════
-- TABLE STATISTICS (estimated row counts)
-- ═══════════════════════════════════════════════════════════════
--
-- taxonomy_tree ................. 148
-- wiki_article_taxonomy ......... 102
-- wiki_articles ................. 102
-- user_interactions .............. 75
-- trail_days ..................... 56
-- questions ...................... 34
-- user_node_mastery .............. 29
-- quiz_sessions .................. 28
-- trail_steps .................... 21
-- notes ........................... 7
-- readiness_score_snapshots ....... 5
-- user_subscriptions .............. 1
-- camp_trails ..................... 1
-- user_global_stats ............... 1
-- disciplines ..................... 1
-- (remaining tables: 0 rows)


-- ═══════════════════════════════════════════════════════════════
-- RELATIONSHIPS DIAGRAM (simplified)
-- ═══════════════════════════════════════════════════════════════
--
-- auth.users
--   ├── profiles (id → auth.users.id)
--   ├── user_global_stats (user_id)
--   ├── user_subscriptions (user_id)
--   ├── user_computed_signals (user_id)
--   ├── quiz_sessions (user_id)
--   │     ├── user_interactions (session_id)
--   │     ├── readiness_score_snapshots (session_id)
--   │     └── session_trail_credits (session_id)
--   ├── user_node_mastery (user_id, topic_id)
--   │     └── user_mastery_history (user_id, topic_id)
--   ├── user_trail_enrollments (user_id, trail_id)
--   │     ├── user_trail_progress (enrollment_id)
--   │     ├── trail_day_completions (enrollment_id)
--   │     └── session_trail_credits (enrollment_id)
--   ├── notes (user_id)
--   ├── note_folders (user_id)
--   ├── blindspot_queues (user_id)
--   ├── teach_back_submissions (user_id)
--   ├── analytics_events (user_id)
--   ├── exam_outcomes (user_id)
--   └── organization_members (user_id)
--
-- disciplines
--   ├── taxonomy_tree (discipline_id)
--   │     ├── questions (topic_id)
--   │     ├── spatial_hotspots (node_id)
--   │     ├── wiki_article_taxonomy (node_id)
--   │     └── topic_teach_back_criteria (topic_id)
--   ├── camp_trails (discipline_id)
--   │     ├── trail_days (trail_id)
--   │     │     └── trail_steps (day_id)
--   │     └── user_trail_enrollments (trail_id)
--   ├── quiz_sessions (discipline_id)
--   └── profiles (discipline_id)
--
-- wiki_articles
--   ├── wiki_article_taxonomy (article_id)
--   ├── trail_steps (article_id)
--   └── notes (article_id)
--
-- models_3d
--   ├── spatial_hotspots (model_id)
--   └── trail_steps (model_id)
--
-- organizations
--   └── organization_members (org_id)
