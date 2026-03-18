'use client'
import { Timer, Warning } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import { cn } from '@/lib/utils'
import type { PacingInsightItem } from '@/lib/actions/analytics'

interface Props { data: PacingInsightItem[] }

export function PacingInsights({ data }: Props) {
  return (
    <Card className="border-border bg-white p-2 relative h-full">
      <RichInfoPopover title="Latency Analytics" description="Subjects where your average response time significantly exceeds the 2-minute exam standard." />
      <CardHeader className="p-2 pt-1">
        <CardTitle className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-1">
          <SCIcon icon={Timer} size="xs" className="text-[#D4951A]" /> Pacing Leaks
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        {data.length === 0 ? (
          <p className="text-xs text-zinc-400 leading-snug">No significant pacing patterns detected yet. Complete more quizzes to identify time drains.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {data.map(item => {
              const secs = Math.round(item.avgTimeMs / 1000)
              const isHigh = item.ratio > 2.0
              return (
                <div key={item.subject} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-700 truncate max-w-[140px]">{item.subject}</span>
                    <div className="flex items-center gap-1">
                      <span className={cn(
                        'text-[11px] font-bold px-1.5 py-0.5 rounded-full',
                        isHigh ? 'bg-[#FDF0F0] text-[#D64545]' : 'bg-[#FEF8ED] text-[#D4951A]'
                      )}>
                        {item.ratio}x
                      </span>
                      <span className="text-[11px] text-zinc-400">{item.accuracy}%</span>
                    </div>
                  </div>
                  <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', isHigh ? 'bg-[#D64545]' : 'bg-[#D4951A]')}
                      style={{ width: `${Math.min(item.ratio / 3, 1) * 100}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400">{secs}s avg vs 120s target</p>
                </div>
              )
            })}
            {data[0]?.ratio > 1.5 && (
              <div className="flex items-start gap-1.5 bg-[#FEF8ED] rounded-md px-2 py-1.5 mt-1">
                <SCIcon icon={Warning} size="xs" className="text-[#D4951A] mt-0.5 shrink-0" />
                <p className="text-[11px] text-[#D4951A] leading-snug">
                  Extra time here isn&apos;t improving accuracy. Try flagging and moving on.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
