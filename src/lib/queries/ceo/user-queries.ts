import { createClient } from '@/lib/supabase/server'
import type {
  EngagementSnapshot,
  CohortRow,
  ChurnRiskSegment,
  TimeToValue,
  ChurnSignal,
} from '@/types/ceo'

// ============================================================================
// getEngagementSnapshot
// ============================================================================

export const getEngagementSnapshot = async (): Promise<EngagementSnapshot> => {
  const supabase = await createClient()

  // Try materialized view first
  const { data: mvData, error: mvError } = await supabase
    .from('mv_engagement_snapshot')
    .select(
      'snapshot_date, dau, wau, mau, dau_mau_ratio, avg_sessions_per_week, avg_streak_length',
    )
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single()

  if (!mvError && mvData) {
    return {
      snapshotDate: mvData.snapshot_date ?? new Date().toISOString().split('T')[0],
      dau: mvData.dau ?? 0,
      wau: mvData.wau ?? 0,
      mau: mvData.mau ?? 0,
      dauMauRatio: mvData.dau_mau_ratio ?? 0,
      avgSessionsPerWeek: mvData.avg_sessions_per_week ?? 0,
      avgStreakLength: mvData.avg_streak_length ?? 0,
    }
  }

  // Fallback: compute from user_global_stats using last_active_date (DATE column)
  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString().split('T')[0]
  const monthAgo = new Date(Date.now() - 30 * 86_400_000).toISOString().split('T')[0]

  const [{ count: dau }, { count: wau }, { count: mau }] = await Promise.all([
    supabase
      .from('user_global_stats')
      .select('user_id', { count: 'exact', head: true })
      .eq('last_active_date', today),
    supabase
      .from('user_global_stats')
      .select('user_id', { count: 'exact', head: true })
      .gte('last_active_date', weekAgo),
    supabase
      .from('user_global_stats')
      .select('user_id', { count: 'exact', head: true })
      .gte('last_active_date', monthAgo),
  ])

  const dauVal = dau ?? 0
  const mauVal = mau ?? 0

  return {
    snapshotDate: today,
    dau: dauVal,
    wau: wau ?? 0,
    mau: mauVal,
    dauMauRatio: mauVal > 0 ? dauVal / mauVal : 0,
    avgSessionsPerWeek: 0,
    avgStreakLength: 0,
  }
}

// ============================================================================
// getCohortRetention
// ============================================================================

export const getCohortRetention = async (): Promise<CohortRow[]> => {
  const supabase = await createClient()

  const { data: mvData, error: mvError } = await supabase
    .from('mv_cohort_retention')
    .select('cohort_month, week_number, active_users, cohort_size')
    .order('cohort_month', { ascending: false })

  if (mvError || !mvData || mvData.length === 0) {
    return []
  }

  // Pivot week_number into retentionByWeek array
  const cohortMap: Record<
    string,
    { totalUsers: number; weekMap: Record<number, number> }
  > = {}

  for (const row of mvData) {
    const month: string = row.cohort_month ?? ''
    if (!month) continue
    if (!cohortMap[month]) {
      cohortMap[month] = { totalUsers: row.cohort_size ?? 0, weekMap: {} }
    }
    const weekNum = row.week_number ?? 0
    const cohortSize = cohortMap[month].totalUsers || 1
    cohortMap[month].weekMap[weekNum] =
      cohortSize > 0 ? (row.active_users ?? 0) / cohortSize : 0
  }

  const WEEK_COLUMNS = [0, 1, 2, 3, 4, 6, 8, 12]
  const cohortMonths = Object.keys(cohortMap)

  const result: CohortRow[] = cohortMonths.map((month) => {
    const { totalUsers, weekMap } = cohortMap[month]
    const retentionByWeek = WEEK_COLUMNS.map((w) => weekMap[w] ?? -1)
    return {
      cohortMonth: month,
      totalUsers,
      retentionByWeek,
      avgReadinessScore: 0,
      conversionRate: 0,
    }
  })

  return result
}

// ============================================================================
// getChurnRiskDistribution
// ============================================================================

export const getChurnRiskDistribution = async (): Promise<ChurnRiskSegment[]> => {
  const supabase = await createClient()

  // MV columns match: risk_level, user_count, avg_days_since_session, avg_readiness_score, avg_score_velocity
  const { data: mvData, error: mvError } = await supabase
    .from('mv_churn_risk_distribution')
    .select('risk_level, user_count, avg_days_since_session, avg_readiness_score, avg_score_velocity')

  if (!mvError && mvData && mvData.length > 0) {
    const ORDER: ChurnRiskSegment['riskLevel'][] = ['low', 'medium', 'high', 'critical']
    const mapped: ChurnRiskSegment[] = mvData.map((row) => ({
      riskLevel: row.risk_level as ChurnRiskSegment['riskLevel'],
      userCount: row.user_count ?? 0,
      avgDaysSinceLastSession: row.avg_days_since_session ?? 0,
      avgReadinessScore: row.avg_readiness_score ?? 0,
      avgScoreVelocity: row.avg_score_velocity ?? 0,
    }))
    return mapped.sort(
      (a, b) => ORDER.indexOf(a.riskLevel) - ORDER.indexOf(b.riskLevel),
    )
  }

  // Fallback: compute from user_global_stats
  const { data: statsData } = await supabase
    .from('user_global_stats')
    .select('churn_risk_score, last_active_date, global_readiness_score, score_velocity_7d')
    .not('last_active_date', 'is', null)

  if (!statsData || statsData.length === 0) return []

  const bands: Record<
    ChurnRiskSegment['riskLevel'],
    { users: number; daySum: number; scoreSum: number; velocitySum: number }
  > = {
    low: { users: 0, daySum: 0, scoreSum: 0, velocitySum: 0 },
    medium: { users: 0, daySum: 0, scoreSum: 0, velocitySum: 0 },
    high: { users: 0, daySum: 0, scoreSum: 0, velocitySum: 0 },
    critical: { users: 0, daySum: 0, scoreSum: 0, velocitySum: 0 },
  }

  const today = new Date()
  for (const row of statsData) {
    const score = row.churn_risk_score ?? 0
    const level: ChurnRiskSegment['riskLevel'] =
      score < 0.25 ? 'low' : score < 0.5 ? 'medium' : score < 0.75 ? 'high' : 'critical'

    const daysSince = row.last_active_date
      ? Math.floor((today.getTime() - new Date(row.last_active_date).getTime()) / 86_400_000)
      : 0

    bands[level].users += 1
    bands[level].daySum += daysSince
    bands[level].scoreSum += row.global_readiness_score ?? 0
    bands[level].velocitySum += row.score_velocity_7d ?? 0
  }

  const ORDER: ChurnRiskSegment['riskLevel'][] = ['low', 'medium', 'high', 'critical']
  return ORDER.map((level) => {
    const b = bands[level]
    const count = b.users || 1
    return {
      riskLevel: level,
      userCount: b.users,
      avgDaysSinceLastSession: Math.round(b.daySum / count * 10) / 10,
      avgReadinessScore: Math.round(b.scoreSum / count * 10) / 10,
      avgScoreVelocity: Math.round(b.velocitySum / count * 1000) / 1000,
    }
  })
}

// ============================================================================
// getTimeToValue
// ============================================================================

export const getTimeToValue = async (): Promise<TimeToValue> => {
  const supabase = await createClient()

  const { data: mvData, error: mvError } = await supabase
    .from('mv_time_to_value')
    .select(
      'median_days_to_first_session, diagnostic_completion_rate, median_days_to_conversion, avg_sessions_before_conversion, avg_score_at_conversion, free_to_paid_conversion_rate',
    )
    .limit(1)
    .single()

  if (!mvError && mvData) {
    return {
      medianDaysToFirstSession: mvData.median_days_to_first_session ?? null,
      diagnosticCompletionRate: mvData.diagnostic_completion_rate ?? 0,
      medianDaysToConversion: mvData.median_days_to_conversion ?? null,
      avgSessionsBeforeConversion: mvData.avg_sessions_before_conversion ?? null,
      avgScoreAtConversion: mvData.avg_score_at_conversion ?? null,
      freeToConversionRate: mvData.free_to_paid_conversion_rate ?? 0,
    }
  }

  return {
    medianDaysToFirstSession: null,
    diagnosticCompletionRate: 0,
    medianDaysToConversion: null,
    avgSessionsBeforeConversion: null,
    avgScoreAtConversion: null,
    freeToConversionRate: 0,
  }
}

// ============================================================================
// getChurnSignals
// ============================================================================

export const getChurnSignals = async (): Promise<ChurnSignal[]> => {
  const supabase = await createClient()

  const { data: mvData, error: mvError } = await supabase
    .from('mv_churn_signals')
    .select('signal_key, signal_description, affected_users, churn_multiplier')
    .order('churn_multiplier', { ascending: false })

  if (mvError || !mvData || mvData.length === 0) {
    return []
  }

  return mvData.map((row) => ({
    signalKey: row.signal_key ?? '',
    signalDescription: row.signal_description ?? '',
    affectedUsers: row.affected_users ?? 0,
    churnMultiplier: row.churn_multiplier ?? 1,
  }))
}
