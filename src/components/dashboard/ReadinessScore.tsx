import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type ReadinessTrend = 'up' | 'down' | 'flat'

interface ReadinessScoreProps {
  value: number
  trend: ReadinessTrend
}

const getReadinessColorClass = (value: number): string => {
  if (value < 50) return 'text-slatecamp-crimson-deep-red'
  if (value <= 80) return 'text-slatecamp-amber'
  return 'text-slatecamp-sage'
}

export const ReadinessScore = ({ value, trend }: ReadinessScoreProps) => {
  const clamped = Math.max(0, Math.min(100, Math.round(value)))

  const trendLabel =
    trend === 'up' ? 'Improving' : trend === 'down' ? 'Softening' : 'Stable'

  return (
    <Card className='border-slatecamp-border bg-slatecamp-paper-snow shadow-none'>
      <CardHeader className='flex flex-row items-start justify-between gap-4 pb-2'>
        <div>
          <CardTitle className='text-sm font-medium tracking-tight text-slatecamp-ink-muted'>
            Readiness Score
          </CardTitle>
          <p className='mt-1 text-xs text-slatecamp-ink-subtle'>
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
            <span className='ml-1 text-2xl text-slatecamp-ink-muted'>%</span>
          </span>
          <span className='mt-2 text-xs text-slatecamp-ink-muted'>
            Brutally honest snapshot of where you stand today.
          </span>
        </div>

        <div className='flex flex-col items-end gap-1'>
          <div
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium',
              trend === 'up' && 'bg-slatecamp-sage-muted text-slatecamp-sage-forest',
              trend === 'down' &&
                'bg-slatecamp-crimson-bright-red/10 text-slatecamp-crimson-deep-red',
              trend === 'flat' &&
                'bg-slatecamp-amber-muted text-slatecamp-ink-muted',
            )}
          >
            <span
              aria-hidden
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                trend === 'up' && 'bg-slatecamp-sage',
                trend === 'down' && 'bg-slatecamp-crimson-deep-red',
                trend === 'flat' && 'bg-slatecamp-amber',
              )}
            />
            <span>{trendLabel}</span>
          </div>
          <p className='max-w-[180px] text-right text-[11px] leading-snug text-slatecamp-ink-subtle'>
            Recent performance is weighted more heavily than older sessions.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

