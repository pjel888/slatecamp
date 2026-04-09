'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ComplianceSummaryBadgeProps {
  issueCount: number
  warningCount: number
}

const ComplianceSummaryBadge = ({ issueCount, warningCount }: ComplianceSummaryBadgeProps) => {
  if (issueCount === 0 && warningCount === 0) {
    return (
      <Badge className="bg-success/10 text-success border-success/20 text-xs">
        ALL PASS
      </Badge>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      {issueCount > 0 && (
        <Badge variant="destructive" className="text-xs">
          {issueCount} ISSUE{issueCount > 1 ? 'S' : ''}
        </Badge>
      )}
      {warningCount > 0 && (
        <Badge className={cn('text-xs bg-warning/10 text-warning border-warning/20')}>
          {warningCount} WARNING{warningCount > 1 ? 'S' : ''}
        </Badge>
      )}
    </div>
  )
}

export { ComplianceSummaryBadge }
export type { ComplianceSummaryBadgeProps }
