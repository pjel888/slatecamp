'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ComparisonToggleProps {
  isActive: boolean
  onToggle: () => void
}

const ComparisonToggle = ({ isActive, onToggle }: ComparisonToggleProps) => (
  <button
    type="button"
    onClick={onToggle}
    className={cn(
      'inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-medium',
      'border transition-all duration-150 ease-out',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
      isActive
        ? 'border-primary bg-primary/10 text-primary'
        : 'border-border bg-background text-muted-foreground hover:bg-muted',
    )}
  >
    Compare with IBC / ADA / IRC
    <Badge variant="secondary" className="text-[8px] px-1 py-0">
      ⚠️
    </Badge>
  </button>
)

export { ComparisonToggle }
export type { ComparisonToggleProps }
