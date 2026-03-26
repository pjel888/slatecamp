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
  score_change:    { icon: TrendUp,     unreadBg: 'bg-blue-50',   unreadStroke: 'text-[#1B3FC4]' },
  trail_ready:     { icon: BookOpen,    unreadBg: 'bg-green-50',  unreadStroke: 'text-[#1B7A3C]' },
  blindspot:       { icon: Warning,     unreadBg: 'bg-orange-50', unreadStroke: 'text-[#E8853A]' },
  zone_transition: { icon: Star,        unreadBg: 'bg-blue-50',   unreadStroke: 'text-[#1B3FC4]' },
  proof_unlocked:  { icon: Shield,      unreadBg: 'bg-blue-50',   unreadStroke: 'text-[#1B3FC4]' },
  campfire_story:  { icon: ChatCircle,  unreadBg: 'bg-purple-50', unreadStroke: 'text-[#534AB7]' },
  campfire_reply:  { icon: ChatCircle,  unreadBg: 'bg-purple-50', unreadStroke: 'text-[#534AB7]' },
  content_update:  { icon: Monitor,     unreadBg: 'bg-blue-50',   unreadStroke: 'text-[#1B3FC4]' },
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
    <div className={`flex-shrink-0 w-9 h-9 rounded-[10px] flex items-center justify-center ${
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
