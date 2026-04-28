'use server'

import { createClient } from '@/lib/supabase/server'
import { assertCeoAccess } from '@/lib/ceo/access'
import { wrapResult, wrapError } from '@/lib/actions/analytics/shared-helpers'
import type { AnalyticsResult } from '@/lib/actions/analytics/shared-helpers'

export type PassRateBucket = {
  scoreRange: string
  userCount: number
  estimatedPassRate: number
}

export const getPassRateData = async (): Promise<AnalyticsResult<PassRateBucket[]>> => {
  await assertCeoAccess()

  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('user_global_stats')
      .select('global_readiness_score')

    if (error) throw new Error(error.message)

    const rows = (data ?? []) as Array<{ global_readiness_score: number | null }>

    if (rows.length === 0) return wrapResult([])

    const buckets = [
      { label: '0–20', min: 0, max: 0.2 },
      { label: '20–40', min: 0.2, max: 0.4 },
      { label: '40–60', min: 0.4, max: 0.6 },
      { label: '60–80', min: 0.6, max: 0.8 },
      { label: '80–100', min: 0.8, max: 1.01 },
    ]

    const result: PassRateBucket[] = buckets.map(({ label, min, max }) => {
      const usersInBucket = rows.filter((r) => {
        const s = r.global_readiness_score ?? 0
        return s >= min && s < max
      })
      const passCount = usersInBucket.filter(
        (r) => (r.global_readiness_score ?? 0) >= 0.75,
      ).length
      const estimatedPassRate =
        usersInBucket.length === 0
          ? 0
          : Math.round((passCount / usersInBucket.length) * 1000) / 10

      return {
        scoreRange: label,
        userCount: usersInBucket.length,
        estimatedPassRate,
      }
    })

    return wrapResult(result)
  } catch (err) {
    return wrapError(
      err instanceof Error ? err.message : 'Failed to load pass rate data',
      [],
    )
  }
}
