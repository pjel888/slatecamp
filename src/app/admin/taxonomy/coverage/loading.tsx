const Loading = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header skeleton */}
    <div className="space-y-1">
      <div className="h-3 w-16 bg-muted rounded" />
      <div className="h-6 w-56 bg-muted rounded" />
      <div className="h-4 w-80 bg-muted rounded" />
    </div>

    {/* Stats row skeleton */}
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-lg p-4 space-y-2">
          <div className="h-3 w-16 bg-muted rounded" />
          <div className="h-7 w-10 bg-muted rounded" />
        </div>
      ))}
    </div>

    {/* Legend skeleton */}
    <div className="flex gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="h-3 w-3 bg-muted rounded-sm" />
          <div className="h-3 w-12 bg-muted rounded" />
        </div>
      ))}
    </div>

    {/* Coverage grid skeletons */}
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-card border border-border rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-16 bg-muted rounded" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
        <div
          className="grid gap-1.5"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))' }}
        >
          {Array.from({ length: 8 + i * 3 }).map((_, j) => (
            <div key={j} className="h-10 bg-muted rounded-sm" />
          ))}
        </div>
      </div>
    ))}
  </div>
)

export default Loading
