import { Skeleton } from '@/components/ui/skeleton'

const Loading = () => (
  <div className="min-h-screen bg-muted">
    {/* Nav placeholder */}
    <div className="h-16 border-b border-zinc-200 bg-white" />

    <div className="px-6 pt-32 pb-24 sm:pt-40">
      <div className="mx-auto max-w-[1200px]">
        {/* Hero */}
        <div className="mb-12 max-w-2xl space-y-3">
          <Skeleton className="h-12 w-80" />
          <Skeleton className="h-5 w-[480px]" />
          <Skeleton className="h-5 w-[400px]" />
        </div>

        {/* Tool grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      </div>
    </div>
  </div>
)

export default Loading
