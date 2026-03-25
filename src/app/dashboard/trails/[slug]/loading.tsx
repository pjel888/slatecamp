import { Skeleton } from '@/components/ui/skeleton'

export default function TrailDetailLoading() {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-in fade-in-0 duration-150">
      {/* Back link */}
      <Skeleton className="h-4 w-24" />

      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Stats row */}
      <div className="flex gap-4">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-28" />
      </div>

      {/* CTA */}
      <div className="rounded-md border border-border p-4 flex items-center justify-between">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-10 w-36 rounded-sm" />
      </div>

      {/* Phase map — grid of dots */}
      <div>
        <Skeleton className="h-3 w-28 mb-3" />
        <div className="grid grid-cols-7 gap-[3px]">
          {Array.from({ length: 56 }).map((_, i) => (
            <Skeleton key={i} className="w-7 h-7 rounded-[4px]" />
          ))}
        </div>
      </div>

      {/* Week previews */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-36 mb-2" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    </div>
  )
}
