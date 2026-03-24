const Loading = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 w-48 bg-muted rounded-md" />
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-md p-4 space-y-3">
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-8 w-16 bg-muted rounded" />
        </div>
      ))}
    </div>
    <div className="bg-card border border-border rounded-md p-4 space-y-3">
      <div className="h-4 w-32 bg-muted rounded" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-10 bg-muted rounded" />
      ))}
    </div>
  </div>
)

export default Loading
