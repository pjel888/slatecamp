'use server'

import { createClient, getUser } from '@/lib/supabase/server'

export const pauseSession = async (
  sessionId: string,
): Promise<{ success: boolean }> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: session, error: fetchError } = await supabase
    .from('quiz_sessions')
    .select('session_id, status, config')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !session) throw new Error('Session not found')
  if (session.status !== 'in_progress') throw new Error('Session is not in progress')

  // Check that the mode config allows pausing
  const config = session.config as { timer?: { pausable?: boolean } } | null
  if (config?.timer?.pausable === false) {
    throw new Error('This session mode does not allow pausing')
  }

  const { error } = await supabase
    .from('quiz_sessions')
    .update({
      status: 'in_progress', // DB enum has no 'paused' value — track pause state in config JSONB
      config: {
        ...(session.config as object),
        _pausedAt: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    })
    .eq('session_id', sessionId)
    .eq('user_id', user.id)

  if (error) throw error

  return { success: true }
}

export const resumeSession = async (
  sessionId: string,
): Promise<{ success: boolean; pausedDurationMs: number }> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: session, error: fetchError } = await supabase
    .from('quiz_sessions')
    .select('session_id, status, config')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !session) throw new Error('Session not found')

  const config = session.config as { _pausedAt?: string } | null
  const pausedAt = config?._pausedAt
  const pausedDurationMs = pausedAt
    ? Date.now() - new Date(pausedAt).getTime()
    : 0

  // Clear _pausedAt from config on resume
  const { _pausedAt: _removed, ...restConfig } = (session.config as Record<string, unknown> & { _pausedAt?: string })

  const { error } = await supabase
    .from('quiz_sessions')
    .update({
      status: 'in_progress',
      config: restConfig,
      updated_at: new Date().toISOString(),
    })
    .eq('session_id', sessionId)
    .eq('user_id', user.id)

  if (error) throw error

  return { success: true, pausedDurationMs }
}
