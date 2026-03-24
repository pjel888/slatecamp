const Loading = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-8 w-40 bg-muted rounded-md" />
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-card border border-border rounded-md p-4 space-y-3">
        <div className="flex justify-between">
          <div className="h-5 w-48 bg-muted rounded" />
          <div className="h-6 w-20 bg-muted rounded-full" />
        </div>
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-3/4 bg-muted rounded" />
      </div>
    ))}
  </div>
)

export default Loading
