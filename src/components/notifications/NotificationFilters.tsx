'use client'

import { cn } from '@/lib/utils'
import type { NotificationFilter } from '@/types/notifications'

const FILTERS: { value: NotificationFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'progress', label: 'Progress' },
  { value: 'trail', label: 'Trail' },
  { value: 'campfire', label: 'Campfire' },
  { value: 'system', label: 'System' },
]

interface NotificationFiltersProps {
  activeFilter: NotificationFilter
  onFilterChange: (filter: NotificationFilter) => void
}

export const NotificationFilters = ({ activeFilter, onFilterChange }: NotificationFiltersProps) => {
  return (
    <div className="flex gap-1.5 mb-6 overflow-x-auto">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onFilterChange(f.value)}
          aria-pressed={activeFilter === f.value}
          className={cn(
            'text-xs px-3.5 py-1.5 rounded-full transition-colors duration-150 whitespace-nowrap',
            activeFilter === f.value
              ? 'bg-foreground text-background'
              : 'bg-card border border-border text-muted-foreground hover:border-border/80'
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
