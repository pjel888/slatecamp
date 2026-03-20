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
        "inline-flex items-center font-[var(--font-dm-mono)] text-[9px] font-medium px-1.5 py-px rounded-[3px]",
        "bg-[#FFF8E6] text-[#92400E] border border-[#FAD07A]",
        "cursor-default select-none",
        "dark:bg-[#92400E20] dark:text-[#F5C842] dark:border-[#A07020]",
        className
      )}
    >
      ⟳ 2024
    </span>
  )
}
