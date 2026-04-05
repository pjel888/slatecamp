// src/app/calculators/_components/ResultRow.tsx
// Single row in the calculation result trail.
// Supports deductions (−), additions (+), summary (bold + separator), and highlight (buy qty).
'use client'

import { cn } from '@/lib/utils'

interface ResultRowProps {
  label: string
  value: string | number
  unit: string
  isDeduction?: boolean
  isAddition?: boolean
  isSummary?: boolean
  isHighlighted?: boolean
  /** Decimal places for numeric values */
  decimals?: number
  onHover?: () => void
  onHoverEnd?: () => void
}

export function ResultRow({
  label,
  value,
  unit,
  isDeduction,
  isAddition,
  isSummary,
  isHighlighted,
  decimals = 2,
  onHover,
  onHoverEnd,
}: ResultRowProps) {
  const formattedValue =
    typeof value === 'number' ? value.toFixed(decimals) : value

  return (
    <div
      className={cn(
        'flex items-baseline justify-between py-1',
        isSummary && 'mt-2 border-t border-border pt-2 font-medium',
        isHighlighted && '-mx-4 rounded-lg bg-primary/5 px-4 py-2',
      )}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
    >
      <span
        className={cn(
          'font-sans text-xs',
          (isDeduction || isAddition) && 'text-muted-foreground',
        )}
      >
        {isDeduction && '− '}
        {isAddition && '+ '}
        {label}
      </span>
      <span className="font-mono text-xs tabular-nums text-foreground">
        {formattedValue} {unit}
      </span>
    </div>
  )
}
