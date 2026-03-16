import { BookOpen, Target, TrendingUp } from 'lucide-react'

interface CompetenceSignalCardProps {
  totalAnswered: number
  topicsMastered: number
  readinessScore: number
}

export function CompetenceSignalCard({
  totalAnswered,
  topicsMastered,
  readinessScore,
}: CompetenceSignalCardProps) {
  const signals = [
    {
      icon: Target,
      value: topicsMastered > 0 ? topicsMastered.toString() : '—',
      label: 'Topics mastered',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      icon: BookOpen,
      value: totalAnswered > 0 ? formatCount(totalAnswered) : '—',
      label: 'Questions answered',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: TrendingUp,
      value: readinessScore > 0 ? `${readinessScore}%` : '—',
      label: 'Readiness score',
      color: 'text-zinc-700',
      bg: 'bg-zinc-50',
    },
  ]

  return (
    <div className='grid grid-cols-3 gap-2'>
      {signals.map(({ icon: Icon, value, label, color, bg }) => (
        <div
          key={label}
          className='bg-white rounded-md border border-border p-3 flex items-center gap-2.5'
        >
          <div className={`p-1.5 rounded-md ${bg} shrink-0`}>
            <Icon className={`h-3.5 w-3.5 ${color}`} />
          </div>
          <div className='min-w-0'>
            <p className={`text-base font-bold leading-none ${color}`}>{value}</p>
            <p className='text-xs text-zinc-500 mt-0.5 leading-tight truncate'>{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toString()
}

export function CompetenceSignalCardSkeleton() {
  return (
    <div className='grid grid-cols-3 gap-2'>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className='bg-white rounded-md border border-border p-3 flex items-center gap-2.5 animate-pulse'
        >
          <div className='w-7 h-7 bg-zinc-100 rounded-md shrink-0' />
          <div className='space-y-1 flex-1'>
            <div className='h-4 bg-zinc-200 rounded w-8' />
            <div className='h-2 bg-zinc-100 rounded w-16' />
          </div>
        </div>
      ))}
    </div>
  )
}
