'use client'

import {
  Clock,
  ChartBar,
  Swap,
  Timer,
  TrendUp,
  TrendDown,
} from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Eyebrow } from '@/components/ui/eyebrow'
import { cn } from '@/lib/utils'
import type { DebriefData } from '@/lib/actions/debrief'

interface StatCardsProps {
  sessionDurationMs?: number
  total: number
  debrief: DebriefData | null
}

const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes === 0) return `${seconds}s`
  return `${minutes}m ${seconds}s`
}

export const StatCards = ({ sessionDurationMs, total, debrief }: StatCardsProps) => {
  const readinessDelta = debrief
    ? Math.round(debrief.readinessAfter) - Math.round(debrief.readinessBefore)
    : null

  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-10'>
      {/* Duration */}
      <div className='bg-white p-4 rounded-md border border-border text-center'>
        <SCIcon icon={Clock} size='sm' className='text-text-tertiary mx-auto mb-1.5' />
        <div className='text-lg font-extrabold text-text-primary'>
          {sessionDurationMs ? formatDuration(sessionDurationMs) : '—'}
        </div>
        <Eyebrow>Duration</Eyebrow>
      </div>

      {/* Avg time per Q */}
      <div className='bg-white p-4 rounded-md border border-border text-center'>
        <SCIcon icon={Timer} size='sm' className='text-text-tertiary mx-auto mb-1.5' />
        <div className='text-lg font-extrabold text-text-primary'>
          {debrief && debrief.avgTimeMs > 0 ? `${Math.round(debrief.avgTimeMs / 1000)}s` : sessionDurationMs && total > 0 ? `${Math.round(sessionDurationMs / total / 1000)}s` : '—'}
        </div>
        <Eyebrow>Avg / Question</Eyebrow>
      </div>

      {/* Readiness delta */}
      <div className='bg-white p-4 rounded-md border border-border text-center'>
        <SCIcon icon={ChartBar} size='sm' className='text-text-tertiary mx-auto mb-1.5' />
        {debrief ? (
          <>
            <div className='text-lg font-extrabold text-text-primary'>
              {Math.round(debrief.readinessBefore)}% → {Math.round(debrief.readinessAfter)}%
            </div>
            <Eyebrow className={cn(
              readinessDelta !== null && readinessDelta > 0 ? 'text-emerald' : readinessDelta !== null && readinessDelta < 0 ? 'text-destructive' : 'text-text-tertiary',
            )}>
              {readinessDelta !== null && readinessDelta > 0 ? '+' : ''}{readinessDelta ?? 0} Readiness
            </Eyebrow>
          </>
        ) : (
          <>
            <div className='text-lg font-extrabold text-emerald'>Updated</div>
            <Eyebrow>Readiness</Eyebrow>
          </>
        )}
      </div>

      {/* Answer changes */}
      <div className='bg-white p-4 rounded-md border border-border text-center'>
        <SCIcon icon={Swap} size='sm' className='text-text-tertiary mx-auto mb-1.5' />
        <div className='text-lg font-extrabold text-text-primary'>
          {debrief ? debrief.answerChangeCount : '—'}
        </div>
        <Eyebrow>
          {debrief && debrief.answerChangeCount > 0
            ? `${debrief.answerChangesCorrect} turned correct`
            : 'Answer Changes'}
        </Eyebrow>
      </div>
    </div>
  )
}

export const PacingInsight = ({ debrief }: { debrief: DebriefData }) => {
  if (!debrief.userHistoricalAvgTimeMs || debrief.avgTimeMs <= 0) return null

  return (
    <div className='mb-8 p-4 bg-[#F5F5F5] border border-border rounded-md flex items-center gap-3'>
      <SCIcon
        icon={debrief.avgTimeMs < debrief.userHistoricalAvgTimeMs ? TrendDown : TrendUp}
        size='sm'
        className={debrief.avgTimeMs < debrief.userHistoricalAvgTimeMs ? 'text-emerald' : 'text-warning'}
      />
      <p className='text-sm text-text-secondary'>
        {debrief.avgTimeMs < debrief.userHistoricalAvgTimeMs
          ? `You were faster than your average this session (${Math.round(debrief.avgTimeMs / 1000)}s vs ${Math.round(debrief.userHistoricalAvgTimeMs / 1000)}s typical).`
          : `You took more time per question this session (${Math.round(debrief.avgTimeMs / 1000)}s vs ${Math.round(debrief.userHistoricalAvgTimeMs / 1000)}s typical).`}
      </p>
    </div>
  )
}
