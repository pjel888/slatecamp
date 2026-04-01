'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveRationaleText } from '@/lib/utils/question'
import { matchGenerationAnswer } from '@/lib/quiz/answer-matching'
import { classifyAndStoreError } from './classify-and-store-error'
import { runPostInteractionHooks } from '@/lib/actions/mastery/post-interaction-hooks'
import { deriveQualityRating, updateSrsSchedule } from '@/lib/srs/update'
import type { SubmitAnswerInput, SubmitAnswerResult, QuestionType } from '@/types/quiz-config'
import type { QuestionMatchData } from '@/lib/quiz/answer-matching'

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
      'question_id, topic_id, correct_option_id, rationale, difficulty, options, question_type, correct_value, value_tolerance, accepted_answers',
    )
    .eq('question_id', questionId)
    .single()

  if (questionError || !question) throw new Error('Question not found')

  // Cast DB row to access generation columns (may not be in generated types yet)
  const raw = question as Record<string, unknown>
  const questionType = (raw.question_type as string) ?? 'mcq'
  const isGeneration = questionType !== 'mcq'

  // Determine correctness — MCQ vs generation answer matching
  let isCorrect: boolean
  let closeness = 0
  let correctAnswer = ''

  if (isGeneration) {
    const matchData: QuestionMatchData = {
      question_type: questionType,
      correct_value: raw.correct_value as number | null,
      value_tolerance: raw.value_tolerance as number | null,
      accepted_answers: raw.accepted_answers as string[] | null,
      correct_option_id: raw.correct_option_id as string | null,
    }
    const matchResult = matchGenerationAnswer(questionType, selectedOptionId, matchData)
    isCorrect = matchResult.isCorrect
    closeness = matchResult.closeness

    // Build display-ready correct answer string
    if (questionType === 'numeric' || questionType === 'formula') {
      correctAnswer = matchData.correct_value?.toString() ?? ''
    } else if (questionType === 'short_text') {
      correctAnswer = matchData.accepted_answers?.[0] ?? ''
    }
  } else {
    isCorrect = question.correct_option_id === selectedOptionId
  }

  // 3. Map continuous 0–1 confidence to legacy text value + store raw score
  const confidenceScore = confidenceLevel ?? null
  const confidenceText =
    confidenceLevel != null
      ? confidenceLevel <= 0.33 ? 'unsure' : confidenceLevel >= 0.67 ? 'sure' : null
      : null

  // 4. Determine question order (position in session question_ids array)
  const questionIds: string[] = session.question_ids ?? []
  const questionOrder = questionIds.indexOf(questionId) + 1

  // 5. Detect lucky guess heuristic (correct but very fast relative to difficulty)
  const difficulty = question.difficulty ?? 0.5
  const speedThreshold = 3000 + difficulty * 5000
  const isSuspectedLuckyGuess =
    isCorrect && timeSpentMs < speedThreshold

  // 6. Insert into user_interactions (immutable log — upsert to handle retries)
  const { data: upsertedRow, error: interactionError } = await supabase
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
        confidence_score: confidenceScore,
        is_suspected_lucky_guess: isSuspectedLuckyGuess,
        question_order: questionOrder,
        interaction_timestamp: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        integrity_status: 'pending',
        cage_trust_level: input.cageTrustLevel ?? 'absent',
        gesture_duration_ms: input.gestureDurationMs ?? null,
      },
      { onConflict: 'user_id,session_id,question_id' },
    )
    .select('interaction_id')
    .single()

  if (interactionError) throw interactionError

  const interactionId = upsertedRow?.interaction_id ?? null

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
  // Rationale can be a plain string or JSONB object — always resolve to string
  const rationaleForClient =
    feedbackTiming === 'immediate' ? (resolveRationaleText(question.rationale) || null) : null

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
      if (slug) wikiArticleUrl = `/dashboard/wiki/${slug}?from=quiz`
    }
  }

  // 9. Classify error (non-blocking for the quiz flow — errors are caught internally)
  let errorDiagnostic = null
  if (!isCorrect && interactionId && feedbackTiming === 'immediate') {
    const classification = await classifyAndStoreError(
      interactionId,
      questionId,
      user.id,
      timeSpentMs,
      isCorrect,
    )
    if (classification && classification.confidence > 0.5) {
      errorDiagnostic = {
        category: classification.category,
        confidence: classification.confidence,
        message: classification.message,
      }
    }
  }

  // 10. Fire post-interaction hooks (memory strength + decay rate — non-blocking)
  const sessionConfig = session.config as { mode?: string; interleave?: boolean } | null

  // SRS scheduling (only for learning modes like 'camp')
  if (sessionConfig?.mode === 'camp' || sessionConfig?.mode === 'focused') {
    // We don't have current avg_time_ms easily here, passing 0 as baseline
    deriveQualityRating({
      isCorrect,
      timeSpentMs,
      avgTimeMs: 0,
      confidence: confidenceText,
      isSuspectedLuckyGuess,
    }).then((quality) => {
      void updateSrsSchedule(user.id, question.topic_id!, quality)
    })
  }

  // Generation effect: correct generation answers get 1.2x EMA weight
  // for stronger memory trace (production effect from cognitive science)
  // Lucky guess: 0.5x weight to force re-testing (overrides generation multiplier)
  let generationMultiplier = isGeneration && isCorrect ? 1.2 : 1.0
  if (isSuspectedLuckyGuess) {
    generationMultiplier = 0.5
  }

  runPostInteractionHooks({
    userId: user.id,
    topicId: question.topic_id!,
    isCorrect,
    timeSpentMs,
    avgTimeMs: 0, // first interaction has no baseline — hook handles this
    difficulty: question.difficulty ?? 0.5,
    isInterleaved: sessionConfig?.interleave ?? false,
    sessionMode: sessionConfig?.mode ?? 'camp',
    emaWeightMultiplier: generationMultiplier,
  }).catch(() => {
    // Swallow — hooks are fire-and-forget
  })

  // Patent: Async storage of signal trace + CAGE token (fire-and-forget)
  if (interactionId && (input.signalTrace?.length || input.cageToken)) {
    const adminClient = createAdminClient()
    const patentOps: PromiseLike<unknown>[] = []

    // Store signal trace in interaction_signal_traces (trade secret table)
    if (input.signalTrace && input.signalTrace.length > 0) {
      const firstEvent = input.signalTrace[0]
      const lastEvent = input.signalTrace[input.signalTrace.length - 1]
      const durationMs = Math.round(lastEvent.timestamp - firstEvent.timestamp)
      patentOps.push(
        adminClient.from('interaction_signal_traces').insert({
          interaction_id: interactionId,
          events: input.signalTrace,
          event_count: input.signalTrace.length,
          duration_ms: durationMs,
          capture_rate_hz: durationMs > 0 ? input.signalTrace.length / (durationMs / 1000) : 0,
          device_sensors_available: input.sensorsAvailable ?? false,
        }).then(),
      )
    }

    // Store CAGE binding token in cage_binding_tokens (highest security table)
    if (input.cageToken) {
      patentOps.push(
        adminClient.from('cage_binding_tokens').insert({
          interaction_id: interactionId,
          session_id: input.sessionId,
          question_id: input.questionId,
          response_hash: input.cageToken.responseHash,
          behavioral_attestation: input.cageToken.behavioralAttestation,
          nonce: input.cageToken.nonce,
          sequence_number: input.cageToken.sequenceNumber,
          signature: input.cageToken.signature,
          previous_token_hash: input.cageToken.previousTokenHash,
          trust_level: input.cageTrustLevel ?? 'absent',
        }).then(),
      )
    }

    Promise.all(patentOps).catch(() => {
      // Swallow — patent trace storage is fire-and-forget
    })
  }

  return {
    isCorrect,
    correctOptionId: question.correct_option_id,
    rationale: rationaleForClient,
    wikiArticleUrl,
    answeredCount: answered,
    correctCount: correct,
    sessionComplete,
    errorDiagnostic,
    // Generation effect fields — only populated for non-MCQ questions
    ...(isGeneration && {
      closeness,
      correctAnswer,
      questionType: questionType as QuestionType,
    }),
  }
}
