-- =============================================================
-- PROJECT CEREBRO — COMPLETE DATABASE SCHEMA
-- Version: 3.0 · Updated: 2026-03-08
-- 
-- IMPORTANT: This is the SINGLE SOURCE OF TRUTH for the database.
-- Do NOT create columns not defined here.
-- Do NOT modify table names or relationships.
-- Feed this file to the AI agent before any database work.
-- =============================================================

-- =============================================================
-- EXTENSIONS
-- =============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =============================================================
-- ENUMS
-- =============================================================
CREATE TYPE user_tier AS ENUM ('free', 'pro', 'max');
CREATE TYPE question_type AS ENUM ('mcq', 'true_false', 'identification', 'matching', 'sequencing', 'essay');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard', 'expert');
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived', 'flagged');
CREATE TYPE session_type AS ENUM ('subject_quick', 'custom_compiled', 'srs_review', 'ai_adaptive', 'retake', 'topic_drill', '3d_model_quiz', 'weak_areas');
CREATE TYPE session_status AS ENUM ('in_progress', 'completed', 'abandoned', 'paused');
CREATE TYPE reference_type AS ENUM ('book', 'code', 'standard', 'article', 'video', 'website');


-- =============================================================
-- 1. USER & AUTH
-- =============================================================

-- Profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    tier user_tier DEFAULT 'free' NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    ai_tokens_used INT DEFAULT 0,
    ai_tokens_limit INT DEFAULT 0,
    preferred_theme TEXT DEFAULT 'system' CHECK (preferred_theme IN ('light', 'dark', 'system')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================
-- 2. EXAM PROFILES (multi-exam identity system)
-- =============================================================

-- Board Exams (the catalog of supported exams)
CREATE TABLE public.board_exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profession TEXT NOT NULL,
    specialization TEXT,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    country TEXT DEFAULT 'PH',
    description TEXT,
    total_subjects INT,
    passing_score_percentage FLOAT,
    icon_name TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    has_content BOOLEAN DEFAULT FALSE,          -- FALSE = "Coming Soon"
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exam Profiles (one user can have many — this scopes everything)
CREATE TABLE public.exam_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    board_exam_id UUID REFERENCES board_exams(id) NOT NULL,
    target_exam_date DATE,
    study_hours_per_day FLOAT DEFAULT 2,
    is_active BOOLEAN DEFAULT FALSE,            -- Only ONE can be active at a time
    onboarding_completed BOOLEAN DEFAULT FALSE,
    daily_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects (belong to a board exam)
CREATE TABLE public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    board_exam_id UUID REFERENCES board_exams(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    short_name TEXT,
    slug TEXT NOT NULL,
    description TEXT,
    exam_weight_percentage FLOAT DEFAULT 0,
    estimated_question_count INT,
    color TEXT,                                  -- Hex accent color
    icon_name TEXT,                              -- Lucide icon name
    has_3d_workspace BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(board_exam_id, slug)
);

-- Topics (subdivisions within a subject)
CREATE TABLE public.topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    parent_topic_id UUID REFERENCES topics(id),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(subject_id, slug)
);


-- =============================================================
-- 3. QUESTIONS (rich content model)
-- =============================================================

-- Question Banks (collections)
CREATE TABLE public.question_banks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    board_exam_id UUID REFERENCES board_exams(id),
    title TEXT NOT NULL,
    description TEXT,
    is_official BOOLEAN DEFAULT FALSE,
    is_marketplace BOOLEAN DEFAULT FALSE,
    price_cents INT DEFAULT 0,
    currency TEXT DEFAULT 'PHP',
    status content_status DEFAULT 'draft',
    question_count INT DEFAULT 0,
    average_rating FLOAT DEFAULT 0,
    total_ratings INT DEFAULT 0,
    total_purchases INT DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions (the core content unit)
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Hierarchy
    bank_id UUID REFERENCES question_banks(id) ON DELETE SET NULL,
    subject_id UUID REFERENCES subjects(id) NOT NULL,
    topic_id UUID REFERENCES topics(id),
    
    -- Creator
    creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_official BOOLEAN DEFAULT FALSE,
    
    -- Content
    question_type question_type DEFAULT 'mcq',
    prompt TEXT NOT NULL,                           -- Supports markdown + LaTeX
    prompt_image_url TEXT,                          -- Hero image for the question
    
    -- Choices (MCQ) — JSONB array
    choices JSONB NOT NULL DEFAULT '[]',
    -- Structure: [
    --   {"id": "a", "text": "Choice text", "image_url": null, "is_correct": false},
    --   {"id": "b", "text": "Choice text", "image_url": null, "is_correct": true},
    --   {"id": "c", "text": "Choice text", "image_url": null, "is_correct": false},
    --   {"id": "d", "text": "Choice text", "image_url": null, "is_correct": false}
    -- ]
    
    correct_answer TEXT NOT NULL,                   -- "a", "b", "c", or "d"
    
    -- Rich learning content (shown after answering)
    explanation TEXT,                               -- WHY this is the answer (markdown)
    explanation_image_url TEXT,                     -- Diagram or photo for explanation
    
    -- References (array of reference objects)
    references JSONB DEFAULT '[]',
    -- Structure: [
    --   {"title": "National Building Code Sec 701", "url": null, "page": "42", "type": "code"},
    --   {"title": "Ching, Architecture: Form Space & Order", "url": null, "page": "156", "type": "book"}
    -- ]
    
    -- Learning aids
    fun_facts TEXT[] DEFAULT '{}',                  -- Interesting tidbits
    mnemonics TEXT,                                 -- Memory aid
    related_topic_ids UUID[] DEFAULT '{}',          -- For "learn more" links
    
    -- Difficulty
    difficulty difficulty_level DEFAULT 'medium',
    difficulty_rating FLOAT DEFAULT 0.5,            -- IRT parameter (0-1)
    discrimination_rating FLOAT DEFAULT 1.0,        -- IRT parameter
    
    -- 3D Integration
    has_3d_component BOOLEAN DEFAULT FALSE,
    three_d_model_id UUID,                          -- FK added after 3D table creation
    model_callout_id UUID,                          -- FK added after callouts table creation
    
    -- Additional media
    image_urls TEXT[] DEFAULT '{}',
    
    -- Global stats (aggregated across ALL users)
    global_times_answered INT DEFAULT 0,
    global_times_correct INT DEFAULT 0,
    global_accuracy_percentage FLOAT DEFAULT 0,
    global_avg_response_time_ms INT DEFAULT 0,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    status content_status DEFAULT 'published',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================
-- 4. REVIEW MODE (lightweight tracking)
-- =============================================================

CREATE TABLE public.review_mode_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    exam_profile_id UUID REFERENCES exam_profiles(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
    initial_tap_correct BOOLEAN,                    -- What they tapped first (null if just viewed)
    time_on_question_ms INT,                        -- How long before swiping away
    viewed_at TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================
-- 5. SESSIONS MODE (full analytics tracking)
-- =============================================================

-- Session Templates (saved configurations for reuse)
CREATE TABLE public.session_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    exam_profile_id UUID REFERENCES exam_profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    config JSONB NOT NULL,
    -- Structure: {
    --   "subjects": [
    --     {"subject_id": "uuid", "question_count": 25, "difficulty": "mixed"},
    --     {"subject_id": "uuid", "question_count": 25, "difficulty": "hard"}
    --   ],
    --   "specific_question_ids": [],          -- For Max users who hand-pick
    --   "timer_mode": "none",                 -- "none" | "per_question" | "total"
    --   "timer_seconds": null,
    --   "shuffle_questions": true,
    --   "shuffle_choices": true,
    --   "show_immediate_feedback": true
    -- }
    total_questions INT NOT NULL,
    is_shared BOOLEAN DEFAULT FALSE,
    times_used INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review Sessions (every test attempt)
CREATE TABLE public.review_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    exam_profile_id UUID REFERENCES exam_profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Type & origin
    session_type session_type NOT NULL,
    template_id UUID REFERENCES session_templates(id),
    retake_of_session_id UUID REFERENCES review_sessions(id),
    source_subject_id UUID REFERENCES subjects(id),
    source_topic_id UUID REFERENCES topics(id),
    source_3d_model_id UUID,                        -- FK added after 3D table
    
    -- Config snapshot (frozen at creation — retakes use same config)
    config JSONB NOT NULL,
    name TEXT,
    
    -- Aggregate stats (updated as session progresses)
    total_questions INT NOT NULL DEFAULT 0,
    questions_answered INT DEFAULT 0,
    questions_correct INT DEFAULT 0,
    questions_incorrect INT DEFAULT 0,
    questions_skipped INT DEFAULT 0,
    score_percentage FLOAT,
    total_time_ms BIGINT DEFAULT 0,
    avg_response_time_ms INT,
    
    -- Per-subject breakdown (computed at session end)
    subject_scores JSONB DEFAULT '[]',
    -- Structure: [
    --   {"subject_id": "uuid", "subject_name": "Building Tech",
    --    "total": 25, "correct": 20, "percentage": 80.0, "avg_time_ms": 12000}
    -- ]
    
    -- State
    status session_status DEFAULT 'in_progress',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    paused_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session Questions (ordered questions + responses within a session)
CREATE TABLE public.session_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES review_sessions(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
    
    -- Position
    question_number INT NOT NULL,
    
    -- Context (denormalized for fast analytics)
    subject_id UUID REFERENCES subjects(id),
    topic_id UUID REFERENCES topics(id),
    
    -- Response
    selected_answer TEXT,                           -- null if not yet answered or skipped
    is_correct BOOLEAN,
    response_time_ms INT,
    confidence_level INT CHECK (confidence_level >= 1 AND confidence_level <= 5),
    
    -- Timestamps
    presented_at TIMESTAMPTZ,
    answered_at TIMESTAMPTZ,
    
    -- Flags
    is_bookmarked BOOLEAN DEFAULT FALSE,
    is_skipped BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================
-- 6. SRS (Spaced Repetition System) — Pro/Max
-- =============================================================

CREATE TABLE public.srs_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    exam_profile_id UUID REFERENCES exam_profiles(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
    
    next_review_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    interval_days FLOAT DEFAULT 1,
    ease_factor FLOAT DEFAULT 2.5,
    repetition_count INT DEFAULT 0,
    lapses INT DEFAULT 0,
    last_quality INT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, exam_profile_id, question_id)
);


-- =============================================================
-- 7. 3D LIBRARY
-- =============================================================

CREATE TABLE public.three_d_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
    topic_id UUID REFERENCES topics(id),
    
    name TEXT NOT NULL,
    description TEXT,
    model_file_path TEXT NOT NULL,                  -- Supabase Storage path (.glb)
    thumbnail_url TEXT,
    
    polygon_count INT,
    file_size_bytes INT,
    
    has_explode_view BOOLEAN DEFAULT FALSE,
    has_cross_section BOOLEAN DEFAULT FALSE,
    has_layer_toggle BOOLEAN DEFAULT FALSE,
    layer_config JSONB,
    
    default_camera_position JSONB DEFAULT '{"x": 5, "y": 5, "z": 5}',
    default_camera_target JSONB DEFAULT '{"x": 0, "y": 0, "z": 0}',
    
    status content_status DEFAULT 'published',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.model_callouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID REFERENCES three_d_models(id) ON DELETE CASCADE NOT NULL,
    
    position_x FLOAT NOT NULL,
    position_y FLOAT NOT NULL,
    position_z FLOAT NOT NULL,
    
    label TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    
    camera_position JSONB,
    camera_target JSONB,
    
    topic_id UUID REFERENCES topics(id),
    linked_question_ids UUID[] DEFAULT '{}',
    
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK constraints to questions table for 3D references
ALTER TABLE questions ADD CONSTRAINT fk_questions_3d_model 
    FOREIGN KEY (three_d_model_id) REFERENCES three_d_models(id);
ALTER TABLE questions ADD CONSTRAINT fk_questions_callout 
    FOREIGN KEY (model_callout_id) REFERENCES model_callouts(id);
ALTER TABLE review_sessions ADD CONSTRAINT fk_sessions_3d_model 
    FOREIGN KEY (source_3d_model_id) REFERENCES three_d_models(id);


-- =============================================================
-- 8. AI & DOCUMENTS
-- =============================================================

CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    exam_profile_id UUID REFERENCES exam_profiles(id),
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes INT,
    page_count INT,
    status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'error')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    page_number INT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    exam_profile_id UUID REFERENCES exam_profiles(id),
    question_id UUID REFERENCES questions(id),
    messages JSONB DEFAULT '[]',
    tokens_used INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================
-- 9. MARKETPLACE
-- =============================================================

CREATE TABLE public.marketplace_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    bank_id UUID REFERENCES question_banks(id) ON DELETE CASCADE NOT NULL,
    amount_cents INT NOT NULL,
    currency TEXT DEFAULT 'PHP',
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(buyer_id, bank_id)
);

CREATE TABLE public.bank_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    bank_id UUID REFERENCES question_banks(id) ON DELETE CASCADE NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, bank_id)
);


-- =============================================================
-- 10. ANALYTICS (pre-computed for dashboard performance)
-- =============================================================

-- Study time tracking
CREATE TABLE public.study_time_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    exam_profile_id UUID REFERENCES exam_profiles(id) ON DELETE CASCADE NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('review', 'session', '3d_library', 'tutor')),
    session_id UUID REFERENCES review_sessions(id),     -- null for review mode / 3d
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    duration_ms BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily aggregated stats
CREATE TABLE public.daily_user_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    exam_profile_id UUID REFERENCES exam_profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    
    questions_attempted INT DEFAULT 0,
    questions_correct INT DEFAULT 0,
    total_study_time_ms BIGINT DEFAULT 0,
    review_mode_time_ms BIGINT DEFAULT 0,
    session_mode_time_ms BIGINT DEFAULT 0,
    three_d_time_ms BIGINT DEFAULT 0,
    sessions_completed INT DEFAULT 0,
    subjects_studied TEXT[] DEFAULT '{}',
    streak_maintained BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, exam_profile_id, date)
);

-- Subject mastery (per user, per exam profile, per subject)
CREATE TABLE public.subject_mastery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    exam_profile_id UUID REFERENCES exam_profiles(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
    
    total_attempted INT DEFAULT 0,
    total_correct INT DEFAULT 0,
    mastery_score FLOAT DEFAULT 0,                  -- 0-100 from recent 50 responses
    theta FLOAT DEFAULT 0,                          -- IRT ability estimate
    avg_response_time_ms INT DEFAULT 0,
    last_practiced_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, exam_profile_id, subject_id)
);


-- =============================================================
-- 11. MATERIALIZED VIEW — Per-Question User Performance
-- =============================================================

-- This is the backbone of "how many times have I seen this question?"
-- Refreshed after each session completes

CREATE MATERIALIZED VIEW question_user_performance AS
SELECT
    sq.question_id,
    rs.user_id,
    rs.exam_profile_id,
    q.subject_id,
    q.topic_id,
    
    COUNT(*) AS times_seen,
    COUNT(*) FILTER (WHERE sq.is_correct = true) AS times_correct,
    COUNT(*) FILTER (WHERE sq.is_correct = false) AS times_incorrect,
    COUNT(*) FILTER (WHERE sq.is_skipped = true) AS times_skipped,
    
    ROUND(
        COUNT(*) FILTER (WHERE sq.is_correct = true)::NUMERIC / 
        NULLIF(COUNT(*) FILTER (WHERE sq.is_correct IS NOT NULL), 0) * 100, 1
    ) AS accuracy_percentage,
    
    AVG(sq.response_time_ms) FILTER (WHERE sq.response_time_ms IS NOT NULL) AS avg_response_time_ms,
    MIN(sq.response_time_ms) FILTER (WHERE sq.response_time_ms IS NOT NULL) AS fastest_response_ms,
    
    (ARRAY_AGG(sq.is_correct ORDER BY sq.answered_at DESC))[1] AS last_attempt_correct,
    MAX(sq.answered_at) AS last_attempted_at

FROM session_questions sq
JOIN review_sessions rs ON sq.session_id = rs.id
JOIN questions q ON sq.question_id = q.id
WHERE sq.is_skipped = false AND sq.is_correct IS NOT NULL
GROUP BY sq.question_id, rs.user_id, rs.exam_profile_id, q.subject_id, q.topic_id;

CREATE UNIQUE INDEX idx_qup_user_question 
    ON question_user_performance(user_id, exam_profile_id, question_id);


-- =============================================================
-- 12. PGVECTOR FUNCTION (for RAG)
-- =============================================================

CREATE OR REPLACE FUNCTION match_documents(
    query_embedding VECTOR(1536),
    match_threshold FLOAT,
    match_count INT,
    filter_user_id UUID
) RETURNS TABLE (id UUID, content TEXT, similarity FLOAT) AS $$
BEGIN
    RETURN QUERY
    SELECT dc.id, dc.content,
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM document_chunks dc
    JOIN documents d ON dc.document_id = d.id
    WHERE d.user_id = filter_user_id
        AND 1 - (dc.embedding <=> query_embedding) > match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;


-- =============================================================
-- 13. ROW LEVEL SECURITY
-- =============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_mode_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE srs_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE three_d_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_callouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_mastery ENABLE ROW LEVEL SECURITY;

-- Public read tables
CREATE POLICY "Public read" ON board_exams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read" ON subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read" ON topics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read" ON three_d_models FOR SELECT TO authenticated USING (status = 'published');
CREATE POLICY "Public read" ON model_callouts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Published questions" ON questions FOR SELECT TO authenticated 
    USING (status = 'published' OR creator_id = auth.uid());

-- Own data policies
CREATE POLICY "Own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Own exam profiles" ON exam_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own review interactions" ON review_mode_interactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own templates" ON session_templates FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own sessions" ON review_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own session questions" ON session_questions FOR ALL USING (
    EXISTS (SELECT 1 FROM review_sessions WHERE id = session_questions.session_id AND user_id = auth.uid())
);
CREATE POLICY "Own SRS" ON srs_queue FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own documents" ON documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own chunks" ON document_chunks FOR SELECT USING (
    EXISTS (SELECT 1 FROM documents WHERE id = document_chunks.document_id AND user_id = auth.uid())
);
CREATE POLICY "Own conversations" ON ai_conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own purchases" ON marketplace_purchases FOR ALL USING (auth.uid() = buyer_id);
CREATE POLICY "Public ratings read" ON bank_ratings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Own ratings write" ON bank_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own study time" ON study_time_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own daily stats" ON daily_user_stats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own mastery" ON subject_mastery FOR ALL USING (auth.uid() = user_id);

-- Question banks (published = public, draft = own only)
CREATE POLICY "Banks access" ON question_banks FOR SELECT 
    USING (status = 'published' OR creator_id = auth.uid());
CREATE POLICY "Own banks write" ON question_banks FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Own banks update" ON question_banks FOR UPDATE USING (auth.uid() = creator_id);


-- =============================================================
-- 14. INDEXES
-- =============================================================

CREATE INDEX idx_exam_profiles_user ON exam_profiles(user_id);
CREATE INDEX idx_exam_profiles_active ON exam_profiles(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_subjects_board_exam ON subjects(board_exam_id);
CREATE INDEX idx_topics_subject ON topics(subject_id);
CREATE INDEX idx_questions_subject ON questions(subject_id);
CREATE INDEX idx_questions_topic ON questions(topic_id);
CREATE INDEX idx_questions_bank ON questions(bank_id);
CREATE INDEX idx_questions_status ON questions(status) WHERE status = 'published';
CREATE INDEX idx_review_interactions_user ON review_mode_interactions(user_id, exam_profile_id);
CREATE INDEX idx_review_sessions_user ON review_sessions(user_id, exam_profile_id);
CREATE INDEX idx_review_sessions_status ON review_sessions(status) WHERE status = 'in_progress';
CREATE INDEX idx_session_questions_session ON session_questions(session_id);
CREATE INDEX idx_session_questions_question ON session_questions(question_id);
CREATE INDEX idx_srs_queue_due ON srs_queue(user_id, exam_profile_id, next_review_at);
CREATE INDEX idx_document_chunks_embedding ON document_chunks 
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_study_time_user ON study_time_logs(user_id, exam_profile_id);
CREATE INDEX idx_daily_stats_user_date ON daily_user_stats(user_id, exam_profile_id, date);
CREATE INDEX idx_subject_mastery_user ON subject_mastery(user_id, exam_profile_id);
CREATE INDEX idx_3d_models_subject ON three_d_models(subject_id);
