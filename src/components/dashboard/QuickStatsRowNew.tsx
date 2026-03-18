import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface QuickStatsRowProps {
  totalAnswered: number
  topicsCovered: number
  totalTopics: number
  studyDaysCount: number
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return String(n)
}

/**
 * DASHBOARD: QuickStatsRow
 * Three non-redundant lifetime counters.
 * Does NOT show: avg accuracy, avg pacing, streak, exam countdown (those are Analytics).
 */
export function QuickStatsRowNew({
  totalAnswered,
  topicsCovered,
  totalTopics,
  studyDaysCount,
}: QuickStatsRowProps) {
  const stats = [
    { value: formatCount(totalAnswered), label: 'Answered' },
    { value: totalTopics > 0 ? `${topicsCovered} of ${totalTopics}` : String(topicsCovered), label: 'Topics covered' },
    { value: String(studyDaysCount), label: 'Days studied' },
  ]

  return (
    <Card
      className="border p-3 bg-white"
      style={{ borderColor: '#D4DAE3' }}
    >
      <div className="grid grid-cols-3 divide-x" style={{ borderColor: '#D4DAE3' }}>
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center px-2 py-1">
            <span
              className="text-xl font-bold tabular-nums"
              style={{ color: '#1A2332' }}
            >
              {stat.value}
            </span>
            <span
              className="font-dm-mono text-[11px] font-medium uppercase tracking-[0.12em] mt-0.5"
              style={{ color: '#8896A7' }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function QuickStatsRowSkeleton() {
  return (
    <Card className="border p-3" style={{ borderColor: '#D4DAE3' }}>
      <div className="grid grid-cols-3 divide-x" style={{ borderColor: '#D4DAE3' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center px-2 py-1 gap-1">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </Card>
  )
}
