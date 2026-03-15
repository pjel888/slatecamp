SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

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
    'practice',
    'storm',
    'chill',
    'custom',
    'blindspot',
    'proof_sim',
    'endurance'
);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

SET default_tablespace = '';

SET default_table_access_method = heap;

CREATE TABLE public.disciplines (
    discipline_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    acronym text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.models_3d (
    model_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    url text NOT NULL,
    thumbnail text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.note_folders (
    folder_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.notes (
    note_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    folder_id uuid,
    topic_id uuid,
    title text DEFAULT 'Untitled Note'::text NOT NULL,
    content jsonb DEFAULT '[]'::jsonb NOT NULL,
    source_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- FIXED TABLE: Added correct_option_id
CREATE TABLE public.questions (
    question_id uuid DEFAULT gen_random_uuid() NOT NULL,
    topic_id uuid NOT NULL,
    text text NOT NULL,
    options jsonb DEFAULT '[]'::jsonb NOT NULL,
    correct_option_id text NOT NULL, -- The specific fix
    rationale text,
    difficulty numeric DEFAULT 0.50,
    difficulty_rating numeric,
    discrimination_rating numeric,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.quiz_sessions (
    session_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    discipline_id uuid,
    test_mode public.test_mode DEFAULT 'camp'::public.test_mode NOT NULL,
    status public.session_status DEFAULT 'in_progress'::public.session_status NOT NULL,
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    question_ids uuid[] DEFAULT '{}'::uuid[] NOT NULL,
    subject_ids uuid[] DEFAULT '{}'::uuid[] NOT NULL,
    current_question_index integer DEFAULT 0 NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.readiness_score_snapshots (
    snapshot_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    score double precision NOT NULL,
    sub_scores jsonb DEFAULT '{}'::jsonb NOT NULL,
    computed_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.spatial_hotspots (
    hotspot_id uuid DEFAULT gen_random_uuid() NOT NULL,
    model_id uuid NOT NULL,
    node_id uuid,
    title text NOT NULL,
    description text,
    position_x double precision NOT NULL,
    position_y double precision NOT NULL,
    position_z double precision NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.taxonomy_tree (
    node_id uuid DEFAULT gen_random_uuid() NOT NULL,
    discipline_id uuid NOT NULL,
    parent_id uuid,
    level smallint NOT NULL,
    name text NOT NULL,
    subject_area text NOT NULL,
    slug text,
    is_leaf boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT taxonomy_tree_level_check CHECK (((level >= 1) AND (level <= 6)))
);

CREATE TABLE public.user_global_stats (
    user_id uuid NOT NULL,
    current_discipline_id uuid,
    global_readiness_score double precision DEFAULT 0.0 NOT NULL,
    target_exam_date timestamp with time zone,
    final_stretch_upsell_shown boolean DEFAULT false,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.user_interactions (
    interaction_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    session_id uuid NOT NULL,
    question_id uuid NOT NULL,
    topic_id uuid,
    selected_option_id text,
    is_correct boolean NOT NULL,
    time_spent_ms integer DEFAULT 0,
    interaction_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.user_node_mastery (
    user_id uuid NOT NULL,
    topic_id uuid NOT NULL,
    total_attempts integer DEFAULT 0 NOT NULL,
    total_correct integer DEFAULT 0 NOT NULL,
    current_mastery_weight double precision DEFAULT 0.0 NOT NULL,
    avg_time_ms integer DEFAULT 0 NOT NULL,
    last_encountered timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.user_subscriptions (
    subscription_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    tier public.subscription_tier DEFAULT 'free'::public.subscription_tier NOT NULL,
    status public.subscription_status DEFAULT 'active'::public.subscription_status NOT NULL,
    email_notifications_enabled boolean DEFAULT true,
    marketing_emails_enabled boolean DEFAULT false,
    stripe_customer_id text,
    stripe_subscription_id text,
    payrex_customer_id text,
    payrex_reference text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.wiki_article_taxonomy (
    article_id uuid NOT NULL,
    node_id uuid NOT NULL,
    is_primary boolean DEFAULT false
);

CREATE TABLE public.wiki_articles (
    article_id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.disciplines
    ADD CONSTRAINT disciplines_pkey PRIMARY KEY (discipline_id);

ALTER TABLE ONLY public.disciplines
    ADD CONSTRAINT disciplines_name_key UNIQUE (name);

ALTER TABLE ONLY public.models_3d
    ADD CONSTRAINT models_3d_pkey PRIMARY KEY (model_id);

ALTER TABLE ONLY public.models_3d
    ADD CONSTRAINT models_3d_slug_key UNIQUE (slug);

ALTER TABLE ONLY public.note_folders
    ADD CONSTRAINT note_folders_pkey PRIMARY KEY (folder_id);

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_pkey PRIMARY KEY (note_id);

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (question_id);

ALTER TABLE ONLY public.quiz_sessions
    ADD CONSTRAINT quiz_sessions_pkey PRIMARY KEY (session_id);

ALTER TABLE ONLY public.readiness_score_snapshots
    ADD CONSTRAINT readiness_score_snapshots_pkey PRIMARY KEY (snapshot_id);

ALTER TABLE ONLY public.spatial_hotspots
    ADD CONSTRAINT spatial_hotspots_pkey PRIMARY KEY (hotspot_id);

ALTER TABLE ONLY public.taxonomy_tree
    ADD CONSTRAINT taxonomy_tree_pkey PRIMARY KEY (node_id);

ALTER TABLE ONLY public.taxonomy_tree
    ADD CONSTRAINT taxonomy_tree_slug_key UNIQUE (slug);

ALTER TABLE ONLY public.user_global_stats
    ADD CONSTRAINT user_global_stats_pkey PRIMARY KEY (user_id);

ALTER TABLE ONLY public.user_interactions
    ADD CONSTRAINT user_interactions_pkey PRIMARY KEY (interaction_id);

ALTER TABLE ONLY public.user_interactions
    ADD CONSTRAINT uq_user_session_question UNIQUE (user_id, session_id, question_id);

ALTER TABLE ONLY public.user_node_mastery
    ADD CONSTRAINT user_node_mastery_pkey PRIMARY KEY (user_id, topic_id);

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_pkey PRIMARY KEY (subscription_id);

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT uq_user_subscription UNIQUE (user_id);

ALTER TABLE ONLY public.wiki_article_taxonomy
    ADD CONSTRAINT wiki_article_taxonomy_pkey PRIMARY KEY (article_id, node_id);

ALTER TABLE ONLY public.wiki_articles
    ADD CONSTRAINT wiki_articles_pkey PRIMARY KEY (article_id);

ALTER TABLE ONLY public.wiki_articles
    ADD CONSTRAINT wiki_articles_slug_key UNIQUE (slug);

CREATE TRIGGER tr_models_3d_updated_at BEFORE UPDATE ON public.models_3d FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_note_folders_updated_at BEFORE UPDATE ON public.note_folders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_spatial_hotspots_updated_at BEFORE UPDATE ON public.spatial_hotspots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE ONLY public.note_folders
    ADD CONSTRAINT note_folders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES public.note_folders(folder_id);

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.taxonomy_tree(node_id);

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.taxonomy_tree(node_id);

ALTER TABLE ONLY public.quiz_sessions
    ADD CONSTRAINT quiz_sessions_discipline_id_fkey FOREIGN KEY (discipline_id) REFERENCES public.disciplines(discipline_id);

ALTER TABLE ONLY public.quiz_sessions
    ADD CONSTRAINT quiz_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE ONLY public.readiness_score_snapshots
    ADD CONSTRAINT readiness_score_snapshots_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE ONLY public.spatial_hotspots
    ADD CONSTRAINT spatial_hotspots_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.models_3d(model_id);

ALTER TABLE ONLY public.spatial_hotspots
    ADD CONSTRAINT spatial_hotspots_node_id_fkey FOREIGN KEY (node_id) REFERENCES public.taxonomy_tree(node_id);

ALTER TABLE ONLY public.taxonomy_tree
    ADD CONSTRAINT taxonomy_tree_discipline_id_fkey FOREIGN KEY (discipline_id) REFERENCES public.disciplines(discipline_id);

ALTER TABLE ONLY public.taxonomy_tree
    ADD CONSTRAINT taxonomy_tree_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.taxonomy_tree(node_id);

ALTER TABLE ONLY public.user_global_stats
    ADD CONSTRAINT user_global_stats_current_discipline_id_fkey FOREIGN KEY (current_discipline_id) REFERENCES public.disciplines(discipline_id);

ALTER TABLE ONLY public.user_global_stats
    ADD CONSTRAINT user_global_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE ONLY public.user_interactions
    ADD CONSTRAINT user_interactions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id);

ALTER TABLE ONLY public.user_interactions
    ADD CONSTRAINT user_interactions_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.quiz_sessions(session_id);

ALTER TABLE ONLY public.user_interactions
    ADD CONSTRAINT user_interactions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.taxonomy_tree(node_id);

ALTER TABLE ONLY public.user_interactions
    ADD CONSTRAINT user_interactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE ONLY public.user_node_mastery
    ADD CONSTRAINT user_node_mastery_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.taxonomy_tree(node_id);

ALTER TABLE ONLY public.user_node_mastery
    ADD CONSTRAINT user_node_mastery_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE ONLY public.wiki_article_taxonomy
    ADD CONSTRAINT wiki_article_taxonomy_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.wiki_articles(article_id);

ALTER TABLE ONLY public.wiki_article_taxonomy
    ADD CONSTRAINT wiki_article_taxonomy_node_id_fkey FOREIGN KEY (node_id) REFERENCES public.taxonomy_tree(node_id);

-- Grants
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Row Level Security
ALTER TABLE public.user_global_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_folders ENABLE ROW LEVEL SECURITY;

-- Policies

CREATE POLICY "Users can read own stats"
ON public.user_global_stats -- Added public.
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
ON public.user_global_stats -- Added public.
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
ON public.user_global_stats -- Added public.
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can read disciplines"
ON public.disciplines -- Added public.
FOR SELECT
USING (true);

CREATE POLICY "Users can manage own notes"
ON public.notes -- Added public.
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own folders"
ON public.note_folders -- Added public.
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);