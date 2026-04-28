import { create } from 'zustand'
import type { Notification } from '@/types/notifications'
import {
  getUnreadCount,
  getRecentNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/actions/notifications'

interface NotificationStore {
  unreadCount: number
  recentNotifications: Notification[]
  isPopoverOpen: boolean
  isLoading: boolean
  setPopoverOpen: (open: boolean) => void
  fetchUnreadCount: () => Promise<void>
  fetchRecent: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  unreadCount: 0,
  recentNotifications: [],
  isPopoverOpen: false,
  isLoading: false,

  setPopoverOpen: (open) => {
    set({ isPopoverOpen: open })
    if (open) get().fetchRecent()
  },

  fetchUnreadCount: async () => {
    const { count } = await getUnreadCount()
    set({ unreadCount: count })
  },

  fetchRecent: async () => {
    set({ isLoading: true })
    const { data } = await getRecentNotifications()
    set({ recentNotifications: (data ?? []) as Notification[], isLoading: false })
    const { count } = await getUnreadCount()
    set({ unreadCount: count })
  },

  markAsRead: async (id) => {
    set((s) => ({
      unreadCount: Math.max(0, s.unreadCount - 1),
      recentNotifications: s.recentNotifications.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      ),
    }))
    const result = await markNotificationAsRead(id)
    if (result.error) get().fetchRecent()
  },

  markAllAsRead: async () => {
    set((s) => ({
      unreadCount: 0,
      recentNotifications: s.recentNotifications.map((n) => ({
        ...n, read_at: n.read_at ?? new Date().toISOString(),
      })),
    }))
    const result = await markAllNotificationsAsRead()
    if (result.error) get().fetchRecent()
  },
}))
