'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Compute and upsert derived signals for a user.
 * Called after session completion. Silent on failure.
 *
 * Computes:
 *   - score_velocity_7d: change in readiness score over last 7 days (pts/day)
 *   - churn_risk_score: 0.0–1.0 composite risk
 *   - days_since_last_session
 *   - sessions_last_7d
 */
export const computeUserSignals = async (userId: string): Promise<void> => {
  try {
    const supabase = await createClient()

    // ── Score Velocity ──────────────────────────────────────
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const { data: currentStats } = await supabase
      .from('user_global_stats')
      .select('global_readiness_score')
      .eq('user_id', userId)
      .single()

    const currentScore = currentStats?.global_readiness_score ?? 0

    // Find the oldest snapshot within the last 7 days for baseline
    const { data: baselineSnapshot } = await supabase
      .from('readiness_score_snapshots')
      .select('score, computed_at')
      .eq('user_id', userId)
      .lte('computed_at', sevenDaysAgo.toISOString())
      .order('computed_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    let velocity = 0
    if (baselineSnapshot) {
      const daysDelta =
        (now.getTime() - new Date(baselineSnapshot.computed_at).getTime()) /
        (1000 * 60 * 60 * 24)
      if (daysDelta > 0) {
        velocity = (currentScore - baselineSnapshot.score) / daysDelta
      }
    }

    // ── Sessions Last 7 Days ────────────────────────────────
    const { count: sessionsLast7d } = await supabase
      .from('quiz_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('started_at', sevenDaysAgo.toISOString())

    // ── Days Since Last Session ─────────────────────────────
    const { data: lastSession } = await supabase
      .from('quiz_sessions')
      .select('started_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const daysSinceLastSession = lastSession
      ? Math.floor(
          (now.getTime() - new Date(lastSession.started_at).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 999

    // ── Churn Risk Score ────────────────────────────────────
    //   days_since_last_session > 7    → +0.3
    //   score_velocity_7d < 0          → +0.3
    //   sessions_last_7d = 0           → +0.4
    //   sessions_last_7d >= 3          → -0.2
    let churnRisk = 0
    if (daysSinceLastSession > 7) churnRisk += 0.3
    if (velocity < 0) churnRisk += 0.3
    if ((sessionsLast7d ?? 0) === 0) churnRisk += 0.4
    if ((sessionsLast7d ?? 0) >= 3) churnRisk -= 0.2
    churnRisk = Math.max(0, Math.min(1, churnRisk))

    // ── Metacognitive Calibration Accuracy ──────────────────
    let calibrationAccuracy: number | null = null
    try {
      const { data: ratedSessions } = await supabase
        .from('quiz_sessions')
        .select('session_id, pre_session_confidence_ratings, subject_ids')
        .eq('user_id', userId)
        .neq('pre_session_confidence_ratings', '{}')
        .neq('status', 'abandoned')
        .order('started_at', { ascending: false })
        .limit(10)

      if (ratedSessions && ratedSessions.length >= 3) {
        let totalPredictions = 0
        let accuratePredictions = 0

        for (const session of ratedSessions) {
          const ratings = session.pre_session_confidence_ratings as Record<string, number> | null
          if (!ratings || Object.keys(ratings).length === 0) continue

          // Get actual session accuracy
          const { data: interactions } = await supabase
            .from('user_interactions')
            .select('is_correct')
            .eq('session_id', session.session_id)

          if (!interactions?.length) continue

          const actualAccuracy = interactions.filter((i: { is_correct: boolean }) => i.is_correct).length / interactions.length

          // Average confidence rating (1-3 scale)
          const avgConfidence = Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length

          // "Accurate" = High confidence matches high accuracy, low matches low
          // Mapping: 1 → <40%, 2 → 40-70%, 3 → >70%
          const predictedBracket = avgConfidence < 1.5 ? 0 : avgConfidence < 2.5 ? 1 : 2
          const actualBracket = actualAccuracy < 0.4 ? 0 : actualAccuracy < 0.7 ? 1 : 2

          totalPredictions++
          if (predictedBracket === actualBracket) accuratePredictions++
        }

        if (totalPredictions > 0) {
          calibrationAccuracy = Math.round((accuratePredictions / totalPredictions) * 100) / 100
        }
      }
    } catch {
      // Calibration is non-critical
    }

    // ── Upsert ──────────────────────────────────────────────
    await supabase
      .from('user_computed_signals')
      .upsert(
        {
          user_id: userId,
          score_velocity_7d: Math.round(velocity * 100) / 100,
          score_velocity_updated_at: now.toISOString(),
          churn_risk_score: Math.round(churnRisk * 100) / 100,
          churn_risk_updated_at: now.toISOString(),
          days_since_last_session: daysSinceLastSession,
          sessions_last_7d: sessionsLast7d ?? 0,
          ...(calibrationAccuracy !== null ? {
            calibration_accuracy: calibrationAccuracy,
            calibration_updated_at: now.toISOString(),
          } : {}),
          computed_at: now.toISOString(),
        },
        { onConflict: 'user_id' },
      )
  } catch {
    // Silent failure. Signals are non-critical. Never break the quiz flow.
  }
}
