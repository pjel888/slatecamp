'use server'

import { after } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient, getUser, createServiceClient } from '@/lib/supabase/server'
import { resolveRationaleText } from '@/lib/utils/question'
import { matchGenerationAnswer } from '@/lib/quiz/answer-matching'
import { classifyAndStoreError } from './classify-and-store-error'
import { runPostInteractionHooks } from '@/lib/actions/mastery/post-interaction-hooks'
import { deriveQualityRating, updateSrsSchedule } from '@/lib/srs/update'
import { revalidateDashboardCacheTags } from '@/lib/actions/cache-tags'
import { endSession as endSessionAction } from './end-session'
import type { SubmitAnswerInput, SubmitAnswerResult, QuestionType } from '@/types/quiz-config'
import type { QuestionMatchData } from '@/lib/quiz/answer-matching'

export const submitAnswer = async (
  input: SubmitAnswerInput,
): Promise<SubmitAnswerResult> => {
  const {
    data: { user },
  } = await getUser()
  if (!user) throw new Error('Unauthorized')

  // Use Service Client to avoid cookies() inside potential cached paths
  const supabase = await createServiceClient()

  const { sessionId, questionId, selectedOptionId, confidenceLevel, timeSpentMs, topicId: inputTopicId, difficulty: inputDifficulty } = input

  // 1. Fetch session for ownership and security verification
  const { data: session, error: sessionError } = await supabase
    .from('quiz_sessions')
    .select('session_id, user_id, status, config, question_ids')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (sessionError || !session) throw new Error('Session not found')
  if (session.status !== 'in_progress') throw new Error('Session is not in progress')

  // Security check: ensure question belongs to this session
  const questionIds: string[] = session.question_ids ?? []
  const questionOrder = questionIds.indexOf(questionId) + 1
  if (questionOrder === 0) throw new Error('Question not found in session')

  // 2. Resolve question data (Phase 1: Zero-Latency Data Passing)
  let topicId = inputTopicId
  let difficulty = inputDifficulty
  let questionType = 'mcq'
  let rationaleFromDb: any = null

  const needsQuestionFetch = !topicId || difficulty === undefined

  let question: any = null
  if (needsQuestionFetch) {
    const { data: q } = await supabase
      .from('questions')
      .select(
        'question_id, topic_id, correct_option_id, rationale, difficulty, options, question_type, correct_value, value_tolerance, accepted_answers',
      )
      .eq('question_id', questionId)
      .single()
    
    if (!q) throw new Error('Question not found')
    question = q
    topicId = q.topic_id
    difficulty = q.difficulty
  }

  if (!question) {
    const { data: q } = await supabase
      .from('questions')
      .select('correct_option_id, rationale, options, question_type, correct_value, value_tolerance, accepted_answers')
      .eq('question_id', questionId)
      .single()
    if (!q) throw new Error('Question not found')
    question = q
  }

  questionType = (question.question_type as string) ?? 'mcq'
  const isGeneration = questionType !== 'mcq'

  // Determine correctness
  let isCorrect: boolean
  let closeness = 0
  let correctAnswer = ''

  if (isGeneration) {
    const mData: QuestionMatchData = {
      question_type: questionType,
      correct_value: question.correct_value as number | null,
      value_tolerance: question.value_tolerance as number | null,
      accepted_answers: question.accepted_answers as string[] | null,
      correct_option_id: question.correct_option_id as string | null,
    }
    const matchResult = matchGenerationAnswer(questionType, selectedOptionId, mData)
    isCorrect = matchResult.isCorrect
    closeness = matchResult.closeness

    if (questionType === 'numeric' || questionType === 'formula') {
      correctAnswer = mData.correct_value?.toString() ?? ''
    } else if (questionType === 'short_text') {
      correctAnswer = mData.accepted_answers?.[0] ?? ''
    }
  } else {
    isCorrect = question.correct_option_id === selectedOptionId
  }

  const confidenceScore = confidenceLevel ?? null
  const confidenceText =
    confidenceLevel != null
      ? confidenceLevel <= 0.33 ? 'unsure' : confidenceLevel >= 0.67 ? 'sure' : null
      : null

  const speedThreshold = 3000 + (difficulty ?? 0.5) * 5000
  const isSuspectedLuckyGuess = isCorrect && timeSpentMs < speedThreshold

  // 3. Call the Super-Interaction RPC (Phases 3 & 4)
  const { data: rpcResult, error: rpcError } = await supabase.rpc('submit_quiz_answer_v2', {
    p_session_id: sessionId,
    p_question_id: questionId,
    p_user_id: user.id,
    p_selected_option_id: selectedOptionId,
    p_is_correct: isCorrect,
    p_time_spent_ms: timeSpentMs,
    p_confidence: confidenceText,
    p_confidence_score: confidenceScore,
    p_is_suspected_lucky_guess: isSuspectedLuckyGuess,
    p_question_order: questionOrder,
  }).single()

  let interactionId: string | null = null
  let answeredCount = 0
  let correctCount = 0
  let wikiSlug: string | null = null

  if (rpcError) {
    console.warn('[submitAnswer] RPC failed, falling back to legacy interaction recording:', rpcError)
    
    const { data: interactionRow, error: interactionError } = await supabase
      .from('user_interactions')
      .upsert(
        {
          session_id: sessionId,
          question_id: questionId,
          topic_id: topicId,
          user_id: user.id,
          selected_option_id: selectedOptionId,
          is_correct: isCorrect,
          time_spent_ms: timeSpentMs,
          confidence: confidenceText,
          confidence_score: confidenceScore,
          is_suspected_lucky_guess: isSuspectedLuckyGuess,
          question_order: questionOrder,
          interaction_timestamp: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,session_id,question_id' },
      )
      .select('interaction_id')
      .single()

    if (interactionError) throw interactionError
    interactionId = interactionRow?.interaction_id ?? null

    const { data: interactions } = await supabase
      .from('user_interactions')
      .select('is_correct')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
    
    answeredCount = interactions?.length ?? 0
    correctCount = interactions?.filter((i) => i.is_correct).length ?? 0
    rationaleFromDb = question.rationale
  } else {
    interactionId = rpcResult.interaction_id
    answeredCount = rpcResult.answered_count
    correctCount = rpcResult.correct_count
    wikiSlug = rpcResult.wiki_slug
    rationaleFromDb = rpcResult.rationale
  }

  const config = session.config as { feedback?: { timing?: string }, mode?: string, interleave?: boolean } | null
  const feedbackTiming = config?.feedback?.timing ?? 'immediate'
  const rationaleForClient = feedbackTiming === 'immediate' ? (resolveRationaleText(rationaleFromDb) || null) : null
  const wikiArticleUrl = feedbackTiming === 'immediate' && (wikiSlug ? `/dashboard/wiki/${wikiSlug}?from=quiz` : null)

  const sessionComplete = answeredCount >= questionIds.length

  // 4. Decouple Non-Blocking Hooks (Phase 2: Decoupled Mastery)
  after(async () => {
    try {
      const backgroundTasks: Promise<any>[] = []

      // Error Diagnostic
      if (!isCorrect && interactionId && feedbackTiming === 'immediate') {
        backgroundTasks.push(
          classifyAndStoreError(interactionId, questionId, user.id, timeSpentMs, isCorrect, {
            difficulty: difficulty ?? 0.5,
            topic_id: topicId ?? null,
          }),
        )
      }

      // Mastery & SRS Hooks
      let generationMultiplier = isGeneration && isCorrect ? 1.2 : 1.0
      if (isSuspectedLuckyGuess) generationMultiplier = 0.5

      if (topicId && (config?.mode === 'camp' || config?.mode === 'focused')) {
        const quality = await deriveQualityRating({
          isCorrect,
          timeSpentMs,
          avgTimeMs: 0,
          confidence: confidenceText,
          isSuspectedLuckyGuess,
        })
        backgroundTasks.push(updateSrsSchedule(user.id, topicId, quality))
      }

      if (topicId) {
        backgroundTasks.push(
          runPostInteractionHooks({
            userId: user.id,
            topicId: topicId,
            questionId: questionId,
            isCorrect,
            timeSpentMs,
            avgTimeMs: 0,
            difficulty: difficulty ?? 0.5,
            isInterleaved: config?.interleave ?? false,
            sessionMode: config?.mode ?? 'camp',
            emaWeightMultiplier: generationMultiplier,
            isSuspectedLuckyGuess,
          })
        )
      }

      // Patent: Behavioral Capture
      if (interactionId && (input.signalTrace?.length || input.cageToken)) {
        const patentWork = (async () => {
          const { createAdminClient: getAdmin } = await import('@/lib/supabase/admin')
          const admin = getAdmin()
          if (input.signalTrace?.length) {
            const first = input.signalTrace[0]
            const last = input.signalTrace[input.signalTrace.length - 1]
            const dur = Math.round(last.timestamp - first.timestamp)
            const { error } = await admin.from('interaction_signal_traces').insert({
              interaction_id: interactionId!,
              events: input.signalTrace,
              event_count: input.signalTrace.length,
              duration_ms: dur,
              capture_rate_hz: dur > 0 ? input.signalTrace.length / (dur / 1000) : 0,
              device_sensors_available: input.sensorsAvailable ?? false,
            })
            if (error) console.error('[submitAnswer] Failed to store signal trace:', error)
          }
        })()
        backgroundTasks.push(patentWork)
      }

      await Promise.allSettled(backgroundTasks)

      if (sessionComplete || answeredCount % 5 === 0) {
        revalidateDashboardCacheTags(user.id)
        revalidatePath('/dashboard')
      }

      if (sessionComplete) {
        await endSessionAction({ sessionId, endReason: 'completed' })
      }
    } catch (err) {
      console.error('[submitAnswer] Background hooks failed:', err)
    }
  })

  return {
    isCorrect,
    correctOptionId: question.correct_option_id,
    rationale: rationaleForClient,
    wikiArticleUrl,
    answeredCount,
    correctCount,
    sessionComplete,
    errorDiagnostic: null,
    ...(isGeneration && {
      closeness,
      correctAnswer,
      questionType: questionType as QuestionType,
    }),
  }
}
