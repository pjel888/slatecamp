import { Skeleton } from '@/components/ui/skeleton'

const Loading = () => (
  <div className="min-h-screen bg-background">
    {/* Nav placeholder */}
    <div className="h-16 border-b border-border bg-white" />

    <div className="mx-auto max-w-[1200px] px-6 pt-24 pb-16">
      <div className="space-y-6">
        {/* Tool header */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-[420px]" />
        </div>

        {/* Input form + results */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    </div>
  </div>
)

export default Loading
