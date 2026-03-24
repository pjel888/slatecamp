import { Skeleton } from '@/components/ui/skeleton'

const SetupSkeleton = () => (
  <div className="px-6 py-8 max-w-[720px] mx-auto space-y-6">
    {/* Back link */}
    <Skeleton className="h-4 w-28" />

    {/* Header */}
    <div className="space-y-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-5 w-full max-w-md" />
    </div>

    {/* Question count section */}
    <div className="space-y-3">
      <Skeleton className="h-4 w-40" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-16 rounded-full" />
        <Skeleton className="h-10 w-16 rounded-full" />
        <Skeleton className="h-10 w-16 rounded-full" />
        <Skeleton className="h-10 w-16 rounded-full" />
      </div>
    </div>

    {/* Confidence section */}
    <div className="space-y-3">
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-5 w-full max-w-sm" />
      <div className="space-y-3 mt-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>

    {/* CTA button */}
    <Skeleton className="h-11 w-full rounded-sm" />
  </div>
)

export { SetupSkeleton }
