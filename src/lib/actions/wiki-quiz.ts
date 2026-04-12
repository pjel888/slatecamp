'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { normalizeOptions, resolveRationaleText } from '@/lib/utils/question'
import type { QuestionForClient } from '@/types/quiz-config'
import {
  filterQuestionsWithValidArticleTopicMapping,
  isStandardQuestionType,
} from '@/lib/admin/editor-integrity/standard-question'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toDifficultyLabel = (d: number): 'Easy' | 'Medium' | 'Hard' => {
  if (d < 0.4) return 'Easy'
  if (d < 0.7) return 'Medium'
  return 'Hard'
}

interface WikiQuizQuestionRow {
  question_id: string
  topic_id: string
  article_id?: string | null
  question_type?: string | null
  text: string
  options: unknown
  difficulty: number
  prompt_image_url: string | null
}

const toClientQuestion = (
  q: {
    question_id: string
    text: string
    options: unknown
    prompt_image_url: string | null
    difficulty: number
    topic_id: string
    article_id?: string | null
  },
  position: number,
): QuestionForClient => ({
  question_id: q.question_id,
  topic_id: q.topic_id,
  difficulty: q.difficulty,
  position,
  stem: q.text,
  image_url: q.prompt_image_url,
  image_alt_text: null,
  taxonomy_breadcrumb: '',
  difficulty_label: toDifficultyLabel(q.difficulty ?? 0.5),
  question_type: 'mcq',
  options: normalizeOptions(q.options),
})

// ─── Actions ──────────────────────────────────────────────────────────────────

export const getWikiQuizQuestions = async (
  nodeId: string,
  articleSlug?: string,
): Promise<{ questions: QuestionForClient[]; sessionId: string }> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) throw new Error('Unauthorized')

  console.log('[wiki-quiz] getWikiQuizQuestions called with nodeId:', nodeId)

  // 1. Resolve leaf topic IDs — expand non-leaf node to its leaf children
  const { data: thisNode } = await supabase
    .from('taxonomy_tree')
    .select('node_id, is_leaf')
    .eq('node_id', nodeId)
    .maybeSingle()

  let topicIds: string[] = []

  if (thisNode?.is_leaf) {
    topicIds = [nodeId]
  } else {
    const { data: leaves } = await supabase
      .from('taxonomy_tree')
      .select('node_id')
      .eq('parent_id', nodeId)
      .eq('is_leaf', true)
      .eq('is_cross_ref_only', false)
      .is('deprecated_at', null)

    topicIds = (leaves ?? []).map((n: { node_id: string }) => n.node_id)
    if (topicIds.length === 0) topicIds = [nodeId]
  }

  // 2. Exclude questions answered correctly in the last 7 days
  const recentCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: recentInteractions } = await supabase
    .from('user_interactions')
    .select('question_id')
    .eq('user_id', user.id)
    .eq('is_correct', true)
    .gte('interaction_timestamp', recentCutoff)

  const recentSet = new Set(
    (recentInteractions ?? []).map((r: { question_id: string }) => r.question_id),
  )

  // 3. Fetch candidate questions
  const { data: rawQuestions, error: qError } = await supabase
    .from('questions')
    .select('question_id, topic_id, article_id, question_type, text, options, difficulty, prompt_image_url')
    .in('topic_id', topicIds)
    .limit(30)

  if (qError) throw qError

  const articleIds = [...new Set((rawQuestions ?? []).map((q: any) => q.article_id).filter(Boolean))]
  const { data: publishedArticles } = articleIds.length > 0
    ? await supabase
        .from('wiki_articles')
        .select('article_id')
        .in('article_id', articleIds)
        .eq('status', 'published')
    : { data: [] as Array<{ article_id: string }> }

  const publishedArticleIds = new Set((publishedArticles ?? []).map((article) => article.article_id))
  const publishedStandardQuestions = ((rawQuestions ?? []) as WikiQuizQuestionRow[]).filter(
    (question) =>
      Boolean(question.article_id) &&
      isStandardQuestionType(question.question_type) &&
      publishedArticleIds.has(question.article_id!),
  )
  const { questions: validQuestions, error: validQuestionError } =
    await filterQuestionsWithValidArticleTopicMapping(supabase as any, publishedStandardQuestions)

  if (validQuestionError) {
    throw validQuestionError
  }

  const pool = validQuestions.filter((question) => !recentSet.has(question.question_id))

  // Backfill from recently-seen if not enough fresh questions
  const finalPool =
    pool.length >= 5
      ? pool
      : [
          ...pool,
          ...validQuestions.filter((question) => recentSet.has(question.question_id)).slice(0, 5 - pool.length),
        ]

  // Fisher-Yates shuffle
  for (let i = finalPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[finalPool[i], finalPool[j]] = [finalPool[j], finalPool[i]]
  }

  const selected = finalPool.slice(0, 5)
  const questionIds = selected.map((question) => question.question_id)

  // 4. Create mini quiz session
  const { data: session, error: sessionError } = await supabase
    .from('quiz_sessions')
    .insert({
      user_id: user.id,
      test_mode: 'practice',
      status: 'in_progress',
      config: { 
        mode: 'article_review', 
        source: 'wiki_review',
        ...(articleSlug && { articleSlug }), 
      },
      question_ids: questionIds,
      started_at: new Date().toISOString(),
    })
    .select('session_id')
    .single()

  if (sessionError) throw sessionError

  const questions: QuestionForClient[] = selected.map(
    (q: {
      question_id: string
      text: string
      options: unknown
      prompt_image_url: string | null
      difficulty: number
      topic_id: string
      article_id?: string | null
    }, idx: number) => toClientQuestion(q, idx + 1),
  )

  return { questions, sessionId: session.session_id }
}

export const submitWikiQuizAnswer = async (input: {
  sessionId: string
  questionId: string
  selectedOptionId: string
  timeSpentMs: number
}): Promise<{ isCorrect: boolean; correctOptionId: string; rationale: string | null }> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) throw new Error('Unauthorized')

  const { sessionId, questionId, selectedOptionId, timeSpentMs } = input

  // 1. Look up question for correctness + rationale
  const { data: question, error: questionError } = await supabase
    .from('questions')
    .select('question_id, topic_id, correct_option_id, rationale')
    .eq('question_id', questionId)
    .single()

  if (questionError || !question) throw new Error('Question not found')

  const isCorrect = question.correct_option_id === selectedOptionId

  // 2. Insert interaction (upsert to handle retries)
  const { error: interactionError } = await supabase
    .from('user_interactions')
    .upsert(
      {
        session_id: sessionId,
        question_id: questionId,
        topic_id: question.topic_id,
        user_id: user.id,
        selected_option_id: selectedOptionId,
        is_correct: isCorrect,
        time_spent_ms: timeSpentMs,
        source_type: 'wiki_review',
        interaction_timestamp: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,session_id,question_id' },
    )

  if (interactionError) throw interactionError

  // 3. Update mastery with lighter alpha (0.15 instead of 0.30 from DB trigger)
  const { data: currentMastery } = await supabase
    .from('user_node_mastery')
    .select('current_mastery_weight, total_attempts, total_correct')
    .eq('user_id', user.id)
    .eq('topic_id', question.topic_id)
    .maybeSingle()

  const prevMastery = currentMastery?.current_mastery_weight ?? 0.0
  const score = isCorrect ? 1.0 : 0.0
  const newMastery = Math.min(Math.max(0.15 * score + 0.85 * prevMastery, 0), 1)
  const totalAttempts = (currentMastery?.total_attempts ?? 0) + 1
  const totalCorrect = (currentMastery?.total_correct ?? 0) + (isCorrect ? 1 : 0)

  await supabase.from('user_node_mastery').upsert(
    {
      user_id: user.id,
      topic_id: question.topic_id,
      current_mastery_weight: newMastery,
      total_attempts: totalAttempts,
      total_correct: totalCorrect,
      last_encountered: new Date().toISOString(),
    },
    { onConflict: 'user_id,topic_id' },
  )

  return {
    isCorrect,
    correctOptionId: question.correct_option_id,
    rationale: resolveRationaleText(question.rationale) || null,
  }
}

export const endWikiQuizSession = async (
  sessionId: string,
): Promise<{ correct: number; total: number; percent: number }> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) throw new Error('Unauthorized')

  // 1. Count results from interactions
  const { data: interactions, error: interactionsError } = await supabase
    .from('user_interactions')
    .select('is_correct')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)

  if (interactionsError) throw interactionsError

  const all = interactions ?? []
  const correct = all.filter((i: { is_correct: boolean }) => i.is_correct).length
  const total = all.length
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0

  // 2. Mark session completed
  const { error: updateError } = await supabase
    .from('quiz_sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('session_id', sessionId)
    .eq('user_id', user.id)

  if (updateError) throw updateError

  return { correct, total, percent }
}
