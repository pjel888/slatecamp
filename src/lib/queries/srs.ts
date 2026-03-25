/**
 * SRS read queries — NOT server actions.
 * These are plain async functions safe to call from server components
 * without the 'use server' serialization boundary.
 */

import { createClient } from '@/lib/supabase/server'

export interface QueryResult<T> {
  data: T | null
  error: string | null
}

export interface SrsCard {
  id: string
  node_id: string
  ease_factor: number
  interval_days: number
  repetitions: number
  quality_last: number | null
  next_review_at: string
  last_reviewed_at: string | null
  overdue_days: number
}

// ============================================================
// Review Due Count
// ============================================================

export const fetchReviewDueCount = async (userId: string): Promise<QueryResult<number>> => {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_review_due_count', {
      p_user_id: userId,
    })

    if (error) return { data: null, error: error.message }
    return { data: data as number, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// ============================================================
// Review Deck
// ============================================================

export const fetchReviewDeck = async (
  userId: string,
  limit = 20,
): Promise<QueryResult<SrsCard[]>> => {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_review_deck', {
      p_user_id: userId,
      p_limit: limit,
    })

    if (error) return { data: null, error: error.message }
    return { data: (data || []) as SrsCard[], error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
