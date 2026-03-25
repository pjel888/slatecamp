const Loading = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header */}
    <div className="space-y-2">
      <div className="h-3 w-16 bg-muted rounded" />
      <div className="h-7 w-64 bg-muted rounded" />
    </div>

    {/* Main content grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Thumbnail */}
      <div className="lg:col-span-1">
        <div className="rounded-md border border-border bg-card p-4 space-y-3">
          <div className="aspect-video bg-muted rounded-md" />
          <div className="h-4 w-24 bg-muted rounded" />
        </div>
      </div>

      {/* Details */}
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-md border border-border bg-card p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 w-24 bg-muted rounded shrink-0" />
              <div className="h-4 w-48 bg-muted rounded" />
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <div className="h-9 w-32 bg-muted rounded-sm" />
          <div className="h-9 w-24 bg-muted rounded-sm" />
        </div>
      </div>
    </div>
  </div>
)

export default Loading
