import { Badge } from '@/components/ui/badge'
import { eventBadgeVariant, eventBadgeLabel } from '@/lib/utils/audit'

interface EventBadgeProps {
  eventType: string
}

export const EventBadge = ({ eventType }: EventBadgeProps) => (
  <Badge variant={eventBadgeVariant(eventType)} size="xs">
    {eventBadgeLabel(eventType)}
  </Badge>
)
