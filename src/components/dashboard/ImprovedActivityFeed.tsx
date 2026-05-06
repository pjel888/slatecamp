import Link from 'next/link'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTES } from '@/lib/routes'
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
    <div className='flex h-full min-h-0 w-full flex-col overflow-hidden border border-white/35 bg-white/35 p-3 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl'>
      <div className='flex items-center gap-1.5 mb-0.5'>
        <Tooltip>
          <TooltipTrigger asChild>
            <h3
              className='text-sm font-semibold cursor-default text-slate-950'
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
      <p className='text-[11px] mb-3 font-semibold text-slate-950'>
        Your last 7 days of study sessions
      </p>

      {sessions.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-6 gap-2'>
          <p className='text-xs text-center font-semibold text-slate-950'>
            No sessions in the last 7 days. Your activity will appear here after
            your first quiz.
          </p>
          <Link
            href={ROUTES.quiz.setup('camp')}
            className='text-[11px] font-medium underline underline-offset-2 text-primary'
          >
            Start a session →
          </Link>
        </div>
      ) : (
        <div className='min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1'>
          {sessions.map((s) => (
            <div
              key={s.sessionId}
              className='flex items-center gap-2 py-1.5'
            >
              {/* Mode badge with tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className='font-dm-mono shrink-0 rounded px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider cursor-default text-primary'
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
                <p className='text-xs font-medium truncate text-slate-950'>
                  {s.testMode} · {s.questionCount} question{s.questionCount !== 1 ? 's' : ''}
                </p>
                <p className='text-[11px] font-semibold text-slate-950'>
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
                          ? 'text-success-700'
                          : 'text-primary',
                      ].join(' ')}
                    >
                      {s.scorePercent}%
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side='top'>
                    Your score for this session. 70% is the passing threshold
                    for the LEA.
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Time */}
              <span className='shrink-0 text-[11px] font-semibold text-slate-950'>
                {formatRelative(s.updatedAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ImprovedActivityFeedSkeleton() {
  return (
    <div className='flex h-full min-h-0 flex-col rounded-md p-3'>
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
    </div>
  )
}
