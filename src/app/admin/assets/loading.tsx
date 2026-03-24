const Loading = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-32 bg-muted rounded-md border-2 border-dashed border-border" />
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-md p-4 space-y-3">
          <div className="h-32 bg-muted rounded-md" />
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-3 w-16 bg-muted rounded" />
        </div>
      ))}
    </div>
  </div>
)

export default Loading
