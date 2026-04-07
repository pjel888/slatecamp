'use server'

import { createClient } from '@/lib/supabase/server'
import { FEATURE_PAYMENTS_ENABLED } from '@/lib/constants/feature-flags'
import type { UserTier } from '@/types/app'

const FREE_DAILY_CAP = 20

interface DailyCapResult {
  allowed: boolean
  remaining: number
  cap: number
  resetsAt: string // ISO date string for the next reset
}

/**
 * Check if a free user has questions remaining today.
 * Paid users always return allowed: true.
 * Call BEFORE creating a quiz session for free users.
 */
export const checkDailyCap = async (userId: string): Promise<DailyCapResult> => {
  if (!FEATURE_PAYMENTS_ENABLED) {
    return { allowed: true, remaining: 999999, cap: 999999, resetsAt: '' }
  }

  const supabase = await createClient()

  // Check if user is on a paid tier
  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('tier, status')
    .eq('user_id', userId)
    .maybeSingle()

  const isPaid =
    (sub?.status === 'active' || sub?.status === 'trialing') &&
    sub?.tier !== 'free'

  if (isPaid) {
    return { allowed: true, remaining: Infinity, cap: Infinity, resetsAt: '' }
  }

  // Get current count from user_global_stats
  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('free_questions_today, free_questions_reset_date')
    .eq('user_id', userId)
    .single()

  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  let questionsToday = stats?.free_questions_today ?? 0
  const resetDate = stats?.free_questions_reset_date

  // Reset if it's a new day
  if (resetDate !== today) {
    questionsToday = 0
    await supabase
      .from('user_global_stats')
      .update({ free_questions_today: 0, free_questions_reset_date: today })
      .eq('user_id', userId)
  }

  const remaining = Math.max(0, FREE_DAILY_CAP - questionsToday)
  const tomorrow = new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000)

  return {
    allowed: remaining > 0,
    remaining,
    cap: FREE_DAILY_CAP,
    resetsAt: tomorrow.toISOString(),
  }
}

/**
 * Increment the daily question counter.
 * Call AFTER each question is answered (in the saveInteraction Server Action).
 * Only increments for free users.
 */
export const incrementDailyCount = async (userId: string, count: number = 1): Promise<void> => {
  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data: stats } = await supabase
      .from('user_global_stats')
      .select('free_questions_today, free_questions_reset_date')
      .eq('user_id', userId)
      .single()

    const resetDate = stats?.free_questions_reset_date
    const currentCount = resetDate === today ? (stats?.free_questions_today ?? 0) : 0

    await supabase
      .from('user_global_stats')
      .update({
        free_questions_today: currentCount + count,
        free_questions_reset_date: today,
      })
      .eq('user_id', userId)
  } catch {
    // Silent — cap enforcement must not break the quiz
  }
}
