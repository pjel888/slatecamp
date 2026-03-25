'use client'

import { useEffect, useRef } from 'react'
import type { Icon } from '@phosphor-icons/react/lib'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface ReadinessScoreRingProps {
  score: number
  previousScore?: number
  zone: 'strong' | 'green' | 'amber' | 'needs-review'
  size?: 'sm' | 'md' | 'lg'
  showDelta?: boolean
  animate?: boolean
}

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const SIZE_MAP = {
  sm: 80,
  md: 160,
  lg: 240,
} as const

const ZONE_LABELS: Record<ReadinessScoreRingProps['zone'], string> = {
  strong: 'Strong',
  green: 'On Track',
  amber: 'Developing',
  'needs-review': 'Needs Review',
}

/* Zone stroke color — inline style to avoid purging dynamic classes */
const ZONE_STROKE: Record<ReadinessScoreRingProps['zone'], string> = {
  strong: 'var(--color-success)',
  green: 'var(--color-success)',
  amber: 'var(--color-foreground)',
  'needs-review': 'var(--color-muted-foreground)',
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export const ReadinessScoreRing = ({
  score,
  previousScore,
  zone,
  size = 'md',
  showDelta = false,
  animate = true,
}: ReadinessScoreRingProps) => {
  const px = SIZE_MAP[size]
  const strokeWidth = px * 0.075
  const radius = (px - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const cx = px / 2
  const cy = px / 2

  const circleRef = useRef<SVGCircleElement>(null)

  /* Animate strokeDashoffset from full (empty ring) to target */
  useEffect(() => {
    const circle = circleRef.current
    if (!circle) return

    const targetOffset = circumference - (score / 100) * circumference

    if (!animate) {
      circle.style.strokeDashoffset = String(targetOffset)
      return
    }

    const duration = 700
    const start = performance.now()
    const startOffset = circumference // start empty

    const step = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      const current = startOffset + (targetOffset - startOffset) * eased
      circle.style.strokeDashoffset = String(current)
      if (progress < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }, [score, circumference, animate])

  /* Delta */
  const delta = previousScore !== undefined ? score - previousScore : null
  const hasDelta = showDelta && delta !== null
  const deltaPositive = delta !== null && delta >= 0

  /* Zone label */
  const zoneLabel = ZONE_LABELS[zone]
  const ariaLabel = `Readiness Score: ${score} percent. ${zoneLabel}.`

  /* Font sizes scaled to ring diameter */
  const scoreFontSize = px * 0.225
  const labelFontSize = Math.max(8, px * 0.06)
  const deltaFontSize = Math.max(8, px * 0.075)

  return (
    <div
      className="relative inline-flex flex-col items-center gap-1"
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        width={px}
        height={px}
        viewBox={`0 0 ${px} ${px}`}
        aria-hidden="true"
      >
        {/* Track ring */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="var(--color-muted)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring — rotated so 0% starts at top */}
        <circle
          ref={circleRef}
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={ZONE_STROKE[zone]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: animate ? undefined : 'none' }}
        />
        {/* Score number */}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={scoreFontSize}
          fontWeight="700"
          fontFamily="var(--font-sans)"
          fill="var(--color-foreground)"
        >
          {score}
        </text>
      </svg>

      {/* Zone label */}
      <span
        className="font-mono uppercase tracking-widest text-muted-foreground"
        style={{ fontSize: labelFontSize }}
      >
        {zoneLabel}
      </span>

      {/* Delta */}
      {hasDelta && (
        <span
          className={
            deltaPositive ? 'text-warning' : 'text-muted-foreground'
          }
          style={{ fontSize: deltaFontSize }}
        >
          {deltaPositive ? '+' : ''}
          {delta}
        </span>
      )}
    </div>
  )
}

export type { ReadinessScoreRingProps }
