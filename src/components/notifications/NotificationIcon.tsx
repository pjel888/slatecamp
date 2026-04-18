import {
  TrendUp,
  BookOpen,
  Warning,
  Star,
  Shield,
  ChatCircle,
  Monitor,
  Calendar,
  Lightbulb,
  CreditCard,
  Gear,
} from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import type { NotificationType } from '@/types/notifications'

const ICON_MAP: Record<NotificationType, {
  icon: typeof TrendUp
  unreadBg: string
  unreadStroke: string
}> = {
  score_change:    { icon: TrendUp,     unreadBg: 'bg-primary-50',      unreadStroke: 'text-primary' },
  trail_ready:     { icon: BookOpen,    unreadBg: 'bg-success-50',      unreadStroke: 'text-success-700' },
  focus_review:       { icon: Warning,     unreadBg: 'bg-warning-50',      unreadStroke: 'text-camp-orange' },
  zone_transition: { icon: Star,        unreadBg: 'bg-primary-50',      unreadStroke: 'text-primary' },
  proof_unlocked:  { icon: Shield,      unreadBg: 'bg-primary-50',      unreadStroke: 'text-primary' },
  campfire_story:  { icon: ChatCircle,  unreadBg: 'bg-trail-accent/10', unreadStroke: 'text-trail-accent' },
  campfire_reply:  { icon: ChatCircle,  unreadBg: 'bg-trail-accent/10', unreadStroke: 'text-trail-accent' },
  content_update:  { icon: Monitor,     unreadBg: 'bg-primary-50',      unreadStroke: 'text-primary' },
  weekly_digest:   { icon: Calendar,    unreadBg: 'bg-muted',     unreadStroke: 'text-muted-foreground' },
  coaching_tip:    { icon: Lightbulb,   unreadBg: 'bg-muted',     unreadStroke: 'text-muted-foreground' },
  billing:         { icon: CreditCard,  unreadBg: 'bg-muted',     unreadStroke: 'text-muted-foreground' },
  system:          { icon: Gear,        unreadBg: 'bg-muted',     unreadStroke: 'text-muted-foreground' },
}

interface NotificationIconProps {
  type: NotificationType
  isUnread: boolean
}

export const NotificationIcon = ({ type, isUnread }: NotificationIconProps) => {
  const config = ICON_MAP[type]
  return (
    <div className={`flex-shrink-0 w-9 h-9 rounded-md flex items-center justify-center ${
      isUnread ? config.unreadBg : 'bg-muted'
    }`}>
      <SCIcon
        icon={config.icon}
        size="sm"
        className={isUnread ? config.unreadStroke : 'text-muted-foreground'}
      />
    </div>
  )
}
