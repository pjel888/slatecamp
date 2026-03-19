'use server'

import { createClient } from '@/lib/supabase/server'
import { calculateNextReview, getNextReviewDate } from './sm2'

/**
 * Derive SM-2 quality rating from SlateCamp interaction data.
 * 0 = complete failure, 5 = perfect with confidence.
 */
export const deriveQualityRating = async (params: {
  isCorrect: boolean
  timeSpentMs: number
  avgTimeMs: number
  confidence: string | null
  isSuspectedLuckyGuess: boolean
}): Promise<number> => {
  if (!params.isCorrect) return 1
  if (params.isSuspectedLuckyGuess) return 2

  const timeRatio = params.avgTimeMs > 0
    ? params.timeSpentMs / params.avgTimeMs
    : 1

  if (params.confidence === 'sure' && timeRatio < 1.5) return 5
  if (params.confidence === 'sure') return 4
  if (timeRatio < 1.2) return 4
  return 3
}

/**
 * Update SRS scheduling columns on user_node_mastery after an answer.
 * Uses the existing SM-2 algorithm from sm2.ts.
 * Silent on failure — SRS must not break the quiz.
 */
export const updateSrsSchedule = async (
  userId: string,
  topicId: string,
  qualityRating: number,
): Promise<void> => {
  try {
    const supabase = await createClient()

    const { data: mastery } = await supabase
      .from('user_node_mastery')
      .select('review_interval_days, ease_factor')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .single()

    const currentInterval = mastery?.review_interval_days ?? 1
    const currentEase = mastery?.ease_factor ?? 2.5
    // Derive repetitions from interval (approximate)
    const repetitions = currentInterval <= 1 ? 0 : currentInterval <= 6 ? 1 : 2

    const result = calculateNextReview(qualityRating, repetitions, currentEase, currentInterval)
    const dueAt = getNextReviewDate(result.interval)

    await supabase
      .from('user_node_mastery')
      .update({
        review_interval_days: result.interval,
        ease_factor: Math.round(result.easeFactor * 100) / 100,
        next_review_at: dueAt.toISOString(),
      })
      .eq('user_id', userId)
      .eq('topic_id', topicId)
  } catch (err) {
    // SRS update failed — log for monitoring but do not break quiz flow
    console.error('[SRS] updateSrsSchedule failed for user. Session still completed.', {
      error: err instanceof Error ? err.message : String(err),
      timestamp: new Date().toISOString(),
    })
    // TODO Phase 5: Add Sentry.captureException(err) here when monitoring is added
  }
}
