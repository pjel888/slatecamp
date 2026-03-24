const Loading = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header skeleton */}
    <div className="space-y-1">
      <div className="h-3 w-16 bg-muted rounded" />
      <div className="h-6 w-40 bg-muted rounded" />
      <div className="h-4 w-64 bg-muted rounded" />
    </div>

    {/* Feed card skeleton */}
    <div className="bg-card border border-border rounded-lg p-0 overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-0"
        >
          {/* Avatar circle */}
          <div className="h-7 w-7 shrink-0 rounded-full bg-muted" />

          {/* Text lines */}
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-3 w-16 bg-muted rounded" />
          </div>

          {/* Badge */}
          <div className="h-5 w-14 bg-muted rounded shrink-0" />
        </div>
      ))}
    </div>
  </div>
)

export default Loading
