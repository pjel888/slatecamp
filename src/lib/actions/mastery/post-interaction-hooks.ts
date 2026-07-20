'use server'

import { applyInteraction } from '@/lib/mastery/apply-interaction'

/**
 * Post-interaction hook: runs non-blocking updates after each quiz answer.
 *
 * Called from submit-answer flow. Updates the personalized forgetting
 * rate, memory strength (SS/RS), and core performance statistics (mastery weight,
 * attempts, anti-inflation vectors) based on correctness, speed, and mode.
 *
 * ARCHITECTURE: previously fanned out to three concurrent hooks that each did
 * their own read-modify-write on the same `user_node_mastery` row, racing
 * each other and clobbering overlapping columns. Now delegates to
 * `applyInteraction`, which issues ONE SELECT + combined compute + ONE UPSERT
 * — eliminating the lost-update window (Plan 013). The math is byte-identical
 * (locked in by update-mastery-stats.test.ts and the apply-interaction test).
 *
 * Designed to be fire-and-forget — failures are logged but never propagated
 * (the `try/catch` lives inside `applyInteraction`).
 *
 * Public signature unchanged so callers (`submit-answer.ts:327`,
 * `wiki/submit-prequestion.ts`) need no edits.
 */
export const runPostInteractionHooks = async (params: {
  userId: string
  topicId: string
  questionId: string
  isCorrect: boolean
  timeSpentMs: number
  avgTimeMs: number
  difficulty?: number
  isInterleaved?: boolean
  sessionMode?: string
  /** Generation effect: multiplier for EMA weight (default 1.0, generation correct = 1.2) */
  emaWeightMultiplier?: number
  isSuspectedLuckyGuess?: boolean
}): Promise<void> => {
  const {
    userId,
    topicId,
    questionId,
    isCorrect,
    timeSpentMs,
    avgTimeMs,
    difficulty = 0.5,
    isInterleaved = false,
    sessionMode = '',
    emaWeightMultiplier = 1.0,
    isSuspectedLuckyGuess = false,
  } = params

  await applyInteraction({
    userId,
    topicId,
    questionId,
    isCorrect,
    timeSpentMs,
    avgTimeMs,
    difficulty,
    isInterleaved,
    sessionMode,
    emaWeightMultiplier,
    isSuspectedLuckyGuess,
  })
}
