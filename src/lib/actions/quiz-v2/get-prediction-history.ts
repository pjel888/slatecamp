'use server'

import { createClient, getUser } from '@/lib/supabase/server'

export interface PredictionHistoryEntry {
  sessionId: string
  predictionScore: number
  postdictionScore: number | null
  actualScore: number | null
  predictionAt: string
  postdictionAt: string | null
}

/**
 * Fetch the user's last 10 prediction entries (most recent first)
 * for trend display on the PredictionComparison card.
 */
export const getPredictionHistory = async (): Promise<PredictionHistoryEntry[]> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('session_predictions')
    .select('session_id, prediction_score, postdiction_score, actual_score, prediction_at, postdiction_at')
    .eq('user_id', user.id)
    .not('actual_score', 'is', null)
    .order('prediction_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('[getPredictionHistory] Query failed:', error)
    return []
  }

  return (data ?? []).map((row) => ({
    sessionId: row.session_id,
    predictionScore: row.prediction_score,
    postdictionScore: row.postdiction_score,
    actualScore: row.actual_score,
    predictionAt: row.prediction_at,
    postdictionAt: row.postdiction_at,
  }))
}
