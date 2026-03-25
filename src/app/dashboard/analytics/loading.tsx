import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function AnalyticsLoading() {
  return (
    <div className="flex flex-col gap-2 animate-in fade-in-0 duration-150">
      {/* Summary Metrics Bar */}
      <Card className="p-3">
        <div className="flex items-center gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-14" />
            </div>
          ))}
        </div>
      </Card>

      {/* Study Timeline Heatmap */}
      <Card className="p-4">
        <Skeleton className="h-4 w-36 mb-3" />
        <div className="grid grid-cols-12 gap-1">
          {Array.from({ length: 84 }).map((_, i) => (
            <Skeleton key={i} className="h-4 rounded-sm" />
          ))}
        </div>
      </Card>

      {/* Readiness Trajectory */}
      <Card className="p-4">
        <Skeleton className="h-4 w-40 mb-3" />
        <Skeleton className="h-[180px] w-full rounded-sm" />
      </Card>

      {/* Pacing Quadrant + Stamina */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-2">
        <Card className="xl:col-span-7 p-4">
          <Skeleton className="h-4 w-32 mb-3" />
          <Skeleton className="h-[320px] w-full rounded-sm" />
        </Card>
        <Card className="xl:col-span-5 p-4">
          <Skeleton className="h-4 w-28 mb-3" />
          <Skeleton className="h-[320px] w-full rounded-sm" />
        </Card>
      </div>

      {/* Radar + Memory + Pacing Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {['Subject Radar', 'Memory Health', 'Pacing Insights'].map((label) => (
          <Card key={label} className="p-4">
            <Skeleton className="h-4 w-28 mb-3" />
            <Skeleton className="h-[280px] w-full rounded-sm" />
          </Card>
        ))}
      </div>
    </div>
  )
}
