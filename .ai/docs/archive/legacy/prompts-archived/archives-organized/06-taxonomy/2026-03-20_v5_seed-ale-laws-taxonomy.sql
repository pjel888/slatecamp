-- ============================================================
-- Migration: Seed ALE-LAWS Taxonomy
-- Philippine Laws & Codes for Architectural Practice
-- 1 subject · 6 topics · 33 subtopics
-- All nodes marked is_cross_ref_only = true
-- trg_check_question_topic prevents questions from being tagged here
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- PREREQ: Confirm ALE discipline exists and get its UUID
-- ─────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.disciplines WHERE acronym = 'ALE') THEN
    RAISE EXCEPTION 'ALE discipline not found. Cannot seed ALE-LAWS nodes.';
  END IF;
  IF EXISTS (SELECT 1 FROM public.taxonomy_tree WHERE ale_id = 'ALE-LAWS') THEN
    RAISE NOTICE 'ALE-LAWS subject already exists. Running upsert (safe to re-run).';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- STEP 1: Subject node (level=1)
-- ─────────────────────────────────────────────────────────────

INSERT INTO public.taxonomy_tree (
  ale_id, discipline_id, parent_id, level,
  name, subject_area,
  prc_area, area_weight_pct, subject_weight_within_area_pct,
  description, is_leaf, is_cross_ref_only, slug,
  mastery_criteria, wiki_items
)
SELECT
  'ALE-LAWS',
  d.discipline_id,
  NULL,
  1,
  'Philippine Laws & Codes for Architectural Practice',
  'Philippine Laws & Codes for Architectural Practice',
  'cross-reference',
  0,
  0,
  'Cross-reference index of all laws and codes relevant to architectural practice. This subject does not carry its own exam weight — law questions appear across Areas A, B, and C. Each law node links bidirectionally to the subjects where it is applied.',
  false,
  true,
  'philippine-laws-codes',
  '{"mastery_threshold_accuracy_pct": 75, "critical_topics_for_pass": ["ALE-LAWS-001","ALE-LAWS-002","ALE-LAWS-003","ALE-LAWS-004"], "note": "Laws questions are distributed across all Areas A, B, and C. Every law in this subject should be known by the section that governs what."}'::jsonb,
  '[]'::jsonb
FROM public.disciplines d
WHERE d.acronym = 'ALE'
ON CONFLICT (ale_id) DO UPDATE SET
  name                           = EXCLUDED.name,
  prc_area                       = EXCLUDED.prc_area,
  area_weight_pct                = EXCLUDED.area_weight_pct,
  subject_weight_within_area_pct = EXCLUDED.subject_weight_within_area_pct,
  description                    = EXCLUDED.description,
  is_cross_ref_only              = EXCLUDED.is_cross_ref_only,
  mastery_criteria               = EXCLUDED.mastery_criteria,
  updated_at                     = now();

-- ─────────────────────────────────────────────────────────────
-- STEP 2: 6 Topic nodes (level=2)
-- ─────────────────────────────────────────────────────────────

INSERT INTO public.taxonomy_tree (
  ale_id, discipline_id, parent_id, level,
  name, subject_area, is_leaf, is_cross_ref_only, slug, wiki_items
)
SELECT
  t.ale_id,
  d.discipline_id,
  (SELECT node_id FROM public.taxonomy_tree WHERE ale_id = 'ALE-LAWS'),
  2,
  t.name,
  'Philippine Laws & Codes for Architectural Practice',
  false,
  true,
  t.slug,
  '[]'::jsonb
FROM public.disciplines d,
(VALUES
  ('ALE-LAWS-001', 'Professional Regulation Laws',                    'ale-laws-001-professional-regulation'),
  ('ALE-LAWS-002', 'Building Standards & Development Controls',        'ale-laws-002-building-standards'),
  ('ALE-LAWS-003', 'Housing & Land Development Laws',                  'ale-laws-003-housing-land'),
  ('ALE-LAWS-004', 'Safety, Fire & Environmental Laws',               'ale-laws-004-safety-fire-environmental'),
  ('ALE-LAWS-005', 'Heritage, Utilities & Cross-Border Practice',     'ale-laws-005-heritage-utilities'),
  ('ALE-LAWS-006', 'Allied Professions & Emerging Practice Laws',     'ale-laws-006-allied-professions')
) AS t(ale_id, name, slug)
WHERE d.acronym = 'ALE'
ON CONFLICT (ale_id) DO UPDATE SET
  name       = EXCLUDED.name,
  updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- STEP 3: 33 Subtopic nodes (level=3, is_leaf=true)
-- One INSERT per topic group for readability
-- ─────────────────────────────────────────────────────────────

-- ── ALE-LAWS-001: Professional Regulation Laws (5 subtopics) ──

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
  (SELECT node_id FROM public.taxonomy_tree WHERE ale_id = 'ALE-LAWS-001'),
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
  true,
  t.slug
FROM public.disciplines d,
(VALUES
  (
    'ALE-LAWS-001-01',
    'RA 9266 — Architecture Act of 2004',
    'high', 'apply', 2,
    ARRAY['mcq_recall','mcq_application'],
    '[{"text":"Replaced RA 5499. Enacted March 17, 2004","type":"code_provision"},{"text":"Exclusive practice rights — only registered architects may prepare, sign, and seal architectural documents","type":"definition"},{"text":"Scope of architecture practice (Sec 4) — planning, design, specification, supervision of construction","type":"definition"},{"text":"PRBoA structure — 1 Chairman + 2 Members; 3-year terms; max 2 consecutive","type":"definition"},{"text":"Corporate Practice (Sec 29) — 75% architect ownership required","type":"definition"},{"text":"Intellectual Property (Sec 33) — architect retains ownership of all instruments of service regardless of construction status","type":"definition"},{"text":"Seal provisions (Sec 20) — unlawful to affix seal to documents not personally prepared or supervised","type":"definition"},{"text":"Civil Code Art. 1723 — solidary liability for 10 years from completion for structural failure; 15-year prescriptive period","type":"fact"},{"text":"Penalties — practice without license: fine PHP 50,000-200,000 and/or 6 months-6 years imprisonment","type":"definition"}]',
    'ale-laws-001-01-ra-9266'
  ),
  (
    'ALE-LAWS-001-02',
    'RA 9184 — Government Procurement Reform Act',
    'medium', 'understand', 2,
    ARRAY['mcq_recall','mcq_application'],
    '[{"text":"Regulates all government bidding and procurement","type":"fact"},{"text":"PhilGEPS (Philippine Government Electronic Procurement System) — mandatory electronic posting","type":"definition"},{"text":"GPPB (Government Procurement Policy Board) — oversight body","type":"definition"},{"text":"Competitive bidding process: pre-procurement conference → advertisement → pre-bid → bid submission → bid evaluation → post-qualification → award","type":"definition"},{"text":"Alternative methods: limited source, direct contracting, repeat order, shopping, negotiated procurement","type":"fact"},{"text":"Relevance: architects in government practice must comply; private architects must understand when bidding on government contracts","type":"fact"}]',
    'ale-laws-001-02-ra-9184'
  ),
  (
    'ALE-LAWS-001-03',
    'RA 10912 — CPD Act of 2016',
    'medium', 'remember', 1,
    ARRAY['mcq_recall'],
    '[{"text":"45 CPD units per 3-year compliance period for license renewal (RA 10912 + PRBoA Resolution)","type":"code_provision"},{"text":"WARNING: Many reviewers and older references state 15 units — this is WRONG. The correct requirement is 45 units per 3-year period.","type":"warning"},{"text":"CPD providers must be accredited by PRBoA","type":"fact"},{"text":"Covers: seminars, conventions, training, self-directed learning","type":"fact"}]',
    'ale-laws-001-03-ra-10912'
  ),
  (
    'ALE-LAWS-001-04',
    'RA 544 — Civil Engineering Law',
    'medium', 'understand', 2,
    ARRAY['mcq_recall','mcq_application'],
    '[{"text":"Governs scope of civil engineering practice","type":"fact"},{"text":"Relevance to architecture: defines what civil engineers CANNOT do — they are not authorized to sign or prepare architectural documents (plans, specifications)","type":"definition"},{"text":"The exclusive architectural scope under RA 9266 means civil engineers cannot encroach on architectural practice, just as architects cannot sign structural/civil engineering documents","type":"code_provision"}]',
    'ale-laws-001-04-ra-544'
  ),
  (
    'ALE-LAWS-001-05',
    'PD 223 — Creating the PRC',
    'low', 'remember', 1,
    ARRAY['mcq_recall'],
    '[{"text":"Created the Professional Regulation Commission","type":"fact"},{"text":"PRC supervises all professional regulatory boards including PRBoA","type":"fact"},{"text":"Administers licensure examinations for all regulated professions","type":"fact"}]',
    'ale-laws-001-05-pd-223'
  )
) AS t(ale_id, name, freq, bloom, diff, formats, wiki_items, slug)
WHERE d.acronym = 'ALE'
ON CONFLICT (ale_id) DO UPDATE SET
  name = EXCLUDED.name, exam_frequency = EXCLUDED.exam_frequency,
  bloom_level = EXCLUDED.bloom_level, difficulty = EXCLUDED.difficulty,
  typical_question_formats = EXCLUDED.typical_question_formats,
  wiki_items = EXCLUDED.wiki_items, updated_at = now();

-- ── ALE-LAWS-002: Building Standards & Development Controls (6 subtopics) ──

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
  (SELECT node_id FROM public.taxonomy_tree WHERE ale_id = 'ALE-LAWS-002'),
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
  true,
  t.slug
FROM public.disciplines d,
(VALUES
  (
    'ALE-LAWS-002-01',
    'PD 1096 — National Building Code of the Philippines',
    'high', 'apply', 2,
    ARRAY['mcq_recall','mcq_calculation','design_application'],
    '[{"text":"THE SINGLE MOST TESTED LAW ON THE ALE","type":"fact"},{"text":"Administered by DPWH through Office of the Building Official (OBO)","type":"fact"},{"text":"10 Occupancy Groups (A through J) — determines allowable use, fire protection, egress requirements","type":"definition"},{"text":"Development Controls: PSO, FLAR, BHL, setbacks — vary by zone and occupancy","type":"definition"},{"text":"Light and Ventilation — window area minimums: 10% habitable, 5% bath/toilet, 10% kitchen","type":"definition"},{"text":"Ceiling Heights — naturally ventilated 2.70m (1st floor), 2.40m (upper); air-con 2.40m/2.10m","type":"formula"},{"text":"Minimum Room Sizes — habitable 6.0 sqm, kitchen 3.0 sqm, bath 1.2 sqm","type":"formula"},{"text":"Building permits: apply to OBO with complete architectural, structural, MEP plans","type":"fact"},{"text":"Certificate of Occupancy — required before occupancy; issued after final inspection","type":"fact"}]',
    'ale-laws-002-01-pd-1096'
  ),
  (
    'ALE-LAWS-002-02',
    'IRR of PD 1096 (2005 Implementing Rules)',
    'high', 'apply', 3,
    ARRAY['mcq_recall','mcq_calculation'],
    '[{"text":"Provides specific numerical standards for PD 1096 enforcement","type":"fact"},{"text":"Detailed setback tables per zone and lot type","type":"fact"},{"text":"Firewall specifications and fire-resistance ratings","type":"fact"},{"text":"Parking requirements per occupancy type","type":"fact"},{"text":"Stairway requirements: min width 1.12m, max riser 200mm, min tread 250mm","type":"formula"},{"text":"EXAM TIP: The IRR is where the specific numbers live. PD 1096 gives the rule; the IRR gives the measurement. Most numerical ALE questions cite the IRR.","type":"exam_tip"}]',
    'ale-laws-002-02-irr-pd-1096'
  ),
  (
    'ALE-LAWS-002-03',
    'BP 344 — Accessibility Law',
    'high', 'apply', 2,
    ARRAY['mcq_recall','mcq_application','design_application'],
    '[{"text":"Batas Pambansa 344 — enacted 1983; requires accessibility in all public buildings","type":"code_provision"},{"text":"Ramps: max 1:12 gradient, 6.0m max run before landing, 1.20m min width","type":"formula"},{"text":"Doors: 0.90m clear width, lever handles, max 13mm threshold","type":"formula"},{"text":"Corridors: 1.20m min, 1.50m preferred","type":"formula"},{"text":"Accessible WC: 1.70m × 1.80m clear floor area, 1.50m turning circle, grab bars at 0.80-0.85m AFF","type":"formula"},{"text":"Accessible Parking: 3.70m × 5.00m, 1 per 50 regular slots (minimum 1)","type":"formula"},{"text":"Tactile pavement: bar (directional) and dot (hazard) patterns","type":"fact"},{"text":"Signage: Braille + raised characters at 1.52-1.65m AFF","type":"fact"}]',
    'ale-laws-002-03-bp-344'
  ),
  (
    'ALE-LAWS-002-04',
    'RA 9442 — Magna Carta for Persons with Disability',
    'medium', 'understand', 2,
    ARRAY['mcq_recall','mcq_application'],
    '[{"text":"Expanded BP 344 provisions; strengthened enforcement and penalties","type":"fact"},{"text":"Mandates accessible features in all public and private buildings open to public","type":"fact"},{"text":"Penalties for non-compliance: fine PHP 50,000-150,000 and/or imprisonment","type":"definition"},{"text":"20% discount for PWDs on admission fees, transportation, hotels, restaurants","type":"fact"}]',
    'ale-laws-002-04-ra-9442'
  ),
  (
    'ALE-LAWS-002-05',
    '2024 Revised IRR of BP 344',
    'medium', 'remember', 2,
    ARRAY['mcq_recall'],
    '[{"text":"Updated dimensional standards reflecting current best practices","type":"fact"},{"text":"Enhanced provisions for sensory disabilities (visual, hearing)","type":"fact"},{"text":"Expanded scope to include digital accessibility considerations for building information systems","type":"fact"},{"text":"EXAM TIP: The 2024 IRR is testable in the June 2025 onwards ALE. Know that it updates but does not replace the dimensional standards — it refines them.","type":"exam_tip"}]',
    'ale-laws-002-05-irr-bp-344-2024'
  ),
  (
    'ALE-LAWS-002-06',
    'DepEd Order No. 66 s.2012 — School Building Design Standards',
    'medium', 'understand', 2,
    ARRAY['mcq_recall','mcq_application'],
    '[{"text":"GOVERNING INSTRUMENT","type":"heading"},{"text":"DepEd Order No. 66 s.2012 — Revised Standard Designs for Public School Buildings","type":"code_provision"},{"text":"Mandates minimum classroom area: 7.0m × 9.0m = 63 sqm per classroom","type":"formula"},{"text":"Minimum ceiling height: 3.0m (ground floor), 2.7m (upper floors)","type":"formula"},{"text":"Ventilation: cross-ventilation required; minimum window area 20% of floor area","type":"formula"},{"text":"BP 344 compliance required: all school buildings must be accessible","type":"cross_ref"},{"text":"PD 1096 (National Building Code) compliance required for all structural and fire safety provisions","type":"cross_ref"}]',
    'ale-laws-002-06-deped-order-66'
  )
) AS t(ale_id, name, freq, bloom, diff, formats, wiki_items, slug)
WHERE d.acronym = 'ALE'
ON CONFLICT (ale_id) DO UPDATE SET
  name = EXCLUDED.name, exam_frequency = EXCLUDED.exam_frequency,
  bloom_level = EXCLUDED.bloom_level, difficulty = EXCLUDED.difficulty,
  typical_question_formats = EXCLUDED.typical_question_formats,
  wiki_items = EXCLUDED.wiki_items, updated_at = now();

-- ── ALE-LAWS-003: Housing & Land Development Laws (6 subtopics) ──

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
  (SELECT node_id FROM public.taxonomy_tree WHERE ale_id = 'ALE-LAWS-003'),
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
  true,
  t.slug
FROM public.disciplines d,
(VALUES
  (
    'ALE-LAWS-003-01',
    'PD 957 — Subdivision and Condominium Buyers'' Decree',
    'high', 'apply', 2,
    ARRAY['mcq_recall','mcq_application'],
    '[{"text":"Protects buyers of subdivision lots and condominium units","type":"fact"},{"text":"Road hierarchy requirements: Major 10-15m ROW, Collector 8m, Minor 6m, Alley 3m","type":"formula"},{"text":"Open space: minimum 30% of gross area","type":"formula"},{"text":"Open market lot sizes: SD 120sqm, Duplex 96sqm, Rowhouse 50sqm; floor area min 42sqm","type":"formula"},{"text":"Medium cost lots: SD 100sqm, Duplex 72sqm, Rowhouse 48sqm; floor area min 30sqm","type":"formula"},{"text":"License to Sell required from DHSUD before any lot/unit can be sold","type":"fact"}]',
    'ale-laws-003-01-pd-957'
  ),
  (
    'ALE-LAWS-003-02',
    'BP 220 — Economic and Socialized Housing',
    'high', 'apply', 2,
    ARRAY['mcq_recall','mcq_application'],
    '[{"text":"Reduced standards for socialized and economic housing","type":"fact"},{"text":"Socialized lots: SD 64sqm, Duplex 48sqm, Rowhouse 28sqm; floor area min 18sqm","type":"formula"},{"text":"Economic lots: SD 72sqm, Duplex 54sqm, Rowhouse 36sqm; floor area min 22sqm","type":"formula"},{"text":"Reduced road standards allowed (narrower ROWs)","type":"fact"},{"text":"Price ceiling set annually by DHSUD","type":"fact"},{"text":"EXAM TIP: BP 220 vs PD 957 is a classic ALE comparison question. BP 220 = smaller lots for lower-income housing; PD 957 = market-rate buyers protection.","type":"exam_tip"}]',
    'ale-laws-003-02-bp-220'
  ),
  (
    'ALE-LAWS-003-03',
    'RA 7279 — UDHA (Urban Development and Housing Act)',
    'high', 'apply', 2,
    ARRAY['mcq_recall','mcq_application'],
    '[{"text":"Balanced housing development — developers of ≥50 units must allocate 15% of subdivision cost for socialized housing (5% for condominiums)","type":"formula"},{"text":"Socialized housing programs: community mortgage, resettlement, land banking","type":"fact"},{"text":"Defines professional squatting and penalties","type":"fact"}]',
    'ale-laws-003-03-ra-7279'
  ),
  (
    'ALE-LAWS-003-04',
    'RA 4726 — The Condominium Act',
    'high', 'remember', 2,
    ARRAY['mcq_recall','mcq_application'],
    '[{"text":"NOTE: The actual Condominium Act is RA 4726, enacted 1966. RA 9648 is a different law — do NOT cite RA 9648 as the Condominium Act","type":"warning"},{"text":"Master Deed — defines individual units and common areas; registered with Registry of Deeds","type":"definition"},{"text":"Condominium Corporation — non-profit corporation of unit owners; manages common areas","type":"definition"},{"text":"Unit ownership — includes undivided interest in common areas proportional to unit size","type":"definition"},{"text":"Common areas — lobbies, corridors, elevators, utilities, amenities owned collectively","type":"definition"}]',
    'ale-laws-003-04-ra-4726'
  ),
  (
    'ALE-LAWS-003-05',
    'RA 7160 — Local Government Code',
    'high', 'apply', 3,
    ARRAY['mcq_application','design_application'],
    '[{"text":"Mandates CLUPs (Comprehensive Land Use Plans) for all LGUs","type":"fact"},{"text":"Grants zoning authority to local governments","type":"fact"},{"text":"Eminent domain — local government power to acquire private property for public use","type":"definition"},{"text":"Police power — basis for zoning ordinances and building regulations","type":"definition"}]',
    'ale-laws-003-05-ra-7160'
  ),
  (
    'ALE-LAWS-003-06',
    'PD 1067 — Water Code',
    'high', 'apply', 2,
    ARRAY['mcq_recall','mcq_calculation','design_application'],
    '[{"text":"Easement distances from waterways:","type":"fact"},{"text":"3 meters — from banks of streams less than 3m wide","type":"formula"},{"text":"20 meters — from banks of rivers/streams more than 3m wide","type":"formula"},{"text":"40 meters — from shores of seas, lakes, and navigable rivers","type":"formula"},{"text":"No structures allowed within easement zones; applies to all building permits","type":"code_provision"}]',
    'ale-laws-003-06-pd-1067'
  )
) AS t(ale_id, name, freq, bloom, diff, formats, wiki_items, slug)
WHERE d.acronym = 'ALE'
ON CONFLICT (ale_id) DO UPDATE SET
  name = EXCLUDED.name, exam_frequency = EXCLUDED.exam_frequency,
  bloom_level = EXCLUDED.bloom_level, difficulty = EXCLUDED.difficulty,
  typical_question_formats = EXCLUDED.typical_question_formats,
  wiki_items = EXCLUDED.wiki_items, updated_at = now();

-- ── ALE-LAWS-004: Safety, Fire & Environmental Laws (5 subtopics) ──

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
  (SELECT node_id FROM public.taxonomy_tree WHERE ale_id = 'ALE-LAWS-004'),
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
  true,
  t.slug
FROM public.disciplines d,
(VALUES
  (
    'ALE-LAWS-004-01',
    'RA 9514 — Revised Fire Code of the Philippines',
    'high', 'apply', 3,
    ARRAY['mcq_recall','mcq_calculation','design_application'],
    '[{"text":"Fire egress requirements: means of egress = exit access + exit + exit discharge","type":"fact"},{"text":"Travel distances: max 46m unsprinklered, 61m sprinklered","type":"formula"},{"text":"Exit width min 1.12m (44in); calculated from occupant load","type":"formula"},{"text":"Sprinkler requirements based on occupancy and floor area","type":"fact"},{"text":"Occupant load factors: assembly 0.65 sqm/person (fixed seats), office 9.3 sqm/person, mercantile 2.8 sqm/person","type":"formula"},{"text":"Fire Safety Inspection Certificate (FSIC) required for Building Permit and Occupancy Permit","type":"fact"}]',
    'ale-laws-004-01-ra-9514'
  ),
  (
    'ALE-LAWS-004-02',
    'PD 1586 — Environmental Impact Assessment System',
    'medium', 'understand', 2,
    ARRAY['mcq_recall','mcq_application'],
    '[{"text":"ECC (Environmental Compliance Certificate) required before construction of environmentally critical projects","type":"fact"},{"text":"EIA process: screening → scoping → EIS preparation → review → decision","type":"definition"},{"text":"Administered by DENR-EMB (Environmental Management Bureau)","type":"fact"},{"text":"Environmentally critical projects: heavy industries, infrastructure, resource extraction, waste facilities","type":"fact"},{"text":"Environmentally critical areas: national parks, prime agricultural land, mangrove areas, coral reef areas","type":"fact"}]',
    'ale-laws-004-02-pd-1586'
  ),
  (
    'ALE-LAWS-004-03',
    'RA 9003 — Ecological Solid Waste Management Act',
    'medium', 'understand', 2,
    ARRAY['mcq_recall'],
    '[{"text":"Mandates waste segregation at source: biodegradable, recyclable, residual, special/hazardous","type":"fact"},{"text":"Materials Recovery Facilities (MRF) required in every barangay","type":"fact"},{"text":"Building provisions: waste storage rooms, segregation areas, collection points per floor","type":"fact"}]',
    'ale-laws-004-03-ra-9003'
  ),
  (
    'ALE-LAWS-004-04',
    'RA 9275 — Philippine Clean Water Act',
    'low', 'understand', 2,
    ARRAY['mcq_recall'],
    '[{"text":"Sewage treatment requirements for buildings and subdivisions","type":"fact"},{"text":"Effluent standards for discharge to water bodies","type":"fact"},{"text":"Septage management requirements for LGUs","type":"fact"}]',
    'ale-laws-004-04-ra-9275'
  ),
  (
    'ALE-LAWS-004-05',
    'RA 11285 — Energy Efficiency and Conservation Act',
    'medium', 'understand', 2,
    ARRAY['mcq_recall'],
    '[{"text":"Designated Establishments — consume ≥500 koe/year; must appoint Energy Manager","type":"definition"},{"text":"MEPS (Minimum Energy Performance Standards) for equipment and appliances","type":"definition"},{"text":"Energy Audit requirements — mandatory for large buildings","type":"fact"},{"text":"Relevance to ALE: architects must design buildings that meet energy efficiency requirements; cited in green building ratings (BERDE, EDGE)","type":"fact"}]',
    'ale-laws-004-05-ra-11285'
  )
) AS t(ale_id, name, freq, bloom, diff, formats, wiki_items, slug)
WHERE d.acronym = 'ALE'
ON CONFLICT (ale_id) DO UPDATE SET
  name = EXCLUDED.name, exam_frequency = EXCLUDED.exam_frequency,
  bloom_level = EXCLUDED.bloom_level, difficulty = EXCLUDED.difficulty,
  typical_question_formats = EXCLUDED.typical_question_formats,
  wiki_items = EXCLUDED.wiki_items, updated_at = now();

-- ── ALE-LAWS-005: Heritage, Utilities & Cross-Border Practice (6 subtopics) ──

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
  (SELECT node_id FROM public.taxonomy_tree WHERE ale_id = 'ALE-LAWS-005'),
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
  true,
  t.slug
FROM public.disciplines d,
(VALUES
  (
    'ALE-LAWS-005-01',
    'RA 10066 — National Cultural Heritage Act',
    'medium', 'apply', 2,
    ARRAY['mcq_recall','mcq_application'],
    '[{"text":"Classifications: National Cultural Treasure, Important Cultural Property, National Historical Landmark","type":"definition"},{"text":"NHCP (National Historical Commission of the Philippines) authority","type":"fact"},{"text":"Demolition controls — presumption of importance for structures >50 years old; permit required","type":"code_provision"},{"text":"Adaptive reuse encouraged over demolition","type":"fact"},{"text":"Penalties for unauthorized demolition or alteration of heritage structures","type":"fact"}]',
    'ale-laws-005-01-ra-10066'
  ),
  (
    'ALE-LAWS-005-02',
    'RA 1378 — Revised National Plumbing Code',
    'high', 'apply', 2,
    ARRAY['mcq_recall','mcq_application'],
    '[{"text":"Minimum fixture requirements per occupancy type","type":"fact"},{"text":"Septic tank design standards: 2/3 digestive, 1/3 dosing; minimum capacity based on occupant load","type":"formula"},{"text":"Drainage principles: gravity flow, minimum pipe sizes, venting requirements","type":"fact"},{"text":"Water seal: minimum 50mm (2in) depth in all traps","type":"formula"}]',
    'ale-laws-005-02-ra-1378'
  ),
  (
    'ALE-LAWS-005-03',
    'Philippine Electrical Code (PEC)',
    'medium', 'understand', 2,
    ARRAY['mcq_recall'],
    '[{"text":"Service entrance requirements and metering","type":"fact"},{"text":"Wire sizing per circuit load and distance","type":"fact"},{"text":"Circuit protection: breakers, GFCI for wet locations","type":"fact"},{"text":"Emergency power requirements for hospitals and high-rise buildings","type":"fact"}]',
    'ale-laws-005-03-pec'
  ),
  (
    'ALE-LAWS-005-04',
    'NSCP 2015 — National Structural Code',
    'medium', 'apply', 3,
    ARRAY['mcq_recall','mcq_calculation'],
    '[{"text":"Load combinations: 1.4D; 1.2D+1.6L; 1.2D+1.0E+L","type":"formula"},{"text":"Seismic zone: Zone 2 for entire Philippines (NSCP 2015) — NOTE: Old NSCP editions and some reviewers still incorrectly state Zone 4; the current NSCP 2015 reclassification uses Zone 2","type":"warning"},{"text":"Structural system requirements per seismic zone","type":"fact"},{"text":"Wind load provisions: exposure categories B, C, D","type":"fact"}]',
    'ale-laws-005-04-nscp-2015'
  ),
  (
    'ALE-LAWS-005-05',
    'RA 9266 Sec. 33 — Intellectual Property',
    'high', 'apply', 2,
    ARRAY['mcq_application'],
    '[{"text":"Frequently tested as standalone provision","type":"exam_tip"},{"text":"Architect retains ownership of plans and instruments of service","type":"fact"},{"text":"Ownership persists regardless of whether project is built","type":"fact"},{"text":"Client may use plans only for the specific project for which they were prepared","type":"fact"},{"text":"Unauthorized use of architectural plans constitutes infringement","type":"fact"}]',
    'ale-laws-005-05-ra-9266-sec-33'
  ),
  (
    'ALE-LAWS-005-06',
    'Cross-Border Practice',
    'low', 'remember', 2,
    ARRAY['mcq_recall'],
    '[{"text":"ASEAN Architect Register — mutual recognition agreement; requires 10 years post-registration experience; allows practice in other ASEAN countries under local supervision","type":"definition"},{"text":"APEC Architect Register — Asia-Pacific Economic Cooperation framework; requires 7 years experience; reciprocal recognition","type":"definition"},{"text":"Requirements: good standing, no disciplinary action, compliance with host country regulations","type":"fact"},{"text":"Philippine architects must register with PRBoA''s International Affairs Division","type":"fact"}]',
    'ale-laws-005-06-cross-border-practice'
  )
) AS t(ale_id, name, freq, bloom, diff, formats, wiki_items, slug)
WHERE d.acronym = 'ALE'
ON CONFLICT (ale_id) DO UPDATE SET
  name = EXCLUDED.name, exam_frequency = EXCLUDED.exam_frequency,
  bloom_level = EXCLUDED.bloom_level, difficulty = EXCLUDED.difficulty,
  typical_question_formats = EXCLUDED.typical_question_formats,
  wiki_items = EXCLUDED.wiki_items, updated_at = now();

-- ── ALE-LAWS-006: Allied Professions & Emerging Practice Laws (5 subtopics) ──

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
  (SELECT node_id FROM public.taxonomy_tree WHERE ale_id = 'ALE-LAWS-006'),
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
  true,
  t.slug
FROM public.disciplines d,
(VALUES
  (
    'ALE-LAWS-006-01',
    'RA 8534 — Interior Design Act',
    'medium', 'understand', 2,
    ARRAY['mcq_recall','mcq_application'],
    '[{"text":"Governs the practice of interior design as a profession separate from architecture","type":"fact"},{"text":"Licensed Interior Designer (LID) — exclusive right to practice interior design for fee","type":"definition"},{"text":"Architectural boundary: architects may include interior design within their architectural services; however, for projects where interior design is the primary commissioned service, only LIDs or architects with interior design scope under RA 9266 may practice","type":"code_provision"},{"text":"PRC Board of Interior Design — administers the Interior Design Licensure Examination","type":"definition"},{"text":"Relevance to ALE: defines the scope boundary between architecture and interior design; helps answer ethics questions about scope of practice","type":"fact"}]',
    'ale-laws-006-01-ra-8534'
  ),
  (
    'ALE-LAWS-006-02',
    'RA 8549 — Landscape Architecture Act',
    'low', 'understand', 2,
    ARRAY['mcq_recall'],
    '[{"text":"Governs the practice of landscape architecture as a separate licensed profession","type":"fact"},{"text":"Registered Landscape Architect (RLA) — exclusive right to practice landscape architecture for fee","type":"definition"},{"text":"Relevance to ALE: architecture includes site planning which interfaces with landscape architecture; architects typically hire RLAs as sub-consultants for detailed landscape design","type":"fact"}]',
    'ale-laws-006-02-ra-8549'
  ),
  (
    'ALE-LAWS-006-03',
    'RA 10587 — Environmental Planning Act',
    'medium', 'understand', 2,
    ARRAY['mcq_recall','mcq_application'],
    '[{"text":"Governs the practice of environmental planning (urban and regional planning) as a licensed profession","type":"fact"},{"text":"Licensed Environmental Planner (EnP) — PRC-licensed; may prepare CLUPs and zoning ordinances","type":"definition"},{"text":"Architects and urban planners overlap in practice: architects with planning specialization work alongside EnPs on large-scale development projects","type":"fact"},{"text":"CLUPs (Comprehensive Land Use Plans) under RA 7160 are prepared by EnPs; architects implement the development controls defined in those plans","type":"code_provision"}]',
    'ale-laws-006-03-ra-10587'
  ),
  (
    'ALE-LAWS-006-04',
    'RA 11032 — Ease of Doing Business Act',
    'medium', 'apply', 2,
    ARRAY['mcq_recall','mcq_application'],
    '[{"text":"Mandates streamlined government transactions including building permit processing","type":"fact"},{"text":"Building permits: LGUs must act within 10 working days for simple projects; 20 working days for complex projects — no more indefinite delays","type":"definition"},{"text":"Unified permit system: single portal for locational clearance + building permit + fire safety inspection (where adopted by LGUs)","type":"fact"},{"text":"Penalties for non-compliant LGU officials who delay processing beyond mandated periods","type":"fact"},{"text":"EXAM TIP: Previously, the ALE tested only PD 1096 for permit process. RA 11032 is increasingly tested as a practice law topic — know the processing time limits.","type":"exam_tip"}]',
    'ale-laws-006-04-ra-11032'
  ),
  (
    'ALE-LAWS-006-05',
    'RA 11313 — Safe Spaces Act',
    'low', 'understand', 2,
    ARRAY['mcq_application'],
    '[{"text":"Prohibits gender-based sexual harassment in public spaces, online spaces, workplaces, and educational establishments","type":"fact"},{"text":"Design implication: buildings and public spaces should be designed to reduce harassment risk — adequate lighting, surveillance sight lines, elimination of isolated dead-end spaces","type":"definition"},{"text":"Relevance to ALE: addresses environmental design as a crime prevention and safety tool; may appear in practice ethics questions or design application contexts","type":"fact"}]',
    'ale-laws-006-05-ra-11313'
  )
) AS t(ale_id, name, freq, bloom, diff, formats, wiki_items, slug)
WHERE d.acronym = 'ALE'
ON CONFLICT (ale_id) DO UPDATE SET
  name = EXCLUDED.name, exam_frequency = EXCLUDED.exam_frequency,
  bloom_level = EXCLUDED.bloom_level, difficulty = EXCLUDED.difficulty,
  typical_question_formats = EXCLUDED.typical_question_formats,
  wiki_items = EXCLUDED.wiki_items, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- STEP 4: Propagate is_cross_ref_only to all ALE-LAWS descendants
-- Safety net — all nodes above are inserted with is_cross_ref_only=true
-- but this ensures nothing slips through
-- ─────────────────────────────────────────────────────────────

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

-- ─────────────────────────────────────────────────────────────
-- STEP 5: Seed taxonomy_cross_references
-- Source = ALE-LAWS subtopic, Target = substantive subject subtopic
-- relationship_type = 'law_applies_to'
-- One special case: ALE-LAWS-006-04 → ALE-LAWS-002-01 = 'see_also' (law-to-law)
-- ─────────────────────────────────────────────────────────────

INSERT INTO public.taxonomy_cross_references (source_node_id, target_node_id, relationship_type)
SELECT
  src.node_id,
  tgt.node_id,
  xref.rel_type
FROM (VALUES
  -- ALE-LAWS-001
  ('ALE-LAWS-001-01', 'ALE-PRAC-001-01', 'law_applies_to'),
  ('ALE-LAWS-001-02', 'ALE-PRAC-001-03', 'law_applies_to'),
  ('ALE-LAWS-001-03', 'ALE-PRAC-001-01', 'law_applies_to'),
  ('ALE-LAWS-001-04', 'ALE-PRAC-001-03', 'law_applies_to'),
  ('ALE-LAWS-001-05', 'ALE-PRAC-001-03', 'law_applies_to'),
  -- ALE-LAWS-002
  ('ALE-LAWS-002-01', 'ALE-DSGN-001-01', 'law_applies_to'),
  ('ALE-LAWS-002-01', 'ALE-UTIL-004-01', 'law_applies_to'),
  ('ALE-LAWS-002-02', 'ALE-DSGN-001-01', 'law_applies_to'),
  ('ALE-LAWS-002-02', 'ALE-DSGN-001-04', 'law_applies_to'),
  ('ALE-LAWS-002-03', 'ALE-DSGN-002-01', 'law_applies_to'),
  ('ALE-LAWS-002-04', 'ALE-DSGN-002-01', 'law_applies_to'),
  ('ALE-LAWS-002-05', 'ALE-DSGN-002-01', 'law_applies_to'),
  ('ALE-LAWS-002-06', 'ALE-DSGN-005-02', 'law_applies_to'),
  ('ALE-LAWS-002-06', 'ALE-LAWS-002-01', 'see_also'),
  ('ALE-LAWS-002-06', 'ALE-LAWS-002-03', 'see_also'),
  -- ALE-LAWS-003
  ('ALE-LAWS-003-01', 'ALE-DSGN-003-03', 'law_applies_to'),
  ('ALE-LAWS-003-01', 'ALE-PLAN-003-01', 'law_applies_to'),
  ('ALE-LAWS-003-02', 'ALE-DSGN-003-03', 'law_applies_to'),
  ('ALE-LAWS-003-02', 'ALE-PLAN-003-01', 'law_applies_to'),
  ('ALE-LAWS-003-03', 'ALE-DSGN-003-03', 'law_applies_to'),
  ('ALE-LAWS-003-03', 'ALE-PLAN-003-01', 'law_applies_to'),
  ('ALE-LAWS-003-04', 'ALE-DSGN-003-03', 'law_applies_to'),
  ('ALE-LAWS-003-05', 'ALE-PLAN-005-03', 'law_applies_to'),
  ('ALE-LAWS-003-05', 'ALE-PRAC-004-04', 'law_applies_to'),
  ('ALE-LAWS-003-06', 'ALE-PLAN-004-02', 'law_applies_to'),
  -- ALE-LAWS-004
  ('ALE-LAWS-004-01', 'ALE-UTIL-004-01', 'law_applies_to'),
  ('ALE-LAWS-004-01', 'ALE-DSGN-001-01', 'law_applies_to'),
  ('ALE-LAWS-004-02', 'ALE-PLAN-004-02', 'law_applies_to'),
  ('ALE-LAWS-004-03', 'ALE-PLAN-004-04', 'law_applies_to'),
  ('ALE-LAWS-004-04', 'ALE-UTIL-001-03', 'law_applies_to'),
  ('ALE-LAWS-004-05', 'ALE-UTIL-006-01', 'law_applies_to'),
  ('ALE-LAWS-004-05', 'ALE-MATL-005-04', 'law_applies_to'),
  -- ALE-LAWS-005
  ('ALE-LAWS-005-01', 'ALE-HIST-006-05', 'law_applies_to'),
  ('ALE-LAWS-005-02', 'ALE-UTIL-001-01', 'law_applies_to'),
  ('ALE-LAWS-005-03', 'ALE-UTIL-003-01', 'law_applies_to'),
  ('ALE-LAWS-005-04', 'ALE-STRC-005-03', 'law_applies_to'),
  ('ALE-LAWS-005-05', 'ALE-PRAC-001-01', 'law_applies_to'),
  ('ALE-LAWS-005-06', 'ALE-PRAC-001-03', 'law_applies_to'),
  -- ALE-LAWS-006
  ('ALE-LAWS-006-01', 'ALE-PRAC-001-03', 'law_applies_to'),
  ('ALE-LAWS-006-02', 'ALE-PRAC-001-03', 'law_applies_to'),
  ('ALE-LAWS-006-02', 'ALE-PLAN-005-01', 'law_applies_to'),
  ('ALE-LAWS-006-03', 'ALE-PLAN-005-03', 'law_applies_to'),
  ('ALE-LAWS-006-03', 'ALE-PRAC-001-03', 'law_applies_to'),
  ('ALE-LAWS-006-04', 'ALE-PRAC-004-04', 'law_applies_to'),
  ('ALE-LAWS-006-04', 'ALE-LAWS-002-01', 'see_also'),
  ('ALE-LAWS-006-05', 'ALE-DSGN-005-01', 'law_applies_to'),
  ('ALE-LAWS-006-05', 'ALE-DSGN-005-02', 'law_applies_to')
) AS xref(src_ale_id, tgt_ale_id, rel_type)
JOIN public.taxonomy_tree src ON src.ale_id = xref.src_ale_id
JOIN public.taxonomy_tree tgt ON tgt.ale_id = xref.tgt_ale_id
WHERE tgt.node_id IS NOT NULL  -- skip cross-refs to nodes not yet seeded
ON CONFLICT (source_node_id, target_node_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- STEP 6: Seed taxonomy_sources (all verified URLs from v5.0 JSON)
-- ─────────────────────────────────────────────────────────────

-- Helper: delete existing sources for ALE-LAWS nodes then re-insert
-- (sources are authoritative from the JSON)
DELETE FROM public.taxonomy_sources
WHERE node_id IN (
  SELECT node_id FROM public.taxonomy_tree
  WHERE ale_id LIKE 'ALE-LAWS-%' AND is_leaf = true
);

INSERT INTO public.taxonomy_sources (node_id, label, url, source_type, is_verified, sort_order)
SELECT
  tt.node_id,
  s.label,
  s.url,
  s.source_type::public.taxonomy_source_type,
  true,
  s.sort_order
FROM (VALUES
  -- ALE-LAWS-001-01
  ('ALE-LAWS-001-01','RA 9266 Full Text — Official Gazette','https://www.officialgazette.gov.ph/2004/03/17/republic-act-no-9266-2/','primary_law',0),
  ('ALE-LAWS-001-01','RA 9266 — Congress of the Philippines','https://lawphil.net/statutes/repacts/ra2004/ra_9266_2004.html','primary_law',1),
  ('ALE-LAWS-001-01','PRBoA — Professional Regulation Commission','https://www.prc.gov.ph/architecture','regulatory_body',2),
  -- ALE-LAWS-001-02
  ('ALE-LAWS-001-02','RA 9184 Full Text — Official Gazette','https://www.officialgazette.gov.ph/2003/01/10/republic-act-no-9184/','primary_law',0),
  ('ALE-LAWS-001-02','PhilGEPS — Official Portal','https://www.philgeps.gov.ph/','regulatory_body',1),
  ('ALE-LAWS-001-02','GPPB — Government Procurement Policy Board','https://www.gppb.gov.ph/','regulatory_body',2),
  -- ALE-LAWS-001-03
  ('ALE-LAWS-001-03','RA 10912 Full Text — Official Gazette','https://www.officialgazette.gov.ph/2016/07/27/republic-act-no-10912/','primary_law',0),
  ('ALE-LAWS-001-03','PRBoA CPD Requirements — PRC','https://www.prc.gov.ph/cpd','regulatory_body',1),
  -- ALE-LAWS-001-04
  ('ALE-LAWS-001-04','RA 544 Full Text — Official Gazette','https://lawphil.net/statutes/repacts/ra1950/ra_544_1950.html','primary_law',0),
  -- ALE-LAWS-001-05
  ('ALE-LAWS-001-05','PD 223 Full Text — Official Gazette','https://lawphil.net/statutes/presdecs/pd1973/pd_223_1973.html','primary_law',0),
  ('ALE-LAWS-001-05','PRC Official Website','https://www.prc.gov.ph/','regulatory_body',1),
  -- ALE-LAWS-002-01
  ('ALE-LAWS-002-01','PD 1096 Full Text — Official Gazette','https://www.dpwh.gov.ph/DPWH/files/nbc/PD.pdf','primary_law',0),
  ('ALE-LAWS-002-01','DPWH — Office of the Building Official','https://www.dpwh.gov.ph/dpwh/references/laws_codes_orders/PD1096','regulatory_body',1),
  ('ALE-LAWS-002-01','NBC 2005 IRR — DPWH Official PDF','https://www.dpwh.gov.ph/dpwh/references/laws_codes_orders/PD1096','implementing_rules',2),
  -- ALE-LAWS-002-02
  ('ALE-LAWS-002-02','PD 1096 IRR 2005 — DPWH Official PDF','https://www.dpwh.gov.ph/dpwh/references/laws_codes_orders/PD1096','implementing_rules',0),
  ('ALE-LAWS-002-02','DPWH Memorandum Circulars — NBC Amendments','https://www.dpwh.gov.ph/dpwh/references/laws_codes_orders','implementing_rules',1),
  -- ALE-LAWS-002-03
  ('ALE-LAWS-002-03','BP 344 Full Text — Official Gazette','https://lawphil.net/statutes/batas/bp1982/bp_344_1982.html','primary_law',0),
  ('ALE-LAWS-002-03','2024 Revised IRR of BP 344 — NCDA Official PDF','https://ncda.gov.ph/disability-laws/implementing-rules-and-regulations/revised-irr-of-bp-344/','implementing_rules',1),
  ('ALE-LAWS-002-03','NCDA — National Council on Disability Affairs','https://ncda.gov.ph/','regulatory_body',2),
  -- ALE-LAWS-002-04
  ('ALE-LAWS-002-04','RA 9442 Full Text — Official Gazette','https://www.officialgazette.gov.ph/2007/04/30/republic-act-no-9442/','primary_law',0),
  ('ALE-LAWS-002-04','NCDA — National Council on Disability Affairs','https://ncda.gov.ph/','regulatory_body',1),
  -- ALE-LAWS-002-05
  ('ALE-LAWS-002-05','2024 Revised IRR of BP 344 — NCDA Official PDF','https://ncda.gov.ph/disability-laws/implementing-rules-and-regulations/revised-irr-of-bp-344/','implementing_rules',0),
  -- ALE-LAWS-002-06
  ('ALE-LAWS-002-06','DepEd Order No. 66 s.2012 — Official Text','https://www.deped.gov.ph/wp-content/uploads/2012/10/DO_s2012_66.pdf','implementing_rules',0),
  ('ALE-LAWS-002-06','DepEd — Department of Education','https://www.deped.gov.ph/','regulatory_body',1),
  -- ALE-LAWS-003-01
  ('ALE-LAWS-003-01','PD 957 Full Text — Official Gazette','https://lawphil.net/statutes/presdecs/pd1976/pd_957_1976.html','primary_law',0),
  ('ALE-LAWS-003-01','DHSUD — Department of Human Settlements','https://www.dhsud.gov.ph/','regulatory_body',1),
  -- ALE-LAWS-003-02
  ('ALE-LAWS-003-02','BP 220 Full Text — Official Gazette','https://lawphil.net/statutes/batas/bp1982/bp_220_1982.html','primary_law',0),
  ('ALE-LAWS-003-02','DHSUD — Socialized Housing Guidelines','https://www.dhsud.gov.ph/','regulatory_body',1),
  -- ALE-LAWS-003-03
  ('ALE-LAWS-003-03','RA 7279 Full Text — Official Gazette','https://www.officialgazette.gov.ph/1992/03/24/republic-act-no-7279/','primary_law',0),
  ('ALE-LAWS-003-03','DHSUD — Urban Development and Housing Act','https://www.dhsud.gov.ph/urban-development/','regulatory_body',1),
  -- ALE-LAWS-003-04
  ('ALE-LAWS-003-04','RA 4726 Full Text — Official Gazette','https://lawphil.net/statutes/repacts/ra1966/ra_4726_1966.html','primary_law',0),
  ('ALE-LAWS-003-04','DHSUD — Condominium Registration Guidelines','https://www.dhsud.gov.ph/condominium/','regulatory_body',1),
  -- ALE-LAWS-003-05
  ('ALE-LAWS-003-05','RA 7160 Full Text — Official Gazette','https://www.officialgazette.gov.ph/1991/10/10/republic-act-no-7160/','primary_law',0),
  ('ALE-LAWS-003-05','DILG — Department of Interior and Local Government','https://www.dilg.gov.ph/','regulatory_body',1),
  ('ALE-LAWS-003-05','HLURB/DHSUD — CLUP Guidebooks','https://www.dhsud.gov.ph/wp-content/uploads/2021/04/CLUP-Guidebooks.pdf','implementing_rules',2),
  -- ALE-LAWS-003-06
  ('ALE-LAWS-003-06','PD 1067 Full Text — Official Gazette','https://lawphil.net/statutes/presdecs/pd1976/pd_1067_1976.html','primary_law',0),
  ('ALE-LAWS-003-06','NWRB — National Water Resources Board','https://www.nwrb.gov.ph/','regulatory_body',1),
  -- ALE-LAWS-004-01
  ('ALE-LAWS-004-01','RA 9514 Full Text — Official Gazette','https://lawphil.net/statutes/repacts/ra2008/ra_9514_2008.html','primary_law',0),
  ('ALE-LAWS-004-01','RA 9514 IRR — Bureau of Fire Protection','https://www.bfp.gov.ph/laws-and-policies/','implementing_rules',1),
  ('ALE-LAWS-004-01','BFP — Bureau of Fire Protection','https://www.bfp.gov.ph/','regulatory_body',2),
  -- ALE-LAWS-004-02
  ('ALE-LAWS-004-02','PD 1586 Full Text — Official Gazette','https://lawphil.net/statutes/presdecs/pd1978/pd_1586_1978.html','primary_law',0),
  ('ALE-LAWS-004-02','DENR-EMB — EIA Process and Forms','https://emb.gov.ph/pcco/eia/','regulatory_body',1),
  ('ALE-LAWS-004-02','DENR-EMB — ECC Application Guidelines','https://emb.gov.ph/pcco/eia/eia-forms/','implementing_rules',2),
  -- ALE-LAWS-004-03
  ('ALE-LAWS-004-03','RA 9003 Full Text — Official Gazette','https://lawphil.net/statutes/repacts/ra2001/ra_9003_2001.html','primary_law',0),
  ('ALE-LAWS-004-03','DENR — Solid Waste Management Guidelines','https://emb.gov.ph/solid-waste-management/','regulatory_body',1),
  -- ALE-LAWS-004-04
  ('ALE-LAWS-004-04','RA 9275 Full Text — Official Gazette','https://lawphil.net/statutes/repacts/ra2004/ra_9275_2004.html','primary_law',0),
  ('ALE-LAWS-004-04','DENR — Clean Water Act Implementation','https://emb.gov.ph/water-quality/','regulatory_body',1),
  -- ALE-LAWS-004-05
  ('ALE-LAWS-004-05','RA 11285 Full Text — Official Gazette','https://www.officialgazette.gov.ph/2019/04/12/republic-act-no-11285/','primary_law',0),
  ('ALE-LAWS-004-05','DOE — Department of Energy','https://www.doe.gov.ph/','regulatory_body',1),
  ('ALE-LAWS-004-05','DOE — EEC Act IRR','https://www.doe.gov.ph/eec/republic-act-11285','implementing_rules',2),
  -- ALE-LAWS-005-01
  ('ALE-LAWS-005-01','RA 10066 Full Text — Official Gazette','https://www.officialgazette.gov.ph/2010/03/26/republic-act-no-10066/','primary_law',0),
  ('ALE-LAWS-005-01','NHCP — National Historical Commission of the Philippines','https://nhcp.gov.ph/','heritage_body',1),
  ('ALE-LAWS-005-01','National Museum of the Philippines','https://www.nationalmuseum.gov.ph/','heritage_body',2),
  -- ALE-LAWS-005-02
  ('ALE-LAWS-005-02','RA 1378 Full Text — Official Gazette','https://lawphil.net/statutes/repacts/ra1955/ra_1378_1955.html','primary_law',0),
  ('ALE-LAWS-005-02','DPWH — Revised National Plumbing Code PDF','https://www.dpwh.gov.ph/dpwh/references/laws_codes_orders','reference_standard',1),
  -- ALE-LAWS-005-03
  ('ALE-LAWS-005-03','Philippine Electrical Code — IIEE Official Publication','https://iiee.org.ph/publications/philippine-electrical-code/','reference_standard',0),
  ('ALE-LAWS-005-03','IIEE — Institute of Integrated Electrical Engineers','https://iiee.org.ph/','regulatory_body',1),
  -- ALE-LAWS-005-04
  ('ALE-LAWS-005-04','NSCP 2015 — ASEP Official Publication','https://www.asep.org.ph/publications/nscp/','reference_standard',0),
  ('ALE-LAWS-005-04','ASEP — Association of Structural Engineers of the Philippines','https://www.asep.org.ph/','regulatory_body',1),
  -- ALE-LAWS-005-05
  ('ALE-LAWS-005-05','RA 9266 Full Text — Official Gazette (see Sec. 33)','https://www.officialgazette.gov.ph/2004/03/17/republic-act-no-9266-2/','primary_law',0),
  -- ALE-LAWS-005-06
  ('ALE-LAWS-005-06','ASEAN Architect Register — ACRA Official Page','https://asean-architects.org/','regulatory_body',0),
  ('ALE-LAWS-005-06','APEC Architect Register — Official Page','https://www.apecarchitects.org/','regulatory_body',1),
  ('ALE-LAWS-005-06','PRBoA — International Affairs Division','https://www.prc.gov.ph/architecture','regulatory_body',2),
  -- ALE-LAWS-006-01
  ('ALE-LAWS-006-01','RA 8534 Full Text — Official Gazette','https://lawphil.net/statutes/repacts/ra1998/ra_8534_1998.html','primary_law',0),
  -- ALE-LAWS-006-02
  ('ALE-LAWS-006-02','RA 8549 Full Text — Official Gazette','https://lawphil.net/statutes/repacts/ra1998/ra_8549_1998.html','primary_law',0),
  -- ALE-LAWS-006-03
  ('ALE-LAWS-006-03','RA 10587 Full Text — Official Gazette','https://lawphil.net/statutes/repacts/ra2013/ra_10587_2013.html','primary_law',0),
  -- ALE-LAWS-006-04
  ('ALE-LAWS-006-04','RA 11032 Full Text — Official Gazette','https://www.officialgazette.gov.ph/2018/05/28/republic-act-no-11032/','primary_law',0),
  ('ALE-LAWS-006-04','ARTA — Anti-Red Tape Authority','https://arta.gov.ph/','regulatory_body',1),
  -- ALE-LAWS-006-05
  ('ALE-LAWS-006-05','RA 11313 Full Text — Official Gazette','https://www.officialgazette.gov.ph/2019/04/17/republic-act-no-11313/','primary_law',0)
) AS s(ale_id, label, url, source_type, sort_order)
JOIN public.taxonomy_tree tt ON tt.ale_id = s.ale_id;

-- ─────────────────────────────────────────────────────────────
-- STEP 7: Verification
-- ─────────────────────────────────────────────────────────────

DO $$
DECLARE
  subject_count  INTEGER;
  topic_count    INTEGER;
  subtopic_count INTEGER;
  source_count   INTEGER;
  xref_count     INTEGER;
  non_crossref   INTEGER;
BEGIN
  SELECT COUNT(*) INTO subject_count  FROM public.taxonomy_tree WHERE ale_id = 'ALE-LAWS';
  SELECT COUNT(*) INTO topic_count    FROM public.taxonomy_tree WHERE ale_id LIKE 'ALE-LAWS-00_' AND level = 2;
  SELECT COUNT(*) INTO subtopic_count FROM public.taxonomy_tree WHERE ale_id LIKE 'ALE-LAWS-0%-%' AND is_leaf = true;
  SELECT COUNT(*) INTO source_count   FROM public.taxonomy_sources ts
    JOIN public.taxonomy_tree tt ON tt.node_id = ts.node_id
    WHERE tt.ale_id LIKE 'ALE-LAWS-%';
  SELECT COUNT(*) INTO xref_count FROM public.taxonomy_cross_references tcr
    JOIN public.taxonomy_tree src ON src.node_id = tcr.source_node_id
    WHERE src.ale_id LIKE 'ALE-LAWS-%';
  SELECT COUNT(*) INTO non_crossref FROM public.taxonomy_tree
    WHERE ale_id LIKE 'ALE-LAWS%' AND is_cross_ref_only = false;

  RAISE NOTICE '=== ALE-LAWS Seed Complete ===';
  RAISE NOTICE 'Subject nodes:       % (expected 1)',  subject_count;
  RAISE NOTICE 'Topic nodes:         % (expected 6)',  topic_count;
  RAISE NOTICE 'Subtopic nodes:      % (expected 33)', subtopic_count;
  RAISE NOTICE 'Sources seeded:      % (expected 66)', source_count;
  RAISE NOTICE 'Cross-references:    % (expected 47)', xref_count;
  RAISE NOTICE 'Non-cross-ref nodes: % (expected 0)',  non_crossref;

  IF non_crossref > 0 THEN
    RAISE WARNING '% ALE-LAWS nodes are NOT marked is_cross_ref_only. Fix this before adding questions.', non_crossref;
  END IF;

  IF subtopic_count < 33 THEN
    RAISE WARNING 'Only % of 33 expected subtopics were seeded. Check for slug conflicts.', subtopic_count;
  END IF;

  -- Confirm trigger is active (questions cannot be tagged to ALE-LAWS)
  RAISE NOTICE 'Trigger trg_check_question_topic is active — questions cannot be tagged to ALE-LAWS nodes.';
END $$;
