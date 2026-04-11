import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex h-full min-h-[calc(100vh-8rem)] flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-9 w-28 rounded-sm" />
      </div>

      <div className="flex flex-1 overflow-hidden rounded-md border border-border bg-card">
        <div className="hidden w-[300px] shrink-0 border-r border-border lg:flex lg:flex-col">
          <div className="border-b border-border px-4 py-3">
            <Skeleton className="h-9 w-full rounded-sm" />
          </div>
          <div className="space-y-3 px-4 py-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-3 p-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="rounded-md border border-border bg-background">
              <div className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="h-4 w-4 rounded-sm" />
                <Skeleton className="h-4 w-56 max-w-full" />
                <Skeleton className="ml-auto h-6 w-20 rounded-full" />
              </div>
              <div className="space-y-3 border-t border-border px-4 py-4">
                {Array.from({ length: 3 }).map((_, rowIndex) => (
                  <div key={rowIndex} className="grid grid-cols-[16rem_6rem_7rem_6rem] gap-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
