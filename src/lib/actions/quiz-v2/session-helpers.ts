import type { SessionStatus } from '@/types/quiz-config'

export const TERMINAL_SESSION_STATUSES = new Set<SessionStatus>([
  'completed',
  'abandoned',
  'auto_submitted',
])

export const isTerminalSessionStatus = (status: SessionStatus | null | undefined) =>
  status != null && TERMINAL_SESSION_STATUSES.has(status)

export const getOwnedSessionOrThrow = async <T>(
  supabase: any,
  userId: string,
  sessionId: string,
  select: string,
): Promise<T> => {
  const { data, error } = await supabase
    .from('quiz_sessions')
    .select(select)
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) {
    throw new Error('Session not found')
  }

  return data as T
}
