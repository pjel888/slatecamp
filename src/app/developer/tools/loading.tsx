import { CardSkeleton } from '@/components/ui/skeleton'

export default function ToolsLoading() {
  return (
    <div className="max-w-4xl space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-20 bg-muted rounded" />
        <div className="h-6 w-32 bg-muted rounded" />
        <div className="h-4 w-80 bg-muted rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
