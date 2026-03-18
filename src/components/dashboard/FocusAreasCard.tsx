import Link from 'next/link'
import { Card } from '@/components/ui/card'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import type { FocusAreaItem } from '@/types/dashboard'

const LABEL_COLORS: Record<string, string> = {
  Exploring: '#8896A7',
  Building: '#D4951A',
  Developing: '#1B3FC4',
  Strong: '#2D9F6F',
}

interface FocusAreasCardProps {
  areas: FocusAreaItem[]
}

export function FocusAreasCard({ areas }: FocusAreasCardProps) {
  return (
    <Card className='p-3 bg-white w-full border-0'>
      <div className='flex items-center gap-1.5 mb-0.5'>
        <Tooltip>
          <TooltipTrigger asChild>
            <h3
              className='text-sm font-semibold cursor-default'
              style={{ color: '#1A2332' }}
            >
              Your next focus areas
            </h3>
          </TooltipTrigger>
          <TooltipContent side='top'>
            These topics are selected because improving them will move your
            Readiness Score the fastest. Progress bars show how much of each
            topic you've covered so far.
          </TooltipContent>
        </Tooltip>
      </div>
      <p className='text-[11px] mb-3' style={{ color: '#8896A7' }}>
        Topics where practice moves your score the most
      </p>

      {areas.length === 0 ? (
        <p className='text-xs py-4 text-center' style={{ color: '#4A5568' }}>
          Complete your first quiz session to unlock your focus areas.
        </p>
      ) : (
        <div className='space-y-2.5'>
          {areas.map((area) => {
            const pct = Math.round(area.masteryWeight * 100)
            const labelColor = LABEL_COLORS[area.masteryLabel] ?? '#8896A7'

            return (
              <div key={area.topicId} className='space-y-1'>
                <div className='flex items-center justify-between'>
                  <span
                    className='text-xs font-medium truncate pr-2'
                    style={{ color: '#1A2332' }}
                  >
                    {area.topicName}
                  </span>
                  <span
                    className='font-dm-mono shrink-0 text-[11px] font-medium'
                    style={{ color: labelColor }}
                  >
                    {area.masteryLabel}
                  </span>
                </div>
                <div
                  className='h-1.5 w-full rounded-full overflow-hidden'
                  style={{ backgroundColor: '#EEF2FC' }}
                >
                  <div
                    className='h-full rounded-full'
                    style={{
                      width: `${Math.max(pct, 2)}%`,
                      backgroundColor: '#1B3FC4',
                      transition: 'width 300ms ease-out',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className='mt-3 pt-2 border-t border-page-bg'>
        <Link
          href='/dashboard/analytics'
          className='text-[11px] font-medium underline underline-offset-2'
          style={{ color: '#1B3FC4' }}
        >
          See all topics in Analytics →
        </Link>
      </div>
    </Card>
  )
}

export function FocusAreasCardSkeleton() {
  return (
    <Card className='p-3'>
      <Skeleton className='h-4 w-40 mb-1' />
      <Skeleton className='h-3 w-56 mb-3' />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className='space-y-1 mb-2'>
          <div className='flex justify-between'>
            <Skeleton className='h-3 w-32' />
            <Skeleton className='h-3 w-16' />
          </div>
          <Skeleton className='h-1.5 w-full rounded-full' />
        </div>
      ))}
    </Card>
  )
}
