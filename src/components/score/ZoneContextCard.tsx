'use client'

import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

export type ScoreZone = 'strong' | 'green' | 'amber' | 'needs-review'

export interface ZoneContextCardProps {
  zone: ScoreZone
  topicCount?: number
  className?: string
}

// ─── Zone config ──────────────────────────────────────────────────────────────
// NEVER use red, failure language, or deficit framing for any zone.

interface ZoneConfig {
  heading: string
  body: string
  borderClass: string
  bgClass: string
  labelClass: string
  label: string
}

const ZONE_CONFIG: Record<ScoreZone, ZoneConfig> = {
  strong: {
    label: 'Strong Foundation',
    heading: 'Strong foundation.',
    body: 'Your Trail will sharpen the edges.',
    borderClass: 'border-primary/20',
    bgClass: 'bg-primary-50',
    labelClass: 'text-primary',
  },
  green: {
    label: 'Solid Ground',
    heading: 'Solid ground.',
    body: 'Your Trail targets the topics that will push you higher.',
    borderClass: 'border-success/20',
    bgClass: 'bg-success-50',
    labelClass: 'text-success',
  },
  amber: {
    label: 'Building',
    heading: 'You know more than you think.',
    body: 'Your Trail builds on what\u2019s already working.',
    borderClass: 'border-warning/20',
    bgClass: 'bg-warning-50',
    labelClass: 'text-warning',
  },
  'needs-review': {
    label: 'Room to Grow',
    heading: 'Every camper starts somewhere.',
    body: 'Your Trail focuses on the topics with the most room to grow.',
    borderClass: 'border-border',
    bgClass: 'bg-muted/50',
    labelClass: 'text-muted-foreground',
  },
}

// ─── Component ────────────────────────────────────────────────────────────────

const ZoneContextCard = ({ zone, topicCount, className }: ZoneContextCardProps) => {
  const config = ZONE_CONFIG[zone]

  return (
    <div
      className={cn(
        'rounded-md border px-4 py-3',
        config.bgClass,
        config.borderClass,
        className,
      )}
      role="status"
      aria-label={`Score zone: ${config.label}`}
    >
      <p className={cn('text-[11px] font-medium uppercase tracking-[1.5px] mb-1', config.labelClass)}>
        {config.label}
      </p>
      <p className="text-sm leading-relaxed text-foreground">
        <span className="font-semibold">{config.heading}</span>{' '}
        {topicCount != null
          ? `${config.body.replace('the topics', `${topicCount} topic${topicCount !== 1 ? 's' : ''}`)}`
          : config.body}
      </p>
    </div>
  )
}

export { ZoneContextCard }
