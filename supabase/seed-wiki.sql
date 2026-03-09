-- =============================================================
-- 02: WIKI SEED DATA (SUBJECT-BASED TAXONOMY)
-- =============================================================

-- =============================================================
-- 02: EXHAUSTIVE WIKI SEED DATA (PRBoA SYLLABUS TAXONOMY)
-- =============================================================

-- -------------------------------------------------------------
-- LEVEL 1: ROOT CATEGORIES (The 8 Core Subjects)
-- -------------------------------------------------------------
INSERT INTO public.wiki_categories (id, parent_id, name, slug, description, order_index)
VALUES
    ('00000000-0000-0000-0000-000000000001', NULL, 'History of Architecture', 'history-of-architecture', 'Global and Philippine architectural history, from antiquity to contemporary movements.', 1),
    ('00000000-0000-0000-0000-000000000002', NULL, 'Theory of Architecture', 'theory-of-architecture', 'Design principles, spatial psychology, anthropometrics, and tropical design.', 2),
    ('00000000-0000-0000-0000-000000000003', NULL, 'Professional Practice', 'professional-practice', 'Architectural services, SPP, code of ethics, firm management, and compensation.', 3),
    ('00000000-0000-0000-0000-000000000004', NULL, 'Building Laws', 'building-laws', 'PD 1096, RA 9266, BP 344, Fire Code, and other vital Philippine construction regulations.', 4),
    ('00000000-0000-0000-0000-000000000005', NULL, 'Building Materials & Construction', 'building-materials-construction', 'Material properties, construction methodologies, detailing, and finishes.', 5),
    ('00000000-0000-0000-0000-000000000006', NULL, 'Building Utilities', 'building-utilities', 'Plumbing, sanitary, electrical, mechanical, acoustics, and illumination systems.', 6),
    ('00000000-0000-0000-0000-000000000007', NULL, 'Structural Conceptualization', 'structural-conceptualization', 'Statics, strength of materials, seismic analysis, and structural systems design.', 7),
    ('00000000-0000-0000-0000-000000000008', NULL, 'Architectural Design & Site Planning', 'architectural-design-site-planning', 'Space programming, site analysis, urban planning, and programmatic development.', 8)
ON CONFLICT (id) DO NOTHING;


-- -------------------------------------------------------------
-- LEVEL 2: SUBCATEGORIES
-- -------------------------------------------------------------

-- Under Root 1: History of Architecture
INSERT INTO public.wiki_categories (id, parent_id, name, slug, description, order_index)
VALUES
    ('00000000-0000-0000-0001-000000000101', '00000000-0000-0000-0000-000000000001', 'Global Architecture (Pre-Historic to Modern)', 'global-architecture', 'Western and global historical paradigms including Greek, Roman, Gothic, and Renaissance.', 1),
    ('00000000-0000-0000-0001-000000000102', '00000000-0000-0000-0000-000000000001', 'Asian & Islamic Architecture', 'asian-islamic-architecture', 'Architectural evolution in East Asia, Southeast Asia, South Asia, and the Islamic world.', 2),
    ('00000000-0000-0000-0001-000000000103', '00000000-0000-0000-0000-000000000001', 'Philippine Architecture', 'philippine-architecture', 'Pre-colonial, Spanish, American, and Post-War Philippine architectural heritage.', 3)
ON CONFLICT (id) DO NOTHING;


-- Under Root 2: Theory of Architecture
INSERT INTO public.wiki_categories (id, parent_id, name, slug, description, order_index)
VALUES
    ('00000000-0000-0000-0002-000000000201', '00000000-0000-0000-0000-000000000002', 'Elements & Principles of Design', 'elements-principles-design', 'Point, line, plane, volume, proportion, scale, and balance.', 1),
    ('00000000-0000-0000-0002-000000000202', '00000000-0000-0000-0000-000000000002', 'Tropical & Climatic Design', 'tropical-climatic-design', 'Passive cooling, sun path analysis, wind rose, and designing for the Philippine climate.', 2),
    ('00000000-0000-0000-0002-000000000203', '00000000-0000-0000-0000-000000000002', 'Environmental Psychology', 'environmental-psychology', 'Proxemics, anthropometrics, ergonomics, and behavioral responses to space.', 3)
ON CONFLICT (id) DO NOTHING;

-- Under Root 3: Professional Practice
INSERT INTO public.wiki_categories (id, parent_id, name, slug, description, order_index)
VALUES
    ('00000000-0000-0000-0003-000000000301', '00000000-0000-0000-0000-000000000003', 'Standards of Professional Practice (SPP)', 'standards-professional-practice', 'SPP Documents 201 through 209 detailing all scopes of architectural services.', 1),
    ('00000000-0000-0000-0003-000000000302', '00000000-0000-0000-0000-000000000003', 'Code of Ethical Conduct', 'code-of-ethical-conduct', 'UAP Document 200, the Architects Credo, and responsibilities to the public and client.', 2),
    ('00000000-0000-0000-0003-000000000303', '00000000-0000-0000-0000-000000000003', 'Building Contracts & Project Management', 'contracts-project-management', 'UAP Document 301 (General Conditions), specification writing, and CIAC arbitration.', 3)
ON CONFLICT (id) DO NOTHING;

-- Under Root 4: Building Laws
INSERT INTO public.wiki_categories (id, parent_id, name, slug, description, order_index)
VALUES
    ('00000000-0000-0000-0004-000000000401', '00000000-0000-0000-0000-000000000004', 'PD 1096: National Building Code', 'pd-1096-national-building-code', 'The foundation of Philippine building standards.', 1),
    ('00000000-0000-0000-0004-000000000402', '00000000-0000-0000-0000-000000000004', 'RA 9266: Architecture Act of 2004', 'ra-9266-architecture-act', 'The law governing the licensure and practice of architecture in the Philippines.', 2),
    ('00000000-0000-0000-0004-000000000403', '00000000-0000-0000-0000-000000000004', 'Housing & Real Estate Laws', 'housing-real-estate-laws', 'BP 220, PD 957, and DHSUD guidelines for residential developments.', 3),
    ('00000000-0000-0000-0004-000000000404', '00000000-0000-0000-0000-000000000004', 'Life Safety & Accessibility', 'life-safety-accessibility', 'RA 9514 (Fire Code) and BP 344 (Accessibility Law).', 4)
ON CONFLICT (id) DO NOTHING;

-- Under Root 5: Building Materials & Construction
INSERT INTO public.wiki_categories (id, parent_id, name, slug, description, order_index)
VALUES
    ('00000000-0000-0000-0005-000000000501', '00000000-0000-0000-0000-000000000005', 'Wood & Carpentry', 'wood-carpentry', 'Timber properties, joinery, and board materials.', 1),
    ('00000000-0000-0000-0005-000000000502', '00000000-0000-0000-0000-000000000005', 'Concrete & Masonry', 'concrete-masonry', 'Cement mixtures, curing, rebars, CHB, and stone works.', 2),
    ('00000000-0000-0000-0005-000000000503', '00000000-0000-0000-0000-000000000005', 'Metals, Glass & Plastics', 'metals-glass-plastics', 'Ferrous/non-ferrous metals, glazing systems, and synthetic materials.', 3),
    ('00000000-0000-0000-0005-000000000504', '00000000-0000-0000-0000-000000000005', 'Finishes & Coatings', 'finishes-coatings', 'Paints, varnishes, hardware, and surface defects.', 4)
ON CONFLICT (id) DO NOTHING;

-- Under Root 6: Building Utilities
INSERT INTO public.wiki_categories (id, parent_id, name, slug, description, order_index)
VALUES
    ('00000000-0000-0000-0006-000000000601', '00000000-0000-0000-0000-000000000006', 'Plumbing & Sanitary Systems', 'plumbing-sanitary-systems', 'Water distribution, waste disposal, and the Revised Plumbing Code (RA 1378).', 1),
    ('00000000-0000-0000-0006-000000000602', '00000000-0000-0000-0000-000000000006', 'Electrical & Illumination', 'electrical-illumination', 'Power distribution, PEC basics, lighting metrics, and fixture types.', 2),
    ('00000000-0000-0000-0006-000000000603', '00000000-0000-0000-0000-000000000006', 'Mechanical & Acoustics', 'mechanical-acoustics', 'HVAC systems, escalators/elevators, and the physics of sound isolation.', 3)
ON CONFLICT (id) DO NOTHING;

-- Under Root 7: Structural Conceptualization
INSERT INTO public.wiki_categories (id, parent_id, name, slug, description, order_index)
VALUES
    ('00000000-0000-0000-0007-000000000701', '00000000-0000-0000-0000-000000000007', 'Statics & Strength of Materials', 'statics-strength-of-materials', 'Forces, moments, shear, stress, and strain.', 1),
    ('00000000-0000-0000-0007-000000000702', '00000000-0000-0000-0000-000000000007', 'Seismic & Wind Design (NSCP)', 'seismic-wind-design', 'National Structural Code principles for earthquake and typhoon resistance.', 2)
ON CONFLICT (id) DO NOTHING;

-- Under Root 8: Architectural Design & Site Planning
INSERT INTO public.wiki_categories (id, parent_id, name, slug, description, order_index)
VALUES
    ('00000000-0000-0000-0008-000000000801', '00000000-0000-0000-0000-000000000008', 'Site Analysis & Development', 'site-analysis-development', 'Topography, soil bearing, vegetation, and site planning principles.', 1),
    ('00000000-0000-0000-0008-000000000802', '00000000-0000-0000-0000-000000000008', 'Urban & Regional Planning', 'urban-regional-planning', 'History of cities, zoning grids, and human settlement models.', 2),
    ('00000000-0000-0000-0008-000000000803', '00000000-0000-0000-0000-000000000008', 'Building Typologies', 'building-typologies', 'Specific programming for hospitals, schools, commercial, and residential complexes.', 3)
ON CONFLICT (id) DO NOTHING;


-- -------------------------------------------------------------
-- LEVEL 3: GRANDCHILD CATEGORIES (The "Deep Cuts" for Exam Mastery)
-- -------------------------------------------------------------

-- Deep Cut 1: Breaking down PD 1096 (Because this is too massive for one folder)
INSERT INTO public.wiki_categories (id, parent_id, name, slug, description, order_index)
VALUES
    ('00000000-0000-0000-0041-000000004101', '00000000-0000-0000-0004-000000000401', 'Rule 7 & 8: Classification, Light, & Ventilation', 'nbcp-rule-7-8', 'The most tested mathematical section. AMBF, PSO, setbacks, and BHL.', 1),
    ('00000000-0000-0000-0041-000000004102', '00000000-0000-0000-0004-000000000401', 'Rule 12: General Design & Construction Requirements', 'nbcp-rule-12', 'Excavation, veneer, stairs, and egress parameters.', 2)
ON CONFLICT (id) DO NOTHING;

-- Deep Cut 2: Breaking down Housing Laws (To prevent mixing up BP 220 and PD 957)
INSERT INTO public.wiki_categories (id, parent_id, name, slug, description, order_index)
VALUES
    ('00000000-0000-0000-0043-000000004301', '00000000-0000-0000-0004-000000000403', 'BP 220: Economic & Socialized Housing', 'bp-220-economic-housing', 'Relaxed standards for affordable developments. Minimum lot sizes and roads.', 1),
    ('00000000-0000-0000-0043-000000004302', '00000000-0000-0000-0004-000000000403', 'PD 957: Open Market & Condominiums', 'pd-957-open-market', 'Subdivision and Condominium Buyers Protective Decree standards.', 2)
ON CONFLICT (id) DO NOTHING;

-- Deep Cut 3: Breaking down Professional Practice Services
INSERT INTO public.wiki_categories (id, parent_id, name, slug, description, order_index)
VALUES
    ('00000000-0000-0000-0031-000000003101', '00000000-0000-0000-0003-000000000301', 'Pre-Design & Regular Design Services (SPP 201-202)', 'spp-201-202-design-services', 'Feasibility studies, SD, DD, CD phases, and standard compensation setups.', 1),
    ('00000000-0000-0000-0031-000000003102', '00000000-0000-0000-0003-000000000301', 'Specialized & Construction Services (SPP 203-206)', 'spp-203-206-specialized-construction', 'Acoustics, interiors, full-time supervision, and construction management.', 2)
ON CONFLICT (id) DO NOTHING;

-- 3. Sample Wiki Pages (Linked to their proper subject categories)
INSERT INTO public.wiki_pages (id, category_id, title, slug, markdown_content, tags, is_free, order_index)
VALUES
    ('00000000-0000-0000-0000-000000000011',
     '00000000-0000-0000-0000-00000000000a', -- Category: National Building Code
     'PD 1096 — National Building Code of the Philippines',
     'pd-1096-national-building-code',
     E'# PD 1096 — National Building Code of the Philippines\n\n## Overview\n\n**Presidential Decree No. 1096**, also known as the **National Building Code of the Philippines (NBCP)**, was signed on February 19, 1977. It is the primary law governing the design, construction, use, occupancy, and maintenance of all buildings and structures in the Philippines.\n\n## Key Provisions\n\n### Purpose (Section 102)\nThe Code aims to safeguard life, health, property, and public welfare by regulating construction activities.\n\n### Scope (Section 103)\nApplies to the design, location, siting, construction, alteration, repair, conversion, use, occupancy, maintenance, moving, and demolition of every building or structure.\n\n### Administration\n- **DPWH** — Primary implementing agency\n- **Local Building Officials (LBOs)** — Issue building permits\n- **Board of Referees** — Settles disputes\n\n## Important Rules\n\n| Rule | Title | Key Content |\n|------|-------|-------------|\n| Rule 1 | General Provisions | Purpose, scope, definitions |\n| Rule 7 | Classification and General Requirements of All Buildings by Use or Type of Occupancy | 10 occupancy groups (A-J) |\n| Rule 8 | Rules on Light, Ventilation, and Sanitation | Minimum openings, ceiling heights |\n| Rule 9 | Fire Zones and Fire-Resistive Standards | Fire zone classification |\n\n## Exam Tips\n\n- **Most tested**: Rule 7 (Occupancy Classifications), Rule 8 (Light & Ventilation)\n- Know the **10 occupancy groups** (A through J) and their divisions\n- Memorize minimum **ceiling heights**: 2.40m habitable, 2.10m non-habitable\n- Remember the **fire zone classifications** (1-4)\n\n## Related Topics\n- [[Rule 7 — Classification and General Requirements]]\n- [[RA 9266 — Architecture Act of 2004]]\n- [[BP 344 — Accessibility Law]]\n\n## References\n- Presidential Decree No. 1096 (1977)\n- DPWH NBCP Implementing Rules and Regulations (IRR)',
     ARRAY['building-code', 'pd-1096', 'nbcp', 'legal', 'dpwh', 'building-permit'],
     true,
     1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.wiki_pages (id, category_id, title, slug, markdown_content, tags, is_free, order_index)
VALUES
    ('00000000-0000-0000-0000-000000000012',
     '00000000-0000-0000-0000-00000000000a', -- Category: National Building Code
     'Rule 7 — Classification and General Requirements',
     'rule-7-classification-general-requirements',
     E'# Rule 7 — Classification and General Requirements of All Buildings by Use or Type of Occupancy\n\n## Overview\n\n**Rule 7** of the National Building Code (PD 1096) establishes the classification system for all buildings based on their **use or type of occupancy**. This is one of the most heavily tested topics in the ALE.\n\n## The 10 Occupancy Groups\n\n| Group | Classification | Examples |\n|-------|---------------|----------|\n| **A** | Residential Dwellings | Single-family homes, duplexes |\n| **B** | Residential Hotels & Apartments | Hotels, apartment buildings, convents |\n| **C** | Education & Recreation | Schools, libraries, museums, gyms |\n| **D** | Institutional | Hospitals, prisons, mental institutions |\n| **E** | Business & Mercantile | Offices, stores, markets, gas stations |\n| **F** | Industrial | Factories, power plants, refineries |\n| **G** | Storage & Hazardous | Warehouses, storage of flammable materials |\n| **H** | Assembly | Theaters, churches, stadiums |\n| **I** | Accessory | Private garages, sheds, fences |\n| **J** | Agricultural | Farm buildings, barns, greenhouses |\n\n## Key Divisions\n\n### Group A — Residential\n- **Division 1**: Detached dwellings\n- **Division 2**: Multiple-family dwellings (max 10 units)\n\n### Group H — Assembly\n- **Division 1**: With stage (theaters)\n- **Division 2**: Without stage, 1000+ capacity\n- **Division 3**: Without stage, 300-999 capacity\n- **Division 4**: Without stage, under 300 capacity\n\n## Exam Tips\n\n- This is a **guaranteed exam topic** — memorize all 10 groups\n- Focus on **Group H divisions** (frequently tested distinctions)\n- Know which group **mixed-use buildings** fall under\n- Remember: classification determines fire-resistive requirements (Rule 9)\n\n## Mnemonics\n\n**"A Romantic Boy Danced Energetically, Finding Great Happiness In Jungles"**\n- A = residential, B = hotels, C = education, D = institutional, E = business, F = industrial, G = storage, H = assembly, I = accessory, J = agricultural\n\n## Related Topics\n- [[PD 1096 — National Building Code]]\n- [[Rule 8 — Light, Ventilation, and Sanitation]]\n- [[Rule 9 — Fire Zones]]\n\n## References\n- PD 1096, Rule VII, Sections 701-714\n- NBCP IRR, Chapter 7',
     ARRAY['rule-7', 'occupancy', 'classification', 'building-code', 'pd-1096'],
     true,
     2)
ON CONFLICT (id) DO NOTHING;

-- 4. Bi-directional Link between the two pages
INSERT INTO public.wiki_page_links (source_page_id, target_page_id)
VALUES
    ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000012'),
    ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000011')
ON CONFLICT (source_page_id, target_page_id) DO NOTHING;