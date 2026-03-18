'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import { cn } from '@/lib/utils'
import type { MemoryHealthItem } from '@/lib/actions/analytics'

interface Props { data: MemoryHealthItem[] }

const STATUS_STYLES: Record<MemoryHealthItem['status'], string> = {
  strong:       'bg-[#EDFAF4] text-[#2D9F6F] border-[#2D9F6F]/20',
  review:       'bg-[#FEF8ED] text-[#D4951A] border-[#D4951A]/20',
  fading:       'bg-[#FEF8ED] text-[#D4951A] border-[#D4951A]/20',
  critical:     'bg-[#FDF0F0] text-[#D64545] border-[#D64545]/20',
}

const STATUS_ORDER = { critical: 0, fading: 1, review: 2, strong: 3 }

export function MemoryHealthMap({ data }: Props) {
  const sorted = [...data].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])
  const critical = sorted.filter(d => d.status === 'critical').length
  const needsAttention = sorted.filter(d => d.status === 'critical' || d.status === 'fading').length

  return (
    <Card className="border-border bg-white p-2 relative h-full">
      <RichInfoPopover title="Memory Health" description="Estimated retention for topics you've studied, based on time since last review. Uses exponential decay (half-life ≈ 14 days)." />
      <CardHeader className="p-2 pt-1">
        <CardTitle className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
          Memory Health
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        {sorted.length === 0 ? (
          <p className="text-xs text-zinc-400 leading-snug">Start quizzing to track which topics need review.</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-1">
              {sorted.map(item => (
                <div
                  key={item.topicId}
                  title={`Last seen ${item.daysSince}d ago · ~${item.estimatedRetention}% estimated retention`}
                  className={cn(
                    'flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[11px] font-medium cursor-default',
                    STATUS_STYLES[item.status]
                  )}
                >
                  <span className="max-w-[100px] truncate">{item.topic}</span>
                  <span className="opacity-70">{item.estimatedRetention}%</span>
                </div>
              ))}
            </div>
            {needsAttention > 0 && (
              <div className="mt-2 text-[11px] text-[#D64545] font-medium">
                {critical > 0
                  ? `${critical} topic${critical > 1 ? 's' : ''} critically faded — knowledge is slipping away.`
                  : `${needsAttention} topic${needsAttention > 1 ? 's' : ''} ready for a quick refresh.`}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
