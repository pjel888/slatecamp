const Loading = () => (
  <div className="space-y-6 animate-pulse">
    <div className="space-y-1">
      <div className="h-2.5 w-12 bg-muted rounded" />
      <div className="h-6 w-40 bg-muted rounded-md" />
    </div>

    <div className="h-10 w-full bg-muted rounded-sm" />

    <div className="flex gap-4 border-b border-border pb-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-4 w-20 bg-muted rounded" />
      ))}
    </div>

    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-md border border-border p-3">
          <div className="h-4 w-16 bg-muted rounded" />
          <div className="h-4 flex-1 bg-muted rounded" />
        </div>
      ))}
    </div>
  </div>
)

export default Loading
