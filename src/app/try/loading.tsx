import { Skeleton } from '@/components/ui/skeleton'

const Loading = () => (
  <main className="min-h-screen bg-muted flex items-center justify-center px-6">
    <div className="w-full max-w-xl space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
      {/* Question card */}
      <Skeleton className="h-48" />
      {/* Answer options */}
      <div className="space-y-3">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    </div>
  </main>
)

export default Loading
