'use server'

import { createClient } from '@/lib/supabase/server'
import type { DashboardPageData } from '@/types/dashboard'
import type { NotificationType } from '@/types/notifications'
import { ROUTES } from '@/lib/routes'

/**
 * Syncs dashboard signals into the notification system.
 * Called on dashboard page load. Creates notifications for active signals
 * that haven't been notified today (deduped by type + day).
 *
 * Signals mapped:
 *  - Active trail day  → trail_ready
 *  - SRS items due     → content_update
 *  - Subject floor     → focus_review
 */
export const syncDashboardNotifications = async (
  data: Pick<DashboardPageData, 'activeTrailDay' | 'srsReview' | 'subjectFloorAlerts'>
) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const userId = user.id
  // Use UTC for "today" boundary — aligned with DB timezone handling
  const todayISO = new Date().toISOString().split('T')[0] + 'T00:00:00.000Z'

  // Batch existence check — single query instead of N+1
  const { data: existingRows } = await supabase
    .from('notifications')
    .select('type')
    .eq('user_id', userId)
    .in('type', ['trail_ready', 'content_update', 'focus_review'])
    .gte('created_at', todayISO)
  const existingTypes = new Set(existingRows?.map((r) => r.type) ?? [])

  const inserts: Array<{
    user_id: string
    type: NotificationType
    title: string
    body: string
    metadata: Record<string, unknown>
  }> = []

  // 1. Trail day ready
  if (data.activeTrailDay && !existingTypes.has('trail_ready')) {
    inserts.push({
      user_id: userId,
      type: 'trail_ready',
      title: `Day ${data.activeTrailDay.dayNumber} is ready`,
      body: `${data.activeTrailDay.title} — estimated ${data.activeTrailDay.estimatedMinutes} min`,
      metadata: {
        deep_link: `/dashboard/camptrails/${data.activeTrailDay.trailSlug}/today`,
        trail_day: data.activeTrailDay.dayNumber,
        duration_minutes: data.activeTrailDay.estimatedMinutes,
        topic_name: data.activeTrailDay.title,
      },
    })
  }

  // 2. SRS items due for review
  if (data.srsReview.itemsDue > 0 && !existingTypes.has('content_update')) {
    const subjectList = data.srsReview.subjects.slice(0, 3).join(', ')
    inserts.push({
      user_id: userId,
      type: 'content_update',
      title: `${data.srsReview.itemsDue} items ready for review`,
      body: `${subjectList} — ~${data.srsReview.estimatedMinutes} min`,
      metadata: {
        deep_link: ROUTES.quiz.setup('camp'),
        content_type: 'srs_review' as const,
        sessions_completed: data.srsReview.itemsDue,
      },
    })
  }

  // 3. Subject below passing floor
  if (data.subjectFloorAlerts.length > 0 && !existingTypes.has('focus_review')) {
    const worst = data.subjectFloorAlerts[0]
    const otherCount = data.subjectFloorAlerts.length - 1
    inserts.push({
      user_id: userId,
      type: 'focus_review',
      title: `Subject below passing: ${worst.subject}`,
      body: `${worst.subject} is at ${worst.mastery}% — minimum ${worst.floorPct}% required.${
        otherCount > 0 ? ` ${otherCount} other ${otherCount === 1 ? 'subject' : 'subjects'} also below floor.` : ''
      }`,
      metadata: {
        deep_link: ROUTES.quiz.setup('camp'),
        discipline_name: worst.subject,
      },
    })
  }

  // Insert via create_notification RPC (handles preferences + daily cap)
  for (const n of inserts) {
    const { error } = await supabase.rpc('create_notification', {
      p_user_id: n.user_id,
      p_type: n.type,
      p_title: n.title,
      p_body: n.body,
      p_metadata: n.metadata,
    })
    if (error) {
      console.error('[NOTIFICATIONS] syncDashboardNotifications RPC failed:', error)
    }
  }
}
