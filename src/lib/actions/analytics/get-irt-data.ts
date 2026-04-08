'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { wrapResult, wrapError, type AnalyticsResult } from '@/lib/actions/analytics/shared-helpers'

export interface IRTDataPoint {
  theta: number
  theta_se: number
  responses_count: number
  updated_at: string
}

export const getIRTTrajectoryData = async (): Promise<AnalyticsResult<IRTDataPoint[]>> => {
  try {
    const supabase = await createClient()
    const { data: { user } } = await getUser()
    if (!user) return wrapResult([])

    const { data } = await supabase
      .from('user_theta')
      .select('theta, theta_se, responses_count, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: true })
      .limit(50)

    return wrapResult(data ?? [])
  } catch (err) {
    console.error('[ANALYTICS] getIRTTrajectoryData failed:', err)
    return wrapError('Failed to load IRT trajectory data', [])
  }
}
