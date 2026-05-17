import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function AnalyticsLoading() {
  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-2 overflow-hidden rounded-b-md rounded-tr-md border border-t-0 border-border bg-card p-2 animate-in fade-in-0 duration-150 md:grid-cols-12 md:grid-rows-1">
      <Card className="min-h-0 p-3 md:col-span-6">
        <Skeleton className="mb-3 h-3 w-36" />
        <Skeleton className="h-[calc(100%-1.5rem)] min-h-[180px] w-full rounded-sm" />
      </Card>
      {[
        'md:col-span-3',
        'md:col-span-3',
      ].map((spanClassName, index) => (
        <Card key={index} className={`min-h-0 p-3 ${spanClassName}`}>
          <Skeleton className="mb-3 h-3 w-32" />
          <Skeleton className="h-[calc(100%-1.5rem)] min-h-[160px] w-full rounded-sm" />
        </Card>
      ))}
    </div>
  )
}
