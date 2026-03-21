'use server'

// wiki-actions: taxonomy tree + article data for wiki sidebar
import { createClient } from "@/lib/supabase/server";
import type { WikiArticle } from "@/types/app";
import type { TaxonomyNode } from "@/lib/actions/taxonomy";

export interface WikiArticleSource {
  source_id: string
  label: string
  description: string | null
  url: string | null
  source_type: string
  sort_order: number
}

/**
 * Fetch sources for a wiki article, ordered by sort_order.
 */
export const getArticleSources = async (articleId: string): Promise<WikiArticleSource[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('wiki_article_sources')
    .select('source_id, label, description, url, source_type, sort_order')
    .eq('article_id', articleId)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('[getArticleSources] Error:', error.message)
    return []
  }
  return (data ?? []) as WikiArticleSource[]
}

/**
 * Fetch a single wiki article by slug.
 */
export async function getWikiArticleBySlug(slug: string): Promise<WikiArticle | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wiki_articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .limit(1)
    .maybeSingle();

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

  // 4. Fetch the actual article content (only published)
  const { data: article, error: articleError } = await supabase
    .from("wiki_articles")
    .select("*")
    .eq("article_id", articleId)
    .eq("status", "published")
    .maybeSingle();

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
  const supabase = await createClient();

  // Fetch all taxonomy nodes for the discipline
  const { data: nodes, error } = await supabase
    .from("taxonomy_tree")
    .select("*")
    .eq("discipline_id", disciplineId)
    .eq("is_cross_ref_only", false)
    .is("deprecated_at", null)
    .not("ale_id", "is", null)
    .order("level", { ascending: true })
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  if (error) {
    console.error('[getTaxonomyTree] Error fetching nodes:', error.message)
    return []
  }
  
  if (!nodes || nodes.length === 0) {
    return []
  }

  // Fetch wiki articles for nodes that may have them:
  // - All actual leaf nodes (no children in this set) — covers level-3 subtopics
  // - All level-2 nodes — some (e.g., "Subject Overview & Strategy") have articles
  //   linked directly without level-3 children
  const parentNodeIds = new Set(nodes.map((n: any) => n.parent_id).filter(Boolean));
  const leafNodeIds = nodes
    .filter((n: any) => n.level === 2 || !parentNodeIds.has(n.node_id))
    .map((n: any) => n.node_id);

  const articleMap = new Map<string, { article_id: string; slug: string; title: string }[]>();

  if (leafNodeIds.length > 0) {
    // Chunk into batches of 150 to stay well under URL limits
    const CHUNK_SIZE = 150;
    const allJunctionRows: { node_id: string; article_id: string }[] = [];

    for (let i = 0; i < leafNodeIds.length; i += CHUNK_SIZE) {
      const chunk = leafNodeIds.slice(i, i + CHUNK_SIZE);
      const { data: rows, error: junctionError } = await supabase
        .from("wiki_article_taxonomy")
        .select("node_id, article_id")
        .in("node_id", chunk);

      if (junctionError) {
        console.error("[getTaxonomyTree] Error fetching mappings:", junctionError.code ?? "unavailable");
        continue;
      }
      if (rows) allJunctionRows.push(...rows);
    }

    if (allJunctionRows.length > 0) {
      const articleIds = [...new Set(allJunctionRows.map((r) => r.article_id))];

      const { data: articleRows } = await supabase
        .from("wiki_articles")
        .select("article_id, slug, title")
        .in("article_id", articleIds);

      const articleById = new Map(articleRows?.map((a: any) => [a.article_id, a]) ?? []);

      allJunctionRows.forEach((row) => {
        const article = articleById.get(row.article_id) as { article_id: string; slug: string; title: string } | undefined;
        if (!article) return;
        if (!articleMap.has(row.node_id)) articleMap.set(row.node_id, []);
        articleMap.get(row.node_id)!.push(article);
      });
    }
  }

  const finalData = nodes.map((node: any) => ({
    ...(node as TaxonomyNode),
    articles: articleMap.get(node.node_id) || [],
  }));

  return finalData
}

/**
 * Fetch cross-reference-only nodes (Laws & Codes) for the wiki sidebar.
 * These are separated from the main taxonomy tree because they span
 * multiple subject areas and don't carry their own exam weight.
 */
export const getLawsTaxonomyTree = async (
  disciplineId: string,
): Promise<TaxonomyNode[]> => {
  const supabase = await createClient()

  const { data: nodes, error } = await supabase
    .from('taxonomy_tree')
    .select('*')
    .eq('discipline_id', disciplineId)
    .eq('is_cross_ref_only', true)
    .is('deprecated_at', null)
    .not('ale_id', 'is', null)
    .order('level', { ascending: true })
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })

  if (error) {
    console.error('[getLawsTaxonomyTree] Error:', error.message)
    return []
  }

  if (!nodes || nodes.length === 0) return []

  const parentNodeIds = new Set(nodes.map((n: any) => n.parent_id).filter(Boolean))
  const leafNodeIds = nodes
    .filter((n: any) => n.level === 2 || !parentNodeIds.has(n.node_id))
    .map((n: any) => n.node_id)

  const articleMap = new Map<string, { article_id: string; slug: string; title: string }[]>()

  if (leafNodeIds.length > 0) {
    const CHUNK_SIZE = 150
    const allJunctionRows: { node_id: string; article_id: string }[] = []

    for (let i = 0; i < leafNodeIds.length; i += CHUNK_SIZE) {
      const chunk = leafNodeIds.slice(i, i + CHUNK_SIZE)
      const { data: rows, error: junctionError } = await supabase
        .from('wiki_article_taxonomy')
        .select('node_id, article_id')
        .in('node_id', chunk)
      if (junctionError) {
        console.error('[getLawsTaxonomyTree] Error fetching mappings:', junctionError.code ?? 'unavailable')
        continue
      }
      if (rows) allJunctionRows.push(...rows)
    }

    if (allJunctionRows.length > 0) {
      const articleIds = [...new Set(allJunctionRows.map((r) => r.article_id))]

      const { data: articleRows } = await supabase
        .from('wiki_articles')
        .select('article_id, slug, title')
        .in('article_id', articleIds)

      const articleById = new Map(articleRows?.map((a: any) => [a.article_id, a]) ?? [])

      allJunctionRows.forEach((row) => {
        const article = articleById.get(row.article_id) as { article_id: string; slug: string; title: string } | undefined
        if (!article) return
        if (!articleMap.has(row.node_id)) articleMap.set(row.node_id, [])
        articleMap.get(row.node_id)!.push(article)
      })
    }
  }

  return nodes.map((node: any) => ({
    ...(node as TaxonomyNode),
    articles: articleMap.get(node.node_id) || [],
  }))
}

/**
 * Fetch the active taxonomy node for a given slug.
 * Tries two paths:
 *   1. slug matches wiki_articles.slug → junction table → taxonomy node
 *   2. slug matches taxonomy_tree.slug directly (taxonomy node slug)
 */
export async function getActiveTaxonomyNode(slug: string): Promise<TaxonomyNode | null> {
  const supabase = await createClient();

  // Path 1: slug is an article slug → look up via junction table
  const { data: article } = await supabase
    .from("wiki_articles")
    .select("article_id")
    .eq("slug", slug)
    .maybeSingle();

  if (article) {
    const { data: junction } = await supabase
      .from("wiki_article_taxonomy")
      .select("node_id")
      .eq("article_id", article.article_id)
      .eq("is_primary", true)
      .maybeSingle();

    const nodeId = junction?.node_id;
    if (!nodeId) {
      // Fallback to any linked node
      const { data: fallback } = await supabase
        .from("wiki_article_taxonomy")
        .select("node_id")
        .eq("article_id", article.article_id)
        .limit(1)
        .maybeSingle();
      if (fallback) {
        const { data: node } = await supabase
          .from("taxonomy_tree")
          .select("*")
          .eq("node_id", fallback.node_id)
          .single();
        return node as TaxonomyNode;
      }
    } else {
      const { data: node } = await supabase
        .from("taxonomy_tree")
        .select("*")
        .eq("node_id", nodeId)
        .single();
      return node as TaxonomyNode;
    }
  }

  // Path 2: slug is a taxonomy node slug → direct lookup
  const { data: directNode } = await supabase
    .from("taxonomy_tree")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (directNode) return directNode as TaxonomyNode;

  return null;
}

export interface BreadcrumbItem {
  name: string
  slug: string | null
  node_id: string
  level: number
}

/**
 * Build the breadcrumb trail from a taxonomy node up to the root.
 * Returns an array ordered root-first → current-node-last.
 */
export async function getBreadcrumbTrail(nodeId: string): Promise<BreadcrumbItem[]> {
  const supabase = await createClient();

  // Fetch the start node to determine discipline and tree type
  const { data: startNode } = await supabase
    .from("taxonomy_tree")
    .select("discipline_id, is_cross_ref_only")
    .eq("node_id", nodeId)
    .single();

  if (!startNode) return [];

  // Use the same is_cross_ref_only value so ALE-LAWS nodes find their own tree
  const { data: allNodes } = await supabase
    .from("taxonomy_tree")
    .select("node_id, parent_id, name, slug, level")
    .eq("discipline_id", startNode.discipline_id)
    .eq("is_cross_ref_only", startNode.is_cross_ref_only)
    .is("deprecated_at", null)
    .not("ale_id", "is", null)
    .order("level", { ascending: true });

  if (!allNodes) return [];

  interface BreadcrumbNode {
    node_id: string
    parent_id: string | null
    name: string
    slug: string | null
    level: number
  }

  const nodeMap = new Map<string, BreadcrumbNode>(
    allNodes.map((n: any) => [n.node_id, n as BreadcrumbNode])
  );
  const trail: BreadcrumbItem[] = [];
  let currentId: string | null = nodeId;

  while (currentId) {
    const node = nodeMap.get(currentId);
    if (!node) break;
    trail.unshift({
      name: node.name,
      slug: node.slug,
      node_id: node.node_id,
      level: node.level,
    });
    currentId = node.parent_id;
  }

  return trail;
}
