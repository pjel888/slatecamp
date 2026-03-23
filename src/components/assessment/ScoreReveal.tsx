'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AnimatedScore } from './AnimatedScore'
import type { AssessmentSubjectScore, TrailRecommendation } from '@/types/app'

// ─── Types ──────────────────────────────────────────────────────────────────

interface ScoreRevealProps {
  score: number
  subjectScores: AssessmentSubjectScore[]
  recommendation: TrailRecommendation | null
  isRetaker?: boolean
}

// ─── Zone Colors (UX Strategy Section 4) ─────────────────────────────────

const getZoneColor = (score: number): string => {
  if (score < 40) return '#E63329'   // Signal Red (UX Strategy --red)
  if (score < 70) return '#E8853A'   // Camp Orange
  if (score < 85) return '#1B7A3C'   // Signal Green (UX Strategy --green)
  return '#1B3FC4'                    // Cobalt Blue
}

// ─── Score Messages (Exact Copy from UX Strategy Section 4) ──────────────

const getScoreMessage = (score: number): string => {
  if (score < 40) return `${score}%. The map shows where to start. Most people find this more motivating than discouraging once they see the trail.`
  if (score < 55) return `${score}%. Solid foundation, clear gaps. The Trail will focus on exactly what moves the needle.`
  if (score < 70) return `${score}%. More than halfway there. The gaps are specific — the Trail is targeted.`
  if (score < 85) return `${score}%. Strong foundation. Focused refinement and the Proof Run are the path from here.`
  return `${score}%. Strong — now we make sure it holds under exam conditions.`
}

const getRetakerMessage = (score: number): string =>
  `${score}%. Your score tells us something specific about last time — the Trail is built around those specifics.`

// ─── Subject Bar Color ───────────────────────────────────────────────────

const getBarColor = (accuracy: number): string => {
  if (accuracy < 40) return '#E63329'
  if (accuracy < 70) return '#D4951A'
  return '#1B7A3C'
}

// ─── Component ───────────────────────────────────────────────────────────

const ScoreReveal = ({
  score,
  subjectScores,
  recommendation,
  isRetaker = false,
}: ScoreRevealProps) => {
  const [showSecondary, setShowSecondary] = useState(false)
  const zoneColor = getZoneColor(score)
  const message = isRetaker ? getRetakerMessage(score) : getScoreMessage(score)
  const sortedScores = [...subjectScores].sort((a, b) => a.accuracy - b.accuracy)

  // Secondary CTA appears after 3 seconds (UX Strategy spec)
  useEffect(() => {
    const timer = setTimeout(() => setShowSecondary(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
      style={{ backgroundColor: '#F5F5F5' }}
    >
      <div className="mx-auto w-full max-w-lg px-6 py-16 text-center">
        {/* DM Mono eyebrow — 11px, uppercase */}
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[2.5px] text-[#8896A7]">
          Your Readiness Score
        </p>

        {/* Animated Score — 80px, Syne 800, zone-colored, 700ms ease-out */}
        <div className="mt-6">
          <AnimatedScore target={score} color={zoneColor} />
        </div>

        {/* Interpretation — Inter 17px, #4A5568, max-width 480px */}
        <p className="mx-auto mt-6 max-w-[480px] text-[17px] leading-relaxed text-[#4A5568]">
          {message}
        </p>

        {/* Blurred Heatmap — shape visible, color not. CSS filter: blur(8px) */}
        <div className="relative mx-auto mt-10 overflow-hidden rounded-md border border-[#D4DAE3] bg-white p-6">
          <div
            className="pointer-events-none select-none"
            style={{ filter: 'blur(8px)' }}
            aria-hidden="true"
          >
            <div className="grid grid-cols-7 gap-2">
              {sortedScores.length > 0
                ? sortedScores.flatMap((subject, si) =>
                    Array.from({ length: 5 }).map((_, qi) => {
                      const baseColor = getBarColor(subject.accuracy)
                      const jitter = (qi * 17 + si * 31) % 3
                      const palette = [baseColor, '#D4951A', '#EEF2FC']
                      return (
                        <div
                          key={`${si}-${qi}`}
                          className="h-7 rounded-sm"
                          style={{ backgroundColor: palette[jitter] || baseColor }}
                        />
                      )
                    }),
                  )
                : Array.from({ length: 35 }).map((_, i) => {
                    const palette = ['#2D9F6F', '#D4951A', '#D64545', '#EEF2FC', '#2D9F6F', '#D4951A']
                    return (
                      <div
                        key={i}
                        className="h-7 rounded-sm"
                        style={{ backgroundColor: palette[i % palette.length] }}
                      />
                    )
                  })}
            </div>
          </div>
        </div>

        {/* Primary CTA — Cobalt Blue, full-width */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <Link
            href={
              recommendation
                ? `/dashboard/trails/${recommendation.trail.slug}`
                : '/dashboard/trails'
            }
            className="inline-flex w-full max-w-sm items-center justify-center rounded-sm px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-[#1535A8]"
            style={{ backgroundColor: '#1B3FC4' }}
          >
            Start My Camp Trail
          </Link>

          {/* Secondary CTA — delayed 3 seconds, muted (UX Strategy) */}
          <div
            className="transition-opacity duration-300 ease-out"
            style={{ opacity: showSecondary ? 1 : 0 }}
          >
            <Link
              href="/dashboard/upgrade"
              className="inline-flex items-center gap-1.5 text-sm text-[#4A5568] transition-colors duration-150 ease-out hover:text-[#1B3FC4]"
            >
              See Full Map
              <span className="font-[family-name:var(--font-dm-mono)] text-[11px] text-[#8896A7]">
                (Pro)
              </span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScoreReveal
