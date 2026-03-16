'use client'

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SubjectMastery } from '@/lib/actions/mastery'

interface SubjectRadarChartProps {
  data: SubjectMastery[]
}

const getScoreColor = (score: number) => {
  if (score >= 80) return '#10b981' // Emerald
  if (score >= 50) return '#f97316' // Orange
  return '#ef4444' // Red
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-2 shadow-xl ring-1 ring-black/5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          {payload[0].payload.subject}
        </p>
        <p className="text-sm font-semibold text-zinc-900">
          {payload[0].value}% <span className="text-[10px] font-medium text-zinc-400">Mastery</span>
        </p>
      </div>
    )
  }
  return null
}

export function SubjectRadarChart({ data }: SubjectRadarChartProps) {
  const chartData = data.length > 0 ? data : [
    { subject: 'Syllabus', score: 0, fullMark: 100 },
    { subject: 'Foundations', score: 0, fullMark: 100 },
    { subject: 'Application', score: 0, fullMark: 100 },
  ]

  const maxScore = Math.max(...chartData.map(d => d.score), 1)
  const innerColor = getScoreColor(0)
  const midColor = getScoreColor(maxScore / 2)
  const outerColor = getScoreColor(maxScore)

  return (
    <Card className='border-zinc-200 bg-white shadow-none'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-sm font-medium tracking-tight text-zinc-600'>
          Subject Mastery Profile
        </CardTitle>
        <p className='text-xs text-zinc-500'>
          Radial distribution of domain readiness.
        </p>
      </CardHeader>
      <CardContent className='pt-0'>
        <div className='h-[320px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <RadarChart cx='50%' cy='50%' outerRadius='80%' data={chartData}>
              <defs>
                <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%" stopColor={innerColor} stopOpacity={0.9} />
                  <stop offset="50%" stopColor={midColor} stopOpacity={0.7} />
                  <stop offset="100%" stopColor={outerColor} stopOpacity={0.8} />
                </radialGradient>
              </defs>
              <PolarGrid stroke='#e4e4e7' strokeWidth={1} />
              <PolarAngleAxis
                dataKey='subject'
                tick={{ fill: '#71717a', fontSize: 10, fontWeight: 500 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e4e4e7', strokeWidth: 1 }} />
              <Radar
                name='Mastery'
                dataKey='score'
                stroke={outerColor}
                strokeWidth={2}
                fill="url(#radarGradient)"
                fillOpacity={0.5}
                dot={{ r: 3, fill: '#ffffff', stroke: outerColor, strokeWidth: 2 }}
                activeDot={{ r: 5, fill: '#ffffff', stroke: '#1d1d1f', strokeWidth: 2 }}
                animationDuration={1500}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        <div className='mt-2 grid grid-cols-2 gap-2 border-t border-zinc-100 pt-3'>
          {chartData.map((item) => (
            <div key={item.subject} className='flex items-center justify-between gap-2 px-1'>
              <span className='truncate text-[10px] font-medium text-zinc-500 uppercase tracking-wider'>
                {item.subject}
              </span>
              <div className="flex items-center gap-1.5">
                <div 
                  className="h-1.5 w-1.5 rounded-full" 
                  style={{ backgroundColor: getScoreColor(item.score) }} 
                />
                <span className='text-[11px] font-semibold text-zinc-900'>
                  {item.score}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
