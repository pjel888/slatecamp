'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { classifyError } from '@/lib/quiz/error-classifier'
import { getMedianTimeForDifficulty } from '@/lib/quiz/median-time'
import type { ErrorClassification } from '@/lib/quiz/error-classifier'

/**
 * Post-submit hook: classify a wrong answer and persist the error type.
 * Called after the interaction has been recorded. Returns the classification
 * so the client can show a coaching diagnostic in the FeedbackPanel.
 *
 * Skips silently for correct answers — no error to classify.
 */
export const classifyAndStoreError = async (
  interactionId: string,
  questionId: string,
  userId: string,
  timeSpentMs: number,
  isCorrect: boolean,
): Promise<ErrorClassification | null> => {
  if (isCorrect) return null

  try {
    const supabase = await createClient()
    const { data: { user } } = await getUser()
    if (!user || user.id !== userId) return null

    // 1. Get the question's difficulty for median-time lookup
    const { data: question } = await supabase
      .from('questions')
      .select('difficulty, topic_id')
      .eq('question_id', questionId)
      .single()

    const difficulty = question?.difficulty ?? 0.5
    const topicId = question?.topic_id ?? null

    // 2. Get median time for this difficulty band
    const medianTimeMs = await getMedianTimeForDifficulty(difficulty)

    // 3. Check user's mastery history for this topic (has they seen it before?)
    let hasHistory = false
    let totalAttempts = 0

    if (topicId) {
      const { count } = await supabase
        .from('user_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('topic_id', topicId)

      totalAttempts = count ?? 0
      // More than 1 because the current interaction is already recorded
      hasHistory = totalAttempts > 1
    }

    // 4. Classify the error
    const classification = classifyError(
      timeSpentMs,
      medianTimeMs,
      isCorrect,
      hasHistory,
      totalAttempts,
    )

    if (!classification) return null

    // 5. Persist to user_interactions (error_type column)
    await supabase
      .from('user_interactions')
      .update({
        error_type: classification.category,
        updated_at: new Date().toISOString(),
      })
      .eq('interaction_id', interactionId)
      .eq('user_id', userId)

    return classification
  } catch (err) {
    // Non-critical path — log and return null so the quiz flow isn't interrupted
    console.error('[classify-and-store-error] Failed:', err)
    return null
  }
}
