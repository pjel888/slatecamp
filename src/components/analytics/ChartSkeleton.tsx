export function ChartSkeleton({ height = 'h-[200px]' }: { height?: string }) {
  return (
    <div className={`rounded-md border border-border/50 bg-white ${height} animate-pulse`}>
      <div className="p-3 flex flex-col h-full gap-2">
        <div className="h-2 w-24 bg-zinc-100 rounded" />
        <div className="flex-1 bg-zinc-50 rounded" />
      </div>
    </div>
  )
}
