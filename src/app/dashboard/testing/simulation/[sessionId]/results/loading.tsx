import { Skeleton } from '@/components/ui/skeleton'

const Loading = () => (
  <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 py-6 px-4">
    {/* Header */}
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-48" />
    </div>

    {/* Score summary */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
    </div>

    {/* Results breakdown */}
    <Skeleton className="h-64" />

    {/* Question review list */}
    <div className="space-y-3">
      <Skeleton className="h-3 w-36" />
      <Skeleton className="h-16" />
      <Skeleton className="h-16" />
      <Skeleton className="h-16" />
      <Skeleton className="h-16" />
    </div>
  </div>
)

export default Loading
