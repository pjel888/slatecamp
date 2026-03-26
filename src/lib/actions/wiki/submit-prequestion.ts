'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { runPostInteractionHooks } from '@/lib/actions/mastery/post-interaction-hooks'
import { resolveRationaleText } from '@/lib/utils/question'
import type { RationaleData } from '@/lib/utils/question'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SubmitPrequestionInput {
  sessionId: string
  questionId: string
  selectedOptionId: string
  topicId: string
  timeSpentMs: number
}

export interface SubmitPrequestionResult {
  isCorrect: boolean
  correctOptionId: string
  rationale: string | null
  fullRationale: string | null
}

// ─── Action ──────────────────────────────────────────────────────────────────

/**
 * Record a prequestion answer in user_interactions and return feedback.
 *
 * Uses 'prequestion' as source_type so the mastery system can apply
 * a reduced EMA weight (alpha = 0.1) for pre-reading interactions.
 */
export const submitPrequestion = async (
  input: SubmitPrequestionInput,
): Promise<SubmitPrequestionResult> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) throw new Error('Unauthorized')

  const now = new Date().toISOString()
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
        source_type: 'prequestion',
        interaction_timestamp: now,
        updated_at: now,
      },
      { onConflict: 'user_id,session_id,question_id' },
    )

  if (interactionError) throw interactionError

  // 3. Update mastery with reduced alpha (0.1 instead of standard 0.3)
  // Prequestions are asked before studying, so they carry less weight.
  const { data: currentMastery } = await supabase
    .from('user_node_mastery')
    .select('current_mastery_weight, total_attempts, total_correct, avg_time_ms')
    .eq('user_id', user.id)
    .eq('topic_id', question.topic_id)
    .maybeSingle()

  const prevMastery = currentMastery?.current_mastery_weight ?? 0.0
  const score = isCorrect ? 1.0 : 0.0
  const alpha = 0.1
  const newMastery = Math.min(Math.max(alpha * score + (1 - alpha) * prevMastery, 0), 1)
  const totalAttempts = (currentMastery?.total_attempts ?? 0) + 1
  const totalCorrect = (currentMastery?.total_correct ?? 0) + (isCorrect ? 1 : 0)
  const prevAvgTime = currentMastery?.avg_time_ms ?? 0
  const newAvgTime = Math.round(
    prevAvgTime + (timeSpentMs - prevAvgTime) / totalAttempts,
  )

  await supabase.from('user_node_mastery').upsert(
    {
      user_id: user.id,
      topic_id: question.topic_id,
      current_mastery_weight: newMastery,
      total_attempts: totalAttempts,
      total_correct: totalCorrect,
      avg_time_ms: newAvgTime,
      last_encountered: now,
      last_interaction_at: now,
      updated_at: now,
    },
    { onConflict: 'user_id,topic_id' },
  )

  await runPostInteractionHooks({
    userId: user.id,
    topicId: question.topic_id,
    isCorrect,
    timeSpentMs,
    avgTimeMs: prevAvgTime,
    difficulty: 0.5,
    isInterleaved: false,
    sessionMode: 'prequestion',
  })

  // 4. Resolve rationale — extract a short summary sentence for prequestion feedback
  const fullRationale = resolveRationaleText(question.rationale as RationaleData)
  // Take the first sentence (up to ~200 chars) for the brief prequestion feedback
  const briefRationale = fullRationale
    ? fullRationale.split(/(?<=[.!?])\s+/)[0]?.slice(0, 200) ?? fullRationale.slice(0, 200)
    : null

  return {
    isCorrect,
    correctOptionId: question.correct_option_id,
    rationale: briefRationale,
    fullRationale: fullRationale ?? null,
  }
}
