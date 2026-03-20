import { Skeleton } from '@/components/ui/skeleton'

export default function FocusReviewLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-150">
      {/* Header */}
      <div>
        <Skeleton className="h-6 w-36 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Focus areas */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-md border border-[#D4DAE3] bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-5 w-20 rounded-sm" />
            </div>
            <Skeleton className="h-3 w-full mb-1.5" />
            <Skeleton className="h-3 w-3/4" />
            <div className="flex items-center gap-3 mt-3">
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
        ))}
      </div>

      {/* Start button */}
      <Skeleton className="h-11 w-48 rounded-sm" />
    </div>
  )
}
