'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { CAGEMetric } from '@/lib/queries/ceo/analytics/get-cage-quality'

interface Props {
  metrics: CAGEMetric[]
}

const TrendIcon = ({ trend }: { trend: CAGEMetric['trend'] }) => {
  if (trend === 'up') return <TrendingUp className="w-4 h-4 text-success" />
  if (trend === 'down') return <TrendingDown className="w-4 h-4 text-destructive" />
  return <Minus className="w-4 h-4 text-muted-foreground" />
}

export const CAGEQuality = ({ metrics }: Props) => {
  return (
    <div
      className="h-[280px] grid gap-4"
      style={{ gridTemplateColumns: `repeat(${Math.min(metrics.length, 3)}, 1fr)` }}
      role="region"
      aria-label="CAGE verification quality metrics dashboard"
    >
      {metrics.map((m) => (
        <Card key={m.metric} className="border-border bg-card flex flex-col justify-between p-4">
          <CardContent className="p-0 flex flex-col gap-2 h-full justify-between">
            <p className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
              {m.metric}
            </p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-mono font-bold tabular-nums text-foreground">
                {m.value}
              </span>
              <TrendIcon trend={m.trend} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
