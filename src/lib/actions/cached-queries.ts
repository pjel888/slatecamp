'use server'

import { unstable_cache } from 'next/cache'
import { createStaticClient } from '@/lib/supabase/server'
import { resolveArticleAndNode, getTaxonomyTree } from './wiki-actions'
import { CACHE_TAGS, getTaxonomyDisciplineTag } from './cache-tags'

const toExcerpt = (content: string, maxLength = 150) => {
  const plainText = content
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim()

  return plainText.length > maxLength
    ? `${plainText.slice(0, maxLength - 3)}...`
    : plainText
}

// ── Global data caches (same for all users, revalidate hourly) ───────────

/** All disciplines — used in layout sidebar + discipline context. */
export const getCachedDisciplines = unstable_cache(
  async () => {
    const supabase = await createStaticClient()
    const { data } = await supabase
      .from('disciplines')
      .select('discipline_id, name, acronym, created_at, updated_at')
      .order('name')
    return data ?? []
  },
  ['disciplines'],
  { revalidate: 3600 }
)

/** Dashboard taxonomy tree (levels 1–3, excluding cross-ref and deprecated). */
export const getCachedTaxonomyTree = unstable_cache(
  async () => {
    const supabase = await createStaticClient()
    const { data } = await supabase
      .from('taxonomy_tree')
      .select('node_id, parent_id, level, name, subject_area, ale_id')
      .in('level', [1, 2, 3])
      .eq('is_cross_ref_only', false)
      .is('deprecated_at', null)
      .not('ale_id', 'is', null)
      .order('subject_area')
      .order('level')
      .order('name')
    return data ?? []
  },
  ['taxonomy-tree-dashboard'],
  {
    revalidate: 7200,
    tags: [CACHE_TAGS.taxonomy],
  }
)

const getCachedTaxonomyTreeByDisciplineFetcher = (disciplineId: string) =>
  unstable_cache(
    async () => {
    const supabase = await createStaticClient()
    const { data } = await supabase
      .from('taxonomy_tree')
      .select('node_id, parent_id, level, name, subject_area, ale_id, is_leaf')
      .eq('discipline_id', disciplineId)
      .in('level', [1, 2, 3])
      .eq('is_cross_ref_only', false)
      .is('deprecated_at', null)
      .not('ale_id', 'is', null)
      .order('subject_area')
      .order('level')
      .order('name')

    return data ?? []
  },
    ['taxonomy-tree-by-discipline', disciplineId],
    {
      revalidate: 7200,
      tags: [CACHE_TAGS.taxonomy, getTaxonomyDisciplineTag(disciplineId)],
    },
  )

/** Dashboard taxonomy tree, scoped to the user's current discipline. */
export const getCachedTaxonomyTreeByDiscipline = async (disciplineId: string) =>
  getCachedTaxonomyTreeByDisciplineFetcher(disciplineId)()

/** Full taxonomy tree with article mappings — used by WikiSidebarLoader. */
const getCachedTaxonomyTreeFullFetcher = (disciplineId: string) =>
  unstable_cache(
    async () => getTaxonomyTree(disciplineId),
    ['taxonomy-tree-full', disciplineId],
    {
      revalidate: 7200,
      tags: [CACHE_TAGS.taxonomy, CACHE_TAGS.wiki, getTaxonomyDisciplineTag(disciplineId)],
    },
  )

export const getCachedTaxonomyTreeFull = async (disciplineId: string) =>
  getCachedTaxonomyTreeFullFetcher(disciplineId)()

/** Wiki articles for daily rotation on dashboard. */
export const getCachedWikiArticles = unstable_cache(
  async () => {
    const supabase = await createStaticClient()
    const { data } = await supabase
      .from('wiki_articles')
      .select('article_id, title, slug, content')
      .eq('status', 'published')
      .order('created_at', { ascending: true })
      .limit(50)

    return (data ?? []).map((article) => ({
      article_id: article.article_id,
      title: article.title,
      slug: article.slug,
      excerpt: toExcerpt(article.content ?? ''),
    }))
  },
  ['wiki-articles-rotation'],
  {
    revalidate: false,
    tags: [CACHE_TAGS.wiki],
  }
)

/** Wiki article + taxonomy node by slug — per-slug cache. */
export const getCachedArticleAndNode = unstable_cache(
  async (slug: string) => resolveArticleAndNode(slug),
  ['wiki-article'],
  {
    revalidate: 3600,
    tags: [CACHE_TAGS.wiki, CACHE_TAGS.taxonomy],
  }
)

// ── Taxonomy graph for session topic resolution (cached 2h) ────────────

interface TaxonomyGraphNode {
  node_id: string
  parent_id: string | null
  is_leaf: boolean
  is_cross_ref_only: boolean
}

const getCachedTaxonomyGraph = unstable_cache(
  async () => {
    const supabase = await createStaticClient()
    const [{ data: nodes }, { data: crossRefs }] = await Promise.all([
      supabase
        .from('taxonomy_tree')
        .select('node_id, parent_id, is_leaf, is_cross_ref_only')
        .is('deprecated_at', null),
      supabase
        .from('taxonomy_cross_references')
        .select('source_node_id, target_node_id'),
    ])
    return {
      nodes: (nodes ?? []) as TaxonomyGraphNode[],
      crossRefs: (crossRefs ?? []) as { source_node_id: string; target_node_id: string }[],
    }
  },
  ['taxonomy-graph-session'],
  { revalidate: 7200, tags: [CACHE_TAGS.taxonomy] }
)

/**
 * Resolves selected topic node_ids to all descendant node_ids where questions live.
 * Handles non-leaf → leaf traversal AND cross-reference resolution.
 * Uses cached taxonomy graph — zero DB queries on cache hit.
 */
export const resolveTaxonomyDescendants = async (selectedTopicIds: string[]): Promise<string[]> => {
  if (selectedTopicIds.length === 0) return []

  const { nodes, crossRefs } = await getCachedTaxonomyGraph()

  // Build lookup maps
  const childrenOf = new Map<string, TaxonomyGraphNode[]>()
  const nodeMap = new Map<string, TaxonomyGraphNode>()
  for (const node of nodes) {
    nodeMap.set(node.node_id, node)
    if (node.parent_id) {
      const siblings = childrenOf.get(node.parent_id)
      if (siblings) siblings.push(node)
      else childrenOf.set(node.parent_id, [node])
    }
  }

  // Build cross-ref map: source → targets
  const crossRefTargets = new Map<string, string[]>()
  for (const cr of crossRefs) {
    const targets = crossRefTargets.get(cr.source_node_id)
    if (targets) targets.push(cr.target_node_id)
    else crossRefTargets.set(cr.source_node_id, [cr.target_node_id])
  }

  // BFS from selected nodes — collect all descendants
  const result = new Set<string>()
  const crossRefSources: string[] = []
  const visited = new Set<string>()
  const queue = [...selectedTopicIds]

  while (queue.length > 0) {
    const nodeId = queue.shift()!
    if (visited.has(nodeId)) continue
    visited.add(nodeId)

    const node = nodeMap.get(nodeId)
    if (!node) {
      result.add(nodeId) // Unknown node — include as-is
      continue
    }

    if (node.is_cross_ref_only) {
      crossRefSources.push(nodeId)
    } else {
      result.add(nodeId)
    }

    const children = childrenOf.get(nodeId)
    if (children) {
      for (const child of children) queue.push(child.node_id)
    }
  }

  // Resolve cross-references → target nodes + their descendants
  for (const sourceId of crossRefSources) {
    const targets = crossRefTargets.get(sourceId) ?? []
    for (const targetId of targets) {
      if (visited.has(targetId)) continue
      const targetQueue = [targetId]
      while (targetQueue.length > 0) {
        const tid = targetQueue.shift()!
        if (visited.has(tid)) continue
        visited.add(tid)
        const tNode = nodeMap.get(tid)
        if (tNode?.is_cross_ref_only) continue
        result.add(tid)
        const tChildren = childrenOf.get(tid)
        if (tChildren) {
          for (const child of tChildren) {
            if (!child.is_cross_ref_only) targetQueue.push(child.node_id)
          }
        }
      }
    }
  }

  return Array.from(result)
}
