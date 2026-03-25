export const ChartSkeleton = ({ className = 'min-h-64' }: { className?: string }) => (
  <div className={`bg-card border border-border rounded-md p-4 animate-pulse ${className}`}>
    <div className="h-2 w-32 bg-muted rounded-sm mb-4" />
    <div className="flex-1 w-full bg-muted/40 rounded-sm" style={{ minHeight: '200px' }} />
  </div>
)
