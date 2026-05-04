/**
 * Lightweight skeleton shown inside the sidebar while the taxonomy
 * tree is still loading. Renders instantly so the user sees the
 * sidebar shape + search bar while data streams in.
 */
export const WikiSidebarSkeleton = () => (
  <aside className="w-full h-full bg-background flex flex-col overflow-hidden" aria-busy="true">
    {/* Search bar placeholder */}
    <div className="shrink-0 p-2 pb-1">
      <div className="h-8 w-full rounded-sm bg-muted animate-pulse" />
    </div>

    {/* Tree skeleton */}
    <div className="flex-1 overflow-hidden p-2 pt-1 space-y-1">
      {/* Section label */}
      <div className="flex items-center gap-1.5 px-1 mb-1.5">
        <div className="h-3 w-3 rounded-sm bg-border animate-pulse" />
        <div className="h-2.5 w-14 bg-border animate-pulse rounded" />
      </div>

      {/* Tree items — staggered widths to look natural */}
      {[
        { w: 'w-36', indent: false },
        { w: 'w-28', indent: true },
        { w: 'w-32', indent: true },
        { w: 'w-24', indent: true },
        { w: 'w-40', indent: false },
        { w: 'w-28', indent: true },
        { w: 'w-20', indent: true },
        { w: 'w-34', indent: false },
        { w: 'w-28', indent: true },
        { w: 'w-32', indent: true },
        { w: 'w-24', indent: true },
        { w: 'w-36', indent: false },
        { w: 'w-28', indent: true },
      ].map((item, i) => (
        <div
          key={i}
          className={`flex items-center gap-2 py-1 ${item.indent ? 'ml-6' : ''}`}
        >
          <div className="h-3 w-3 rounded-sm bg-border animate-pulse shrink-0" />
          <div className={`h-3 ${item.w} bg-border animate-pulse rounded`} />
        </div>
      ))}
    </div>
  </aside>
)
