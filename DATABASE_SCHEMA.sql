-- =============================================================================
-- DATABASE SCHEMA MASTERFILE
-- =============================================================================
-- Generated: 2026-03-15
-- Description: Complete public schema definition including all tables,
--              constraints, indexes, triggers, and enum types.
-- =============================================================================


-- =============================================================================
-- SECTION 0: EXTENSIONS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- provides gen_random_uuid()


-- =============================================================================
-- SECTION 1: ENUM TYPES
-- =============================================================================

CREATE TYPE public.test_mode AS ENUM (
  'camp',
  'timed',
  'practice'
);

CREATE TYPE public.session_status AS ENUM (
  'in_progress',
  'completed',
  'abandoned'
);

CREATE TYPE public.subscription_tier AS ENUM (
  'free',
  'pro',
  'enterprise'
);

CREATE TYPE public.subscription_status AS ENUM (
  'active',
  'cancelled',
  'expired',
  'trialing'
);


-- =============================================================================
-- SECTION 2: UTILITY FUNCTIONS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- SECTION 3: CORE / REFERENCE TABLES
-- (No foreign key dependencies on other app tables)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 3.1 disciplines
-- -----------------------------------------------------------------------------
CREATE TABLE public.disciplines (
  discipline_id  UUID                     NOT NULL DEFAULT gen_random_uuid(),
  name           TEXT                     NOT NULL,
  acronym        TEXT                     NOT NULL,
  created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT disciplines_pkey     PRIMARY KEY (discipline_id),
  CONSTRAINT disciplines_name_key UNIQUE      (name)
) TABLESPACE pg_default;


-- -----------------------------------------------------------------------------
-- 3.2 models_3d
-- -----------------------------------------------------------------------------
CREATE TABLE public.models_3d (
  model_id    UUID                     NOT NULL DEFAULT gen_random_uuid(),
  name        TEXT                     NOT NULL,
  slug        TEXT                     NOT NULL,
  url         TEXT                     NOT NULL,
  thumbnail   TEXT                         NULL,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT models_3d_pkey     PRIMARY KEY (model_id),
  CONSTRAINT models_3d_slug_key UNIQUE      (slug)
) TABLESPACE pg_default;

CREATE TRIGGER tr_models_3d_updated_at
  BEFORE UPDATE ON public.models_3d
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- =============================================================================
-- SECTION 4: TAXONOMY
-- (Depends on: disciplines)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 4.1 taxonomy_tree
-- -----------------------------------------------------------------------------
CREATE TABLE public.taxonomy_tree (
  node_id       UUID                     NOT NULL DEFAULT gen_random_uuid(),
  discipline_id UUID                     NOT NULL,
  parent_id     UUID                         NULL,
  level         SMALLINT                 NOT NULL,
  name          TEXT                     NOT NULL,
  subject_area  TEXT                     NOT NULL,
  slug          TEXT                         NULL,
  is_leaf       BOOLEAN                  NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT taxonomy_tree_pkey         PRIMARY KEY (node_id),
  CONSTRAINT taxonomy_tree_slug_key     UNIQUE      (slug),
  CONSTRAINT taxonomy_tree_level_check  CHECK       (level >= 1 AND level <= 6),

  CONSTRAINT taxonomy_tree_discipline_id_fkey
    FOREIGN KEY (discipline_id) REFERENCES public.disciplines (discipline_id)
    ON DELETE CASCADE,

  CONSTRAINT taxonomy_tree_parent_id_fkey
    FOREIGN KEY (parent_id) REFERENCES public.taxonomy_tree (node_id)
    ON DELETE SET NULL
) TABLESPACE pg_default;


-- =============================================================================
-- SECTION 5: CONTENT TABLES
-- (Depends on: taxonomy_tree, models_3d)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 5.1 questions
-- -----------------------------------------------------------------------------
CREATE TABLE public.questions (
  question_id           UUID                     NOT NULL DEFAULT gen_random_uuid(),
  topic_id              UUID                     NOT NULL,
  text                  TEXT                     NOT NULL,
  options               JSONB                    NOT NULL DEFAULT '[]'::JSONB,
  rationale             TEXT                         NULL,
  difficulty            NUMERIC(3,2)                 NULL DEFAULT 0.50,
  difficulty_rating     NUMERIC                      NULL,
  discrimination_rating NUMERIC                      NULL,
  created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT questions_pkey PRIMARY KEY (question_id),

  CONSTRAINT questions_topic_id_fkey
    FOREIGN KEY (topic_id) REFERENCES public.taxonomy_tree (node_id)
    ON DELETE RESTRICT
) TABLESPACE pg_default;


-- -----------------------------------------------------------------------------
-- 5.2 wiki_articles
-- -----------------------------------------------------------------------------
CREATE TABLE public.wiki_articles (
  article_id  UUID                     NOT NULL DEFAULT gen_random_uuid(),
  title       TEXT                     NOT NULL,
  slug        TEXT                     NOT NULL,
  content     TEXT                     NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT wiki_articles_pkey     PRIMARY KEY (article_id),
  CONSTRAINT wiki_articles_slug_key UNIQUE      (slug)
) TABLESPACE pg_default;


-- -----------------------------------------------------------------------------
-- 5.3 wiki_article_taxonomy  (junction: wiki_articles ↔ taxonomy_tree)
-- -----------------------------------------------------------------------------
CREATE TABLE public.wiki_article_taxonomy (
  article_id  UUID    NOT NULL,
  node_id     UUID    NOT NULL,
  is_primary  BOOLEAN     NULL DEFAULT FALSE,

  CONSTRAINT wiki_article_taxonomy_pkey PRIMARY KEY (article_id, node_id),

  CONSTRAINT wiki_article_taxonomy_article_id_fkey
    FOREIGN KEY (article_id) REFERENCES public.wiki_articles (article_id)
    ON DELETE CASCADE,

  CONSTRAINT wiki_article_taxonomy_node_id_fkey
    FOREIGN KEY (node_id) REFERENCES public.taxonomy_tree (node_id)
    ON DELETE CASCADE
) TABLESPACE pg_default;


-- -----------------------------------------------------------------------------
-- 5.4 spatial_hotspots
-- -----------------------------------------------------------------------------
CREATE TABLE public.spatial_hotspots (
  hotspot_id  UUID                     NOT NULL DEFAULT gen_random_uuid(),
  model_id    UUID                     NOT NULL,
  node_id     UUID                         NULL,
  title       TEXT                     NOT NULL,
  description TEXT                         NULL,
  position_x  DOUBLE PRECISION         NOT NULL,
  position_y  DOUBLE PRECISION         NOT NULL,
  position_z  DOUBLE PRECISION         NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT spatial_hotspots_pkey PRIMARY KEY (hotspot_id),

  CONSTRAINT spatial_hotspots_model_id_fkey
    FOREIGN KEY (model_id) REFERENCES public.models_3d (model_id)
    ON DELETE CASCADE,

  CONSTRAINT spatial_hotspots_node_id_fkey
    FOREIGN KEY (node_id) REFERENCES public.taxonomy_tree (node_id)
    ON DELETE SET NULL
) TABLESPACE pg_default;

CREATE TRIGGER tr_spatial_hotspots_updated_at
  BEFORE UPDATE ON public.spatial_hotspots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- =============================================================================
-- SECTION 6: USER TABLES
-- (Depends on: auth.users, disciplines, taxonomy_tree)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 6.1 user_subscriptions
-- -----------------------------------------------------------------------------
CREATE TABLE public.user_subscriptions (
  subscription_id              UUID                     NOT NULL DEFAULT gen_random_uuid(),
  user_id                      UUID                     NOT NULL,
  tier                         public.subscription_tier NOT NULL DEFAULT 'free'::public.subscription_tier,
  status                       public.subscription_status NOT NULL DEFAULT 'active'::public.subscription_status,
  email_notifications_enabled  BOOLEAN                      NULL DEFAULT TRUE,
  marketing_emails_enabled     BOOLEAN                      NULL DEFAULT FALSE,
  stripe_customer_id           TEXT                         NULL,
  stripe_subscription_id       TEXT                         NULL,
  payrex_customer_id           TEXT                         NULL,
  payrex_reference             TEXT                         NULL,
  created_at                   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at                   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT user_subscriptions_pkey   PRIMARY KEY (subscription_id),
  CONSTRAINT uq_user_subscription      UNIQUE      (user_id),

  CONSTRAINT user_subscriptions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users (id)
    ON DELETE CASCADE
) TABLESPACE pg_default;


-- -----------------------------------------------------------------------------
-- 6.2 user_global_stats
-- -----------------------------------------------------------------------------
CREATE TABLE public.user_global_stats (
  user_id                    UUID                     NOT NULL,
  current_discipline_id      UUID                         NULL,
  global_readiness_score     DOUBLE PRECISION         NOT NULL DEFAULT 0.0,
  target_exam_date           TIMESTAMP WITH TIME ZONE     NULL,
  final_stretch_upsell_shown BOOLEAN                      NULL DEFAULT FALSE,
  updated_at                 TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT user_global_stats_pkey PRIMARY KEY (user_id),

  CONSTRAINT user_global_stats_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users (id)
    ON DELETE CASCADE,

  CONSTRAINT user_global_stats_current_discipline_id_fkey
    FOREIGN KEY (current_discipline_id) REFERENCES public.disciplines (discipline_id)
    ON DELETE SET NULL
) TABLESPACE pg_default;


-- -----------------------------------------------------------------------------
-- 6.3 user_node_mastery
-- -----------------------------------------------------------------------------
CREATE TABLE public.user_node_mastery (
  user_id               UUID                     NOT NULL,
  topic_id              UUID                     NOT NULL,
  total_attempts        INTEGER                  NOT NULL DEFAULT 0,
  total_correct         INTEGER                  NOT NULL DEFAULT 0,
  current_mastery_weight DOUBLE PRECISION        NOT NULL DEFAULT 0.0,
  avg_time_ms           INTEGER                  NOT NULL DEFAULT 0,
  last_encountered      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT user_node_mastery_pkey PRIMARY KEY (user_id, topic_id),

  CONSTRAINT user_node_mastery_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users (id)
    ON DELETE CASCADE,

  CONSTRAINT user_node_mastery_topic_id_fkey
    FOREIGN KEY (topic_id) REFERENCES public.taxonomy_tree (node_id)
    ON DELETE CASCADE
) TABLESPACE pg_default;


-- -----------------------------------------------------------------------------
-- 6.4 readiness_score_snapshots
-- -----------------------------------------------------------------------------
CREATE TABLE public.readiness_score_snapshots (
  snapshot_id  UUID                     NOT NULL DEFAULT gen_random_uuid(),
  user_id      UUID                     NOT NULL,
  score        DOUBLE PRECISION         NOT NULL,
  sub_scores   JSONB                    NOT NULL DEFAULT '{}'::JSONB,
  computed_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT readiness_score_snapshots_pkey PRIMARY KEY (snapshot_id),

  CONSTRAINT readiness_score_snapshots_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users (id)
    ON DELETE CASCADE
) TABLESPACE pg_default;


-- =============================================================================
-- SECTION 7: NOTE TABLES
-- (Depends on: auth.users, taxonomy_tree)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 7.1 note_folders
-- -----------------------------------------------------------------------------
CREATE TABLE public.note_folders (
  folder_id   UUID                     NOT NULL DEFAULT gen_random_uuid(),
  user_id     UUID                     NOT NULL,
  name        TEXT                     NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT note_folders_pkey PRIMARY KEY (folder_id),

  CONSTRAINT note_folders_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users (id)
    ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE TRIGGER tr_note_folders_updated_at
  BEFORE UPDATE ON public.note_folders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- -----------------------------------------------------------------------------
-- 7.2 notes
-- -----------------------------------------------------------------------------
CREATE TABLE public.notes (
  note_id     UUID                     NOT NULL DEFAULT gen_random_uuid(),
  user_id     UUID                     NOT NULL,
  folder_id   UUID                         NULL,
  topic_id    UUID                         NULL,
  title       TEXT                     NOT NULL DEFAULT 'Untitled Note'::TEXT,
  content     JSONB                    NOT NULL DEFAULT '[]'::JSONB,
  source_url  TEXT                         NULL,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT notes_pkey PRIMARY KEY (note_id),

  CONSTRAINT notes_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users (id)
    ON DELETE CASCADE,

  CONSTRAINT notes_folder_id_fkey
    FOREIGN KEY (folder_id) REFERENCES public.note_folders (folder_id)
    ON DELETE SET NULL,

  CONSTRAINT notes_topic_id_fkey
    FOREIGN KEY (topic_id) REFERENCES public.taxonomy_tree (node_id)
    ON DELETE SET NULL
) TABLESPACE pg_default;

CREATE TRIGGER tr_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- =============================================================================
-- SECTION 8: QUIZ / SESSION TABLES
-- (Depends on: auth.users, disciplines)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 8.1 quiz_sessions
-- -----------------------------------------------------------------------------
CREATE TABLE public.quiz_sessions (
  session_id              UUID                     NOT NULL DEFAULT gen_random_uuid(),
  user_id                 UUID                     NOT NULL,
  discipline_id           UUID                         NULL,
  test_mode               public.test_mode         NOT NULL DEFAULT 'camp'::public.test_mode,
  status                  public.session_status    NOT NULL DEFAULT 'in_progress'::public.session_status,
  config                  JSONB                    NOT NULL DEFAULT '{}'::JSONB,
  question_ids            UUID[]                   NOT NULL DEFAULT '{}'::UUID[],
  subject_ids             UUID[]                   NOT NULL DEFAULT '{}'::UUID[],
  current_question_index  INTEGER                  NOT NULL DEFAULT 0,
  started_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT quiz_sessions_pkey PRIMARY KEY (session_id),

  CONSTRAINT quiz_sessions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users (id)
    ON DELETE CASCADE,

  CONSTRAINT quiz_sessions_discipline_id_fkey
    FOREIGN KEY (discipline_id) REFERENCES public.disciplines (discipline_id)
    ON DELETE SET NULL
) TABLESPACE pg_default;


-- =============================================================================
-- SECTION 9: INTERACTION / ACTIVITY TABLES
-- (Depends on: auth.users, quiz_sessions, questions, taxonomy_tree)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 9.1 user_interactions
-- -----------------------------------------------------------------------------
CREATE TABLE public.user_interactions (
  interaction_id        UUID                     NOT NULL DEFAULT gen_random_uuid(),
  user_id               UUID                     NOT NULL,
  session_id            UUID                     NOT NULL,
  question_id           UUID                     NOT NULL,
  topic_id              UUID                         NULL,
  selected_option_id    TEXT                         NULL,
  is_correct            BOOLEAN                  NOT NULL,
  time_spent_ms         INTEGER                      NULL DEFAULT 0,
  interaction_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT user_interactions_pkey        PRIMARY KEY (interaction_id),
  CONSTRAINT uq_user_session_question      UNIQUE      (user_id, session_id, question_id),

  CONSTRAINT user_interactions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users (id)
    ON DELETE CASCADE,

  CONSTRAINT user_interactions_session_id_fkey
    FOREIGN KEY (session_id) REFERENCES public.quiz_sessions (session_id)
    ON DELETE CASCADE,

  CONSTRAINT user_interactions_question_id_fkey
    FOREIGN KEY (question_id) REFERENCES public.questions (question_id)
    ON DELETE RESTRICT,

  CONSTRAINT user_interactions_topic_id_fkey
    FOREIGN KEY (topic_id) REFERENCES public.taxonomy_tree (node_id)
    ON DELETE SET NULL
) TABLESPACE pg_default;


-- =============================================================================
-- END OF SCHEMA
-- =============================================================================