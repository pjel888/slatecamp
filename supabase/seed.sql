-- =============================================================
-- SEED: Architecture Exam Domains (Philippines ALE)
-- =============================================================
INSERT INTO exam_domains (profession, name, slug, description, sort_order, icon_name) VALUES
('architecture', 'History of Architecture', 'history-of-architecture', 'Architectural history from ancient civilizations to contemporary movements', 1, 'landmark'),
('architecture', 'Theory of Architecture', 'theory-of-architecture', 'Design theory, principles, and architectural criticism', 2, 'lightbulb'),
('architecture', 'Architectural Design', 'architectural-design', 'Design process, space planning, programming, and design development', 3, 'pencil-ruler'),
('architecture', 'Building Technology', 'building-technology', 'Construction materials, methods, systems, and detailing', 4, 'brick-wall'),
('architecture', 'Structural Engineering', 'structural-engineering', 'Structural analysis, design of steel, concrete, and timber', 5, 'hard-hat'),
('architecture', 'Building Utilities', 'building-utilities', 'Mechanical, electrical, plumbing, fire protection, and acoustics', 6, 'plug'),
('architecture', 'Professional Practice', 'professional-practice', 'Contracts, ethics, project management, and business of architecture', 7, 'briefcase'),
('architecture', 'Architectural Laws', 'architectural-laws', 'BP 344, PD 1096, RA 9266, NBC, and other relevant legislation', 8, 'scale'),
('architecture', 'Site Planning', 'site-planning', 'Site analysis, grading, landscape, environmental design', 9, 'map'),
('architecture', 'Tropical Design', 'tropical-design', 'Climate-responsive design for tropical conditions, passive cooling, natural ventilation', 10, 'sun');

-- =============================================================
-- SEED: Sample Question Bank
-- =============================================================
INSERT INTO question_banks (id, title, description, profession, is_official, status, question_count)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'ALE Architecture Fundamentals',
  'Official starter pack covering core architecture board exam topics.',
  'architecture',
  true,
  'published',
  10
);

-- =============================================================
-- SEED: Sample Questions (History of Architecture)
-- =============================================================
INSERT INTO questions (bank_id, exam_domain_id, question_type, prompt, choices, correct_answer, explanation, difficulty, tags) VALUES
(
  'a0000000-0000-0000-0000-000000000001',
  (SELECT id FROM exam_domains WHERE slug = 'history-of-architecture'),
  'mcq',
  'Which architectural order is characterized by its scroll-shaped capital, known as a volute?',
  '[{"id":"a","text":"Doric","is_correct":false},{"id":"b","text":"Ionic","is_correct":true},{"id":"c","text":"Corinthian","is_correct":false},{"id":"d","text":"Tuscan","is_correct":false}]',
  'b',
  'The Ionic order is distinguished by its scroll-shaped capitals called volutes. The Doric order has a plain capital, while the Corinthian features ornate acanthus leaf decoration.',
  'easy',
  ARRAY['greek-orders', 'classical-architecture']
),
(
  'a0000000-0000-0000-0000-000000000001',
  (SELECT id FROM exam_domains WHERE slug = 'history-of-architecture'),
  'mcq',
  'The Parthenon in Athens is primarily an example of which architectural order?',
  '[{"id":"a","text":"Ionic","is_correct":false},{"id":"b","text":"Corinthian","is_correct":false},{"id":"c","text":"Doric","is_correct":true},{"id":"d","text":"Composite","is_correct":false}]',
  'c',
  'The Parthenon (447-432 BC) is a Doric peripteral temple, though it incorporates some Ionic elements in its interior frieze. It is considered the finest example of Doric architecture.',
  'easy',
  ARRAY['parthenon', 'greek-architecture', 'doric']
),
(
  'a0000000-0000-0000-0000-000000000001',
  (SELECT id FROM exam_domains WHERE slug = 'building-technology'),
  'mcq',
  'What is the primary purpose of a vapor barrier in wall construction?',
  '[{"id":"a","text":"To prevent heat transfer through the wall assembly","is_correct":false},{"id":"b","text":"To prevent moisture from migrating into the wall cavity","is_correct":true},{"id":"c","text":"To provide structural support for the cladding","is_correct":false},{"id":"d","text":"To act as an air barrier against wind infiltration","is_correct":false}]',
  'b',
  'A vapor barrier (or vapor retarder) is specifically designed to resist the diffusion of moisture through building assemblies. It prevents warm, moist air from reaching cold surfaces where condensation could form and damage insulation or structural elements.',
  'medium',
  ARRAY['vapor-barrier', 'wall-construction', 'building-envelope']
),
(
  'a0000000-0000-0000-0000-000000000001',
  (SELECT id FROM exam_domains WHERE slug = 'structural-engineering'),
  'mcq',
  'In structural analysis, what does a moment of inertia represent?',
  '[{"id":"a","text":"The resistance of a body to angular acceleration","is_correct":false},{"id":"b","text":"The geometric property describing a cross-section''s resistance to bending","is_correct":true},{"id":"c","text":"The maximum stress a material can withstand before failure","is_correct":false},{"id":"d","text":"The ratio of stress to strain within the elastic limit","is_correct":false}]',
  'b',
  'The moment of inertia (second moment of area) is a geometric property of a cross-section that indicates its resistance to bending. A larger moment of inertia means the section is more resistant to bending forces.',
  'medium',
  ARRAY['moment-of-inertia', 'structural-analysis', 'bending']
),
(
  'a0000000-0000-0000-0000-000000000001',
  (SELECT id FROM exam_domains WHERE slug = 'professional-practice'),
  'mcq',
  'Under RA 9266 (Architecture Act of 2004), what is the minimum CPD units required for license renewal?',
  '[{"id":"a","text":"40 units","is_correct":false},{"id":"b","text":"60 units","is_correct":true},{"id":"c","text":"80 units","is_correct":false},{"id":"d","text":"100 units","is_correct":false}]',
  'b',
  'RA 9266, the Architecture Act of 2004, requires licensed architects in the Philippines to earn a minimum of 60 Continuing Professional Development (CPD) units for license renewal.',
  'medium',
  ARRAY['ra-9266', 'cpd', 'professional-practice']
);
