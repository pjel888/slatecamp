'use client'

import { Badge, type BadgeProps } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type LegalCode = 'PD 1096' | 'RA 9514' | 'BP 344' | 'RA 9266' | 'NSCP' | 'BP 220' | 'PD 957'

interface LegalCitationBadgeProps {
  code: LegalCode
  href?: string
  className?: string
}

const legalCodeConfig: Record<
  LegalCode,
  { label: string; variant: NonNullable<BadgeProps['variant']> }
> = {
  'PD 1096': { label: 'NBCP', variant: 'info' },
  'RA 9514': { label: 'Fire Code', variant: 'danger' },
  'BP 344': { label: 'Accessibility', variant: 'purple' },
  'RA 9266': { label: 'Architecture Act', variant: 'success' },
  NSCP: { label: 'NSCP', variant: 'warning' },
  'BP 220': { label: 'BP 220', variant: 'info' },
  'PD 957': { label: 'PD 957', variant: 'orange' },
}

const LegalCitationBadge = ({ code, href, className }: LegalCitationBadgeProps) => {
  const config = legalCodeConfig[code]

  const badge = (
    <Badge
      variant={config.variant}
      size="xs"
      className={cn('font-mono', className)}
    >
      {config.label}
    </Badge>
  )

  if (href) {
    return (
      <a href={href} className="transition-opacity hover:opacity-80">
        {badge}
      </a>
    )
  }

  return badge
}

export { LegalCitationBadge }
export type { LegalCode, LegalCitationBadgeProps }
