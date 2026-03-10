import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

/**
 * Skeleton for /dashboard/analytics while RSC payload loads.
 * Mirrors: title, 4 stat cards, 2 chart cards, activity calendar, subject breakdown.
 */
export default function AnalyticsLoading() {
  return (
    <div className='animate-in fade-in-0 duration-150 space-y-8'>
      {/* Title */}
      <div>
        <Skeleton className='h-7 w-28' />
        <Skeleton className='mt-2 h-4 w-64' />
      </div>

      {/* 4 stat cards */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className='p-4'>
              <div className='flex items-center gap-3'>
                <Skeleton className='h-10 w-10 shrink-0 rounded-xl' />
                <div className='space-y-2'>
                  <Skeleton className='h-6 w-16' />
                  <Skeleton className='h-3 w-24' />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart cards */}
      <div className='grid gap-6 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <Skeleton className='h-4 w-32' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-[200px] w-full rounded-lg' />
          </CardContent>
        </Card>
      </div>

      {/* Activity calendar */}
      <Card>
        <CardHeader>
          <Skeleton className='h-4 w-20' />
        </CardHeader>
        <CardContent>
          <Skeleton className='h-[120px] w-full rounded-lg' />
        </CardContent>
      </Card>

      {/* Subject breakdown */}
      <Card>
        <CardHeader>
          <Skeleton className='h-4 w-36' />
        </CardHeader>
        <CardContent className='space-y-3'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='flex items-center gap-4'>
              <div className='flex-1 space-y-1.5'>
                <div className='flex justify-between'>
                  <Skeleton className='h-3 w-24' />
                  <Skeleton className='h-3 w-10' />
                </div>
                <Skeleton className='h-1.5 w-full rounded-full' />
              </div>
              <Skeleton className='h-3 w-10' />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
