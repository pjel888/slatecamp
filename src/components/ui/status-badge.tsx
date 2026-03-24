import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  status: 'draft' | 'review' | 'published'
}

const CONFIG = {
  draft: { variant: 'warning' as const, label: 'Draft' },
  review: { variant: 'info' as const, label: 'Review' },
  published: { variant: 'success' as const, label: 'Published' },
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { variant, label } = CONFIG[status] ?? CONFIG.draft
  return (
    <Badge variant={variant} size="sm" dot>
      {label}
    </Badge>
  )
}
