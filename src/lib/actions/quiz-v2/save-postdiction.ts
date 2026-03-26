'use server'

import { createClient, getUser } from '@/lib/supabase/server'

/**
 * Save a post-session postdiction score and the actual result.
 * Called from PostdictionPrompt before revealing the score on the results page.
 */
export const savePostdiction = async (
  sessionId: string,
  postdictionScore: number,
  actualScore: number,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const clampedPostdiction = Math.max(0, Math.min(100, Math.round(postdictionScore)))
  const clampedActual = Math.max(0, Math.min(100, Math.round(actualScore)))

  const { error } = await supabase
    .from('session_predictions')
    .update({
      postdiction_score: clampedPostdiction,
      actual_score: clampedActual,
      postdiction_at: new Date().toISOString(),
    })
    .eq('session_id', sessionId)
    .eq('user_id', user.id)

  if (error) {
    console.error('[savePostdiction] Update failed:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
