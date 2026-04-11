'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { revalidateDashboardCacheTags } from './cache-tags'
import { ROUTES } from '@/lib/routes'

export type StudyWindow = 'morning' | 'evening' | 'both' | 'any'
export type ReviewerType = 'first_taker' | 'returning_reviewer'

interface ProfileData {
  avatar_url: string | null
  display_name: string | null
  discipline_id: string | null
  enrolled_review_center: string | null
  onboarding_completed_at: string | null
  preferred_study_window: StudyWindow | null
  reviewer_type: string | null
  target_exam_date: string | null
}

export interface CompleteOnboardingResult {
  success: boolean
  fieldErrors?: Partial<Record<'disciplineId' | 'reviewerType', string>>
  formError?: string
}

export const saveStudyWindow = async (window: StudyWindow) => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('profiles')
    .update({ preferred_study_window: window })
    .eq('id', user.id)

  if (error) {
    // Column may not exist yet — silently fail
    console.warn('[profile] Could not save study window:', error.message)
    return { success: false }
  }
  return { success: true }
}

export const getStudyWindow = async (): Promise<StudyWindow> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return 'any'

  const { data } = await supabase
    .from('profiles')
    .select('preferred_study_window')
    .eq('id', user.id)
    .single()

  return (data?.preferred_study_window as StudyWindow) ?? 'any'
}

export const getProfileData = async () => {
  try {
    const supabase = await createClient()
    const { data: { user } } = await getUser()
    if (!user) return null

    const { data } = await supabase
      .from('profiles')
      .select('display_name, avatar_url, target_exam_date, discipline_id, reviewer_type, preferred_study_window, enrolled_review_center, onboarding_completed_at')
      .eq('id', user.id)
      .single()

    return (data as ProfileData | null) ?? null
  } catch (err) {
    console.error('[PROFILE: getProfileData]', err)
    return null
  }
}

const isReviewerType = (value: string | null): value is ReviewerType => {
  return value === 'first_taker' || value === 'returning_reviewer'
}

export const completeOnboardingSetup = async (
  formData: FormData,
): Promise<CompleteOnboardingResult> => {
  try {
    const supabase = await createClient()
    const { data: { user } } = await getUser()
    if (!user) return { success: false, formError: 'Not authenticated.' }

    const disciplineId = formData.get('disciplineId') as string | null
    const reviewerTypeRaw = formData.get('reviewerType') as string | null
    const examDate = (formData.get('examDate') as string | null) || null
    const studyWindowRaw = (formData.get('studyWindow') as string | null) || 'any'
    const reviewCenter = (formData.get('enrolledReviewCenter') as string | null) || 'none'
    const reviewCenterOther = (formData.get('enrolledReviewCenterOther') as string | null)?.trim() || ''
    const rawStruggled = formData.get('struggledSubjects') as string | null

    const fieldErrors: CompleteOnboardingResult['fieldErrors'] = {}
    if (!disciplineId) {
      fieldErrors.disciplineId = 'Select a discipline before finishing setup.'
    }

    if (!isReviewerType(reviewerTypeRaw)) {
      fieldErrors.reviewerType = 'Choose the LEA path that fits you.'
    }

    if (fieldErrors && Object.keys(fieldErrors).length > 0) {
      return { success: false, fieldErrors }
    }

    const reviewerType = reviewerTypeRaw as ReviewerType
    const preferredStudyWindow: StudyWindow =
      studyWindowRaw === 'morning' ||
      studyWindowRaw === 'evening' ||
      studyWindowRaw === 'both' ||
      studyWindowRaw === 'any'
        ? studyWindowRaw
        : 'any'

    const enrolledReviewCenter =
      reviewCenter === 'other' && reviewCenterOther ? reviewCenterOther : reviewCenter

    const timestamp = new Date().toISOString()

    const profileUpdates: Record<string, unknown> = {
      discipline_id: disciplineId,
      reviewer_type: reviewerType,
      preferred_study_window: preferredStudyWindow,
      target_exam_date: examDate,
      enrolled_review_center: enrolledReviewCenter,
      onboarding_completed_at: timestamp,
    }

    if (rawStruggled) {
      try {
        const parsed = JSON.parse(rawStruggled)
        if (Array.isArray(parsed)) {
          const struggledSubjects = parsed.filter((value): value is string => typeof value === 'string')
          if (struggledSubjects.length > 0) {
            profileUpdates.previous_exam_subjects_struggled = struggledSubjects
          }
        }
      } catch {
        // Optional payload only.
      }
    }

    const statsUpdates: Record<string, unknown> = {
      current_discipline_id: disciplineId,
      target_exam_date: examDate,
      exam_attempt_number: reviewerType === 'returning_reviewer' ? 2 : 1,
      previous_exam_result: reviewerType === 'returning_reviewer' ? 'failed' : null,
      onboarding_completed_at: timestamp,
    }

    const [
      { error: profileError },
      { error: statsError },
    ] = await Promise.all([
      supabase
        .from('profiles')
        .upsert({ id: user.id, ...profileUpdates }, { onConflict: 'id' }),
      supabase
        .from('user_global_stats')
        .upsert({ user_id: user.id, ...statsUpdates }, { onConflict: 'user_id' }),
    ])

    if (profileError || statsError) {
      console.error('[PROFILE: completeOnboardingSetup]', {
        profileError,
        statsError,
      })
      return {
        success: false,
        formError: 'We could not finish setup right now. Your existing settings are still intact. Try again.',
      }
    }

    revalidateDashboardCacheTags(user.id)
    revalidatePath(ROUTES.dashboard.root, 'layout')
    revalidatePath(ROUTES.dashboard.settings)

    return { success: true }
  } catch (err) {
    console.error('[PROFILE: completeOnboardingSetup]', err)
    return {
      success: false,
      formError: 'We could not finish setup right now. Try again.',
    }
  }
}

export const updateProfile = async (formData: FormData) => {
  try {
    const supabase = await createClient()
    const { data: { user } } = await getUser()
    if (!user) return { error: 'Not authenticated' }

    const displayName = formData.get('displayName') as string
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('id', user.id)

    if (error) throw error
    revalidatePath(ROUTES.dashboard.settings)
    return { success: true }
  } catch (err) {
    console.error('[PROFILE: updateProfile]', err)
    return { error: 'Failed to update profile.' }
  }
}

export const updateExamDate = async (formData: FormData) => {
  try {
    const supabase = await createClient()
    const { data: { user } } = await getUser()
    if (!user) return { error: 'Not authenticated' }

    const examDate = formData.get('examDate') as string | null
    const [
      { error: profileError },
      { error: statsError },
    ] = await Promise.all([
      supabase
        .from('profiles')
        .update({ target_exam_date: examDate || null })
        .eq('id', user.id),
      supabase
        .from('user_global_stats')
        .update({ target_exam_date: examDate || null })
        .eq('user_id', user.id),
    ])

    if (profileError || statsError) throw profileError ?? statsError
    revalidateDashboardCacheTags(user.id)
    revalidatePath(ROUTES.dashboard.root, 'layout')
    revalidatePath(ROUTES.dashboard.settings)
    return { success: true }
  } catch (err) {
    console.error('[PROFILE: updateExamDate]', err)
    return { error: 'Failed to update exam date.' }
  }
}

export const uploadAvatar = async (formData: FormData) => {
  try {
    const supabase = await createClient()
    const { data: { user } } = await getUser()
    if (!user) return { error: 'Not authenticated' }

    const file = formData.get('avatar') as File | null
    if (!file || file.size === 0) return { error: 'No file provided.' }

    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(path)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id)

    if (updateError) throw updateError

    revalidateDashboardCacheTags(user.id)
    revalidatePath(ROUTES.dashboard.settings)
    return { success: true, avatarUrl: publicUrl }
  } catch (err) {
    console.error('[PROFILE: uploadAvatar]', err)
    return { error: 'Failed to upload avatar.' }
  }
}
