-- SLATECAMP SEED DATA (v1.0)
-- Vertical: Architecture (LEA)
-- This file provides initial data for development and production bootstrap.

-- ────────────────────────────────────────────────────────────
-- 1. DISCIPLINES
-- ────────────────────────────────────────────────────────────
INSERT INTO disciplines (name, acronym)
VALUES ('Architecture Licensure Exam', 'LEA')
ON CONFLICT (name) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 2. TAXONOMY NODES (Level 1 - Major Exam Areas)
-- ────────────────────────────────────────────────────────────
-- We use a DO block to handle variables and avoid hardcoding IDs
DO $$ 
DECLARE 
    lea_id UUID;
BEGIN
    SELECT discipline_id INTO lea_id FROM disciplines WHERE acronym = 'LEA';

    IF lea_id IS NOT NULL THEN
        -- Area 1: Design, Planning and Construction
        IF NOT EXISTS (SELECT 1 FROM taxonomy_tree WHERE discipline_id = lea_id AND name = 'Area 1: Design') THEN
            INSERT INTO taxonomy_tree (discipline_id, level, name, subject_area, is_leaf)
            VALUES (lea_id, 1, 'Area 1: Design', 'Design', false);
        END IF;

        -- Area 2: Theory, History and Planning
        IF NOT EXISTS (SELECT 1 FROM taxonomy_tree WHERE discipline_id = lea_id AND name = 'Area 2: Theory') THEN
            INSERT INTO taxonomy_tree (discipline_id, level, name, subject_area, is_leaf)
            VALUES (lea_id, 1, 'Area 2: Theory', 'Theory', false);
        END IF;

        -- Area 3: Building Utilities and Services
        IF NOT EXISTS (SELECT 1 FROM taxonomy_tree WHERE discipline_id = lea_id AND name = 'Area 3: Utilities') THEN
            INSERT INTO taxonomy_tree (discipline_id, level, name, subject_area, is_leaf)
            VALUES (lea_id, 1, 'Area 3: Utilities', 'Utilities', false);
        END IF;

        -- Area 4: Professional Practice and Ethics
        IF NOT EXISTS (SELECT 1 FROM taxonomy_tree WHERE discipline_id = lea_id AND name = 'Area 4: Practice') THEN
            INSERT INTO taxonomy_tree (discipline_id, level, name, subject_area, is_leaf)
            VALUES (lea_id, 1, 'Area 4: Practice', 'Practice', false);
        END IF;
    END IF;
END $$;
