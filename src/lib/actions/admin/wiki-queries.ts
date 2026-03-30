'use server'

import { createClient } from '@/lib/supabase/server'
import { canReviewContent } from '@/lib/admin/roles'

export const getArticlesWithCoverage = async () => {
  const authorized = await canReviewContent()
  if (!authorized) throw new Error('Unauthorized')

  const supabase = await createClient()

  const { data: articles } = await supabase
    .from('wiki_articles')
    .select('article_id, title, slug, status, content, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(200)

  if (!articles) return []

  const articleIds = articles.map((a) => a.article_id)
  const { data: mappings } = await supabase
    .from('wiki_article_taxonomy')
    .select('article_id, node_id')
    .in('article_id', articleIds)

  if (!mappings || mappings.length === 0) {
    return articles.map((a) => ({ ...a, questionCount: 0, hasCoverage: false }))
  }

  const nodeIds = [...new Set(mappings.map((m) => m.node_id))]
  const { data: questions } = await supabase
    .from('questions')
    .select('topic_id')
    .in('topic_id', nodeIds)

  const nodeQuestionCount = new Map<string, number>()
  for (const q of questions ?? []) {
    nodeQuestionCount.set(q.topic_id, (nodeQuestionCount.get(q.topic_id) ?? 0) + 1)
  }

  const articleQuestionCount = new Map<string, number>()
  for (const m of mappings) {
    const current = articleQuestionCount.get(m.article_id) ?? 0
    articleQuestionCount.set(m.article_id, current + (nodeQuestionCount.get(m.node_id) ?? 0))
  }

  return articles.map((a) => ({
    ...a,
    questionCount: articleQuestionCount.get(a.article_id) ?? 0,
    hasCoverage: (articleQuestionCount.get(a.article_id) ?? 0) > 0,
  }))
}

export const getArticles = async () => {
  const authorized = await canReviewContent()
  if (!authorized) throw new Error('Unauthorized')

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('wiki_articles')
    .select('article_id, title, slug, status, content, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(200)

  if (error) {
    console.error('Error fetching articles:', error)
    return []
  }

  return data || []
}

export const getArticle = async (id: string) => {
  const authorized = await canReviewContent()
  if (!authorized) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('wiki_articles')
    .select('id:article_id, title, content')
    .eq('article_id', id)
    .single()

  if (error || !data) return null
  return data
}

/* ------------------------------------------------------------------ */
/*  Admin Taxonomy Tree (for admin/articles page)                      */
/* ------------------------------------------------------------------ */

export interface AdminArticle {
  article_id: string
  title: string
  slug: string | null
  status: string | null
  content: string | null
  created_at: string
  updated_at: string
  questionCount: number
}

export interface AdminTaxonomyNode {
  node_id: string
  parent_id: string | null
  level: number
  name: string
  slug: string | null
  ale_id: string | null
  sort_order: number | null
  is_leaf: boolean
  children?: AdminTaxonomyNode[]
  articles?: AdminArticle[]
  article_count?: number
}

export interface AdminDiscipline {
  discipline_id: string
  name: string
  acronym: string | null
}

export interface AdminTaxonomyResult {
  disciplines: AdminDiscipline[]
  treeByDiscipline: Record<string, AdminTaxonomyNode[]>
  unmappedArticles: AdminArticle[]
}

export const getAdminTaxonomyTree = async (): Promise<AdminTaxonomyResult> => {
  const authorized = await canReviewContent()
  if (!authorized) throw new Error('Unauthorized')

  const supabase = await createClient()

  // 1. Fetch all disciplines
  const { data: disciplines } = await supabase
    .from('disciplines')
    .select('discipline_id, name, acronym')
    .order('name')

  // 2. Fetch all taxonomy nodes (across all disciplines)
  const { data: nodes } = await supabase
    .from('taxonomy_tree')
    .select('node_id, discipline_id, parent_id, level, name, slug, ale_id, sort_order, is_leaf')
    .is('deprecated_at', null)
    .lte('level', 3)
    .order('level', { ascending: true })
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })

  // 3. Fetch all wiki articles
  const { data: articles } = await supabase
    .from('wiki_articles')
    .select('article_id, title, slug, status, content, created_at, updated_at')
    .order('title', { ascending: true })
    .limit(500)

  if (!nodes || !articles) {
    return { disciplines: disciplines ?? [], treeByDiscipline: {}, unmappedArticles: [] }
  }

  // 4. Fetch article→node mappings in chunks to avoid GET URI too long errors
  const articleIds = articles.map((a) => a.article_id)
  const mappings: { article_id: string; node_id: string }[] = []
  
  if (articleIds.length > 0) {
    const CHUNK_SIZE = 100
    for (let i = 0; i < articleIds.length; i += CHUNK_SIZE) {
      const chunk = articleIds.slice(i, i + CHUNK_SIZE)
      const { data: chunkMappings } = await supabase
        .from('wiki_article_taxonomy')
        .select('article_id, node_id')
        .in('article_id', chunk)
      if (chunkMappings) mappings.push(...chunkMappings)
    }
  }

  // 5. Fetch question counts per node
  const nodeIds = nodes.map((n) => n.node_id)
  const questionCountMap = new Map<string, number>()
  if (nodeIds.length > 0) {
    const CHUNK = 200
    for (let i = 0; i < nodeIds.length; i += CHUNK) {
      const chunk = nodeIds.slice(i, i + CHUNK)
      const { data: qRows } = await supabase
        .from('questions')
        .select('topic_id')
        .in('topic_id', chunk)
      for (const q of qRows ?? []) {
        questionCountMap.set(q.topic_id, (questionCountMap.get(q.topic_id) ?? 0) + 1)
      }
    }
  }

  // 6. Build article question count map via node mappings
  const articleQuestionCount = new Map<string, number>()
  const articleNodeMap = new Map<string, string[]>() // articleId → nodeIds
  for (const m of mappings ?? []) {
    if (!articleNodeMap.has(m.article_id)) articleNodeMap.set(m.article_id, [])
    articleNodeMap.get(m.article_id)!.push(m.node_id)
    const qc = questionCountMap.get(m.node_id) ?? 0
    articleQuestionCount.set(m.article_id, (articleQuestionCount.get(m.article_id) ?? 0) + qc)
  }

  // 7. Build node→articles map
  const nodeArticleMap = new Map<string, AdminArticle[]>()
  for (const m of mappings ?? []) {
    const article = articles.find((a) => a.article_id === m.article_id)
    if (!article) continue
    const adminArticle: AdminArticle = {
      ...article,
      questionCount: articleQuestionCount.get(article.article_id) ?? 0,
    }
    if (!nodeArticleMap.has(m.node_id)) nodeArticleMap.set(m.node_id, [])
    nodeArticleMap.get(m.node_id)!.push(adminArticle)
  }

  // 8. Build tree structure per discipline
  const treeByDiscipline: Record<string, AdminTaxonomyNode[]> = {}
  const mappedArticleIds = new Set((mappings ?? []).map((m) => m.article_id))

  for (const disc of disciplines ?? []) {
    const discNodes = nodes.filter((n: any) => n.discipline_id === disc.discipline_id)
    const nodeMap = new Map<string, AdminTaxonomyNode>()

    for (const n of discNodes) {
      nodeMap.set(n.node_id, {
        node_id: n.node_id,
        parent_id: n.parent_id,
        level: n.level,
        name: n.name,
        slug: n.slug,
        ale_id: n.ale_id,
        sort_order: n.sort_order,
        is_leaf: n.is_leaf,
        children: [],
        articles: nodeArticleMap.get(n.node_id) ?? [],
        article_count: 0,
      })
    }

    // 8.5 Sort children: Overview first, Mastery last
    const sortNodes = (a: AdminTaxonomyNode, b: AdminTaxonomyNode) => {
      if (a.name === 'Subject Overview & Strategy') return -1
      if (b.name === 'Subject Overview & Strategy') return 1
      if (a.name === 'Subject Mastery & Connections') return 1
      if (b.name === 'Subject Mastery & Connections') return -1
      
      // Fallback to existing order (level, then sort_order, then name)
      if (a.level !== b.level) return a.level - b.level
      if (a.sort_order !== b.sort_order) {
        return (a.sort_order ?? 999) - (b.sort_order ?? 999)
      }
      return a.name.localeCompare(b.name)
    }

    // Propagate article counts and build tree
    const roots: AdminTaxonomyNode[] = []
    for (const n of discNodes) {
      const treeNode = nodeMap.get(n.node_id)!
      if (n.parent_id && nodeMap.has(n.parent_id)) {
        nodeMap.get(n.parent_id)!.children!.push(treeNode)
      } else if (n.level === 1) {
        roots.push(treeNode)
      }
    }

    // Sort all levels
    const sortAllLevels = (node: AdminTaxonomyNode) => {
      if (node.children && node.children.length > 0) {
        node.children.sort(sortNodes)
        node.children.forEach(sortAllLevels)
      }
    }
    roots.sort(sortNodes)
    roots.forEach(sortAllLevels)

    // Count articles recursively
    const countArticles = (node: AdminTaxonomyNode): number => {
      const own = node.articles?.length ?? 0
      const child = (node.children ?? []).reduce((s, c) => s + countArticles(c), 0)
      node.article_count = own + child
      return node.article_count
    }
    roots.forEach(countArticles)

    treeByDiscipline[disc.discipline_id] = roots
  }

  // 9. Collect unmapped articles
  const unmappedArticles: AdminArticle[] = articles
    .filter((a) => !mappedArticleIds.has(a.article_id))
    .map((a) => ({ ...a, questionCount: 0 }))

  return {
    disciplines: (disciplines ?? []) as AdminDiscipline[],
    treeByDiscipline,
    unmappedArticles,
  }
}
