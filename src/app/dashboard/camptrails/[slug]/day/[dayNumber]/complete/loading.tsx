import { Skeleton } from '@/components/ui/skeleton'

const Loading = () => (
  <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 py-4 px-4">
    {/* Completion moment */}
    <div className="space-y-3">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-48" />
      <div className="grid grid-cols-3 gap-3 mt-4">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    </div>

    <Skeleton className="h-px w-full" />

    {/* Score trajectory chart */}
    <div className="space-y-3">
      <Skeleton className="h-3 w-36" />
      <Skeleton className="h-48" />
    </div>

    <Skeleton className="h-px w-full" />

    {/* Next day card */}
    <div className="space-y-2">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-24" />
    </div>
  </div>
)

export default Loading
