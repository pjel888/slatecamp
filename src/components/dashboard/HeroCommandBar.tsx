'use client'

import { useEffect, useMemo, type ReactNode } from 'react'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { ScoreDisplay } from '@/components/shared/score-display'
import { trackEvent } from '@/lib/analytics'
import type { HeroMicroStat } from '@/types/dashboard'

// ── Readiness ring SVG ──────────────────────────────────────────────────────

function ReadinessRing({ score }: { score: number }) {
  return (
    <ScoreDisplay
      value={score}
      variant='ring'
      size='xl'
      showPercentSign={false}
      ringTrackClassName='stroke-primary/20'
      ringFillClassName='text-primary'
      valueClassName='text-3xl font-extrabold text-primary'
    />
  )
}

// ── Props ───────────────────────────────────────────────────────────────────

interface ReadinessMeta {
  ceilingActive?: boolean
  ceilingValue?: number | null
  ceilingReason?: string | null
  greyPenalty?: number
}

const CEILING_COPY: Record<string, string> = {
  no_level3_correct:
    'Answer some Advanced (Level 3) questions to unlock higher scores.',
  no_level4_correct:
    'Expert (Level 4) questions are now your ceiling. Answer some to raise it.',
  no_apply_level_correct:
    'Try Apply-level questions — the LEA tests application, not just recall.',
  no_analyze_level_correct:
    'Analysis-level questions unlock the top score band.',
}

interface HeroCommandBarProps {
  userName: string
  readinessScore: number
  previousScore: number | null
  daysUntilExam: number | null
  heroStats: HeroMicroStat[]
  syllabusCoveragePercent: number
  readinessMeta?: ReadinessMeta | null
  children?: ReactNode
}

// ── Component ───────────────────────────────────────────────────────────────

export function HeroCommandBar({
  userName,
  readinessScore,
  previousScore,
  daysUntilExam,
  heroStats,
  readinessMeta,
  children,
}: HeroCommandBarProps) {
  useEffect(() => {
    trackEvent({
      event_name: 'readiness_score_viewed',
      event_properties: { current_score: readinessScore },
    })
  }, [readinessScore])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 5) return 'Good evening'
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const delta = previousScore != null ? readinessScore - previousScore : null
  const isNewUser = readinessScore === 0

  return (
    <div className='w-full h-56 shrink-0 overflow-hidden flex flex-col  border-b p-2'>
      {/* ── Top row: Ring | Greeting+Stats | Heatmap ──────────────── */}
      <div className='flex items-stretch w-full flex-1'>
        {/* SECTION 1: Readiness Score Ring */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className='flex flex-col items-start justify-start gap-1.5 pl-0 pr-2 pt-0 pb-4 cursor-default shrink-0 border-r border-border/60'>
              <div className='flex items-center gap-1'>
                <p className='font-dm-mono text-muted-foreground text-[11px] font-medium uppercase tracking-[0.15em]'>
                  Readiness Score
                </p>
                <span
                  className='inline-flex items-center justify-center h-3.5 w-3.5 rounded-full border border-border text-muted-foreground text-[11px] font-medium cursor-default'
                  aria-label='What is Readiness Score?'
                >
                  ?
                </span>
              </div>
              <ReadinessRing score={readinessScore} />
              {readinessScore > 0 && delta != null && Math.abs(delta) >= 1 ? (
                <span
                  className={[
                    'w-[128px] text-center text-[11px] font-medium',
                    delta > 0 ? 'text-success' : 'text-muted-foreground',
                  ].join(' ')}
                >
                  {delta > 0 ? `+${delta}` : delta} since last session
                </span>
              ) : null}
              {readinessMeta?.ceilingActive && readinessMeta.ceilingReason && (
                <span className='text-warning text-[11px] font-medium text-center leading-tight max-w-[140px]'>
                  Capped at {readinessMeta.ceilingValue}%.{' '}
                  {CEILING_COPY[readinessMeta.ceilingReason] ?? ''}
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side='bottom'>
            Your Readiness Score is a real-time calculation of how prepared you
            are for the Licensure Exam, based on your quiz accuracy across all
            LEA topics.
          </TooltipContent>
        </Tooltip>

        {/* SECTION 2: Greeting + Stats */}
        <div
          className='flex flex-col justify-start pt-0 pb-4 px-5 min-w-0 shrink-0 border-r border-border/60'
          style={{ width: 260 }}
        >
          <div className=''>
            <p className='font-dm-mono text-muted-foreground text-[11px] font-medium uppercase tracking-[0.2em]'>
              {greeting}
            </p>
            <h1 className='font-boldonse text-foreground text-xl font-extrabold'>
              {userName.charAt(0).toUpperCase() + userName.slice(1)}.
            </h1>
            {daysUntilExam != null && (
              <p className='font-dm-mono text-muted-foreground text-[11px] font-medium mt-0.5'>
                {daysUntilExam} days until exam
              </p>
            )}
          </div>
          {!isNewUser && (
            <>
              <div className='h-px self-stretch my-2' />
              <div className='flex items-start justify-start flex-col gap-1.5'>
                <p className='font-dm-mono text-muted-foreground text-[11px] font-bold uppercase tracking-wider'>
                  Weekly Stats
                </p>
                {heroStats.map((stat) => (
                  <Tooltip key={stat.label}>
                    <TooltipTrigger asChild>
                      <div className='flex flex-col cursor-default'>
                        <div className='flex items-baseline gap-1.5 leading-none'>
                          <span className='text-foreground text-sm font-bold tabular-nums leading-none'>
                            {stat.value}
                          </span>
                          <span className='font-dm-mono text-muted-foreground text-[10px] font-medium uppercase tracking-wider leading-none'>
                            {stat.label}
                          </span>
                          {stat.delta != null && stat.delta !== 0 && (
                            <span
                              className={[
                                'text-[11px] font-semibold',
                                stat.delta > 0
                                  ? 'text-warning'
                                  : 'text-muted-foreground',
                              ].join(' ')}
                            >
                              {stat.delta > 0 ? `+${stat.delta}` : stat.delta}
                            </span>
                          )}
                        </div>
                        {stat.description ? (
                          <span className='text-muted-foreground text-[11px]'>
                            {stat.description}
                          </span>
                        ) : null}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side='bottom'>
                      {stat.tooltip}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </>
          )}
          {isNewUser && (
            <div className='mt-4'>
              <p className='text-[11px] text-muted-foreground leading-relaxed'>
                Welcome to SlateCamp. Your weekly stats and insights will appear
                here once you begin your study sessions.
              </p>
            </div>
          )}
        </div>

        {/* SECTION 3: Study Activity Heatmap */}
        {children && (
          <div className='flex-1 min-w-0 pt-0 pb-4 px-4 overflow-hidden'>
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

export function HeroCommandBarSkeleton() {
  return (
    <div className='w-full min-h-[216px] shrink-0 overflow-hidden flex flex-col xl:min-h-[212px]'>
      <div className='flex items-stretch flex-1'>
        <div className='flex flex-col items-start gap-2 pl-0 pr-2 pt-0 pb-5 border-r border-border/60'>
          <Skeleton className='h-3 w-24 bg-muted' />
          <Skeleton className='h-[120px] w-[120px] rounded-full bg-muted' />
          <Skeleton className='h-3 w-20 bg-muted' />
        </div>
        <div
          className='pt-0 pb-4 px-5 space-y-3 border-r border-border/60'
          style={{ width: 260 }}
        >
          <Skeleton className='h-3 w-24 bg-muted' />
          <Skeleton className='h-6 w-32 bg-muted' />
          <div className='flex gap-4'>
            <Skeleton className='h-7 w-14 bg-muted' />
            <Skeleton className='h-7 w-14 bg-muted' />
            <Skeleton className='h-7 w-14 bg-muted' />
          </div>
        </div>
        <div className='flex-1 p-4'>
          <Skeleton className='h-full w-full bg-muted rounded' />
        </div>
      </div>
    </div>
  )
}
