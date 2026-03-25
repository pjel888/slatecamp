'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { getReadinessLabel } from '@/lib/constants/readiness'
import { trackEvent } from '@/lib/analytics'
import type { HeroMicroStat } from '@/types/dashboard'

// ── Readiness ring SVG ──────────────────────────────────────────────────────

function ReadinessRing({ score }: { score: number }) {
  const [display, setDisplay] = useState(0)
  const size = 120
  const stroke = 8
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - display / 100)

  const color = score >= 70 ? '#2D9F6F' : score >= 40 ? '#D4951A' : '#D64545'

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (prefersReduced) {
      setDisplay(score)
      return
    }

    const duration = 1000
    const start = performance.now()
    let raf: number
    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * score))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [score])

  return (
    <div className='relative inline-flex items-center justify-center'>
      <svg width={size} height={size} aria-hidden='true'>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke='rgba(255,255,255,0.15)'
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap='round'
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 200ms ease-out' }}
        />
      </svg>
      <span className='absolute text-3xl font-extrabold font-mono text-white tabular-nums'>
        {display}
      </span>
    </div>
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
  no_level3_correct: 'Answer some Advanced (Level 3) questions to unlock higher scores.',
  no_level4_correct: 'Expert (Level 4) questions are now your ceiling. Answer some to raise it.',
  no_apply_level_correct: 'Try Apply-level questions — the ALE tests application, not just recall.',
  no_analyze_level_correct: 'Analysis-level questions unlock the top score band.',
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
  syllabusCoveragePercent,
  readinessMeta,
  children,
}: HeroCommandBarProps) {
  useEffect(() => { trackEvent({ event_name: 'readiness_score_viewed', event_properties: { current_score: readinessScore } }) }, [readinessScore])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 5) return 'Good evening'
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const label = getReadinessLabel(readinessScore)
  const delta = previousScore != null ? readinessScore - previousScore : null

  return (
    <div className='w-full rounded-md bg-camp-cobalt overflow-hidden flex flex-col'>
      {/* ── Top row: Ring | Greeting+Stats | Heatmap ──────────────── */}
      <div className='flex items-stretch w-full flex-1'>
        {/* SECTION 1: Readiness Score Ring */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className='flex flex-col items-center justify-start gap-1.5 px-6 py-4 cursor-default shrink-0'>
              <div className='flex items-center gap-1'>
                <p className='font-dm-mono text-white/40 text-[11px] font-medium uppercase tracking-[0.15em]'>
                  Readiness Score
                </p>
                <span
                  className='inline-flex items-center justify-center h-3.5 w-3.5 rounded-full border border-white/30 text-white/40 text-[11px] font-medium cursor-default'
                  aria-label='What is Readiness Score?'
                >
                  ?
                </span>
              </div>
              <ReadinessRing score={readinessScore} />
              <span className='text-white/50 text-[11px] font-medium'>
                out of 100
              </span>
              <span className='text-white/70 text-[11px] font-medium'>
                {label}
              </span>
              {readinessScore > 0 && delta != null && Math.abs(delta) >= 1 ? (
                <span
                  className='text-[11px] font-medium'
                  style={{
                    color: delta > 0 ? '#8FE5B0' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {delta > 0 ? `+${delta}` : delta} since last session
                </span>
              ) : (
                <span className='text-white/50 text-[11px] font-medium'>
                  Start practicing to build your score
                </span>
              )}
              {readinessMeta?.ceilingActive && readinessMeta.ceilingReason && (
                <span className='text-camp-amber/80 text-[11px] font-medium text-center leading-tight max-w-[140px]'>
                  Capped at {readinessMeta.ceilingValue}%.{' '}
                  {CEILING_COPY[readinessMeta.ceilingReason] ?? ''}
                </span>
              )}
              {!readinessMeta?.ceilingActive && (readinessMeta?.greyPenalty ?? 0) > 0.3 && (
                <span className='text-white/40 text-[11px] font-medium text-center leading-tight max-w-[140px]'>
                  Unvisited topics are lowering your score. Explore more of the syllabus.
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side='bottom'>
            Your Readiness Score is a real-time calculation of how prepared you
            are for the board exam, based on your quiz accuracy across all ALE
            topics.
          </TooltipContent>
        </Tooltip>

        {/* Divider 1 */}
        <div className='w-px bg-white/15 self-stretch my-4' />

        {/* SECTION 2: Greeting + Stats */}
        <div
          className='flex flex-col justify-start py-4 px-5 min-w-0 shrink-0'
          style={{ width: 260 }}
        >
          <div className=''>
            <p className='font-dm-mono text-white/50 text-[11px] font-medium uppercase tracking-[0.2em]'>
              {greeting}
            </p>
            <h1 className='font-syne text-white text-xl font-extrabold tracking-tight'>
              {userName.charAt(0).toUpperCase() + userName.slice(1)}.
            </h1>
            {daysUntilExam != null && (
              <p className='font-dm-mono text-white/40 text-[11px] font-medium mt-0.5'>
                {daysUntilExam} days until exam
              </p>
            )}
          </div>
          <div className='h-px bg-white/15 self-stretch my-4' />
          <div className='flex items-start justify-start flex-col gap-3  '>
            <p className='font-dm-mono text-white/40 text-[12px] font-bold uppercase tracking-wider'>
              Weekly Stats
            </p>
            {heroStats.map((stat) => (
              <Tooltip key={stat.label}>
                <TooltipTrigger asChild>
                  <div className='flex flex-col cursor-default'>
                    <div className='flex items-baseline gap-1.5'>
                      <span className='text-white text-base font-bold tabular-nums'>
                        {stat.value}
                      </span>
                      <span className='font-dm-mono text-white/40 text-[11px] font-medium uppercase tracking-wider'>
                        {stat.label}
                      </span>
                      {stat.delta != null && stat.delta !== 0 && (
                        <span
                          className='text-[11px] font-semibold'
                          style={{
                            color:
                              stat.delta > 0
                                ? '#F5A623'
                                : 'rgba(255,255,255,0.4)',
                          }}
                        >
                          {stat.delta > 0 ? `+${stat.delta}` : stat.delta}
                        </span>
                      )}
                    </div>
                    {stat.description ? (
                      <span className='text-white/30 text-[11px]'>
                        {stat.description}
                      </span>
                    ) : null}
                  </div>
                </TooltipTrigger>
                <TooltipContent side='bottom'>{stat.tooltip}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Divider 2 */}
        {children && <div className='w-px bg-white/15 self-stretch my-4' />}

        {/* SECTION 3: Study Activity Heatmap */}
        {children && (
          <div className='flex-1 min-w-0 py-3 px-4 overflow-hidden'>
            {children}
          </div>
        )}
      </div>

      {/* ── Bottom row: Syllabus progress bar (full width) ────────── */}
      <div className='border-t border-white/10'>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className='flex items-center gap-3 px-6 py-2.5 cursor-default'>
              <span className='font-dm-mono text-white/40 text-[11px] font-medium uppercase tracking-wider shrink-0'>
                Architecture Licensure Exam (ALE) Syllabus
              </span>
              <div className='h-1.5 flex-1 rounded-full overflow-hidden bg-white/10'>
                <div
                  className='h-full rounded-full'
                  style={{
                    width: `${Math.max(syllabusCoveragePercent, 1)}%`,
                    backgroundColor: '#F5A623',
                    transition: 'width 300ms ease-out',
                  }}
                />
              </div>
              <span className='font-dm-mono text-white/60 text-[11px] font-medium tabular-nums shrink-0'>
                {syllabusCoveragePercent}% explored
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side='bottom'>
            Percentage of the 102 ALE topic areas you&apos;ve attempted at least
            one question in.
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

export function HeroCommandBarSkeleton() {
  return (
    <div className='w-full rounded-md bg-camp-cobalt overflow-hidden flex flex-col'>
      <div className='flex items-stretch flex-1'>
        <div className='flex flex-col items-center gap-2 px-6 py-5'>
          <Skeleton className='h-3 w-24 bg-white/10' />
          <Skeleton className='h-[120px] w-[120px] rounded-full bg-white/10' />
          <Skeleton className='h-3 w-20 bg-white/10' />
        </div>
        <div className='w-px bg-white/15 self-stretch my-4' />
        <div className='py-4 px-5 space-y-3' style={{ width: 260 }}>
          <Skeleton className='h-3 w-24 bg-white/10' />
          <Skeleton className='h-6 w-32 bg-white/10' />
          <div className='flex gap-4'>
            <Skeleton className='h-7 w-14 bg-white/10' />
            <Skeleton className='h-7 w-14 bg-white/10' />
            <Skeleton className='h-7 w-14 bg-white/10' />
          </div>
        </div>
        <div className='w-px bg-white/15 self-stretch my-4' />
        <div className='flex-1 p-4'>
          <Skeleton className='h-full w-full bg-white/10 rounded' />
        </div>
      </div>
      <div className='border-t border-white/10 px-6 py-2.5'>
        <Skeleton className='h-1.5 w-full bg-white/10 rounded-full' />
      </div>
    </div>
  )
}
