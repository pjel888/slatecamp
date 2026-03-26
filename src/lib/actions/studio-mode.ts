'use server'

import { createClient, getUser } from '@/lib/supabase/server'

export const activateStudioMode = async (): Promise<{ success: boolean; error?: string }> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()

  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({ account_mode: 'student_mode' })
    .eq('id', user.id)

  if (error) {
    console.error('[STUDIO] activateStudioMode failed:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export const getStudioModeData = async (): Promise<{ userName: string }> => {
  const { data: { user } } = await getUser()

  const firstName =
    user?.user_metadata?.full_name?.split(' ')[0] ??
    user?.email?.split('@')[0] ??
    'there'

  return { userName: firstName }
}
