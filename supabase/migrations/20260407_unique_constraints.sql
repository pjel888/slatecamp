-- Migration: 20260407_unique_constraints.sql
-- Purpose: Add unique constraints for idempotent answer submission
-- Prevents duplicate interactions per user/session/question

-- Add unique constraint to user_interactions for idempotency
-- This backs the ON CONFLICT clause in submit_quiz_answer_v2 RPC
-- and the upsert fallback in submit-answer.ts
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_interactions_unique
ON user_interactions (user_id, session_id, question_id);
