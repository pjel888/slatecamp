-- =============================================================
-- Migration 010: 3D Library
-- Creates three_d_models, model_callouts
-- Adds FK constraints on questions and review_sessions
-- =============================================================

-- 3D Models
CREATE TABLE IF NOT EXISTS public.three_d_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
    topic_id UUID REFERENCES topics(id),

    name TEXT NOT NULL,
    description TEXT,
    model_file_path TEXT NOT NULL,
    thumbnail_url TEXT,

    polygon_count INT,
    file_size_bytes INT,

    has_explode_view BOOLEAN DEFAULT FALSE,
    has_cross_section BOOLEAN DEFAULT FALSE,
    has_layer_toggle BOOLEAN DEFAULT FALSE,
    layer_config JSONB,

    default_camera_position JSONB DEFAULT '{"x": 5, "y": 5, "z": 5}',
    default_camera_target JSONB DEFAULT '{"x": 0, "y": 0, "z": 0}',

    status content_status DEFAULT 'published',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Model Callouts: interactive points in 3D space
CREATE TABLE IF NOT EXISTS public.model_callouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID REFERENCES three_d_models(id) ON DELETE CASCADE NOT NULL,

    position_x FLOAT NOT NULL,
    position_y FLOAT NOT NULL,
    position_z FLOAT NOT NULL,

    label TEXT NOT NULL,
    description TEXT,
    image_url TEXT,

    camera_position JSONB,
    camera_target JSONB,

    topic_id UUID REFERENCES topics(id),
    linked_question_ids UUID[] DEFAULT '{}',

    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- FK CONSTRAINTS on existing tables for 3D references
-- =============================================================

DO $$ BEGIN
    ALTER TABLE questions ADD CONSTRAINT fk_questions_3d_model
        FOREIGN KEY (three_d_model_id) REFERENCES three_d_models(id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE questions ADD CONSTRAINT fk_questions_callout
        FOREIGN KEY (model_callout_id) REFERENCES model_callouts(id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE review_sessions ADD CONSTRAINT fk_sessions_3d_model
        FOREIGN KEY (source_3d_model_id) REFERENCES three_d_models(id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

ALTER TABLE three_d_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_callouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON three_d_models
    FOR SELECT TO authenticated USING (status = 'published');

CREATE POLICY "Public read" ON model_callouts
    FOR SELECT TO authenticated USING (true);

-- =============================================================
-- INDEXES
-- =============================================================

CREATE INDEX idx_3d_models_subject ON three_d_models(subject_id);
