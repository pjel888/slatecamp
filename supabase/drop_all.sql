-- =============================================================
-- DROP ALL — Project Cerebro
-- Run this in Supabase SQL Editor to wipe public schema tables
-- and types. Then run DATABASE_SCHEMA.sql and seed.sql.
-- =============================================================

-- Drop tables in reverse dependency order (children first)
DROP TABLE IF EXISTS public.readiness_score_snapshots CASCADE;
DROP TABLE IF EXISTS public.session_questions CASCADE;
DROP TABLE IF EXISTS public.review_sessions CASCADE;
DROP TABLE IF EXISTS public.session_templates CASCADE;
DROP TABLE IF EXISTS public.srs_queue CASCADE;
DROP TABLE IF EXISTS public.subject_mastery CASCADE;
DROP TABLE IF EXISTS public.daily_user_stats CASCADE;
DROP TABLE IF EXISTS public.study_time_logs CASCADE;
DROP TABLE IF EXISTS public.bank_ratings CASCADE;
DROP TABLE IF EXISTS public.marketplace_purchases CASCADE;
DROP TABLE IF EXISTS public.document_chunks CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.ai_conversations CASCADE;
DROP TABLE IF EXISTS public.model_callouts CASCADE;
DROP TABLE IF EXISTS public.three_d_models CASCADE;
DROP TABLE IF EXISTS public.review_mode_interactions CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.question_banks CASCADE;
DROP TABLE IF EXISTS public.topics CASCADE;
DROP TABLE IF EXISTS public.subjects CASCADE;
DROP TABLE IF EXISTS public.exam_profiles CASCADE;
DROP TABLE IF EXISTS public.board_exams CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop custom types (order can matter if they reference each other)
DROP TYPE IF EXISTS public.reference_type CASCADE;
DROP TYPE IF EXISTS public.session_status CASCADE;
DROP TYPE IF EXISTS public.session_type CASCADE;
DROP TYPE IF EXISTS public.content_status CASCADE;
DROP TYPE IF EXISTS public.difficulty_level CASCADE;
DROP TYPE IF EXISTS public.question_type CASCADE;
DROP TYPE IF EXISTS public.user_tier CASCADE;
