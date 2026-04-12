'use server'

// wiki-actions: taxonomy tree + article data for wiki sidebar
import { cache } from 'react'
import { createClient, createStaticClient } from "@/lib/supabase/server";
import type { WikiArticle } from "@/types/app";
import type { TaxonomyNode } from "@/lib/actions/taxonomy";
import { getCachedTaxonomyTreeByDiscipline } from "./cached-queries";

/**
 * Perform a pure Postgres Full-Text Search on wiki articles.
 * High performance, zero cost, supports stemming and relevance ranking.
 */
export async function searchWikiArticles(query: string): Promise<any[]> {
  if (!query || query.trim().length < 2) return [];

  const supabase = await createClient();
  
  // Try the optimized RPC first
  const { data, error } = await supabase.rpc('search_wiki_articles_pure', {
    query_text: query.trim(),
    match_count: 10
  });

  if (error) {
    console.error("[searchWikiArticles] RPC Error:", error.message);
    
    // Fallback to simpler keyword search if RPC is missing or fails
    const { data: fallback, error: fallbackError } = await supabase
      .from('wiki_articles')
      .select('article_id, title, slug, content')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .eq('status', 'published')
      .limit(8);
    
    if (fallbackError) {
      console.error("[searchWikiArticles] Fallback Error:", fallbackError.message);
      return [];
    }

    return (fallback ?? []).map(a => ({
      article_id: a.article_id,
      title: a.title,
      slug: a.slug,
      snippet: (a.content || '').slice(0, 160).replace(/[#*]/g, '') + '...',
      rank: 0
    }));
  }

  return data ?? [];
}

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
  const supabase = await createStaticClient();

  // Fetch all taxonomy nodes for the discipline
  const { data: nodes, error } = await supabase
    .from("taxonomy_tree")
    .select("*")
    .eq("discipline_id", disciplineId)
    .eq("is_cross_ref_only", false)
    .is("deprecated_at", null)
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
            .select("node_id, sort_order, wiki_articles(article_id, slug, title)")
            .in("node_id", chunk)
            .order("sort_order", { ascending: true }),
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

  const finalData = nodes.map((node: any) => ({
    ...(node as TaxonomyNode),
    articles: articleMap.get(node.node_id) || [],
  }));

  return finalData
}

/**
 * Fetch the active taxonomy node for a given slug.
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
  const start = performance.now()
  const supabase = await createStaticClient()

  // Try single-roundtrip RPC first (replaces 2-4 sequential queries)
  const { data: rpcResult, error: rpcError } = await supabase.rpc('get_article_with_node', { p_slug: slug })

  if (!rpcError && rpcResult) {
    const result = rpcResult as { article: WikiArticle | null; node: TaxonomyNode | null }
    const elapsed = (performance.now() - start).toFixed(1)
    console.log(`[resolveArticleAndNode] RPC resolved "${slug}" in ${elapsed}ms`)
    return {
      article: result.article ?? null,
      node: result.node ?? null,
    }
  }

  // Fallback: sequential queries if RPC fails (resilience)
  if (rpcError) {
    console.warn('[resolveArticleAndNode] RPC fallback:', rpcError.message)
  }

  // Path 1: slug matches an article slug
  const { data: article } = await supabase
    .from('wiki_articles')
    .select('article_id, slug, title, content, created_at, updated_at, lea_tests_you, updated_note, subject_label, difficulty_label, status')
    .eq('slug', slug)
    .eq('status', 'published')
    .limit(1)
    .maybeSingle()

  if (article) {
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
        .select('node_id, discipline_id, parent_id, level, name, subject_area, is_leaf, slug, sort_order, lea_id, description, exam_frequency, bloom_level, difficulty, prc_area')
        .eq('node_id', nodeId)
        .single()
      return { article: article as WikiArticle, node: node as TaxonomyNode | null }
    }

    return { article: article as WikiArticle, node: null }
  }

  // Path 2: slug matches a taxonomy node slug
  const { data: directNode } = await supabase
    .from('taxonomy_tree')
    .select('node_id, discipline_id, parent_id, level, name, subject_area, is_leaf, slug, sort_order, lea_id, description, exam_frequency, bloom_level, difficulty, prc_area')
    .eq('slug', slug)
    .maybeSingle()

  if (!directNode) return { article: null, node: null }

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
    .select('article_id, slug, title, content, created_at, updated_at, lea_tests_you, updated_note, subject_label, difficulty_label, status')
    .eq('article_id', articleId)
    .eq('status', 'published')
    .maybeSingle()

  const elapsed = (performance.now() - start).toFixed(1)
  console.log(`[resolveArticleAndNode] Fallback resolved "${slug}" in ${elapsed}ms`)
  return {
    article: nodeArticle as WikiArticle | null,
    node: directNode as TaxonomyNode,
  }
}

// Request-level memoization — deduplicates calls within a single server render pass
export const memoizedResolveArticleAndNode = cache(resolveArticleAndNode)
export const memoizedGetTaxonomyTree = cache(getTaxonomyTree)
export const memoizedGetBreadcrumbTrail = cache(getBreadcrumbTrail)

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
 * This version uses the cached taxonomy tree to avoid sequential roundtrips.
 */
export async function getBreadcrumbTrail(nodeId: string, disciplineId?: string): Promise<BreadcrumbItem[]> {
  const supabase = await createClient()
  let finalDisciplineId = disciplineId

  // 1. If disciplineId is not provided, fetch it from the node first
  if (!finalDisciplineId) {
    const { data: node } = await supabase
      .from('taxonomy_tree')
      .select('discipline_id')
      .eq('node_id', nodeId)
      .single()
    finalDisciplineId = node?.discipline_id
  }

  if (!finalDisciplineId) return []

  // 2. Fetch the entire discipline tree (cached)
  const tree = await getCachedTaxonomyTreeByDiscipline(finalDisciplineId) as TaxonomyNode[]
  const trail: BreadcrumbItem[] = []
  
  // 3. Build the trail in-memory
  const nodeMap = new Map(tree.map(n => [n.node_id, n]))
  let currentId: string | null = nodeId

  while (currentId) {
    const node = nodeMap.get(currentId)
    if (!node) break
    
    trail.unshift({ 
      name: node.name, 
      slug: (node as any).slug ?? null, 
      node_id: node.node_id, 
      level: node.level 
    })
    
    currentId = node.parent_id
  }

  return trail
}

/**
 * Fetch sibling taxonomy nodes for a given node, ordered by sort_order.
 * Used for "Previous" and "Next" article navigation.
 */
export async function getArticleSiblings(nodeId: string): Promise<{ prev: TaxonomyNode | null; next: TaxonomyNode | null }> {
  const supabase = await createClient()

  // 1. Get current node to find parent and sort_order
  const { data: currentNode, error: currentError } = await supabase
    .from('taxonomy_tree')
    .select('parent_id, sort_order, discipline_id, level')
    .eq('node_id', nodeId)
    .single()

  if (currentError || !currentNode) return { prev: null, next: null }

  // 2. Fetch all siblings in the same discipline and level with the same parent
  const { data: siblings, error: siblingsError } = await supabase
    .from('taxonomy_tree')
    .select('*')
    .eq('parent_id', currentNode.parent_id)
    .eq('discipline_id', currentNode.discipline_id)
    .eq('level', currentNode.level)
    .is('deprecated_at', null)
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })

  if (siblingsError || !siblings || siblings.length <= 1) return { prev: null, next: null }

  // 3. Find current index and pick neighbors
  const currentIndex = siblings.findIndex(s => s.node_id === nodeId)
  if (currentIndex === -1) return { prev: null, next: null }

  return {
    prev: (siblings[currentIndex - 1] as unknown as TaxonomyNode) ?? null,
    next: (siblings[currentIndex + 1] as unknown as TaxonomyNode) ?? null,
  }
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
    .select(`
      wiki_articles (
        article_id, slug, title, content, created_at, updated_at,
        lea_tests_you, updated_note, subject_label, difficulty_label, status
      )
    `)
    .eq("node_id", nodeId);

  if (error || !data) {
    if (error) console.error('[getWikiArticlesByNode] failed:', error.message)
    return [];
  }
  return data.map(d => d.wiki_articles).filter(Boolean) as unknown as WikiArticle[];
}

/**
 * Paginated search fallback using ilike.
 */
export async function searchWikiPaginated(
  searchTerm: string,
  page = 1,
  perPage = 10
): Promise<{ results: any[]; totalCount: number }> {
  const supabase = await createClient();
  const offset = (page - 1) * perPage;

  const { data, error, count } = await supabase
    .from("wiki_articles")
    .select("article_id, title, slug, content", { count: 'exact' })
    .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
    .eq('status', 'published')
    .range(offset, offset + perPage - 1);

  if (error || !data) {
    if (error) console.error('[searchWikiPaginated] failed:', error.message)
    return { results: [], totalCount: 0 };
  }

  const results = data.map(d => ({
    id: d.article_id,
    title: d.title,
    slug: d.slug,
    content_snippet: (d.content || '').slice(0, 160).replace(/[#*]/g, '') + '...'
  }));

  return { results, totalCount: count ?? 0 };
}

