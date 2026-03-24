import { Skeleton } from '@/components/ui/skeleton'

export default function DesignSystemLoading() {
  return (
    <div className="max-w-5xl space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-24 bg-muted rounded" />
        <div className="h-6 w-56 bg-muted rounded" />
        <div className="h-4 w-80 bg-muted rounded" />
      </div>
      <div className="h-10 w-96 bg-muted rounded" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
