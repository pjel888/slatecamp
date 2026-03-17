import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
  lines?: number
  className?: string
}

/**
 * LoadingSkeleton — Pulsing placeholder lines for loading states.
 * Adheres to Campfire transitions (max 300ms for individual, pulse is ambient).
 */
export function LoadingSkeleton({ lines = 3, className }: LoadingSkeletonProps) {
  const widths = ['100%', '85%', '70%', '90%', '60%', '80%']
  return (
    <div className={cn('space-y-3', className)} aria-busy="true" aria-label="Loading">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="h-3 rounded-sm bg-[var(--gc-border,#D4DAE3)] animate-pulse"
          style={{ width: widths[i % widths.length] }}
        />
      ))}
    </div>
  )
}
