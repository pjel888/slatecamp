
import { createClient } from '@/lib/supabase/server'

/* ------------------------------------------------------------------
 *  Types
 * ------------------------------------------------------------------ */

interface TaxonomyNode {
  node_id: string
  name: string
  ale_id: string | null
  parent_id: string | null
  level: number
  exam_frequency: string | null
}

export interface CoverageCellData {
  node_id: string
  name: string
  ale_id: string | null
  questionCount: number
  hasArticle: boolean
  examFrequency: string | null
}

export type CoverageLevel = 'full' | 'partial' | 'empty' | 'critical'

/* ------------------------------------------------------------------
 *  Helpers
 * ------------------------------------------------------------------ */

export const classifyCoverage = (cell: CoverageCellData): CoverageLevel => {
  const hasQuestions = cell.questionCount > 0
  const isHighFrequency = cell.examFrequency === 'high'

  if (cell.questionCount >= 10 && cell.hasArticle) return 'full'
  if (hasQuestions || cell.hasArticle) return 'partial'
  if (!hasQuestions && !cell.hasArticle && isHighFrequency) return 'critical'
  return 'empty'
}

/* ------------------------------------------------------------------
 *  Data fetching
 * ------------------------------------------------------------------ */

export const fetchCoverageData = async () => {
  const supabase = await createClient()

  // 1. Get taxonomy nodes at level 1 and 2
  const { data: nodes, error: nodesError } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name, ale_id, parent_id, level, exam_frequency')
    .in('level', [1, 2])
    .is('deprecated_at', null)
    .eq('is_cross_ref_only', false)
    .order('name', { ascending: true })

  if (nodesError || !nodes) {
    console.error('Error fetching taxonomy nodes:', nodesError)
    return { level1: [], childrenMap: new Map<string, CoverageCellData[]>(), stats: { total: 0, full: 0, partial: 0, empty: 0, critical: 0 } }
  }

  // 2. Scope queries to only relevant node IDs (level-2 nodes)
  const level2NodeIds = (nodes as TaxonomyNode[]).filter((n) => n.level === 2).map((n) => n.node_id)

  // Get question counts per topic_id — scoped to relevant nodes only
  const { data: questions, error: qError } = await supabase
    .from('questions')
    .select('topic_id')
    .in('topic_id', level2NodeIds)

  if (qError) console.error('Error fetching questions:', qError)

  const questionCounts = new Map<string, number>()
  questions?.forEach((q) => {
    const current = questionCounts.get(q.topic_id) ?? 0
    questionCounts.set(q.topic_id, current + 1)
  })

  // 3. Get article presence via junction table — scoped to relevant nodes only
  const { data: articleLinks, error: aError } = await supabase
    .from('wiki_article_taxonomy')
    .select('node_id')
    .in('node_id', level2NodeIds)

  if (aError) console.error('Error fetching article taxonomy:', aError)

  const articleNodeSet = new Set<string>()
  articleLinks?.forEach((link) => articleNodeSet.add(link.node_id))

  // 4. Separate level-1 and level-2 nodes
  const level1Nodes = (nodes as TaxonomyNode[]).filter((n) => n.level === 1)
  const level2Nodes = (nodes as TaxonomyNode[]).filter((n) => n.level === 2)

  // 5. Build children map: parent_id -> CoverageCellData[]
  const childrenMap = new Map<string, CoverageCellData[]>()

  level2Nodes.forEach((n) => {
    if (!n.parent_id) return
    const cell: CoverageCellData = {
      node_id: n.node_id,
      name: n.name,
      ale_id: n.ale_id,
      questionCount: questionCounts.get(n.node_id) ?? 0,
      hasArticle: articleNodeSet.has(n.node_id),
      examFrequency: n.exam_frequency,
    }
    const existing = childrenMap.get(n.parent_id) ?? []
    existing.push(cell)
    childrenMap.set(n.parent_id, existing)
  })

  // 6. Compute stats
  const allCells = level2Nodes.map((n) => ({
    node_id: n.node_id,
    name: n.name,
    ale_id: n.ale_id,
    questionCount: questionCounts.get(n.node_id) ?? 0,
    hasArticle: articleNodeSet.has(n.node_id),
    examFrequency: n.exam_frequency,
  }))

  const stats = {
    total: allCells.length,
    full: allCells.filter((c) => classifyCoverage(c) === 'full').length,
    partial: allCells.filter((c) => classifyCoverage(c) === 'partial').length,
    empty: allCells.filter((c) => classifyCoverage(c) === 'empty').length,
    critical: allCells.filter((c) => classifyCoverage(c) === 'critical').length,
  }

  return { level1: level1Nodes, childrenMap, stats }
}
