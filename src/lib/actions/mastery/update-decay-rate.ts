'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Update the personalized forgetting (decay) rate for a user-topic pair.
 *
 * Adjustments:
 *  - Incorrect answer        -> decay increases (forgets faster)
 *  - Correct but slow (>1.5x)-> decay increases slightly
 *  - Correct and fast        -> decay decreases (retains longer)
 *
 * After updating the decay rate, recalculates predicted_recall and
 * optimal_review_at based on exponential forgetting curve.
 */
export const updateDecayRate = async (
  userId: string,
  topicId: string,
  actualTimeMs: number,
  expectedTimeMs: number,
  isCorrect: boolean,
): Promise<void> => {
  try {
    const supabase = await createClient()

    // Fetch current mastery row for decay_rate and last_encountered
    const { data: mastery, error: fetchError } = await supabase
      .from('user_node_mastery')
      .select('last_encountered, decay_rate' as any)
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .single()

    if (fetchError || !mastery) return

    const currentDecayRate = (mastery as Record<string, unknown>).decay_rate as number | null ?? 0.3
    const lastEncountered = mastery.last_encountered

    // Compute new decay rate based on performance
    let newDecayRate: number

    if (!isCorrect) {
      // Incorrect: accelerate forgetting (capped at 0.8)
      newDecayRate = Math.min(currentDecayRate * 1.1, 0.8)
    } else {
      const timeRatio = expectedTimeMs > 0 ? actualTimeMs / expectedTimeMs : 1

      if (timeRatio > 1.5) {
        // Correct but slow: slight increase in decay
        newDecayRate = Math.min(currentDecayRate * 1.05, 0.8)
      } else {
        // Correct and reasonably fast: reduce decay (better retention)
        newDecayRate = Math.max(currentDecayRate * 0.95, 0.1)
      }
    }

    // Round to avoid floating point drift
    newDecayRate = Math.round(newDecayRate * 1000) / 1000

    // Compute predicted recall using exponential forgetting curve
    // R(t) = exp(-decay_rate * t) where t is days since last review
    const daysSinceLastReview = lastEncountered
      ? (Date.now() - new Date(lastEncountered).getTime()) / (1000 * 60 * 60 * 24)
      : 0

    const predictedRecall = Math.exp(-newDecayRate * daysSinceLastReview)

    // Compute optimal review time: last_encountered + (1 / decay_rate * 2) days
    // This targets the point where recall drops to ~60% (optimal for spacing)
    const optimalIntervalDays = (1 / newDecayRate) * 2
    const optimalReviewAt = lastEncountered
      ? new Date(
          new Date(lastEncountered).getTime() +
            optimalIntervalDays * 24 * 60 * 60 * 1000,
        ).toISOString()
      : new Date(
          Date.now() + optimalIntervalDays * 24 * 60 * 60 * 1000,
        ).toISOString()

    await supabase
      .from('user_node_mastery')
      .update({
        decay_rate: newDecayRate,
        predicted_recall: Math.round(predictedRecall * 1000) / 1000,
        optimal_review_at: optimalReviewAt,
      } as any)
      .eq('user_id', userId)
      .eq('topic_id', topicId)
  } catch (err) {
    // Decay rate update must not break the quiz flow
    console.error('[DECAY] updateDecayRate failed:', {
      error: err instanceof Error ? err.message : String(err),
      timestamp: new Date().toISOString(),
    })
  }
}
