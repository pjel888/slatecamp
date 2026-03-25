import { Skeleton } from '@/components/ui/skeleton'

const Loading = () => (
  <div className="min-h-screen bg-zinc-100">
    {/* Nav placeholder */}
    <div className="h-16 border-b border-zinc-200 bg-white" />

    {/* Hero */}
    <div className="mx-auto max-w-[1200px] px-6 pt-36 pb-20">
      <div className="max-w-[600px] space-y-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-14 w-72" />
        <Skeleton className="h-5 w-[400px] mt-6" />
        <Skeleton className="h-5 w-[320px]" />
      </div>
    </div>

    {/* Contact cards */}
    <div className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        {/* Social links */}
        <div className="mt-10 flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-sm" />
          <Skeleton className="h-9 w-9 rounded-sm" />
          <Skeleton className="h-9 w-9 rounded-sm" />
        </div>
      </div>
    </div>

    {/* FAQ grid */}
    <div className="mx-auto max-w-[1200px] px-6 py-20">
      <Skeleton className="h-10 w-10 rounded-sm mb-4" />
      <Skeleton className="h-8 w-72 mb-3" />
      <Skeleton className="h-4 w-[400px] mb-10" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  </div>
)

export default Loading
