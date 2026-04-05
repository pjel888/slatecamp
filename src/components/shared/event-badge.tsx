import { Badge, type BadgeProps } from '@/components/ui/badge'
import { eventBadgeVariant, eventBadgeLabel } from '@/lib/utils/audit'

interface EventBadgeProps extends Omit<BadgeProps, 'children' | 'variant'> {
  eventType: string
}

const EventBadge = ({ eventType, size = 'xs', ...props }: EventBadgeProps) => (
  <Badge variant={eventBadgeVariant(eventType)} size={size} {...props}>
    {eventBadgeLabel(eventType)}
  </Badge>
)

export { EventBadge }
export type { EventBadgeProps }
