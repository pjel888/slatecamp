import Link from 'next/link'
import { Card } from '@/components/ui/card'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import type { RecommendedAction } from '@/types/dashboard'

// Card title adapts to the action type
const CARD_TITLES: Record<string, { title: string; sub: string }> = {
  resume: {
    title: 'Continue where you left off',
    sub: 'You have an open session waiting',
  },
  blindspot: {
    title: 'Recommended next step',
    sub: 'Based on your weakest topic areas',
  },
  wiki_read: {
    title: 'Recommended next step',
    sub: 'Strengthen a topic before your next quiz',
  },
  warmup: {
    title: 'Start studying',
    sub: 'Pick up where the syllabus needs you most',
  },
}

interface NextMissionCardProps {
  action: RecommendedAction
}

export function NextMissionCard({ action }: NextMissionCardProps) {
  const cardMeta = CARD_TITLES[action.type] ?? CARD_TITLES.warmup

  return (
    <Card className='p-3 bg-white w-full border-0'>
      <div>
        {/* Header — contextual title + subheading */}
        <Tooltip>
          <TooltipTrigger asChild>
            <h3
              className='text-sm font-semibold cursor-default'
              style={{ color: '#1A2332' }}
            >
              {cardMeta.title}
            </h3>
          </TooltipTrigger>
          <TooltipContent side='top'>
            This card shows the single best action you can take right now, based
            on your open sessions and study gaps.
          </TooltipContent>
        </Tooltip>
        <p className='text-[11px] mb-3' style={{ color: '#8896A7' }}>
          {cardMeta.sub}
        </p>

        {/* Mode badge + action title */}
        <div className='flex items-start gap-2 mb-1.5'>
          {action.modeTooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className='font-dm-mono shrink-0 rounded px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider cursor-default'
                  style={{ backgroundColor: '#EEF2FC', color: '#1B3FC4' }}
                >
                  {action.type === 'resume'
                    ? 'RESUME'
                    : action.type === 'blindspot'
                      ? 'FOCUS'
                      : 'CAMP'}
                </span>
              </TooltipTrigger>
              <TooltipContent side='top'>{action.modeTooltip}</TooltipContent>
            </Tooltip>
          )}
          <p
            className='text-sm font-semibold leading-tight'
            style={{ color: '#1A2332' }}
          >
            {action.title}
          </p>
        </div>

        <p className='text-xs leading-snug mb-2' style={{ color: '#4A5568' }}>
          {action.subtitle}
        </p>

        {/* Progress bar (resume only) */}
        {action.progress && (
          <div className='flex items-center gap-2 mb-2'>
            <div
              className='h-1 flex-1 rounded-full overflow-hidden'
              style={{ backgroundColor: '#D4DAE3' }}
            >
              <div
                className='h-full rounded-full'
                style={{
                  width: `${Math.round((action.progress.current / action.progress.total) * 100)}%`,
                  backgroundColor: '#1B3FC4',
                }}
              />
            </div>
            <span
              className='font-dm-mono text-[11px] font-medium'
              style={{ color: '#8896A7' }}
            >
              {action.progress.current}/{action.progress.total}
            </span>
          </div>
        )}

        {/* Footer: time + CTA */}
        <div className='flex items-center justify-between'>
          <span
            className='font-dm-mono text-[11px]'
            style={{ color: '#8896A7' }}
          >
            ~{action.estimatedMinutes} min
          </span>
          <Link
            href={action.href}
            className='inline-flex items-center justify-center h-7 rounded-sm px-3 text-xs font-medium'
            style={{ backgroundColor: '#E8853A', color: '#FFFFFF' }}
          >
            {action.ctaLabel} →
          </Link>
        </div>
      </div>
    </Card>
  )
}

export function NextMissionCardSkeleton() {
  return (
    <Card className='p-3'>
      <div className='space-y-2'>
        <Skeleton className='h-4 w-40' />
        <Skeleton className='h-3 w-56' />
        <Skeleton className='h-3 w-64' />
        <div className='flex justify-between mt-2'>
          <Skeleton className='h-3 w-16' />
          <Skeleton className='h-7 w-24 rounded-sm' />
        </div>
      </div>
    </Card>
  )
}
