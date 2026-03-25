import { Skeleton } from '@/components/ui/skeleton'

const Loading = () => (
  <div className="space-y-6">
    {/* Page header */}
    <div className="space-y-1.5">
      <Skeleton className="h-3 w-36" />
      <Skeleton className="h-6 w-28" />
    </div>

    {/* Needs attention card */}
    <Skeleton className="h-20" />

    {/* Stat cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
    </div>

    {/* Content by subject bar chart */}
    <Skeleton className="h-48" />

    {/* Two-column: quick actions + recent activity */}
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3">
        <Skeleton className="h-3 w-28" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
      <Skeleton className="h-64" />
    </div>
  </div>
)

export default Loading
