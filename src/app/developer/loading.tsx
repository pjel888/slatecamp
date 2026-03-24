import { CardSkeleton, StatCardSkeleton } from '@/components/ui/skeleton'

export default function DeveloperPortalLoading() {
  return (
    <div className="max-w-5xl space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-24 bg-muted rounded" />
        <div className="h-6 w-48 bg-muted rounded" />
        <div className="h-4 w-96 bg-muted rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
