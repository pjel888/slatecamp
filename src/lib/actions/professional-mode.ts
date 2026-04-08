'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient, getUser } from '@/lib/supabase/server'
import { trackServerEvent } from '@/lib/analytics-server'

export type AccountMode = 'review_mode' | 'professional_mode'

export interface ProfessionalModeData {
  accountMode: AccountMode
  leaResult: string | null
  examDate: string | null
  daysSinceExam: number | null
  /** true when exam_date passed ≥3 days ago AND lea_result is set */
  showTransitionPrompt: boolean
  /** true when lea_result = 'failed' AND ≥30 days since exam (opt-in path) */
  showOptInPrompt: boolean
}

/**
 * Fetch all data the Professional Mode hub (and dashboard prompt) need.
 */
export const getProfessionalModeData = async (): Promise<ProfessionalModeData | null> => {
  const { data: { user } } = await getUser()
  if (!user) return null

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_mode, lea_result, target_exam_date')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  const accountMode = (profile.account_mode ?? 'review_mode') as AccountMode
  const leaResult = profile.lea_result ?? null
  const examDateRaw = profile.target_exam_date ?? null
  const examDate = examDateRaw ? new Date(examDateRaw).toISOString() : null

  let daysSinceExam: number | null = null
  if (examDateRaw) {
    const diff = Date.now() - new Date(examDateRaw).getTime()
    daysSinceExam = Math.floor(diff / (24 * 60 * 60 * 1000))
  }

  const examHasPassed = daysSinceExam !== null && daysSinceExam >= 3
  const showTransitionPrompt = examHasPassed && leaResult === 'passed'
  const showOptInPrompt =
    examHasPassed &&
    daysSinceExam !== null &&
    daysSinceExam >= 30 &&
    leaResult === 'failed'

  return {
    accountMode,
    leaResult,
    examDate,
    daysSinceExam,
    showTransitionPrompt,
    showOptInPrompt,
  }
}

/**
 * Switch the user's account mode.
 * profiles PK is `id` (not `user_id`).
 */
export const switchAccountMode = async (
  mode: AccountMode,
): Promise<{ success: boolean; error?: string }> => {
  const { data: { user } } = await getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ account_mode: mode, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) {
    console.error('[professional-mode] switchAccountMode failed:', error)
    return { success: false, error: 'Failed to update account mode.' }
  }

  void trackServerEvent('account_mode_switched', { mode, user_id: user.id })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/professional')
  revalidatePath('/dashboard/settings')

  return { success: true }
}

/**
 * Activate Professional Mode and redirect to the hub.
 * Called from the TransitionPrompt "I passed" CTA.
 */
export const activateProfessionalMode = async (): Promise<void> => {
  await switchAccountMode('professional_mode')
  redirect('/dashboard/professional')
}

/**
 * Stay in review mode for the next cycle (opt-out path).
 * Revalidates dashboard so the prompt is dismissed.
 */
export const stayInReviewMode = async (): Promise<{ success: boolean }> => {
  revalidatePath('/dashboard')
  return { success: true }
}
