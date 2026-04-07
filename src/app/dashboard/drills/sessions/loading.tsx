import { Skeleton } from '@/components/ui/skeleton'

const SessionsLoading = () => {
  return (
    <div className="w-full px-6 py-8 space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-[400px] w-full rounded-lg" />
    </div>
  )
}

export default SessionsLoading
