import { Skeleton } from '@/components/ui/skeleton'

const Loading = () => (
  <div className="min-h-screen bg-zinc-100">
    {/* Nav placeholder */}
    <div className="h-16 border-b border-zinc-200 bg-white" />

    {/* Hero */}
    <div className="mx-auto max-w-[1200px] px-6 pt-36 pb-20">
      <div className="max-w-[720px] space-y-5">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-4/5" />
        <Skeleton className="h-5 w-[480px] mt-4" />
        <Skeleton className="h-5 w-[400px]" />
        <div className="flex gap-3 mt-6">
          <Skeleton className="h-11 w-40 rounded-sm" />
          <Skeleton className="h-11 w-32 rounded-sm" />
        </div>
      </div>
    </div>

    {/* Feature section */}
    <div className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="grid gap-6 sm:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    </div>
  </div>
)

export default Loading
