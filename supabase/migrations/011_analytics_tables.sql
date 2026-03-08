-- =============================================================
-- Migration 011: Analytics Tables
-- Creates study_time_logs, subject_mastery
-- Adds exam_profile_id to existing tables (srs_queue, documents, etc.)
-- Upgrades daily_user_stats with new columns
-- =============================================================

-- Study time tracking
CREATE TABLE IF NOT EXISTS public.study_time_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    exam_profile_id UUID REFERENCES exam_profiles(id) ON DELETE CASCADE NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('review', 'session', '3d_library', 'tutor')),
    session_id UUID REFERENCES review_sessions(id),
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    duration_ms BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subject mastery (replaces domain_mastery for new exam profile system)
CREATE TABLE IF NOT EXISTS public.subject_mastery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    exam_profile_id UUID REFERENCES exam_profiles(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
    total_attempted INT DEFAULT 0,
    total_correct INT DEFAULT 0,
    mastery_score FLOAT DEFAULT 0,
    theta FLOAT DEFAULT 0,
    avg_response_time_ms INT DEFAULT 0,
    last_practiced_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, exam_profile_id, subject_id)
);

-- =============================================================
-- ADD exam_profile_id TO EXISTING TABLES
-- (nullable for backward compat with existing data)
-- =============================================================

ALTER TABLE public.srs_queue
    ADD COLUMN IF NOT EXISTS exam_profile_id UUID REFERENCES exam_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.documents
    ADD COLUMN IF NOT EXISTS exam_profile_id UUID REFERENCES exam_profiles(id);

ALTER TABLE public.ai_conversations
    ADD COLUMN IF NOT EXISTS exam_profile_id UUID REFERENCES exam_profiles(id);

-- Upgrade daily_user_stats with exam_profile_id and new columns
ALTER TABLE public.daily_user_stats
    ADD COLUMN IF NOT EXISTS exam_profile_id UUID REFERENCES exam_profiles(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS review_mode_time_ms BIGINT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS session_mode_time_ms BIGINT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS three_d_time_ms BIGINT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS sessions_completed INT DEFAULT 0;

-- Rename domains_studied → subjects_studied for consistency
DO $$ BEGIN
    ALTER TABLE public.daily_user_stats RENAME COLUMN domains_studied TO subjects_studied;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

-- Widen total_study_time_ms from INT to BIGINT for large values
ALTER TABLE public.daily_user_stats ALTER COLUMN total_study_time_ms TYPE BIGINT;

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

ALTER TABLE study_time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own study time" ON study_time_logs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Own mastery" ON subject_mastery
    FOR ALL USING (auth.uid() = user_id);

-- =============================================================
-- INDEXES
-- =============================================================

CREATE INDEX idx_study_time_user ON study_time_logs(user_id, exam_profile_id);
CREATE INDEX idx_subject_mastery_user ON subject_mastery(user_id, exam_profile_id);

-- New composite index for daily stats with exam_profile_id
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_profile_date
    ON daily_user_stats(user_id, exam_profile_id, date);

-- New composite index for SRS with exam_profile_id
CREATE INDEX IF NOT EXISTS idx_srs_queue_profile
    ON srs_queue(user_id, exam_profile_id, next_review_at);
