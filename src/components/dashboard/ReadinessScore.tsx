import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type ReadinessTrend = 'up' | 'down' | 'flat'

interface ReadinessScoreProps {
  value: number
  trend: ReadinessTrend
}

const getReadinessColorClass = (value: number): string => {
  if (value < 50) return 'text-red-600'
  if (value <= 80) return 'text-amber-600'
  return 'text-green-600'
}

export const ReadinessScore = ({ value, trend }: ReadinessScoreProps) => {
  const clamped = Math.max(0, Math.min(100, Math.round(value)))

  const trendLabel =
    trend === 'up' ? 'Improving' : trend === 'down' ? 'Softening' : 'Stable'

  return (
    <Card className='border-zinc-200 bg-white shadow-none'>
      <CardHeader className='flex flex-row items-start justify-between gap-4 pb-2'>
        <div>
          <CardTitle className='text-sm font-medium tracking-tight text-zinc-600'>
            Readiness Score
          </CardTitle>
          <p className='mt-1 text-xs text-zinc-500'>
            EMA + IRT calibrated, lucky-guess adjusted.
          </p>
        </div>
      </CardHeader>
      <CardContent className='flex flex-row items-end justify-between gap-6 pt-1'>
        <div className='flex flex-col'>
          <span
            className={cn(
              'font-semibold tracking-tight',
              'text-5xl sm:text-6xl',
              getReadinessColorClass(clamped),
            )}
          >
            {clamped}
            <span className='ml-1 text-2xl text-zinc-500'>%</span>
          </span>
          <span className='mt-2 text-xs text-zinc-600'>
            Brutally honest snapshot of where you stand today.
          </span>
        </div>

        <div className='flex flex-col items-end gap-1'>
          <div
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium',
              trend === 'up' && 'bg-green-50 text-green-700',
              trend === 'down' && 'bg-red-50 text-red-700',
              trend === 'flat' && 'bg-amber-50 text-zinc-600',
            )}
          >
            <span
              aria-hidden
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                trend === 'up' && 'bg-green-600',
                trend === 'down' && 'bg-red-600',
                trend === 'flat' && 'bg-amber-500',
              )}
            />
            <span>{trendLabel}</span>
          </div>
          <p className='max-w-[180px] text-right text-[11px] leading-snug text-zinc-500'>
            Recent performance is weighted more heavily than older sessions.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

