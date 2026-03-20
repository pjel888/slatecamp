import { Skeleton } from '@/components/ui/skeleton'

export default function WikiLoading() {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar skeleton */}
        <aside className="hidden md:flex w-64 shrink-0 border-r border-zinc-200 bg-background flex-col p-2 gap-1">
          {/* Search bar */}
          <Skeleton className="h-8 w-full rounded-sm mb-2" />

          {/* Section label */}
          <Skeleton className="h-3 w-16 mb-1 ml-1" />

          {/* Tree items */}
          {[
            { w: 'w-36', indent: false },
            { w: 'w-28', indent: true },
            { w: 'w-32', indent: true },
            { w: 'w-24', indent: true },
            { w: 'w-40', indent: false },
            { w: 'w-30', indent: true },
            { w: 'w-26', indent: true },
            { w: 'w-34', indent: false },
            { w: 'w-28', indent: true },
            { w: 'w-32', indent: true },
            { w: 'w-24', indent: true },
            { w: 'w-36', indent: false },
            { w: 'w-28', indent: true },
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-2 py-1 ${item.indent ? 'ml-6' : ''}`}>
              <Skeleton className="h-3 w-3 rounded-sm shrink-0" />
              <Skeleton className={`h-3 ${item.w}`} />
            </div>
          ))}
        </aside>

        {/* Center content area */}
        <main className="flex-1 min-w-0 flex flex-col h-full">
          {/* Header bar */}
          <div className="shrink-0 border-b border-zinc-200 px-6 py-3 flex items-center gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-36" />
          </div>

          {/* Article content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-8 py-8 space-y-4">
              {/* Title */}
              <Skeleton className="h-7 w-72" />
              {/* Meta line */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
              {/* Article body paragraphs */}
              <div className="space-y-3 pt-4">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
              <Skeleton className="h-px w-full bg-zinc-100 my-2" />
              <Skeleton className="h-5 w-48" />
              <div className="space-y-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <Skeleton className="h-5 w-40 mt-4" />
              <div className="space-y-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar skeleton */}
        <aside className="hidden lg:flex w-56 shrink-0 border-l border-zinc-100 bg-zinc-50/30 flex-col p-4 gap-4">
          {/* Practice button */}
          <Skeleton className="h-9 w-full rounded-sm" />
          {/* Table of contents */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-20 mb-1" />
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-3 w-28 ml-3" />
            <Skeleton className="h-3 w-32 ml-3" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-30 ml-3" />
            <Skeleton className="h-3 w-28" />
          </div>
          {/* Related topics */}
          <div className="space-y-2 mt-2">
            <Skeleton className="h-3 w-24 mb-1" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </aside>
      </div>
    </div>
  )
}
