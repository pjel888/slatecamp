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
    .select('*')
    .eq('discipline_id', disciplineId)
    .lte('level', 3)
    .eq('is_cross_ref_only', false)
    .is('deprecated_at', null)
    .not('ale_id', 'is', null)
    .order('level', { ascending: true })
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

  // 3. Fetch articles
  const nodeIds = nodes.map((n: any) => n.node_id)
  const { data: articleMappings } = await supabase
    .from('wiki_article_taxonomy')
    .select('node_id, wiki_articles(article_id, slug, title)')
    .in('node_id', nodeIds)

  const articleMap = new Map<string, any[]>()
  articleMappings?.forEach((mapping: any) => {
    if (!articleMap.has(mapping.node_id)) {
      articleMap.set(mapping.node_id, [])
    }
    articleMap.get(mapping.node_id)!.push(mapping.wiki_articles)
  })

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
