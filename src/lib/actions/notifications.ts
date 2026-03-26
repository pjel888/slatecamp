'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Notification, NotificationPreferences } from '@/types/notifications'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const markNotificationAsRead = async (notificationId: string) => {
  if (!UUID_RE.test(notificationId)) return { error: 'Invalid notification ID.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in.' }

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', user.id)
    .is('read_at', null)

  if (error) {
    console.error('[NOTIFICATIONS] markAsRead failed:', error)
    return { error: 'Failed to mark notification as read.' }
  }

  revalidatePath('/dashboard/notifications')
  return { success: true }
}

export const markAllNotificationsAsRead = async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in.' }

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null)

  if (error) {
    console.error('[NOTIFICATIONS] markAllAsRead failed:', error)
    return { error: 'Failed to mark notifications as read.' }
  }

  revalidatePath('/dashboard/notifications')
  return { success: true }
}

export const updateNotificationPreferences = async (
  preferences: Partial<NotificationPreferences>
) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in.' }

  const { error } = await supabase
    .from('notification_preferences')
    .upsert(
      { user_id: user.id, ...preferences, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )

  if (error) {
    console.error('[NOTIFICATIONS] updatePreferences failed:', error)
    return { error: 'Failed to update preferences.' }
  }

  revalidatePath('/dashboard/notifications')
  return { success: true }
}

export const getUnreadCount = async (): Promise<{ count: number; error: string | null }> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { count: 0, error: null }

  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('read_at', null)

  if (error) {
    console.error('[NOTIFICATIONS] getUnreadCount failed:', error)
    return { count: 0, error: 'Failed to fetch count.' }
  }

  return { count: count ?? 0, error: null }
}

export const getRecentNotifications = async (): Promise<{ data: Notification[]; error: string | null }> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: [], error: null }

  const { data, error } = await supabase
    .from('notifications')
    .select('id, user_id, type, title, body, metadata, read_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('[NOTIFICATIONS] getRecent failed:', error)
    return { data: [], error: 'Failed to fetch notifications.' }
  }

  return { data: (data ?? []) as Notification[], error: null }
}
