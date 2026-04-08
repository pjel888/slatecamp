import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

const AdvancedAnalyticsLoading = () => {
  return (
    <div className="flex flex-col gap-2 animate-in fade-in-0 duration-150">
      {/* Deep Insights skeleton */}
      <Card className="p-4">
        <Skeleton className="h-4 w-36 mb-3" />
        <Skeleton className="h-[180px] w-full rounded-sm" />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {['Section A', 'Section B'].map((label) => (
          <Card key={label} className="p-4">
            <Skeleton className="h-4 w-28 mb-3" />
            <Skeleton className="h-[280px] w-full rounded-sm" />
          </Card>
        ))}
      </div>
    </div>
  )
}

export default AdvancedAnalyticsLoading
