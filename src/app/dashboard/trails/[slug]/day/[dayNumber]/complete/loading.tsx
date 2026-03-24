import { Skeleton } from '@/components/ui/skeleton'

const DayCompleteLoading = () => (
  <div className="w-full max-w-2xl mx-auto space-y-6 py-4 animate-in fade-in-0 duration-150">
    {/* Day complete header */}
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-6 w-64" />
    </div>

    <Skeleton className="h-px w-full" />

    {/* Mastery section */}
    <div className="space-y-3">
      <Skeleton className="h-4 w-36" />
      <div className="rounded-md border border-[#D4DAE3] p-4 space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-5 w-24" />
      </div>
    </div>

    <Skeleton className="h-px w-full" />

    {/* Next day */}
    <div className="space-y-3">
      <Skeleton className="h-4 w-24" />
      <div className="rounded-md border border-[#D4DAE3] p-4 space-y-2">
        <Skeleton className="h-5 w-56" />
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-9 w-32 rounded-sm mt-2" />
      </div>
    </div>
  </div>
)

export default DayCompleteLoading
