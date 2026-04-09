'use server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { canManageContent } from '@/lib/admin/roles'
import { revalidatePath } from 'next/cache'
import { sanitizeMDX } from '@/lib/wiki-markdown'
import { ROUTES } from '@/lib/routes'

// ─── MDX Preview Compilation ─────────────────────────────────

/** Server-side MDX compilation for the admin preview tab */
export const compileMdxPreview = async (source: string) => {
  try {
    const { serialize } = await import('next-mdx-remote/serialize')
    const remarkGfm = (await import('remark-gfm')).default
    const sanitized = sanitizeMDX(source)
    const mdxSource = await serialize(sanitized, {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        development: false,
      },
    })
    return { source: mdxSource, error: null }
  } catch (err: unknown) {
    return {
      source: null,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

// ─── Index Page Query ────────────────────────────────────────

/** Fetch all data needed for the content editor index page */
export const getContentEditorIndexData = async () => {
  const supabase = await createClient()

  // Parallel: articles, taxonomy nodes, article-taxonomy links, questions for search
  const [articlesRes, nodesRes, linksRes, questionsRes] = await Promise.all([
    supabase
      .from('wiki_articles')
      .select('article_id, title, slug, status, content, difficulty_label, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(500),
    supabase
      .from('taxonomy_tree')
      .select('node_id, name, lea_id, level, parent_id, subject_area, is_leaf')
      .order('level', { ascending: true })
      .order('name', { ascending: true }),
    supabase
      .from('wiki_article_taxonomy')
      .select('article_id, node_id, is_primary'),
    supabase
      .from('questions')
      .select('question_id, topic_id, text'),
  ])

  const articles = articlesRes.data || []
  const nodes = nodesRes.data || []
  const links = linksRes.data || []
  const questions = questionsRes.data || []

  // Build searchable questions
  const searchableQuestions = questions.map(q => ({
    id: q.question_id,
    topic_id: q.topic_id,
    text: q.text
  }))

  // Build question counts per node
  const questionCounts = new Map<string, number>()
  for (const q of questions) {
    questionCounts.set(q.topic_id, (questionCounts.get(q.topic_id) || 0) + 1)
  }

  // Build article-to-nodes and node-to-articles maps
  const articleNodeMap = new Map<string, string[]>()
  const nodeArticleMap = new Map<string, string[]>()
  for (const link of links) {
    const artNodes = articleNodeMap.get(link.article_id) || []
    artNodes.push(link.node_id)
    articleNodeMap.set(link.article_id, artNodes)

    const nodeArts = nodeArticleMap.get(link.node_id) || []
    nodeArts.push(link.article_id)
    nodeArticleMap.set(link.node_id, nodeArts)
  }

  // Build taxonomy tree with counts
  const nodeMap = new Map(nodes.map((n) => [n.node_id, n]))

  const buildTree = (parentId: string | null): any[] => {
    return nodes
      .filter((n) => n.parent_id === parentId)
      .map((n) => {
        const children = buildTree(n.node_id)
        const nodeArticles = nodeArticleMap.get(n.node_id) || []
        const artObjects = nodeArticles
          .map((aid) => articles.find((a) => a.article_id === aid))
          .filter(Boolean)
          .map((a) => ({ article_id: a!.article_id, title: a!.title, slug: a!.slug }))

        // Sum question counts from this node and all descendants
        const descendantQCount = (node: any): number => {
          let count = questionCounts.get(node.node_id) || 0
          for (const child of node.children || []) {
            count += descendantQCount(child)
          }
          return count
        }

        const treeNode = {
          node_id: n.node_id,
          name: n.name,
          lea_id: n.lea_id,
          level: n.level,
          parent_id: n.parent_id,
          is_leaf: n.is_leaf,
          children,
          articles: artObjects,
          article_count: artObjects.length + children.reduce((sum: number, c: any) => sum + (c.article_count || 0), 0),
          question_count: 0, // filled below
        }
        treeNode.question_count = descendantQCount(treeNode)
        return treeNode
      })
  }

  const taxonomyTree = buildTree(null)

  // Prompt counts placeholder (no data source yet)
  const promptCounts = new Map<string, number>()

  // Enrich articles with their node info and question counts
  const enrichedArticles = articles.map((a) => {
    const nodeIds = articleNodeMap.get(a.article_id) || []
    const primaryLink = links.find((l) => l.article_id === a.article_id && l.is_primary)
    const primaryNodeId = primaryLink?.node_id || nodeIds[0] || null
    const primaryNode = primaryNodeId ? nodeMap.get(primaryNodeId) as typeof nodes[number] | undefined : null

    // Count questions for this article's nodes
    let qCount = 0
    for (const nid of nodeIds) {
      qCount += questionCounts.get(nid) || 0
    }

    return {
      ...a,
      word_count: a.content ? a.content.split(/\s+/).filter(Boolean).length : 0,
      question_count: qCount,
      prompt_count: promptCounts.get(a.article_id) || 0,
      node_ids: nodeIds,
      primary_lea_id: primaryNode?.lea_id || null,
      primary_node_name: primaryNode?.name || null,
    }
  })

  // Stats
  const totalQuestions = questions.length
  const topicsWithArticles = new Set(links.map((l) => l.node_id)).size
  const leafNodes = nodes.filter((n) => n.is_leaf).length

  return {
    articles: enrichedArticles,
    searchableQuestions,
    taxonomyTree,
    stats: {
      totalArticles: articles.length,
      totalQuestions,
      topicsWithArticles,
      totalTopics: leafNodes || nodes.filter((n) => n.level >= 2).length,
    },
  }
}

// ─── Query Functions ─────────────────────────────────────────

/** Fetch full article with all editable fields */
export const getArticleFull = async (id: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('wiki_articles')
    .select(
      'article_id, title, slug, content, status, lea_tests_you, updated_note, subject_label, difficulty_label, reviewed_by, reviewer_comments, created_at, updated_at'
    )
    .eq('article_id', id)
    .single()

  if (error || !data) return null
  return data
}

/** Get only the updated_at timestamp for conflict detection */
export const getArticleUpdatedAt = async (id: string): Promise<string | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('wiki_articles')
    .select('updated_at')
    .eq('article_id', id)
    .single()

  if (error || !data) return null
  return data.updated_at
}

/** Get taxonomy node links for an article */
export const getArticleTaxonomyNodes = async (articleId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('wiki_article_taxonomy')
    .select('node_id, is_primary')
    .eq('article_id', articleId)

  if (error) {
    console.error('Error fetching taxonomy nodes:', error)
    return []
  }
  return data || []
}

/** Get questions by multiple taxonomy node IDs (the article→questions join) */
export const getQuestionsByNodeIds = async (nodeIds: string[]) => {
  if (nodeIds.length === 0) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('questions')
    .select(
      'question_id, topic_id, text, options, correct_option_id, rationale, explanation, code_citation, difficulty, difficulty_rating, discrimination_rating, prompt_image_url, model_id, is_assessment, application_context, practice_context, created_at, updated_at'
    )
    .in('topic_id', nodeIds)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching questions by node IDs:', error)
    return []
  }
  return (data || []).map((q) => ({
    ...q,
    options: Array.isArray(q.options) ? q.options : [],
  }))
}

/** Get questions directly linked to an article via article_id */
export const getQuestionsByArticleId = async (articleId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('questions')
    .select(
      'question_id, topic_id, article_id, text, options, correct_option_id, rationale, explanation, code_citation, difficulty, difficulty_rating, discrimination_rating, prompt_image_url, model_id, is_assessment, application_context, practice_context, created_at, updated_at'
    )
    .eq('article_id', articleId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching questions by article ID:', error)
    return []
  }
  return (data || []).map((q) => ({
    ...q,
    options: Array.isArray(q.options) ? q.options : [],
  }))
}

interface ImportedQuestion {
  questionStem: string
  answerOptions: string[]
  correctOption: string
  rationale: string
  extendedExplanation?: string
  codeCitation?: string
  difficulty: number
  diagnosticOnly?: boolean
  realWorldScenario?: string
  practiceContext?: string
  promptImageUrl?: string
}

/** Transform imported JSON question to database format */
const transformQuestion = (
  json: ImportedQuestion,
  articleId: string,
  topicId: string
) => {
  const optionIds = ['A', 'B', 'C', 'D']
  const options = json.answerOptions.map((text, idx) => ({
    id: optionIds[idx],
    text,
  }))

  return {
    text: json.questionStem,
    options,
    correct_option_id: json.correctOption,
    rationale: json.rationale,
    explanation: json.extendedExplanation || null,
    code_citation: json.codeCitation || null,
    difficulty: json.difficulty,
    is_assessment: json.diagnosticOnly !== true,
    application_context: json.realWorldScenario || null,
    practice_context: json.practiceContext ? json.practiceContext.split(',').map(s => s.trim()) : [],
    prompt_image_url: json.promptImageUrl || null,
    article_id: articleId,
    topic_id: topicId,
  }
}

/** Batch import questions from JSON for a specific article */
export const importQuestionsForArticle = async (
  articleId: string,
  topicId: string,
  questionsJson: string
) => {
  const authorized = await canManageContent()
  if (!authorized) throw new Error('Unauthorized: insufficient permissions')

  let parsedQuestions: ImportedQuestion[]
  try {
    parsedQuestions = JSON.parse(questionsJson)
  } catch {
    return { error: new Error('Invalid JSON format'), importedCount: 0 }
  }

  if (!Array.isArray(parsedQuestions)) {
    return { error: new Error('JSON must be an array of questions'), importedCount: 0 }
  }

  const transformedQuestions = parsedQuestions.map(q =>
    transformQuestion(q, articleId, topicId)
  )

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('questions')
    .insert(transformedQuestions)
    .select('question_id')

  if (error) {
    console.error('Error importing questions:', error)
    return { error, importedCount: 0 }
  }

  revalidatePath('/admin/knowledge')
  revalidatePath(`/admin/knowledge/${articleId}`)
  revalidatePath('/admin/knowledge/questions')

  return { error: null, importedCount: data?.length || 0 }
}

/** Get info for a single taxonomy node */
export const getTaxonomyNodeInfo = async (nodeId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name, lea_id, level, parent_id, subject_area')
    .eq('node_id', nodeId)
    .single()

  if (error || !data) return null
  return data
}

/** Get info for multiple taxonomy nodes */
export const getTaxonomyNodesInfo = async (nodeIds: string[]) => {
  if (nodeIds.length === 0) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name, lea_id, level, parent_id, subject_area')
    .in('node_id', nodeIds)

  if (error) {
    console.error('Error fetching taxonomy nodes info:', error)
    return []
  }
  return data || []
}

/** Get ALL EI prompts for an article (admin view — all statuses, not just published) */
export const getAllEIPromptsForArticle = async (articleId: string) => {
  // Use admin client to bypass RLS — student-facing RLS only allows published+active
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('wiki_ei_prompts')
    .select(
      'prompt_id, article_id, node_id, insert_after_heading, prompt_text, reveal_text, options, sort_order, is_active, status, reviewed_by, reviewed_at, reviewer_notes, created_at, updated_at'
    )
    .eq('article_id', articleId)
    .order('sort_order', { ascending: true })

  if (error) {
    // Non-blocking: table may not exist or RLS may block — return empty array
    return []
  }
  return data || []
}

// ─── Mutation Functions ──────────────────────────────────────

/** Update article with all editable fields */
export const updateArticleFull = async (
  id: string,
  data: {
    title?: string
    content?: string
    status?: string
    node_id?: string | null
    difficulty_label?: string
    lea_tests_you?: string
    updated_note?: string
    subject_label?: string
    reviewer_comments?: string
  }
) => {
  const authorized = await canManageContent()
  if (!authorized) throw new Error('Unauthorized: insufficient permissions')

  const supabase = createAdminClient()
  
  // 1. Update wiki_articles
  const { node_id, ...articleFields } = data
  const { error: articleError } = await supabase
    .from('wiki_articles')
    .update({
      ...articleFields,
      updated_at: new Date().toISOString(),
    })
    .eq('article_id', id)

  if (articleError) return { error: articleError }

  // 2. Update taxonomy mapping if node_id provided
  if (node_id !== undefined) {
    if (node_id) {
      // Delete old mapping and insert new primary mapping
      await supabase.from('wiki_article_taxonomy').delete().eq('article_id', id)
      await supabase.from('wiki_article_taxonomy').insert({
        article_id: id,
        node_id: node_id,
        is_primary: true
      })
    } else {
      await supabase.from('wiki_article_taxonomy').delete().eq('article_id', id)
    }
  }

  revalidatePath(ROUTES.admin.knowledge)
  revalidatePath(ROUTES.admin.article(id))
  revalidatePath(ROUTES.admin.knowledgeQuestions)

  return { error: null }
}

/** Update a single question with all editable fields */
export const updateQuestion = async (
  questionId: string,
  data: {
    text?: string
    options?: { id: string; text: string }[]
    correct_option_id?: string
    rationale?: string
    explanation?: string
    code_citation?: string
    difficulty?: number
    is_assessment?: boolean
    application_context?: string
    practice_context?: string[]
    prompt_image_url?: string
  }
) => {
  const authorized = await canManageContent()
  if (!authorized) throw new Error('Unauthorized: insufficient permissions')

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('questions')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('question_id', questionId)

  if (!error) {
    revalidatePath('/admin/knowledge/questions')
    revalidatePath('/admin/knowledge')
  }

  return { error }
}

/** Create an EI prompt */
export const createEIPrompt = async (data: {
  article_id: string
  node_id?: string
  insert_after_heading: string
  prompt_text: string
  reveal_text: string
  options?: { text: string; is_correct: boolean }[]
  sort_order?: number
  status?: string
}) => {
  const authorized = await canManageContent()
  if (!authorized) throw new Error('Unauthorized: insufficient permissions')

  const supabase = createAdminClient()
  const { data: newPrompt, error } = await supabase
    .from('wiki_ei_prompts')
    .insert([
      {
        article_id: data.article_id,
        node_id: data.node_id || null,
        insert_after_heading: data.insert_after_heading,
        prompt_text: data.prompt_text,
        reveal_text: data.reveal_text,
        options: data.options || [],
        sort_order: data.sort_order ?? 0,
        status: data.status || 'draft',
      },
    ])
    .select('prompt_id')
    .single()

  return { data: newPrompt, error }
}

/** Update an EI prompt */
export const updateEIPrompt = async (
  promptId: string,
  data: {
    insert_after_heading?: string
    prompt_text?: string
    reveal_text?: string
    options?: { text: string; is_correct: boolean }[]
    sort_order?: number
    is_active?: boolean
    status?: string
  }
) => {
  const authorized = await canManageContent()
  if (!authorized) throw new Error('Unauthorized: insufficient permissions')

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('wiki_ei_prompts')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('prompt_id', promptId)

  return { error }
}

/** Delete an EI prompt */
export const deleteEIPrompt = async (promptId: string) => {
  const authorized = await canManageContent()
  if (!authorized) throw new Error('Unauthorized: insufficient permissions')

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('wiki_ei_prompts')
    .delete()
    .eq('prompt_id', promptId)

  return { error }
}
