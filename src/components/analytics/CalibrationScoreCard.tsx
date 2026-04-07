'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import { ChartCoachingAnnotation } from './ChartCoachingAnnotation'
import { CalibrationCurve } from './CalibrationCurve'
import type { CalibrationData } from '@/lib/actions/analytics/get-calibration-data'

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
  data: CalibrationData | null
}

// ── Coaching Logic ───────────────────────────────────────────────────────────

const buildCoachingMessage = (
  data: CalibrationData,
): { text: string; variant: 'insight' | 'warning' | 'success' } => {
  const confidentPct = Math.round(data.confidentAccuracy * 100)
  const guessingPct = Math.round(data.guessingAccuracy * 100)

  if (data.confidentAccuracy < 0.7) {
    return {
      text: `When you feel confident, you're right only ${confidentPct}% of the time. Focus on your "confident but wrong" topics.`,
      variant: 'warning',
    }
  }

  if (data.guessingAccuracy > 0.5) {
    return {
      text: `You're underestimating yourself -- ${guessingPct}% of your "guesses" are correct. Trust your knowledge more.`,
      variant: 'insight',
    }
  }

  return {
    text: 'Your self-assessment is well-calibrated. Keep it up.',
    variant: 'success',
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export const CalibrationScoreCard = ({ data }: Props) => {
  if (!data) {
    return (
      <Card className="border-border bg-card rounded-md shadow-none p-2 relative h-full min-h-[280px] flex flex-col">
        <RichInfoPopover
          title="Calibration Score"
          description="Measures how well your confidence matches your actual accuracy using the Brier Score. A score of 100 means perfect calibration."
        />
        <CardHeader className="p-2 pt-1">
          <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
            Calibration Score
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            Complete study sessions with confidence ratings to see your
            calibration profile.
          </p>
          <p className="text-xs text-muted-foreground">
            This chart shows how well your self-assessed confidence matches your
            actual performance.
          </p>
        </CardContent>
      </Card>
    )
  }

  const coaching = buildCoachingMessage(data)
  const clampedScore = Math.max(0, Math.min(100, data.score))

  return (
    <Card className="border-border bg-card rounded-md shadow-none p-2 relative">
      <RichInfoPopover
        title="Calibration Score"
        description="Measures how well your confidence matches your actual accuracy using the Brier Score. The dashed diagonal is perfect calibration. Blue dots show your actual accuracy at each confidence level."
      />
      <CardHeader className="p-2 pt-1">
        <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
          Calibration Score
        </CardTitle>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-xl font-extrabold tabular-nums text-primary">
            {clampedScore}
          </span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
          How well your confidence matches your actual performance
        </p>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <CalibrationCurve
          confidentAccuracy={data.confidentAccuracy}
          guessingAccuracy={data.guessingAccuracy}
          partlyAccuracy={data.partlyAccuracy}
        />
        <ChartCoachingAnnotation text={coaching.text} variant={coaching.variant} />
      </CardContent>
    </Card>
  )
}
