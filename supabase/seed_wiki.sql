-- =============================================================
-- WIKI SEED DATA — Run in Supabase SQL Editor
-- Requires: wiki_categories, wiki_pages, wiki_page_links exist
-- (Run migrations / DATABASE_SCHEMA.sql first.)
-- Idempotent: safe to re-run; uses ON CONFLICT (slug) DO NOTHING.
-- =============================================================

-- Optional: clear existing wiki data (uncomment if you want a clean slate)
-- DELETE FROM public.wiki_page_links;
-- DELETE FROM public.wiki_pages;
-- DELETE FROM public.wiki_categories;

-- -------------------------------------------------------------
-- 1. WIKI CATEGORIES
-- Root categories = "subjects" (e.g. Building Laws, Structural).
-- Child category parent_id resolved by slug so re-runs work.
-- -------------------------------------------------------------

INSERT INTO public.wiki_categories (parent_id, name, slug, description, order_index)
VALUES
  (NULL, 'Building Laws & Codes', 'building-laws', 'Laws, codes, and regulations governing building design and construction.', 0),
  (NULL, 'Structural Systems', 'structural-systems', 'Loads, materials, and structural behavior.', 1)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.wiki_categories (parent_id, name, slug, description, order_index)
SELECT (SELECT id FROM public.wiki_categories WHERE slug = 'building-laws' LIMIT 1), 'Fire & Life Safety', 'fire-life-safety', 'Fire-resistive construction, egress, and life safety.', 0
WHERE EXISTS (SELECT 1 FROM public.wiki_categories WHERE slug = 'building-laws')
ON CONFLICT (slug) DO NOTHING;

-- -------------------------------------------------------------
-- 2. WIKI PAGES
-- category_id resolved by category slug so re-runs work.
-- fts_vector is filled by trigger.
-- -------------------------------------------------------------

INSERT INTO public.wiki_pages (category_id, title, slug, markdown_content, tags, is_free, is_deprecated, deprecated_by, deprecated_note, order_index)
SELECT (SELECT id FROM public.wiki_categories WHERE slug = 'building-laws' LIMIT 1), 'National Building Code Overview', 'national-building-code-overview',
  E'## Purpose\n\nThe National Building Code (NBC) provides minimum requirements for safety, health, and welfare in buildings.\n\n## Scope\n\n- Occupancy classifications\n- Height and area limitations\n- Fire-resistive construction\n- Means of egress\n\n## Key Concepts\n\n- **Occupancy**: Use group (e.g. residential, assembly).\n- **Type of Construction**: I–V based on fire resistance.',
  ARRAY['nbc', 'codes', 'overview'], true, false, NULL, NULL, 0
WHERE EXISTS (SELECT 1 FROM public.wiki_categories WHERE slug = 'building-laws')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.wiki_pages (category_id, title, slug, markdown_content, tags, is_free, is_deprecated, deprecated_by, deprecated_note, order_index)
SELECT (SELECT id FROM public.wiki_categories WHERE slug = 'fire-life-safety' LIMIT 1), 'Fire-Resistive Construction', 'fire-resistive-construction',
  E'## Fire-Resistance Ratings\n\nWalls, floors, and roofs are assigned ratings (e.g. 1 hr, 2 hr) based on standard fire tests.\n\n## Types of Construction\n\n- **Type I**: Highest fire resistance; structural elements protected.\n- **Type II**: Non-combustible; may have limited protection.\n- **Type III**: Exterior non-combustible; interior may be combustible.\n- **Type IV**: Heavy timber.\n- **Type V**: Wood frame.',
  ARRAY['fire', 'construction', 'ratings'], true, false, NULL, NULL, 0
WHERE EXISTS (SELECT 1 FROM public.wiki_categories WHERE slug = 'fire-life-safety')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.wiki_pages (category_id, title, slug, markdown_content, tags, is_free, is_deprecated, deprecated_by, deprecated_note, order_index)
SELECT (SELECT id FROM public.wiki_categories WHERE slug = 'fire-life-safety' LIMIT 1), 'Means of Egress', 'means-of-egress',
  E'## Definition\n\nA continuous path of travel from any occupied space to a public way.\n\n## Components\n\n1. **Exit access**: From space to exit\n2. **Exit**: Corridor, stair, door to exterior\n3. **Exit discharge**: From exit to public way\n\n## Requirements\n\n- Minimum width and capacity\n- Illumination and signage\n- Dead-end limits',
  ARRAY['egress', 'life safety', 'exits'], true, false, NULL, NULL, 1
WHERE EXISTS (SELECT 1 FROM public.wiki_categories WHERE slug = 'fire-life-safety')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.wiki_pages (category_id, title, slug, markdown_content, tags, is_free, is_deprecated, deprecated_by, deprecated_note, order_index)
SELECT (SELECT id FROM public.wiki_categories WHERE slug = 'structural-systems' LIMIT 1), 'Structural Loads', 'structural-loads',
  E'## Dead Loads\n\nPermanent: self-weight of structure, finishes, fixed equipment.\n\n## Live Loads\n\nVariable: occupants, furniture, snow, rain. Codes specify minimum live loads by occupancy.\n\n## Lateral Loads\n\n- Wind\n- Earthquake (seismic)\n\nLoad combinations (e.g. 1.2D + 1.6L) are used for design.',
  ARRAY['loads', 'dead', 'live', 'lateral'], true, false, NULL, NULL, 0
WHERE EXISTS (SELECT 1 FROM public.wiki_categories WHERE slug = 'structural-systems')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.wiki_pages (category_id, title, slug, markdown_content, tags, is_free, is_deprecated, deprecated_by, deprecated_note, order_index)
SELECT (SELECT id FROM public.wiki_categories WHERE slug = 'structural-systems' LIMIT 1), 'Concrete Basics', 'concrete-basics',
  E'## Properties\n\n- Strong in compression, weak in tension.\n- Reinforced with steel (rebar) to carry tension.\n\n## Grades\n\nSpecified by compressive strength (e.g. 21 MPa, 28 MPa).\n\n## Durability\n\nCover, mix design, and curing affect durability in aggressive environments.',
  ARRAY['concrete', 'materials', 'reinforcement'], true, false, NULL, NULL, 1
WHERE EXISTS (SELECT 1 FROM public.wiki_categories WHERE slug = 'structural-systems')
ON CONFLICT (slug) DO NOTHING;

-- -------------------------------------------------------------
-- 3. WIKI PAGE LINKS
-- Resolved by page slugs so re-runs work.
-- CHECK: source_page_id <> target_page_id.
-- -------------------------------------------------------------

INSERT INTO public.wiki_page_links (source_page_id, target_page_id)
SELECT src.id, tgt.id
FROM (SELECT id FROM public.wiki_pages WHERE slug = 'national-building-code-overview' LIMIT 1) src,
     (SELECT id FROM public.wiki_pages WHERE slug = 'fire-resistive-construction' LIMIT 1) tgt
WHERE src.id IS NOT NULL AND tgt.id IS NOT NULL AND src.id <> tgt.id
ON CONFLICT (source_page_id, target_page_id) DO NOTHING;

INSERT INTO public.wiki_page_links (source_page_id, target_page_id)
SELECT src.id, tgt.id
FROM (SELECT id FROM public.wiki_pages WHERE slug = 'national-building-code-overview' LIMIT 1) src,
     (SELECT id FROM public.wiki_pages WHERE slug = 'means-of-egress' LIMIT 1) tgt
WHERE src.id IS NOT NULL AND tgt.id IS NOT NULL AND src.id <> tgt.id
ON CONFLICT (source_page_id, target_page_id) DO NOTHING;

INSERT INTO public.wiki_page_links (source_page_id, target_page_id)
SELECT src.id, tgt.id
FROM (SELECT id FROM public.wiki_pages WHERE slug = 'fire-resistive-construction' LIMIT 1) src,
     (SELECT id FROM public.wiki_pages WHERE slug = 'means-of-egress' LIMIT 1) tgt
WHERE src.id IS NOT NULL AND tgt.id IS NOT NULL AND src.id <> tgt.id
ON CONFLICT (source_page_id, target_page_id) DO NOTHING;

INSERT INTO public.wiki_page_links (source_page_id, target_page_id)
SELECT src.id, tgt.id
FROM (SELECT id FROM public.wiki_pages WHERE slug = 'structural-loads' LIMIT 1) src,
     (SELECT id FROM public.wiki_pages WHERE slug = 'concrete-basics' LIMIT 1) tgt
WHERE src.id IS NOT NULL AND tgt.id IS NOT NULL AND src.id <> tgt.id
ON CONFLICT (source_page_id, target_page_id) DO NOTHING;
