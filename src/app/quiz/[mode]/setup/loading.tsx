import { Skeleton } from "@/components/ui/skeleton"

const Loading = () => (
  <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-4 max-w-lg mx-auto">
    <Skeleton className="h-10 w-56" />
    <Skeleton className="h-4 w-72" />
    <Skeleton className="h-64 w-full rounded-md" />
    <Skeleton className="h-12 w-48 rounded-sm" />
  </div>
)

export default Loading
