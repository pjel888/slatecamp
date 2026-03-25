'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import type { ActivityDay } from '@/components/dashboard/ActivityHeatmap'

export interface HeatmapData {
  activityDays: ActivityDay[]
  examDates: string[]
  accountCreatedAt: Date
  signupYear: number
  endYear: number
}

export async function getHeatmapData(): Promise<HeatmapData> {
  const now = new Date()
  const currentYear = now.getFullYear()
  const emptyResult: HeatmapData = {
    activityDays: [],
    examDates: [],
    accountCreatedAt: now,
    signupYear: currentYear,
    endYear: currentYear,
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await getUser()

    if (!user) return emptyResult

    const accountCreatedAt = user.created_at ? new Date(user.created_at) : now
    const signupYear = accountCreatedAt.getFullYear()

    const [interactionsResult, statsResult] = await Promise.allSettled([
      supabase
        .from('user_interactions')
        .select('interaction_timestamp')
        .eq('user_id', user.id),

      supabase
        .from('user_global_stats')
        .select('target_exam_date')
        .eq('user_id', user.id)
        .maybeSingle(),
    ])

    // Group interactions by date in JS (PostgREST has no GROUP BY)
    const activityDays: ActivityDay[] = []
    if (interactionsResult.status === 'fulfilled' && interactionsResult.value.data) {
      const countMap = new Map<string, number>()
      for (const row of interactionsResult.value.data as Array<{ interaction_timestamp: string }>) {
        const date = row.interaction_timestamp?.split('T')[0]
        if (date) countMap.set(date, (countMap.get(date) ?? 0) + 1)
      }
      for (const [date, count] of countMap) {
        activityDays.push({ date, count })
      }
    }

    const examDates: string[] = []
    if (statsResult.status === 'fulfilled' && statsResult.value.data?.target_exam_date) {
      examDates.push(statsResult.value.data.target_exam_date as string)
    }

    return {
      activityDays,
      examDates,
      accountCreatedAt,
      signupYear,
      endYear: Math.max(currentYear, signupYear),
    }
  } catch (err) {
    console.error('[HEATMAP: getHeatmapData]', err)
    return emptyResult
  }
}
