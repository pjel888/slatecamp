'use server'

import { createClient } from '@/lib/supabase/server'
import {
  updateStorageStrength,
  currentRetrievalStrength,
} from '@/lib/quiz/memory-strength'

/**
 * `applyInteraction` — the canonical writer for `user_node_mastery` on the
 * per-quiz-answer path.
 *
 * ARCHITECTURE (Plan 013):
 * The previous implementation fanned out to three concurrent hooks
 * (`updateDecayRate`, `updateMemoryStrength`, `updateMasteryStats`), each of
 * which independently SELECTed the same `user_node_mastery` row, computed a
 * slice of the math, and wrote its slice back. Because the three ran inside
 * `Promise.all`, their writes raced: the last write to land clobbered the
 * overlapping columns written by the others (notably `last_encountered`).
 *
 * This module is the deep version. It issues ONE SELECT, computes ALL the
 * derived values locally (no I/O between computes), and ONE UPSERT. The
 * three previous files become depth behind this seam — their formulas are
 * ported verbatim and locked in by `update-mastery-stats.test.ts` and
 * `update-memory-strength.test.ts` (Plan 012).
 *
 * This is the ONLY writer on the per-answer path. Other writers to
 * `user_node_mastery` (10+ files — `teach-back.ts`, `dashboard-page.ts`,
 * `analytics.ts`, `queries/trails.ts`, etc.) are out of scope for this plan
 * and remain to be migrated in a follow-up; they currently bypass this seam.
 *
 * Silent on failure — must not break the quiz flow. (Same contract as the
 * previous three hooks, which each had their own internal try/catch.)
 */
export interface InteractionInput {
  userId: string
  topicId: string
  questionId: string
  isCorrect: boolean
  timeSpentMs: number
  avgTimeMs: number
  difficulty: number
  isInterleaved: boolean
  sessionMode: string
  /** Generation effect multiplier — correct generation answers get 1.2x stronger memory trace */
  emaWeightMultiplier: number
  isSuspectedLuckyGuess: boolean
}

export const applyInteraction = async (input: InteractionInput): Promise<void> => {
  const {
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
  } = input

  try {
    const supabase = await createClient()
    const nowMs = Date.now()
    const nowIso = new Date(nowMs).toISOString()

    // ---------------------------------------------------------------------
    // ONE SELECT: every column any of the three previous hooks needed.
    // ---------------------------------------------------------------------
    const { data: current } = await supabase
      .from('user_node_mastery')
      .select(
        [
          'current_mastery_weight',
          'total_attempts',
          'total_correct',
          'avg_time_ms',
          'consecutive_correct_streak',
          'highest_difficulty_correct',
          'has_bloom_apply_correct',
          'has_bloom_analyze_correct',
          'distinct_questions_seen',
          // memory-strength columns
          'storage_strength',
          'retrieval_strength',
          'practice_count',
          'practice_contexts',
          // decay columns
          'last_encountered',
          'decay_rate',
        ].join(', '),
      )
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .maybeSingle()

    const row = (current ?? {}) as Record<string, unknown>

    // ---------------------------------------------------------------------
    // Taxonomy + distinct-seen lookups (kept as separate queries because
    // they target different tables and depend on the same userId/topicId).
    // These were already part of updateMasteryStats; preserved unchanged.
    // ---------------------------------------------------------------------
    const { data: taxonomyNode } = await supabase
      .from('taxonomy_tree')
      .select('difficulty, bloom_level')
      .eq('node_id', topicId)
      .maybeSingle()
    const taxonomyDifficulty = taxonomyNode?.difficulty ?? null
    const bloomLevel = taxonomyNode?.bloom_level ?? null

    const { count: prevSeenCount } = await supabase
      .from('user_interactions')
      .select('interaction_id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .eq('question_id', questionId)

    // ---------------------------------------------------------------------
    // Compute — port verbatim from the three previous hooks.
    // ---------------------------------------------------------------------

    // === mastery-stats math (from update-mastery-stats.ts) ===
    // EMA smoothing factor by mode.
    let alpha = 0.2
    if (sessionMode === 'full_exam') alpha = 0.6
    else if (sessionMode === 'storm') alpha = 0.4
    else if (sessionMode === 'chill') alpha = 0.1
    else if (sessionMode === 'focus_review') alpha = 0.3

    const baseWeight = isSuspectedLuckyGuess ? 0.5 : 1.0
    const answerValue = isCorrect ? 1.0 : 0.0
    const prevMastery = (row.current_mastery_weight as number) ?? 0.0
    const newWeight = prevMastery + alpha * baseWeight * (answerValue - prevMastery)
    const currentMasteryWeight = Math.min(Math.max(newWeight, 0), 1)

    const totalAttempts = (row.total_attempts as number) ?? 0
    const newTotalAttempts = totalAttempts + 1
    const totalCorrect = (row.total_correct as number) ?? 0
    const newTotalCorrect = totalCorrect + (isCorrect ? 1 : 0)

    const prevAvgTime = (row.avg_time_ms as number) ?? 0
    const newAvgTime = Math.round(
      prevAvgTime + (timeSpentMs - prevAvgTime) / newTotalAttempts,
    )

    const prevStreak = (row.consecutive_correct_streak as number) ?? 0
    const newStreak = isCorrect ? prevStreak + 1 : 0

    const prevHighestDiff = (row.highest_difficulty_correct as number) ?? 0
    const newHighestDiff =
      isCorrect && taxonomyDifficulty !== null
        ? Math.max(prevHighestDiff, taxonomyDifficulty)
        : prevHighestDiff

    const newHasApply =
      (row.has_bloom_apply_correct as boolean) === true ||
      (isCorrect && (bloomLevel === 'apply' || bloomLevel === 'analyze'))
    const newHasAnalyze =
      (row.has_bloom_analyze_correct as boolean) === true ||
      (isCorrect && bloomLevel === 'analyze')

    const isNewQuestion = (prevSeenCount ?? 0) <= 1
    const prevDistinct = (row.distinct_questions_seen as number) ?? 0
    const newDistinct = isNewQuestion ? prevDistinct + 1 : prevDistinct

    // === memory-strength math (from update-memory-strength.ts) ===
    const currentSS = (row.storage_strength as number) ?? 0
    const currentRS = (row.retrieval_strength as number) ?? 0
    const practiceCount = (row.practice_count as number) ?? 0
    const practiceContexts = (row.practice_contexts as number) ?? 0
    const lastEncounteredMs = row.last_encountered
      ? new Date(row.last_encountered as string).getTime()
      : null

    // RS decay over the elapsed window.
    const daysSinceReview = lastEncounteredMs
      ? (nowMs - lastEncounteredMs) / (1000 * 60 * 60 * 24)
      : 0
    const decayedRS = currentRetrievalStrength(currentRS, currentSS, daysSinceReview)

    // SS — monotonically increasing; generation effect scales the increment.
    const baseSS = updateStorageStrength(currentSS, {
      isCorrect,
      difficulty,
      isInterleaved,
    })
    const ssIncrement = baseSS - currentSS
    const newSS = Math.min(currentSS + ssIncrement * emaWeightMultiplier, 1.0)

    // RS — correct jumps to ≥0.8 (successful retrieval); incorrect stays at decayed.
    const newRS = isCorrect ? Math.max(decayedRS, 0.8) : decayedRS

    // Context-diversity heuristic — same as update-memory-strength.ts.
    const isNewContext =
      practiceContexts < Math.min(practiceCount + 1, 10)
        ? sessionMode !== ''
        : false
    const newPracticeContexts = isNewContext
      ? Math.min(practiceContexts + 1, 10)
      : practiceContexts

    // === decay-rate math (from update-decay-rate.ts) ===
    const currentDecayRate = (row.decay_rate as number) ?? 0.3
    const expectedTimeMs = avgTimeMs > 0 ? avgTimeMs : timeSpentMs
    let newDecayRate: number
    if (!isCorrect) {
      // Incorrect: accelerate forgetting (capped at 0.8).
      newDecayRate = Math.min(currentDecayRate * 1.1, 0.8)
    } else {
      const timeRatio = expectedTimeMs > 0 ? timeSpentMs / expectedTimeMs : 1
      if (timeRatio > 1.5) {
        // Correct but slow: slight increase in decay.
        newDecayRate = Math.min(currentDecayRate * 1.05, 0.8)
      } else {
        // Correct and reasonably fast: reduce decay.
        newDecayRate = Math.max(currentDecayRate * 0.95, 0.1)
      }
    }
    newDecayRate = Math.round(newDecayRate * 1000) / 1000

    // R(t) = exp(-decay * t) for the new decay rate over the elapsed window.
    const predictedRecall = Math.exp(-newDecayRate * daysSinceReview)

    // Optimal review time targets ~60% recall: last_encountered + (1/decay)*2 days.
    const optimalIntervalDays = (1 / newDecayRate) * 2
    const optimalIntervalMs = optimalIntervalDays * 24 * 60 * 60 * 1000
    const optimalReviewAt = lastEncounteredMs
      ? new Date(lastEncounteredMs + optimalIntervalMs).toISOString()
      : new Date(nowMs + optimalIntervalMs).toISOString()

    // ---------------------------------------------------------------------
    // ONE UPSERT — merged payload. Every column any of the three previous
    // hooks wrote is present; nothing overlaps because the compute happened
    // in one place.
    // ---------------------------------------------------------------------
    await supabase.from('user_node_mastery').upsert(
      {
        user_id: userId,
        topic_id: topicId,
        // mastery-stats
        current_mastery_weight: currentMasteryWeight,
        total_attempts: newTotalAttempts,
        total_correct: newTotalCorrect,
        avg_time_ms: newAvgTime,
        consecutive_correct_streak: newStreak,
        highest_difficulty_correct: newHighestDiff,
        has_bloom_apply_correct: newHasApply,
        has_bloom_analyze_correct: newHasAnalyze,
        distinct_questions_seen: newDistinct,
        // memory-strength
        storage_strength: Math.round(newSS * 1000) / 1000,
        retrieval_strength: Math.round(newRS * 1000) / 1000,
        practice_count: practiceCount + 1,
        practice_contexts: newPracticeContexts,
        // decay
        decay_rate: newDecayRate,
        predicted_recall: Math.round(predictedRecall * 1000) / 1000,
        optimal_review_at: optimalReviewAt,
        // shared
        last_encountered: nowIso,
      },
      { onConflict: 'user_id, topic_id' },
    )
  } catch (err) {
    // Must not break the quiz flow — same contract as the previous hooks.
    console.error('[MASTERY] applyInteraction failed:', {
      error: err instanceof Error ? err.message : String(err),
      userId: input.userId,
      topicId: input.topicId,
      timestamp: new Date().toISOString(),
    })
  }
}
