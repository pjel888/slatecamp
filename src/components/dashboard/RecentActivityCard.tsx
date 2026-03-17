import Link from 'next/link'
import { FileText, CheckSquare, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { RecentActivity } from '@/lib/actions/dashboard'

interface RecentActivityCardProps {
  activities: RecentActivity[]
}

const ACTIVITY_ICONS = {
  quiz: CheckSquare,
  note: FileText,
} as const

export function RecentActivityCard({ activities }: RecentActivityCardProps) {
  if (activities.length === 0) {
    return (
      <Card className='p-4 flex flex-col justify-between h-full'>
        <div>
          <p className='text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3'>
            Recent Activity
          </p>
          <p className='text-sm text-gray-700 leading-relaxed'>
            Your recent sessions and notes will appear here.
          </p>
        </div>
        <Link
          href='/dashboard/testing'
          className='text-xs font-semibold text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center gap-1 mt-4 transition-colors'
        >
          Start first session <ArrowRight className='h-3 w-3' />
        </Link>
      </Card>
    )
  }

  return (
    <Card className='p-4 flex flex-col h-full'>
      <p className='text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3 shrink-0'>
        Recent Activity
      </p>

      <div className='flex flex-col gap-3 flex-1'>
        {activities.map((activity, idx) => {
          const Icon = ACTIVITY_ICONS[activity.type]
          return (
            <Link
              key={activity.id}
              href={activity.href}
              className='flex items-start gap-2.5 group hover:bg-zinc-50 -mx-1 px-1 py-1 rounded-md transition-colors'
            >
              <div className='p-1.5 bg-zinc-100 rounded-md shrink-0 group-hover:bg-zinc-200 transition-colors mt-0.5'>
                <Icon className='h-3 w-3 text-zinc-500' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-xs font-semibold text-zinc-900 leading-tight truncate'>
                  {activity.title}
                </p>
                <p className='text-xs text-zinc-500 mt-0.5 leading-tight'>
                  {activity.subtitle}
                </p>
              </div>
              <ArrowRight className='h-3 w-3 text-zinc-300 group-hover:text-zinc-500 mt-1 shrink-0 transition-colors' />
            </Link>
          )
        })}
      </div>

      <Link
        href='/dashboard/analytics'
        className='text-xs font-semibold text-zinc-400 hover:text-zinc-600 uppercase tracking-widest flex items-center gap-1 mt-3 pt-3 border-t border-zinc-100 transition-colors shrink-0'
      >
        View all activity <ArrowRight className='h-2.5 w-2.5' />
      </Link>
    </Card>
  )
}

export function RecentActivityCardSkeleton() {
  return (
    <div className='bg-white rounded-md border border-border p-4 flex flex-col h-full animate-pulse'>
      <div className='h-2 bg-zinc-200 rounded w-24 mb-4' />
      <div className='space-y-3 flex-1'>
        {[0, 1].map((i) => (
          <div key={i} className='flex items-start gap-2.5'>
            <div className='w-6 h-6 bg-zinc-100 rounded-md shrink-0' />
            <div className='flex-1 space-y-1.5'>
              <div className='h-3 bg-zinc-200 rounded w-3/4' />
              <div className='h-2 bg-zinc-100 rounded w-1/2' />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
