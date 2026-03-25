import { MetricCardSkeleton } from '@/components/ceo/skeletons/MetricCardSkeleton'
import { ChartSkeleton } from '@/components/ceo/skeletons/ChartSkeleton'

export default function CeoLoading() {
  return (
    <div className="space-y-6">
      {/* Section eyebrow skeleton */}
      <div className="h-2 w-40 bg-muted rounded-sm animate-pulse" />

      {/* North Star metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Engagement health cards */}
      <div className="h-2 w-36 bg-muted rounded-sm animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>

      {/* Unit economics cards */}
      <div className="h-2 w-32 bg-muted rounded-sm animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>
    </div>
  )
}
