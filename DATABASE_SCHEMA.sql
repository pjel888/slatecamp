-- ============================================================
-- SLATECAMP: UNIFIED EDUCATIONAL OS SCHEMA (v1.0 LIVE MIRROR)
-- Synchronized with production state as of March 14, 2026
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 0. PREREQUISITES: EXTENSIONS & ENUMS
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;

-- Quizzing Enums
CREATE TYPE test_mode AS ENUM ('camp', 'storm', 'chill', 'custom', 'blindspot', 'proof_sim', 'endurance');
CREATE TYPE session_status AS ENUM ('in_progress', 'completed', 'abandoned');

-- Subscription Enums
CREATE TYPE subscription_tier AS ENUM ('free', 'camp', 'insurance', 'institutional');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');

-- Utility function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ────────────────────────────────────────────────────────────
-- 1. CORE TABLES
-- ────────────────────────────────────────────────────────────

CREATE TABLE disciplines (
    discipline_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL UNIQUE,
    acronym       TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE taxonomy_tree (
    node_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discipline_id UUID NOT NULL REFERENCES disciplines(discipline_id) ON DELETE CASCADE,
    parent_id     UUID REFERENCES taxonomy_tree(node_id) ON DELETE SET NULL,
    level         SMALLINT NOT NULL,
    name          TEXT NOT NULL,
    subject_area  TEXT NOT NULL,
    slug          TEXT UNIQUE,
    is_leaf       BOOLEAN NOT NULL DEFAULT false,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE wiki_articles (
    article_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title         TEXT NOT NULL,
    slug          TEXT NOT NULL UNIQUE,
    content       TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE wiki_article_taxonomy (
    article_id UUID NOT NULL REFERENCES wiki_articles(article_id) ON DELETE CASCADE,
    node_id    UUID NOT NULL REFERENCES taxonomy_tree(node_id) ON DELETE CASCADE,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY (article_id, node_id)
);

CREATE TABLE questions (
    question_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id      UUID NOT NULL REFERENCES taxonomy_tree(node_id) ON DELETE RESTRICT,
    text          TEXT NOT NULL,
    options       JSONB NOT NULL DEFAULT '[]'::jsonb,
    rationale     TEXT,
    difficulty    NUMERIC NOT NULL DEFAULT 0.50,
    difficulty_rating     NUMERIC, -- IRT parameter (b)
    discrimination_rating NUMERIC, -- IRT parameter (a)
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_subscriptions (
    subscription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier            subscription_tier NOT NULL DEFAULT 'free',
    status          subscription_status NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_subscription UNIQUE (user_id)
);

CREATE TABLE user_global_stats (
    user_id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    current_discipline_id UUID REFERENCES disciplines(discipline_id) ON DELETE SET NULL,
    global_readiness_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MIGRATION: 2026-03-14: Adding advanced testing analytics
CREATE TABLE user_node_mastery (
    user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id               UUID NOT NULL REFERENCES taxonomy_tree(node_id) ON DELETE CASCADE,
    total_attempts         INTEGER NOT NULL DEFAULT 0,
    total_correct          INTEGER NOT NULL DEFAULT 0,
    current_mastery_weight DOUBLE PRECISION NOT NULL DEFAULT 0.0, -- EMA-weighted mastery
    avg_time_ms            INTEGER NOT NULL DEFAULT 0,
    last_encountered       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, topic_id)
);

CREATE TABLE quiz_sessions (
    session_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    discipline_id          UUID REFERENCES disciplines(discipline_id) ON DELETE SET NULL,
    test_mode              test_mode NOT NULL DEFAULT 'camp',
    status                 session_status NOT NULL DEFAULT 'in_progress',
    config                 JSONB NOT NULL DEFAULT '{}'::jsonb, -- Store timer, feedback settings
    question_ids           UUID[] NOT NULL DEFAULT '{}',
    subject_ids            UUID[] NOT NULL DEFAULT '{}',
    current_question_index INTEGER NOT NULL DEFAULT 0,
    started_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_interactions (
    interaction_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id           UUID NOT NULL REFERENCES quiz_sessions(session_id) ON DELETE CASCADE,
    question_id          UUID NOT NULL REFERENCES questions(question_id) ON DELETE RESTRICT,
    topic_id             UUID REFERENCES taxonomy_tree(node_id) ON DELETE SET NULL,
    selected_option_id   TEXT,
    is_correct           BOOLEAN NOT NULL,
    time_spent_ms        INTEGER DEFAULT 0,
    interaction_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_session_question UNIQUE (user_id, session_id, question_id)
);

-- ────────────────────────────────────────────────────────────
-- 9. ROW-LEVEL SECURITY (RLS) POLICIES
-- ────────────────────────────────────────────────────────────

ALTER TABLE disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxonomy_tree ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_article_taxonomy ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_global_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_node_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_disciplines" ON disciplines FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_taxonomy" ON taxonomy_tree FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_questions" ON questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_wiki" ON wiki_articles FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_wiki_taxonomy" ON wiki_article_taxonomy FOR SELECT TO authenticated USING (true);

CREATE POLICY "manage_own_subs" ON user_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "manage_own_stats" ON user_global_stats FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "manage_own_sessions" ON quiz_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "manage_own_interactions" ON user_interactions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "manage_own_mastery" ON user_node_mastery FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 10. GRANTS
-- ────────────────────────────────────────────────────────────
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON public.disciplines TO authenticated;
GRANT SELECT ON public.taxonomy_tree TO authenticated;
GRANT SELECT ON public.wiki_articles TO authenticated;
GRANT SELECT ON public.wiki_article_taxonomy TO authenticated;
GRANT SELECT ON public.questions TO authenticated;
GRANT ALL ON public.user_subscriptions TO authenticated;
GRANT ALL ON public.user_global_stats TO authenticated;
GRANT ALL ON public.user_node_mastery TO authenticated;
GRANT ALL ON public.quiz_sessions TO authenticated;
GRANT ALL ON public.user_interactions TO authenticated;
