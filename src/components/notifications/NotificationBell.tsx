'use client'

import { useEffect } from 'react'
import { Bell, CircleNotch } from '@phosphor-icons/react/dist/ssr'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { NotificationItem } from '@/components/notifications/NotificationItem'
import { SCIcon } from '@/components/graphics/icons/Icon'
import Link from 'next/link'

interface NotificationBellProps {
  userId?: string
}

export const NotificationBell = ({ userId }: NotificationBellProps) => {
  const {
    unreadCount,
    recentNotifications,
    isPopoverOpen,
    isLoading,
    setPopoverOpen,
    markAllAsRead,
    startRealtime,
  } = useNotificationStore()

  useEffect(() => {
    if (!userId) return
    const cleanup = startRealtime(userId)
    return cleanup
  }, [userId, startRealtime])

  const displayCount = unreadCount > 9 ? '9+' : unreadCount

  return (
    <Popover open={isPopoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger>
        <div
          role="button"
          tabIndex={0}
          className="relative flex items-center justify-center w-9 h-9 rounded-sm hover:bg-muted transition-colors duration-150 cursor-pointer"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <SCIcon icon={Bell} size="base" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[#1B3FC4] text-white text-[10px] font-semibold leading-none">
              {displayCount}
            </span>
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[380px] p-0 gap-0 rounded-md shadow-lg"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-medium text-foreground">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <SCIcon icon={CircleNotch} size="md" className="text-muted-foreground animate-spin" />
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Complete a session to start receiving updates
              </p>
            </div>
          ) : (
            recentNotifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                variant="popup"
              />
            ))
          )}
        </div>

        {recentNotifications.length > 0 && (
          <div className="border-t border-border px-4 py-3 text-center">
            <Link
              href="/dashboard/notifications"
              onClick={() => setPopoverOpen(false)}
              className="text-xs text-primary hover:underline"
            >
              View all notifications
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
