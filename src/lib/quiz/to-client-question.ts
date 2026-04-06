import { normalizeOptions } from '@/lib/utils/question'
import type { QuestionForClient } from '@/types/quiz-config'

type JsonRecord = Record<string, unknown>

export interface QuestionForClientRow {
  question_id: string
  topic_id: string | null
  text: string
  options: unknown
  prompt_image_url?: string | null
  difficulty?: number | null
  question_type?: string | null
  metadata?: JsonRecord | null
  breadcrumb?: string | null
  is_interleaved?: boolean | null
}

const toStringOrNull = (value: unknown) =>
  typeof value === 'string' && value.trim().length > 0 ? value : null

export const toDifficultyLabel = (difficulty: number): QuestionForClient['difficulty_label'] => {
  if (difficulty < 0.4) return 'Easy'
  if (difficulty < 0.7) return 'Medium'
  return 'Hard'
}

export const toClientQuestion = (
  question: QuestionForClientRow,
  position: number,
): QuestionForClient => {
  const metadata = (question.metadata ?? {}) as JsonRecord
  const difficulty = question.difficulty ?? 0.5

  return {
    question_id: question.question_id,
    topic_id: question.topic_id ?? '',
    difficulty,
    position,
    stem: question.text,
    image_url: question.prompt_image_url ?? null,
    image_alt_text: toStringOrNull(metadata.image_alt_text),
    taxonomy_breadcrumb: question.breadcrumb ?? '',
    difficulty_label: toDifficultyLabel(difficulty),
    is_interleaved: question.is_interleaved ?? false,
    question_type: (question.question_type ?? 'mcq') as QuestionForClient['question_type'],
    unit: toStringOrNull(metadata.unit),
    hint_text: toStringOrNull(metadata.hint_text ?? metadata.hint),
    options: normalizeOptions(question.options),
  }
}

export const buildTaxonomyBreadcrumbMap = async (
  supabase: any,
  topicIds: string[],
): Promise<Map<string, string>> => {
  const uniqueTopicIds = [...new Set(topicIds.filter(Boolean))]
  const breadcrumbs = new Map<string, string>()

  if (uniqueTopicIds.length === 0) {
    return breadcrumbs
  }

  const { data } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name, subject_area')
    .in('node_id', uniqueTopicIds)

  for (const node of (data ?? []) as Array<{
    node_id: string
    name: string | null
    subject_area: string | null
  }>) {
    const name = node.name?.trim()
    const subjectArea = node.subject_area?.trim()
    if (subjectArea && name) {
      breadcrumbs.set(node.node_id, `${subjectArea} > ${name}`)
    } else if (name) {
      breadcrumbs.set(node.node_id, name)
    }
  }

  return breadcrumbs
}

export const fetchQuestionsForClient = async ({
  supabase,
  questionIds,
  offset = 0,
}: {
  supabase: any
  questionIds: string[]
  offset?: number
}): Promise<QuestionForClient[]> => {
  if (questionIds.length === 0) {
    return []
  }

  const { data: questions, error } = await supabase
    .from('questions')
    .select(
      'question_id, topic_id, text, options, difficulty, prompt_image_url, question_type, metadata',
    )
    .in('question_id', questionIds)

  if (error || !questions) {
    return []
  }

  const breadcrumbs = await buildTaxonomyBreadcrumbMap(
    supabase,
    (questions as Array<{ topic_id: string | null }>).map((question) => question.topic_id ?? ''),
  )

  const questionMap = new Map(
    (questions as QuestionForClientRow[]).map((question) => [question.question_id, question]),
  )

  return questionIds
    .map((id) => questionMap.get(id))
    .filter((question): question is QuestionForClientRow => question != null)
    .map((question, index) =>
      toClientQuestion(
        {
          ...question,
          breadcrumb: breadcrumbs.get(question.topic_id ?? '') ?? '',
        },
        offset + index + 1,
      ),
    )
}
