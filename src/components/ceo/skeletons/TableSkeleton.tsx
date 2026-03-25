export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="bg-card border border-border rounded-md animate-pulse overflow-hidden">
    <div className="p-4">
      <div className="h-2 w-32 bg-muted rounded-sm mb-4" />
    </div>
    <div className="border-t border-border">
      <div className="h-10 bg-muted/30" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 border-t border-border bg-muted/10" />
      ))}
    </div>
  </div>
)
