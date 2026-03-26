'use server'

import { createClient, getUser } from '@/lib/supabase/server'

// ── Confidence Mapping ───────────────────────────────────────────────────────
// DB stores: 'sure' | 'unsure' | null
// Probability: 'sure' -> 1.0, null -> 0.67, 'unsure' -> 0.33

const CONFIDENCE_PROBABILITY: Record<string, number> = {
  sure: 1.0,
  unsure: 0.33,
}
const DEFAULT_CONFIDENCE_PROBABILITY = 0.67 // null = "partly sure"
const MIN_SAMPLE_SIZE = 10

interface InteractionRow {
  confidence: string | null
  is_correct: boolean
}

/**
 * Compute Brier-based calibration score from the last 30 days of
 * confidence-tagged interactions and insert a snapshot into calibration_snapshots.
 *
 * Brier Score: BS = (1/N) * sum((confidence_probability - outcome)^2)
 * Calibration Score: (1 - BS) * 100
 *
 * Returns the calibration score or null if insufficient data.
 */
export const updateCalibrationScore = async (userId?: string): Promise<number | null> => {
  const supabase = await createClient()

  const effectiveUserId = userId ?? (await getUser()).data.user?.id
  if (!effectiveUserId) return null

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // Fetch interactions with any confidence data from the last 30 days
  // confidence IS NOT NULL means 'sure' or 'unsure'; null means "partly sure" (still valid)
  const { data: interactions, error } = await supabase
    .from('user_interactions')
    .select('confidence, is_correct')
    .eq('user_id', effectiveUserId)
    .gte('interaction_timestamp', thirtyDaysAgo)

  if (error || !interactions) return null

  // Filter to only interactions where user made a confidence choice
  // Include all three states: 'sure', 'unsure', and null (partly sure)
  // But we need at least the confidence column to exist — exclude rows
  // where confidence was never recorded. Since the column is always present
  // in the schema, we include all interactions and treat null as "partly sure".
  const tagged = interactions as InteractionRow[]
  if (tagged.length < MIN_SAMPLE_SIZE) return null

  // Compute Brier Score
  let brierSum = 0
  let confidentCorrect = 0
  let confidentTotal = 0
  let guessingCorrect = 0
  let guessingTotal = 0
  let partlyCorrect = 0
  let partlyTotal = 0

  for (const row of tagged) {
    const prob = row.confidence
      ? (CONFIDENCE_PROBABILITY[row.confidence] ?? DEFAULT_CONFIDENCE_PROBABILITY)
      : DEFAULT_CONFIDENCE_PROBABILITY
    const outcome = row.is_correct ? 1 : 0
    brierSum += (prob - outcome) ** 2

    // Bucket by confidence level
    if (row.confidence === 'sure') {
      confidentTotal++
      if (row.is_correct) confidentCorrect++
    } else if (row.confidence === 'unsure') {
      guessingTotal++
      if (row.is_correct) guessingCorrect++
    } else {
      partlyTotal++
      if (row.is_correct) partlyCorrect++
    }
  }

  const brierScore = brierSum / tagged.length
  const calibrationScore = Math.round((1 - brierScore) * 100)

  const confidentAccuracy = confidentTotal > 0 ? confidentCorrect / confidentTotal : 0
  const guessingAccuracy = guessingTotal > 0 ? guessingCorrect / guessingTotal : 0

  // Overconfidence index: how much confident accuracy falls short of 100%
  // (expected accuracy at confidence=1.0 should be 100%)
  const overconfidenceIndex = confidentTotal > 0
    ? Math.max(0, 1.0 - confidentAccuracy)
    : 0

  // Underconfidence index: how much guessing accuracy exceeds 33%
  // (expected accuracy at confidence=0.33 should be ~33%)
  const underconfidenceIndex = guessingTotal > 0
    ? Math.max(0, guessingAccuracy - 0.33)
    : 0

  const now = new Date()
  const windowEnd = now.toISOString()
  const windowStart = thirtyDaysAgo

  // Insert snapshot
  await supabase.from('calibration_snapshots').insert({
    user_id: effectiveUserId,
    calibration_score: calibrationScore,
    brier_score: Math.round(brierScore * 10000) / 10000, // 4 decimal precision
    sample_size: tagged.length,
    confident_accuracy: Math.round(confidentAccuracy * 10000) / 10000,
    guessing_accuracy: Math.round(guessingAccuracy * 10000) / 10000,
    overconfidence_index: Math.round(overconfidenceIndex * 10000) / 10000,
    underconfidence_index: Math.round(underconfidenceIndex * 10000) / 10000,
    window_start: windowStart,
    window_end: windowEnd,
  })

  return calibrationScore
}
