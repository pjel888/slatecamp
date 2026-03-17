'use client'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { getScoreColor } from '../tokens'

interface ReadinessRingProps {
  score: number
  size?: number
  strokeWidth?: number
  animated?: boolean
  className?: string
}

export function ReadinessRing({
  score,
  size = 160,
  strokeWidth = 10,
  animated = true,
  className,
}: ReadinessRingProps) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - displayScore / 100)
  const colors = getScoreColor(score)
  const gradId = `ring-grad-${score}-${size}`

  useEffect(() => {
    if (!animated) {
      setDisplayScore(score)
      return
    }
    const duration = 800
    const start = performance.now()
    let raf: number
    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayScore(Math.round(eased * score))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [score, animated])

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} aria-hidden="true">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors.main} />
            <stop offset="100%" stopColor={colors.grad} />
          </linearGradient>
        </defs>
        {/* Background glow */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius * 0.65}
          fill={colors.glow}
        />
        {/* Track ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--gc-border, #D4DAE3)"
          strokeWidth={strokeWidth}
          filter="url(#grain-light)"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 800ms ease-out' }}
        />
      </svg>
      {/* Score number */}
      <span
        className="absolute text-5xl font-extrabold font-mono"
        style={{ color: colors.main }}
      >
        {displayScore}
      </span>
    </div>
  )
}
