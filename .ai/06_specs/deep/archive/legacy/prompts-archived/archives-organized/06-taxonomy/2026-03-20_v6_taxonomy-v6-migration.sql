-- ============================================================
-- Migration: Taxonomy v6.0 — New Nodes
-- Source: slatecamp_taxonomy_v6.json (cross-referenced against
--         1,446 ArchiReviewMaterials dataset files)
--
-- WHAT THIS ADDS:
--   4 new topic nodes
--   47 new subtopic nodes (v6_addition: true)
--   Spread across all 9 subjects
--
-- WHAT THIS DOES NOT TOUCH:
--   Existing v5.0 nodes — zero modifications
--   Existing cross-references, sources, prerequisites
--   Any user mastery, interaction, or quiz data
--
-- IDEMPOTENT: Safe to re-run. All INSERTs use ON CONFLICT (ale_id) DO UPDATE.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- PREREQ CHECK
-- ─────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.disciplines WHERE acronym = 'ALE') THEN
    RAISE EXCEPTION 'ALE discipline not found. Cannot seed v6 taxonomy nodes.';
  END IF;

  -- Confirm all parent topics already exist (v5 subjects + topics must be present)
  DECLARE missing_topics TEXT[];
  BEGIN
    SELECT array_agg(ale_id) INTO missing_topics
    FROM (VALUES
      ('ALE-HIST'),('ALE-HIST-001'),('ALE-HIST-005'),('ALE-HIST-006'),
      ('ALE-THEO'),('ALE-THEO-001'),('ALE-THEO-003'),
      ('ALE-PLAN'),('ALE-PLAN-001'),('ALE-PLAN-005'),
      ('ALE-PRAC'),('ALE-PRAC-001'),
      ('ALE-STRC'),('ALE-STRC-001'),('ALE-STRC-002'),
      ('ALE-MATL'),('ALE-MATL-003'),('ALE-MATL-005'),
      ('ALE-UTIL'),('ALE-UTIL-001'),('ALE-UTIL-002'),('ALE-UTIL-005'),
      ('ALE-DSGN'),('ALE-DSGN-003'),('ALE-DSGN-004'),('ALE-DSGN-005'),
      ('ALE-LAWS'),('ALE-LAWS-002'),('ALE-LAWS-003'),('ALE-LAWS-004'),('ALE-LAWS-005')
    ) AS required(ale_id)
    WHERE NOT EXISTS (
      SELECT 1 FROM public.taxonomy_tree tt WHERE tt.ale_id = required.ale_id
    );

    IF missing_topics IS NOT NULL THEN
      RAISE EXCEPTION 'Missing parent nodes: %. Run v5 taxonomy import first.', array_to_string(missing_topics, ', ');
    END IF;
  END;

  RAISE NOTICE 'Prereq check passed. Starting v6 taxonomy seed.';
END $$;


-- ============================================================
-- STEP 1: 4 new topic nodes (level=2)
-- ALE-THEO-006, ALE-PRAC-006, ALE-LAWS-007, ALE-LAWS-008
-- ============================================================

INSERT INTO public.taxonomy_tree (
  ale_id, discipline_id, parent_id, level,
  name, subject_area, is_leaf, is_cross_ref_only, slug, wiki_items
)
SELECT
  t.ale_id,
  d.discipline_id,
  (SELECT node_id FROM public.taxonomy_tree WHERE ale_id = t.parent_ale_id),
  2,
  t.name,
  t.subject_area,
  false,
  t.is_cross_ref,
  t.slug,
  '[]'::jsonb
FROM public.disciplines d,
(VALUES
  (
    'ALE-THEO-006',
    'ALE-THEO',
    'Biophilic Design & Environmental Aesthetics',
    'Theory of Architecture',
    false,
    'ale-theo-006-biophilic-design'
  ),
  (
    'ALE-PRAC-006',
    'ALE-PRAC',
    'Construction Contracts & Arbitration',
    'Architectural Practice and Jurisprudence',
    false,
    'ale-prac-006-construction-contracts'
  ),
  (
    'ALE-LAWS-007',
    'ALE-LAWS',
    'Environmental & Disaster Management Laws',
    'Philippine Laws & Codes for Architectural Practice',
    true,
    'ale-laws-007-environmental-disaster'
  ),
  (
    'ALE-LAWS-008',
    'ALE-LAWS',
    'Civil, Labor & Administrative Laws Affecting Practice',
    'Philippine Laws & Codes for Architectural Practice',
    true,
    'ale-laws-008-civil-labor-admin'
  )
) AS t(ale_id, parent_ale_id, name, subject_area, is_cross_ref, slug)
WHERE d.acronym = 'ALE'
ON CONFLICT (ale_id) DO UPDATE SET
  name       = EXCLUDED.name,
  updated_at = now();

RAISE NOTICE 'Step 1 complete: 4 new topic nodes inserted.';


-- ============================================================
-- STEP 2: 47 new subtopic nodes (level=3, is_leaf=true)
-- Grouped by subject for readability
-- ============================================================

-- ── ALE-HIST: 7 new subtopics ──────────────────────────────

INSERT INTO public.taxonomy_tree (
  ale_id, discipline_id, parent_id, level,
  name, subject_area,
  node_type, exam_frequency, bloom_level, difficulty,
  typical_question_formats, wiki_items,
  is_leaf, is_cross_ref_only, slug
)
SELECT
  t.ale_id,
  d.discipline_id,
  (SELECT node_id FROM public.taxonomy_tree WHERE ale_id = t.parent_ale_id),
  3,
  t.name,
  'History of Architecture',
  t.node_type::public.taxonomy_node_type,
  t.freq::public.exam_frequency_level,
  t.bloom::public.bloom_level_type,
  t.diff,
  t.formats,
  t.wiki_items::jsonb,
  true,
  false,
  t.slug
FROM public.disciplines d,
(VALUES
  (
    'ALE-HIST-001-08', 'ALE-HIST-001',
    'Indus Valley Civilization',
    'concept', 'low', 'remember', 1,
    ARRAY['mcq_recall'],
    '[{"text":"Harappa","type":"fact"},{"text":"Mohenjo-Daro","type":"fact"},{"text":"Grid-plan cities","type":"fact"},{"text":"Great Bath","type":"fact"},{"text":"Drainage systems","type":"fact"},{"text":"Standardized fired bricks","type":"fact"}]',
    'ale-hist-001-08-indus-valley'
  ),
  (
    'ALE-HIST-005-05', 'ALE-HIST-005',
    'Art Nouveau & Art Deco',
    'concept', 'medium', 'remember', 2,
    ARRAY['mcq_recall','visual_identification'],
    '[{"text":"Art Nouveau — organic curvilinear forms (Horta, Guimard, Gaudí)","type":"fact"},{"text":"Art Deco — geometric streamlined ornamentation (Chrysler Building, Empire State Building)","type":"fact"},{"text":"Jugendstil, Secession, Modernisme variants","type":"fact"},{"text":"Manila Metropolitan Theater (Art Deco in PH)","type":"fact"}]',
    'ale-hist-005-05-art-nouveau-deco'
  ),
  (
    'ALE-HIST-005-06', 'ALE-HIST-005',
    'Brutalism & Late Modernism',
    'concept', 'medium', 'understand', 2,
    ARRAY['mcq_recall','visual_identification'],
    '[{"text":"Béton brut — exposed concrete aesthetic","type":"fact"},{"text":"Le Corbusier Unité d''Habitation","type":"fact"},{"text":"Paul Rudolph, Kenzo Tange, Tadao Ando","type":"fact"},{"text":"Metabolist Movement (Japan)","type":"fact"},{"text":"Late Modernism vs. Postmodernism distinction","type":"fact"}]',
    'ale-hist-005-06-brutalism-late-modernism'
  ),
  (
    'ALE-HIST-005-07', 'ALE-HIST-005',
    'Deconstructivism & Parametricism',
    'concept', 'medium', 'understand', 3,
    ARRAY['mcq_recall','visual_identification'],
    '[{"text":"Deconstructivism — fragmented geometry, Gehry, Libeskind, Hadid, Eisenman, Coop Himmelblau","type":"fact"},{"text":"1988 MoMA Deconstructivist Exhibition","type":"fact"},{"text":"Parametricism — Zaha Hadid Architects, algorithmic design","type":"fact"},{"text":"Digital fabrication and computational design","type":"fact"},{"text":"Folding in Architecture","type":"fact"}]',
    'ale-hist-005-07-deconstructivism-parametricism'
  ),
  (
    'ALE-HIST-005-08', 'ALE-HIST-005',
    'Critical Regionalism & Contextualism',
    'concept', 'medium', 'understand', 2,
    ARRAY['mcq_recall','mcq_application'],
    '[{"text":"Kenneth Frampton critical regionalism theory","type":"fact"},{"text":"Contextualism — architecture responding to local context","type":"fact"},{"text":"Tadao Ando, Glenn Murcutt, Charles Correa","type":"fact"},{"text":"Vernacular modernism","type":"fact"},{"text":"Resistance to placeless international style","type":"fact"}]',
    'ale-hist-005-08-critical-regionalism'
  ),
  (
    'ALE-HIST-006-06', 'ALE-HIST-006',
    'Contemporary Philippine Architecture',
    'concept', 'medium', 'understand', 2,
    ARRAY['mcq_recall','visual_identification'],
    '[{"text":"Bobby Mañosa (Bahay Kubo modernism)","type":"fact"},{"text":"Francisco Fariñas","type":"fact"},{"text":"Gabriel Formoso","type":"fact"},{"text":"Ed Calma","type":"fact"},{"text":"Augusto Villalon","type":"fact"},{"text":"PACE Development Corp (green architecture PH)","type":"fact"},{"text":"Philippine Green Building Council (PGBC)","type":"fact"},{"text":"Intramuros heritage restoration","type":"fact"}]',
    'ale-hist-006-06-contemporary-ph'
  ),
  (
    'ALE-HIST-006-07', 'ALE-HIST-006',
    'Pillars of Philippine Architecture',
    'person', 'high', 'remember', 2,
    ARRAY['mcq_recall'],
    '[{"text":"Six Pillars of Philippine Architecture","type":"fact"},{"text":"Juan Nakpil","type":"fact"},{"text":"Pablo Antonio","type":"fact"},{"text":"Carlos Arguelles","type":"fact"},{"text":"Tomas Mapua","type":"fact"},{"text":"Arcadio Arellano","type":"fact"},{"text":"Fernando Ocampo","type":"fact"},{"text":"Their key works and contributions","type":"fact"}]',
    'ale-hist-006-07-pillars-ph-architecture'
  )
) AS t(ale_id, parent_ale_id, name, node_type, freq, bloom, diff, formats, wiki_items, slug)
WHERE d.acronym = 'ALE'
ON CONFLICT (ale_id) DO UPDATE SET
  name = EXCLUDED.name, exam_frequency = EXCLUDED.exam_frequency,
  bloom_level = EXCLUDED.bloom_level, difficulty = EXCLUDED.difficulty,
  typical_question_formats = EXCLUDED.typical_question_formats,
  wiki_items = EXCLUDED.wiki_items, updated_at = now();

-- ── ALE-THEO: 4 new subtopics ──────────────────────────────

INSERT INTO public.taxonomy_tree (
  ale_id, discipline_id, parent_id, level,
  name, subject_area,
  node_type, exam_frequency, bloom_level, difficulty,
  typical_question_formats, wiki_items,
  is_leaf, is_cross_ref_only, slug
)
SELECT
  t.ale_id,
  d.discipline_id,
  (SELECT node_id FROM public.taxonomy_tree WHERE ale_id = t.parent_ale_id),
  3,
  t.name,
  'Theory of Architecture',
  t.node_type::public.taxonomy_node_type,
  t.freq::public.exam_frequency_level,
  t.bloom::public.bloom_level_type,
  t.diff,
  t.formats,
  t.wiki_items::jsonb,
  true,
  false,
  t.slug
FROM public.disciplines d,
(VALUES
  (
    'ALE-THEO-001-06', 'ALE-THEO-001',
    'Texture & Pattern in Architecture',
    'concept', 'low', 'understand', 1,
    ARRAY['mcq_recall'],
    '[{"text":"Visual and tactile texture","type":"fact"},{"text":"Pattern types: grid, radial, spiral, organic","type":"fact"},{"text":"Surface articulation in architectural design","type":"fact"}]',
    'ale-theo-001-06-texture-pattern'
  ),
  (
    'ALE-THEO-003-04', 'ALE-THEO-003',
    'Privacy, Territoriality & Personal Space',
    'concept', 'medium', 'understand', 2,
    ARRAY['mcq_recall','mcq_application'],
    '[{"text":"Edward T. Hall proxemic zones — intimate (0-18in), personal (18in-4ft), social (4-12ft), public (12+ft)","type":"definition"},{"text":"Privacy regulation theory (Altman)","type":"fact"},{"text":"Territoriality in architectural space — primary, secondary, public territories","type":"definition"},{"text":"Defensible space theory (Oscar Newman)","type":"fact"},{"text":"Crowding and density effects on behavior","type":"fact"}]',
    'ale-theo-003-04-privacy-territoriality'
  ),
  (
    'ALE-THEO-006-01', 'ALE-THEO-006',
    'Biophilic Design Principles',
    'concept', 'medium', 'understand', 2,
    ARRAY['mcq_recall','mcq_application'],
    '[{"text":"14 Patterns of Biophilic Design (Terrapin Bright Green)","type":"fact"},{"text":"Nature in the Space — visual connection, non-visual, thermal, airflow, water, dynamic/diffuse light, biomorphic forms","type":"definition"},{"text":"Natural Analogues — complexity/order, material connection, nature of the space","type":"definition"},{"text":"Nature of the Space — prospect, refuge, mystery, risk/peril","type":"definition"},{"text":"Biophilia hypothesis (E.O. Wilson)","type":"fact"},{"text":"Health and productivity benefits","type":"fact"}]',
    'ale-theo-006-01-biophilic-design'
  ),
  (
    'ALE-THEO-006-02', 'ALE-THEO-006',
    'Sustainable Design Theory',
    'concept', 'medium', 'understand', 2,
    ARRAY['mcq_recall','mcq_application'],
    '[{"text":"Cradle to Cradle design philosophy","type":"fact"},{"text":"Regenerative design","type":"fact"},{"text":"Net-zero energy design principles","type":"fact"},{"text":"BERDE (Building for Ecologically Responsive Design Excellence) — Philippine green building rating","type":"definition"},{"text":"LEED certification framework","type":"definition"},{"text":"Passive House (Passivhaus) standard","type":"fact"}]',
    'ale-theo-006-02-sustainable-design-theory'
  )
) AS t(ale_id, parent_ale_id, name, node_type, freq, bloom, diff, formats, wiki_items, slug)
WHERE d.acronym = 'ALE'
ON CONFLICT (ale_id) DO UPDATE SET
  name = EXCLUDED.name, exam_frequency = EXCLUDED.exam_frequency,
  bloom_level = EXCLUDED.bloom_level, difficulty = EXCLUDED.difficulty,
  typical_question_formats = EXCLUDED.typical_question_formats,
  wiki_items = EXCLUDED.wiki_items, updated_at = now();

-- ── ALE-PLAN: 2 new subtopics ──────────────────────────────

INSERT INTO public.taxonomy_tree (
  ale_id, discipline_id, parent_id, level,
  name, subject_area,
  node_type, exam_frequency, bloom_level, difficulty,
  typical_question_formats, wiki_items,
  is_leaf, is_cross_ref_only, slug
)
SELECT
  t.ale_id,
  d.discipline_id,
  (SELECT node_id FROM public.taxonomy_tree WHERE ale_id = t.parent_ale_id),
  3,
  t.name,
  'Theory and Principles of Planning',
  t.node_type::public.taxonomy_node_type,
  t.freq::public.exam_frequency_level,
  t.bloom::public.bloom_level_type,
  t.diff,
  t.formats,
  t.wiki_items::jsonb,
  true,
  false,
  t.slug
FROM public.disciplines d,
(VALUES
  (
    'ALE-PLAN-001-04', 'ALE-PLAN-001',
    'Comprehensive Land Use Planning (CLUP)',
    'code_provision', 'high', 'apply', 3,
    ARRAY['mcq_recall','mcq_application','design_application'],
    '[{"text":"E.O. 72 — Comprehensive Land Use Plans","type":"code_provision"},{"text":"HLURB/DHSUD guidelines for CLUP preparation","type":"fact"},{"text":"Zoning ordinance preparation","type":"fact"},{"text":"Land conversion protocols (E.O. 124)","type":"fact"},{"text":"Agricultural land conversion rules","type":"fact"},{"text":"CLUP components: land use map, zoning ordinance, infrastructure program","type":"definition"}]',
    'ale-plan-001-04-clup'
  ),
  (
    'ALE-PLAN-005-04', 'ALE-PLAN-005',
    'Disaster Risk Reduction & Climate Change Adaptation',
    'concept', 'medium', 'understand', 2,
    ARRAY['mcq_recall','mcq_application'],
    '[{"text":"RA 10121 — Philippine Disaster Risk Reduction and Management Act","type":"code_provision"},{"text":"Climate change adaptation in urban planning","type":"fact"},{"text":"Flood control design (DPWH-JICA standards)","type":"fact"},{"text":"Hazard mapping and vulnerability assessment","type":"fact"},{"text":"Resilient urban design principles","type":"fact"},{"text":"Metro Manila Disaster Risk Management considerations","type":"fact"}]',
    'ale-plan-005-04-drrm-climate'
  )
) AS t(ale_id, parent_ale_id, name, node_type, freq, bloom, diff, formats, wiki_items, slug)
WHERE d.acronym = 'ALE'
ON CONFLICT (ale_id) DO UPDATE SET
  name = EXCLUDED.name, exam_frequency = EXCLUDED.exam_frequency,
  bloom_level = EXCLUDED.bloom_level, difficulty = EXCLUDED.difficulty,
  typical_question_formats = EXCLUDED.typical_question_formats,
  wiki_items = EXCLUDED.wiki_items, updated_at = now();

-- ── ALE-PRAC: 5 new subtopics ──────────────────────────────

INSERT INTO public.taxonomy_tree (
  ale_id, discipline_id, parent_id, level,
  name, subject_area,
  node_type, exam_frequency, bloom_level, difficulty,
  typical_question_formats, wiki_items,
  is_leaf, is_cross_ref_only, slug
)
SELECT
  t.ale_id,
  d.discipline_id,
  (SELECT node_id FROM public.taxonomy_tree WHERE ale_id = t.parent_ale_id),
  3,
  t.name,
  'Architectural Practice and Jurisprudence',
  t.node_type::public.taxonomy_node_type,
  t.freq::public.exam_frequency_level,
  t.bloom::public.bloom_level_type,
  t.diff,
  t.formats,
  t.wiki_items::jsonb,
  true,
  false,
  t.slug
FROM public.disciplines d,
(VALUES
  (
    'ALE-PRAC-001-05', 'ALE-PRAC-001',
    'Registration of Architectural Firms',
    'code_provision', 'medium', 'understand', 2,
    ARRAY['mcq_recall','mcq_application'],
    '[{"text":"PRBoA Resolution 05 s.2007 — Registration of Architectural Firms","type":"code_provision"},{"text":"PRBoA Resolution 03 s.2008 — Temporary permits for foreign architects","type":"code_provision"},{"text":"Sole proprietorship vs. partnership vs. corporation","type":"definition"},{"text":"Requirements for firm registration with PRC/PRBoA","type":"fact"},{"text":"Prohibition of non-RLA practice (PRBoA Resolution 01 s.2008)","type":"code_provision"}]',
    'ale-prac-001-05-firm-registration'
  ),
  (
    'ALE-PRAC-006-01', 'ALE-PRAC-006',
    'CIAP Document 102 — Private Construction Contract',
    'code_provision', 'medium', 'understand', 2,
    ARRAY['mcq_recall','mcq_application'],
    '[{"text":"Standard construction contract forms","type":"fact"},{"text":"Owner-contractor-architect relationships","type":"definition"},{"text":"Contract documents hierarchy","type":"definition"},{"text":"General conditions of contract","type":"fact"},{"text":"Change orders and variation orders","type":"definition"}]',
    'ale-prac-006-01-ciap-doc-102'
  ),
  (
    'ALE-PRAC-006-02', 'ALE-PRAC-006',
    'PD 1594 — Government Infrastructure Contracts',
    'code_provision', 'medium', 'understand', 2,
    ARRAY['mcq_recall','mcq_application'],
    '[{"text":"Government infrastructure contract requirements","type":"fact"},{"text":"Bidding procedures for government projects","type":"fact"},{"text":"PD 1594 IRR provisions","type":"fact"},{"text":"Licensing of contractors","type":"fact"},{"text":"Performance bonds and guarantees","type":"definition"}]',
    'ale-prac-006-02-pd-1594'
  ),
  (
    'ALE-PRAC-006-03', 'ALE-PRAC-006',
    'E.O. 1008 — Construction Industry Arbitration Law',
    'code_provision', 'medium', 'understand', 2,
    ARRAY['mcq_recall','mcq_application'],
    '[{"text":"CIAC (Construction Industry Arbitration Commission)","type":"definition"},{"text":"Jurisdiction over construction disputes","type":"fact"},{"text":"Arbitration proceedings and awards","type":"fact"},{"text":"Enforcement of arbitral awards","type":"fact"},{"text":"Alternative dispute resolution in construction","type":"fact"}]',
    'ale-prac-006-03-eo-1008'
  ),
  (
    'ALE-PRAC-006-04', 'ALE-PRAC-006',
    'PD 1746 — Construction Industry Authority',
    'code_provision', 'low', 'remember', 1,
    ARRAY['mcq_recall'],
    '[{"text":"CIAP — Construction Industry Authority of the Philippines","type":"definition"},{"text":"Licensing of contractors","type":"fact"},{"text":"Philippine Contractors Accreditation Board (PCAB)","type":"definition"},{"text":"Contractor classification and categories","type":"fact"}]',
    'ale-prac-006-04-pd-1746'
  )
) AS t(ale_id, parent_ale_id, name, node_type, freq, bloom, diff, formats, wiki_items, slug)
WHERE d.acronym = 'ALE'
ON CONFLICT (ale_id) DO UPDATE SET
  name = EXCLUDED.name, exam_frequency = EXCLUDED.exam_frequency,
  bloom_level = EXCLUDED.bloom_level, difficulty = EXCLUDED.difficulty,
  typical_question_formats = EXCLUDED.typical_question_formats,
  wiki_items = EXCLUDED.wiki_items, updated_at = now();

-- ── ALE-STRC: 3 new subtopics (is_computation_heavy=true) ──

INSERT INTO public.taxonomy_tree (
  ale_id, discipline_id, parent_id, level,
  name, subject_area,
  node_type, exam_frequency, bloom_level, difficulty,
  typical_question_formats, wiki_items,
  is_leaf, is_cross_ref_only, is_computation_heavy, slug
)
SELECT
  t.ale_id,
  d.discipline_id,
  (SELECT node_id FROM public.taxonomy_tree WHERE ale_id = t.parent_ale_id),
  3,
  t.name,
  'Structural Design',
  t.node_type::public.taxonomy_node_type,
  t.freq::public.exam_frequency_level,
  t.bloom::public.bloom_level_type,
  t.diff,
  t.formats,
  t.wiki_items::jsonb,
  true,
  false,
  t.is_computation_heavy,
  t.slug
FROM public.disciplines d,
(VALUES
  (
    'ALE-STRC-001-04', 'ALE-STRC-001',
    'Reinforcement Detailing & Bar Schedules',
    'formula', 'high', 'apply', 3,
    ARRAY['mcq_recall','mcq_calculation'],
    '[{"text":"Standard hooks and bends","type":"formula"},{"text":"Development length calculations","type":"formula"},{"text":"Lap splice requirements","type":"formula"},{"text":"Bar schedule preparation","type":"fact"},{"text":"Beam and column reinforcement detailing","type":"fact"},{"text":"Slab reinforcement patterns","type":"fact"},{"text":"ACI 318 detailing requirements as adopted in NSCP","type":"code_provision"}]',
    true,
    'ale-strc-001-04-reinforcement-detailing'
  ),
  (
    'ALE-STRC-002-04', 'ALE-STRC-002',
    'Statics & Equilibrium Fundamentals',
    'formula', 'high', 'apply', 2,
    ARRAY['mcq_recall','mcq_calculation'],
    '[{"text":"Free body diagrams","type":"fact"},{"text":"Equilibrium equations ΣFx=0, ΣFy=0, ΣM=0","type":"formula"},{"text":"Resultant of forces","type":"formula"},{"text":"Moment calculations","type":"formula"},{"text":"Centroid and moment of inertia","type":"formula"},{"text":"Stress = P/A","type":"formula"},{"text":"Strain = δ/L","type":"formula"},{"text":"Modulus of elasticity E = σ/ε","type":"formula"},{"text":"Hooke''s Law — linear elastic behavior","type":"fact"}]',
    true,
    'ale-strc-002-04-statics-equilibrium'
  ),
  (
    'ALE-STRC-002-05', 'ALE-STRC-002',
    'Beam Analysis — Shear & Moment Diagrams',
    'formula', 'high', 'apply', 3,
    ARRAY['mcq_calculation','design_application'],
    '[{"text":"Simply supported beams","type":"fact"},{"text":"Cantilever beams","type":"fact"},{"text":"Continuous beams","type":"fact"},{"text":"Shear force diagrams (SFD)","type":"definition"},{"text":"Bending moment diagrams (BMD)","type":"definition"},{"text":"Point of zero shear = maximum moment","type":"formula"},{"text":"Deflection formulas","type":"formula"}]',
    true,
    'ale-strc-002-05-beam-analysis-sfd-bmd'
  )
) AS t(ale_id, parent_ale_id, name, node_type, freq, bloom, diff, formats, wiki_items, is_computation_heavy, slug)
WHERE d.acronym = 'ALE'
ON CONFLICT (ale_id) DO UPDATE SET
  name = EXCLUDED.name, exam_frequency = EXCLUDED.exam_frequency,
  bloom_level = EXCLUDED.bloom_level, difficulty = EXCLUDED.difficulty,
  typical_question_formats = EXCLUDED.typical_question_formats,
  wiki_items = EXCLUDED.wiki_items,
  is_computation_heavy = EXCLUDED.is_computation_heavy,
  updated_at = now();

-- ── ALE-MATL: 3 new subtopics ──────────────────────────────

INSERT INTO public.taxonomy_tree (
  ale_id, discipline_id, parent_id, level,
  name, subject_area,
  node_type, exam_frequency, bloom_level, difficulty,
  typical_question_formats, wiki_items,
  is_leaf, is_cross_ref_only, slug
)
SELECT
  t.ale_id,
  d.discipline_id,
  (SELECT node_id FROM public.taxonomy_tree WHERE ale_id = t.parent_ale_id),
  3,
  t.name,
  'Building Materials and Construction Methods',
  t.node_type::public.taxonomy_node_type,
  t.freq::public.exam_frequency_level,
  t.bloom::public.bloom_level_type,
  t.diff,
  t.formats,
  t.wiki_items::jsonb,
  true,
  false,
  t.slug
FROM public.disciplines d,
(VALUES
  (
    'ALE-MATL-003-06', 'ALE-MATL-003',
    'Interior Finishes & Furnishing Materials',
    'concept', 'medium', 'remember', 2,
    ARRAY['mcq_recall','visual_identification'],
    '[{"text":"Carpet types and specifications","type":"fact"},{"text":"Vinyl flooring — LVT, sheet vinyl, VCT","type":"fact"},{"text":"Acoustic ceiling tiles","type":"fact"},{"text":"Wallcovering materials — vinyl, fabric, natural fiber","type":"fact"},{"text":"Countertop materials — granite, quartz, solid surface, laminate","type":"fact"},{"text":"Cabinet and millwork materials and finishes","type":"fact"}]',
    'ale-matl-003-06-interior-finishes'
  ),
  (
    'ALE-MATL-005-05', 'ALE-MATL-005',
    'Formwork & Scaffolding Systems',
    'concept', 'medium', 'understand', 2,
    ARRAY['mcq_recall'],
    '[{"text":"Traditional timber formwork","type":"fact"},{"text":"Metal formwork systems — aluminum, steel","type":"fact"},{"text":"System formwork — table forms, flying forms, tunnel forms","type":"fact"},{"text":"Scaffolding types — frame, tube-and-clamp, ring-lock, cantilever","type":"fact"},{"text":"Formwork stripping time requirements","type":"fact"},{"text":"Shoring and reshoring","type":"fact"}]',
    'ale-matl-005-05-formwork-scaffolding'
  ),
  (
    'ALE-MATL-005-06', 'ALE-MATL-005',
    'Earthwork & Site Preparation',
    'concept', 'medium', 'understand', 2,
    ARRAY['mcq_recall','mcq_application'],
    '[{"text":"Cut and fill operations","type":"fact"},{"text":"Soil compaction methods and testing","type":"fact"},{"text":"Excavation types — open cut, trench, basement","type":"definition"},{"text":"Dewatering methods","type":"fact"},{"text":"Soil stabilization techniques","type":"fact"},{"text":"Retaining wall types — gravity, cantilever, sheet pile, soil nailing","type":"definition"}]',
    'ale-matl-005-06-earthwork-site-prep'
  )
) AS t(ale_id, parent_ale_id, name, node_type, freq, bloom, diff, formats, wiki_items, slug)
WHERE d.acronym = 'ALE'
ON CONFLICT (ale_id) DO UPDATE SET
  name = EXCLUDED.name, exam_frequency = EXCLUDED.exam_frequency,
  bloom_level = EXCLUDED.bloom_level, difficulty = EXCLUDED.difficulty,
  typical_question_formats = EXCLUDED.typical_question_formats,
  wiki_items = EXCLUDED.wiki_items, updated_at = now();

-- ── ALE-UTIL: 3 new subtopics ──────────────────────────────

INSERT INTO public.taxonomy_tree (
  ale_id, discipline_id, parent_id, level,
  name, subject_area,
  node_type, exam_frequency, bloom_level, difficulty,
  typical_question_formats, wiki_items,
  is_leaf, is_cross_ref_only, is_computation_heavy, slug
)
SELECT
  t.ale_id,
  d.discipline_id,
  (SELECT node_id FROM public.taxonomy_tree WHERE ale_id = t.parent_ale_id),
  3,
  t.name,
  'Building Utilities / MEPF',
  t.node_type::public.taxonomy_node_type,
  t.freq::public.exam_frequency_level,
  t.bloom::public.bloom_level_type,
  t.diff,
  t.formats,
  t.wiki_items::jsonb,
  true,
  false,
  t.is_computation_heavy,
  t.slug
FROM public.disciplines d,
(VALUES
  (
    'ALE-UTIL-001-05', 'ALE-UTIL-001',
    'Pipe Materials & Sizing',
    'formula', 'high', 'apply', 2,
    ARRAY['mcq_recall','mcq_calculation'],
    '[{"text":"PVC pipe types — Schedule 40, Schedule 80, Series 1000","type":"fact"},{"text":"Galvanized iron (GI) pipe","type":"fact"},{"text":"Cast iron pipe (soil pipe)","type":"fact"},{"text":"Copper tubing — Types K, L, M","type":"fact"},{"text":"HDPE pipe for water supply","type":"fact"},{"text":"PPR pipe (polypropylene random)","type":"fact"},{"text":"Pipe sizing for water supply — fixture unit method","type":"formula"},{"text":"Pipe sizing for drainage — DFU method","type":"formula"}]',
    true,
    'ale-util-001-05-pipe-materials-sizing'
  ),
  (
    'ALE-UTIL-002-04', 'ALE-UTIL-002',
    'Electrical Load Calculations & Demand',
    'formula', 'high', 'apply', 3,
    ARRAY['mcq_calculation'],
    '[{"text":"Connected load vs. demand load","type":"definition"},{"text":"Demand factor and diversity factor","type":"definition"},{"text":"Residential load calculation per PEC","type":"formula"},{"text":"Commercial load estimation","type":"formula"},{"text":"Panel schedule preparation","type":"fact"},{"text":"Circuit breaker sizing","type":"formula"},{"text":"Service entrance sizing","type":"formula"},{"text":"Transformer sizing for buildings","type":"formula"}]',
    true,
    'ale-util-002-04-electrical-load-calc'
  ),
  (
    'ALE-UTIL-005-04', 'ALE-UTIL-005',
    'Security & Access Control Systems',
    'concept', 'low', 'remember', 2,
    ARRAY['mcq_recall'],
    '[{"text":"CCTV surveillance systems","type":"fact"},{"text":"Intrusion alarm/detection systems","type":"fact"},{"text":"Access control — card, biometric, keypad","type":"fact"},{"text":"Intercom and door entry systems","type":"fact"},{"text":"Integrated building security management","type":"fact"}]',
    false,
    'ale-util-005-04-security-access-control'
  )
) AS t(ale_id, parent_ale_id, name, node_type, freq, bloom, diff, formats, wiki_items, is_computation_heavy, slug)
WHERE d.acronym = 'ALE'
ON CONFLICT (ale_id) DO UPDATE SET
  name = EXCLUDED.name, exam_frequency = EXCLUDED.exam_frequency,
  bloom_level = EXCLUDED.bloom_level, difficulty = EXCLUDED.difficulty,
  typical_question_formats = EXCLUDED.typical_question_formats,
  wiki_items = EXCLUDED.wiki_items,
  is_computation_heavy = EXCLUDED.is_computation_heavy,
  updated_at = now();

-- ── ALE-DSGN: 5 new subtopics ──────────────────────────────

INSERT INTO public.taxonomy_tree (
  ale_id, discipline_id, parent_id, level,
  name, subject_area,
  node_type, exam_frequency, bloom_level, difficulty,
  typical_question_formats, wiki_items,
  is_leaf, is_cross_ref_only, slug
)
SELECT
  t.ale_id,
  d.discipline_id,
  (SELECT node_id FROM public.taxonomy_tree WHERE ale_id = t.parent_ale_id),
  3,
  t.name,
  'Architectural Design and Site Planning',
  t.node_type::public.taxonomy_node_type,
  t.freq::public.exam_frequency_level,
  t.bloom::public.bloom_level_type,
  t.diff,
  t.formats,
  t.wiki_items::jsonb,
  true,
  false,
  t.slug
FROM public.disciplines d,
(VALUES
  (
    'ALE-DSGN-003-05', 'ALE-DSGN-003',
    'Restaurant & Food Service Design',
    'concept', 'medium', 'apply', 2,
    ARRAY['mcq_recall','mcq_application','design_application'],
    '[{"text":"DOH Food Establishment guidelines","type":"code_provision"},{"text":"Kitchen layout types — assembly line, island, L-shaped, U-shaped","type":"definition"},{"text":"Commercial kitchen equipment spacing","type":"fact"},{"text":"Dining area per seat requirements","type":"formula"},{"text":"Kitchen to dining ratio (typically 1:3)","type":"formula"},{"text":"Ventilation and exhaust requirements","type":"fact"},{"text":"Sanitary and food safety design requirements","type":"fact"}]',
    'ale-dsgn-003-05-restaurant-food-service'
  ),
  (
    'ALE-DSGN-004-05', 'ALE-DSGN-004',
    'Museums & Cultural Facilities',
    'concept', 'medium', 'apply', 3,
    ARRAY['mcq_recall','mcq_application','design_application'],
    '[{"text":"Museum typologies — art, natural history, science, memorial","type":"definition"},{"text":"Exhibition space planning","type":"fact"},{"text":"Climate control for artifact preservation","type":"fact"},{"text":"Natural vs. artificial lighting in galleries","type":"fact"},{"text":"Circulation and wayfinding in museums","type":"fact"},{"text":"Storage and conservation facilities","type":"fact"},{"text":"Loading dock and crating requirements","type":"fact"}]',
    'ale-dsgn-004-05-museums-cultural'
  ),
  (
    'ALE-DSGN-004-06', 'ALE-DSGN-004',
    'Libraries & Archives',
    'concept', 'medium', 'apply', 2,
    ARRAY['mcq_recall','mcq_application'],
    '[{"text":"Library typologies — public, academic, special, national","type":"definition"},{"text":"PRC Standards for Libraries 2007","type":"code_provision"},{"text":"Stack area design — compact vs. open","type":"fact"},{"text":"Reading room design and furniture standards","type":"fact"},{"text":"Digital resource areas","type":"fact"},{"text":"Environmental control for book preservation","type":"fact"}]',
    'ale-dsgn-004-06-libraries-archives'
  ),
  (
    'ALE-DSGN-004-07', 'ALE-DSGN-004',
    'Theaters & Performance Venues',
    'concept', 'medium', 'apply', 3,
    ARRAY['mcq_recall','mcq_application','design_application'],
    '[{"text":"Theater typologies — proscenium, thrust, arena, black box","type":"definition"},{"text":"Seating sight lines and isacoustic curves","type":"fact"},{"text":"Stage house dimensions and fly tower","type":"fact"},{"text":"Backstage and support facilities","type":"fact"},{"text":"Acoustic design for performance spaces","type":"fact"},{"text":"Audience egress requirements (Rule 12 PD 1096)","type":"code_provision"},{"text":"Projection room and control booth requirements","type":"fact"}]',
    'ale-dsgn-004-07-theaters-performance'
  ),
  (
    'ALE-DSGN-005-05', 'ALE-DSGN-005',
    'Specialized Health Facilities',
    'concept', 'medium', 'apply', 3,
    ARRAY['mcq_recall','mcq_application','design_application'],
    '[{"text":"DOH Adolescent-Friendly Health Services 2010 — privacy, accessibility, comfort standards","type":"code_provision"},{"text":"DOH Drug Abuse Treatment & Rehabilitation Centers 2003 — 400 sqm min for 30 patients","type":"formula"},{"text":"Counseling/testing room 7.43 sqm","type":"formula"},{"text":"Living quarters clear floor area 7.43 sqm/bed","type":"formula"},{"text":"Dining area 1.40 sqm/person","type":"formula"},{"text":"DOH hospital classification — Level 1 to Level 3","type":"definition"},{"text":"Birthing facility standards","type":"fact"},{"text":"Mental health facility design requirements","type":"fact"}]',
    'ale-dsgn-005-05-specialized-health'
  )
) AS t(ale_id, parent_ale_id, name, node_type, freq, bloom, diff, formats, wiki_items, slug)
WHERE d.acronym = 'ALE'
ON CONFLICT (ale_id) DO UPDATE SET
  name = EXCLUDED.name, exam_frequency = EXCLUDED.exam_frequency,
  bloom_level = EXCLUDED.bloom_level, difficulty = EXCLUDED.difficulty,
  typical_question_formats = EXCLUDED.typical_question_formats,
  wiki_items = EXCLUDED.wiki_items, updated_at = now();

-- ── ALE-LAWS new subtopics: is_cross_ref_only=true ─────────
-- ALE-LAWS-002-07, ALE-LAWS-003-07 through 003-10,
-- ALE-LAWS-004-06, ALE-LAWS-005-07,
-- ALE-LAWS-007-01 through 007-05,
-- ALE-LAWS-008-01 through 008-03 (15 total)

INSERT INTO public.taxonomy_tree (
  ale_id, discipline_id, parent_id, level,
  name, subject_area,
  node_type, exam_frequency, bloom_level, difficulty,
  typical_question_formats, wiki_items,
  is_leaf, is_cross_ref_only, slug
)
SELECT
  t.ale_id,
  d.discipline_id,
  (SELECT node_id FROM public.taxonomy_tree WHERE ale_id = t.parent_ale_id),
  3,
  t.name,
  'Philippine Laws & Codes for Architectural Practice',
  'code_provision'::public.taxonomy_node_type,
  t.freq::public.exam_frequency_level,
  t.bloom::public.bloom_level_type,
  t.diff,
  t.formats,
  t.wiki_items::jsonb,
  true,
  true,  -- ALL ALE-LAWS nodes are cross-ref only
  t.slug
FROM public.disciplines d,
(VALUES
  -- ALE-LAWS-002: Building Standards
  (
    'ALE-LAWS-002-07', 'ALE-LAWS-002',
    'DPWH Construction Standards & Guidelines',
    'medium', 'understand', 2,
    ARRAY['mcq_recall'],
    '[{"text":"DPWH DO 037 — Enforcement of BP 344 accessibility on national roads","type":"code_provision"},{"text":"DPWH DO 062 — Road and curb design standards","type":"code_provision"},{"text":"DPWH-JICA flood control standards","type":"fact"},{"text":"DPWH standard specifications for public works","type":"fact"}]',
    'ale-laws-002-07-dpwh-standards'
  ),
  -- ALE-LAWS-003: Housing & Land Development
  (
    'ALE-LAWS-003-07', 'ALE-LAWS-003',
    'RA 7899 — Amendments to Condominium Act',
    'low', 'remember', 2,
    ARRAY['mcq_recall'],
    '[{"text":"Amendments to RA 4726 provisions","type":"fact"},{"text":"Expanded condominium provisions","type":"fact"},{"text":"Master deed requirements","type":"definition"},{"text":"Common area management","type":"fact"}]',
    'ale-laws-003-07-ra-7899'
  ),
  (
    'ALE-LAWS-003-08', 'ALE-LAWS-003',
    'EO 648 — Human Settlements Regulatory Commission',
    'low', 'remember', 1,
    ARRAY['mcq_recall'],
    '[{"text":"HSRC creation and mandates","type":"definition"},{"text":"Transfer of HLURB functions","type":"fact"},{"text":"Regulation of subdivision and condominium development","type":"fact"}]',
    'ale-laws-003-08-eo-648-hsrc'
  ),
  (
    'ALE-LAWS-003-09', 'ALE-LAWS-003',
    'PD 1216 — Open Space in Residential Subdivisions',
    'medium', 'apply', 2,
    ARRAY['mcq_recall','mcq_application'],
    '[{"text":"Mandatory open space requirement in subdivisions","type":"code_provision"},{"text":"Non-buildable portions of subdivision lots","type":"fact"},{"text":"Community facilities in open spaces","type":"fact"},{"text":"Relationship to PD 957 and BP 220 requirements","type":"cross_ref"}]',
    'ale-laws-003-09-pd-1216'
  ),
  (
    'ALE-LAWS-003-10', 'ALE-LAWS-003',
    'PD 1308 — Environmental Planning Regulation',
    'low', 'remember', 2,
    ARRAY['mcq_recall'],
    '[{"text":"Regulation of environmental planning practice","type":"fact"},{"text":"Relationship to RA 10587 (Environmental Planning Act)","type":"cross_ref"}]',
    'ale-laws-003-10-pd-1308'
  ),
  -- ALE-LAWS-004: Safety, Fire & Environmental
  (
    'ALE-LAWS-004-06', 'ALE-LAWS-004',
    'DOE Guidelines on Energy Conserving Design of Buildings',
    'medium', 'understand', 2,
    ARRAY['mcq_recall','mcq_application'],
    '[{"text":"DOE Energy Conserving Design Guidelines v2008","type":"code_provision"},{"text":"Building envelope thermal performance requirements","type":"fact"},{"text":"OTTV (Overall Thermal Transfer Value) calculations","type":"formula"},{"text":"Lighting power density limits","type":"formula"},{"text":"HVAC efficiency requirements","type":"fact"},{"text":"Relationship to RA 11285 (Energy Efficiency Act)","type":"cross_ref"}]',
    'ale-laws-004-06-doe-energy-guidelines'
  ),
  -- ALE-LAWS-005: Heritage, Utilities & Cross-Border
  (
    'ALE-LAWS-005-07', 'ALE-LAWS-005',
    'PD 1616 — Intramuros Administration Act',
    'low', 'remember', 2,
    ARRAY['mcq_recall'],
    '[{"text":"Intramuros heritage zone designation","type":"code_provision"},{"text":"PD 1616 IRR — design review requirements","type":"fact"},{"text":"Restoration and conservation guidelines","type":"fact"},{"text":"Prohibited building activities within Intramuros","type":"fact"}]',
    'ale-laws-005-07-pd-1616-intramuros'
  ),
  -- ALE-LAWS-007: Environmental & Disaster Laws (new topic)
  (
    'ALE-LAWS-007-01', 'ALE-LAWS-007',
    'PD 1151 — Philippine Environmental Policy',
    'low', 'remember', 1,
    ARRAY['mcq_recall'],
    '[{"text":"Declaration of environmental policy","type":"code_provision"},{"text":"Environmental impact assessment requirements","type":"fact"},{"text":"Relationship to PD 1586 (EIS system)","type":"cross_ref"}]',
    'ale-laws-007-01-pd-1151'
  ),
  (
    'ALE-LAWS-007-02', 'ALE-LAWS-007',
    'PD 1152 — Philippine Environmental Code',
    'medium', 'understand', 2,
    ARRAY['mcq_recall'],
    '[{"text":"Air quality management","type":"fact"},{"text":"Water quality management","type":"fact"},{"text":"Land use management","type":"fact"},{"text":"Natural resources management","type":"fact"},{"text":"Waste management provisions","type":"fact"}]',
    'ale-laws-007-02-pd-1152'
  ),
  (
    'ALE-LAWS-007-03', 'ALE-LAWS-007',
    'RA 6969 — Toxic Substances & Hazardous Waste Control Act',
    'low', 'remember', 2,
    ARRAY['mcq_recall'],
    '[{"text":"Control of toxic substances in construction","type":"fact"},{"text":"Hazardous waste handling in buildings","type":"fact"},{"text":"Asbestos and lead paint regulations","type":"fact"},{"text":"Impact on building materials selection","type":"fact"}]',
    'ale-laws-007-03-ra-6969'
  ),
  (
    'ALE-LAWS-007-04', 'ALE-LAWS-007',
    'RA 10121 — Disaster Risk Reduction & Management Act',
    'medium', 'understand', 2,
    ARRAY['mcq_recall','mcq_application'],
    '[{"text":"National Disaster Risk Reduction and Management Council (NDRRMC)","type":"definition"},{"text":"Local DRRM plans — integration with CLUP","type":"fact"},{"text":"Building design for disaster resilience","type":"fact"},{"text":"Evacuation center design requirements","type":"fact"},{"text":"Climate change adaptation in building design","type":"fact"}]',
    'ale-laws-007-04-ra-10121'
  ),
  (
    'ALE-LAWS-007-05', 'ALE-LAWS-007',
    'RA 9729 — Climate Change Act of 2009',
    'low', 'remember', 2,
    ARRAY['mcq_recall'],
    '[{"text":"Climate Change Commission mandates","type":"definition"},{"text":"Mainstreaming climate change into planning","type":"fact"},{"text":"Building sector adaptation strategies","type":"fact"}]',
    'ale-laws-007-05-ra-9729'
  ),
  -- ALE-LAWS-008: Civil, Labor & Administrative Laws (new topic)
  (
    'ALE-LAWS-008-01', 'ALE-LAWS-008',
    'RA 386 — Civil Code (Architectural Provisions)',
    'medium', 'understand', 2,
    ARRAY['mcq_recall','mcq_application'],
    '[{"text":"Article 1723 — contractor/architect liability for building collapse within 15 years","type":"code_provision"},{"text":"10-year prescriptive period from completion","type":"fact"},{"text":"Solidary liability of architect and contractor","type":"definition"},{"text":"Articles on contracts and obligations relevant to architectural services","type":"fact"}]',
    'ale-laws-008-01-ra-386-civil-code'
  ),
  (
    'ALE-LAWS-008-02', 'ALE-LAWS-008',
    'PD 442 — Labor Code (Construction Provisions)',
    'low', 'remember', 2,
    ARRAY['mcq_recall'],
    '[{"text":"Occupational safety and health standards (OSHS)","type":"fact"},{"text":"Construction safety regulations","type":"fact"},{"text":"Worker welfare provisions on construction sites","type":"fact"},{"text":"DOLE Department Order 13 s.1998 — construction safety","type":"code_provision"}]',
    'ale-laws-008-02-pd-442-labor-code'
  ),
  (
    'ALE-LAWS-008-03', 'ALE-LAWS-008',
    'RA 9285 — Alternative Dispute Resolution Act',
    'low', 'remember', 2,
    ARRAY['mcq_recall'],
    '[{"text":"Mediation and arbitration in construction disputes","type":"fact"},{"text":"Relationship to E.O. 1008 (CIAC)","type":"cross_ref"},{"text":"Court-annexed mediation","type":"fact"}]',
    'ale-laws-008-03-ra-9285'
  )
) AS t(ale_id, parent_ale_id, name, freq, bloom, diff, formats, wiki_items, slug)
WHERE d.acronym = 'ALE'
ON CONFLICT (ale_id) DO UPDATE SET
  name = EXCLUDED.name, exam_frequency = EXCLUDED.exam_frequency,
  bloom_level = EXCLUDED.bloom_level, difficulty = EXCLUDED.difficulty,
  typical_question_formats = EXCLUDED.typical_question_formats,
  wiki_items = EXCLUDED.wiki_items, updated_at = now();


-- ============================================================
-- STEP 3: Propagate is_cross_ref_only on all ALE-LAWS nodes
-- Safety net — ensures nothing under ALE-LAWS is ever
-- accidentally left as cross_ref_only=false
-- ============================================================

WITH RECURSIVE laws_tree AS (
  SELECT node_id FROM public.taxonomy_tree WHERE ale_id = 'ALE-LAWS'
  UNION ALL
  SELECT t.node_id FROM public.taxonomy_tree t
  JOIN laws_tree lt ON t.parent_id = lt.node_id
)
UPDATE public.taxonomy_tree
SET is_cross_ref_only = true
WHERE node_id IN (SELECT node_id FROM laws_tree)
  AND is_cross_ref_only = false;


-- ============================================================
-- STEP 4: Source stubs for v6 nodes that need SME URLs
-- All 15 ALE-LAWS v6 nodes and high-priority non-LAWS nodes
-- Status: is_verified=false until SME confirms URLs
-- ============================================================

INSERT INTO public.taxonomy_sources (node_id, label, url, source_type, is_verified, sort_order)
SELECT tt.node_id, s.label, s.url, s.source_type::public.taxonomy_source_type, false, s.sort_order
FROM (VALUES
  -- ALE-LAWS-002-07
  ('ALE-LAWS-002-07', 'DPWH DO 037 — Official Text', 'https://www.dpwh.gov.ph/dpwh/references/issuances', 'implementing_rules', 0),
  -- ALE-LAWS-003-07
  ('ALE-LAWS-003-07', 'RA 7899 Full Text — Lawphil', 'https://lawphil.net/statutes/repacts/ra1995/ra_7899_1995.html', 'primary_law', 0),
  -- ALE-LAWS-003-08
  ('ALE-LAWS-003-08', 'EO 648 — DHSUD Official Reference', 'https://www.dhsud.gov.ph/', 'regulatory_body', 0),
  -- ALE-LAWS-003-09
  ('ALE-LAWS-003-09', 'PD 1216 Full Text — Lawphil', 'https://lawphil.net/statutes/presdecs/pd1977/pd_1216_1977.html', 'primary_law', 0),
  -- ALE-LAWS-003-10
  ('ALE-LAWS-003-10', 'PD 1308 Full Text — Official Gazette', 'https://lawphil.net/statutes/presdecs/pd1978/pd_1308_1978.html', 'primary_law', 0),
  -- ALE-LAWS-004-06
  ('ALE-LAWS-004-06', 'DOE Energy Conserving Design Guidelines 2008', 'https://www.doe.gov.ph/', 'implementing_rules', 0),
  -- ALE-LAWS-005-07
  ('ALE-LAWS-005-07', 'PD 1616 Full Text — Lawphil', 'https://lawphil.net/statutes/presdecs/pd1979/pd_1616_1979.html', 'primary_law', 0),
  ('ALE-LAWS-005-07', 'IRR of PD 1616 — Intramuros Administration', 'https://intramuros.gov.ph/', 'implementing_rules', 1),
  -- ALE-LAWS-007-01
  ('ALE-LAWS-007-01', 'PD 1151 Full Text — Lawphil', 'https://lawphil.net/statutes/presdecs/pd1977/pd_1151_1977.html', 'primary_law', 0),
  -- ALE-LAWS-007-02
  ('ALE-LAWS-007-02', 'PD 1152 Full Text — Lawphil', 'https://lawphil.net/statutes/presdecs/pd1977/pd_1152_1977.html', 'primary_law', 0),
  -- ALE-LAWS-007-03
  ('ALE-LAWS-007-03', 'RA 6969 Full Text — Official Gazette', 'https://lawphil.net/statutes/repacts/ra1990/ra_6969_1990.html', 'primary_law', 0),
  -- ALE-LAWS-007-04
  ('ALE-LAWS-007-04', 'RA 10121 Full Text — Official Gazette', 'https://www.officialgazette.gov.ph/2010/05/27/republic-act-no-10121/', 'primary_law', 0),
  ('ALE-LAWS-007-04', 'NDRRMC — Official Website', 'https://www.ndrrmc.gov.ph/', 'regulatory_body', 1),
  -- ALE-LAWS-007-05
  ('ALE-LAWS-007-05', 'RA 9729 Full Text — Official Gazette', 'https://www.officialgazette.gov.ph/2009/10/23/republic-act-no-9729/', 'primary_law', 0),
  ('ALE-LAWS-007-05', 'Climate Change Commission', 'https://climate.gov.ph/', 'regulatory_body', 1),
  -- ALE-LAWS-008-01
  ('ALE-LAWS-008-01', 'Civil Code of the Philippines (RA 386) — Lawphil', 'https://lawphil.net/statutes/repacts/ra1950/ra_386_1950.html', 'primary_law', 0),
  -- ALE-LAWS-008-02
  ('ALE-LAWS-008-02', 'PD 442 Labor Code — Official Gazette', 'https://lawphil.net/statutes/presdecs/pd1974/pd_442_1974.html', 'primary_law', 0),
  ('ALE-LAWS-008-02', 'DOLE DO 13 s.1998 — Construction Safety', 'https://www.dole.gov.ph/', 'implementing_rules', 1),
  -- ALE-LAWS-008-03
  ('ALE-LAWS-008-03', 'RA 9285 Full Text — Official Gazette', 'https://www.officialgazette.gov.ph/2004/04/02/republic-act-no-9285/', 'primary_law', 0),
  -- High-priority non-LAWS nodes
  ('ALE-STRC-002-04', 'NSCP 2015 — ASEP Official Publication', 'https://www.asep.org.ph/publications/nscp/', 'reference_standard', 0),
  ('ALE-STRC-002-05', 'NSCP 2015 — ASEP Official Publication', 'https://www.asep.org.ph/publications/nscp/', 'reference_standard', 0),
  ('ALE-UTIL-002-04', 'Philippine Electrical Code — IIEE Publication', 'https://iiee.org.ph/publications/philippine-electrical-code/', 'reference_standard', 0),
  ('ALE-UTIL-001-05', 'Revised National Plumbing Code — DPWH', 'https://www.dpwh.gov.ph/dpwh/references/laws_codes_orders', 'reference_standard', 0)
) AS s(ale_id, label, url, source_type, sort_order)
JOIN public.taxonomy_tree tt ON tt.ale_id = s.ale_id
ON CONFLICT DO NOTHING;


-- ============================================================
-- STEP 5: Verification
-- ============================================================

DO $$
DECLARE
  v_new_topics    INTEGER;
  v_new_subtopics INTEGER;
  v_total_active  INTEGER;
  v_non_crossref  INTEGER;
  v_computation   INTEGER;
  v_sources       INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_new_topics
  FROM public.taxonomy_tree
  WHERE ale_id IN ('ALE-THEO-006','ALE-PRAC-006','ALE-LAWS-007','ALE-LAWS-008');

  SELECT COUNT(*) INTO v_new_subtopics
  FROM public.taxonomy_tree
  WHERE ale_id IN (
    'ALE-HIST-001-08','ALE-HIST-005-05','ALE-HIST-005-06','ALE-HIST-005-07',
    'ALE-HIST-005-08','ALE-HIST-006-06','ALE-HIST-006-07',
    'ALE-THEO-001-06','ALE-THEO-003-04','ALE-THEO-006-01','ALE-THEO-006-02',
    'ALE-PLAN-001-04','ALE-PLAN-005-04',
    'ALE-PRAC-001-05','ALE-PRAC-006-01','ALE-PRAC-006-02','ALE-PRAC-006-03','ALE-PRAC-006-04',
    'ALE-STRC-001-04','ALE-STRC-002-04','ALE-STRC-002-05',
    'ALE-MATL-003-06','ALE-MATL-005-05','ALE-MATL-005-06',
    'ALE-UTIL-001-05','ALE-UTIL-002-04','ALE-UTIL-005-04',
    'ALE-DSGN-003-05','ALE-DSGN-004-05','ALE-DSGN-004-06','ALE-DSGN-004-07','ALE-DSGN-005-05',
    'ALE-LAWS-002-07','ALE-LAWS-003-07','ALE-LAWS-003-08','ALE-LAWS-003-09','ALE-LAWS-003-10',
    'ALE-LAWS-004-06','ALE-LAWS-005-07',
    'ALE-LAWS-007-01','ALE-LAWS-007-02','ALE-LAWS-007-03','ALE-LAWS-007-04','ALE-LAWS-007-05',
    'ALE-LAWS-008-01','ALE-LAWS-008-02','ALE-LAWS-008-03'
  );

  SELECT COUNT(*) INTO v_total_active
  FROM public.taxonomy_tree
  WHERE is_leaf = true AND deprecated_at IS NULL AND is_cross_ref_only = false;

  SELECT COUNT(*) INTO v_non_crossref
  FROM public.taxonomy_tree
  WHERE ale_id LIKE 'ALE-LAWS%' AND is_cross_ref_only = false;

  SELECT COUNT(*) INTO v_computation
  FROM public.taxonomy_tree
  WHERE is_computation_heavy = true AND deprecated_at IS NULL;

  SELECT COUNT(*) INTO v_sources
  FROM public.taxonomy_sources ts
  JOIN public.taxonomy_tree tt ON tt.node_id = ts.node_id
  WHERE tt.ale_id IN (
    'ALE-STRC-002-04','ALE-STRC-002-05','ALE-UTIL-001-05','ALE-UTIL-002-04',
    'ALE-LAWS-002-07','ALE-LAWS-003-07','ALE-LAWS-003-08','ALE-LAWS-003-09','ALE-LAWS-003-10',
    'ALE-LAWS-004-06','ALE-LAWS-005-07','ALE-LAWS-007-01','ALE-LAWS-007-02','ALE-LAWS-007-03',
    'ALE-LAWS-007-04','ALE-LAWS-007-05','ALE-LAWS-008-01','ALE-LAWS-008-02','ALE-LAWS-008-03'
  );

  RAISE NOTICE '=== Taxonomy v6.0 Seed Complete ===';
  RAISE NOTICE 'New topic nodes:             % (expected 4)',  v_new_topics;
  RAISE NOTICE 'New subtopic nodes:          % (expected 47)', v_new_subtopics;
  RAISE NOTICE 'Total active leaf nodes:     % (expected 219)',v_total_active;
  RAISE NOTICE 'ALE-LAWS non-crossref nodes: % (expected 0)', v_non_crossref;
  RAISE NOTICE 'Computation-heavy nodes:     %', v_computation;
  RAISE NOTICE 'Source stubs seeded:         %', v_sources;

  IF v_new_topics < 4 THEN
    RAISE WARNING 'Only % of 4 topic nodes found. Check for slug conflicts.', v_new_topics;
  END IF;
  IF v_new_subtopics < 47 THEN
    RAISE WARNING 'Only % of 47 subtopic nodes found. Check for ale_id conflicts.', v_new_subtopics;
  END IF;
  IF v_non_crossref > 0 THEN
    RAISE EXCEPTION 'CRITICAL: % ALE-LAWS nodes are NOT marked is_cross_ref_only. Fix immediately.', v_non_crossref;
  END IF;
END $$;
