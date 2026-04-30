'use server'

import { createClient } from '@/lib/supabase/server'

export interface TaxonomyNode {
  node_id: string
  discipline_id: string
  parent_id: string | null
  level: number
  name: string
  subject_area: string
  is_leaf: boolean
  slug?: string
  sort_order?: number | null
  // Taxonomy v5.0 fields (from DB, used by wiki hero)
  lea_id?: string | null
  description?: string | null
  exam_frequency?: string | null
  bloom_level?: string | null
  difficulty?: number | null
  prc_area?: string | null
  children?: TaxonomyNode[]
  articles?: { article_id: string, slug: string, title: string }[]
  mastery?: number // 0.0 to 1.0
  last_encountered?: string
  total_attempts?: number
}

export async function getTaxonomyTree(disciplineId: string): Promise<TaxonomyNode[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Fetch nodes for the discipline
  const { data: nodes, error } = await supabase
    .from('taxonomy_tree')
    .select('node_id, discipline_id, parent_id, level, name, subject_area, is_leaf, slug, sort_order, lea_id, description, exam_frequency, bloom_level, difficulty, prc_area')
    .eq('discipline_id', disciplineId)
    .lte('level', 3)
    .eq('is_cross_ref_only', false)
    .is('deprecated_at', null)
    .order('level', { ascending: true })
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })

  if (error || !nodes) {
    console.error('Error fetching taxonomy tree:', error)
    return []
  }

  // 2. Fetch user mastery data if authenticated
  let masteryMap = new Map<string, { weight: number, last: string, attempts: number }>()
  if (user) {
    const { data: mastery } = await supabase
      .from('user_node_mastery')
      .select('topic_id, current_mastery_weight, last_encountered, total_attempts')
      .eq('user_id', user.id)
    
    mastery?.forEach(m => {
      masteryMap.set(m.topic_id, {
        weight: m.current_mastery_weight,
        last: m.last_encountered,
        attempts: m.total_attempts
      })
    })
  }

  // 3. Fetch articles — for leaf nodes (no children in set), chunked to avoid PostgREST URL limits
  const parentNodeIds = new Set(nodes.map((n: any) => n.parent_id).filter(Boolean))
  const leafNodeIds = nodes
    .filter((n: any) => n.level === 2 || !parentNodeIds.has(n.node_id))
    .map((n: any) => n.node_id)

  const articleMap = new Map<string, any[]>()

  if (leafNodeIds.length > 0) {
    const CHUNK_SIZE = 150
    const allJunctionRows: { node_id: string; article_id: string }[] = []

    for (let i = 0; i < leafNodeIds.length; i += CHUNK_SIZE) {
      const chunk = leafNodeIds.slice(i, i + CHUNK_SIZE)
      const { data: rows } = await supabase
        .from('wiki_article_taxonomy')
        .select('node_id, article_id')
        .in('node_id', chunk)
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
        const article = articleById.get(row.article_id)
        if (!article) return
        if (!articleMap.has(row.node_id)) articleMap.set(row.node_id, [])
        articleMap.get(row.node_id)!.push(article)
      })
    }
  }

  const map = new Map<string, TaxonomyNode>()
  const roots: TaxonomyNode[] = []

  // 4. Index and augment all nodes
  nodes.forEach((node: any) => {
    const m = masteryMap.get(node.node_id)
    map.set(node.node_id, { 
      ...node, 
      children: [], 
      articles: articleMap.get(node.node_id) || [],
      mastery: m?.weight,
      last_encountered: m?.last,
      total_attempts: m?.attempts
    })
  })

  // 5. Build tree
  const sortNodes = (a: TaxonomyNode, b: TaxonomyNode) => {
    if (a.name === 'Subject Overview & Strategy') return -1
    if (b.name === 'Subject Overview & Strategy') return 1
    if (a.name === 'Subject Mastery & Connections') return 1
    if (b.name === 'Subject Mastery & Connections') return -1
    
    // Fallback to existing order
    if (a.level !== b.level) return a.level - b.level
    if (a.sort_order !== b.sort_order) {
      return (a.sort_order ?? 999) - (b.sort_order ?? 999)
    }
    return a.name.localeCompare(b.name)
  }

  nodes.forEach((node: any) => {
    const current = map.get(node.node_id)!
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children!.push(current)
    } else if (node.level === 1) {
      roots.push(current)
    }
  })

  // Sort all levels recursively
  const sortAllLevels = (node: TaxonomyNode) => {
    if (node.children && node.children.length > 0) {
      node.children.sort(sortNodes)
      node.children.forEach(sortAllLevels)
    }
  }
  roots.sort(sortNodes)
  roots.forEach(sortAllLevels)

  return roots
}

/**
 * Fetches the top-level subjects (Level 1) for the user's current discipline.
 * Used by the Quiz configurator.
 */
export async function getCoreSubjects() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // 1. Get current discipline
  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('current_discipline_id')
    .eq('user_id', user.id)
    .single()

  if (!stats?.current_discipline_id) return []

  // 2. Fetch Level 1 nodes for this discipline
  const { data: subjects, error } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name, subject_area, sort_order')
    .eq('discipline_id', stats.current_discipline_id)
    .eq('level', 1)
    .is('deprecated_at', null)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('[getCoreSubjects] error:', error)
    return []
  }

  return subjects ?? []
}
