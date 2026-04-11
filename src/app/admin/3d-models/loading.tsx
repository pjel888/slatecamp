import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      <header className="shrink-0 border-b border-border bg-card px-6 py-4">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
          <div className="flex items-center gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-1.5"
              >
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-[340px] shrink-0 flex-col border-r border-border bg-card">
          <div className="shrink-0 border-b border-border px-3 py-2.5">
            <Skeleton className="h-9 w-full rounded-sm" />
          </div>
          <div className="flex-1 space-y-3 overflow-hidden px-3 py-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="space-y-2 rounded-md px-2 py-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="ml-6 h-3 w-20" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-background px-6 py-5">
          <div className="mx-auto flex h-full max-w-4xl flex-col gap-5">
            <div className="space-y-3 rounded-md border border-border bg-card p-5">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-3 rounded-md border border-border bg-card p-5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>

            <div className="flex-1 rounded-md border border-border bg-card p-5">
              <div className="space-y-3">
                <Skeleton className="h-5 w-40" />
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full rounded-md" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
