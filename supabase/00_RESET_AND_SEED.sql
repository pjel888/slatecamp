-- ============================================================
-- 00_RESET_AND_SEED.sql
-- Drops all tables, recreates schema, and seeds baseline data
-- Run this in Supabase SQL Editor
-- ============================================================


-- ------------------------------------------------------------
-- SECTION 1: DROP ALL TABLES (in dependency order)
-- ------------------------------------------------------------

DROP TABLE IF EXISTS public.user_interactions         CASCADE;
DROP TABLE IF EXISTS public.quiz_sessions             CASCADE;
DROP TABLE IF EXISTS public.user_node_mastery         CASCADE;
DROP TABLE IF EXISTS public.readiness_score_snapshots CASCADE;
DROP TABLE IF EXISTS public.user_global_stats         CASCADE;
DROP TABLE IF EXISTS public.user_subscriptions        CASCADE;
DROP TABLE IF EXISTS public.notes                     CASCADE;
DROP TABLE IF EXISTS public.note_folders              CASCADE;
DROP TABLE IF EXISTS public.wiki_article_taxonomy     CASCADE;
DROP TABLE IF EXISTS public.wiki_articles             CASCADE;
DROP TABLE IF EXISTS public.spatial_hotspots          CASCADE;
DROP TABLE IF EXISTS public.questions                 CASCADE;
DROP TABLE IF EXISTS public.taxonomy_tree             CASCADE;
DROP TABLE IF EXISTS public.models_3d                 CASCADE;
DROP TABLE IF EXISTS public.disciplines               CASCADE;

-- Drop types if they exist
DROP TYPE IF EXISTS public.session_status    CASCADE;
DROP TYPE IF EXISTS public.subscription_status CASCADE;
DROP TYPE IF EXISTS public.subscription_tier CASCADE;
DROP TYPE IF EXISTS public.test_mode         CASCADE;

-- Drop function if it exists
DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;


-- ------------------------------------------------------------
-- SECTION 2: EXTENSIONS
-- ------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";


-- ------------------------------------------------------------
-- SECTION 3: TYPES
-- ------------------------------------------------------------

CREATE TYPE public.session_status AS ENUM (
    'in_progress',
    'completed',
    'abandoned'
);

CREATE TYPE public.subscription_status AS ENUM (
    'active',
    'cancelled',
    'expired',
    'trialing'
);

CREATE TYPE public.subscription_tier AS ENUM (
    'free',
    'pro',
    'enterprise'
);

CREATE TYPE public.test_mode AS ENUM (
    'camp',
    'timed',
    'practice'
);


-- ------------------------------------------------------------
-- SECTION 4: FUNCTION
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- ------------------------------------------------------------
-- SECTION 5: CREATE TABLES
-- ------------------------------------------------------------

CREATE TABLE public.disciplines (
    discipline_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name          text                            NOT NULL,
    acronym       text                            NOT NULL,
    created_at    timestamptz DEFAULT now()       NOT NULL,
    updated_at    timestamptz DEFAULT now()       NOT NULL,
    CONSTRAINT disciplines_pkey     PRIMARY KEY (discipline_id),
    CONSTRAINT disciplines_name_key UNIQUE      (name)
);

CREATE TABLE public.models_3d (
    model_id   uuid DEFAULT gen_random_uuid() NOT NULL,
    name       text                           NOT NULL,
    slug       text                           NOT NULL,
    url        text                           NOT NULL,
    thumbnail  text,
    created_at timestamptz DEFAULT now()      NOT NULL,
    updated_at timestamptz DEFAULT now()      NOT NULL,
    CONSTRAINT models_3d_pkey     PRIMARY KEY (model_id),
    CONSTRAINT models_3d_slug_key UNIQUE      (slug)
);

CREATE TABLE public.taxonomy_tree (
    node_id       uuid DEFAULT gen_random_uuid() NOT NULL,
    discipline_id uuid                           NOT NULL,
    parent_id     uuid,
    level         smallint                       NOT NULL,
    name          text                           NOT NULL,
    subject_area  text                           NOT NULL,
    slug          text,
    is_leaf       boolean DEFAULT false          NOT NULL,
    created_at    timestamptz DEFAULT now()      NOT NULL,
    updated_at    timestamptz DEFAULT now()      NOT NULL,
    CONSTRAINT taxonomy_tree_pkey      PRIMARY KEY (node_id),
    CONSTRAINT taxonomy_tree_slug_key  UNIQUE      (slug),
    CONSTRAINT taxonomy_tree_level_check CHECK (level >= 1 AND level <= 6),
    CONSTRAINT taxonomy_tree_discipline_id_fkey FOREIGN KEY (discipline_id) REFERENCES public.disciplines(discipline_id),
    CONSTRAINT taxonomy_tree_parent_id_fkey     FOREIGN KEY (parent_id)     REFERENCES public.taxonomy_tree(node_id)
);

CREATE TABLE public.questions (
    question_id          uuid DEFAULT gen_random_uuid() NOT NULL,
    topic_id             uuid                           NOT NULL,
    text                 text                           NOT NULL,
    options              jsonb DEFAULT '[]'::jsonb      NOT NULL,
    rationale            text,
    difficulty           numeric DEFAULT 0.50,
    difficulty_rating    numeric,
    discrimination_rating numeric,
    created_at           timestamptz DEFAULT now()      NOT NULL,
    CONSTRAINT questions_pkey     PRIMARY KEY (question_id),
    CONSTRAINT questions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.taxonomy_tree(node_id)
);

CREATE TABLE public.wiki_articles (
    article_id uuid DEFAULT gen_random_uuid() NOT NULL,
    title      text                           NOT NULL,
    slug       text                           NOT NULL,
    content    text                           NOT NULL,
    created_at timestamptz DEFAULT now()      NOT NULL,
    updated_at timestamptz DEFAULT now()      NOT NULL,
    CONSTRAINT wiki_articles_pkey     PRIMARY KEY (article_id),
    CONSTRAINT wiki_articles_slug_key UNIQUE      (slug)
);

CREATE TABLE public.wiki_article_taxonomy (
    article_id uuid                      NOT NULL,
    node_id    uuid                      NOT NULL,
    is_primary boolean DEFAULT false,
    CONSTRAINT wiki_article_taxonomy_pkey       PRIMARY KEY (article_id, node_id),
    CONSTRAINT wiki_article_taxonomy_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.wiki_articles(article_id),
    CONSTRAINT wiki_article_taxonomy_node_id_fkey    FOREIGN KEY (node_id)    REFERENCES public.taxonomy_tree(node_id)
);

CREATE TABLE public.spatial_hotspots (
    hotspot_id  uuid DEFAULT gen_random_uuid() NOT NULL,
    model_id    uuid                           NOT NULL,
    node_id     uuid,
    title       text                           NOT NULL,
    description text,
    position_x  double precision               NOT NULL,
    position_y  double precision               NOT NULL,
    position_z  double precision               NOT NULL,
    created_at  timestamptz DEFAULT now()      NOT NULL,
    updated_at  timestamptz DEFAULT now()      NOT NULL,
    CONSTRAINT spatial_hotspots_pkey         PRIMARY KEY (hotspot_id),
    CONSTRAINT spatial_hotspots_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.models_3d(model_id),
    CONSTRAINT spatial_hotspots_node_id_fkey  FOREIGN KEY (node_id)  REFERENCES public.taxonomy_tree(node_id)
);

CREATE TABLE public.user_subscriptions (
    subscription_id           uuid DEFAULT gen_random_uuid()                  NOT NULL,
    user_id                   uuid                                             NOT NULL,
    tier                      public.subscription_tier DEFAULT 'free'         NOT NULL,
    status                    public.subscription_status DEFAULT 'active'     NOT NULL,
    email_notifications_enabled boolean DEFAULT true,
    marketing_emails_enabled    boolean DEFAULT false,
    stripe_customer_id        text,
    stripe_subscription_id    text,
    payrex_customer_id        text,
    payrex_reference          text,
    created_at                timestamptz DEFAULT now()                        NOT NULL,
    updated_at                timestamptz DEFAULT now()                        NOT NULL,
    CONSTRAINT user_subscriptions_pkey      PRIMARY KEY (subscription_id),
    CONSTRAINT uq_user_subscription         UNIQUE      (user_id),
    CONSTRAINT user_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE public.user_global_stats (
    user_id                  uuid                      NOT NULL,
    current_discipline_id    uuid,
    global_readiness_score   double precision DEFAULT 0.0 NOT NULL,
    target_exam_date         timestamptz,
    final_stretch_upsell_shown boolean DEFAULT false,
    updated_at               timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT user_global_stats_pkey PRIMARY KEY (user_id),
    CONSTRAINT user_global_stats_user_id_fkey             FOREIGN KEY (user_id)              REFERENCES auth.users(id),
    CONSTRAINT user_global_stats_current_discipline_id_fkey FOREIGN KEY (current_discipline_id) REFERENCES public.disciplines(discipline_id)
);

CREATE TABLE public.user_node_mastery (
    user_id               uuid                        NOT NULL,
    topic_id              uuid                        NOT NULL,
    total_attempts        integer DEFAULT 0           NOT NULL,
    total_correct         integer DEFAULT 0           NOT NULL,
    current_mastery_weight double precision DEFAULT 0.0 NOT NULL,
    avg_time_ms           integer DEFAULT 0           NOT NULL,
    last_encountered      timestamptz DEFAULT now()   NOT NULL,
    CONSTRAINT user_node_mastery_pkey         PRIMARY KEY (user_id, topic_id),
    CONSTRAINT user_node_mastery_user_id_fkey  FOREIGN KEY (user_id)  REFERENCES auth.users(id),
    CONSTRAINT user_node_mastery_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.taxonomy_tree(node_id)
);

CREATE TABLE public.readiness_score_snapshots (
    snapshot_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id     uuid                           NOT NULL,
    score       double precision               NOT NULL,
    sub_scores  jsonb DEFAULT '{}'::jsonb      NOT NULL,
    computed_at timestamptz DEFAULT now()      NOT NULL,
    CONSTRAINT readiness_score_snapshots_pkey        PRIMARY KEY (snapshot_id),
    CONSTRAINT readiness_score_snapshots_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE public.note_folders (
    folder_id  uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id    uuid                           NOT NULL,
    name       text                           NOT NULL,
    created_at timestamptz DEFAULT now()      NOT NULL,
    updated_at timestamptz DEFAULT now()      NOT NULL,
    CONSTRAINT note_folders_pkey         PRIMARY KEY (folder_id),
    CONSTRAINT note_folders_user_id_fkey  FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE public.notes (
    note_id    uuid DEFAULT gen_random_uuid()       NOT NULL,
    user_id    uuid                                 NOT NULL,
    folder_id  uuid,
    topic_id   uuid,
    title      text DEFAULT 'Untitled Note'::text   NOT NULL,
    content    jsonb DEFAULT '[]'::jsonb            NOT NULL,
    source_url text,
    created_at timestamptz DEFAULT now()            NOT NULL,
    updated_at timestamptz DEFAULT now()            NOT NULL,
    CONSTRAINT notes_pkey          PRIMARY KEY (note_id),
    CONSTRAINT notes_user_id_fkey   FOREIGN KEY (user_id)   REFERENCES auth.users(id),
    CONSTRAINT notes_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES public.note_folders(folder_id),
    CONSTRAINT notes_topic_id_fkey  FOREIGN KEY (topic_id)  REFERENCES public.taxonomy_tree(node_id)
);

CREATE TABLE public.quiz_sessions (
    session_id             uuid DEFAULT gen_random_uuid()                   NOT NULL,
    user_id                uuid                                             NOT NULL,
    discipline_id          uuid,
    test_mode              public.test_mode DEFAULT 'camp'                  NOT NULL,
    status                 public.session_status DEFAULT 'in_progress'      NOT NULL,
    config                 jsonb DEFAULT '{}'::jsonb                        NOT NULL,
    question_ids           uuid[] DEFAULT '{}'::uuid[]                      NOT NULL,
    subject_ids            uuid[] DEFAULT '{}'::uuid[]                      NOT NULL,
    current_question_index integer DEFAULT 0                                NOT NULL,
    started_at             timestamptz DEFAULT now()                        NOT NULL,
    updated_at             timestamptz DEFAULT now()                        NOT NULL,
    CONSTRAINT quiz_sessions_pkey              PRIMARY KEY (session_id),
    CONSTRAINT quiz_sessions_user_id_fkey       FOREIGN KEY (user_id)       REFERENCES auth.users(id),
    CONSTRAINT quiz_sessions_discipline_id_fkey FOREIGN KEY (discipline_id) REFERENCES public.disciplines(discipline_id)
);

CREATE TABLE public.user_interactions (
    interaction_id        uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id               uuid                           NOT NULL,
    session_id            uuid                           NOT NULL,
    question_id           uuid                           NOT NULL,
    topic_id              uuid,
    selected_option_id    text,
    is_correct            boolean                        NOT NULL,
    time_spent_ms         integer DEFAULT 0,
    interaction_timestamp timestamptz DEFAULT now()      NOT NULL,
    created_at            timestamptz DEFAULT now()      NOT NULL,
    updated_at            timestamptz DEFAULT now()      NOT NULL,
    CONSTRAINT user_interactions_pkey            PRIMARY KEY (interaction_id),
    CONSTRAINT uq_user_session_question          UNIQUE (user_id, session_id, question_id),
    CONSTRAINT user_interactions_user_id_fkey     FOREIGN KEY (user_id)     REFERENCES auth.users(id),
    CONSTRAINT user_interactions_session_id_fkey  FOREIGN KEY (session_id)  REFERENCES public.quiz_sessions(session_id),
    CONSTRAINT user_interactions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id),
    CONSTRAINT user_interactions_topic_id_fkey    FOREIGN KEY (topic_id)    REFERENCES public.taxonomy_tree(node_id)
);


-- ------------------------------------------------------------
-- SECTION 6: TRIGGERS
-- ------------------------------------------------------------

CREATE TRIGGER tr_models_3d_updated_at
    BEFORE UPDATE ON public.models_3d
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_note_folders_updated_at
    BEFORE UPDATE ON public.note_folders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_notes_updated_at
    BEFORE UPDATE ON public.notes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_spatial_hotspots_updated_at
    BEFORE UPDATE ON public.spatial_hotspots
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ------------------------------------------------------------
-- SECTION 7: BASELINE SEED DATA
-- ------------------------------------------------------------

-- Disciplines
INSERT INTO public.disciplines (discipline_id, name, acronym)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Architecture',
    'ARCH'
);

-- Admin user: global stats + subscription
-- Ties philipjonlewis@gmail.com to Architecture as their active discipline

INSERT INTO public.user_global_stats (
    user_id,
    current_discipline_id,
    global_readiness_score,
    updated_at
)
SELECT
    u.id,
    'a0000000-0000-0000-0000-000000000001',
    0.0,
    now()
FROM auth.users u
WHERE u.email = 'philipjonlewis@gmail.com'
ON CONFLICT (user_id)
DO UPDATE SET
    current_discipline_id  = EXCLUDED.current_discipline_id,
    updated_at             = now();

INSERT INTO public.user_subscriptions (
    user_id,
    tier,
    status
)
SELECT
    u.id,
    'pro',
    'active'
FROM auth.users u
WHERE u.email = 'philipjonlewis@gmail.com'
ON CONFLICT (user_id)
DO UPDATE SET
    tier   = 'pro',
    status = 'active';


-- ------------------------------------------------------------
-- SECTION 8: SECURITY (RLS & GRANTS)
-- ------------------------------------------------------------

-- Grants
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- RLS
ALTER TABLE user_global_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE disciplines ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can read own stats" ON user_global_stats;
CREATE POLICY "Users can read own stats" ON user_global_stats
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own stats" ON user_global_stats;
CREATE POLICY "Users can update own stats" ON user_global_stats
    FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own stats" ON user_global_stats;
CREATE POLICY "Users can insert own stats" ON user_global_stats
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can read disciplines" ON disciplines;
CREATE POLICY "Anyone can read disciplines" ON disciplines
    FOR SELECT
    USING (true);
