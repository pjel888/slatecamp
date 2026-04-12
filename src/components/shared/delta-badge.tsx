import * as React from 'react'
import { TrendUp, TrendDown, Minus } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface DeltaBadgeProps {
  delta: number
  className?: string
  showPercent?: boolean
}

/**
 * A shared badge component to display score or value changes.
 * Colors automatically adjust based on positive (success) or negative (destructive) values.
 */
export const DeltaBadge = ({ 
  delta, 
  className,
  showPercent = true 
}: DeltaBadgeProps) => {
  const formattedDelta = delta > 0 ? `+${delta}` : delta
  const suffix = showPercent ? '%' : ''

  if (delta > 0) {
    return (
      <span className={cn(
        "inline-flex items-center gap-0.5 rounded-sm bg-success-50 px-1.5 py-0.5 text-xs font-medium text-success",
        className
      )}>
        <TrendUp size={12} aria-hidden="true" />
        {formattedDelta}{suffix}
      </span>
    )
  }
  
  if (delta < 0) {
    return (
      <span className={cn(
        "inline-flex items-center gap-0.5 rounded-sm bg-destructive-50 px-1.5 py-0.5 text-xs font-medium text-destructive",
        className
      )}>
        <TrendDown size={12} aria-hidden="true" />
        {formattedDelta}{suffix}
      </span>
    )
  }
  
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 rounded-sm bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground",
      className
    )}>
      <Minus size={12} aria-hidden="true" />
      0{suffix}
    </span>
  )
}
