import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

/**
 * Skeleton for /dashboard/notes while RSC payload loads.
 * Mirrors: title + subtitle + create button, then grid of note cards.
 */
export default function NotesLoading() {
  return (
    <div className='animate-in fade-in-0 duration-150 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <Skeleton className='h-7 w-20' />
          <Skeleton className='mt-2 h-4 w-56' />
        </div>
        <Skeleton className='h-8 w-28 rounded-lg' />
      </div>

      {/* Note cards grid */}
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className='border border-border'>
            <CardContent className='p-4 space-y-3'>
              <Skeleton className='h-5 w-3/4' />
              <Skeleton className='h-3 w-full' />
              <Skeleton className='h-3 w-2/3' />
              <div className='flex items-center gap-2 pt-2'>
                <Skeleton className='h-3 w-16' />
                <Skeleton className='h-3 w-20' />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
