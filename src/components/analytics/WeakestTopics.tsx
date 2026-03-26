'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import { cn } from '@/lib/utils'
import type { WeakestTopicItem } from '@/lib/actions/analytics-data'

interface Props {
  data: WeakestTopicItem[]
}

const getMasteryColor = (pct: number) => {
  if (pct >= 70) return { text: 'text-[#2D9F6F]', bg: 'bg-[#EDFAF4]' }
  if (pct >= 40) return { text: 'text-[#D4951A]', bg: 'bg-[#FEF8ED]' }
  return { text: 'text-[#D64545]', bg: 'bg-[#FDF0F0]' }
}

const formatDate = (iso: string | null) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export const WeakestTopics = ({ data }: Props) => (
  <Card className="border-[#D4DAE3] bg-white rounded-md shadow-none p-2 relative">
    <RichInfoPopover
      title="Topics to Focus On"
      description="Your 10 lowest-mastery topics with at least 3 attempts. Sorted by mastery score ascending."
    />
    <CardHeader className="p-2 pt-1">
      <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
        Topics to Focus On
      </CardTitle>
    </CardHeader>
    <CardContent className="p-2 pt-0">
      {data.length === 0 ? (
        <div className="h-[220px] flex items-center justify-center">
          <p className="text-xs text-center leading-snug max-w-[200px] text-muted-foreground">
            Complete a few study sessions to see your analytics here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {data.map((item) => {
            const colors = getMasteryColor(item.masteryPct)
            return (
              <div
                key={item.topicId}
                className="flex items-center justify-between gap-2 py-1.5 border-b border-[#D4DAE3] last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-[#1A2332] truncate leading-tight">
                    {item.topic}
                  </p>
                  <p className="text-[11px] text-[#8896A7] mt-0.5">
                    <span className="font-mono">{item.attempts}</span> attempts
                    {' · '}last seen {formatDate(item.lastEncountered)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn(
                    'text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded',
                    colors.text, colors.bg,
                  )}>
                    {item.masteryPct}%
                  </span>
                  <Link
                    href="/dashboard/testing"
                    className="text-[11px] font-semibold text-[#1B3FC4] hover:text-[#1535A8] transition-colors duration-150"
                  >
                    Practice
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </CardContent>
  </Card>
)
