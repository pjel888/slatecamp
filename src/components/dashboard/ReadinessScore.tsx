import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ReadinessScoreProps {
  score: number
  previousScore: number | null
}

const getReadinessColorClass = (value: number): string => {
  if (value < 40) return 'text-[#D64545]'
  if (value < 70) return 'text-[#E8853A]'
  return 'text-[#2D9F6F]'
}

const getReadinessGradient = (value: number): string => {
  if (value < 40)
    return 'bg-[radial-gradient(ellipse_at_center,_rgba(214,69,69,0.05)_0%,_transparent_70%)]'
  if (value < 70)
    return 'bg-[radial-gradient(ellipse_at_center,_rgba(232,133,58,0.05)_0%,_transparent_70%)]'
  return 'bg-[radial-gradient(ellipse_at_center,_rgba(45,159,111,0.05)_0%,_transparent_70%)]'
}

export const ReadinessScore = ({ score, previousScore }: ReadinessScoreProps) => {
  const clamped = Math.max(0, Math.min(100, Math.round(score)))

  const trend = !previousScore || score === previousScore
    ? 'flat'
    : score > previousScore ? 'up' : 'down'

  const trendLabel =
    trend === 'up' ? 'Improving' : trend === 'down' ? 'Softening' : 'Stable'

  return (
    <Card className={cn('border-border bg-white shadow-none', getReadinessGradient(clamped))}>
      <CardHeader className='flex flex-row items-start justify-between gap-4 pb-2'>
        <div>
          <CardTitle className='text-sm font-medium tracking-tight text-[#4A5568]'>
            Readiness Score
          </CardTitle>
          <p className='mt-1 text-xs text-[#8896A7]'>
            EMA + IRT calibrated, lucky-guess adjusted.
          </p>
        </div>
      </CardHeader>
      <CardContent className='flex flex-row items-end justify-between gap-6 pt-1'>
        <div className='flex flex-col'>
          <span
            className={cn(
              'font-extrabold tracking-tight tabular-nums',
              'text-5xl sm:text-6xl',
              getReadinessColorClass(clamped),
            )}
          >
            {clamped}
            <span className='ml-1 text-2xl text-[#8896A7]'>%</span>
          </span>
          <span className='mt-2 text-xs text-[#4A5568]'>
            Brutally honest snapshot of where you stand today.
          </span>
        </div>

        <div className='flex flex-col items-end gap-1'>
          <div
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium',
              trend === 'up' && 'bg-[#EDFAF4] text-[#2D9F6F]',
              trend === 'down' && 'bg-[#FDF0F0] text-[#D64545]',
              trend === 'flat' && 'bg-[#FEF8ED] text-[#4A5568]',
            )}
          >
            <span
              aria-hidden
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                trend === 'up' && 'bg-[#2D9F6F]',
                trend === 'down' && 'bg-[#D64545]',
                trend === 'flat' && 'bg-[#D4951A]',
              )}
            />
            <span>{trendLabel}</span>
          </div>
          <p className='max-w-[180px] text-right text-[11px] leading-snug text-[#8896A7]'>
            Recent performance is weighted more heavily than older sessions.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
