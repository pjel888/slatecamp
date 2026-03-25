import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface TodayActionCardProps {
  dayNumber?: number
  topicName?: string
  estimatedMinutes?: number
  ctaLabel: string
  ctaHref: string
  enrolled: boolean
}

const TodayActionCard = ({
  dayNumber,
  topicName,
  estimatedMinutes,
  ctaLabel,
  ctaHref,
  enrolled,
}: TodayActionCardProps) => {
  return (
    <div
      className={cn(
        'bg-card rounded-md p-4 border-l-4 border-l-warning border border-border',
      )}
    >
      {enrolled ? (
        <div className="flex flex-col gap-3">
          {dayNumber !== undefined && (
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Day {dayNumber}
            </p>
          )}
          {topicName && (
            <p className="text-sm font-semibold text-foreground leading-snug">
              {topicName}
            </p>
          )}
          {estimatedMinutes !== undefined && (
            <p className="text-xs text-muted-foreground">
              ~{estimatedMinutes} min
            </p>
          )}
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center rounded-sm bg-primary text-primary-foreground font-semibold text-sm px-4 py-2 min-h-[36px] hover:bg-primary/90 active:bg-primary/80 transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 self-start"
          >
            {ctaLabel}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-foreground leading-snug">
            Ready to get started?
          </p>
          <p className="text-xs text-muted-foreground">
            Take a short diagnostic to build your personalized study trail.
          </p>
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center rounded-sm bg-primary text-primary-foreground font-semibold text-sm px-4 py-2 min-h-[36px] hover:bg-primary/90 active:bg-primary/80 transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 self-start"
          >
            {ctaLabel}
          </Link>
        </div>
      )}
    </div>
  )
}

export { TodayActionCard }
export type { TodayActionCardProps }
