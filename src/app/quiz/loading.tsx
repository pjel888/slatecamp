import { Skeleton } from "@/components/ui/skeleton"

const Loading = () => (
  <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-4 w-64" />
  </div>
)

export default Loading
