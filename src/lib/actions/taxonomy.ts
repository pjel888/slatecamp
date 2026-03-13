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
}

export async function getTaxonomyTree(disciplineId: string): Promise<TaxonomyNode[]> {
  const supabase = await createClient()

  // Fetch nodes for the discipline (Levels 1-3 as per prompt)
  const { data: nodes, error } = await supabase
    .from('taxonomy_tree')
    .select('*')
    .eq('discipline_id', disciplineId)
    .lte('level', 3)
    .order('level', { ascending: true })
    .order('name', { ascending: true })

  if (error || !nodes) {
    console.error('Error fetching taxonomy tree:', error)
    return []
  }

  // Fetch articles mapped to these nodes
  const nodeIds = nodes.map(n => n.node_id)
  const { data: articleMappings, error: mappingError } = await supabase
    .from('wiki_article_taxonomy')
    .select('node_id, wiki_articles(article_id, slug, title)')
    .in('node_id', nodeIds)

  if (mappingError) {
    console.error('Error fetching article mappings:', mappingError)
  }

  const articleMap = new Map<string, any[]>()
  articleMappings?.forEach((mapping: any) => {
    if (!articleMap.has(mapping.node_id)) {
      articleMap.set(mapping.node_id, [])
    }
    articleMap.get(mapping.node_id)!.push(mapping.wiki_articles)
  })

  const map = new Map<string, TaxonomyNode>()
  const roots: TaxonomyNode[] = []

  // Index all nodes
  nodes.forEach(node => {
    map.set(node.node_id, { 
      ...node, 
      children: [], 
      articles: articleMap.get(node.node_id) || [] 
    })
  })

  // Build tree
  nodes.forEach(node => {
    const current = map.get(node.node_id)!
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children!.push(current)
    } else if (node.level === 1) {
      roots.push(current)
    }
  })

  return roots
}
