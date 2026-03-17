'use client'

import { useState, useEffect } from 'react'
import { Bell, FileText, Question, Cube } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { createClient } from '@/lib/supabase/client'
import { canReviewContent } from '@/lib/admin/roles'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: 'review_request' | 'changes_requested' | 'approved'
  content_title: string
  content_type: 'question' | 'wiki' | 'asset'
  content_id: string
  created_at: string
  read: boolean
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkRole()
    loadNotifications()
  }, [])

  const checkRole = async () => {
    const admin = await canReviewContent()
    setIsAdmin(admin)
  }

  const loadNotifications = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    // For now, we'll query pending reviews as notifications
    const { data } = await supabase
      .from('wiki_articles')
      .select('id, title, status, updated_at')
      .eq('status', 'pending_review')
      .order('updated_at', { ascending: false })
      .limit(10)

    if (data) {
      const notifs: Notification[] = data.map(a => ({
        id: a.id,
        type: 'review_request' as const,
        content_title: a.title,
        content_type: 'wiki' as const,
        content_id: a.id,
        created_at: a.updated_at,
        read: false,
      }))
      setNotifications(notifs)
      setUnreadCount(notifs.filter(n => !n.read).length)
    }
  }

  const markAsRead = async (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  if (!isAdmin) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 hover:bg-muted transition-colors"
      >
        <SCIcon icon={Bell} size="md" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-border bg-background shadow-lg">
            <div className="border-b px-4 py-3">
              <h3 className="font-semibold">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={cn(
                      "border-b px-4 py-3 hover:bg-muted cursor-pointer",
                      !notification.read && "bg-[#F0F5FA] dark:bg-[#141B24]"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded bg-muted">
                        {notification.content_type === 'wiki' ? (
                          <SCIcon icon={FileText} size="sm" />
                        ) : notification.content_type === 'question' ? (
                          <SCIcon icon={Question} size="sm" />
                        ) : (
                          <SCIcon icon={Cube} size="sm" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {notification.content_title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {notification.type === 'review_request' 
                            ? 'Pending review'
                            : notification.type === 'changes_requested'
                            ? 'Changes requested'
                            : 'Approved'
                          }
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-[#3B6B9C] mt-2" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
