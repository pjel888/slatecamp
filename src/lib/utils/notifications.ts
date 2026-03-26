import type { Notification, GroupedNotifications, TimeGroup } from '@/types/notifications'
import { DEFAULT_DEEP_LINKS } from '@/types/notifications'

export const formatNotificationTime = (isoString: string): string => {
  const now = new Date()
  const date = new Date(isoString)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return '1d ago'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}

export const groupNotificationsByTime = (
  notifications: Notification[]
): GroupedNotifications[] => {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterdayStart = new Date(todayStart.getTime() - 86_400_000)
  const weekStart = new Date(todayStart.getTime() - 7 * 86_400_000)

  const groups: Record<TimeGroup, Notification[]> = {
    today: [], yesterday: [], this_week: [], earlier: [],
  }

  for (const n of notifications) {
    const created = new Date(n.created_at)
    if (created >= todayStart) groups.today.push(n)
    else if (created >= yesterdayStart) groups.yesterday.push(n)
    else if (created >= weekStart) groups.this_week.push(n)
    else groups.earlier.push(n)
  }

  const labels: Record<TimeGroup, string> = {
    today: 'Today', yesterday: 'Yesterday',
    this_week: 'This week', earlier: 'Earlier',
  }

  return (Object.entries(groups) as [TimeGroup, Notification[]][])
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, displayLabel: labels[label], items }))
}

export const getNotificationDeepLink = (notification: Notification): string => {
  return notification.metadata?.deep_link ?? DEFAULT_DEEP_LINKS[notification.type]
}
