import { Skeleton } from '@/components/ui/skeleton'

const Loading = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
    <div className="w-full max-w-[400px] space-y-8">
      <div className="text-center space-y-2">
        <Skeleton className="h-6 w-40 mx-auto" />
        <Skeleton className="h-6 w-32 mx-auto mt-6" />
        <Skeleton className="h-4 w-44 mx-auto mt-2" />
      </div>
      <Skeleton className="h-24 rounded-md" />
      <Skeleton className="h-3 w-32 mx-auto" />
    </div>
  </div>
)

export default Loading
