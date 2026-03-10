import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

/**
 * Skeleton for /dashboard/sessions while RSC payload loads.
 * Mirrors: title + subtitle + button header, then list of session cards.
 */
export default function SessionsLoading() {
  return (
    <div className='animate-in fade-in-0 duration-150 space-y-6'>
      {/* Header: title + New Session button */}
      <div className='flex items-center justify-between'>
        <div>
          <Skeleton className='h-7 w-32' />
          <Skeleton className='mt-2 h-4 w-64' />
        </div>
        <Skeleton className='h-8 w-32 rounded-lg' />
      </div>

      {/* Session cards list */}
      <div className='space-y-3'>
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className='border border-border'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-5 w-20 rounded-full' />
                    <Skeleton className='h-3 w-24' />
                  </div>
                  <Skeleton className='h-3 w-32' />
                </div>
                <div className='text-right space-y-1'>
                  <Skeleton className='ml-auto h-6 w-12' />
                  <Skeleton className='ml-auto h-3 w-8' />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
