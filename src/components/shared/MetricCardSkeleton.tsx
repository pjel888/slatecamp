import { cn } from '@/lib/utils'

interface MetricCardSkeletonProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const valueHeightMap = {
  sm: 'h-6',
  md: 'h-8',
  lg: 'h-11',
} as const

export const MetricCardSkeleton = ({
  size = 'md',
  className,
}: MetricCardSkeletonProps) => (
  <div
    className={cn('bg-card border border-border rounded-md p-4', className)}
    aria-busy="true"
    aria-label="Loading metric"
  >
    {/* eyebrow */}
    <div className="bg-muted animate-pulse rounded-sm h-2.5 w-20 mb-2" />
    {/* value */}
    <div
      className={cn('bg-muted animate-pulse rounded-sm w-16', valueHeightMap[size])}
    />
    {/* label */}
    <div className="bg-muted animate-pulse rounded-sm h-2 w-24 mt-1.5" />
    {/* delta */}
    <div className="bg-muted animate-pulse rounded-sm h-2.5 w-32 mt-2" />
  </div>
)

export type { MetricCardSkeletonProps }
