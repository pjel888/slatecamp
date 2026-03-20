import { Skeleton } from '@/components/ui/skeleton'

export default function TrailsLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-150">
      {/* Active trail card */}
      <div className="rounded-md border border-[#1B3FC4] bg-[#EEF2FC] p-4">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-5 w-32 bg-[#1B3FC4]/10" />
          <Skeleton className="h-4 w-24 bg-[#1B3FC4]/10" />
        </div>
        <Skeleton className="h-4 w-56 bg-[#1B3FC4]/10 mb-2" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-28 bg-[#1B3FC4]/10" />
          <Skeleton className="h-3 w-32 bg-[#1B3FC4]/10" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-sm bg-white mt-3" />
      </div>

      {/* Recommended trail */}
      <div>
        <Skeleton className="h-4 w-36 mb-3" />
        <div className="rounded-md border border-[#D4DAE3] bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-20 rounded-sm" />
          </div>
          <Skeleton className="h-3 w-full mb-1" />
          <Skeleton className="h-3 w-3/4 mb-3" />
          <Skeleton className="h-9 w-28 rounded-sm" />
        </div>
      </div>

      {/* Available trails grid */}
      <div>
        <Skeleton className="h-4 w-28 mb-3" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-md border border-[#D4DAE3] bg-white p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-5 w-16 rounded-sm" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <div className="flex items-center gap-2 pt-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
