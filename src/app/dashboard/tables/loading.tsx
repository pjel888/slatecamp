import { Skeleton } from '@/components/ui/skeleton'

export default function TablesLoading() {
  return (
    <div className='flex flex-col items-center justify-center h-full px-4 py-12 space-y-8'>
      <Skeleton className='w-20 h-20 rounded-md' />
      <div className='space-y-3 text-center'>
        <Skeleton className='h-7 w-32 mx-auto' />
        <Skeleton className='h-4 w-80 mx-auto' />
      </div>
    </div>
  )
}
