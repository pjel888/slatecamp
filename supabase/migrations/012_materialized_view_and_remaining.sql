-- =============================================================
-- Migration 012: Materialized View + Remaining Policies
-- Creates question_user_performance materialized view
-- Adds preferred_theme CHECK constraint to profiles
-- Adds broader question access policy
-- =============================================================

-- =============================================================
-- MATERIALIZED VIEW: Per-Question User Performance
-- Backbone of "how many times have I seen this question?"
-- Refreshed after each session completes:
--   REFRESH MATERIALIZED VIEW CONCURRENTLY question_user_performance;
-- =============================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS question_user_performance AS
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

-- Unique index enables REFRESH MATERIALIZED VIEW CONCURRENTLY
CREATE UNIQUE INDEX IF NOT EXISTS idx_qup_user_question
    ON question_user_performance(user_id, exam_profile_id, question_id);

-- =============================================================
-- PROFILES: Add CHECK constraint for preferred_theme
-- =============================================================

DO $$ BEGIN
    ALTER TABLE profiles ADD CONSTRAINT profiles_theme_check
        CHECK (preferred_theme IN ('light', 'dark', 'system'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================
-- ADDITIONAL RLS POLICY: Direct access to published questions
-- (supplements existing bank-based access policy)
-- =============================================================

DO $$ BEGIN
    CREATE POLICY "Published questions direct" ON questions
        FOR SELECT TO authenticated
        USING (status = 'published' OR creator_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================
-- NOTE: After applying all migrations, regenerate Supabase types:
-- npx supabase gen types typescript --project-id $PROJECT_ID > src/types/supabase.ts
-- =============================================================
