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
  ale_id?: string | null
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
    .select('node_id, discipline_id, parent_id, level, name, subject_area, is_leaf, slug, sort_order, ale_id, description, exam_frequency, bloom_level, difficulty, prc_area')
    .eq('discipline_id', disciplineId)
    .lte('level', 3)
    .eq('is_cross_ref_only', false)
    .is('deprecated_at', null)
    .not('ale_id', 'is', null)
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
  nodes.forEach((node: any) => {
    const current = map.get(node.node_id)!
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children!.push(current)
    } else if (node.level === 1) {
      roots.push(current)
    }
  })

  return roots
}
