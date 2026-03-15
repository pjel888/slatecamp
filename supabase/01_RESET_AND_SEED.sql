-- ============================================================
-- 00_SAFE_SEED.sql
-- Re-seeds baseline data without dropping existing tables
-- ============================================================

-- SECTION 1: EXTENSIONS (Safe with IF NOT EXISTS)
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- SECTION 2: TYPES
-- Note: These will error if they already exist, so we use a DO block to check
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_status') THEN
        CREATE TYPE public.session_status AS ENUM ('in_progress', 'completed', 'abandoned');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'expired', 'trialing');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier') THEN
        CREATE TYPE public.subscription_tier AS ENUM ('free', 'pro', 'enterprise');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'test_mode') THEN
        CREATE TYPE public.test_mode AS ENUM ('camp', 'timed', 'practice', 'storm', 'chill', 'custom', 'blindspot', 'proof_sim', 'endurance');
    END IF;
END $$;

-- SECTION 3: FUNCTION
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

-- SECTION 4: TABLES (Safe with IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS public.disciplines (
    discipline_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text UNIQUE NOT NULL,
    acronym text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.taxonomy_tree (
    node_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    discipline_id uuid NOT NULL REFERENCES public.disciplines(discipline_id),
    parent_id uuid REFERENCES public.taxonomy_tree(node_id),
    level smallint NOT NULL CHECK (level >= 1 AND level <= 6),
    name text NOT NULL,
    subject_area text NOT NULL,
    slug text UNIQUE,
    is_leaf boolean DEFAULT false NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.questions (
    question_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    topic_id uuid NOT NULL REFERENCES public.taxonomy_tree(node_id),
    text text NOT NULL,
    options jsonb DEFAULT '[]'::jsonb NOT NULL,
    correct_option_id text NOT NULL,
    rationale text,
    difficulty numeric DEFAULT 0.50,
    created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_global_stats (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id),
    current_discipline_id uuid REFERENCES public.disciplines(discipline_id),
    global_readiness_score double precision DEFAULT 0.0 NOT NULL,
    target_exam_date timestamptz,
    updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    subscription_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id),
    tier public.subscription_tier DEFAULT 'free' NOT NULL,
    status public.subscription_status DEFAULT 'active' NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- SECTION 5: BASELINE SEED DATA (Uses ON CONFLICT to avoid duplicates)
INSERT INTO public.disciplines (discipline_id, name, acronym)
VALUES ('a0000000-0000-0000-0000-000000000001', 'Architecture', 'ARCH')
ON CONFLICT (discipline_id) DO NOTHING;

INSERT INTO public.user_global_stats (user_id, current_discipline_id)
SELECT id, 'a0000000-0000-0000-0000-000000000001' FROM auth.users WHERE email = 'philipjonlewis@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET current_discipline_id = EXCLUDED.current_discipline_id;

INSERT INTO public.user_subscriptions (user_id, tier, status)
SELECT id, 'pro', 'active' FROM auth.users WHERE email = 'philipjonlewis@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET tier = 'pro', status = 'active';

-- SECTION 6: SECURITY
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER TABLE public.user_global_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disciplines ENABLE ROW LEVEL SECURITY;

-- Note: Policies will error if they already exist, so we drop and recreate
DROP POLICY IF EXISTS "Users can read own stats" ON public.user_global_stats;
CREATE POLICY "Users can read own stats" ON public.user_global_stats FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own stats" ON public.user_global_stats;
CREATE POLICY "Users can update own stats" ON public.user_global_stats FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can read disciplines" ON public.disciplines;
CREATE POLICY "Anyone can read disciplines" ON public.disciplines FOR SELECT USING (true);