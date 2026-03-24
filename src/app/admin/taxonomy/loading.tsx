const Loading = () => (
  <div className="flex gap-6 animate-pulse">
    <div className="w-[60%] space-y-2">
      <div className="h-10 bg-muted rounded-md" />
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="h-10 bg-muted rounded-md" style={{ marginLeft: `${(i % 3) * 24}px` }} />
      ))}
    </div>
    <div className="w-[40%] bg-card border border-border rounded-xl p-4 space-y-4">
      <div className="h-4 w-24 bg-muted rounded" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 w-16 bg-muted rounded" />
          <div className="h-9 bg-muted rounded-md" />
        </div>
      ))}
    </div>
  </div>
)

export default Loading
