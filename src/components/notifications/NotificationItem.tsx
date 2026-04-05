'use client'

import { useRouter } from 'next/navigation'
import { NotificationIcon } from '@/components/notifications/NotificationIcon'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { formatNotificationTime, getNotificationDeepLink } from '@/lib/utils/notifications'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types/notifications'

interface NotificationItemProps {
  notification: Notification
  variant?: 'popup' | 'page'
}

export const NotificationItem = ({ notification, variant = 'page' }: NotificationItemProps) => {
  const router = useRouter()
  const markAsRead = useNotificationStore((s) => s.markAsRead)
  const setPopoverOpen = useNotificationStore((s) => s.setPopoverOpen)

  const isUnread = notification.read_at === null
  const deepLink = getNotificationDeepLink(notification)

  const handleClick = () => {
    if (isUnread) markAsRead(notification.id)
    if (variant === 'popup') setPopoverOpen(false)
    router.push(deepLink)
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex w-full gap-3.5 px-4 py-3.5 text-left transition-colors duration-150 cursor-pointer',
        isUnread
          ? 'bg-primary-50'
          : 'hover:bg-muted/50',
      )}
    >
      <NotificationIcon type={notification.type} isUnread={isUnread} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={cn(
            'text-[13px] truncate',
            isUnread ? 'font-medium text-foreground' : 'text-muted-foreground'
          )}>
            {notification.title}
          </p>
          <span className="text-[11px] text-muted-foreground flex-shrink-0">
            {formatNotificationTime(notification.created_at)}
          </span>
        </div>
        <p className={cn(
          'text-[12px] mt-0.5 line-clamp-2',
          isUnread ? 'text-muted-foreground' : 'text-muted-foreground/70'
        )}>
          {notification.body}
        </p>
      </div>
    </button>
  )
}
