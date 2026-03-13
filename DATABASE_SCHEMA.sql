-- ============================================================
-- SLATECAMP: UNIFIED EDUCATIONAL OS SCHEMA (v1.0 MASTER)
-- Production-Ready PostgreSQL Schema for Supabase
-- ============================================================
-- Core Engine: Disciplines → Taxonomy → Content → Quizzing → Analytics
-- Extensions:  Notes Workspace, Feedback System, Subscriptions
-- Integrates:  Horizontal Scaling, EMA scoring, IRT weighting,
--              Zero-Data-Loss persistence, and pgvector RAG.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 0. PREREQUISITES: EXTENSIONS, ENUMS & UTILITY FUNCTIONS
-- ────────────────────────────────────────────────────────────

-- Enable pgvector for the AI Contextual Tutor (Zero-Hallucination RAG)
CREATE EXTENSION IF NOT EXISTS vector;

-- Quizzing Enums
CREATE TYPE test_mode AS ENUM ('camp', 'storm', 'chill', 'mock');
CREATE TYPE session_status AS ENUM ('in_progress', 'completed', 'abandoned');

-- Subscription Enums
CREATE TYPE subscription_tier AS ENUM ('free', 'camp', 'insurance', 'institutional');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');

-- Feedback Enums
CREATE TYPE feedback_channel AS ENUM ('widget', 'post_quiz', 'hallucination_flag', 'wiki_flag', '3d_perf_report', 'nps', 'churn_exit', 'feature_pulse', 'discord', 'ambassador', 'partner', 'app_store');
CREATE TYPE feedback_feature_area AS ENUM ('wiki', 'quiz', 'notes', '3d_lab', 'ai_tutor', 'analytics', 'progression', 'auth', 'payments', 'onboarding', 'performance', 'content');
CREATE TYPE feedback_priority AS ENUM ('P0', 'P1', 'P2', 'P3');
CREATE TYPE feedback_status AS ENUM ('new', 'triaged', 'in_progress', 'resolved', 'wont_fix', 'duplicate');

-- SME Review Enums
CREATE TYPE sme_review_type AS ENUM ('hallucination', 'content_error', 'outdated_code', 'taxonomy_gap', 'question_quality', 'scheduled_audit');
CREATE TYPE sme_review_status AS ENUM ('pending', 'assigned', 'in_review', 'approved', 'rejected');

-- Auto-update trigger function for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ────────────────────────────────────────────────────────────
-- 1. SUBSCRIPTIONS (The Paywall & Business Engine)
-- ────────────────────────────────────────────────────────────
CREATE TABLE user_subscriptions (
    subscription_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier                   subscription_tier NOT NULL DEFAULT 'free',
    status                 subscription_status NOT NULL DEFAULT 'active',
    stripe_customer_id     TEXT,
    stripe_subscription_id TEXT,
    payrex_reference       TEXT,
    current_period_end     TIMESTAMPTZ,
    cancel_at_period_end   BOOLEAN NOT NULL DEFAULT false,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_subscription UNIQUE (user_id)
);

COMMENT ON TABLE user_subscriptions IS
    'Tracks user access tiers. Updated via Stripe/PayRex webhooks (Server Actions).';

CREATE INDEX idx_subs_user ON user_subscriptions(user_id);
CREATE INDEX idx_subs_stripe ON user_subscriptions(stripe_customer_id);

CREATE TRIGGER trg_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────
-- 2. DISCIPLINES (The Horizontal Scaling Layer)
-- ────────────────────────────────────────────────────────────
CREATE TABLE disciplines (
    discipline_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL UNIQUE, -- e.g., 'Architecture Licensure Exam'
    acronym       TEXT NOT NULL,        -- e.g., 'ALE', 'PNLE', 'CPALE'
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE disciplines IS
    'Top-level vertical. Allows SlateCamp to host Law, Med, and Architecture on the exact same codebase.';

CREATE TRIGGER trg_disciplines_updated_at
    BEFORE UPDATE ON disciplines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────
-- 3. TAXONOMY_TREE (The Master Syllabus)
-- ────────────────────────────────────────────────────────────
CREATE TABLE taxonomy_tree (
    node_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discipline_id UUID NOT NULL REFERENCES disciplines(discipline_id) ON DELETE CASCADE,
    parent_id     UUID REFERENCES taxonomy_tree(node_id) ON DELETE SET NULL,
    level         SMALLINT NOT NULL CHECK (level >= 1 AND level <= 6),
    name          TEXT NOT NULL,
    subject_area  TEXT NOT NULL,
    slug          TEXT UNIQUE,
    is_leaf       BOOLEAN NOT NULL DEFAULT false,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE taxonomy_tree IS
    'Master syllabus taxonomy. Supports up to 6 levels. is_leaf defines terminal nodes.';

CREATE INDEX idx_taxonomy_discipline ON taxonomy_tree(discipline_id);
CREATE INDEX idx_taxonomy_parent ON taxonomy_tree(parent_id);
CREATE INDEX idx_taxonomy_subject ON taxonomy_tree(subject_area);

CREATE TRIGGER trg_taxonomy_tree_updated_at
    BEFORE UPDATE ON taxonomy_tree
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────
-- 4. CONTENT LAYER: QUESTIONS & WIKI
-- ────────────────────────────────────────────────────────────

-- 4A. QUESTIONS (SME-Authored Quizzing Bank)
CREATE TABLE questions (
    question_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id         UUID NOT NULL REFERENCES taxonomy_tree(node_id) ON DELETE RESTRICT,
    subject_id       UUID NOT NULL REFERENCES taxonomy_tree(node_id) ON DELETE RESTRICT,
    text             TEXT NOT NULL,
    options          JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g. [{"id": "a", "text": "...", "is_correct": true}]
    correct_answer   TEXT,                               -- Optional: ID of the correct option for legacy support
    rationale        TEXT,
    prompt_image_url TEXT,                               -- Layout requirements: 1920x1080 landscape
    difficulty       NUMERIC(3,2) NOT NULL DEFAULT 0.50
                     CHECK (difficulty >= 0.0 AND difficulty <= 1.0),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE questions IS
    'SME-authored question bank. Supports landscape prompt images and integrated rationales.';

CREATE INDEX idx_questions_topic ON questions(topic_id);
CREATE INDEX idx_questions_subject ON questions(subject_id);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);

CREATE TRIGGER trg_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4B. WIKI_ARTICLES (SME-Authored Knowledge Base)
CREATE TABLE wiki_articles (
    article_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug          TEXT NOT NULL UNIQUE,
    title         TEXT NOT NULL,
    content       TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE wiki_articles IS
    'The definitive source of truth. Authoritative content that feeds the UI and the AI.';

CREATE INDEX idx_wiki_slug ON wiki_articles(slug);

CREATE TRIGGER trg_wiki_articles_updated_at
    BEFORE UPDATE ON wiki_articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4C. WIKI_ARTICLE_TAXONOMY (Many-to-Many Mapping)
CREATE TABLE wiki_article_taxonomy (
    article_id UUID NOT NULL REFERENCES wiki_articles(article_id) ON DELETE CASCADE,
    node_id    UUID NOT NULL REFERENCES taxonomy_tree(node_id) ON DELETE CASCADE,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY (article_id, node_id)
);

COMMENT ON TABLE wiki_article_taxonomy IS
    'Maps Wiki articles to taxonomy nodes. Supports many-to-many relationships.';

CREATE INDEX idx_wiki_tax_article ON wiki_article_taxonomy(article_id);
CREATE INDEX idx_wiki_tax_node ON wiki_article_taxonomy(node_id);

-- 4D. WIKI_EMBEDDINGS (AI Contextual Tutor RAG Store)
CREATE TABLE wiki_embeddings (
    embedding_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id    UUID NOT NULL REFERENCES wiki_articles(article_id) ON DELETE CASCADE,
    topic_id      UUID NOT NULL REFERENCES taxonomy_tree(node_id) ON DELETE RESTRICT,
    chunk_text    TEXT NOT NULL,
    embedding     vector(1536) NOT NULL
);

COMMENT ON TABLE wiki_embeddings IS
    'Vectorized chunks of Wiki articles for the Zero-Hallucination AI retrieval pipeline.';

CREATE INDEX idx_wiki_embeddings_vector
    ON wiki_embeddings USING ivfflat (embedding vector_cosine_ops);

-- ────────────────────────────────────────────────────────────
-- 5. NOTES & WORKSPACE (The Synthesis Ledger)
-- ────────────────────────────────────────────────────────────
CREATE TABLE user_notes (
    note_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title               TEXT,
    content_blocks      JSONB NOT NULL DEFAULT '[]'::jsonb,
    associated_topics   UUID[] NOT NULL DEFAULT '{}',
    viewed_at           TIMESTAMPTZ, -- For "capture but no revisit" metrics
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE user_notes IS
    'Personal workspace blocks. content_blocks stores TipTap JSON. associated_topics maps to taxonomy.';

CREATE INDEX idx_user_notes_user ON user_notes(user_id);
CREATE INDEX idx_user_notes_viewed ON user_notes(viewed_at);

CREATE TRIGGER trg_user_notes_updated_at
    BEFORE UPDATE ON user_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────
-- 6. USER_GLOBAL_STATS (Dashboard Hero Metrics)
-- ────────────────────────────────────────────────────────────
CREATE TABLE user_global_stats (
    user_id                 UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    current_discipline_id   UUID REFERENCES disciplines(discipline_id) ON DELETE SET NULL,
    global_readiness_score  DOUBLE PRECISION NOT NULL DEFAULT 0.0
                            CHECK (global_readiness_score >= 0.0 AND global_readiness_score <= 100.0),
    current_streak_days     INTEGER NOT NULL DEFAULT 0 CHECK (current_streak_days >= 0),
    longest_streak_days     INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak_days >= 0),
    last_study_date         DATE,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE user_global_stats IS
    'O(1) lookup table for the Dashboard hero numbers. Tracks which discipline the user is currently studying.';

CREATE TRIGGER trg_user_global_stats_updated_at
    BEFORE UPDATE ON user_global_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────
-- 7. QUIZ_SESSIONS (The State Manager & Zero-Data-Loss)
-- ────────────────────────────────────────────────────────────
CREATE TABLE quiz_sessions (
    session_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    test_mode              test_mode NOT NULL DEFAULT 'camp',
    status                 session_status NOT NULL DEFAULT 'in_progress',
    question_ids           UUID[] NOT NULL DEFAULT '{}',
    subject_ids            UUID[] NOT NULL DEFAULT '{}', -- Tracks custom session filter
    source_article_id      UUID REFERENCES public.wiki_articles(article_id) ON DELETE SET NULL,
    current_question_index INTEGER NOT NULL DEFAULT 0,
    started_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at           TIMESTAMPTZ,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE quiz_sessions IS
    'Session state manager. question_ids and current_question_index guarantee exact resume state.';

CREATE INDEX idx_sessions_user ON quiz_sessions(user_id);
CREATE INDEX idx_sessions_status ON quiz_sessions(status) WHERE status = 'in_progress';

CREATE TRIGGER trg_quiz_sessions_updated_at
    BEFORE UPDATE ON quiz_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────
-- 8. USER_INTERACTIONS (The Atomic Telemetry Log)
-- ────────────────────────────────────────────────────────────
CREATE TABLE user_interactions (
    interaction_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id           UUID NOT NULL REFERENCES quiz_sessions(session_id) ON DELETE CASCADE,
    question_id          UUID NOT NULL REFERENCES questions(question_id) ON DELETE RESTRICT,
    topic_id             UUID REFERENCES taxonomy_tree(node_id) ON DELETE SET NULL,
    selected_option_id   TEXT,              -- NULL allowed for timeout/skipped items
    is_correct           BOOLEAN NOT NULL,
    time_spent_ms        INTEGER DEFAULT 0 CHECK (time_spent_ms >= 0),
    interaction_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uq_user_session_question UNIQUE (user_id, session_id, question_id)
);

COMMENT ON TABLE user_interactions IS
    'Atomic telemetry log. time_spent_ms tracks performance. uq constraint enables upsert logic.';

CREATE INDEX idx_interactions_user_topic ON user_interactions(user_id, topic_id);
CREATE INDEX idx_interactions_user_session ON user_interactions(user_id, session_id);
CREATE INDEX idx_interactions_question ON user_interactions(question_id);
CREATE INDEX idx_interactions_timestamp ON user_interactions(interaction_timestamp DESC);

CREATE TRIGGER trg_user_interactions_updated_at
    BEFORE UPDATE ON user_interactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────
-- 9. ROW-LEVEL SECURITY (RLS) POLICIES
-- ────────────────────────────────────────────────────────────

-- Enable RLS everywhere
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxonomy_tree ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_article_taxonomy ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_global_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

-- 9A. Content & Structs (Authenticated Read)
CREATE POLICY "authenticated_read_disciplines" ON disciplines FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_taxonomy" ON taxonomy_tree FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_questions" ON questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_wiki" ON wiki_articles FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_wiki_taxonomy" ON wiki_article_taxonomy FOR SELECT TO authenticated USING (true);

-- 9B. Grants (Bypass RLS for Service Role)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON public.disciplines TO authenticated;
GRANT SELECT ON public.taxonomy_tree TO authenticated;
GRANT SELECT ON public.wiki_articles TO authenticated;
GRANT SELECT ON public.wiki_article_taxonomy TO authenticated;
GRANT SELECT ON public.questions TO authenticated;
GRANT ALL ON public.user_subscriptions TO authenticated;
GRANT ALL ON public.user_global_stats TO authenticated;
GRANT ALL ON public.quiz_sessions TO authenticated;
GRANT ALL ON public.user_interactions TO authenticated;

-- 9C. Ownership Policies (User Access)
CREATE POLICY "manage_own_subs" ON user_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "manage_own_stats" ON user_global_stats FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "manage_own_sessions" ON quiz_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "manage_own_interactions" ON user_interactions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- THE SLATECAMP MASTER SCHEMA IS COMPLETE.
-- ============================================================
