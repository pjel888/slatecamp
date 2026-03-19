'use server'

import { createClient, getUser } from '@/lib/supabase/server'

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
