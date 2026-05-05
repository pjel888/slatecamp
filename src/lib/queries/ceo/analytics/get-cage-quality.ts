'use server'

import { assertCeoAccess } from '@/lib/ceo/access'
import { wrapResult } from '@/lib/actions/analytics/shared-helpers'
import type { AnalyticsResult } from '@/lib/actions/analytics/shared-helpers'

export type CAGEMetric = {
  metric: string
  value: string
  trend: 'up' | 'down' | 'neutral'
}

export const getCAGEQualityData = async (): Promise<AnalyticsResult<CAGEMetric[]>> => {
  await assertCeoAccess()

  // The historical cage_verifications table is not present in the current
  // deployable schema. Return an explicit empty state rather than querying a
  // stale table or synthesizing misleading CEO metrics.
  return wrapResult([])
}
