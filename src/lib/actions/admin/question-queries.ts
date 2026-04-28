'use server'

import { createClient } from '@/lib/supabase/server'
import { assertPermission } from '@/lib/admin/roles'
import { isExceptionQuestionType } from '@/lib/admin/editor-integrity/standard-question'

export interface Question {
  question_id: string
  text: string
  topic_id: string
  article_id?: string | null
  question_type?: string | null
  difficulty: number | null
  rationale: string | null
  options: unknown[] | null
  code_citation: string | null
  created_at: string
  updated_at: string
}

const assertCanReadAdminQuestions = async () => {
  await assertPermission('admin.content.view')
}

export const getQuestions = async (
  page = 1,
  pageSize = 50,
): Promise<{ data: Question[]; totalCount: number }> => {
  await assertCanReadAdminQuestions()
  const supabase = await createClient()

  const from = (page - 1) * pageSize
  const to = page * pageSize - 1

  const { data, error, count } = await supabase
    .from('questions')
    .select('question_id, text, topic_id, article_id, question_type, difficulty, rationale, options, code_citation, created_at, updated_at', {
      count: 'exact',
      head: false,
    })
    .order('created_at', { ascending: false })
    .range(from, to)
    .limit(pageSize)

  if (error) {
    console.error('Error fetching questions:', error)
    return { data: [], totalCount: 0 }
  }

  const normalizedData = (data ?? []).map(q => ({
    ...q,
    rationale: typeof q.rationale === 'object' && q.rationale !== null 
      ? (q.rationale as any).text || JSON.stringify(q.rationale)
      : q.rationale || ''
  }))

  return { data: normalizedData, totalCount: count ?? 0 }
}

export interface ArticleGroup {
  articleId: string | null
  articleTitle: string
  articleStatus: string
  questions: Question[]
  questionCount: number
}

export const getQuestionsGroupedByArticle = async (
  page = 1,
  pageSize = 50,
): Promise<{ data: ArticleGroup[]; totalCount: number }> => {
  await assertCanReadAdminQuestions()
  const supabase = await createClient()

  const from = (page - 1) * pageSize
  const to = page * pageSize - 1

  // Step 1: Fetch paginated questions
  const { data: questions, error: qError, count } = await supabase
    .from('questions')
    .select('question_id, text, topic_id, article_id, question_type, difficulty, rationale, options, code_citation, created_at, updated_at', {
      count: 'exact',
      head: false,
    })
    .order('created_at', { ascending: false })
    .range(from, to)
    .limit(pageSize)

  if (qError || !questions) {
    console.error('Error fetching questions:', qError)
    return { data: [], totalCount: 0 }
  }

  // Step 2: Resolve direct article ownership first, fall back to topic mappings when needed
  const directArticleIds = [...new Set(questions.map((q) => q.article_id).filter(Boolean))]
  const topicIds = [...new Set(questions.map((q) => q.topic_id).filter(Boolean))]

  const articleMap = new Map<string, { articleId: string; articleTitle: string; articleStatus: string }>()
  if (directArticleIds.length > 0) {
    const { data: directArticles } = await supabase
      .from('wiki_articles')
      .select('article_id, title, status')
      .in('article_id', directArticleIds)

    for (const article of directArticles ?? []) {
      articleMap.set(article.article_id, {
        articleId: article.article_id,
        articleTitle: article.title,
        articleStatus: article.status ?? 'draft',
      })
    }
  }

  const topicToArticle = new Map<string, { articleId: string; articleTitle: string; articleStatus: string }>()
  if (topicIds.length > 0) {
    const { data: mappings, error: mError } = await supabase
      .from('wiki_article_taxonomy')
      .select('node_id, article_id, wiki_articles!inner(article_id, title, status)')
      .in('node_id', topicIds)

    if (!mError && mappings) {
      for (const m of mappings) {
        const article = m.wiki_articles as unknown as { article_id: string; title: string; status: string }
        if (article) {
          topicToArticle.set(m.node_id, {
            articleId: article.article_id,
            articleTitle: article.title,
            articleStatus: article.status ?? 'draft',
          })
        }
      }
    }
  }

  // Step 3: Group questions by article
  const groupMap = new Map<string, ArticleGroup>()
  const unassignedKey = '__unassigned__'

  for (const q of questions) {
    const directArticle = q.article_id ? articleMap.get(q.article_id) : undefined
    const mapping =
      directArticle ||
      (isExceptionQuestionType(q.question_type) && q.topic_id
        ? topicToArticle.get(q.topic_id)
        : undefined)
    const key = mapping ? mapping.articleId : unassignedKey
    const existing = groupMap.get(key)

    if (existing) {
      existing.questions.push(q)
      existing.questionCount = existing.questions.length
    } else {
      groupMap.set(key, {
        articleId: mapping ? mapping.articleId : null,
        articleTitle: mapping ? mapping.articleTitle : 'Unassigned',
        articleStatus: mapping ? mapping.articleStatus : 'none',
        questions: [q],
        questionCount: 1,
      })
    }
  }

  // Step 4: Sort groups — articles with names first, unassigned last
  const groups = [...groupMap.values()].sort((a, b) => {
    if (a.articleId === null) return 1
    if (b.articleId === null) return -1
    return a.articleTitle.localeCompare(b.articleTitle)
  })

  return { data: groups, totalCount: count ?? 0 }
}

/**
 * Fetch questions for specific topic IDs (used when a tree node is selected).
 * Returns grouped by article, no pagination — loads all questions under the node.
 */
export const getQuestionsByTopicIds = async (
  topicIds: string[],
  searchQuery?: string
): Promise<{ data: ArticleGroup[] }> => {
  await assertCanReadAdminQuestions()
  if (topicIds.length === 0 && !searchQuery) return { data: [] }
  const supabase = await createClient()

  // Build query
  let query = supabase
    .from('questions')
    .select('question_id, text, topic_id, article_id, question_type, difficulty, rationale, options, code_citation, created_at, updated_at')

  if (topicIds.length > 0) {
    query = query.in('topic_id', topicIds)
  }

  if (searchQuery) {
    query = query.ilike('text', `%${searchQuery}%`)
  }

  const { data: questions, error: qError } = await query
    .order('created_at', { ascending: false })
    .limit(500)

  if (qError || !questions) return { data: [] }

  const normalizedQuestions = questions.map(q => ({
    ...q,
    rationale: typeof q.rationale === 'object' && q.rationale !== null 
      ? (q.rationale as any).text || JSON.stringify(q.rationale)
      : q.rationale || ''
  }))

  // Resolve direct article ownership first
  const directArticleIds = [...new Set(normalizedQuestions.map(q => q.article_id).filter(Boolean))]
  const articleMap = new Map<string, { articleId: string; articleTitle: string; articleStatus: string }>()

  if (directArticleIds.length > 0) {
    const { data: directArticles } = await supabase
      .from('wiki_articles')
      .select('article_id, title, status')
      .in('article_id', directArticleIds)

    for (const article of directArticles ?? []) {
      articleMap.set(article.article_id, {
        articleId: article.article_id,
        articleTitle: article.title,
        articleStatus: article.status ?? 'draft',
      })
    }
  }

  // Resolve articles for these topics when direct ownership is absent
  const uniqueTopics = [...new Set(normalizedQuestions.map(q => q.topic_id).filter(Boolean))]
  const topicToArticle = new Map<string, { articleId: string; articleTitle: string; articleStatus: string }>()

  if (uniqueTopics.length > 0) {
    const { data: mappings } = await supabase
      .from('wiki_article_taxonomy')
      .select('node_id, article_id, wiki_articles!inner(article_id, title, status)')
      .in('node_id', uniqueTopics)

    if (mappings) {
      for (const m of mappings) {
        const article = m.wiki_articles as unknown as { article_id: string; title: string; status: string }
        if (article) {
          topicToArticle.set(m.node_id, {
            articleId: article.article_id,
            articleTitle: article.title,
            articleStatus: article.status ?? 'draft',
          })
        }
      }
    }
  }

  // Group by article
  const groupMap = new Map<string, ArticleGroup>()
  for (const q of normalizedQuestions) {
    const directArticle = q.article_id ? articleMap.get(q.article_id) : undefined
    const mapping =
      directArticle ||
      (isExceptionQuestionType(q.question_type) && q.topic_id
        ? topicToArticle.get(q.topic_id)
        : undefined)
    const key = mapping ? mapping.articleId : '__unassigned__'
    const existing = groupMap.get(key)
    if (existing) {
      existing.questions.push(q)
      existing.questionCount = existing.questions.length
    } else {
      groupMap.set(key, {
        articleId: mapping?.articleId ?? null,
        articleTitle: mapping?.articleTitle ?? 'Unassigned',
        articleStatus: mapping?.articleStatus ?? 'none',
        questions: [q],
        questionCount: 1,
      })
    }
  }

  const groups = [...groupMap.values()].sort((a, b) => {
    if (a.articleId === null) return 1
    if (b.articleId === null) return -1
    return a.articleTitle.localeCompare(b.articleTitle)
  })

  return { data: groups }
}

/* ------------------------------------------------------------------ */
/*  Taxonomy Tree for Questions Nav                                    */
/* ------------------------------------------------------------------ */

export interface QuestionTreeArticle {
  articleId: string
  title: string
  status: string
  questionCount: number
}

export interface QuestionTreeNode {
  nodeId: string
  name: string
  level: number
  parentId: string | null
  questionCount: number
  children: QuestionTreeNode[]
  articles: QuestionTreeArticle[]
}

export const getQuestionsTaxonomyTree = async (): Promise<QuestionTreeNode[]> => {
  await assertCanReadAdminQuestions()
  const supabase = await createClient()

  // 1. Fetch all taxonomy nodes
  const { data: nodes, error: nodesError } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name, level, parent_id, is_leaf, sort_order')
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })

  if (nodesError || !nodes) {
    console.error('Error fetching taxonomy nodes:', nodesError)
    return []
  }

  // 2. Count questions per topic_id
  const { data: qCounts, error: qcError } = await supabase
    .from('questions')
    .select('topic_id')

  const questionCountByTopic = new Map<string, number>()
  if (!qcError && qCounts) {
    for (const row of qCounts) {
      if (row.topic_id) {
        questionCountByTopic.set(row.topic_id, (questionCountByTopic.get(row.topic_id) ?? 0) + 1)
      }
    }
  }

  // 3. Fetch article mappings: wiki_article_taxonomy joined with wiki_articles
  const { data: articleMappings, error: amError } = await supabase
    .from('wiki_article_taxonomy')
    .select('node_id, article_id, wiki_articles!inner(article_id, title, status)')

  const articlesByNodeId = new Map<string, QuestionTreeArticle[]>()
  if (!amError && articleMappings) {
    for (const m of articleMappings) {
      const article = m.wiki_articles as unknown as { article_id: string; title: string; status: string }
      if (article) {
        const existing = articlesByNodeId.get(m.node_id) ?? []
        existing.push({
          articleId: article.article_id,
          title: article.title,
          status: article.status ?? 'draft',
          questionCount: questionCountByTopic.get(m.node_id) ?? 0,
        })
        articlesByNodeId.set(m.node_id, existing)
      }
    }
  }

  // 4. Build flat map of tree nodes
  const nodeMap = new Map<string, QuestionTreeNode>()
  for (const n of nodes) {
    nodeMap.set(n.node_id, {
      nodeId: n.node_id,
      name: n.name,
      level: n.level,
      parentId: n.parent_id,
      questionCount: questionCountByTopic.get(n.node_id) ?? 0,
      children: [],
      articles: articlesByNodeId.get(n.node_id) ?? [],
    })
  }

  // 5. Nest children under parents
  const roots: QuestionTreeNode[] = []
  for (const node of nodeMap.values()) {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  // 6. Bubble up question counts
  const bubbleUp = (node: QuestionTreeNode): number => {
    let childSum = 0
    for (const child of node.children) {
      childSum += bubbleUp(child)
    }
    node.questionCount = node.questionCount + childSum
    return node.questionCount
  }
  for (const root of roots) {
    bubbleUp(root)
  }

  return roots
}

export const getQuestionsForAnalytics = async () => {
  await assertPermission('admin.analytics.view')
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('questions')
    .select('question_id, difficulty, rationale, code_citation, topic_id')

  if (error) {
    console.error('Error fetching questions for analytics:', error)
    return []
  }

  return data || []
}

export const getQuestion = async (id: string) => {
  await assertCanReadAdminQuestions()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('questions')
    .select('id:question_id, text, topic_id, article_id, question_type, options, correct_option_id, rationale, difficulty')
    .eq('question_id', id)
    .single()

  if (error || !data) {
    return null
  }

  // Parse correct_option_id back to number for editor
  return {
    ...data,
    correct_option_id: data.correct_option_id,
    rationale: typeof data.rationale === 'object' && data.rationale !== null 
      ? (data.rationale as any).text || JSON.stringify(data.rationale)
      : data.rationale || ''
  }
}
