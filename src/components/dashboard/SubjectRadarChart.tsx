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
import { RichInfoPopover } from './RichInfoPopover'

interface SubjectRadarChartProps {
  data: SubjectMastery[]
}

const getScoreColor = (score: number) => {
  if (score >= 80) return '#16a34a' // green-600
  if (score >= 50) return '#d97706' // amber-600
  return '#dc2626' // red-600
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-md bg-white p-2" style={{ borderRadius: '6px', border: '1px solid #d0d7de', boxShadow: 'none', fontSize: '12px' }}>
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          {payload[0].payload.subject}
        </p>
        <p className="text-sm font-semibold text-zinc-900">
          {payload[0].value}% <span className="text-xs font-medium text-zinc-400">Mastery</span>
        </p>
      </div>
    )
  }
  return null
}

export function SubjectRadarChart({ data }: SubjectRadarChartProps) {
  if (data.length === 0) {
    return (
      <Card className='border-border bg-white p-2 flex flex-col h-full relative min-h-[280px]'>
        <RichInfoPopover title="Domain Readiness Map" description="Radial distribution of competence across the core syllabus." />
        <CardHeader className='p-2 pt-1'>
          <CardTitle className='text-[11px] font-bold tracking-wider text-zinc-500 uppercase'>
            Subject Mastery Profile
          </CardTitle>
        </CardHeader>
        <CardContent className='p-0 flex-1 flex flex-col items-center justify-center gap-2 text-center px-4'>
          <p className='text-sm font-medium text-zinc-500'>
            Complete quizzes across subjects to build your mastery profile.
          </p>
          <p className='text-xs text-zinc-400'>Your radar will appear here after your first session.</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = data

  const maxScore = Math.max(...chartData.map(d => d.score), 1)
  const outerColor = getScoreColor(maxScore)

  return (
    <Card className='border-border bg-white p-2 flex flex-col h-full relative'>
      <RichInfoPopover title="Domain Readiness Map" description="Radial distribution of competence across the core syllabus. The perimeter represents complete mastery." />
      <CardHeader className='p-2 pt-1'>
        <CardTitle className='text-[11px] font-bold tracking-wider text-zinc-500 uppercase'>
          Subject Mastery Profile
        </CardTitle>
      </CardHeader>
      <CardContent className='p-0 flex-1 flex flex-col justify-center'>
        <div className='h-[240px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <RadarChart cx='50%' cy='50%' outerRadius='80%' data={chartData}>
              {/* No gradient fills — Rams standard */}
              <PolarGrid stroke='#f4f4f5' strokeWidth={1} />
              <PolarAngleAxis
                dataKey='subject'
                tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }}
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
                strokeWidth={1.5}
                fill={outerColor}
                fillOpacity={0.12}
                dot={{ r: 2, fill: '#ffffff', stroke: outerColor, strokeWidth: 1.5 }}
                activeDot={{ r: 4, fill: '#ffffff', stroke: '#1d1d1f', strokeWidth: 1.5 }}
                animationDuration={1500}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        <div className='mt-1 grid grid-cols-2 gap-1 border-t border-border/40 pt-2 px-2'>
          {chartData.map((item) => (
            <div key={item.subject} className='flex items-center justify-between gap-1.5'>
              <span className='truncate text-[11px] font-medium text-zinc-500 uppercase tracking-tight'>
                {item.subject}
              </span>
              <div className="flex items-center gap-1">
                <div 
                  className="h-1 w-1 rounded-full" 
                  style={{ backgroundColor: getScoreColor(item.score) }} 
                />
                <span className='text-xs font-bold text-zinc-900'>
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
