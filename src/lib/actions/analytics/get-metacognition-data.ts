'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { wrapResult, wrapError, type AnalyticsResult } from '@/lib/actions/analytics/shared-helpers'

export interface MetacognitionPoint {
  predicted_score: number
  actual_score: number
  postdiction_score: number | null
  created_at: string
}

export const getMetacognitionData = async (): Promise<AnalyticsResult<MetacognitionPoint[]>> => {
  try {
    const supabase = await createClient()
    const { data: { user } } = await getUser()
    if (!user) return wrapResult([])

    const { data } = await supabase
      .from('session_predictions')
      .select('predicted_score, actual_score, postdiction_score, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(100)

    return wrapResult(data ?? [])
  } catch (err) {
    console.error('[ANALYTICS] getMetacognitionData failed:', err)
    return wrapError('Failed to load metacognition data', [])
  }
}
