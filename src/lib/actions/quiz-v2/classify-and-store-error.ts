'use server'

import { createClient } from '@/lib/supabase/server'
import { classifyError } from '@/lib/quiz/error-classifier'
import { getMedianTimeForDifficulty } from '@/lib/quiz/median-time'
import type { ErrorClassification } from '@/lib/quiz/error-classifier'

interface ClassifyErrorDiagnosticInput {
  questionId: string
  userId: string
  timeSpentMs: number
  isCorrect: boolean
  questionData?: { difficulty: number; topic_id: string | null }
  interactionRecorded?: boolean
  supabase?: any
}

interface ClassifyAndStoreErrorInput extends ClassifyErrorDiagnosticInput {
  interactionId: string
  classification?: ErrorClassification | null
}

export const classifyErrorDiagnostic = async ({
  questionId,
  userId,
  timeSpentMs,
  isCorrect,
  questionData,
  interactionRecorded = false,
  supabase: providedSupabase,
}: ClassifyErrorDiagnosticInput): Promise<ErrorClassification | null> => {
  if (isCorrect) return null

  const supabase = providedSupabase ?? await createClient()

  let difficulty = questionData?.difficulty
  let topicId = questionData?.topic_id

  if (difficulty === undefined || topicId === undefined) {
    const { data: question } = await supabase
      .from('questions')
      .select('difficulty, topic_id')
      .eq('question_id', questionId)
      .single()

    difficulty = question?.difficulty ?? 0.5
    topicId = question?.topic_id ?? null
  }

  const medianTimeMs = await getMedianTimeForDifficulty(difficulty)

  let hasHistory = false
  let totalAttempts = 0

  if (topicId) {
    const { count } = await supabase
      .from('user_interactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('topic_id', topicId)

    totalAttempts = count ?? 0
    hasHistory = totalAttempts > (interactionRecorded ? 1 : 0)
  }

  return classifyError(
    timeSpentMs,
    medianTimeMs,
    isCorrect,
    hasHistory,
    totalAttempts,
  )
}

export const classifyAndStoreError = async ({
  interactionId,
  questionId,
  userId,
  timeSpentMs,
  isCorrect,
  questionData,
  classification,
}: ClassifyAndStoreErrorInput): Promise<ErrorClassification | null> => {
  try {
    const supabase = await createClient()
    const resolvedClassification =
      classification ??
      await classifyErrorDiagnostic({
        questionId,
        userId,
        timeSpentMs,
        isCorrect,
        questionData,
        interactionRecorded: true,
        supabase,
      })

    if (!resolvedClassification) return null

    await supabase
      .from('user_interactions')
      .update({
        error_type: resolvedClassification.category,
        updated_at: new Date().toISOString(),
      })
      .eq('interaction_id', interactionId)
      .eq('user_id', userId)

    return resolvedClassification
  } catch (err) {
    console.error('[classify-and-store-error] Failed:', err)
    return null
  }
}
