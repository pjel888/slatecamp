'use server'

import { createClient, getUser } from '@/lib/supabase/server'

/**
 * Save a pre-session prediction score.
 * Called from PredictionSlider before session begins.
 */
export const savePrediction = async (
  sessionId: string,
  predictionScore: number,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // Clamp to 0–100
  const clamped = Math.max(0, Math.min(100, Math.round(predictionScore)))

  const { error } = await supabase.from('session_predictions').insert({
    user_id: user.id,
    session_id: sessionId,
    prediction_score: clamped,
    prediction_at: new Date().toISOString(),
  })

  if (error) {
    console.error('[savePrediction] Insert failed:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
