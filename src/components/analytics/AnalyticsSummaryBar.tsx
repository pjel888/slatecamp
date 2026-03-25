'use client'
import type { AnalyticsSummaryMetrics } from '@/lib/actions/analytics'
import { cn } from '@/lib/utils'

interface Props { data: AnalyticsSummaryMetrics }

function Metric({ label, value, unit, accent }: { label: string; value: string | number; unit: string; accent?: boolean }) {
  return (
    <div className="bg-white p-3 flex flex-col gap-0.5">
      <span className="font-dm-mono text-[11px] font-medium text-[#6B6B6B] uppercase tracking-[0.2em] leading-none">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={cn('text-xl font-extrabold leading-none tabular-nums', accent ? 'text-primary' : 'text-[text-primary]')}>
          {value}
        </span>
        <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-tight">{unit}</span>
      </div>
    </div>
  )
}

export function AnalyticsSummaryBar({ data }: Props) {
  const pacingSec = data.avgPacingMs > 0 ? Math.round(data.avgPacingMs / 1000) : '—'
  return (
    <div className="grid grid-cols-3 md:grid-cols-5 gap-px bg-border/30 rounded-md overflow-hidden border border-border">
      <Metric label="Questions" value={data.totalQuestions} unit="Answered" />
      <Metric label="Avg Accuracy" value={data.totalQuestions > 0 ? `${data.avgAccuracy}%` : '—'} unit="Correct" />
      <Metric label="Avg Pacing" value={pacingSec} unit="Sec / Q" />
      <Metric label="Study Streak" value={data.streak} unit="Days" accent={data.streak > 0} />
      <Metric label="Exam" value={data.daysUntilExam ?? '—'} unit="Days Left" />
    </div>
  )
}
