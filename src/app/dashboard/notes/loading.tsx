import { Skeleton } from '@/components/ui/skeleton'

export default function NotesLoading() {
  return (
    <div className="animate-in fade-in-0 duration-150 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="mt-2 h-3 w-48" />
        </div>
        <Skeleton className="h-9 w-28 rounded-sm" />
      </div>

      {/* Note cards grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-md border border-[#D4DAE3] bg-white p-4 space-y-2.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <div className="flex items-center gap-2 pt-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
