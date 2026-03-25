import { Skeleton } from '@/components/ui/skeleton'

const Loading = () => (
  <div className="flex flex-col gap-6">
    {/* Header */}
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-9 w-36" />
    </div>

    {/* Team roster */}
    <div className="flex flex-col gap-3">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-48" />
    </div>

    {/* Cost allocation */}
    <div className="flex flex-col gap-3">
      <Skeleton className="h-3 w-32" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
      </div>
    </div>
  </div>
)

export default Loading
