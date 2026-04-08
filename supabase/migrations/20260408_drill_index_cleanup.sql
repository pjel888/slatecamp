-- Drill feature: index cleanup and additions
-- See: .ai/plans/drill-optimization-implementation-plan-2026-04-08.md Section 03

-- DB-02: Remove duplicate unique indexes on user_interactions
-- Keep idx_user_interactions_unique as the canonical index
ALTER TABLE user_interactions DROP CONSTRAINT IF EXISTS uq_user_session_question;
DROP INDEX IF EXISTS user_interactions_upsert_idx;

-- DB-03: Remove duplicate index on quiz_sessions (user_id, status)
-- Keep idx_quiz_sessions_user_id_status
DROP INDEX IF EXISTS idx_quiz_sessions_user_status;

-- DB-05: Add composite index for Pro user question history lookups in review mode
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_interactions_user_question
ON user_interactions (user_id, question_id);

-- DB-04: Remove duplicate public-role RLS policies (keep authenticated-role policies)
DROP POLICY IF EXISTS "Users can read own quiz sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Users can insert own quiz sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Users can update own quiz sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Users can read own stats" ON user_global_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON user_global_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON user_global_stats;
DROP POLICY IF EXISTS "Users can read own interactions" ON user_interactions;
DROP POLICY IF EXISTS "Users can insert own interactions" ON user_interactions;
DROP POLICY IF EXISTS "Users can update own interactions" ON user_interactions;
