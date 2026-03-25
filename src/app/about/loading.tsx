import { Skeleton } from '@/components/ui/skeleton'

const Loading = () => (
  <div className="min-h-screen bg-zinc-100">
    {/* Nav placeholder */}
    <div className="h-16 border-b border-zinc-200 bg-white" />

    {/* Hero */}
    <div className="mx-auto max-w-[1200px] px-6 pt-36 pb-20">
      <div className="max-w-[720px] space-y-4">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-14 w-[480px]" />
        <Skeleton className="h-14 w-[360px]" />
        <Skeleton className="h-5 w-[480px] mt-6" />
        <Skeleton className="h-5 w-[400px]" />
      </div>
    </div>

    {/* Story section */}
    <div className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="grid gap-12 sm:grid-cols-2 sm:gap-20">
          <div className="space-y-3">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>
    </div>

    {/* Technology pillars */}
    <div className="mx-auto max-w-[1200px] px-6 py-20">
      <Skeleton className="h-3 w-28 mb-3" />
      <Skeleton className="h-8 w-72 mb-4" />
      <Skeleton className="h-4 w-[480px]" />
      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </div>
  </div>
)

export default Loading
