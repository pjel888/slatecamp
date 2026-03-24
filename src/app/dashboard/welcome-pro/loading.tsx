import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-lg space-y-6 p-6 text-center">
        <Skeleton className="h-10 w-64 mx-auto" />
        <Skeleton className="h-4 w-96 mx-auto" />
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <Skeleton className="h-10 w-48 mx-auto" />
      </div>
    </div>
  )
}
