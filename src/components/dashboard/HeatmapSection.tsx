import { ActivityHeatmap } from './ActivityHeatmap'
import { getHeatmapData } from '@/lib/actions/heatmap'

export async function HeatmapSection() {
  const data = await getHeatmapData()
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <ActivityHeatmap
        data={data.activityDays}
        examDates={data.examDates}
        accountCreatedAt={data.accountCreatedAt}
        signupYear={data.signupYear}
        endYear={data.endYear}
      />
    </div>
  )
}

export function HeatmapSectionSkeleton() {
  return (
    <div className='p-3 pb-2 animate-pulse'>
      <div className='flex items-start justify-between mb-4'>
        <div className='space-y-1.5'>
          <div className='h-[14px] bg-zinc-200 rounded w-24' />
          <div className='h-3 bg-zinc-100 rounded w-44' />
        </div>
        <div className='h-6 bg-zinc-100 rounded w-14' />
      </div>
      <div className='h-[84px] bg-zinc-100 rounded' />
      <div className='flex items-center justify-end gap-1 mt-2'>
        <div className='h-2.5 bg-zinc-100 rounded w-6' />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className='w-3 h-3 bg-zinc-100 rounded-md' />
        ))}
        <div className='h-2.5 bg-zinc-100 rounded w-8' />
      </div>
    </div>
  )
}
