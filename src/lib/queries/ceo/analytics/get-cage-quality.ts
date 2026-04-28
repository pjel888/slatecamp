'use server'

import { createClient } from '@/lib/supabase/server'
import { assertCeoAccess } from '@/lib/ceo/access'
import { wrapResult, wrapError } from '@/lib/actions/analytics/shared-helpers'
import type { AnalyticsResult } from '@/lib/actions/analytics/shared-helpers'

export type CAGEMetric = {
  metric: string
  value: string
  trend: 'up' | 'down' | 'neutral'
}

export const getCAGEQualityData = async (): Promise<AnalyticsResult<CAGEMetric[]>> => {
  await assertCeoAccess()

  try {
    const supabase = await createClient()

    // Try cage_verifications table first
    const { data: cageData, error: cageErr } = await supabase
      .from('cage_verifications')
      .select('status, confidence, created_at')

    if (!cageErr && cageData && cageData.length > 0) {
      type CageRow = { status: string | null; confidence: number | null; created_at: string | null }
      const rows = cageData as CageRow[]
      const total = rows.length
      const verified = rows.filter((r) => r.status === 'verified' || r.status === 'passed').length
      const successRate = total === 0 ? 0 : Math.round((verified / total) * 1000) / 10
      const avgConf =
        rows.filter((r) => r.confidence !== null).length === 0
          ? 0
          : Math.round(
              (rows.reduce((s, r) => s + (r.confidence ?? 0), 0) /
                rows.filter((r) => r.confidence !== null).length) *
                10,
            ) / 10

      return wrapResult([
        { metric: 'Total Verifications', value: total.toLocaleString(), trend: 'neutral' },
        { metric: 'Success Rate', value: `${successRate}%`, trend: successRate >= 80 ? 'up' : 'down' },
        { metric: 'Avg Confidence', value: `${avgConf}%`, trend: avgConf >= 70 ? 'up' : 'down' },
      ])
    }

    // Fallback: quiz_sessions with cage-related modes
    const { data: sessionData, error: sessionErr } = await supabase
      .from('quiz_sessions')
      .select('mode, score, created_at')
      .in('mode', ['cage', 'full_exam', 'assessment'])

    if (sessionErr) throw new Error(sessionErr.message)

    const sessions = (sessionData ?? []) as Array<{ mode: string | null; score: number | null; created_at: string | null }>
    const total = sessions.length

    if (total === 0) return wrapResult([])

    const avgScore =
      sessions.filter((s) => s.score !== null).length === 0
        ? 0
        : Math.round(
            (sessions.reduce((sum, s) => sum + (s.score ?? 0), 0) /
              sessions.filter((s) => s.score !== null).length) *
              10,
          ) / 10

    const metrics: CAGEMetric[] = [
      { metric: 'Total Sessions', value: total.toLocaleString(), trend: 'neutral' },
      { metric: 'Avg Score', value: `${avgScore}%`, trend: avgScore >= 70 ? 'up' : 'down' },
      {
        metric: 'Modes Active',
        value: [...new Set(sessions.map((s) => s.mode).filter(Boolean))].length.toString(),
        trend: 'neutral',
      },
    ]

    return wrapResult(metrics)
  } catch (err) {
    return wrapError(
      err instanceof Error ? err.message : 'Failed to load CAGE quality data',
      [],
    )
  }
}
