'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReviewFilter = 'all' | 'incorrect' | 'flagged' | 'low-confidence'

interface ReviewFilterBarProps {
  totalCount: number
  incorrectCount: number
  flaggedCount: number
  lowConfidenceCount: number
  activeFilter: ReviewFilter
  onFilterChange: (filter: ReviewFilter) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ReviewFilterBar = ({
  totalCount,
  incorrectCount,
  flaggedCount,
  lowConfidenceCount,
  activeFilter,
  onFilterChange,
}: ReviewFilterBarProps) => {
  const barRef = useRef<HTMLDivElement>(null)
  const [isStuck, setIsStuck] = useState(false)

  // Detect when the bar is stuck to the top via IntersectionObserver
  useEffect(() => {
    const el = barRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the element is intersecting at the threshold, it's NOT stuck
        // When it's no longer fully visible (clipped by top), it IS stuck
        setIsStuck(!entry.isIntersecting)
      },
      { threshold: 1, rootMargin: '-1px 0px 0px 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const filters: { value: ReviewFilter; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: totalCount },
    { value: 'incorrect', label: 'Incorrect', count: incorrectCount },
    { value: 'flagged', label: 'Flagged', count: flaggedCount },
    { value: 'low-confidence', label: 'Low Confidence', count: lowConfidenceCount },
  ]

  return (
    <div
      ref={barRef}
      className={cn(
        'sticky top-0 z-10 bg-card/95 backdrop-blur-sm px-4 py-3 -mx-4 transition-shadow duration-150 ease-out',
        isStuck && 'shadow-sm border-b border-border',
      )}
      role="toolbar"
      aria-label="Filter questions"
    >
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          // Hide filters with zero count (except "All")
          if (f.value !== 'all' && f.count === 0) return null

          const isActive = activeFilter === f.value
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => onFilterChange(f.value)}
              aria-pressed={isActive}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium',
                'transition-colors duration-150 ease-out',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                isActive
                  ? 'bg-primary text-white'
                  : 'bg-surface-light text-text-secondary hover:bg-primary-50 hover:text-primary',
              )}
            >
              {f.label}
              <span
                className={cn(
                  'tabular-nums text-[10px] px-1 py-0.5 rounded-sm min-w-[18px] text-center',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-border/50 text-text-secondary',
                )}
              >
                {f.count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
