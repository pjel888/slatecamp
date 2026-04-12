import * as React from 'react'
import { cn } from '@/lib/utils'

interface CoverageProgressProps {
  label: string
  filled: number
  total: number
  color?: string
  className?: string
  showCounts?: boolean
}

/**
 * A shared progress component for displaying content coverage or completion.
 */
export const CoverageProgress = ({
  label,
  filled,
  total,
  color = 'bg-primary',
  className,
  showCounts = true,
}: CoverageProgressProps) => {
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="w-24 shrink-0 text-xs text-muted-foreground">{label}</span>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted/50">
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showCounts && (
        <span className="w-24 shrink-0 text-right text-[11px] font-mono text-foreground tabular-nums">
          {filled}/{total} ({pct}%)
        </span>
      )}
    </div>
  )
}
