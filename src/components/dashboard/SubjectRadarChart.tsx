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
import { BarChart3 } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import type { SubjectMastery } from '@/types/dashboard'

interface SubjectRadarChartProps {
  data: SubjectMastery[]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload as SubjectMastery
    return (
      <div
        className="rounded-md bg-white px-3 py-2"
        style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
      >
        <p className="text-xs font-semibold" style={{ color: '#1A2332' }}>
          {item.subject}
        </p>
        <p className="text-[13px] font-semibold tabular-nums" style={{ color: '#1A2332' }}>
          {item.mastery}%{' '}
          <span className="text-xs font-normal" style={{ color: '#6B6B6B' }}>
            · {item.questionsAnswered} answered
          </span>
        </p>
      </div>
    )
  }
  return null
}

export function SubjectRadarChart({ data }: SubjectRadarChartProps) {
  const hasData = data.some(d => d.questionsAnswered > 0)

  return (
    <div className="flex flex-col bg-white border border-[#E5E7EB] rounded-md overflow-hidden h-full">
      <div className="px-4 py-3 border-b border-[#E5E7EB]">
        <span className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.15em] text-[#6B6B6B]">
          Subject Mastery
        </span>
        <h3 className="text-[15px] font-semibold text-text-primary mt-0.5">
          Your ALE Coverage
        </h3>
      </div>

      <div className="flex-1 p-4 min-h-0 flex flex-col items-center justify-center">
        {!hasData ? (
          <EmptyState
            icon={<BarChart3 className="h-5 w-5" />}
            message="Mastery data builds as you practice"
            description="Complete a quiz session and your subject coverage will appear here."
            action={{ label: "Start a quiz", href: "/dashboard/testing" }}
          />
        ) : (
          <div className="w-full h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
                <PolarGrid stroke="#E5E7EB" strokeWidth={1} />
                <PolarAngleAxis
                  dataKey="shortLabel"
                  tick={{ fill: '#555555', fontSize: 11 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tickCount={5}
                  tick={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Radar
                  name="Mastery"
                  dataKey="mastery"
                  stroke="#1B3FC4"
                  strokeWidth={2}
                  fill="#1B3FC4"
                  fillOpacity={0.15}
                  dot={{ r: 4, fill: '#1B3FC4', stroke: '#1B3FC4', strokeWidth: 0 }}
                  animationDuration={300}
                  animationEasing="ease-out"
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
