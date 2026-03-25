import { Skeleton } from '@/components/ui/skeleton'

export default function TrailTodayLoading() {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-5 animate-in fade-in-0 duration-150">
      {/* Back link */}
      <Skeleton className="h-4 w-24" />

      {/* Day header */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-36" />
      </div>

      <div className="h-px bg-[border]" />

      {/* Step cards */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-md border border-[border] bg-white p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-5 h-5 rounded-sm" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-5 w-56" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-9 w-32 rounded-sm" />
        </div>
      ))}

      <div className="h-px bg-[border]" />

      {/* Mini heatmap */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-36" />
        <div className="flex gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="w-3 h-3 rounded-full" />
          ))}
        </div>
      </div>

      <div className="h-px bg-[border]" />

      {/* Trail ribbon */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-16 w-full rounded-md" />
      </div>
    </div>
  )
}
