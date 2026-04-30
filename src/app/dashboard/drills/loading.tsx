import { Skeleton } from '@/components/ui/skeleton'

const LegacyQuizRedirectLoading = () => {
  return (
    <div className="px-6 py-8 w-full space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Smart suggestion card */}
      <Skeleton className="h-28 w-full rounded-lg" />

      {/* Zone 01 */}
      <div className="space-y-4">
        <Skeleton className="h-3 w-36" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-44 rounded-lg" />
          <Skeleton className="h-44 rounded-lg" />
        </div>
      </div>

      {/* Zone 02 */}
      <div className="space-y-4">
        <Skeleton className="h-3 w-44" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-44 rounded-lg" />
          <Skeleton className="h-44 rounded-lg" />
          <Skeleton className="h-44 rounded-lg" />
        </div>
      </div>

      {/* Zone 03 */}
      <div className="space-y-4">
        <Skeleton className="h-3 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-44 rounded-lg" />
          <Skeleton className="h-44 rounded-lg" />
          <Skeleton className="h-44 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default LegacyQuizRedirectLoading
