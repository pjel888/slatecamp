'use server'

import { getUser } from '@/lib/supabase/server'
import { createCachedClient, wrapResult, wrapError, type AnalyticsResult } from '@/lib/actions/analytics/shared-helpers'

export interface ModeFunnelWeek {
  week: string
  [mode: string]: string | number
}

export const getModeFunnelData = async (): Promise<AnalyticsResult<ModeFunnelWeek[]>> => {
  try {
    const supabase = await createCachedClient()
    const { data: { user } } = await getUser()
    if (!user) return wrapResult([])

    const { data } = await supabase
      .from('quiz_sessions')
      .select('test_mode, started_at')
      .eq('user_id', user.id)
      .not('started_at', 'is', null)
      .order('started_at', { ascending: true })
      .limit(1000)

    if (!data || data.length === 0) return wrapResult([])

    const weekMap = new Map<string, Map<string, number>>()

    for (const row of data) {
      const date = new Date(row.started_at)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekKey = weekStart.toISOString().slice(0, 10)
      const mode = row.test_mode ?? 'unknown'

      if (!weekMap.has(weekKey)) weekMap.set(weekKey, new Map())
      const modeMap = weekMap.get(weekKey)!
      modeMap.set(mode, (modeMap.get(mode) ?? 0) + 1)
    }

    const allModes = new Set<string>()
    for (const modeMap of weekMap.values()) {
      for (const mode of modeMap.keys()) allModes.add(mode)
    }

    const result: ModeFunnelWeek[] = []
    for (const [week, modeMap] of weekMap.entries()) {
      const entry: ModeFunnelWeek = { week }
      for (const mode of allModes) {
        entry[mode] = modeMap.get(mode) ?? 0
      }
      result.push(entry)
    }

    return wrapResult(result)
  } catch (err) {
    console.error('[ANALYTICS] getModeFunnelData failed:', err)
    return wrapError('Failed to load mode funnel data', [])
  }
}
