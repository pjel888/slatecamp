'use server'

import { updateDecayRate } from './update-decay-rate'
import { updateMemoryStrength } from './update-memory-strength'

/**
 * Post-interaction hook: runs non-blocking updates after each quiz answer.
 *
 * Called from submit-answer flow. Updates the personalized forgetting
 * rate and memory strength (SS/RS) based on correctness, response speed,
 * and practice diversity. Designed to be fire-and-forget — failures are
 * logged but never propagated.
 */
export const runPostInteractionHooks = async (params: {
  userId: string
  topicId: string
  isCorrect: boolean
  timeSpentMs: number
  avgTimeMs: number
  difficulty?: number
  isInterleaved?: boolean
  sessionMode?: string
  /** Generation effect: multiplier for EMA weight (default 1.0, generation correct = 1.2) */
  emaWeightMultiplier?: number
}): Promise<void> => {
  const {
    userId,
    topicId,
    isCorrect,
    timeSpentMs,
    avgTimeMs,
    difficulty = 0.5,
    isInterleaved = false,
    sessionMode = '',
    emaWeightMultiplier = 1.0,
  } = params

  // Use avg_time_ms as the expected time baseline.
  // If no baseline exists yet (first attempt), use timeSpentMs itself
  // so the ratio is 1.0 (neutral).
  const expectedTimeMs = avgTimeMs > 0 ? avgTimeMs : timeSpentMs

  // Run both hooks concurrently — both are independently fault-tolerant
  await Promise.all([
    updateDecayRate(userId, topicId, timeSpentMs, expectedTimeMs, isCorrect),
    updateMemoryStrength(userId, topicId, isCorrect, difficulty, isInterleaved, sessionMode, emaWeightMultiplier),
  ])
}
