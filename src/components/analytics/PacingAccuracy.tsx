'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, ReferenceArea, Cell,
} from 'recharts'
import { ChartCoachingAnnotation } from './ChartCoachingAnnotation'
import { QuadrantOverlay } from './QuadrantOverlay'
import { PACING_TARGET_MS, PASSING_ACCURACY } from '@/lib/constants/analytics'
import type { PacingAccuracyPoint } from '@/lib/actions/analytics/chart-data'

interface Props {
  data: PacingAccuracyPoint[]
}

interface CustomDotProps {
  cx?: number
  cy?: number
  payload?: PacingAccuracyPoint
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: PacingAccuracyPoint }>
}

const TARGET_SECONDS = PACING_TARGET_MS / 1000

const CustomDot = ({ cx, cy, payload }: CustomDotProps) => {
  if (cx == null || cy == null || !payload) return null
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={payload.color}
      fillOpacity={0.85}
      stroke="#fff"
      strokeWidth={1.5}
    />
  )
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div
      className="rounded-md bg-white p-2 text-xs"
      style={{ border: '1px solid #D4DAE3', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
    >
      <p className="font-bold mb-0.5 capitalize" style={{ color: '#1A2332' }}>{d.mode} session</p>
      <p style={{ color: '#4A5568' }}>
        {d.avgSeconds}s avg | {d.accuracy}% accuracy | {d.questionCount}Q
      </p>
    </div>
  )
}

const buildCoaching = (data: PacingAccuracyPoint[]): { text: string; variant: 'warning' | 'success' | 'insight' } | null => {
  if (data.length < 3) return null

  const optimal = data.filter(d => d.avgSeconds <= TARGET_SECONDS && d.accuracy >= PASSING_ACCURACY)
  const rushing = data.filter(d => d.avgSeconds <= TARGET_SECONDS && d.accuracy < PASSING_ACCURACY)
  const slow = data.filter(d => d.avgSeconds > TARGET_SECONDS && d.accuracy >= PASSING_ACCURACY)

  if (optimal.length >= data.length * 0.6) {
    return {
      text: `Most sessions land in the optimal zone â€” fast and accurate. Strong exam-day pace.`,
      variant: 'success',
    }
  }

  if (rushing.length > optimal.length) {
    return {
      text: `Several sessions show fast pacing but low accuracy. Try spending a few more seconds per question to improve correctness.`,
      variant: 'warning',
    }
  }

  if (slow.length > optimal.length) {
    return {
      text: `You're accurate but slower than exam pace. Practice under timed conditions to build speed without sacrificing accuracy.`,
      variant: 'insight',
    }
  }

  return null
}

// Distinct mode names for legend
const getUniqueModes = (data: PacingAccuracyPoint[]): Array<{ mode: string; color: string }> => {
  const seen = new Map<string, string>()
  for (const d of data) {
    if (!seen.has(d.mode)) seen.set(d.mode, d.color)
  }
  return Array.from(seen.entries()).map(([mode, color]) => ({ mode, color }))
}

export const PacingAccuracy = ({ data }: Props) => {
  const coaching = buildCoaching(data)
  const modes = getUniqueModes(data)

  if (data.length === 0) {
    return (
      <Card className="border-border bg-white p-2 relative h-full">
        <RichInfoPopover
          title="Session Pacing vs. Accuracy"
          description="Each dot is one session. The optimal zone is top-left (fast + accurate)."
        />
        <CardHeader className="p-2 pt-1">
          <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
            Session Pacing vs. Accuracy
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-2 min-h-[200px]">
          <p className="text-sm font-medium text-muted-foreground">
            Complete sessions to see your pacing and accuracy patterns.
          </p>
        </CardContent>
      </Card>
    )
  }

  const maxSeconds = Math.max(...data.map(d => d.avgSeconds), TARGET_SECONDS) + 30

  return (
    <Card className="border-border bg-white p-2 relative h-full">
      <RichInfoPopover
        title="Session Pacing vs. Accuracy"
        description="Each dot is one session, colored by mode. Vertical line = ALE target pace (120s). Horizontal line = 75% passing threshold. Top-left = optimal."
      />
      <CardHeader className="p-2 pt-1">
        <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
          Session Pacing vs. Accuracy
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 px-1 pb-2">
        <div className="relative">
          <QuadrantOverlay
            labels={{
              topLeft: 'Optimal',
              topRight: 'Careful',
              bottomLeft: 'Rushing',
              bottomRight: 'Struggling',
            }}
            colors={{
              topLeft: '#2D9F6F',
              topRight: '#1B3FC4',
              bottomLeft: '#D4951A',
              bottomRight: '#D64545',
            }}
            className="[&_span]:text-[10px]"
          />

          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D4DAE3" />
                <XAxis
                  type="number"
                  dataKey="avgSeconds"
                  domain={[0, maxSeconds]}
                  tickFormatter={v => `${v}s`}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4A5568', fontSize: 11 }}
                  label={{ value: 'Avg Seconds / Question', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#4A5568' }}
                />
                <YAxis
                  type="number"
                  dataKey="accuracy"
                  domain={[0, 100]}
                  tickFormatter={v => `${v}%`}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4A5568', fontSize: 11 }}
                  width={36}
                />
                <Tooltip content={<CustomTooltip />} />

                {/* Quadrant backgrounds */}
                <ReferenceArea x1={0} x2={TARGET_SECONDS} y1={PASSING_ACCURACY} y2={100} fill="#2D9F6F" fillOpacity={0.03} />
                <ReferenceArea x1={TARGET_SECONDS} x2={maxSeconds} y1={PASSING_ACCURACY} y2={100} fill="#1B3FC4" fillOpacity={0.03} />
                <ReferenceArea x1={0} x2={TARGET_SECONDS} y1={0} y2={PASSING_ACCURACY} fill="#D4951A" fillOpacity={0.04} />
                <ReferenceArea x1={TARGET_SECONDS} x2={maxSeconds} y1={0} y2={PASSING_ACCURACY} fill="#D64545" fillOpacity={0.03} />

                {/* Reference lines */}
                <ReferenceLine x={TARGET_SECONDS} stroke="#D4DAE3" strokeDasharray="4 4" strokeWidth={1} />
                <ReferenceLine y={PASSING_ACCURACY} stroke="#D4DAE3" strokeDasharray="4 4" strokeWidth={1} />

                <Scatter data={data} shape={<CustomDot />}>
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mode legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 px-2 mt-1">
          {modes.map(m => (
            <div key={m.mode} className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: m.color }} />
              <span className="text-[11px] capitalize" style={{ color: '#4A5568' }}>{m.mode}</span>
            </div>
          ))}
        </div>

        {coaching && <ChartCoachingAnnotation text={coaching.text} variant={coaching.variant} />}
      </CardContent>
    </Card>
  )
}
