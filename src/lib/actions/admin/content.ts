'use server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { assertPermission } from '@/lib/admin/roles'
import { revalidatePath, revalidateTag } from '@/lib/cache/revalidate'
import { CACHE_TAGS } from '../cache-tags'
import { ROUTES } from '@/lib/routes'
import { logServerError } from '@/lib/logging/server'
import {
  getStatusWriteCandidates,
  normalizeEditorStatus,
} from '@/lib/admin/editor-workflow'
import {
  countStandardQuestionsForArticle,
  isStandardQuestionType,
  normalizeQuestionOptionArray,
  resolveCorrectOptionLetter,
  validateStandardQuestionLinkage,
} from '@/lib/admin/editor-integrity/standard-question'
import { compileWikiArticleWithRenderer } from '@/components/wiki/article/WikiArticle'

const slugifyTitle = (title: string) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'untitled-article'

const ensureUniqueArticleSlug = async (
  supabase: ReturnType<typeof createAdminClient>,
  title: string,
) => {
  const baseSlug = slugifyTitle(title)
  let candidate = baseSlug
  let suffix = 2

  while (true) {
    const { data, error } = await supabase
      .from('wiki_articles')
      .select('article_id')
      .eq('slug', candidate)
      .limit(1)
      .maybeSingle()

    if (error) {
      throw error
    }

    if (!data) {
      return candidate
    }

    candidate = `${baseSlug}-${suffix}`
    suffix += 1
  }
}

const updateWikiArticleWithCompatibleStatus = async ({
  supabase,
  articleId,
  payload,
}: {
  supabase: ReturnType<typeof createAdminClient>
  articleId: string
  payload: Record<string, unknown>
}) => {
  const [status] = getStatusWriteCandidates(payload.status as string | null | undefined)
  const { error } = await supabase
    .from('wiki_articles')
    .update({
      ...payload,
      status,
    })
    .eq('article_id', articleId)

  return { error }
}

const insertWikiArticleWithCompatibleStatus = async ({
  supabase,
  payload,
}: {
  supabase: ReturnType<typeof createAdminClient>
  payload: Record<string, unknown>
}) => {
  const [status] = getStatusWriteCandidates(payload.status as string | null | undefined)

  return supabase
    .from('wiki_articles')
    .insert({
      ...payload,
      status,
    })
    .select('article_id, slug')
    .single()
}

const ensureArticlePublishableForStatus = async ({
  supabase,
  articleId,
  currentStatus,
  nextStatus,
  nextPrimaryNodeId,
}: {
  supabase: ReturnType<typeof createAdminClient>
  articleId: string | null
  currentStatus?: string | null
  nextStatus?: string | null
  nextPrimaryNodeId?: string | null
}) => {
  const normalizedNextStatus = normalizeEditorStatus(nextStatus)
  if (normalizedNextStatus !== 'published') {
    return null
  }

  if (!articleId) {
    return new Error('Cannot create an article directly in published status')
  }

  const normalizedCurrentStatus = normalizeEditorStatus(currentStatus)
  if (!['approved', 'published'].includes(normalizedCurrentStatus)) {
    return new Error('Cannot publish article until it has been approved in review')
  }

  if (nextPrimaryNodeId) {
    const { data, error } = await supabase
      .from('questions')
      .select('question_id, topic_id, question_type')
      .eq('article_id', articleId)

    if (error) {
      return new Error(`Failed to validate article question coverage: ${error.message}`)
    }

    const validCount = (data ?? []).filter(
      (question) =>
        isStandardQuestionType(question.question_type) &&
        question.topic_id === nextPrimaryNodeId,
    ).length

    if (validCount < 10) {
      return new Error('Cannot publish article with fewer than 10 directly linked standard questions')
    }

    return null
  }

  const { count, error } = await countStandardQuestionsForArticle(supabase as any, articleId)
  if (error) {
    return new Error(`Failed to validate article question coverage: ${error.message}`)
  }

  if ((count || 0) < 10) {
    return new Error('Cannot publish article with fewer than 10 directly linked standard questions')
  }

  return null
}

export interface SaveArticleFullInput {
  article_id?: string | null
  title: string
  content: string
  status?: string
  node_id?: string | null
  difficulty_label?: string
  lea_tests_you?: string
  updated_note?: string
  subject_label?: string
  reviewer_comments?: string
}

export interface SaveArticleFullResult {
  error: Error | { message: string } | null
  article:
    | {
        article_id: string
        slug: string
        created: boolean
      }
    | null
}

const assertCanReadAdminContent = async () => {
  await assertPermission('admin.content.view')
}

// ─── MDX Preview Compilation ─────────────────────────────────

/** Server-side MDX compilation for the admin preview tab */
export const compileMdxPreview = async (source: string) => {
  try {
    const compiled = await compileWikiArticleWithRenderer({
      article: {
        article_id: 'admin-preview-validation',
        content: source,
      },
    })
    return { source: compiled, error: null }
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
  await assertPermission('admin.content.view')
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

  // Build question counts per node for taxonomy summaries
  const questionCounts = new Map<string, number>()
  for (const q of questions) {
    questionCounts.set(q.topic_id, (questionCounts.get(q.topic_id) || 0) + 1)
  }

  // Build direct article-owned standard question counts
  const articleQuestionCounts = new Map<string, number>()
  const questionsWithArticleIds = await supabase
    .from('questions')
    .select('article_id, question_type')
    .not('article_id', 'is', null)

  for (const question of questionsWithArticleIds.data || []) {
    if (!question.article_id || !isStandardQuestionType(question.question_type)) continue
    articleQuestionCounts.set(
      question.article_id,
      (articleQuestionCounts.get(question.article_id) || 0) + 1,
    )
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

    return {
      ...a,
      word_count: a.content ? a.content.split(/\s+/).filter(Boolean).length : 0,
      question_count: articleQuestionCounts.get(a.article_id) || 0,
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
  await assertPermission('admin.content.view')
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
  await assertPermission('admin.content.view')
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
  await assertPermission('admin.content.view')
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
  await assertCanReadAdminContent()
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
  await assertPermission('admin.content.view')
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('questions')
    .select(
      'question_id, topic_id, article_id, question_type, text, options, correct_option_id, rationale, explanation, code_citation, difficulty, difficulty_rating, discrimination_rating, prompt_image_url, model_id, is_assessment, application_context, practice_context, created_at, updated_at'
    )
    .eq('article_id', articleId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching questions by article ID:', error)
    return []
  }
  return (data || [])
    .filter((question) => isStandardQuestionType((question as any).question_type))
    .map((q) => ({
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
  const options = normalizeQuestionOptionArray(json.answerOptions)

  return {
    text: json.questionStem,
    options,
    correct_option_id: resolveCorrectOptionLetter(json.correctOption),
    rationale: json.rationale,
    explanation: json.extendedExplanation || null,
    code_citation: json.codeCitation || null,
    difficulty: json.difficulty,
    is_assessment: json.diagnosticOnly !== true,
    question_type: 'mcq',
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
  await assertPermission('admin.content.import')

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
  const linkageValidation = await validateStandardQuestionLinkage(supabase as any, {
    articleId,
    topicId,
    questionType: 'mcq',
    stage: 'authoring',
  })

  if (linkageValidation.blockingIssues.length > 0) {
    return {
      error: new Error(linkageValidation.blockingIssues[0]),
      importedCount: 0,
    }
  }

  const { data, error } = await supabase
    .from('questions')
    .insert(transformedQuestions)
    .select('question_id')

  if (error) {
    await logServerError({
      family: 'admin',
      eventName: 'content_import_questions_failed',
      message: 'Failed to import article questions.',
      context: {
        routeOrAction: 'admin:content.importQuestions',
        metadata: {
          articleId,
          topicId,
          importCount: transformedQuestions.length,
        },
      },
      error,
    })
    return { error, importedCount: 0 }
  }

  revalidatePath('/admin/knowledge')
  revalidatePath(`/admin/knowledge/${articleId}`)
  revalidatePath('/admin/knowledge/questions')

  return { error: null, importedCount: data?.length || 0 }
}

/** Get info for a single taxonomy node */
export const getTaxonomyNodeInfo = async (nodeId: string) => {
  await assertPermission('admin.content.view')
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
  await assertPermission('admin.content.view')
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
  await assertPermission('admin.content.view')
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
  await assertPermission('admin.content.edit')

  const supabase = createAdminClient()
  const { data: existingArticle, error: existingArticleError } = await supabase
    .from('wiki_articles')
    .select('status')
    .eq('article_id', id)
    .maybeSingle()

  if (existingArticleError || !existingArticle) {
    return { error: existingArticleError ?? new Error('Article not found') }
  }

  const publishabilityError = await ensureArticlePublishableForStatus({
    supabase,
    articleId: id,
    currentStatus: existingArticle.status,
    nextStatus: data.status,
    nextPrimaryNodeId: data.node_id ?? undefined,
  })

  if (publishabilityError) {
    return { error: publishabilityError }
  }
  
  // 1. Update wiki_articles
  const { node_id, ...articleFields } = data
  const normalizedStatus = articleFields.status
    ? normalizeEditorStatus(articleFields.status)
    : undefined
  const { error: articleError } = await updateWikiArticleWithCompatibleStatus({
    supabase,
    articleId: id,
    payload: {
      ...articleFields,
      status: normalizedStatus,
      updated_at: new Date().toISOString(),
    },
  })

  if (articleError) {
    await logServerError({
      family: 'admin',
      eventName: 'content_update_article_failed',
      message: 'Failed to update article content.',
      context: {
        routeOrAction: 'admin:content.updateArticleFull',
        metadata: {
          articleId: id,
        },
      },
      error: articleError,
    })
    return { error: articleError }
  }

  // 2. Update taxonomy mapping if node_id provided
  if (node_id !== undefined) {
    const { data: existingMappings, error: existingMappingsError } = await supabase
      .from('wiki_article_taxonomy')
      .select('article_id, node_id, is_primary, sort_order')
      .eq('article_id', id)

    if (existingMappingsError) {
      return { error: existingMappingsError }
    }

    if (node_id) {
      // Delete old mapping and insert new primary mapping
      const { error: deleteMappingError } = await supabase
        .from('wiki_article_taxonomy')
        .delete()
        .eq('article_id', id)

      if (deleteMappingError) {
        await logServerError({
          family: 'admin',
          eventName: 'content_update_article_taxonomy_delete_failed',
          message: 'Failed to remove existing taxonomy mapping for article update.',
          context: {
            routeOrAction: 'admin:content.updateArticleFull',
            metadata: {
              articleId: id,
            },
          },
          error: deleteMappingError,
        })
        return { error: deleteMappingError }
      }

      const { error: insertMappingError } = await supabase.from('wiki_article_taxonomy').insert({
        article_id: id,
        node_id: node_id,
        is_primary: true
      })

      if (insertMappingError) {
        if (existingMappings && existingMappings.length > 0) {
          await supabase.from('wiki_article_taxonomy').insert(existingMappings)
        }
        await logServerError({
          family: 'admin',
          eventName: 'content_update_article_taxonomy_insert_failed',
          message: 'Failed to create taxonomy mapping for article update.',
          context: {
            routeOrAction: 'admin:content.updateArticleFull',
            metadata: {
              articleId: id,
              nodeId: node_id,
            },
          },
          error: insertMappingError,
        })
        return { error: insertMappingError }
      }
    } else {
      const { error: deleteMappingError } = await supabase
        .from('wiki_article_taxonomy')
        .delete()
        .eq('article_id', id)

      if (deleteMappingError) {
        await logServerError({
          family: 'admin',
          eventName: 'content_update_article_taxonomy_delete_failed',
          message: 'Failed to clear taxonomy mapping for article update.',
          context: {
            routeOrAction: 'admin:content.updateArticleFull',
            metadata: {
              articleId: id,
            },
          },
          error: deleteMappingError,
        })
        return { error: deleteMappingError }
      }
    }
  }

  revalidateTag(CACHE_TAGS.wiki, 'max')
  revalidatePath(ROUTES.admin.knowledge)
  revalidatePath(ROUTES.admin.article(id))
  revalidatePath(ROUTES.admin.knowledgeQuestions)

  return { error: null }
}

export const saveArticleFull = async (
  data: SaveArticleFullInput,
): Promise<SaveArticleFullResult> => {
  await assertPermission('admin.content.edit')

  const title = data.title.trim()
  const content = data.content.trim()

  if (!title) {
    return { error: new Error('Title is required'), article: null }
  }

  if (!content) {
    return { error: new Error('Content is required'), article: null }
  }

  const previewValidation = await compileMdxPreview(content)
  if (previewValidation.error) {
    return {
      error: new Error(`MDX compile validation failed: ${previewValidation.error}`),
      article: null,
    }
  }

  if (data.article_id) {
    const { error } = await updateArticleFull(data.article_id, {
      title,
      content,
      status: data.status,
      node_id: data.node_id,
      difficulty_label: data.difficulty_label,
      lea_tests_you: data.lea_tests_you,
      updated_note: data.updated_note,
      subject_label: data.subject_label,
      reviewer_comments: data.reviewer_comments,
    })

    return {
      error: error ? new Error(error.message) : null,
      article: error
        ? null
        : {
            article_id: data.article_id,
            slug: '',
            created: false,
          },
    }
  }

  const supabase = createAdminClient()
  const publishabilityError = await ensureArticlePublishableForStatus({
    supabase,
    articleId: null,
    currentStatus: 'draft',
    nextStatus: data.status,
    nextPrimaryNodeId: data.node_id ?? undefined,
  })

  if (publishabilityError) {
    return {
      error: publishabilityError,
      article: null,
    }
  }

  try {
    const slug = await ensureUniqueArticleSlug(supabase, title)
    const now = new Date().toISOString()

    const { data: insertedArticle, error: insertError } = await insertWikiArticleWithCompatibleStatus({
      supabase,
      payload: {
        title,
        slug,
        content,
        status: normalizeEditorStatus(data.status),
        difficulty_label: data.difficulty_label ?? null,
        lea_tests_you: data.lea_tests_you ?? null,
        updated_note: data.updated_note ?? null,
        subject_label: data.subject_label ?? null,
        reviewer_comments: data.reviewer_comments ?? null,
        created_at: now,
        updated_at: now,
      },
    })

    if (insertError || !insertedArticle) {
      if (insertError) {
        await logServerError({
          family: 'admin',
          eventName: 'content_create_article_failed',
          message: 'Failed to create article content.',
          context: {
            routeOrAction: 'admin:content.saveArticleFull',
          },
          error: insertError,
        })
      }

      return {
        error: insertError ? new Error(insertError.message) : new Error('Failed to create article'),
        article: null,
      }
    }

    if (data.node_id) {
      const { error: mappingError } = await supabase
        .from('wiki_article_taxonomy')
        .insert({
          article_id: insertedArticle.article_id,
          node_id: data.node_id,
          is_primary: true,
        })

      if (mappingError) {
        await supabase
          .from('wiki_articles')
          .delete()
          .eq('article_id', insertedArticle.article_id)

        await logServerError({
          family: 'admin',
          eventName: 'content_create_article_taxonomy_failed',
          message: 'Failed to create taxonomy mapping for new article.',
          context: {
            routeOrAction: 'admin:content.saveArticleFull',
            metadata: {
              nodeId: data.node_id,
            },
          },
          error: mappingError,
        })

        return {
          error: new Error(mappingError.message),
          article: null,
        }
      }
    }

    revalidateTag(CACHE_TAGS.wiki, 'max')
    revalidatePath(ROUTES.admin.knowledge)
    revalidatePath(ROUTES.admin.knowledgeQuestions)
    revalidatePath(ROUTES.admin.article(insertedArticle.article_id))

    return {
      error: null,
      article: {
        article_id: insertedArticle.article_id,
        slug: insertedArticle.slug,
        created: true,
      },
    }
  } catch (error) {
    await logServerError({
      family: 'admin',
      eventName: 'content_create_article_unexpected_failed',
      message: 'Unexpected error while creating article content.',
      context: {
        routeOrAction: 'admin:content.saveArticleFull',
      },
      error,
    })

    return {
      error: error instanceof Error ? error : new Error('Unexpected error'),
      article: null,
    }
  }
}

import { updateQuestion as updateQuestionAction } from './questions'

/** Proxy to the consolidated updateQuestion action */
export const updateQuestion = async (id: string, data: any) => {
  return await updateQuestionAction(id, data)
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
  await assertPermission('admin.content.create')

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
        status: normalizeEditorStatus(data.status),
      },
    ])
    .select('prompt_id')
    .single()

  if (error) {
    await logServerError({
      family: 'admin',
      eventName: 'content_create_ei_prompt_failed',
      message: 'Failed to create an EI prompt.',
      context: {
        routeOrAction: 'admin:content.createEIPrompt',
        metadata: {
          articleId: data.article_id,
        },
      },
      error,
    })
  }

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
  await assertPermission('admin.content.edit')

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('wiki_ei_prompts')
    .update({
      ...data,
      status: data.status ? normalizeEditorStatus(data.status) : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('prompt_id', promptId)

  if (error) {
    await logServerError({
      family: 'admin',
      eventName: 'content_update_ei_prompt_failed',
      message: 'Failed to update an EI prompt.',
      context: {
        routeOrAction: 'admin:content.updateEIPrompt',
        metadata: {
          promptId,
        },
      },
      error,
    })
  }

  return { error }
}

/** Delete an EI prompt */
export const deleteEIPrompt = async (promptId: string) => {
  await assertPermission('admin.content.delete')

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('wiki_ei_prompts')
    .delete()
    .eq('prompt_id', promptId)

  if (error) {
    await logServerError({
      family: 'admin',
      eventName: 'content_delete_ei_prompt_failed',
      message: 'Failed to delete an EI prompt.',
      context: {
        routeOrAction: 'admin:content.deleteEIPrompt',
        metadata: {
          promptId,
        },
      },
      error,
    })
  }

  return { error }
}
