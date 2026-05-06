'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { getScoreBand } from '@/lib/quiz/mode-presets'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScoreRevealProps {
  percent: number
  correct: number
  total: number
  growthDelta: number | null
}

// ─── Easing ───────────────────────────────────────────────────────────────────

const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4)

const DURATION_MS = 1500

// ─── Component ────────────────────────────────────────────────────────────────

// Buffer delay before revealing score (500-800ms emotional buffer per UX Architecture Guide)
const BUFFER_MS = 700

export const ScoreReveal = ({ percent, correct, total, growthDelta }: ScoreRevealProps) => {
  const [phase, setPhase] = useState<'loading' | 'revealing' | 'done'>('loading')
  const [displayed, setDisplayed] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  // Phase 1: "Calculating results..." buffer
  useEffect(() => {
    if (prefersReduced) {
      setDisplayed(percent)
      setPhase('done')
      return
    }

    const bufferTimer = setTimeout(() => {
      setPhase('revealing')
    }, BUFFER_MS)

    return () => clearTimeout(bufferTimer)
  }, [prefersReduced, percent])

  // Phase 2: Count-up animation
  useEffect(() => {
    if (phase !== 'revealing') return

    const animate = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp
      const elapsed = timestamp - startRef.current
      const progress = Math.min(elapsed / DURATION_MS, 1)
      const eased = easeOutQuart(progress)
      setDisplayed(Math.round(eased * percent))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setPhase('done')
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [phase, percent])

  const band = getScoreBand(percent)
  const isPositiveDelta = growthDelta !== null && growthDelta > 0

  if (phase === 'loading') {
    return (
      <div className="bg-card rounded-2xl border border-border p-5 text-center shadow-sm">
        <div className="flex items-center justify-center gap-2">
          <div className="h-4 w-4 rounded-full border-2 border-border border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Calculating results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-5 text-center shadow-sm">
      {/* Eyebrow */}
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Session Complete
      </p>

      {/* Animated score */}
      <p
        className="mt-3 text-[52px] font-bold leading-none tabular-nums text-foreground"
        aria-live="polite"
        aria-label={`${percent}%`}
      >
        {displayed}
        <span className="text-[32px] font-semibold text-text-secondary">%</span>
      </p>

      {/* Fraction */}
      <p className="mt-1 text-sm text-muted-foreground">
        {correct} of {total} correct
      </p>

      {/* Score band label */}
      <p
        className={cn(
          'mt-3 text-base font-semibold',
          band.colorClass,
        )}
      >
        {band.label}
      </p>

      {/* Growth delta */}
      {growthDelta !== null && (
        <p
          className={cn(
            'mt-2 text-sm font-medium',
            isPositiveDelta ? 'text-success' : 'text-text-secondary',
          )}
        >
          {isPositiveDelta ? '▲' : '▼'}{' '}
          {isPositiveDelta ? '+' : ''}{growthDelta}% from last time
        </p>
      )}
    </div>
  )
}
