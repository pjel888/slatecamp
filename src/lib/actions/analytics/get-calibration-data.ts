'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { wrapResult, wrapError, type AnalyticsResult } from '@/lib/actions/analytics/shared-helpers'

// ── Types ────────────────────────────────────────────────────────────────────

export interface CalibrationTrendPoint {
  date: string
  score: number
}

export interface CalibrationData {
  score: number
  brierScore: number
  confidentAccuracy: number
  guessingAccuracy: number
  partlyAccuracy: number
  overconfidence: number
  underconfidence: number
  sampleSize: number
  trend: CalibrationTrendPoint[]
}

// ── Query ────────────────────────────────────────────────────────────────────

/**
 * Fetch the latest calibration snapshot plus historical trend for the
 * analytics dashboard. Also computes partlyAccuracy from raw interactions
 * (confidence IS NULL = "partly sure").
 */
export const getCalibrationCurveData = async (
  userId?: string,
): Promise<AnalyticsResult<CalibrationData | null>> => {
  try {
    const supabase = await createClient()

    const effectiveUserId = userId ?? (await getUser()).data.user?.id
    if (!effectiveUserId) return wrapResult(null)

    // Latest snapshot
    const { data: latest } = await supabase
      .from('calibration_snapshots')
      .select(
        'calibration_score, brier_score, sample_size, confident_accuracy, guessing_accuracy, overconfidence_index, underconfidence_index, created_at',
      )
      .eq('user_id', effectiveUserId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!latest) return wrapResult(null)

    // Historical trend (last 20 snapshots)
    const { data: history } = await supabase
      .from('calibration_snapshots')
      .select('calibration_score, created_at')
      .eq('user_id', effectiveUserId)
      .order('created_at', { ascending: true })
      .limit(20)

    // Compute partlyAccuracy from raw interactions (confidence IS NULL)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data: partlyInteractions } = await supabase
      .from('user_interactions')
      .select('is_correct')
      .eq('user_id', effectiveUserId)
      .is('confidence', null)
      .gte('interaction_timestamp', thirtyDaysAgo)

    const partlyRows = (partlyInteractions ?? []) as Array<{ is_correct: boolean }>
    const partlyAccuracy =
      partlyRows.length > 0
        ? partlyRows.filter((r) => r.is_correct).length / partlyRows.length
        : 0

    const trend: CalibrationTrendPoint[] = (history ?? []).map(
      (s: { calibration_score: number; created_at: string }) => ({
        date: new Date(s.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        score: s.calibration_score,
      }),
    )

    return wrapResult({
      score: latest.calibration_score as number,
      brierScore: latest.brier_score as number,
      confidentAccuracy: latest.confident_accuracy as number,
      guessingAccuracy: latest.guessing_accuracy as number,
      partlyAccuracy: Math.round(partlyAccuracy * 10000) / 10000,
      overconfidence: latest.overconfidence_index as number,
      underconfidence: latest.underconfidence_index as number,
      sampleSize: latest.sample_size as number,
      trend,
    })
  } catch (err) {
    console.error('[ANALYTICS] getCalibrationCurveData failed:', err)
    return wrapError('Failed to load calibration data', null)
  }
}
