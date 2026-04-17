import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SurfaceTruthNoticeProps {
  badge: string
  description: string
  variant?: 'default' | 'success' | 'warning' | 'info'
}

export const SurfaceTruthNotice = ({
  badge,
  description,
  variant = 'default',
}: SurfaceTruthNoticeProps) => (
  <Card size="sm" className="flex items-start gap-3">
    <Badge variant={variant} size="xs" shape="pill">
      {badge}
    </Badge>
    <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
  </Card>
)
