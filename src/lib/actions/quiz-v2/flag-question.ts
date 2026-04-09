'use server'

import { revalidateTag, revalidatePath } from 'next/cache'
import { createClient, getUser } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/routes'

export const flagQuestion = async (input: {
  sessionId: string
  questionId: string
  isFlagged: boolean
}): Promise<{ success: boolean }> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) throw new Error('Unauthorized')

  const { sessionId, questionId, isFlagged } = input

  // Update is_flagged on the interaction row if it exists.
  // If no interaction row yet (question not yet answered), this is a no-op —
  // the flag state is tracked client-side until the answer is submitted.
  const { error } = await supabase
    .from('user_interactions')
    .update({
      is_flagged: isFlagged,
      updated_at: new Date().toISOString(),
    })
    .eq('session_id', sessionId)
    .eq('question_id', questionId)
    .eq('user_id', user.id)

  if (error) {
    // Non-fatal — flag state is cosmetic, never blocks quiz progression
    console.warn('[quiz-v2/flagQuestion] Could not update flag:', error.message)
    return { success: false }
  }

  revalidatePath('/dashboard')

  return { success: true }
}
