'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { getPredictionHistory } from '@/lib/actions/quiz-v2/get-prediction-history'
import type { PredictionHistoryEntry } from '@/lib/actions/quiz-v2/get-prediction-history'

// ─── Props ──────────────────────────────────────────────────────────────────

interface PredictionComparisonProps {
  sessionId: string
  predictionScore: number
  postdictionScore: number | null
  actualScore: number
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatGap = (gap: number): string => {
  const sign = gap > 0 ? '+' : ''
  return `${sign}${gap}`
}

const getCalibrationLabel = (
  gap: number,
): { text: string; colorClass: string } => {
  const absGap = Math.abs(gap)

  if (absGap <= 5) {
    return {
      text: 'Well-calibrated',
      colorClass: 'text-success',
    }
  }

  if (gap > 0) {
    return {
      text: 'Overconfident',
      colorClass: 'text-warning',
    }
  }

  return {
    text: 'Underconfident',
    colorClass: 'text-primary',
  }
}

// ─── Score dot component ────────────────────────────────────────────────────

const ScoreDot = ({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) => (
  <div className="flex items-center gap-2.5">
    <span
      className="h-2.5 w-2.5 rounded-full shrink-0"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
    <div className="flex items-baseline gap-1.5">
      <span className="text-[13px] text-text-secondary">{label}</span>
      <span className="text-[13px] font-semibold tabular-nums text-foreground">
        {value}%
      </span>
    </div>
  </div>
)

// ─── Component ──────────────────────────────────────────────────────────────

const PredictionComparison = ({
  sessionId,
  predictionScore,
  postdictionScore,
  actualScore,
}: PredictionComparisonProps) => {
  const [_history, setHistory] = useState<PredictionHistoryEntry[]>([])
  const [trendText, setTrendText] = useState<string | null>(null)

  // Fetch prediction history for trend analysis
  useEffect(() => {
    let cancelled = false

    const loadHistory = async () => {
      const entries = await getPredictionHistory()
      if (cancelled) return
      setHistory(entries)

      // Calculate trend if at least 3 entries with actual scores
      const withActual = entries.filter((e) => e.actualScore !== null)
      if (withActual.length >= 3) {
        // Compare the average gap of the oldest half vs the newest half
        const midpoint = Math.floor(withActual.length / 2)
        const newer = withActual.slice(0, midpoint)
        const older = withActual.slice(midpoint)

        const avgGap = (arr: PredictionHistoryEntry[]): number => {
          const sum = arr.reduce(
            (acc, e) => acc + Math.abs(e.predictionScore - (e.actualScore ?? 0)),
            0,
          )
          return Math.round(sum / arr.length)
        }

        const newerGap = avgGap(newer)
        const olderGap = avgGap(older)

        if (olderGap > newerGap && olderGap - newerGap >= 3) {
          setTrendText(
            `Your calibration gap narrowed from ${formatGap(olderGap)} to ${formatGap(newerGap)} over your last ${withActual.length} sessions`,
          )
        } else if (newerGap > olderGap && newerGap - olderGap >= 3) {
          setTrendText(
            `Your calibration gap widened from ${formatGap(olderGap)} to ${formatGap(newerGap)} over your last ${withActual.length} sessions`,
          )
        }
      }
    }

    loadHistory()
    return () => {
      cancelled = true
    }
  }, [sessionId])

  const predictionGap = predictionScore - actualScore
  const calibration = getCalibrationLabel(predictionGap)

  return (
    <div className="rounded-md border border-border bg-card p-5">
      {/* Header */}
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
        Self-Assessment Accuracy
      </p>

      {/* Score dots */}
      <div className="space-y-2.5 mb-4">
        <ScoreDot label="Predicted" value={predictionScore} color="var(--primary)" />
        {postdictionScore !== null && (
          <ScoreDot
            label="Estimated after"
            value={postdictionScore}
            color="var(--muted-foreground)"
          />
        )}
        <ScoreDot label="Actual" value={actualScore} color="var(--success)" />
      </div>

      {/* Divider */}
      <div className="h-px bg-border my-4" />

      {/* Calibration gap */}
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] text-text-secondary">Calibration gap</span>
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-semibold tabular-nums text-foreground">
            {formatGap(predictionGap)}
          </span>
          <span className={cn('text-[13px] font-medium', calibration.colorClass)}>
            {calibration.text}
          </span>
        </div>
      </div>

      {/* Trend line */}
      {trendText && (
        <p className="mt-3 text-[13px] text-success">{trendText}</p>
      )}
    </div>
  )
}

PredictionComparison.displayName = 'PredictionComparison'

export { PredictionComparison }
