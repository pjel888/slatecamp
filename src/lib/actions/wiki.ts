import { createClient } from "@/lib/supabase/server";
import type { WikiCategory, WikiPage, WikiSearchResult, WikiSearchPaginatedResult } from "@/types/app";

/**
 * Fetch the full category tree, building parent→children relationships.
 */
export async function getWikiCategoryTree(): Promise<WikiCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wiki_categories")
    .select("*")
    .order("order_index", { ascending: true });

  if (error || !data) return [];

  const categories = data as WikiCategory[];
  const map = new Map<string, WikiCategory>();
  const roots: WikiCategory[] = [];

  // Index all categories
  for (const cat of categories) {
    map.set(cat.id, { ...cat, children: [] });
  }

  // Build tree
  for (const cat of categories) {
    const node = map.get(cat.id)!;
    if (cat.parent_id && map.has(cat.parent_id)) {
      map.get(cat.parent_id)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

/**
 * Fetch pages for a given category (flat list).
 */
export async function getWikiPagesByCategory(
  categoryId: string
): Promise<WikiPage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wiki_pages")
    .select("id, title, slug, is_free, is_deprecated, order_index, tags")
    .eq("category_id", categoryId)
    .order("order_index", { ascending: true });

  if (error || !data) return [];
  return data as WikiPage[];
}

/**
 * Fetch a single wiki page by slug, including its category.
 */
export async function getWikiPageBySlug(
  slug: string
): Promise<WikiPage | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wiki_pages")
    .select("*, wiki_categories(*)")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data as WikiPage;
}

/**
 * Fetch a single wiki page by id (full content, for dev edit).
 */
export async function getWikiPageById(id: string): Promise<WikiPage | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wiki_pages")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as WikiPage;
}

/**
 * Fetch backlinks: pages that link TO this page.
 */
export async function getWikiBacklinks(
  pageId: string
): Promise<Pick<WikiPage, "id" | "title" | "slug">[]> {
  const supabase = await createClient();

  // Get all pages that have a link targeting this page
  const { data: links, error: linksError } = await supabase
    .from("wiki_page_links")
    .select("source_page_id")
    .eq("target_page_id", pageId);

  if (linksError || !links || links.length === 0) return [];

  const sourceIds = links.map((l: { source_page_id: string }) => l.source_page_id);

  const { data: pages, error: pagesError } = await supabase
    .from("wiki_pages")
    .select("id, title, slug")
    .in("id", sourceIds);

  if (pagesError || !pages) return [];
  return pages as Pick<WikiPage, "id" | "title" | "slug">[];
}

/**
 * Fetch forward links: pages that this page links TO.
 */
export async function getWikiForwardLinks(
  pageId: string
): Promise<Pick<WikiPage, "id" | "title" | "slug">[]> {
  const supabase = await createClient();

  const { data: links, error: linksError } = await supabase
    .from("wiki_page_links")
    .select("target_page_id")
    .eq("source_page_id", pageId);

  if (linksError || !links || links.length === 0) return [];

  const targetIds = links.map((l: { target_page_id: string }) => l.target_page_id);

  const { data: pages, error: pagesError } = await supabase
    .from("wiki_pages")
    .select("id, title, slug")
    .in("id", targetIds);

  if (pagesError || !pages) return [];
  return pages as Pick<WikiPage, "id" | "title" | "slug">[];
}

/**
 * Build a breadcrumb trail from a category up to its root.
 * Returns [root, ..., parent, current] — ordered from top to bottom.
 */
export async function getWikiCategoryBreadcrumb(
  categoryId: string
): Promise<Pick<WikiCategory, "id" | "name" | "slug" | "parent_id">[]> {
  const supabase = await createClient();

  // Fetch all categories (lightweight — typically < 50 rows)
  const { data, error } = await supabase
    .from("wiki_categories")
    .select("id, name, slug, parent_id");

  if (error || !data) return [];

  const map = new Map<string, Pick<WikiCategory, "id" | "name" | "slug" | "parent_id">>();
  for (const cat of data as Pick<WikiCategory, "id" | "name" | "slug" | "parent_id">[]) {
    map.set(cat.id, cat);
  }

  // Walk up the tree
  const trail: Pick<WikiCategory, "id" | "name" | "slug" | "parent_id">[] = [];
  let current = map.get(categoryId);
  while (current) {
    trail.unshift(current);
    current = current.parent_id ? map.get(current.parent_id) : undefined;
  }

  return trail;
}

/**
 * Full-text search across wiki pages using the search_wiki RPC.
 */
export async function searchWiki(
  searchTerm: string,
  maxResults = 20
): Promise<WikiSearchResult[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("search_wiki", {
    search_term: searchTerm,
    max_results: maxResults,
  });

  if (error || !data) return [];
  return data as WikiSearchResult[];
}

// ---------------------------------------------------------------------------
// Exported pure helper (no Supabase dependency — safe to test in isolation)
// ---------------------------------------------------------------------------

type PageStub = Pick<WikiPage, 'id' | 'title' | 'slug' | 'is_deprecated'> & { order_index: number }

export function findAdjacentPages(
  pages: PageStub[],
  currentId: string
): { prev: PageStub | null; next: PageStub | null } {
  const sorted = [...pages].sort((a, b) => a.order_index - b.order_index)
  const idx = sorted.findIndex((p) => p.id === currentId)
  if (idx === -1) return { prev: null, next: null }
  return {
    prev: idx > 0 ? sorted[idx - 1] : null,
    next: idx < sorted.length - 1 ? sorted[idx + 1] : null,
  }
}

// ---------------------------------------------------------------------------
// New server actions
// ---------------------------------------------------------------------------

/**
 * Fetch a root-level wiki category (subject) by slug with all child categories
 * and pages grouped by category ID.
 * Returns null if the slug resolves to a sub-category (parent_id IS NOT NULL).
 */
export async function getWikiSubjectBySlug(slug: string): Promise<{
  subject: WikiCategory
  pagesByCategory: Record<string, PageStub[]>
  categoryIds: string[]
} | null> {
  const supabase = await createClient()

  const { data: subjectData, error: subjectError } = await supabase
    .from('wiki_categories')
    .select('*')
    .eq('slug', slug)
    .is('parent_id', null)
    .single()

  if (subjectError || !subjectData) return null

  const subject = subjectData as WikiCategory

  const { data: children } = await supabase
    .from('wiki_categories')
    .select('*')
    .eq('parent_id', subject.id)
    .order('order_index', { ascending: true })

  subject.children = (children ?? []) as WikiCategory[]

  const categoryIds = [subject.id, ...subject.children.map((c) => c.id)]

  const { data: pages } = await supabase
    .from('wiki_pages')
    .select('id, title, slug, category_id, is_deprecated, order_index')
    .in('category_id', categoryIds)
    .order('order_index', { ascending: true })

  const pagesByCategory: Record<string, PageStub[]> = {}
  for (const page of (pages ?? []) as (PageStub & { category_id: string })[]) {
    if (!pagesByCategory[page.category_id]) pagesByCategory[page.category_id] = []
    pagesByCategory[page.category_id].push(page)
  }

  return { subject, pagesByCategory, categoryIds }
}

/**
 * Paginated flat list of all pages under a subject (all child categories included).
 * Sorted alphabetically by title.
 */
export async function getWikiPagesBySubject(
  subjectSlug: string,
  page = 1,
  perPage = 15
): Promise<{ pages: (WikiPage & { category_name: string })[]; totalCount: number }> {
  const supabase = await createClient()

  // Get subject category IDs
  const result = await getWikiSubjectBySlug(subjectSlug)
  if (!result) return { pages: [], totalCount: 0 }

  const { categoryIds } = result
  const offset = (page - 1) * perPage

  const { data, error, count } = await supabase
    .from('wiki_pages')
    .select('*, wiki_categories(name)', { count: 'exact' })
    .in('category_id', categoryIds)
    .order('title', { ascending: true })
    .range(offset, offset + perPage - 1)

  if (error || !data) return { pages: [], totalCount: 0 }

  return {
    pages: data.map((p: WikiPage & { wiki_categories: { name: string } | null }) => ({
      ...p,
      category_name: p.wiki_categories?.name ?? '',
    })) as (WikiPage & { category_name: string })[],
    totalCount: count ?? 0,
  }
}

/**
 * Returns the previous and next wiki pages within the same category,
 * ordered by order_index.
 */
export async function getAdjacentWikiPages(
  pageId: string,
  categoryId: string
): Promise<{ prev: Pick<WikiPage, 'id' | 'title' | 'slug'> | null; next: Pick<WikiPage, 'id' | 'title' | 'slug'> | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('wiki_pages')
    .select('id, title, slug, order_index, is_deprecated')
    .eq('category_id', categoryId)
    .order('order_index', { ascending: true })

  if (error || !data) return { prev: null, next: null }

  return findAdjacentPages(data as PageStub[], pageId)
}

/**
 * Most recently updated wiki pages, excluding deprecated ones.
 */
export async function getRecentlyUpdatedPages(
  limit = 10
): Promise<Pick<WikiPage, 'id' | 'title' | 'slug' | 'updated_at'>[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('wiki_pages')
    .select('id, title, slug, updated_at')
    .eq('is_deprecated', false)
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []
  return data as Pick<WikiPage, 'id' | 'title' | 'slug' | 'updated_at'>[]
}

/**
 * Paginated, subject-filtered full-text search using the search_wiki_paginated RPC.
 */
export async function searchWikiPaginated(
  searchTerm: string,
  subjectSlug?: string,
  page = 1,
  perPage = 10
): Promise<{ results: WikiSearchPaginatedResult[]; totalCount: number }> {
  const supabase = await createClient()
  const offset = (page - 1) * perPage

  const { data, error } = await supabase.rpc('search_wiki_paginated', {
    search_term: searchTerm,
    subject_slug: subjectSlug ?? null,
    page_offset: offset,
    page_limit: perPage,
  })

  if (error || !data || data.length === 0) return { results: [], totalCount: 0 }

  const totalCount = Number((data[0] as WikiSearchPaginatedResult).total_count)
  return { results: data as WikiSearchPaginatedResult[], totalCount }
}
