'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ViolationRowProps } from './ViolationRow'

interface ComplianceLawCardProps {
  lawName: string
  lawColor: string
  subtitle: string
  citation: string
  violations: ViolationRowProps[]
  passes: Array<{ message: string }>
  isApplicable: boolean
}

const ComplianceLawCard = ({
  lawName,
  lawColor,
  subtitle,
  citation,
  violations,
  passes,
  isApplicable,
}: ComplianceLawCardProps) => {
  if (!isApplicable) return null

  const issueCount = violations.length

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-2 py-3 px-4">
        <span
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{ backgroundColor: lawColor }}
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{lawName}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <Badge
          variant={issueCount > 0 ? 'destructive' : 'secondary'}
          className={cn('text-[10px]', issueCount === 0 && 'bg-success/10 text-success')}
        >
          {issueCount > 0 ? `${issueCount} ISSUE${issueCount > 1 ? 'S' : ''}` : 'COMPLIANT'}
        </Badge>
      </CardHeader>
      <CardContent className="px-4 pb-3 pt-0 space-y-1">
        {violations.map((v) => (
          <div key={v.message} className="text-sm text-destructive flex items-start gap-1.5">
            <span className="shrink-0">✗</span>
            <span>{v.message}</span>
          </div>
        ))}
        {passes.length > 0 && (
          <div className="pt-1">
            {passes.map((p) => (
              <div key={p.message} className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="shrink-0 text-success">✓</span>
                <span>{p.message}</span>
              </div>
            ))}
          </div>
        )}
        <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/50">
          Source: {citation}
        </p>
      </CardContent>
    </Card>
  )
}

export { ComplianceLawCard }
export type { ComplianceLawCardProps }
