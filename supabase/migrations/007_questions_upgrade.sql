-- =============================================================
-- Migration 007: Questions Table Upgrade
-- Adds rich content columns, 3D references, IRT params,
-- global stats, and board_exam_id to question_banks
-- =============================================================

-- New columns on questions per DATABASE_SCHEMA.sql
ALTER TABLE public.questions
    ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES subjects(id),
    ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES topics(id),
    ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS prompt_image_url TEXT,
    ADD COLUMN IF NOT EXISTS explanation_image_url TEXT,
    ADD COLUMN IF NOT EXISTS "references" JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS fun_facts TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS mnemonics TEXT,
    ADD COLUMN IF NOT EXISTS related_topic_ids UUID[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS three_d_model_id UUID,
    ADD COLUMN IF NOT EXISTS model_callout_id UUID,
    ADD COLUMN IF NOT EXISTS global_accuracy_percentage FLOAT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS global_avg_response_time_ms INT DEFAULT 0;

-- Rename legacy global stat columns for consistency with target schema
-- (times_answered → global_times_answered, times_correct → global_times_correct)
DO $$ BEGIN
    ALTER TABLE public.questions RENAME COLUMN times_answered TO global_times_answered;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE public.questions RENAME COLUMN times_correct TO global_times_correct;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

-- Ensure choices has a default value
UPDATE questions SET choices = '[]' WHERE choices IS NULL;
ALTER TABLE public.questions ALTER COLUMN choices SET DEFAULT '[]';

-- Add board_exam_id to question_banks for new hierarchy
ALTER TABLE public.question_banks
    ADD COLUMN IF NOT EXISTS board_exam_id UUID REFERENCES board_exams(id);

-- =============================================================
-- NEW INDEXES
-- =============================================================

CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status) WHERE status = 'published';
