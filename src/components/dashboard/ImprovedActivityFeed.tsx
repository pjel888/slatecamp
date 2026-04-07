import Link from 'next/link'
import { Card } from '@/components/ui/card'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import type { ActivityFeedItem } from '@/types/dashboard'

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const hours = diff / (1000 * 60 * 60)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${Math.floor(hours)}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

interface ImprovedActivityFeedProps {
  sessions: ActivityFeedItem[]
}

export function ImprovedActivityFeed({ sessions }: ImprovedActivityFeedProps) {
  return (
    <Card className='p-3 bg-card h-full w-full border-0 flex flex-col min-h-0 overflow-hidden'>
      <div className='flex items-center gap-1.5 mb-0.5'>
        <Tooltip>
          <TooltipTrigger asChild>
            <h3
              className='text-sm font-semibold cursor-default text-foreground'
            >
              Recent Activity
            </h3>
          </TooltipTrigger>
          <TooltipContent side='top'>
            Every quiz session you complete appears here. CAMP and STORM refer
            to the two quiz modes — hover the badge to learn more.
          </TooltipContent>
        </Tooltip>
      </div>
      <p className='text-[11px] mb-3 text-muted-foreground'>
        Your last 7 days of study sessions
      </p>

      {sessions.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-6 gap-2'>
          <p className='text-xs text-center text-muted-foreground'>
            No sessions in the last 7 days. Your activity will appear here after
            your first quiz.
          </p>
          <Link
            href='/quiz/camp/setup'
            className='text-[11px] font-medium underline underline-offset-2 text-primary'
          >
            Start a session →
          </Link>
        </div>
      ) : (
        <div className='space-y-1.5 flex-1 min-h-0 overflow-auto'>
          {sessions.map((s) => (
            <div
              key={s.sessionId}
              className='flex items-center gap-2 py-1.5 border-b last:border-b-0 border-page-bg'
            >
              {/* Mode badge with tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className='font-dm-mono shrink-0 rounded px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider cursor-default bg-primary-50 text-primary'
                  >
                    {s.modeBadge}
                  </span>
                </TooltipTrigger>
                {s.modeTooltip && (
                  <TooltipContent side='top'>{s.modeTooltip}</TooltipContent>
                )}
              </Tooltip>

              {/* Mode + topic + question count */}
              <div className='flex-1 min-w-0'>
                <p className='text-xs font-medium truncate text-foreground'>
                  {s.testMode} · {s.questionCount} question{s.questionCount !== 1 ? 's' : ''}
                </p>
                <p className='text-[11px] text-muted-foreground'>
                  {s.subjectName ?? 'General Practice'}
                </p>
              </div>

              {/* Score pill (green ≥70, neutral <70, NEVER red) */}
              {s.scorePercent != null && (
                <Tooltip>
                  <TooltipTrigger>
                    <span
                      className={[
                        'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums cursor-default',
                        s.scorePercent >= 70
                          ? 'bg-success-50 text-success-700'
                          : 'bg-muted text-muted-foreground',
                      ].join(' ')}
                    >
                      {s.scorePercent}%
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side='top'>
                    Your score for this session. 70% is the passing threshold
                    for the ALE.
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Time */}
              <span className='shrink-0 text-[11px] text-muted-foreground'>
                {formatRelative(s.updatedAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export function ImprovedActivityFeedSkeleton() {
  return (
    <Card className='p-3 h-full'>
      <Skeleton className='h-4 w-28 mb-1' />
      <Skeleton className='h-3 w-48 mb-3' />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className='flex items-center gap-2 py-1.5'>
          <Skeleton className='h-5 w-12 rounded' />
          <Skeleton className='h-3 flex-1' />
          <Skeleton className='h-5 w-10 rounded-full' />
          <Skeleton className='h-3 w-12' />
        </div>
      ))}
    </Card>
  )
}
