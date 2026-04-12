'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { normalizeOptions } from '@/lib/utils/question'
import {
  filterQuestionsWithValidArticleTopicMapping,
  isStandardQuestionType,
} from '@/lib/admin/editor-integrity/standard-question'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PrequestionOption {
  id: string
  letter: 'A' | 'B' | 'C' | 'D'
  text: string
}

export interface PrequestionForClient {
  questionId: string
  text: string
  topicId: string
  options: PrequestionOption[]
}

export interface PrequestionPayload {
  questions: PrequestionForClient[]
  sessionId: string
}

interface PrequestionQuestionRow {
  question_id: string
  text: string
  topic_id: string
  article_id?: string | null
  question_type?: string | null
  options: unknown
}

// ─── Action ──────────────────────────────────────────────────────────────────

/**
 * Fetch prequestions for a wiki topic. Creates a lightweight quiz session
 * so interactions can be recorded with the standard FK constraints.
 *
 * Returns client-safe questions (no correct_option_id or rationale) plus
 * the session ID needed by submit-prequestion.
 */
export const getPrequestions = async (
  topicId: string,
  count = 3,
  articleSlug?: string,
): Promise<PrequestionPayload | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()

  // Allow unauthenticated users to skip prequestions
  if (!user) return null

  // Call the DB function that selects topic-relevant, not-recently-seen questions
  const { data: rawQuestions, error } = await supabase.rpc(
    'select_prequestions',
    {
      p_topic_id: topicId,
      p_user_id: user.id,
      p_count: count,
    },
  )

  if (error || !rawQuestions || rawQuestions.length < count) {
    // Not enough questions — skip the prequestion gate
    return null
  }

  const articleIds = [...new Set(rawQuestions.map((q: any) => q.article_id).filter(Boolean))]
  const { data: publishedArticles } = articleIds.length > 0
    ? await supabase
        .from('wiki_articles')
        .select('article_id')
        .in('article_id', articleIds)
        .eq('status', 'published')
    : { data: [] as Array<{ article_id: string }> }

  const publishedArticleIds = new Set((publishedArticles ?? []).map((article) => article.article_id))
  const publishedStandardQuestions = (rawQuestions as PrequestionQuestionRow[]).filter((question) =>
    Boolean(question.article_id) &&
    isStandardQuestionType(question.question_type) &&
    publishedArticleIds.has(question.article_id!),
  )
  const { questions: filteredQuestions, error: filteredQuestionsError } =
    await filterQuestionsWithValidArticleTopicMapping(supabase as any, publishedStandardQuestions)

  if (filteredQuestionsError) {
    return null
  }

  if (filteredQuestions.length < count) {
    return null
  }

  const questionIds = filteredQuestions.map((question) => question.question_id)

  // Create a lightweight session so user_interactions FK is satisfied.
  // Uses 'practice' test_mode (the closest match until 'prequestion' enum is added)
  // with source metadata to distinguish prequestion sessions.
  const { data: session, error: sessionError } = await supabase
    .from('quiz_sessions')
    .insert({
      user_id: user.id,
      test_mode: 'practice' as const,
      status: 'in_progress' as const,
      config: { 
        mode: 'prequestion', 
        source: 'wiki_prequestion',
        ...(articleSlug && { articleSlug }),
      },
      question_ids: questionIds,
      started_at: new Date().toISOString(),
    })
    .select('session_id')
    .single()

  if (sessionError || !session) return null

  // Strip sensitive fields (correct_option_id, rationale) for client
  const questions: PrequestionForClient[] = filteredQuestions.map(
    (q: {
      question_id: string
      text: string
      topic_id: string
      options: unknown
    }) => ({
      questionId: q.question_id,
      text: q.text,
      topicId: q.topic_id,
      options: normalizeOptions(q.options),
    }),
  )

  return { questions, sessionId: session.session_id }
}
