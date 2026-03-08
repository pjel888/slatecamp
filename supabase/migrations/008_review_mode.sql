-- =============================================================
-- Migration 008: Review Mode Interactions
-- Lightweight tracking for "doomscroll" Review Mode
-- Data is NEVER shown to the user — internal analytics + SRS seeding only
-- =============================================================

CREATE TABLE IF NOT EXISTS public.review_mode_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    exam_profile_id UUID REFERENCES exam_profiles(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
    initial_tap_correct BOOLEAN,
    time_on_question_ms INT,
    viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

ALTER TABLE review_mode_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own review interactions" ON review_mode_interactions
    FOR ALL USING (auth.uid() = user_id);

-- =============================================================
-- INDEXES
-- =============================================================

CREATE INDEX idx_review_interactions_user
    ON review_mode_interactions(user_id, exam_profile_id);
