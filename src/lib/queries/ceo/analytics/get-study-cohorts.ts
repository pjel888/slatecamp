'use server'

import { createClient } from '@/lib/supabase/server'
import { assertCeoAccess } from '@/lib/ceo/access'
import { wrapResult, wrapError } from '@/lib/actions/analytics/shared-helpers'
import type { AnalyticsResult } from '@/lib/actions/analytics/shared-helpers'

export type StudyCohort = {
  cohortName: string
  userCount: number
  avgAccuracy: number
  avgSessionsPerWeek: number
}

export const getStudyCohortsData = async (): Promise<AnalyticsResult<StudyCohort[]>> => {
  await assertCeoAccess()

  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('quiz_sessions')
      .select('user_id, created_at, score')

    if (error) throw new Error(error.message)

    const rows = (data ?? []) as Array<{
      user_id: string | null
      created_at: string | null
      score: number | null
    }>

    if (rows.length === 0) return wrapResult([])

    // Group sessions by user
    const byUser = new Map<string, Array<{ date: Date; score: number | null }>>()
    for (const row of rows) {
      if (!row.user_id || !row.created_at) continue
      const existing = byUser.get(row.user_id) ?? []
      existing.push({ date: new Date(row.created_at), score: row.score })
      byUser.set(row.user_id, existing)
    }

    const cohorts = {
      daily_studiers: { userCount: 0, totalAccuracy: 0, totalSessions: 0, weeks: 0 },
      weekend_warriors: { userCount: 0, totalAccuracy: 0, totalSessions: 0, weeks: 0 },
      cramming: { userCount: 0, totalAccuracy: 0, totalSessions: 0, weeks: 0 },
      dormant: { userCount: 0, totalAccuracy: 0, totalSessions: 0, weeks: 0 },
    }

    const now = Date.now()
    const MS_WEEK = 7 * 24 * 60 * 60 * 1000

    for (const [, sessions] of byUser) {
      const sorted = sessions.sort((a, b) => a.date.getTime() - b.date.getTime())
      const earliest = sorted[0].date.getTime()
      const weeksActive = Math.max(1, Math.round((now - earliest) / MS_WEEK))
      const sessionsPerWeek = sessions.length / weeksActive

      const weekdays = sessions.filter((s) => {
        const d = s.date.getDay()
        return d >= 1 && d <= 5
      }).length
      const weekendRatio = sessions.length === 0 ? 0 : (sessions.length - weekdays) / sessions.length

      const avgAccuracy =
        sessions.filter((s) => s.score !== null).length === 0
          ? 0
          : sessions.reduce((sum, s) => sum + (s.score ?? 0), 0) /
            sessions.filter((s) => s.score !== null).length

      const lastSession = sorted[sorted.length - 1].date.getTime()
      const daysSinceLast = (now - lastSession) / (24 * 60 * 60 * 1000)

      let cohort: keyof typeof cohorts
      if (daysSinceLast > 30) {
        cohort = 'dormant'
      } else if (sessionsPerWeek >= 5) {
        cohort = 'daily_studiers'
      } else if (weekendRatio > 0.6) {
        cohort = 'weekend_warriors'
      } else {
        cohort = 'cramming'
      }

      cohorts[cohort].userCount += 1
      cohorts[cohort].totalAccuracy += avgAccuracy
      cohorts[cohort].totalSessions += sessions.length
      cohorts[cohort].weeks += weeksActive
    }

    const labels: Record<keyof typeof cohorts, string> = {
      daily_studiers: 'Daily Studiers',
      weekend_warriors: 'Weekend Warriors',
      cramming: 'Cramming',
      dormant: 'Dormant',
    }

    const result: StudyCohort[] = (Object.keys(cohorts) as Array<keyof typeof cohorts>)
      .filter((k) => cohorts[k].userCount > 0)
      .map((k) => ({
        cohortName: labels[k],
        userCount: cohorts[k].userCount,
        avgAccuracy:
          Math.round((cohorts[k].totalAccuracy / cohorts[k].userCount) * 10) / 10,
        avgSessionsPerWeek:
          Math.round(
            (cohorts[k].totalSessions / Math.max(1, cohorts[k].weeks)) * 10,
          ) / 10,
      }))

    return wrapResult(result)
  } catch (err) {
    return wrapError(
      err instanceof Error ? err.message : 'Failed to load study cohort data',
      [],
    )
  }
}
