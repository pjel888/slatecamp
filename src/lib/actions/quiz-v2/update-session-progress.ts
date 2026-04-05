'use server'

import { createClient, getUser } from '@/lib/supabase/server'

export const updateSessionProgress = async (
  sessionId: string,
  currentQuestionIndex: number,
): Promise<void> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('quiz_sessions')
    .update({
      current_question_index: Math.max(0, Math.floor(currentQuestionIndex)),
      updated_at: new Date().toISOString(),
    })
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .eq('status', 'in_progress')

  if (error) throw error
}
