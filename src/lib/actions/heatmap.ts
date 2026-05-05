'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getUser } from '@/lib/supabase/server'
import { revalidateDashboardCacheTags } from './cache-tags'
import { ROUTES } from '@/lib/routes'
import type { ActivityDay } from '@/components/dashboard/ActivityHeatmap'

export interface HeatmapData {
  activityDays: ActivityDay[]
  examDates: string[]
  accountCreatedAt: Date
  signupYear: number
  endYear: number
}

export interface SaveHeatmapExamDatesResult {
  success: boolean
  examDates?: string[]
  error?: string
}

const MAX_EXAM_DATES = 14
const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

function normalizeExamDates(dates: string[]): string[] {
  const normalized = new Set<string>()

  for (const rawDate of dates) {
    const date = rawDate.trim()
    if (!ISO_DATE_ONLY.test(date)) {
      throw new Error('Use YYYY-MM-DD exam dates only.')
    }

    const parsed = new Date(`${date}T12:00:00`)
    const roundTrip = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`
    if (Number.isNaN(parsed.getTime()) || roundTrip !== date) {
      throw new Error('One or more exam dates are invalid.')
    }

    normalized.add(date)
  }

  const sorted = Array.from(normalized).sort((a, b) => a.localeCompare(b))
  if (sorted.length > MAX_EXAM_DATES) {
    throw new Error(`Select up to ${MAX_EXAM_DATES} exam dates.`)
  }

  return sorted
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

    const [interactionsResult, statsResult, examPreferencesResult] = await Promise.allSettled([
      supabase
        .from('user_interactions')
        .select('interaction_timestamp')
        .eq('user_id', user.id),

      supabase
        .from('user_global_stats')
        .select('target_exam_date')
        .eq('user_id', user.id)
        .maybeSingle(),

      supabase
        .from('user_exam_date_preferences')
        .select('exam_dates')
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

    let examDates: string[] = []
    if (examPreferencesResult.status === 'fulfilled' && Array.isArray(examPreferencesResult.value.data?.exam_dates)) {
      examDates = normalizeExamDates(examPreferencesResult.value.data.exam_dates as string[])
    }

    if (examDates.length === 0 && statsResult.status === 'fulfilled' && statsResult.value.data?.target_exam_date) {
      examDates = normalizeExamDates([(statsResult.value.data.target_exam_date as string).slice(0, 10)])
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

export async function saveHeatmapExamDates(dates: string[]): Promise<SaveHeatmapExamDatesResult> {
  try {
    const examDates = normalizeExamDates(dates)
    const supabase = await createClient()
    const {
      data: { user },
    } = await getUser()

    if (!user) return { success: false, error: 'Not authenticated.' }

    const { data, error } = await supabase.rpc('save_user_exam_date_preferences', {
      p_exam_dates: examDates,
    })

    if (error) {
      console.error('[HEATMAP: saveHeatmapExamDates]', error)
      return { success: false, error: 'Failed to save exam dates.' }
    }

    revalidateDashboardCacheTags(user.id)
    revalidatePath(ROUTES.dashboard.root, 'layout')

    return { success: true, examDates: Array.isArray(data) ? normalizeExamDates(data as string[]) : examDates }
  } catch (err) {
    console.error('[HEATMAP: saveHeatmapExamDates]', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to save exam dates.',
    }
  }
}
