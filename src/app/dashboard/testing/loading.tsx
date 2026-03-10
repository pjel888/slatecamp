import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton for /dashboard/testing while RSC payload loads.
 * Mirrors: title + subtitle, tab bar, then content grid.
 */
export default function TestingLoading() {
  return (
    <div className='animate-in fade-in-0 duration-150 space-y-6'>
      {/* Title */}
      <div>
        <Skeleton className='h-7 w-28' />
        <Skeleton className='mt-2 h-4 w-80' />
      </div>

      {/* Tab bar */}
      <div className='flex gap-1 border-b border-border'>
        {['Quiz', 'Review', 'Library', 'Sessions'].map((tab) => (
          <Skeleton key={tab} className='h-9 w-20 rounded-t-lg' />
        ))}
      </div>

      {/* Content area: subject cards grid */}
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className='rounded-xl border border-border bg-card p-4 space-y-3'
          >
            <div className='flex items-center gap-3'>
              <Skeleton className='h-10 w-10 shrink-0 rounded-xl' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-3 w-2/3' />
              </div>
            </div>
            <Skeleton className='h-1.5 w-full rounded-full' />
          </div>
        ))}
      </div>
    </div>
  )
}
