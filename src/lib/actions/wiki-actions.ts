'use server'

import { createClient } from "@/lib/supabase/server";
import type { WikiArticle } from "@/types/app";
import type { TaxonomyNode } from "@/lib/actions/taxonomy";

/**
 * Fetch a single wiki article by slug.
 */
export async function getWikiArticleBySlug(slug: string): Promise<WikiArticle | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wiki_articles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error(`[getWikiArticleBySlug] Error fetching article for slug "${slug}":`, error.message)
    return null
  }
  return data as WikiArticle;
}

/**
 * Fetch a single wiki article by taxonomy slug.
 */
export async function getWikiArticleByTaxonomySlug(taxonomySlug: string): Promise<WikiArticle | null> {
  const supabase = await createClient();
  
  // 1. Find the node
  const { data: node, error: nodeError } = await supabase
    .from("taxonomy_tree")
    .select("node_id")
    .eq("slug", taxonomySlug)
    .single();
    
  if (nodeError || !node) {
    console.error(`[getWikiArticleByTaxonomySlug] Node not found for slug "${taxonomySlug}":`, nodeError?.message)
    return null;
  }
  
  // 2. Find the primary article mapping for this node
  const { data: junction, error: junctionError } = await supabase
    .from("wiki_article_taxonomy")
    .select("article_id")
    .eq("node_id", node.node_id)
    .eq("is_primary", true)
    .maybeSingle();
    
  if (junctionError) {
    console.error(`[getWikiArticleByTaxonomySlug] Error fetching primary junction for node "${node.node_id}":`, junctionError.message)
  }

  let articleId = junction?.article_id;

  // 3. Fallback to any article for this node if no primary found
  if (!articleId) {
    const { data: fallback, error: fallbackError } = await supabase
      .from("wiki_article_taxonomy")
      .select("article_id")
      .eq("node_id", node.node_id)
      .limit(1)
      .maybeSingle();
      
    if (fallbackError) {
      console.error(`[getWikiArticleByTaxonomySlug] Fallback junction error for node "${node.node_id}":`, fallbackError.message)
    }
    articleId = fallback?.article_id;
  }

  if (!articleId) return null;

  // 4. Fetch the actual article content
  const { data: article, error: articleError } = await supabase
    .from("wiki_articles")
    .select("*")
    .eq("article_id", articleId)
    .single();

  if (articleError) {
    console.error(`[getWikiArticleByTaxonomySlug] Error fetching article content for id "${articleId}":`, articleError.message)
    return null;
  }

  return article as WikiArticle;
}

/**
 * Fetch the full taxonomy tree for a given discipline.
 */
export async function getTaxonomyTree(
  disciplineId: string,
): Promise<TaxonomyNode[]> {
  console.log('[getTaxonomyTree] Starting fetch. ID:', disciplineId)
  const supabase = await createClient();
  const isMock = (supabase as any).isMockClient; // We'll add this flag to our mock client
  
  console.log('[getTaxonomyTree] Using client mode:', isMock ? 'MOCK' : 'LIVE')

  // Fetch all taxonomy nodes for the discipline
  const { data: nodes, error } = await supabase
    .from("taxonomy_tree")
    .select("*")
    .eq("discipline_id", disciplineId)
    .order("level", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error('[getTaxonomyTree] Error fetching nodes:', error.message)
    return []
  }
  
  if (!nodes || nodes.length === 0) {
    console.log('[getTaxonomyTree] No nodes found for discipline:', disciplineId)
    return []
  }

  console.log('[getTaxonomyTree] Nodes found:', nodes.length)

  // Fetch wiki articles mapped to these nodes
  const nodeIds = nodes.map((n: any) => n.node_id);

  const { data: mappings, error: mappingsError } = await supabase
    .from("wiki_article_taxonomy")
    .select("node_id, wiki_articles(article_id, slug, title)")
    .in("node_id", nodeIds);

  if (mappingsError) {
    console.error("[getTaxonomyTree] Error fetching mappings:", mappingsError.message);
  }

  const articleMap = new Map<string, { article_id: string; slug: string; title: string }[]>();

  mappings?.forEach((m: any) => {
    if (!m.wiki_articles) return;
    if (!articleMap.has(m.node_id)) {
      articleMap.set(m.node_id, []);
    }
    articleMap.get(m.node_id)!.push(m.wiki_articles);
  });

  const finalData = nodes.map((node: any) => ({
    ...(node as TaxonomyNode),
    articles: articleMap.get(node.node_id) || [],
  }));

  console.log('[getTaxonomyTree] Returning tree nodes:', finalData.length)
  return finalData
}

/**
 * Fetch the active taxonomy node for a given article slug.
 * Uses the junction table wiki_article_taxonomy.
 */
export async function getActiveTaxonomyNode(slug: string): Promise<TaxonomyNode | null> {
  const supabase = await createClient();
  
  // First get the article ID
  const { data: article } = await supabase
    .from("wiki_articles")
    .select("article_id")
    .eq("slug", slug)
    .single();
    
  if (!article) return null;
  
  // Then get the primary taxonomy node
  const { data: junction } = await supabase
    .from("wiki_article_taxonomy")
    .select("node_id")
    .eq("article_id", article.article_id)
    .eq("is_primary", true)
    .single();
    
  if (!junction) {
    // Fallback to any linked node if no primary
    const { data: fallback } = await supabase
      .from("wiki_article_taxonomy")
      .select("node_id")
      .eq("article_id", article.article_id)
      .limit(1)
      .single();
    if (!fallback) return null;
    
    const { data: node } = await supabase
      .from("taxonomy_tree")
      .select("*")
      .eq("node_id", fallback.node_id)
      .single();
    return node as TaxonomyNode;
  }
  
  const { data: node } = await supabase
    .from("taxonomy_tree")
    .select("*")
    .eq("node_id", junction.node_id)
    .single();
    
  return node as TaxonomyNode;
}
