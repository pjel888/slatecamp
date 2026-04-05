'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { revalidateDashboardCacheTags } from './cache-tags'

export type StudyWindow = 'morning' | 'evening' | 'both' | 'any'

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
      .select('display_name, avatar_url, target_exam_date')
      .eq('id', user.id)
      .single()

    return data ?? null
  } catch (err) {
    console.error('[PROFILE: getProfileData]', err)
    return null
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
    revalidatePath('/dashboard/settings')
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
    const { error } = await supabase
      .from('profiles')
      .update({ target_exam_date: examDate || null })
      .eq('id', user.id)

    if (error) throw error
    revalidatePath('/dashboard/settings')
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
    revalidatePath('/dashboard/settings')
    return { success: true, avatarUrl: publicUrl }
  } catch (err) {
    console.error('[PROFILE: uploadAvatar]', err)
    return { error: 'Failed to upload avatar.' }
  }
}

