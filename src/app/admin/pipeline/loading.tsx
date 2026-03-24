const Loading = () => (
  <div className="space-y-6 animate-pulse">
    <div className="space-y-1">
      <div className="h-2.5 w-12 bg-muted rounded" />
      <div className="h-6 w-48 bg-muted rounded-md" />
      <div className="h-3.5 w-64 bg-muted rounded" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, col) => (
        <div key={col} className="rounded-lg border border-border p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-4 w-6 bg-muted rounded" />
          </div>
          {Array.from({ length: col === 2 ? 4 : 2 }).map((_, row) => (
            <div key={row} className="rounded-md border border-border p-2.5 space-y-1.5">
              <div className="h-4 w-3/4 bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted rounded" />
              <div className="h-2.5 w-12 bg-muted rounded" />
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
)

export default Loading
