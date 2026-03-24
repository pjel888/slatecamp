import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-6 text-center">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-32 w-32 mx-auto rounded-full" />
        <Skeleton className="h-6 w-32 mx-auto" />
      </div>
    </div>
  )
}
