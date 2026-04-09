'use server'

import { redirect } from 'next/navigation'
import { createClient, getUser } from '@/lib/supabase/server'
import { trackServerEvent } from '@/lib/analytics-server'
import { ROUTES } from '@/lib/routes'

export interface ResultsDayProfile {
  firstName: string | null
  leaResult: string | null
  readinessScore: number | null
  topSubjects: Array<{ name: string; score: number }>
}

export interface BannerEligibility {
  show: boolean
  daysAgo: number | null
}

/**
 * Check if the Results Day banner should show on dashboard.
 * Condition: target_exam_date was 3–14 days ago AND lea_result IS NULL.
 */
export const getResultsDayBannerEligibility = async (): Promise<BannerEligibility> => {
  const { data: { user } } = await getUser()
  if (!user) return { show: false, daysAgo: null }

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('target_exam_date, lea_result')
    .eq('id', user.id)
    .single()

  if (!profile?.target_exam_date || profile.lea_result !== null) {
    return { show: false, daysAgo: null }
  }

  const examDate = new Date(profile.target_exam_date)
  const now = new Date()
  const diffMs = now.getTime() - examDate.getTime()
  const daysAgo = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (daysAgo >= 3 && daysAgo <= 14) {
    return { show: true, daysAgo }
  }

  return { show: false, daysAgo }
}

/**
 * Fetch profile data needed for the Results Day hub page.
 */
export const getResultsDayProfile = async (): Promise<ResultsDayProfile | null> => {
  const { data: { user } } = await getUser()
  if (!user) return null

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, display_name, lea_result')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('global_readiness_score, readiness_sub_scores')
    .eq('user_id', user.id)
    .single()

  const fullName = profile.display_name ?? profile.full_name ?? null
  const firstName = fullName ? fullName.split(' ')[0] : null

  // Pull top 3 subjects from readiness_sub_scores if available
  const subScores = stats?.readiness_sub_scores as Record<string, number> | null
  const topSubjects: Array<{ name: string; score: number }> = subScores
    ? Object.entries(subScores)
        .map(([name, score]) => ({ name, score: Math.round(score) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
    : []

  return {
    firstName,
    leaResult: profile.lea_result,
    readinessScore: stats?.global_readiness_score
      ? Math.round(stats.global_readiness_score)
      : null,
    topSubjects,
  }
}

/**
 * Record that the user passed the LEA.
 * Sets lea_result = 'passed', account_mode = 'alumni'.
 */
export const recordPasserResult = async (): Promise<{ success: boolean; error?: string }> => {
  const { data: { user } } = await getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({
      lea_result: 'passed',
      account_mode: 'professional_mode',
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    console.error('recordPasserResult failed:', error)
    return { success: false, error: 'Failed to save result' }
  }

  void trackServerEvent('results_day_passer_confirmed', { user_id: user.id })

  return { success: true }
}

/**
 * Record that the user did not pass this cycle.
 * Stores 'failed' in DB (schema constraint), never shown in UI.
 * Sets reviewer_type = 'returning_reviewer' for next cycle.
 */
export const recordNonPasserResult = async (): Promise<{ success: boolean; error?: string }> => {
  const { data: { user } } = await getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const supabase = await createClient()

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      lea_result: 'failed',
      reviewer_type: 'returning_reviewer',
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (profileError) {
    console.error('recordNonPasserResult failed:', profileError)
    return { success: false, error: 'Failed to save result' }
  }

  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('exam_attempt_number')
    .eq('user_id', user.id)
    .single()

  await supabase
    .from('user_global_stats')
    .update({
      is_retaker: true,
      previous_exam_result: 'failed',
      exam_attempt_number: stats?.exam_attempt_number
        ? Number(stats.exam_attempt_number) + 1
        : 2,
    })
    .eq('user_id', user.id)

  void trackServerEvent('results_day_non_passer_confirmed', { user_id: user.id })

  return { success: true }
}

/**
 * Banner quick-action: sets result and redirects.
 * Called from the dashboard banner CTAs.
 */
export const bannerConfirmPasser = async (): Promise<void> => {
  await recordPasserResult()
  redirect(ROUTES.dashboard.resultsDay)
}

export const bannerConfirmNonPasser = async (): Promise<void> => {
  await recordNonPasserResult()
  redirect(ROUTES.dashboard.resultsDay)
}
