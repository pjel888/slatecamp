'use client'

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type PacingTrend = 'improving' | 'declining' | 'steady'

interface PacingEnduranceGaugeProps {
  averageSecondsPerItem: number
  targetSecondsPerItem: number
  enduranceMinutes: number
  trend: PacingTrend
}

const MOCK_SERIES = [
  { label: 'W-4', secondsPerItem: 118 },
  { label: 'W-3', secondsPerItem: 111 },
  { label: 'W-2', secondsPerItem: 102 },
  { label: 'Last week', secondsPerItem: 96 },
  { label: 'Now', secondsPerItem: 92 },
]

export const PacingEnduranceGauge = ({
  averageSecondsPerItem,
  targetSecondsPerItem,
  enduranceMinutes,
  trend,
}: PacingEnduranceGaugeProps) => {
  const trendCopy =
    trend === 'improving'
      ? 'You are closing the gap between practice and exam pace.'
      : trend === 'declining'
        ? 'Your pace is drifting slower. We will surface more timed drills.'
        : 'Your pace is stable. The goal now is to extend your endurance window.'

  return (
    <Card className='border-zinc-200 bg-white shadow-none'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-sm font-medium tracking-tight text-zinc-600'>
          Pacing &amp; Endurance
        </CardTitle>
        <p className='mt-1 text-xs text-zinc-500'>
          Average time per item and how long you can hold exam-level focus.
        </p>
      </CardHeader>
      <CardContent className='space-y-4 pt-1'>
        <div className='h-32 w-full rounded-xl bg-zinc-50 px-3 py-2'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={MOCK_SERIES} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id='pacingFill' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='0%' stopColor='var(--color-ink-main)' stopOpacity={0.32} />
                  <stop offset='100%' stopColor='var(--color-ink-main)' stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey='label'
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                tick={{ fontSize: 10, fill: 'var(--color-ink-subtle)' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={32}
                tickMargin={4}
                tick={{ fontSize: 10, fill: 'var(--color-ink-subtle)' }}
              />
              <Tooltip
                cursor={{ stroke: 'var(--color-ink-faint)', strokeWidth: 1 }}
                contentStyle={{
                  borderRadius: 8,
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-paper)',
                  boxShadow: '0 1px 3px rgba(26,26,26,0.06)',
                  padding: '6px 8px',
                }}
                labelStyle={{ fontSize: 11, color: 'var(--color-ink-muted)' }}
                itemStyle={{ fontSize: 11, color: 'var(--color-ink-main)' }}
                formatter={(value) => [`${value as number}s per item`, '']}
              />
              <Area
                type='monotone'
                dataKey='secondsPerItem'
                stroke='var(--color-ink-main)'
                strokeWidth={1.5}
                fill='url(#pacingFill)'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className='grid grid-cols-2 gap-3 text-xs'>
          <div className='space-y-0.5'>
            <p className='text-zinc-600'>Current pace</p>
            <p className='text-sm font-medium tracking-tight text-zinc-900'>
              {Math.round(averageSecondsPerItem)}s / item
            </p>
            <p className='text-[11px] text-zinc-500'>
              Target: {Math.round(targetSecondsPerItem)}s per item.
            </p>
          </div>
          <div className='space-y-0.5'>
            <p className='text-zinc-600'>Endurance window</p>
            <p className='text-sm font-medium tracking-tight text-zinc-900'>
              {Math.round(enduranceMinutes)} min
            </p>
            <p className='text-[11px] text-zinc-500'>
              Time you can sustain exam pace before accuracy slips.
            </p>
          </div>
        </div>

        <p className='text-[11px] leading-snug text-zinc-500'>
          {trendCopy}
        </p>
      </CardContent>
    </Card>
  )
}

