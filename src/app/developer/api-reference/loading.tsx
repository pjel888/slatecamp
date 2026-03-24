import { Skeleton } from '@/components/ui/skeleton'

export default function ApiReferenceLoading() {
  return (
    <div className="max-w-5xl space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-24 bg-muted rounded" />
        <div className="h-6 w-40 bg-muted rounded" />
        <div className="h-4 w-96 bg-muted rounded" />
      </div>
      <div className="h-10 w-80 bg-muted rounded" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
