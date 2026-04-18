export type NotificationType =
  | 'score_change'
  | 'trail_ready'
  | 'focus_review'
  | 'zone_transition'
  | 'proof_unlocked'
  | 'campfire_story'
  | 'campfire_reply'
  | 'content_update'
  | 'weekly_digest'
  | 'coaching_tip'
  | 'billing'
  | 'system'

export type NotificationPriority = 'high' | 'medium' | 'low'
export type NotificationFilter = 'all' | 'progress' | 'trail' | 'campfire' | 'system'
export type TimeGroup = 'today' | 'yesterday' | 'this_week' | 'earlier'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string
  metadata: NotificationMetadata
  read_at: string | null
  created_at: string
}

export interface NotificationMetadata {
  deep_link?: string
  old_score?: number
  new_score?: number
  topic_name?: string
  discipline_name?: string
  trail_day?: number
  duration_minutes?: number
  zone_name?: string
  threshold?: number
  passer_name?: string
  passer_school?: string
  post_id?: string
  content_title?: string
  content_type?: 'wiki' | '3d_module' | 'feature' | 'srs_review'
  content_slug?: string
  sessions_completed?: number
  topics_improved?: number
}

export interface NotificationPreferences {
  score_changes: boolean
  trail_ready: boolean
  focus_review: boolean
  milestones: boolean
  campfire: boolean
  content_updates: boolean
  weekly_digest: boolean
  coaching_tips: boolean
  billing: boolean
  daily_digest: boolean
  quiet_hours_start: string | null
  quiet_hours_end: string | null
}

export interface QueryResult<T> {
  data: T | null
  error: string | null
}

export interface GroupedNotifications {
  label: TimeGroup
  displayLabel: string
  items: Notification[]
}

export const NOTIFICATION_PRIORITY: Record<NotificationType, NotificationPriority> = {
  score_change: 'high',
  trail_ready: 'high',
  focus_review: 'high',
  zone_transition: 'high',
  proof_unlocked: 'high',
  campfire_story: 'medium',
  campfire_reply: 'medium',
  content_update: 'medium',
  weekly_digest: 'medium',
  coaching_tip: 'low',
  billing: 'low',
  system: 'low',
}

export const DEFAULT_DEEP_LINKS: Record<NotificationType, string> = {
  score_change: '/dashboard',
  trail_ready: '/dashboard/trail',
  focus_review: '/dashboard/heatmap',
  zone_transition: '/dashboard',
  proof_unlocked: '/dashboard/trail',
  campfire_story: '/dashboard/campfire',
  campfire_reply: '/dashboard/campfire',
  content_update: '/dashboard/wiki',
  weekly_digest: '/dashboard/heatmap',
  coaching_tip: '/dashboard',
  billing: '/dashboard/settings',
  system: '/dashboard',
}

export const FILTER_TYPE_MAP: Record<NotificationFilter, NotificationType[] | null> = {
  all: null,
  progress: ['score_change', 'zone_transition', 'focus_review', 'weekly_digest'],
  trail: ['trail_ready', 'proof_unlocked'],
  campfire: ['campfire_story', 'campfire_reply'],
  system: ['content_update', 'coaching_tip', 'billing', 'system'],
}
