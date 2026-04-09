'use client'

import { cn } from '@/lib/utils'
import { FixButton } from './FixButton'

interface ViolationRowProps {
  message: string
  currentValue: number
  limit: number
  unit: string
  severity: 'error' | 'warning' | 'info'
  lawColor: string
  onFix?: () => void
  onClick?: () => void
}

const ViolationRow = ({
  message,
  currentValue,
  limit,
  unit,
  severity,
  lawColor,
  onFix,
  onClick,
}: ViolationRowProps) => {
  const delta = Math.abs(currentValue - limit)
  const exceeds = currentValue > limit

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-2 rounded-sm p-2 text-left text-sm',
        'transition-colors duration-150 ease-out',
        onClick ? 'hover:bg-muted cursor-pointer' : 'cursor-default',
      )}
    >
      <span
        className="mt-0.5 h-3 w-3 shrink-0 rounded-full"
        style={{ backgroundColor: lawColor }}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <p className="text-foreground leading-snug">{message}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Current: {currentValue} {unit} · {exceeds ? 'Exceeds' : 'Below'} by {delta} {unit}
        </p>
      </div>
      {onFix && severity === 'error' && (
        <FixButton onClick={onFix} lawColor={lawColor} />
      )}
    </button>
  )
}

export { ViolationRow }
export type { ViolationRowProps }
