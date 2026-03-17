'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, ReferenceArea, Cell,
} from 'recharts'
import { ChartCoachingAnnotation } from './ChartCoachingAnnotation'
import type { PacingQuadrantPoint } from '@/lib/actions/analytics'

interface Props {
  data: PacingQuadrantPoint[]
  targetTimeMs: number
  passingAccuracy: number
}

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill={payload.color} fillOpacity={0.85} stroke="#fff" strokeWidth={1.5} />
    </g>
  )
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as PacingQuadrantPoint
  const secs = Math.round(d.avgTimeMs / 1000)
  return (
    <div className="rounded-md bg-white p-2 text-xs" style={{ borderRadius: '8px', border: '1px solid #D4DAE3', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: '12px' }}>
      <p className="font-bold mb-1" style={{ color: '#1A2332' }}>{d.subject}</p>
      <p style={{ color: '#4A5568' }}>{secs}s avg · {d.accuracy}% accuracy · {d.questionCount}Q</p>
    </div>
  )
}

function getQuadrant(d: PacingQuadrantPoint, targetMs: number, passing: number) {
  const fast = d.avgTimeMs < targetMs
  const accurate = d.accuracy >= passing
  if (fast && accurate) return 'mastered'
  if (!fast && accurate) return 'careful'
  if (fast && !accurate) return 'rushing'
  return 'overthinking'
}

function buildCoaching(data: PacingQuadrantPoint[], targetMs: number, passing: number): string | null {
  const rushing = data.filter(d => getQuadrant(d, targetMs, passing) === 'rushing')
  const overthinking = data.filter(d => getQuadrant(d, targetMs, passing) === 'overthinking')
  if (rushing.length > 0) {
    const names = rushing.map(d => d.subject.split(' ').slice(-1)[0]).join(', ')
    return `You answer ${names} faster than other subjects — and score lower. Try slowing down: spend 30 more seconds per question.`
  }
  if (overthinking.length > 0) {
    const names = overthinking.map(d => d.subject.split(' ').slice(-1)[0]).join(', ')
    return `${names} are taking extra time without a corresponding accuracy gain. Try flagging uncertain questions and moving on.`
  }
  return null
}

export function PacingQuadrant({ data, targetTimeMs, passingAccuracy }: Props) {
  if (data.length === 0) {
    return (
      <Card className="border-border bg-white p-2 relative h-full min-h-[320px] flex flex-col">
        <RichInfoPopover title="Pacing vs. Accuracy" description="Reveals whether you're rushing, overthinking, or mastering material across subjects." />
        <CardHeader className="p-2 pt-1">
          <CardTitle className="text-[11px] font-bold tracking-wider uppercase" style={{ color: '#4A5568' }}>Pacing vs. Accuracy</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-2">
          <p className="text-sm font-medium" style={{ color: '#4A5568' }}>Complete quizzes across multiple subjects to unlock your Pacing Profile.</p>
          <p className="text-xs" style={{ color: '#8896A7' }}>This chart reveals where you're rushing, overthinking, or mastering the material.</p>
        </CardContent>
      </Card>
    )
  }

  const targetSec = targetTimeMs / 1000
  const maxSec = Math.max(...data.map(d => d.avgTimeMs / 1000), targetSec) + 20
  const coaching = buildCoaching(data, targetTimeMs, passingAccuracy)

  return (
    <Card className="border-border bg-white p-2 relative">
      <RichInfoPopover title="Pacing vs. Accuracy" description="Each dot is a subject. Fast + accurate = Mastered. Fast + inaccurate = Rushing. Slow + accurate = Careful. Slow + inaccurate = Overthinking." />
      <CardHeader className="p-2 pt-1">
        <CardTitle className="text-[11px] font-bold tracking-wider uppercase" style={{ color: '#4A5568' }}>Pacing vs. Accuracy</CardTitle>
      </CardHeader>
      <CardContent className="p-0 px-1 pb-2">
        {/* Quadrant labels */}
        <div className="relative">
          <div className="absolute inset-0 pointer-events-none z-10 flex">
            <div className="flex-1 flex flex-col">
              <div className="flex-1 flex items-start justify-start pl-8 pt-1">
                <span className="text-[11px] font-bold text-green-600 uppercase tracking-wider">✓ Mastered</span>
              </div>
              <div className="flex-1 flex items-end justify-start pl-8 pb-1">
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Rushing</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex-1 flex items-start justify-end pr-4 pt-1">
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Careful</span>
              </div>
              <div className="flex-1 flex items-end justify-end pr-4 pb-1">
                <span className="text-[11px] font-bold text-red-500 uppercase tracking-wider">Overthinking</span>
              </div>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D4DAE3" />
                <XAxis
                  type="number" dataKey="avgTimeMs"
                  tickFormatter={v => `${Math.round(v / 1000)}s`}
                  domain={[0, maxSec * 1000]}
                  axisLine={false} tickLine={false}
                  tick={{ fill: '#4A5568', fontSize: 11 }}
                  label={{ value: 'Avg Seconds / Question', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#4A5568' }}
                />
                <YAxis
                  type="number" dataKey="accuracy"
                  domain={[0, 100]}
                  tickFormatter={v => `${v}%`}
                  axisLine={false} tickLine={false}
                  tick={{ fill: '#4A5568', fontSize: 11 }}
                  width={32}
                />
                <Tooltip content={<CustomTooltip />} />
                {/* Quadrant backgrounds */}
                <ReferenceArea x1={0} x2={targetTimeMs} y1={passingAccuracy} y2={100} fill="#2D9F6F" fillOpacity={0.03} />
                <ReferenceArea x1={targetTimeMs} x2={maxSec * 1000} y1={passingAccuracy} y2={100} fill="#1B3FC4" fillOpacity={0.03} />
                <ReferenceArea x1={0} x2={targetTimeMs} y1={0} y2={passingAccuracy} fill="#D4951A" fillOpacity={0.04} />
                <ReferenceArea x1={targetTimeMs} x2={maxSec * 1000} y1={0} y2={passingAccuracy} fill="#ef4444" fillOpacity={0.03} />
                {/* Reference lines */}
                <ReferenceLine x={targetTimeMs} stroke="#D4DAE3" strokeDasharray="4 4" strokeWidth={1} />
                <ReferenceLine y={passingAccuracy} stroke="#D4DAE3" strokeDasharray="4 4" strokeWidth={1} />
                <Scatter data={data} shape={<CustomDot />}>
                  {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 px-2 mt-1">
          {data.map(d => (
            <div key={d.subject} className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-[11px] truncate max-w-[120px]" style={{ color: '#4A5568' }}>{d.subject}</span>
            </div>
          ))}
        </div>
        {coaching && <ChartCoachingAnnotation text={coaching} variant="warning" />}
      </CardContent>
    </Card>
  )
}
