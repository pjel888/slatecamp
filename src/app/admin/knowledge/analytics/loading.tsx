import { Skeleton, StatCardSkeleton } from '@/components/ui/skeleton'

const Loading = () => (
  <div className="space-y-6 animate-pulse">
    {/* Back link */}
    <Skeleton className="h-4 w-32" />

    {/* Header */}
    <div className="space-y-1">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-6 w-64" />
      <Skeleton className="h-4 w-80" />
    </div>

    {/* Stat cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>

    {/* Difficulty distribution card */}
    <div className="rounded-lg border border-border p-4 space-y-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-5 w-40" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 flex-1" />
            <Skeleton className="h-3 w-10" />
          </div>
        ))}
      </div>
    </div>

    {/* Coverage card */}
    <div className="rounded-lg border border-border p-4 space-y-3">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-5 w-40" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 flex-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default Loading
