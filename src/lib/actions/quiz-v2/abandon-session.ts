'use server'

import { createServiceClient, getUser } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { revalidateDashboardCacheTags } from '@/lib/actions/cache-tags'
import { ROUTES } from '@/lib/routes'

/**
 * Marks a quiz session as abandoned.
 */
export const abandonSession = async (sessionId: string) => {
  const { data: { user } } = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createServiceClient()

  const { error } = await supabase
    .from('quiz_sessions')
    .update({
      status: 'abandoned',
      updated_at: new Date().toISOString()
    })
    .eq('session_id', sessionId)
    .eq('user_id', user.id)

  if (error) {
    console.error('[QUIZ-V2] abandonSession failed:', error.message)
    throw error
  }

  revalidateDashboardCacheTags(user.id)
  revalidatePath(ROUTES.dashboard.root)
  revalidatePath(ROUTES.dashboard.quiz)

  return { success: true }
}
