const Loading = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-8 w-32 bg-muted rounded-md" />
    <div className="flex gap-4">
      <div className="h-10 w-40 bg-muted rounded-md" />
      <div className="h-10 w-40 bg-muted rounded-md" />
      <div className="flex-1 h-10 bg-muted rounded-md" />
    </div>
    <div className="rounded-md border border-border">
      <div className="h-12 bg-muted/50 rounded-t-md" />
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="h-12 border-t border-border bg-card" />
      ))}
    </div>
  </div>
)

export default Loading
