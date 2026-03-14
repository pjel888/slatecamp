'use server'

import { createClient } from "@/lib/supabase/server";
import type { WikiArticle, WikiSearchResult } from "@/types/app";

/**
 * Fetch the full taxonomy tree for wiki navigation.
 */
export async function getWikiTaxonomyTree(disciplineId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("taxonomy_tree")
    .select("*")
    .eq("discipline_id", disciplineId)
    .order("level", { ascending: true })
    .order("name", { ascending: true });

  if (error || !data) return [];
  return data;
}

/**
 * Fetch articles for a given taxonomy node.
 */
export async function getWikiArticlesByNode(
  nodeId: string
): Promise<WikiArticle[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wiki_article_taxonomy")
    .select("wiki_articles(*)")
    .eq("node_id", nodeId);

  if (error || !data) return [];
  return data.map(d => d.wiki_articles).filter(Boolean) as unknown as WikiArticle[];
}

/**
 * Fetch a single wiki article by slug.
 */
export async function getWikiArticleBySlug(
  slug: string
): Promise<WikiArticle | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wiki_articles")
    .select("*, wiki_article_taxonomy(node_id, taxonomy_tree(name))")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as WikiArticle;
}

/**
 * Search wiki articles using ilike (fallback for missing RPC).
 */
export async function searchWiki(
  searchTerm: string,
  limit = 20
): Promise<WikiSearchResult[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wiki_articles")
    .select("article_id, title, slug")
    .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
    .limit(limit);

  if (error || !data) return [];
  
  return data.map(d => ({
    id: d.article_id,
    title: d.title,
    slug: d.slug,
    content_snippet: "" // Simplified
  })) as WikiSearchResult[];
}

/**
 * Paginated search fallback.
 */
export async function searchWikiPaginated(
  searchTerm: string,
  page = 1,
  perPage = 10
): Promise<{ results: WikiSearchResult[]; totalCount: number }> {
  const supabase = await createClient();
  const offset = (page - 1) * perPage;

  const { data, error, count } = await supabase
    .from("wiki_articles")
    .select("article_id, title, slug", { count: 'exact' })
    .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
    .range(offset, offset + perPage - 1);

  if (error || !data) return { results: [], totalCount: 0 };

  const results = data.map(d => ({
    id: d.article_id,
    title: d.title,
    slug: d.slug,
    content_snippet: ""
  })) as WikiSearchResult[];

  return { results, totalCount: count ?? 0 };
}
