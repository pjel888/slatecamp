import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatSupabaseError } from '@/lib/supabase/format-error'
import { FILTER_TYPE_MAP } from '@/types/notifications'
import type {
  Notification,
  NotificationPreferences,
  NotificationFilter,
  QueryResult,
} from '@/types/notifications'

export const fetchNotifications = async (
  userId: string,
  options: {
    filter?: NotificationFilter
    cursor?: string
    limit?: number
  } = {}
): Promise<QueryResult<Notification[]>> => {
  try {
    const supabase = await createClient()
    const { filter = 'all', cursor, limit = 20 } = options

    let query = supabase
      .from('notifications')
      .select('id, user_id, type, title, body, metadata, read_at, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    const types = FILTER_TYPE_MAP[filter]
    if (types) {
      query = query.in('type', types)
    }

    if (cursor) {
      query = query.lt('created_at', cursor)
    }

    const { data, error } = await query
    if (error) throw error
    return { data: data as Notification[], error: null }
  } catch (err) {
    console.error('[NOTIFICATIONS] fetchNotifications:', formatSupabaseError(err))
    return { data: null, error: 'Failed to load notifications.' }
  }
}

export const fetchNotificationPreferences = async (
  userId: string
): Promise<QueryResult<NotificationPreferences>> => {
  try {
    // Force admin client for debugging
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('notification_preferences')      .select(
        'score_changes, trail_ready, focus_review, milestones, campfire, ' +
        'content_updates, weekly_digest, coaching_tips, billing, ' +
        'daily_digest, quiet_hours_start, quiet_hours_end'
      )
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw error

    if (!data) {
      return {
        data: {
          score_changes: true, trail_ready: true, focus_review: true,
          milestones: true, campfire: true, content_updates: true,
          weekly_digest: true, coaching_tips: false, billing: true,
          daily_digest: false, quiet_hours_start: null, quiet_hours_end: null,
        },
        error: null,
      }
    }

    return { data: data as unknown as NotificationPreferences, error: null }
  } catch (err) {
    console.error('[NOTIFICATIONS] fetchPreferences:', formatSupabaseError(err))
    return { data: null, error: 'Failed to load notification preferences.' }
  }
}
