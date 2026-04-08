'use client'

import { useState, useTransition } from 'react'
import { NotificationItem } from '@/components/notifications/NotificationItem'
import { NotificationFilters } from '@/components/notifications/NotificationFilters'
import { groupNotificationsByTime } from '@/lib/utils/notifications'
import { markAllNotificationsAsRead } from '@/lib/actions/notifications'
import Link from 'next/link'
import { ROUTES } from '@/lib/routes'
import type { Notification, NotificationFilter } from '@/types/notifications'
import { FILTER_TYPE_MAP } from '@/types/notifications'

interface NotificationListProps {
  initialNotifications: Notification[]
}

export const NotificationList = ({ initialNotifications }: NotificationListProps) => {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const [isPending, startTransition] = useTransition()

  const filtered = filter === 'all'
    ? notifications
    : notifications.filter((n) => FILTER_TYPE_MAP[filter]?.includes(n.type))

  const grouped = groupNotificationsByTime(filtered)

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllNotificationsAsRead()
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() }))
      )
    })
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-medium text-foreground">Notifications</h1>
        <div className="flex gap-2">
          <button
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="text-xs px-3 py-1.5 rounded-sm border border-border hover:bg-muted text-muted-foreground transition-colors"
          >
            Mark all read
          </button>
          <Link
            href="/dashboard/settings"
            className="text-xs px-3 py-1.5 rounded-sm border border-border hover:bg-muted text-muted-foreground transition-colors"
          >
            Settings
          </Link>
        </div>
      </div>
      <p className="text-[13px] text-muted-foreground mb-5">
        Stay on top of your progress and camp updates
      </p>

      <NotificationFilters activeFilter={filter} onFilterChange={setFilter} />

      {grouped.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">
            {filter === 'all'
              ? 'No notifications yet. Complete your first session to start receiving updates.'
              : `No ${filter} notifications.`}
          </p>
        </div>
      ) : (
        grouped.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-2 px-4">
              {group.displayLabel}
            </p>
            <div className="bg-card rounded-md overflow-hidden border border-border">
              {group.items.map((n) => (
                <NotificationItem key={n.id} notification={n} variant="page" />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
