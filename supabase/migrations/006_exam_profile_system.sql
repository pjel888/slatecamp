-- =============================================================
-- Migration 006: Exam Profile System
-- Creates board_exams, exam_profiles, subjects, topics
-- This is the foundation for multi-profession support
-- =============================================================

-- Board Exams: catalog of supported exams
CREATE TABLE IF NOT EXISTS public.board_exams (
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
    has_content BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exam Profiles: user's board exam identities (scopes everything)
CREATE TABLE IF NOT EXISTS public.exam_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    board_exam_id UUID REFERENCES board_exams(id) NOT NULL,
    target_exam_date DATE,
    study_hours_per_day FLOAT DEFAULT 2,
    is_active BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    daily_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects: belong to a board exam
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    board_exam_id UUID REFERENCES board_exams(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    short_name TEXT,
    slug TEXT NOT NULL,
    description TEXT,
    exam_weight_percentage FLOAT DEFAULT 0,
    estimated_question_count INT,
    color TEXT,
    icon_name TEXT,
    has_3d_workspace BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(board_exam_id, slug)
);

-- Topics: subdivisions within a subject
CREATE TABLE IF NOT EXISTS public.topics (
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
-- ROW LEVEL SECURITY
-- =============================================================

ALTER TABLE board_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON board_exams
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Own exam profiles" ON exam_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public read" ON subjects
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Public read" ON topics
    FOR SELECT TO authenticated USING (true);

-- =============================================================
-- INDEXES
-- =============================================================

CREATE INDEX idx_exam_profiles_user ON exam_profiles(user_id);
CREATE INDEX idx_exam_profiles_active ON exam_profiles(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_subjects_board_exam ON subjects(board_exam_id);
CREATE INDEX idx_topics_subject ON topics(subject_id);
