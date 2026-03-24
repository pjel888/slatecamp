'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// --- Score color logic (NON-NEGOTIABLE) ---
// NEVER use red for low scores. Red is reserved for functional errors only.
const getScoreColor = (value: number) => {
  if (value >= 70)
    return {
      text: 'text-emerald-700 dark:text-emerald-400',
      fill: 'text-emerald-500',
      bg: 'bg-emerald-500',
    }
  if (value >= 40)
    return {
      text: 'text-foreground',
      fill: 'text-foreground/60',
      bg: 'bg-foreground/60',
    }
  return {
    text: 'text-muted-foreground',
    fill: 'text-muted-foreground',
    bg: 'bg-muted-foreground',
  }
}

// --- Size maps ---
const ringSizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
} as const

const barHeightClasses = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2',
  xl: 'h-3',
} as const

const fontSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg',
  xl: 'text-2xl',
} as const

// --- Ring variant ---
interface RingProps {
  value: number
  size: 'sm' | 'md' | 'lg' | 'xl'
  showPercentSign: boolean
  animate: boolean
  colors: ReturnType<typeof getScoreColor>
}

const Ring = ({ value, size, showPercentSign, animate, colors }: RingProps) => {
  const [mounted, setMounted] = React.useState(!animate)
  const radius = 16
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  React.useEffect(() => {
    if (!animate) return
    // Trigger mount animation on next frame
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [animate])

  return (
    <div
      data-slot="score-ring"
      className={cn('relative', ringSizeClasses[size])}
    >
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
        {/* Background ring */}
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth="3.5"
        />
        {/* Foreground ring */}
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          className={colors.fill}
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={mounted ? offset : circumference}
          style={{
            transition: animate ? 'stroke-dashoffset 1s ease-out' : 'none',
          }}
        />
      </svg>
      {/* Centered number */}
      <span
        className={cn(
          'absolute inset-0 flex items-center justify-center font-mono tabular-nums font-semibold',
          fontSizeClasses[size],
          colors.text
        )}
      >
        {value}
        {showPercentSign && <span className="text-[0.65em]">%</span>}
      </span>
    </div>
  )
}

// --- Bar variant ---
interface BarProps {
  value: number
  size: 'sm' | 'md' | 'lg' | 'xl'
  animate: boolean
  colors: ReturnType<typeof getScoreColor>
}

const Bar = ({ value, size, animate, colors }: BarProps) => {
  const [mounted, setMounted] = React.useState(!animate)

  React.useEffect(() => {
    if (!animate) return
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [animate])

  return (
    <div
      data-slot="score-bar"
      className={cn('w-full bg-muted rounded-full overflow-hidden', barHeightClasses[size])}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500 ease-out',
          colors.bg
        )}
        style={{ width: mounted ? `${value}%` : '0%' }}
      />
    </div>
  )
}

// --- Pill variant ---
interface PillProps {
  value: number
  showPercentSign: boolean
  colors: ReturnType<typeof getScoreColor>
}

const Pill = ({ value, showPercentSign, colors }: PillProps) => (
  <span
    data-slot="score-pill"
    className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full font-mono text-xs tabular-nums font-medium',
      colors.text
    )}
  >
    {value}
    {showPercentSign && '%'}
  </span>
)

// --- Number variant ---
interface NumberProps {
  value: number
  size: 'sm' | 'md' | 'lg' | 'xl'
  showPercentSign: boolean
  colors: ReturnType<typeof getScoreColor>
}

const NumberDisplay = ({ value, size, showPercentSign, colors }: NumberProps) => (
  <span
    data-slot="score-number"
    className={cn(
      'font-mono tabular-nums font-bold',
      fontSizeClasses[size],
      colors.text
    )}
  >
    {value}
    {showPercentSign && <span className="text-[0.65em] font-semibold">%</span>}
  </span>
)

// --- Main component ---
interface ScoreDisplayProps {
  value: number // 0-100
  variant?: 'ring' | 'bar' | 'pill' | 'number'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  label?: string // "Readiness Score", "Mastery", etc.
  showPercentSign?: boolean // default true
  animate?: boolean // default true
  className?: string
}

const ScoreDisplay = ({
  value,
  variant = 'ring',
  size = 'md',
  label,
  showPercentSign = true,
  animate = true,
  className,
}: ScoreDisplayProps) => {
  const clamped = Math.max(0, Math.min(100, Math.round(value)))
  const colors = getScoreColor(clamped)

  return (
    <div
      data-slot="score-display"
      className={cn(
        'flex flex-col items-center gap-1',
        variant === 'bar' && 'w-full items-stretch',
        className
      )}
    >
      {variant === 'ring' && (
        <Ring
          value={clamped}
          size={size}
          showPercentSign={showPercentSign}
          animate={animate}
          colors={colors}
        />
      )}
      {variant === 'bar' && (
        <Bar value={clamped} size={size} animate={animate} colors={colors} />
      )}
      {variant === 'pill' && (
        <Pill value={clamped} showPercentSign={showPercentSign} colors={colors} />
      )}
      {variant === 'number' && (
        <NumberDisplay
          value={clamped}
          size={size}
          showPercentSign={showPercentSign}
          colors={colors}
        />
      )}
      {label && (
        <span className="text-xs text-muted-foreground text-center">{label}</span>
      )}
    </div>
  )
}

export { ScoreDisplay, getScoreColor }
export type { ScoreDisplayProps }
