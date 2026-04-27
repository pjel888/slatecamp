'use client'

import { useEffect } from 'react'
import { getDashboardSyncPayload } from '@/lib/actions/dashboard-page'
import { syncDashboardNotifications } from '@/lib/actions/sync-notifications'
import { trackEvent } from '@/lib/analytics'

/**
 * Client component to handle fire-and-forget side effects for the dashboard.
 * Fetches only the minimal sync payload instead of the full dashboard aggregate.
 */
export function DashboardAnalyticsSync() {
  useEffect(() => {
    const sync = async () => {
      try {
        const data = await getDashboardSyncPayload()
        
        // Track analytics
        trackEvent({
          event_name: 'app_opened',
          event_properties: {
            current_score: data.readinessScore || undefined,
            days_to_exam: data.daysUntilExam ?? undefined,
          }
        })

        // Sync notifications
        await syncDashboardNotifications({
          activeTrailDay: data.activeTrailDay,
          srsReview: data.srsReview,
          subjectFloorAlerts: data.subjectFloorAlerts,
        })
      } catch (err) {
        console.error('[DashboardAnalyticsSync] Error:', err)
      }
    }

    void sync()
  }, [])

  return null
}
