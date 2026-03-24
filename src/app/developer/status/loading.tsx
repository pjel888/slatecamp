export default function Loading() {
  return (
    <div className="max-w-4xl animate-pulse">
      <div className="h-3 w-[120px] bg-muted rounded-sm mb-3" />
      <div className="mb-5 space-y-2">
        <div className="h-2 w-[80px] bg-muted rounded-sm" />
        <div className="h-6 w-[220px] bg-muted rounded-sm" />
        <div className="h-3 w-[350px] bg-muted rounded-sm" />
      </div>
      {/* Banner */}
      <div className="h-12 w-full bg-muted/40 rounded-md mb-4" />
      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-md p-4 space-y-3">
            <div className="h-2 w-[60px] bg-muted rounded-sm" />
            <div className="h-7 w-[80px] bg-muted rounded-sm" />
            <div className="h-3 w-[70px] bg-muted rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  )
}
