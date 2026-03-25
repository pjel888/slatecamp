import { Skeleton } from '@/components/ui/skeleton'

const Loading = () => (
  <div className="max-w-4xl space-y-6">
    {/* Breadcrumbs */}
    <Skeleton className="h-4 w-48" />

    {/* Header */}
    <div className="space-y-1.5">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-[420px]" />
    </div>

    {/* Component grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
    </div>
  </div>
)

export default Loading
