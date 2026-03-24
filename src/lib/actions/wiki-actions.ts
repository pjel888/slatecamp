'use server'

// wiki-actions: taxonomy tree + article data for wiki sidebar
import { createClient } from "@/lib/supabase/server";
import type { WikiArticle } from "@/types/app";
import type { TaxonomyNode } from "@/lib/actions/taxonomy";

/**
 * Retry a Supabase query on transient gateway errors (502/503/504).
 * Supabase sits behind Cloudflare which returns HTML error pages on
 * gateway failures; the client surfaces the HTML as `error.message`.
 */
async function withRetry<T>(
  fn: () => Promise<{ data: T | null; error: any }>,
  maxRetries = 2,
): Promise<{ data: T | null; error: any }> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await fn()
    if (!result.error) return result

    const msg: string = result.error.message ?? ''
    const isTransient =
      msg.includes('Bad gateway') ||
      msg.includes('<!DOCTYPE') ||
      msg.includes('502') ||
      msg.includes('503') ||
      msg.includes('504')

    if (!isTransient || attempt === maxRetries) return result

    await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
  }
  return fn()
}

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

  console.log(`[getTaxonomyTree] DEBUG: ${nodes.length} nodes fetched (levels: ${[...new Set(nodes.map((n: any) => n.level))].join(',')})`)

  // Fetch wiki articles for nodes that may have them:
  // - All actual leaf nodes (no children in this set) — covers level-3 subtopics
  // - All level-2 nodes — some (e.g., "Subject Overview & Strategy") have articles
  //   linked directly without level-3 children
  const parentNodeIds = new Set(nodes.map((n: any) => n.parent_id).filter(Boolean));
  const leafNodeIds = nodes
    .filter((n: any) => n.level === 2 || !parentNodeIds.has(n.node_id))
    .map((n: any) => n.node_id);

  const articleMap = new Map<string, { article_id: string; slug: string; title: string }[]>();

  console.log(`[getTaxonomyTree] DEBUG: ${leafNodeIds.length} leafNodeIds computed`)

  if (leafNodeIds.length > 0) {
    // Chunk into smaller batches and run in PARALLEL with retry.
    // Uses nested select to combine junction + article lookup in one step.
    const CHUNK_SIZE = 80;
    const chunks: string[][] = [];
    for (let i = 0; i < leafNodeIds.length; i += CHUNK_SIZE) {
      chunks.push(leafNodeIds.slice(i, i + CHUNK_SIZE));
    }

    const chunkResults = await Promise.all(
      chunks.map((chunk) =>
        withRetry(() =>
          supabase
            .from("wiki_article_taxonomy")
            .select("node_id, wiki_articles(article_id, slug, title)")
            .in("node_id", chunk),
        ),
      ),
    );

    for (const { data: rows, error: chunkError } of chunkResults) {
      if (chunkError) {
        console.error("[getTaxonomyTree] Error fetching mappings:", chunkError.code ?? chunkError.message?.slice(0, 120));
        continue;
      }
      if (!rows) continue;
      for (const row of rows as any[]) {
        const article = row.wiki_articles as { article_id: string; slug: string; title: string } | null;
        if (!article) continue;
        if (!articleMap.has(row.node_id)) articleMap.set(row.node_id, []);
        articleMap.get(row.node_id)!.push(article);
      }
    }
  }

  const nodesWithArticles = [...articleMap.entries()].filter(([, arts]) => arts.length > 0).length
  console.log(`[getTaxonomyTree] DEBUG: articleMap has ${articleMap.size} entries, ${nodesWithArticles} nodes with articles. Sample:`, [...articleMap.entries()].slice(0, 2))

  const finalData = nodes.map((node: any) => ({
    ...(node as TaxonomyNode),
    articles: articleMap.get(node.node_id) || [],
  }));

  const withArts = finalData.filter(n => n.articles && n.articles.length > 0).length
  console.log(`[getTaxonomyTree] DEBUG: finalData has ${finalData.length} nodes, ${withArts} have articles`)

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
    const CHUNK_SIZE = 80
    const chunks: string[][] = []
    for (let i = 0; i < leafNodeIds.length; i += CHUNK_SIZE) {
      chunks.push(leafNodeIds.slice(i, i + CHUNK_SIZE))
    }

    const chunkResults = await Promise.all(
      chunks.map((chunk) =>
        withRetry(() =>
          supabase
            .from('wiki_article_taxonomy')
            .select('node_id, wiki_articles(article_id, slug, title)')
            .in('node_id', chunk),
        ),
      ),
    )

    for (const { data: rows, error: chunkError } of chunkResults) {
      if (chunkError) {
        console.error('[getLawsTaxonomyTree] Error fetching mappings:', chunkError.code ?? chunkError.message?.slice(0, 120))
        continue
      }
      if (!rows) continue
      for (const row of rows as any[]) {
        const article = row.wiki_articles as { article_id: string; slug: string; title: string } | null
        if (!article) continue
        if (!articleMap.has(row.node_id)) articleMap.set(row.node_id, [])
        articleMap.get(row.node_id)!.push(article)
      }
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

/**
 * Resolve both the wiki article and the taxonomy node for a given slug in a
 * single efficient query chain, reusing intermediate results.
 *
 * - If the slug matches a wiki_articles.slug, the article is fetched first,
 *   then the junction table is used to find the taxonomy node.
 * - If the slug matches a taxonomy_tree.slug, the node is fetched first,
 *   then the junction table is used to find the primary (or any) article.
 * - Returns { article: null, node: null } when neither path finds a match.
 */
export async function resolveArticleAndNode(
  slug: string,
): Promise<{ article: WikiArticle | null; node: TaxonomyNode | null }> {
  const supabase = await createClient()

  // Path 1: slug matches an article slug
  const { data: article } = await supabase
    .from('wiki_articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .limit(1)
    .maybeSingle()

  if (article) {
    // Article found — resolve its taxonomy node via junction table
    const { data: junction } = await supabase
      .from('wiki_article_taxonomy')
      .select('node_id')
      .eq('article_id', (article as WikiArticle).article_id)
      .eq('is_primary', true)
      .maybeSingle()

    const nodeId =
      junction?.node_id ??
      (await (async () => {
        const { data: fallback } = await supabase
          .from('wiki_article_taxonomy')
          .select('node_id')
          .eq('article_id', (article as WikiArticle).article_id)
          .limit(1)
          .maybeSingle()
        return fallback?.node_id ?? null
      })())

    if (nodeId) {
      const { data: node } = await supabase
        .from('taxonomy_tree')
        .select('*')
        .eq('node_id', nodeId)
        .single()
      return { article: article as WikiArticle, node: node as TaxonomyNode | null }
    }

    return { article: article as WikiArticle, node: null }
  }

  // Path 2: slug matches a taxonomy node slug
  const { data: directNode } = await supabase
    .from('taxonomy_tree')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (!directNode) return { article: null, node: null }

  // Node found — resolve its primary (or any) article via junction table
  const { data: primaryJunction } = await supabase
    .from('wiki_article_taxonomy')
    .select('article_id')
    .eq('node_id', (directNode as TaxonomyNode).node_id)
    .eq('is_primary', true)
    .maybeSingle()

  let articleId = primaryJunction?.article_id

  if (!articleId) {
    const { data: fallbackJunction } = await supabase
      .from('wiki_article_taxonomy')
      .select('article_id')
      .eq('node_id', (directNode as TaxonomyNode).node_id)
      .limit(1)
      .maybeSingle()
    articleId = fallbackJunction?.article_id
  }

  if (!articleId) return { article: null, node: directNode as TaxonomyNode }

  const { data: nodeArticle } = await supabase
    .from('wiki_articles')
    .select('*')
    .eq('article_id', articleId)
    .eq('status', 'published')
    .maybeSingle()

  return {
    article: nodeArticle as WikiArticle | null,
    node: directNode as TaxonomyNode,
  }
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
 *
 * Fetches only the ancestor chain (3-4 rows) instead of the entire discipline
 * tree (500+ rows).
 */
export async function getBreadcrumbTrail(nodeId: string): Promise<BreadcrumbItem[]> {
  const supabase = await createClient()
  const trail: BreadcrumbItem[] = []
  let currentId: string | null = nodeId

  while (currentId) {
    const { data: node } = await supabase
      .from('taxonomy_tree')
      .select('node_id, parent_id, name, slug, level')
      .eq('node_id', currentId)
      .single()

    if (!node) break
    trail.unshift({ name: node.name, slug: node.slug, node_id: node.node_id, level: node.level })
    currentId = node.parent_id
  }

  return trail
}
