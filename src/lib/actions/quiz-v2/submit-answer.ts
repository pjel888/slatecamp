'use server'

import { after } from 'next/server'
import { createServiceClient, getUser } from '@/lib/supabase/server'
import { resolveRationaleText, normalizeOptions } from '@/lib/utils/question'
import { matchGenerationAnswer } from '@/lib/quiz/answer-matching'
import {
  classifyAndStoreError,
  classifyErrorDiagnostic,
} from './classify-and-store-error'
import {
  LUCKY_GUESS_DIAGNOSTIC,
  type ErrorClassification,
} from '@/lib/quiz/error-classifier'
import { runPostInteractionHooks } from '@/lib/actions/mastery/post-interaction-hooks'
import { deriveQualityRating, updateSrsSchedule } from '@/lib/srs/update'
import { revalidateDashboardCacheTags } from '@/lib/actions/cache-tags'
import { endSession as endSessionAction } from './end-session'
import { getOwnedSessionOrThrow } from './session-helpers'
import { submitAnswerInputSchema } from './schemas'
import type {
  QuestionType,
  QuizSessionConfig,
  SubmitAnswerInput,
  SubmitAnswerResult,
} from '@/types/quiz-config'
import type { QuestionMatchData } from '@/lib/quiz/answer-matching'
import type { CAGEBindingToken } from '@/types/patent'
import { logServerError, logServerEvent } from '@/lib/logging/server'

interface SessionRow {
  session_id: string
  user_id: string
  status: string
  config: QuizSessionConfig | null
  question_ids: string[] | null
  answered_count?: number | null
  correct_count?: number | null
  cage_session_key?: string | null
}

interface QuestionRow {
  question_id: string
  topic_id: string | null
  correct_option_id: string | null
  rationale: unknown
  difficulty: number | null
  options: unknown
  question_type: string | null
  correct_value: number | null
  value_tolerance: number | null
  accepted_answers: string[] | null
}

const getConfidenceText = (confidenceLevel?: number | null) => {
  if (confidenceLevel == null) return null
  if (confidenceLevel <= 0.33) return 'unsure'
  if (confidenceLevel >= 0.67) return 'sure'
  return null
}

const loadWikiSlug = async (supabase: any, topicId: string | null) => {
  if (!topicId) return null

  const { data: articleTaxonomy } = await supabase
    .from('wiki_article_taxonomy')
    .select('article_id')
    .eq('node_id', topicId)
    .eq('is_primary', true)
    .maybeSingle()

  const articleId = articleTaxonomy?.article_id
  if (!articleId) return null

  const { data: article } = await supabase
    .from('wiki_articles')
    .select('slug')
    .eq('article_id', articleId)
    .maybeSingle()

  return article?.slug ?? null
}

export const submitAnswer = async (
  input: SubmitAnswerInput,
): Promise<SubmitAnswerResult> => {
  let userId: string | null = null

  try {
    const parsedInput = submitAnswerInputSchema.parse(input)

    // Parallel: auth check + service client (independent operations)
    const [{ data: { user } }, supabase] = await Promise.all([
      getUser(),
      createServiceClient(),
    ])

    userId = user?.id ?? null

    if (!user) throw new Error('Unauthorized')

    // Parallel: session validation + question fetch (eliminates sequential waterfall)
    // Always fetch rationale — single row, negligible overhead vs round-trip latency saved
    const [session, { data: question }] = await Promise.all([
      getOwnedSessionOrThrow<SessionRow>(
        supabase,
        user.id,
        parsedInput.sessionId,
        'session_id, user_id, status, config, question_ids, answered_count, correct_count, cage_session_key',
      ),
      supabase
        .from('questions')
        .select('question_id, topic_id, correct_option_id, rationale, difficulty, options, question_type, correct_value, value_tolerance, accepted_answers')
        .eq('question_id', parsedInput.questionId)
        .single(),
    ])

    if (session.status !== 'in_progress') {
      throw new Error('Session is not in progress')
    }

    if (!question) {
      throw new Error('Question not found')
    }

    const questionIds = session.question_ids ?? []
    const questionOrder = questionIds.indexOf(parsedInput.questionId) + 1
    if (questionOrder === 0) {
      throw new Error('Question not found in session')
    }

    const config = session.config ?? null
    const feedbackTiming = config?.feedback?.timing ?? 'immediate'

    const typedQuestion = question as QuestionRow
    const topicId = parsedInput.topicId ?? typedQuestion.topic_id
    const difficulty = parsedInput.difficulty ?? typedQuestion.difficulty ?? 0.5
    const questionType = (typedQuestion.question_type ?? 'mcq') as QuestionType
    const isGeneration = questionType !== 'mcq'

    if (!isGeneration) {
      const validOptionIds = normalizeOptions(typedQuestion.options).map((option) => option.id)
      if (!validOptionIds.includes(parsedInput.selectedOptionId)) {
        throw new Error('Selected option is invalid for this question')
      }
    }

    let isCorrect: boolean
    let closeness = 0
    let correctAnswer = ''

    if (isGeneration) {
      const matchData: QuestionMatchData = {
        question_type: questionType,
        correct_value: typedQuestion.correct_value,
        value_tolerance: typedQuestion.value_tolerance,
        accepted_answers: typedQuestion.accepted_answers,
        correct_option_id: typedQuestion.correct_option_id,
      }
      const matchResult = matchGenerationAnswer(
        questionType,
        parsedInput.selectedOptionId,
        matchData,
      )
      isCorrect = matchResult.isCorrect
      closeness = matchResult.closeness

      if (questionType === 'numeric' || questionType === 'formula') {
        correctAnswer = matchData.correct_value?.toString() ?? ''
      } else if (questionType === 'short_text') {
        correctAnswer = matchData.accepted_answers?.[0] ?? ''
      }
    } else {
      isCorrect = typedQuestion.correct_option_id === parsedInput.selectedOptionId
    }

    const confidenceScore = parsedInput.confidenceLevel ?? null
    const confidenceText = getConfidenceText(parsedInput.confidenceLevel)
    const speedThreshold = 3000 + difficulty * 5000
    const isSuspectedLuckyGuess = isCorrect && parsedInput.timeSpentMs < speedThreshold

    const questionDataForClassifier = {
      difficulty,
      topic_id: topicId ?? null,
    }

    const immediateDiagnostic: ErrorClassification | null =
      feedbackTiming === 'immediate'
        ? isSuspectedLuckyGuess
          ? LUCKY_GUESS_DIAGNOSTIC
          : await classifyErrorDiagnostic({
              questionId: parsedInput.questionId,
              userId: user.id,
              timeSpentMs: parsedInput.timeSpentMs,
              isCorrect,
              questionData: questionDataForClassifier,
              interactionRecorded: false,
              supabase,
            })
        : null

    const { data: rpcResult, error: rpcError } = await supabase
      .rpc('submit_quiz_answer_v2', {
        p_session_id: parsedInput.sessionId,
        p_question_id: parsedInput.questionId,
        p_user_id: user.id,
        p_selected_option_id: parsedInput.selectedOptionId,
        p_is_correct: isCorrect,
        p_time_spent_ms: parsedInput.timeSpentMs,
        p_confidence: confidenceText,
        p_confidence_score: confidenceScore,
        p_is_suspected_lucky_guess: isSuspectedLuckyGuess,
        p_question_order: questionOrder,
      })
      .single()

    let interactionId: string | null = null
    let answeredCount = 0
    let correctCount = 0
    let wikiSlug: string | null = null
    let rationaleFromDb: unknown = typedQuestion.rationale

    if (rpcError) {
      console.warn('[submitAnswer] RPC failed, falling back to legacy interaction recording:', rpcError)

      const { data: existingInteraction } = await supabase
        .from('user_interactions')
        .select('interaction_id, is_correct')
        .eq('session_id', parsedInput.sessionId)
        .eq('question_id', parsedInput.questionId)
        .eq('user_id', user.id)
        .maybeSingle()

      const { data: interactionRow, error: interactionError } = await supabase
        .from('user_interactions')
        .upsert(
          {
            session_id: parsedInput.sessionId,
            question_id: parsedInput.questionId,
            topic_id: topicId,
            user_id: user.id,
            selected_option_id: parsedInput.selectedOptionId,
            is_correct: isCorrect,
            time_spent_ms: parsedInput.timeSpentMs,
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

      interactionId = interactionRow?.interaction_id ?? existingInteraction?.interaction_id ?? null

      const { data: stats } = await supabase.rpc('get_quiz_session_interaction_stats', {
        p_session_id: parsedInput.sessionId,
        p_user_id: user.id,
      })

      answeredCount = stats?.[0]?.answered_count ?? session.answered_count ?? 0
      correctCount = stats?.[0]?.correct_count ?? session.correct_count ?? 0

      await supabase
        .from('quiz_sessions')
        .update({
          answered_count: answeredCount,
          correct_count: correctCount,
          updated_at: new Date().toISOString(),
        })
        .eq('session_id', parsedInput.sessionId)
        .eq('user_id', user.id)

      wikiSlug = await loadWikiSlug(supabase, topicId)
    } else {
      interactionId = rpcResult.interaction_id
      answeredCount = rpcResult.answered_count
      correctCount = rpcResult.correct_count
      wikiSlug = rpcResult.wiki_slug
      rationaleFromDb = rpcResult.rationale
    }

    const rationaleForClient =
      feedbackTiming === 'immediate' ? resolveRationaleText(rationaleFromDb as string | null) || null : null
    const wikiArticleUrl =
      feedbackTiming === 'immediate' && wikiSlug ? `/dashboard/wiki/${wikiSlug}?from=quiz` : null
    const sessionComplete = answeredCount >= questionIds.length

    const runPostSubmitWork = async () => {
      const backgroundTasks: Promise<unknown>[] = []

      if (!isCorrect && interactionId) {
        backgroundTasks.push(
          classifyAndStoreError({
            interactionId,
            questionId: parsedInput.questionId,
            userId: user.id,
            timeSpentMs: parsedInput.timeSpentMs,
            isCorrect,
            questionData: questionDataForClassifier,
            classification: immediateDiagnostic,
          }),
        )
      }

      let generationMultiplier = isGeneration && isCorrect ? 1.2 : 1.0
      if (isSuspectedLuckyGuess) generationMultiplier = 0.5

      if (topicId && (config?.mode === 'camp' || config?.mode === 'focus_review')) {
        const quality = await deriveQualityRating({
          isCorrect,
          timeSpentMs: parsedInput.timeSpentMs,
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
            topicId,
            questionId: parsedInput.questionId,
            isCorrect,
            timeSpentMs: parsedInput.timeSpentMs,
            avgTimeMs: 0,
            difficulty,
            isInterleaved: config?.interleave ?? false,
            sessionMode: config?.mode ?? 'camp',
            emaWeightMultiplier: generationMultiplier,
            isSuspectedLuckyGuess,
          }),
        )
      }

      if (interactionId && input.signalTrace?.length) {
        backgroundTasks.push(
          (async () => {
            const { createAdminClient: getAdmin } = await import('@/lib/supabase/admin')
            const admin = getAdmin()

            const first = input.signalTrace![0]
            const last = input.signalTrace![input.signalTrace!.length - 1]
            const durationMs = Math.round(last.timestamp - first.timestamp)

            const { error } = await admin.from('interaction_signal_traces').insert({
              interaction_id: interactionId,
              events: input.signalTrace,
              event_count: input.signalTrace!.length,
              duration_ms: durationMs,
              capture_rate_hz:
                durationMs > 0 ? input.signalTrace!.length / (durationMs / 1000) : 0,
              device_sensors_available: input.sensorsAvailable ?? false,
            })

            if (error) {
              await logServerError({
                family: 'quiz',
                eventName: 'signal_trace_store_failed',
                message: 'Failed to store quiz signal trace.',
                context: {
                  routeOrAction: 'quiz-v2:submit-answer',
                  userId,
                  sessionId: parsedInput.sessionId,
                  metadata: {
                    questionId: parsedInput.questionId,
                    interactionId,
                  },
                },
                error,
              })
            }
          })(),
        )
      }

      // CAGE verification — fire-and-forget (Patent Claims 3(f), 3(g), 20, 21)
      if (interactionId && input.cageToken) {
        backgroundTasks.push(
          (async () => {
            try {
              const { verifyBindingToken } = await import('@/lib/cage/verifyBindingToken')
              const { storeCageToken } = await import('@/lib/cage/cageTokenStore')
              const token = input.cageToken as CAGEBindingToken
              const cageSessionKey = session.cage_session_key

              if (!cageSessionKey) {
                await storeCageToken({
                  interactionId: interactionId!,
                  sessionId: parsedInput.sessionId,
                  questionId: parsedInput.questionId,
                  token,
                  trustLevel: 'unavailable',
                })
                await logServerEvent({
                  severity: 'warn',
                  family: 'quiz',
                  eventName: 'cage_session_key_unavailable',
                  message: 'CAGE session key unavailable; verification skipped.',
                  context: {
                    routeOrAction: 'quiz-v2:submit-answer',
                    userId,
                    sessionId: parsedInput.sessionId,
                    metadata: {
                      questionId: parsedInput.questionId,
                      interactionId,
                    },
                  },
                })
                return
              }

              const result = await verifyBindingToken(
                token,
                { questionId: parsedInput.questionId, selectedOptionId: parsedInput.selectedOptionId },
                cageSessionKey,
                parsedInput.sessionId,
              )

              await storeCageToken({
                interactionId: interactionId!,
                sessionId: parsedInput.sessionId,
                questionId: parsedInput.questionId,
                token,
                trustLevel: result.trustLevel as 'verified' | 'failed',
                failureReasons: result.failureReasons.length > 0 ? result.failureReasons : undefined,
              })
            } catch (err) {
              await logServerError({
                family: 'quiz',
                eventName: 'cage_verification_failed',
                message: 'CAGE verification pipeline failed.',
                context: {
                  routeOrAction: 'quiz-v2:submit-answer',
                  userId,
                  sessionId: parsedInput.sessionId,
                  metadata: {
                    questionId: parsedInput.questionId,
                    interactionId,
                  },
                },
                error: err,
              })
            }
          })(),
        )
      }

      await Promise.allSettled(backgroundTasks)

      if (!sessionComplete && answeredCount % 5 === 0) {
        revalidateDashboardCacheTags(user.id)
      }
    }

    if (sessionComplete) {
      await runPostSubmitWork()
      const finalResult = await endSessionAction({
        sessionId: parsedInput.sessionId,
        endReason: 'completed',
      })

      return {
        isCorrect,
        correctOptionId: typedQuestion.correct_option_id ?? '',
        rationale: rationaleForClient,
        wikiArticleUrl,
        answeredCount,
        correctCount,
        sessionComplete,
        errorDiagnostic: immediateDiagnostic,
        finalResult,
        ...(isGeneration && {
          closeness,
          correctAnswer,
          questionType,
        }),
      }
    }

    after(async () => {
      try {
        await runPostSubmitWork()
      } catch (error) {
        await logServerError({
          family: 'quiz',
          eventName: 'submit_answer_background_hooks_failed',
          message: 'Quiz background hooks failed after answer submission.',
          context: {
            routeOrAction: 'quiz-v2:submit-answer',
            userId,
            sessionId: parsedInput.sessionId,
            metadata: {
              questionId: parsedInput.questionId,
            },
          },
          error,
        })
      }
    })

    return {
      isCorrect,
      correctOptionId: typedQuestion.correct_option_id ?? '',
      rationale: rationaleForClient,
      wikiArticleUrl,
      answeredCount,
      correctCount,
      sessionComplete,
      errorDiagnostic: immediateDiagnostic,
      ...(isGeneration && {
        closeness,
        correctAnswer,
        questionType,
      }),
    }
  } catch (error) {
    await logServerError({
      family: 'quiz',
      eventName: 'submit_answer_failed',
      message: 'Failed to submit quiz answer.',
      context: {
        routeOrAction: 'quiz-v2:submit-answer',
        userId,
        sessionId: input.sessionId,
        metadata: {
          questionId: input.questionId,
        },
      },
      error,
    })

    throw error
  }
}
