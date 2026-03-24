import { Skeleton } from '@/components/ui/skeleton'

const Loading = () => {
  return (
    <div className="min-h-screen bg-[var(--surface-focused)] px-6 py-8">
      <div className="mx-auto max-w-[720px] space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  )
}

export default Loading
