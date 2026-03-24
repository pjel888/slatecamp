import { Skeleton, CardSkeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <Skeleton className="h-8 w-48 mx-auto" />
      <Skeleton className="h-4 w-64 mx-auto" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton className="h-[300px]" />
        <CardSkeleton className="h-[300px]" />
        <CardSkeleton className="h-[300px]" />
      </div>
    </div>
  )
}
