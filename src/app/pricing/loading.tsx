import { Skeleton } from '@/components/ui/skeleton'

const Loading = () => (
  <div className="min-h-screen bg-zinc-100">
    {/* Nav placeholder */}
    <div className="h-16 border-b border-zinc-200 bg-white" />

    <div className="px-6 pt-32 pb-24 sm:pt-40">
      <div className="mx-auto max-w-[1200px] space-y-8">
        {/* Heading */}
        <div className="text-center space-y-3">
          <Skeleton className="h-12 w-64 mx-auto" />
          <Skeleton className="h-5 w-80 mx-auto" />
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-10">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    </div>
  </div>
)

export default Loading
