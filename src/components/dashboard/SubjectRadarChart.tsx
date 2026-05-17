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
import { ChartBar } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'
import { EmptyState } from '@/components/shared/empty-state'
import { useChartColors } from '@/hooks/useChartColors'
import type { SubjectMastery } from '@/types/dashboard'
import { ROUTES } from '@/lib/routes'

interface SubjectRadarChartProps {
  data: SubjectMastery[]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload as SubjectMastery
    return (
      <div
        className="rounded-md bg-card px-3 py-2 border border-border shadow-sm"
      >
        <p className="text-xs font-semibold text-foreground">
          {item.subject}
        </p>
        <p className="text-[13px] font-semibold tabular-nums text-foreground">
          {item.mastery}%{' '}
          <span className="text-xs font-normal text-muted-foreground">
            · {item.questionsAnswered} answered
          </span>
        </p>
      </div>
    )
  }
  return null
}

export function SubjectRadarChart({ data }: SubjectRadarChartProps) {
  const colors = useChartColors()
  const hasData = data.some(d => d.questionsAnswered > 0)

  return (
    <div className="flex flex-col bg-card border border-border-design rounded-md overflow-hidden h-full">
      <div className="px-4 py-3 border-b border-border-design">
        <span className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.15em] text-text-2">
          Subject Mastery
        </span>
        <h3 className="text-[15px] font-semibold text-text-primary mt-0.5">
          Your LEA Coverage
        </h3>
      </div>

      <div className="flex-1 p-4 min-h-0 flex flex-col items-center justify-center">
        {!hasData ? (
          <EmptyState
            icon={<ChartBar size={20} />}
            title="Mastery data builds as you practice"
            description="Complete a quiz session and your subject coverage will appear here."
            action={
              <Link
                href={ROUTES.dashboard.quiz}
                className="inline-flex h-8 items-center justify-center rounded-sm bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Start a quiz
              </Link>
            }
          />
        ) : (
          <div className="w-full h-[260px]">
            <div
              role="img"
              aria-label="Subject mastery radar chart showing coverage across LEA exam subject areas"
              className="h-full min-h-0 w-full min-w-0"
            >
            <ResponsiveContainer
              width="100%"
              height="100%"
              initialDimension={{ width: 1, height: 1 }}
            >
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
                <PolarGrid stroke={colors.gridStroke} strokeWidth={1} />
                <PolarAngleAxis
                  dataKey="shortLabel"
                  tick={{ fill: colors.textSecondary, fontSize: 11 }}
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
                  stroke={colors.primary}
                  strokeWidth={2}
                  fill={colors.primary}
                  fillOpacity={0.15}
                  dot={{ r: 4, fill: colors.primary, stroke: colors.primary, strokeWidth: 0 }}
                  animationDuration={300}
                  animationEasing="ease-out"
                />
              </RadarChart>
            </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
