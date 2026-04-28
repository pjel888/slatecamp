'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getUser } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/routes'

export const skipQuestion = async (input: {
  sessionId: string
  questionId: string
}): Promise<{ success: boolean }> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) throw new Error('Unauthorized')

  const { sessionId, questionId } = input

  // Validate session ownership and active status — no DB write needed for a skip
  const { data: session, error } = await supabase
    .from('quiz_sessions')
    .select('session_id, status')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (error || !session) throw new Error('Session not found')
  if (session.status !== 'in_progress') throw new Error('Session is not in progress')

  revalidatePath(ROUTES.dashboard.root)

  // Intentionally does NOT insert into user_interactions.
  // Skips have zero mastery impact and are tracked only client-side.
  void questionId // acknowledged — no analytics write

  return { success: true }
}
