import { Skeleton } from '@/components/ui/skeleton'

const Loading = () => (
  <div className="max-w-4xl space-y-6">
    {/* Breadcrumbs */}
    <Skeleton className="h-4 w-48" />

    {/* Header */}
    <div className="space-y-1.5">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-[480px]" />
    </div>

    {/* Law group sections */}
    <div className="space-y-8 mt-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default Loading
