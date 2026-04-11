'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateDashboardCacheTags } from './cache-tags'
import { getViewerEntitlements } from '@/lib/entitlements/get-viewer-entitlements'
import { ENTITLEMENT_FEATURE_KEYS } from '@/lib/entitlements/feature-keys'

const toUtcDateString = (date: Date): string =>
  date.toISOString().slice(0, 10)

const todayUtc = (): string =>
  toUtcDateString(new Date())

const yesterdayUtc = (): string => {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - 1)
  return toUtcDateString(d)
}

const twoDaysAgoUtc = (): string => {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - 2)
  return toUtcDateString(d)
}

const currentIsoWeekMonday = (): string => {
  const now = new Date()
  const day = now.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setUTCDate(now.getUTCDate() + diff)
  monday.setUTCHours(0, 0, 0, 0)
  return toUtcDateString(monday)
}

export const updateStreak = async (userId: string): Promise<void> => {
  const supabase = await createClient()

  const { data: stats, error: statsError } = await supabase
    .from('user_global_stats')
    .select('global_current_streak, global_longest_streak, last_study_date')
    .eq('user_id', userId)
    .single()

  if (statsError) {
    console.error('[streak/updateStreak] failed to fetch user_global_stats', {
      userId,
      error: statsError.message,
    })
    return
  }

  const today = todayUtc()
  const yesterday = yesterdayUtc()
  const twoDaysAgo = twoDaysAgoUtc()
  const lastStudyDate: string | null = stats?.last_study_date ?? null
  const currentStreak: number = stats?.global_current_streak ?? 0
  const longestStreak: number = stats?.global_longest_streak ?? 0

  if (lastStudyDate === today) {
    return
  }

  let newStreak: number
  let newLastStudyDate: string = today

  if (lastStudyDate === yesterday) {
    newStreak = currentStreak + 1
  } else if (lastStudyDate === twoDaysAgo) {
    const { eligible } = await checkGraceDayEligibility(userId)
    if (eligible) {
      newStreak = currentStreak + 1
    } else {
      newStreak = 1
    }
  } else {
    newStreak = 1
  }

  const newLongest = Math.max(longestStreak, newStreak)

  const { error: updateError } = await supabase
    .from('user_global_stats')
    .update({
      global_current_streak: newStreak,
      global_longest_streak: newLongest,
      last_study_date: newLastStudyDate,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (updateError) {
    console.error('[streak/updateStreak] failed to update user_global_stats', {
      userId,
      error: updateError.message,
    })
    return
  }

  const { data: enrollment, error: enrollmentError } = await supabase
    .from('user_trail_enrollments')
    .select('enrollment_id, current_streak, longest_streak')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('last_activity_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (enrollmentError) {
    console.error('[streak/updateStreak] failed to fetch active enrollment', {
      userId,
      error: enrollmentError.message,
    })
    return
  }

  if (enrollment) {
    const enrollmentLongestStreak: number = enrollment.longest_streak ?? 0
    const newEnrollmentStreak = newStreak
    const newEnrollmentLongest = Math.max(enrollmentLongestStreak, newEnrollmentStreak)

    const { error: enrollmentUpdateError } = await supabase
      .from('user_trail_enrollments')
      .update({
        current_streak: newEnrollmentStreak,
        longest_streak: newEnrollmentLongest,
        updated_at: new Date().toISOString(),
      })
      .eq('enrollment_id', enrollment.enrollment_id)

    if (enrollmentUpdateError) {
      console.error('[streak/updateStreak] failed to update enrollment streak', {
        userId,
        enrollmentId: enrollment.enrollment_id,
        error: enrollmentUpdateError.message,
      })
    }
  }

  revalidateDashboardCacheTags(userId)
}

export type StreakStatus = 'active' | 'at_risk' | 'broken'

export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastStudyDate: string | null
  streakStatus: StreakStatus
}

export const getStreakData = async (userId: string): Promise<StreakData> => {
  const supabase = await createClient()

  const { data: stats, error } = await supabase
    .from('user_global_stats')
    .select('global_current_streak, global_longest_streak, last_study_date')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('[streak/getStreakData] failed to fetch user_global_stats', {
      userId,
      error: error.message,
    })
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: null,
      streakStatus: 'broken',
    }
  }

  const today = todayUtc()
  const yesterday = yesterdayUtc()
  const lastStudyDate: string | null = stats?.last_study_date ?? null

  let streakStatus: StreakStatus
  if (lastStudyDate === today) {
    streakStatus = 'active'
  } else if (lastStudyDate === yesterday) {
    streakStatus = 'at_risk'
  } else {
    streakStatus = 'broken'
  }

  return {
    currentStreak: stats?.global_current_streak ?? 0,
    longestStreak: stats?.global_longest_streak ?? 0,
    lastStudyDate,
    streakStatus,
  }
}

export interface GraceDayEligibility {
  eligible: boolean
  graceDaysUsed: number
  maxGraceDays: number
}

export const checkGraceDayEligibility = async (userId: string): Promise<GraceDayEligibility> => {
  const supabase = await createClient()
  const entitlements = await getViewerEntitlements([
    ENTITLEMENT_FEATURE_KEYS.questionsUnlimited,
  ])
  const isPaid =
    entitlements.decisions[ENTITLEMENT_FEATURE_KEYS.questionsUnlimited]?.allowed ?? false

  const maxGraceDays = isPaid ? 2 : 1
  const weekMonday = currentIsoWeekMonday()

  const { data: sessions } = await supabase
    .from('quiz_sessions')
    .select('completed_at')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('completed_at', `${weekMonday}T00:00:00.000Z`)

  const studiedDatesThisWeek = new Set<string>()
  for (const session of sessions ?? []) {
    if (session.completed_at) {
      studiedDatesThisWeek.add(toUtcDateString(new Date(session.completed_at)))
    }
  }

  const today = todayUtc()
  const yesterday = yesterdayUtc()
  const twoDaysAgo = twoDaysAgoUtc()

  const calendarDaysThisWeek: string[] = []
  const monday = new Date(`${weekMonday}T00:00:00.000Z`)
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setUTCDate(monday.getUTCDate() + i)
    const dateStr = toUtcDateString(d)
    if (dateStr <= today) {
      calendarDaysThisWeek.push(dateStr)
    }
  }

  let graceDaysUsed = 0
  for (const dateStr of calendarDaysThisWeek) {
    if (dateStr === today || dateStr === yesterday) continue
    if (!studiedDatesThisWeek.has(dateStr)) {
      graceDaysUsed++
    }
  }

  const isGraceScenario =
    !studiedDatesThisWeek.has(yesterday) && studiedDatesThisWeek.has(twoDaysAgo)

  if (!isGraceScenario) {
    return { eligible: false, graceDaysUsed, maxGraceDays }
  }

  return {
    eligible: graceDaysUsed < maxGraceDays,
    graceDaysUsed,
    maxGraceDays,
  }
}
