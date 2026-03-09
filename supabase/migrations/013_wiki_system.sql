-- =============================================================
-- 01: WIKI / RESOURCES SYSTEM SCHEMA
-- Hierarchical categories, atomic pages with FTS, bi-directional linking
-- =============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------
-- 1. wiki_categories — adjacency-list tree
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.wiki_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES public.wiki_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wiki_categories_parent ON public.wiki_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_wiki_categories_slug ON public.wiki_categories(slug);

-- -----------------------------------------------
-- 2. wiki_pages — atomic notes with FTS
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.wiki_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES public.wiki_categories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    markdown_content TEXT NOT NULL DEFAULT '',
    tags TEXT[] DEFAULT '{}',
    is_free BOOLEAN DEFAULT true,
    is_deprecated BOOLEAN DEFAULT false,
    deprecated_by UUID REFERENCES public.wiki_pages(id) ON DELETE SET NULL,
    deprecated_note TEXT,
    order_index INT DEFAULT 0,
    fts_vector TSVECTOR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wiki_pages_category ON public.wiki_pages(category_id);
CREATE INDEX IF NOT EXISTS idx_wiki_pages_slug ON public.wiki_pages(slug);
CREATE INDEX IF NOT EXISTS idx_wiki_pages_fts ON public.wiki_pages USING GIN(fts_vector);
CREATE INDEX IF NOT EXISTS idx_wiki_pages_tags ON public.wiki_pages USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_wiki_pages_deprecated ON public.wiki_pages(is_deprecated) WHERE is_deprecated = true;

-- -----------------------------------------------
-- 3. wiki_page_links — bi-directional graph edges
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.wiki_page_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_page_id UUID NOT NULL REFERENCES public.wiki_pages(id) ON DELETE CASCADE,
    target_page_id UUID NOT NULL REFERENCES public.wiki_pages(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_page_id, target_page_id),
    CHECK (source_page_id <> target_page_id)
);

CREATE INDEX IF NOT EXISTS idx_wiki_links_source ON public.wiki_page_links(source_page_id);
CREATE INDEX IF NOT EXISTS idx_wiki_links_target ON public.wiki_page_links(target_page_id);

-- -----------------------------------------------
-- 4. FTS trigger — auto-update tsvector
-- Weights: title=A, tags=B, content=C
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION wiki_pages_fts_trigger()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fts_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.markdown_content, '')), 'C');
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_wiki_pages_fts ON public.wiki_pages;
CREATE TRIGGER trg_wiki_pages_fts
    BEFORE INSERT OR UPDATE OF title, tags, markdown_content
    ON public.wiki_pages
    FOR EACH ROW
    EXECUTE FUNCTION wiki_pages_fts_trigger();

-- -----------------------------------------------
-- 5. Search RPC — weighted full-text search with headline
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION search_wiki(search_term TEXT, max_results INT DEFAULT 20)
RETURNS TABLE (
    id UUID,
    title TEXT,
    slug TEXT,
    category_id UUID,
    tags TEXT[],
    is_deprecated BOOLEAN,
    is_free BOOLEAN,
    headline TEXT,
    rank REAL
) AS $$
DECLARE
    tsquery_val TSQUERY;
BEGIN
    tsquery_val := websearch_to_tsquery('english', search_term);
    RETURN QUERY
    SELECT
        wp.id,
        wp.title,
        wp.slug,
        wp.category_id,
        wp.tags,
        wp.is_deprecated,
        wp.is_free,
        ts_headline('english', wp.markdown_content, tsquery_val,
            'StartSel=<mark>, StopSel=</mark>, MaxWords=60, MinWords=20') AS headline,
        ts_rank_cd(wp.fts_vector, tsquery_val) AS rank
    FROM public.wiki_pages wp
    WHERE wp.fts_vector @@ tsquery_val
    ORDER BY rank DESC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE;

-- -----------------------------------------------
-- 6. RLS — public read access
-- -----------------------------------------------
ALTER TABLE public.wiki_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_page_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wiki_categories_public_read" ON public.wiki_categories FOR SELECT USING (true);
CREATE POLICY "wiki_pages_public_read" ON public.wiki_pages FOR SELECT USING (true);
CREATE POLICY "wiki_page_links_public_read" ON public.wiki_page_links FOR SELECT USING (true);

