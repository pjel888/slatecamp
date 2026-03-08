-- =============================================================
-- SEED STANDALONE — Schema + seed in one script
-- Run this in Supabase SQL Editor when tables don't exist yet.
-- Creates required tables (if missing) then inserts seed data.
-- =============================================================

SET search_path = public;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Enums (ignore if already exist)
DO $$ BEGIN
  CREATE TYPE user_tier AS ENUM ('free', 'pro', 'max');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE question_type AS ENUM ('mcq', 'true_false', 'identification', 'matching', 'sequencing', 'essay');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard', 'expert');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived', 'flagged');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Profiles (required for question_banks/questions FKs; Supabase auth.users exists)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    tier user_tier DEFAULT 'free' NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    ai_tokens_used INT DEFAULT 0,
    ai_tokens_limit INT DEFAULT 0,
    preferred_theme TEXT DEFAULT 'system' CHECK (preferred_theme IN ('light', 'dark', 'system')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Board exams
CREATE TABLE IF NOT EXISTS public.board_exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profession TEXT NOT NULL,
    specialization TEXT,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    country TEXT DEFAULT 'PH',
    description TEXT,
    total_subjects INT,
    passing_score_percentage FLOAT,
    icon_name TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    has_content BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    board_exam_id UUID REFERENCES public.board_exams(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    short_name TEXT,
    slug TEXT NOT NULL,
    description TEXT,
    exam_weight_percentage FLOAT DEFAULT 0,
    estimated_question_count INT,
    color TEXT,
    icon_name TEXT,
    has_3d_workspace BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(board_exam_id, slug)
);

-- Topics
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    parent_topic_id UUID REFERENCES public.topics(id),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(subject_id, slug)
);

-- Question banks
CREATE TABLE IF NOT EXISTS public.question_banks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    board_exam_id UUID REFERENCES public.board_exams(id),
    title TEXT NOT NULL,
    description TEXT,
    is_official BOOLEAN DEFAULT FALSE,
    is_marketplace BOOLEAN DEFAULT FALSE,
    price_cents INT DEFAULT 0,
    currency TEXT DEFAULT 'PHP',
    status content_status DEFAULT 'draft',
    question_count INT DEFAULT 0,
    average_rating FLOAT DEFAULT 0,
    total_ratings INT DEFAULT 0,
    total_purchases INT DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bank_id UUID REFERENCES public.question_banks(id) ON DELETE SET NULL,
    subject_id UUID REFERENCES public.subjects(id) NOT NULL,
    topic_id UUID REFERENCES public.topics(id),
    creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_official BOOLEAN DEFAULT FALSE,
    question_type question_type DEFAULT 'mcq',
    prompt TEXT NOT NULL,
    prompt_image_url TEXT,
    choices JSONB NOT NULL DEFAULT '[]',
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    explanation_image_url TEXT,
    "references" JSONB DEFAULT '[]',
    fun_facts TEXT[] DEFAULT '{}',
    mnemonics TEXT,
    related_topic_ids UUID[] DEFAULT '{}',
    difficulty difficulty_level DEFAULT 'medium',
    difficulty_rating FLOAT DEFAULT 0.5,
    discrimination_rating FLOAT DEFAULT 1.0,
    has_3d_component BOOLEAN DEFAULT FALSE,
    three_d_model_id UUID,
    model_callout_id UUID,
    image_urls TEXT[] DEFAULT '{}',
    global_times_answered INT DEFAULT 0,
    global_times_correct INT DEFAULT 0,
    global_accuracy_percentage FLOAT DEFAULT 0,
    global_avg_response_time_ms INT DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    status content_status DEFAULT 'published',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- SEED DATA (same as seed.sql)
-- =============================================================

-- 1. BOARD EXAMS
INSERT INTO public.board_exams (id, profession, name, short_name, country, description, total_subjects, passing_score_percentage, icon_name, is_active, has_content, sort_order) VALUES
('be000000-0000-0000-0000-000000000001', 'Architecture', 'Architecture Licensure Exam', 'ALE', 'PH', 'The Philippine Architecture Licensure Examination administered by the Professional Regulation Commission (PRC). Covers 10 subjects spanning history, design, technology, structures, utilities, laws, and professional practice.', 10, 70.0, 'building-2', true, true, 1),
('be000000-0000-0000-0000-000000000002', 'Medicine', 'Physician Licensure Exam', 'PLE', 'PH', 'Philippine Physician Licensure Examination covering basic and clinical sciences.', 12, 75.0, 'stethoscope', true, false, 2),
('be000000-0000-0000-0000-000000000003', 'Civil Engineering', 'Civil Engineering Licensure Exam', 'CE', 'PH', 'Philippine Civil Engineering Licensure Examination.', 6, 70.0, 'hard-hat', true, false, 3),
('be000000-0000-0000-0000-000000000004', 'Mechanical Engineering', 'Mechanical Engineering Licensure Exam', 'ME', 'PH', 'Philippine Mechanical Engineering Licensure Examination.', 6, 70.0, 'cog', true, false, 4),
('be000000-0000-0000-0000-000000000005', 'Electrical Engineering', 'Electrical Engineering Licensure Exam', 'EE', 'PH', 'Philippine Electrical Engineering Licensure Examination.', 6, 70.0, 'zap', true, false, 5),
('be000000-0000-0000-0000-000000000006', 'Law', 'Bar Examination', 'BAR', 'PH', 'Philippine Bar Examination for aspiring lawyers.', 8, 75.0, 'gavel', true, false, 6)
ON CONFLICT (id) DO NOTHING;

-- 2. SUBJECTS (ALE — 10 subjects)
INSERT INTO public.subjects (id, board_exam_id, name, short_name, slug, description, exam_weight_percentage, icon_name, color, has_3d_workspace, sort_order) VALUES
('5b000000-0000-0000-0000-000000000001', 'be000000-0000-0000-0000-000000000001', 'History of Architecture', 'History', 'history-of-architecture', 'Architectural history from ancient civilizations to contemporary movements, including Philippine architecture.', 10.0, 'landmark', '#8B7355', false, 1),
('5b000000-0000-0000-0000-000000000002', 'be000000-0000-0000-0000-000000000001', 'Theory of Architecture', 'Theory', 'theory-of-architecture', 'Design theory, architectural principles, space and form, aesthetics, and environmental psychology.', 10.0, 'lightbulb', '#9B8EA8', false, 2),
('5b000000-0000-0000-0000-000000000003', 'be000000-0000-0000-0000-000000000001', 'Architectural Design', 'Design', 'architectural-design', 'Design process, space planning, programming, design development, and presentation.', 10.0, 'pencil-ruler', '#7B8FA3', false, 3),
('5b000000-0000-0000-0000-000000000004', 'be000000-0000-0000-0000-000000000001', 'Building Technology', 'Bldg Tech', 'building-technology', 'Construction materials, methods, systems, and detailing. Concrete, steel, wood, masonry, and finishes.', 10.0, 'hammer', '#A0785A', true, 4),
('5b000000-0000-0000-0000-000000000005', 'be000000-0000-0000-0000-000000000001', 'Structural Engineering', 'Structures', 'structural-engineering', 'Structural analysis, design of reinforced concrete, steel, and timber structures, and foundation engineering.', 10.0, 'hard-hat', '#6B8E7B', true, 5),
('5b000000-0000-0000-0000-000000000006', 'be000000-0000-0000-0000-000000000001', 'Building Utilities', 'Utilities', 'building-utilities', 'Mechanical, electrical, plumbing, sanitary, fire protection, HVAC, and acoustics systems.', 10.0, 'plug', '#5A8FA0', true, 6),
('5b000000-0000-0000-0000-000000000007', 'be000000-0000-0000-0000-000000000001', 'Professional Practice', 'Pro Practice', 'professional-practice', 'Contracts, ethics, project management, construction administration, and business of architecture.', 10.0, 'briefcase', '#7B7B8E', false, 7),
('5b000000-0000-0000-0000-000000000008', 'be000000-0000-0000-0000-000000000001', 'Architectural Laws', 'Laws', 'architectural-laws', 'BP 344 (Accessibility), PD 1096 (National Building Code), RA 9266 (Architecture Act), and other legislation.', 10.0, 'scale', '#8E6B6B', false, 8),
('5b000000-0000-0000-0000-000000000009', 'be000000-0000-0000-0000-000000000001', 'Site Planning', 'Site Plan', 'site-planning', 'Site analysis, grading, drainage, landscape architecture, environmental design, and sustainable sites.', 10.0, 'map', '#6B8E6B', false, 9),
('5b000000-0000-0000-0000-00000000000a', 'be000000-0000-0000-0000-000000000001', 'Tropical Design', 'Tropical', 'tropical-design', 'Climate-responsive design for tropical conditions, passive cooling, natural ventilation, solar control, and tropical materials.', 10.0, 'sun', '#C4944A', false, 10)
ON CONFLICT (id) DO NOTHING;

-- 3. TOPICS (3-7 per ALE subject)
INSERT INTO public.topics (subject_id, name, slug, description, sort_order) VALUES
('5b000000-0000-0000-0000-000000000001', 'Ancient Architecture', 'ancient-architecture', 'Egyptian, Mesopotamian, and early civilizations', 1),
('5b000000-0000-0000-0000-000000000001', 'Classical Architecture', 'classical-architecture', 'Greek and Roman architecture, orders, temples, public buildings', 2),
('5b000000-0000-0000-000000000001', 'Medieval Architecture', 'medieval-architecture', 'Romanesque, Gothic, and Byzantine architecture', 3),
('5b000000-0000-0000-000000000001', 'Renaissance & Baroque', 'renaissance-baroque', 'Renaissance, Mannerism, Baroque, and Rococo periods', 4),
('5b000000-0000-0000-000000000001', 'Modern Architecture', 'modern-architecture', 'Art Nouveau, Bauhaus, International Style, Brutalism, Postmodernism', 5),
('5b000000-0000-0000-000000000001', 'Contemporary Architecture', 'contemporary-architecture', 'Deconstructivism, parametricism, sustainable design, and current trends', 6),
('5b000000-0000-0000-0000-000000000001', 'Philippine Architecture', 'philippine-architecture', 'Pre-colonial to contemporary Filipino architecture and national artists', 7)
ON CONFLICT (subject_id, slug) DO NOTHING;

INSERT INTO public.topics (subject_id, name, slug, description, sort_order) VALUES
('5b000000-0000-0000-0000-000000000002', 'Design Principles & Elements', 'design-principles-elements', 'Balance, rhythm, proportion, scale, unity, emphasis, and contrast', 1),
('5b000000-0000-0000-0000-000000000002', 'Architectural Criticism', 'architectural-criticism', 'Methods of evaluating and analyzing architectural works', 2),
('5b000000-0000-0000-000000000002', 'Space & Form Theory', 'space-form-theory', 'Spatial organization, form generation, and spatial relationships', 3),
('5b000000-0000-0000-000000000002', 'Aesthetics & Proportion', 'aesthetics-proportion', 'Golden ratio, modular systems, visual perception, and beauty in design', 4),
('5b000000-0000-0000-000000000002', 'Environmental Psychology', 'environmental-psychology', 'Human behavior in built environments, wayfinding, and user experience', 5)
ON CONFLICT (subject_id, slug) DO NOTHING;

INSERT INTO public.topics (subject_id, name, slug, description, sort_order) VALUES
('5b000000-0000-0000-0000-000000000003', 'Design Process & Programming', 'design-process-programming', 'Architectural programming, needs analysis, and design methodology', 1),
('5b000000-0000-0000-0000-000000000003', 'Space Planning', 'space-planning', 'Functional analysis, adjacency requirements, circulation, and zoning', 2),
('5b000000-0000-0000-0000-000000000003', 'Design Development', 'design-development', 'Schematic design through construction documents', 3),
('5b000000-0000-0000-0000-000000000003', 'Architectural Graphics', 'architectural-graphics', 'Drawing conventions, dimensioning, notation, and representation', 4),
('5b000000-0000-0000-0000-000000000003', 'Building Typologies', 'building-typologies', 'Residential, commercial, institutional, and mixed-use design standards', 5)
ON CONFLICT (subject_id, slug) DO NOTHING;

INSERT INTO public.topics (subject_id, name, slug, description, sort_order) VALUES
('5b000000-0000-0000-0000-000000000004', 'Concrete Technology', 'concrete-technology', 'Cement types, mix design, placement, curing, and precast systems', 1),
('5b000000-0000-0000-0000-000000000004', 'Steel & Metals', 'steel-metals', 'Structural steel, metal fabrication, connections, and corrosion protection', 2),
('5b000000-0000-0000-0000-000000000004', 'Wood & Timber', 'wood-timber', 'Wood properties, grading, joinery, engineered wood products', 3),
('5b000000-0000-0000-000000000004', 'Masonry', 'masonry', 'Brick, block, stone construction, mortar types, and reinforced masonry', 4),
('5b000000-0000-0000-0000-000000000004', 'Finishes & Coatings', 'finishes-coatings', 'Paint systems, waterproofing, flooring, wall finishes, and ceiling systems', 5),
('5b000000-0000-0000-0000-000000000004', 'Construction Methods', 'construction-methods', 'Formwork, scaffolding, excavation, and construction sequences', 6)
ON CONFLICT (subject_id, slug) DO NOTHING;

INSERT INTO public.topics (subject_id, name, slug, description, sort_order) VALUES
('5b000000-0000-0000-0000-000000000005', 'Structural Analysis', 'structural-analysis', 'Statics, mechanics of materials, loads, and structural behavior', 1),
('5b000000-0000-0000-0000-000000000005', 'Reinforced Concrete Design', 'reinforced-concrete-design', 'RC beam, column, slab, and footing design per NSCP', 2),
('5b000000-0000-0000-0000-000000000005', 'Steel Design', 'steel-design', 'Steel member design, connections, and lateral systems', 3),
('5b000000-0000-0000-0000-000000000005', 'Timber Design', 'timber-design', 'Wood structural design, trusses, and connections', 4),
('5b000000-0000-0000-0000-000000000005', 'Foundation Engineering', 'foundation-engineering', 'Soil mechanics, shallow and deep foundations, retaining walls', 5)
ON CONFLICT (subject_id, slug) DO NOTHING;

INSERT INTO public.topics (subject_id, name, slug, description, sort_order) VALUES
('5b000000-0000-0000-0000-000000000006', 'Plumbing & Sanitary', 'plumbing-sanitary', 'Water supply, drainage, fixtures, and sanitary systems', 1),
('5b000000-0000-0000-0000-000000000006', 'Electrical Systems', 'electrical-systems', 'Power distribution, lighting design, wiring methods, and load calculations', 2),
('5b000000-0000-0000-0000-000000000006', 'HVAC', 'hvac', 'Heating, ventilation, air conditioning, and refrigeration systems', 3),
('5b000000-0000-0000-0000-000000000006', 'Fire Protection', 'fire-protection', 'Fire detection, suppression, egress, and fire-rated assemblies', 4),
('5b000000-0000-0000-0000-000000000006', 'Acoustics', 'acoustics', 'Sound control, noise reduction, room acoustics, and sound insulation', 5)
ON CONFLICT (subject_id, slug) DO NOTHING;

INSERT INTO public.topics (subject_id, name, slug, description, sort_order) VALUES
('5b000000-0000-0000-0000-000000000007', 'Contracts & Documents', 'contracts-documents', 'AIA documents, owner-architect agreements, and contract administration', 1),
('5b000000-0000-0000-0000-000000000007', 'Ethics & Professional Conduct', 'ethics-professional-conduct', 'Code of ethics, professional responsibilities, and liability', 2),
('5b000000-0000-0000-0000-000000000007', 'Project Management', 'project-management', 'Scheduling, budgeting, team management, and project delivery methods', 3),
('5b000000-0000-0000-0000-000000000007', 'Business of Architecture', 'business-of-architecture', 'Firm management, marketing, fees, and financial management', 4),
('5b000000-0000-0000-0000-000000000007', 'Construction Administration', 'construction-administration', 'Shop drawings, RFIs, change orders, site observation, and closeout', 5)
ON CONFLICT (subject_id, slug) DO NOTHING;

INSERT INTO public.topics (subject_id, name, slug, description, sort_order) VALUES
('5b000000-0000-0000-0000-000000000008', 'BP 344 — Accessibility Law', 'bp-344-accessibility', 'Accessibility requirements for persons with disabilities', 1),
('5b000000-0000-0000-0000-000000000008', 'PD 1096 — National Building Code', 'pd-1096-nbc', 'Building permits, occupancy classifications, and code compliance', 2),
('5b000000-0000-0000-0000-000000000008', 'RA 9266 — Architecture Act', 'ra-9266-architecture-act', 'Licensure requirements, CPD, scope of practice, and penalties', 3),
('5b000000-0000-0000-0000-000000000008', 'Fire Code of the Philippines', 'fire-code', 'Fire safety requirements, occupancy hazards, and fire protection', 4),
('5b000000-0000-0000-0000-000000000008', 'Zoning & Land Use', 'zoning-land-use', 'Zoning regulations, land use classifications, and development controls', 5)
ON CONFLICT (subject_id, slug) DO NOTHING;

INSERT INTO public.topics (subject_id, name, slug, description, sort_order) VALUES
('5b000000-0000-0000-0000-000000000009', 'Site Analysis', 'site-analysis', 'Topography, climate, soil, vegetation, and context evaluation', 1),
('5b000000-0000-0000-0000-000000000009', 'Grading & Drainage', 'grading-drainage', 'Earthwork, cut and fill, stormwater management, and erosion control', 2),
('5b000000-0000-0000-0000-000000000009', 'Landscape Architecture', 'landscape-architecture', 'Planting design, hardscape, water features, and outdoor spaces', 3),
('5b000000-0000-0000-0000-000000000009', 'Environmental Design', 'environmental-design', 'Sustainable site strategies, green infrastructure, and ecology', 4),
('5b000000-0000-0000-0000-000000000009', 'Circulation & Parking', 'circulation-parking', 'Vehicular and pedestrian circulation, parking design, and accessibility', 5)
ON CONFLICT (subject_id, slug) DO NOTHING;

INSERT INTO public.topics (subject_id, name, slug, description, sort_order) VALUES
('5b000000-0000-0000-0000-00000000000a', 'Climate-Responsive Design', 'climate-responsive-design', 'Tropical climate analysis, thermal comfort, and bioclimatic design', 1),
('5b000000-0000-0000-0000-00000000000a', 'Passive Cooling Strategies', 'passive-cooling', 'Cross ventilation, stack effect, evaporative cooling, and earth sheltering', 2),
('5b000000-0000-0000-0000-00000000000a', 'Natural Ventilation', 'natural-ventilation', 'Wind-driven and buoyancy-driven ventilation design', 3),
('5b000000-0000-0000-0000-00000000000a', 'Solar Control & Shading', 'solar-control-shading', 'Sun path analysis, brise-soleil, louvers, overhangs, and glazing', 4),
('5b000000-0000-0000-0000-00000000000a', 'Tropical Materials & Construction', 'tropical-materials', 'Materials suited for high humidity, rainfall, and tropical conditions', 5)
ON CONFLICT (subject_id, slug) DO NOTHING;

-- 4. QUESTION BANK
INSERT INTO public.question_banks (id, title, description, board_exam_id, is_official, status, question_count)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'ALE Architecture Fundamentals',
    'Official starter pack covering core architecture board exam topics.',
    'be000000-0000-0000-0000-000000000001',
    true,
    'published',
    5
) ON CONFLICT (id) DO UPDATE SET
    board_exam_id = EXCLUDED.board_exam_id,
    question_count = EXCLUDED.question_count;

-- 5. SAMPLE QUESTIONS
INSERT INTO public.questions (
    bank_id, subject_id, topic_id,
    question_type, prompt, choices, correct_answer,
    explanation, is_official, difficulty, tags,
    fun_facts, "references"
) VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    '5b000000-0000-0000-0000-000000000001',
    (SELECT id FROM public.topics WHERE slug = 'classical-architecture' AND subject_id = '5b000000-0000-0000-0000-000000000001'),
    'mcq',
    'Which architectural order is characterized by its scroll-shaped capital, known as a volute?',
    '[{"id":"a","text":"Doric","image_url":null,"is_correct":false},{"id":"b","text":"Ionic","image_url":null,"is_correct":true},{"id":"c","text":"Corinthian","image_url":null,"is_correct":false},{"id":"d","text":"Tuscan","image_url":null,"is_correct":false}]',
    'b',
    'The Ionic order is distinguished by its scroll-shaped capitals called volutes. The Doric order has a plain, cushion-like capital, while the Corinthian features ornate acanthus leaf decoration. The Tuscan is a simplified Roman adaptation of the Doric.',
    true,
    'easy',
    ARRAY['greek-orders', 'classical-architecture'],
    ARRAY['The volute of the Ionic capital may represent a nautilus shell or ram''s horns — scholars still debate its origin.', 'The Ionic order originated in Ionia (western Turkey) around 560 BC.'],
    '[{"title":"A History of Architecture","type":"book","page":"72"},{"title":"Ching, Architecture: Form Space & Order","type":"book","page":"312"}]'
),
(
    'a0000000-0000-0000-0000-000000000001',
    '5b000000-0000-0000-0000-000000000001',
    (SELECT id FROM public.topics WHERE slug = 'classical-architecture' AND subject_id = '5b000000-0000-0000-0000-000000000001'),
    'mcq',
    'The Parthenon in Athens is primarily an example of which architectural order?',
    '[{"id":"a","text":"Ionic","image_url":null,"is_correct":false},{"id":"b","text":"Corinthian","image_url":null,"is_correct":false},{"id":"c","text":"Doric","image_url":null,"is_correct":true},{"id":"d","text":"Composite","image_url":null,"is_correct":false}]',
    'c',
    'The Parthenon (447-432 BC) is a Doric peripteral temple, though it incorporates some Ionic elements in its interior frieze. Designed by Ictinus and Callicrates under the supervision of Phidias, it is considered the finest example of Doric architecture.',
    true,
    'easy',
    ARRAY['parthenon', 'greek-architecture', 'doric'],
    ARRAY['The Parthenon uses optical refinements called entasis — the columns bulge slightly to counteract the illusion of concavity.', 'At its peak, the Parthenon housed a 12-meter tall gold and ivory statue of Athena.'],
    '[{"title":"Banister Fletcher, A History of Architecture","type":"book","page":"119"},{"title":"The Parthenon — Ancient History Encyclopedia","type":"article","url":"https://www.worldhistory.org/parthenon/"}]'
),
(
    'a0000000-0000-0000-0000-000000000001',
    '5b000000-0000-0000-0000-000000000004',
    (SELECT id FROM public.topics WHERE slug = 'construction-methods' AND subject_id = '5b000000-0000-0000-0000-000000000004'),
    'mcq',
    'What is the primary purpose of a vapor barrier in wall construction?',
    '[{"id":"a","text":"To prevent heat transfer through the wall assembly","image_url":null,"is_correct":false},{"id":"b","text":"To prevent moisture from migrating into the wall cavity","image_url":null,"is_correct":true},{"id":"c","text":"To provide structural support for the cladding","image_url":null,"is_correct":false},{"id":"d","text":"To act as an air barrier against wind infiltration","image_url":null,"is_correct":false}]',
    'b',
    'A vapor barrier (or vapor retarder) is specifically designed to resist the diffusion of moisture through building assemblies. It prevents warm, moist air from reaching cold surfaces where condensation could form and damage insulation or structural elements.',
    true,
    'medium',
    ARRAY['vapor-barrier', 'wall-construction', 'building-envelope'],
    ARRAY['In tropical climates like the Philippines, the vapor barrier is placed on the exterior side of insulation — opposite to cold climates.'],
    '[{"title":"Architectural Graphic Standards","type":"book","page":"245"},{"title":"National Building Code of the Philippines","type":"code","page":"Section 701"}]'
),
(
    'a0000000-0000-0000-0000-000000000001',
    '5b000000-0000-0000-0000-000000000005',
    (SELECT id FROM public.topics WHERE slug = 'structural-analysis' AND subject_id = '5b000000-0000-0000-0000-000000000005'),
    'mcq',
    'In structural analysis, what does the moment of inertia represent?',
    '[{"id":"a","text":"The resistance of a body to angular acceleration","image_url":null,"is_correct":false},{"id":"b","text":"The geometric property describing a cross-section''s resistance to bending","image_url":null,"is_correct":true},{"id":"c","text":"The maximum stress a material can withstand before failure","image_url":null,"is_correct":false},{"id":"d","text":"The ratio of stress to strain within the elastic limit","image_url":null,"is_correct":false}]',
    'b',
    'The moment of inertia (second moment of area) is a geometric property of a cross-section that indicates its resistance to bending. A larger moment of inertia means the section is more resistant to bending forces. This is why I-beams are so efficient — material is concentrated far from the neutral axis.',
    true,
    'medium',
    ARRAY['moment-of-inertia', 'structural-analysis', 'bending'],
    ARRAY['An I-beam can be 5-10x more efficient in bending than a solid rectangular beam of the same cross-sectional area.', 'The concept was first formulated by Leonhard Euler in the 18th century.'],
    '[{"title":"NSCP 2015 — National Structural Code of the Philippines","type":"code"},{"title":"Onouye & Kane, Statics and Strength of Materials","type":"book","page":"289"}]'
),
(
    'a0000000-0000-0000-0000-000000000001',
    '5b000000-0000-0000-0000-000000000008',
    (SELECT id FROM public.topics WHERE slug = 'ra-9266-architecture-act' AND subject_id = '5b000000-0000-0000-0000-000000000008'),
    'mcq',
    'Under RA 9266 (Architecture Act of 2004), what is the minimum CPD units required for license renewal?',
    '[{"id":"a","text":"40 units","image_url":null,"is_correct":false},{"id":"b","text":"60 units","image_url":null,"is_correct":true},{"id":"c","text":"80 units","image_url":null,"is_correct":false},{"id":"d","text":"100 units","image_url":null,"is_correct":false}]',
    'b',
    'RA 9266, the Architecture Act of 2004, requires licensed architects in the Philippines to earn a minimum of 60 Continuing Professional Development (CPD) units for license renewal. These units are distributed across formal learning, non-formal learning, and self-directed learning.',
    true,
    'medium',
    ARRAY['ra-9266', 'cpd', 'professional-practice'],
    ARRAY['RA 9266 was signed into law on March 17, 2004, replacing the older RA 545.', 'The law also established the Professional Regulatory Board of Architecture (PRBoA).'],
    '[{"title":"RA 9266 — Architecture Act of 2004","type":"standard","url":"https://www.officialgazette.gov.ph/2004/03/17/republic-act-no-9266/"},{"title":"PRC CPD Guidelines","type":"article"}]'
);
