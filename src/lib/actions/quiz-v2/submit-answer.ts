'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import type { SubmitAnswerInput, SubmitAnswerResult } from '@/types/quiz-config'

export const submitAnswer = async (
  input: SubmitAnswerInput,
): Promise<SubmitAnswerResult> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) throw new Error('Unauthorized')

  const { sessionId, questionId, selectedOptionId, confidenceLevel, timeSpentMs } = input

  // 1. Validate session belongs to the authenticated user and is still in progress
  const { data: session, error: sessionError } = await supabase
    .from('quiz_sessions')
    .select('session_id, user_id, status, config, question_ids')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (sessionError || !session) throw new Error('Session not found')
  if (session.status !== 'in_progress') throw new Error('Session is not in progress')

  // 2. Look up the question to determine correctness and fetch rationale
  const { data: question, error: questionError } = await supabase
    .from('questions')
    .select(
      'question_id, topic_id, correct_option_id, rationale, difficulty, options',
    )
    .eq('question_id', questionId)
    .single()

  if (questionError || !question) throw new Error('Question not found')

  const isCorrect = question.correct_option_id === selectedOptionId

  // 3. Map confidence number to DB text value
  const confidenceText =
    confidenceLevel === 1 ? 'unsure' : confidenceLevel === 3 ? 'sure' : null

  // 4. Determine question order (position in session question_ids array)
  const questionIds: string[] = session.question_ids ?? []
  const questionOrder = questionIds.indexOf(questionId) + 1

  // 5. Detect lucky guess heuristic (correct but very fast relative to difficulty)
  const difficulty = question.difficulty ?? 0.5
  const speedThreshold = 3000 + difficulty * 5000
  const isSuspectedLuckyGuess =
    isCorrect && timeSpentMs < speedThreshold

  // 6. Insert into user_interactions (immutable log — upsert to handle retries)
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
        confidence: confidenceText,
        is_suspected_lucky_guess: isSuspectedLuckyGuess,
        question_order: questionOrder,
        interaction_timestamp: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,session_id,question_id' },
    )

  if (interactionError) throw interactionError

  // 7. Read current counters from user_interactions for this session
  const { count: answeredCount } = await supabase
    .from('user_interactions')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId)
    .eq('user_id', user.id)

  const { count: correctCount } = await supabase
    .from('user_interactions')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .eq('is_correct', true)

  const totalQuestions = questionIds.length
  const answered = answeredCount ?? 0
  const correct = correctCount ?? 0
  const sessionComplete = answered >= totalQuestions

  // 8. Determine feedback timing from config
  const config = session.config as { feedback?: { timing?: string } } | null
  const feedbackTiming = config?.feedback?.timing ?? 'immediate'

  // For deferred/none feedback modes, withhold rationale from this response
  const rationaleForClient =
    feedbackTiming === 'immediate' ? (question.rationale ?? null) : null

  // Look up wiki article url for this question's topic
  let wikiArticleUrl: string | null = null
  if (feedbackTiming === 'immediate' && question.topic_id) {
    const { data: wikiLink } = await supabase
      .from('wiki_article_taxonomy')
      .select('article_id, wiki_articles(slug)')
      .eq('node_id', question.topic_id)
      .eq('is_primary', true)
      .maybeSingle()

    if (wikiLink) {
      const slug = (wikiLink as { wiki_articles?: { slug?: string } }).wiki_articles?.slug
      if (slug) wikiArticleUrl = `/wiki/${slug}`
    }
  }

  return {
    isCorrect,
    correctOptionId: question.correct_option_id,
    rationale: rationaleForClient,
    wikiArticleUrl,
    answeredCount: answered,
    correctCount: correct,
    sessionComplete,
  }
}
