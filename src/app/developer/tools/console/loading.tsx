import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48" />
      <div className="rounded-lg border border-border bg-foreground p-4 space-y-2">
        <Skeleton className="h-4 w-3/4 bg-background/20" />
        <Skeleton className="h-4 w-1/2 bg-background/20" />
        <Skeleton className="h-4 w-5/6 bg-background/20" />
        <Skeleton className="h-4 w-2/3 bg-background/20" />
        <Skeleton className="h-4 w-3/4 bg-background/20" />
        <Skeleton className="h-4 w-1/3 bg-background/20" />
      </div>
    </div>
  )
}
