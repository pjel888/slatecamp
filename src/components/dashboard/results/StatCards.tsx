import {
  Clock,
  ChartBar,
  Swap,
  Timer,
  TrendUp,
  TrendDown,
} from '@phosphor-icons/react/dist/ssr'
import { StatCard } from '@/components/shared/stat-card'
import { Eyebrow } from '@/components/ui/eyebrow'
import { cn } from '@/lib/utils'
import type { DebriefData } from '@/lib/actions/debrief'
import { SCIcon } from '@/components/graphics/icons/Icon'

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
      <StatCard
        eyebrow="Duration"
        value={sessionDurationMs ? formatDuration(sessionDurationMs) : '—'}
        className='text-center'
      />

      {/* Avg time per Q */}
      <StatCard
        eyebrow="Avg / Question"
        value={debrief && debrief.avgTimeMs > 0 ? `${Math.round(debrief.avgTimeMs / 1000)}s` : sessionDurationMs && total > 0 ? `${Math.round(sessionDurationMs / total / 1000)}s` : '—'}
        className='text-center'
      />

      {/* Readiness delta */}
      <StatCard
        eyebrow="Readiness"
        value={`${Math.round(debrief?.readinessBefore ?? 0)}% → ${Math.round(debrief?.readinessAfter ?? 0)}%`}
        trend={{
          direction: readinessDelta !== null && readinessDelta > 0 ? 'up' : readinessDelta !== null && readinessDelta < 0 ? 'down' : 'flat',
          label: `${readinessDelta !== null && readinessDelta > 0 ? '+' : ''}${readinessDelta ?? 0} Readiness`,
        }}
        color={
          readinessDelta !== null && readinessDelta > 0
            ? 'text-emerald-600'
            : readinessDelta !== null && readinessDelta < 0
              ? 'text-destructive'
              : 'text-muted-foreground'
        }
        className='text-center'
      />

      {/* Answer changes */}
      <StatCard
        eyebrow="Answer Changes"
        value={debrief ? debrief.answerChangeCount : '—'}
        trend={{
          direction: debrief && debrief.answerChangeCount > 0 ? 'up' : 'flat',
          label: debrief && debrief.answerChangeCount > 0
            ? `${debrief.answerChangesCorrect} turned correct`
            : 'Answer Changes',
        }}
        color={debrief && debrief.answerChangeCount > 0 ? 'text-emerald-600' : 'text-muted-foreground'}
        className='text-center'
      />
    </div>
  )
}

export const PacingInsight = ({ debrief }: { debrief: DebriefData }) => {
  if (!debrief.userHistoricalAvgTimeMs || debrief.avgTimeMs <= 0) return null

  return (
    <div className='mb-8 p-4 bg-muted border border-border rounded-md flex items-center gap-3'>
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
