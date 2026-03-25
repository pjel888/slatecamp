/* TrailDayCardSkeleton — pulsing placeholder for TrailDayCard */

export const TrailDayCardSkeleton = () => (
  <div
    className="bg-card border border-border rounded-md p-4 flex items-center gap-3 animate-pulse"
    aria-hidden="true"
  >
    {/* Day badge */}
    <div className="flex-shrink-0 h-8 w-8 rounded-sm bg-muted" />

    {/* Content */}
    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
      <div className="h-3 w-3/5 rounded-sm bg-muted" />
      <div className="h-2 w-1/4 rounded-sm bg-muted" />
    </div>
  </div>
)
