'use client'

import { Skeleton } from '@/components/ui/skeleton'

export const ReviewCalendarSkeleton = () => {
  return (
    <div className='flex min-h-0 animate-pulse flex-col rounded-md p-3'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-7 w-7 rounded-full bg-muted' />
          <div className='space-y-1'>
            <Skeleton className='h-4 w-28 bg-muted' />
            <Skeleton className='h-3 w-52 bg-muted' />
          </div>
        </div>
        <div className='flex gap-1.5'>
          <Skeleton className='h-5 w-20 rounded-full bg-muted' />
          <Skeleton className='h-5 w-20 rounded-full bg-muted' />
        </div>
      </div>

      <div className='mt-3 rounded-md px-0 py-2'>
        <Skeleton className='h-3 w-64 bg-muted' />
        <div className='mt-2 flex gap-1'>
          <Skeleton className='h-5 w-24 rounded-full bg-muted' />
          <Skeleton className='h-5 w-28 rounded-full bg-muted' />
          <Skeleton className='h-5 w-20 rounded-full bg-muted' />
        </div>
      </div>

      <div className='mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7'>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className='min-h-[96px] rounded-md p-2'>
            <Skeleton className='h-3 w-10 bg-muted' />
            <Skeleton className='mt-2 h-4 w-full rounded-full bg-muted' />
            <Skeleton className='mt-1 h-4 w-3/4 rounded-full bg-muted' />
          </div>
        ))}
      </div>

      <div className='flex items-center justify-between pt-1'>
        <Skeleton className='h-3 w-56 bg-muted' />
        <Skeleton className='h-3 w-16 bg-muted' />
      </div>
    </div>
  )
}
