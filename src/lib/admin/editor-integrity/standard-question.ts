import type { SupabaseClient } from '@supabase/supabase-js'

import { normalizeEditorStatus } from '@/lib/admin/editor-workflow'

export interface StandardQuestionLinkageInput {
  articleId: string | null | undefined
  topicId: string | null | undefined
  questionType?: string | null | undefined
  stage?: 'authoring' | 'review' | 'publish' | 'delivery'
}

export interface StandardQuestionValidationResult {
  blockingIssues: string[]
  warningIssues: string[]
}

const STANDARD_QUESTION_TYPES = new Set(['mcq', 'multiple_choice'])
const EXCEPTION_QUESTION_TYPES = new Set([
  'design_scenario',
  'design_endurance',
  'scenario_based',
])

const AUTHORING_READABLE_STATUSES = new Set([
  'draft',
  'in_review',
  'changes_requested',
  'approved',
  'published',
])
const DELIVERY_READABLE_STATUSES = new Set(['published'])

export const normalizeQuestionType = (questionType: string | null | undefined) =>
  (questionType || 'mcq').trim().toLowerCase()

export const isStandardQuestionType = (questionType: string | null | undefined) =>
  STANDARD_QUESTION_TYPES.has(normalizeQuestionType(questionType))

export const isExceptionQuestionType = (questionType: string | null | undefined) =>
  EXCEPTION_QUESTION_TYPES.has(normalizeQuestionType(questionType))

export const isReadableArticleStatusForStage = (
  status: string | null | undefined,
  stage: StandardQuestionLinkageInput['stage'] = 'authoring',
) => {
  const normalizedStatus = normalizeEditorStatus(status)
  const allowedStatuses =
    stage === 'delivery' || stage === 'publish'
      ? DELIVERY_READABLE_STATUSES
      : AUTHORING_READABLE_STATUSES

  return allowedStatuses.has(normalizedStatus)
}

export const normalizeQuestionOptionArray = (
  options: Array<string | { id?: string; text?: string }> | undefined,
) => {
  if (!options) return []

  return options.map((option, index) => {
    const id = ['A', 'B', 'C', 'D'][index] || String(index)
    if (typeof option === 'string') {
      return {
        id,
        text: option,
      }
    }

    return {
      id: option.id || id,
      text: option.text || '',
    }
  })
}

export const resolveCorrectOptionLetter = (
  correctOption: string | number | null | undefined,
) => {
  if (typeof correctOption === 'number') {
    return ['A', 'B', 'C', 'D'][correctOption] || 'A'
  }

  if (!correctOption) return 'A'

  const normalized = String(correctOption).trim().toUpperCase()
  if (['A', 'B', 'C', 'D'].includes(normalized)) {
    return normalized
  }

  const numeric = Number.parseInt(normalized, 10)
  if (!Number.isNaN(numeric)) {
    return ['A', 'B', 'C', 'D'][numeric] || 'A'
  }

  return 'A'
}

export const validateStandardQuestionLinkage = async (
  supabase: SupabaseClient,
  input: StandardQuestionLinkageInput,
): Promise<StandardQuestionValidationResult> => {
  const blockingIssues: string[] = []
  const warningIssues: string[] = []
  const stage = input.stage ?? 'authoring'

  if (isExceptionQuestionType(input.questionType)) {
    return { blockingIssues, warningIssues }
  }

  if (!input.articleId) {
    blockingIssues.push('Standard questions must be linked to an article.')
    return { blockingIssues, warningIssues }
  }

  if (!input.topicId) {
    blockingIssues.push('Standard questions must be linked to a taxonomy topic.')
    return { blockingIssues, warningIssues }
  }

  const { data: article, error: articleError } = await supabase
    .from('wiki_articles')
    .select('article_id, status')
    .eq('article_id', input.articleId)
    .maybeSingle()

  if (articleError || !article) {
    blockingIssues.push('Linked article was not found.')
    return { blockingIssues, warningIssues }
  }

  if (!isReadableArticleStatusForStage(article.status, stage)) {
    if (stage === 'publish' || stage === 'delivery') {
      blockingIssues.push(
        'Standard questions cannot be delivered unless their linked article is published.',
      )
    } else {
      blockingIssues.push(
        'Standard questions must link to an active editorial article before they can be authored or imported.',
      )
    }
  }

  const { data: mapping, error: mappingError } = await supabase
    .from('wiki_article_taxonomy')
    .select('article_id')
    .eq('article_id', input.articleId)
    .eq('node_id', input.topicId)
    .limit(1)
    .maybeSingle()

  if (mappingError || !mapping) {
    blockingIssues.push('Question topic must belong to the linked article taxonomy mapping.')
  }

  return { blockingIssues, warningIssues }
}

export const filterQuestionsWithValidArticleTopicMapping = async <
  T extends {
    article_id?: string | null
    topic_id?: string | null
    question_type?: string | null
  },
>(
  supabase: SupabaseClient,
  questions: T[],
) => {
  const standardQuestions = questions.filter(
    (question) =>
      Boolean(question.article_id) &&
      Boolean(question.topic_id) &&
      isStandardQuestionType(question.question_type),
  )

  if (standardQuestions.length === 0) {
    return { questions: [] as T[], error: null }
  }

  const articleIds = [...new Set(standardQuestions.map((question) => question.article_id!))]
  const topicIds = [...new Set(standardQuestions.map((question) => question.topic_id!))]

  const { data: mappings, error } = await supabase
    .from('wiki_article_taxonomy')
    .select('article_id, node_id')
    .in('article_id', articleIds)
    .in('node_id', topicIds)

  if (error) {
    return { questions: [] as T[], error }
  }

  const validPairs = new Set(
    (mappings ?? []).map((mapping) => `${mapping.article_id}:${mapping.node_id}`),
  )

  return {
    questions: standardQuestions.filter((question) =>
      validPairs.has(`${question.article_id}:${question.topic_id}`),
    ),
    error: null,
  }
}

export const filterQuestionsReadableForStage = async <
  T extends {
    article_id?: string | null
    topic_id?: string | null
    question_type?: string | null
  },
>(
  supabase: SupabaseClient,
  questions: T[],
  stage: StandardQuestionLinkageInput['stage'] = 'delivery',
) => {
  if (questions.length === 0) {
    return { questions: [] as T[], error: null }
  }

  const standardQuestions = questions.filter((question) =>
    isStandardQuestionType(question.question_type),
  )
  const exceptionQuestions = questions.filter(
    (question) => !isStandardQuestionType(question.question_type),
  )

  if (standardQuestions.length === 0) {
    return { questions: exceptionQuestions, error: null }
  }

  const validStandardQuestions = standardQuestions.filter(
    (question) => Boolean(question.article_id) && Boolean(question.topic_id),
  )

  if (validStandardQuestions.length === 0) {
    return { questions: exceptionQuestions, error: null }
  }

  const articleIds = [...new Set(validStandardQuestions.map((question) => question.article_id!))]
  const topicIds = [...new Set(validStandardQuestions.map((question) => question.topic_id!))]

  const [{ data: mappings, error: mappingsError }, { data: articles, error: articlesError }] =
    await Promise.all([
      supabase
        .from('wiki_article_taxonomy')
        .select('article_id, node_id')
        .in('article_id', articleIds)
        .in('node_id', topicIds),
      supabase.from('wiki_articles').select('article_id, status').in('article_id', articleIds),
    ])

  if (mappingsError || articlesError) {
    return { questions: [] as T[], error: mappingsError ?? articlesError }
  }

  const validPairs = new Set(
    (mappings ?? []).map((mapping) => `${mapping.article_id}:${mapping.node_id}`),
  )
  const readableArticleIds = new Set(
    (articles ?? [])
      .filter((article) => isReadableArticleStatusForStage(article.status, stage))
      .map((article) => article.article_id),
  )

  return {
    questions: [
      ...validStandardQuestions.filter(
        (question) =>
          readableArticleIds.has(question.article_id!) &&
          validPairs.has(`${question.article_id}:${question.topic_id}`),
      ),
      ...exceptionQuestions,
    ],
    error: null,
  }
}

export const countStandardQuestionsForArticle = async (
  supabase: SupabaseClient,
  articleId: string,
) => {
  const { data, error } = await supabase
    .from('questions')
    .select('question_id, topic_id, question_type, article_id')
    .eq('article_id', articleId)

  if (error) {
    return { count: 0, error }
  }

  const { questions: validQuestions, error: filterError } =
    await filterQuestionsWithValidArticleTopicMapping(supabase, data ?? [])

  if (filterError) {
    return { count: 0, error: filterError }
  }

  return {
    count: validQuestions.length,
    error: null,
  }
}

export const resolvePrimaryArticleIdForTopic = async (
  supabase: SupabaseClient,
  topicId: string,
) => {
  const { data: primaryMapping } = await supabase
    .from('wiki_article_taxonomy')
    .select('article_id')
    .eq('node_id', topicId)
    .eq('is_primary', true)
    .limit(1)
    .maybeSingle()

  if (primaryMapping?.article_id) {
    return primaryMapping.article_id
  }

  const { data: fallbackMapping } = await supabase
    .from('wiki_article_taxonomy')
    .select('article_id')
    .eq('node_id', topicId)
    .limit(1)
    .maybeSingle()

  return fallbackMapping?.article_id ?? null
}
