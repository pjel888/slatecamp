import { cn } from '@/lib/utils'

interface WikiChangedPillProps {
  oldValue?: string
  className?: string
}

export const WikiChangedPill = ({ oldValue, className }: WikiChangedPillProps) => {
  const tooltipText = oldValue
    ? `Changed from ${oldValue} in 2013 Illustrated IRR`
    : 'Changed from 2013 Illustrated IRR'

  return (
    <span
      title={tooltipText}
      className={cn(
        "inline-flex items-center font-[var(--font-dm-mono)] text-[11px] font-medium px-1.5 py-px rounded-[3px]",
        "bg-signal-gold-light text-signal-gold-deep border border-warning-300",
        "cursor-default select-none",
        "dark:bg-warning-700/15 dark:text-formula-highlight dark:border-warning-700",
        className
      )}
    >
      ⟳ 2024
    </span>
  )
}
