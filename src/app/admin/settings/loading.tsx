const Loading = () => (
  <div className="space-y-6 animate-pulse">
    {/* Section header skeleton */}
    <div className="space-y-1">
      <div className="h-2.5 w-16 bg-muted rounded" />
      <div className="h-6 w-40 bg-muted rounded" />
      <div className="h-3.5 w-64 bg-muted rounded" />
    </div>

    {/* Table card skeleton */}
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <div className="flex gap-4 py-2">
        <div className="h-3 w-24 bg-muted rounded" />
        <div className="h-3 w-20 bg-muted rounded" />
        <div className="h-3 w-16 bg-muted rounded" />
        <div className="flex-1" />
        <div className="h-3 w-12 bg-muted rounded" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3 border-t border-border">
          <div className="h-4 w-28 bg-muted rounded" />
          <div className="h-5 w-20 bg-muted rounded-full" />
          <div className="h-4 w-14 bg-muted rounded" />
          <div className="flex-1" />
          <div className="h-7 w-16 bg-muted rounded-sm" />
        </div>
      ))}
    </div>

    {/* Assign role form skeleton */}
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 bg-muted rounded" />
        <div className="h-4 w-20 bg-muted rounded" />
      </div>
      <div className="flex gap-3">
        <div className="flex-1 space-y-1.5">
          <div className="h-2.5 w-14 bg-muted rounded" />
          <div className="h-9 w-full bg-muted rounded-sm" />
        </div>
        <div className="space-y-1.5">
          <div className="h-2.5 w-10 bg-muted rounded" />
          <div className="h-9 w-[180px] bg-muted rounded-sm" />
        </div>
        <div className="self-end">
          <div className="h-9 w-28 bg-muted rounded-sm" />
        </div>
      </div>
    </div>
  </div>
)

export default Loading
