import { Skeleton } from '@/components/ui/skeleton'

const Loading = () => (
  <div className="min-h-screen bg-background">
    {/* Nav placeholder */}
    <div className="h-16 border-b border-border bg-white" />

    <div className="px-6 pt-32 pb-24 sm:pt-40">
      <div className="mx-auto max-w-[1200px] space-y-6">
        {/* Tool header */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-[480px]" />
        </div>

        {/* Main tool area — input panel + canvas */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-[480px]" />
        </div>
      </div>
    </div>
  </div>
)

export default Loading
