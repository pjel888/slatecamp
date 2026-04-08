'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'
import { cn } from '@/lib/utils'
import type { WeakestTopicItem } from '@/lib/actions/analytics-data'
import { ROUTES } from '@/lib/routes'

interface Props {
  data: WeakestTopicItem[]
}

const getMasteryColor = (pct: number) => {
  if (pct >= 70) return { text: 'text-success', bg: 'bg-success-50' }
  if (pct >= 40) return { text: 'text-warning', bg: 'bg-warning-50' }
  return { text: 'text-destructive', bg: 'bg-destructive-50' }
}

const formatDate = (iso: string | null) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export const WeakestTopics = ({ data }: Props) => (
  <Card className="border-border bg-card rounded-md shadow-none p-2 relative">
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
        <ChartEmptyState
          title="No weak topics identified"
          description="Topics to focus on appear after answering enough questions."
          height="h-[320px]"
        />
      ) : (
        <div className="flex flex-col gap-1">
          {data.map((item) => {
            const colors = getMasteryColor(item.masteryPct)
            return (
              <div
                key={item.topicId}
                className="flex items-center justify-between gap-2 py-1.5 border-b border-border last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-foreground truncate leading-tight">
                    {item.topic}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
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
                    href="/dashboard/drills"
                    className="text-[11px] font-semibold text-primary hover:text-primary-700 transition-colors duration-150"
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
