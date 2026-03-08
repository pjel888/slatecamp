-- =============================================================
-- Migration 009: Sessions System
-- Creates session_templates, review_sessions, session_questions
-- This replaces the legacy test_sessions + user_responses + review_session_configs
-- Legacy tables are kept for backward compatibility (no drops)
-- =============================================================

-- Session Templates: saved configurations for reuse
CREATE TABLE IF NOT EXISTS public.session_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    exam_profile_id UUID REFERENCES exam_profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    config JSONB NOT NULL,
    -- config structure: {
    --   "subjects": [{"subject_id": "uuid", "question_count": 25, "difficulty": "mixed"}],
    --   "specific_question_ids": [],
    --   "timer_mode": "none" | "per_question" | "total",
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

-- Review Sessions: every quiz/test attempt
CREATE TABLE IF NOT EXISTS public.review_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    exam_profile_id UUID REFERENCES exam_profiles(id) ON DELETE CASCADE NOT NULL,

    -- Type & origin
    session_type session_type NOT NULL,
    template_id UUID REFERENCES session_templates(id),
    retake_of_session_id UUID REFERENCES review_sessions(id),
    source_subject_id UUID REFERENCES subjects(id),
    source_topic_id UUID REFERENCES topics(id),
    source_3d_model_id UUID,

    -- Config snapshot (frozen at creation)
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
    -- structure: [{"subject_id":"uuid","subject_name":"Building Tech",
    --              "total":25,"correct":20,"percentage":80.0,"avg_time_ms":12000}]

    -- State
    status session_status DEFAULT 'in_progress',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    paused_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session Questions: ordered questions + responses within a session
CREATE TABLE IF NOT EXISTS public.session_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES review_sessions(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,

    -- Position
    question_number INT NOT NULL,

    -- Context (denormalized for fast analytics)
    subject_id UUID REFERENCES subjects(id),
    topic_id UUID REFERENCES topics(id),

    -- Response
    selected_answer TEXT,
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
-- ROW LEVEL SECURITY
-- =============================================================

ALTER TABLE session_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own templates" ON session_templates
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Own sessions" ON review_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Own session questions" ON session_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM review_sessions
            WHERE id = session_questions.session_id
            AND user_id = auth.uid()
        )
    );

-- =============================================================
-- INDEXES
-- =============================================================

CREATE INDEX idx_review_sessions_user ON review_sessions(user_id, exam_profile_id);
CREATE INDEX idx_review_sessions_status ON review_sessions(status) WHERE status = 'in_progress';
CREATE INDEX idx_session_questions_session ON session_questions(session_id);
CREATE INDEX idx_session_questions_question ON session_questions(question_id);
