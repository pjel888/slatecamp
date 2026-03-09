import { createClient } from "@/lib/supabase/server";
import type { WikiCategory, WikiPage, WikiSearchResult } from "@/types/app";

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
