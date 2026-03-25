/**
 * Adaptive quiz read queries — NOT server actions.
 * These are plain async functions safe to call from server components
 * without the 'use server' serialization boundary.
 */

import { createClient } from '@/lib/supabase/server'

export interface QueryResult<T> {
  data: T | null
  error: string | null
}

export interface NextQuestion {
  question_id: string
  irt_difficulty: number
  irt_discrimination: number
  irt_guessing: number
  fisher_information: number
}

export interface UserTheta {
  theta: number
  theta_se: number
  responses_count: number
}

// ============================================================
// Next Question Selection
// ============================================================

export const fetchNextQuestion = async (params: {
  userId: string
  sessionId: string
  disciplineId: string
  topicId?: string
  targetP?: number
}): Promise<QueryResult<NextQuestion>> => {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('select_next_item', {
      p_user_id: params.userId,
      p_session_id: params.sessionId,
      p_discipline_id: params.disciplineId,
      p_topic_id: params.topicId ?? null,
      p_target_p: params.targetP ?? 0.75,
    })

    if (error) return { data: null, error: error.message }
    const rows = data as NextQuestion[]
    return { data: rows?.[0] ?? null, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// ============================================================
// User Theta
// ============================================================

export const fetchUserTheta = async (
  userId: string,
  disciplineId: string,
): Promise<QueryResult<UserTheta>> => {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('user_theta')
      .select('theta, theta_se, responses_count')
      .eq('user_id', userId)
      .eq('discipline_id', disciplineId)
      .maybeSingle()

    if (error) return { data: null, error: error.message }
    if (!data) return { data: { theta: 0.0, theta_se: 1.0, responses_count: 0 }, error: null }
    return { data: data as UserTheta, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
