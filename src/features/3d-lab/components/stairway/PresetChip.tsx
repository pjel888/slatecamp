'use client'

import { cn } from '@/lib/utils'

interface PresetChipProps {
  label: string
  isActive: boolean
  isViolation: boolean
  lawColor?: string
  onClick: () => void
}

const PresetChip = ({ label, isActive, isViolation, lawColor, onClick }: PresetChipProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-medium',
      'transition-all duration-150 ease-out whitespace-nowrap',
      'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
      isActive
        ? 'shadow-sm ring-1 ring-primary/30'
        : 'hover:shadow-sm',
      isViolation && lawColor
        ? isActive
          ? 'text-white border-transparent'
          : 'border-border bg-background text-foreground hover:bg-muted'
        : isActive
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-background text-foreground hover:bg-muted',
    )}
    style={isViolation && lawColor && isActive ? { backgroundColor: lawColor, borderColor: lawColor } : undefined}
  >
    {label}
  </button>
)

export { PresetChip }
export type { PresetChipProps }
