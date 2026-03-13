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

  if (error || !data) return null;
  return data as WikiArticle;
}

/**
 * Fetch the full taxonomy tree for a given discipline.
 */
export async function getTaxonomyTree(
  disciplineId: string,
): Promise<TaxonomyNode[]> {
  const supabase = await createClient();

  // Fetch all taxonomy nodes for the discipline
  const { data: nodes, error } = await supabase
    .from("taxonomy_tree")
    .select("*")
    .eq("discipline_id", disciplineId)
    .order("level", { ascending: true })
    .order("name", { ascending: true });

  if (error || !nodes) return [];

  // Fetch wiki articles mapped to these nodes
  const nodeIds = nodes.map((n) => n.node_id);

  const { data: mappings, error: mappingsError } = await supabase
    .from("wiki_article_taxonomy")
    .select("node_id, wiki_articles(article_id, slug, title)")
    .in("node_id", nodeIds);

  if (mappingsError) {
    console.error("Error fetching wiki article mappings:", mappingsError);
  }

  const articleMap = new Map<string, { article_id: string; slug: string; title: string }[]>();

  mappings?.forEach((m: any) => {
    if (!m.wiki_articles) return;
    if (!articleMap.has(m.node_id)) {
      articleMap.set(m.node_id, []);
    }
    articleMap.get(m.node_id)!.push(m.wiki_articles);
  });

  return nodes.map((node) => ({
    ...(node as BaseTaxonomyNode),
    articles: articleMap.get(node.node_id) || [],
  }));
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
