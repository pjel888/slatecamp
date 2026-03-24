import { Skeleton, QuestionCardSkeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
      <QuestionCardSkeleton />
    </div>
  )
}
