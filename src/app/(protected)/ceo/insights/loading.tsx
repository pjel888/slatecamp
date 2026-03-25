import { Skeleton } from '@/components/ui/skeleton'

const Loading = () => (
  <div className="space-y-8">
    {/* Header */}
    <div className="space-y-1.5">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>

    {/* Engagement snapshot — 4 stat cards */}
    <div className="space-y-3">
      <Skeleton className="h-3 w-40" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    </div>

    {/* Cohort retention table */}
    <div className="space-y-3">
      <Skeleton className="h-3 w-36" />
      <Skeleton className="h-48" />
    </div>

    {/* Churn risk bars */}
    <div className="space-y-3">
      <Skeleton className="h-3 w-44" />
      <Skeleton className="h-32" />
    </div>

    {/* Time to value funnel */}
    <div className="space-y-3">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-40" />
    </div>

    {/* Churn signals grid */}
    <div className="space-y-3">
      <Skeleton className="h-3 w-36" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    </div>
  </div>
)

export default Loading
