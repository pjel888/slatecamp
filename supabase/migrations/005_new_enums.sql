-- =============================================================
-- Migration 005: New Enums
-- Adds session_type, session_status, reference_type enums
-- Adds missing 'sequencing' value to question_type
-- =============================================================

-- Fix question_type: current has 'sequence', target uses 'sequencing'
ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'sequencing';

-- Session type enum (how a session was created)
DO $$ BEGIN
    CREATE TYPE session_type AS ENUM (
        'subject_quick',
        'custom_compiled',
        'srs_review',
        'ai_adaptive',
        'retake',
        'topic_drill',
        '3d_model_quiz',
        'weak_areas'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Session status enum (lifecycle state)
DO $$ BEGIN
    CREATE TYPE session_status AS ENUM (
        'in_progress',
        'completed',
        'abandoned',
        'paused'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Reference type enum (for question references JSONB)
DO $$ BEGIN
    CREATE TYPE reference_type AS ENUM (
        'book',
        'code',
        'standard',
        'article',
        'video',
        'website'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
