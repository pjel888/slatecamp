-- =============================================================
-- 02: WIKI SEED DATA (SUBJECT-BASED TAXONOMY)
-- =============================================================

-- 1. Root Categories (The Core Architectural Subjects)
INSERT INTO public.wiki_categories (id, parent_id, name, slug, description, order_index)
VALUES
    ('00000000-0000-0000-0000-000000000001', NULL,
     'History of Architecture',
     'history-of-architecture',
     'Global and Philippine architectural history, from antiquity to contemporary movements.',
     1),

    ('00000000-0000-0000-0000-000000000002', NULL,
     'Theory of Architecture',
     'theory-of-architecture',
     'Design principles, spatial psychology, anthropometrics, and tropical design.',
     2),

    ('00000000-0000-0000-0000-000000000003', NULL,
     'Professional Practice',
     'professional-practice',
     'Architectural services, SPP, code of ethics, firm management, and compensation.',
     3),

    ('00000000-0000-0000-0000-000000000004', NULL,
     'Building Laws',
     'building-laws',
     'PD 1096, RA 9266, BP 344, Fire Code, and other vital Philippine construction regulations.',
     4),

    ('00000000-0000-0000-0000-000000000005', NULL,
     'Building Materials & Construction',
     'building-materials-construction',
     'Material properties, construction methodologies, detailing, and finishes.',
     5),

    ('00000000-0000-0000-0000-000000000006', NULL,
     'Building Utilities',
     'building-utilities',
     'Plumbing, sanitary, electrical, mechanical, acoustics, and illumination systems.',
     6),

    ('00000000-0000-0000-0000-000000000007', NULL,
     'Structural Conceptualization',
     'structural-conceptualization',
     'Statics, strength of materials, seismic analysis, and structural systems design.',
     7),

    ('00000000-0000-0000-0000-000000000008', NULL,
     'Architectural Design & Site Planning',
     'architectural-design-site-planning',
     'Space programming, site analysis, urban planning, and programmatic development.',
     8)
ON CONFLICT (id) DO NOTHING;

-- 2. Subcategories (Nested under the root subjects)
INSERT INTO public.wiki_categories (id, parent_id, name, slug, description, order_index)
VALUES
    ('00000000-0000-0000-0000-000000000009',
     '00000000-0000-0000-0000-000000000001', -- Parent: History of Architecture
     'Philippine Architecture',
     'philippine-architecture',
     'Pre-colonial, Spanish, American, and Post-War Philippine architectural heritage.',
     1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.wiki_categories (id, parent_id, name, slug, description, order_index)
VALUES
    ('00000000-0000-0000-0000-00000000000a',
     '00000000-0000-0000-0000-000000000004', -- Parent: Building Laws
     'National Building Code (PD 1096)',
     'national-building-code',
     'Detailed breakdowns of PD 1096 and its Implementing Rules and Regulations.',
     1)
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