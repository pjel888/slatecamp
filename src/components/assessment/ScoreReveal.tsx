'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AnimatedScore } from './AnimatedScore'
import { getScoreColorHex } from '@/components/shared/score-display'
import { ZoneContextCard } from '@/components/score/ZoneContextCard'
import type { ScoreZone } from '@/components/score/ZoneContextCard'
import type { AssessmentSubjectScore, TrailRecommendation } from '@/types/app'
import { ROUTES } from '@/lib/routes'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ScoreRevealProps {
  score: number
  subjectScores: AssessmentSubjectScore[]
  recommendation: TrailRecommendation | null
  isRetaker?: boolean
}

// ─── Zone helpers ─────────────────────────────────────────────────────────────

const getZone = (score: number): ScoreZone => {
  if (score >= 85) return 'strong'
  if (score >= 70) return 'green'
  if (score >= 40) return 'amber'
  return 'needs-review'
}

// Zone-colored ring — matches score-display getScoreColorHex palette but zone-aware
const getZoneRingColor = (score: number): string => {
  if (score >= 85) return '#1B3FC4'           // Camp Cobalt — strong
  if (score >= 70) return '#1B7A3C'           // Signal Green — solid
  if (score >= 40) return '#E8853A'           // Camp Orange — building
  return getScoreColorHex(score).main         // Muted neutral — NEVER red for low scores
}

// ─── Subject Bar Color ────────────────────────────────────────────────────────

const getBarColor = (accuracy: number): string => {
  if (accuracy < 40) return getScoreColorHex(accuracy).main
  if (accuracy < 70) return '#D4951A'
  return '#1B7A3C'
}

// ─── Component ────────────────────────────────────────────────────────────────

const ScoreReveal = ({
  score,
  subjectScores,
  recommendation,
  isRetaker = false,
}: ScoreRevealProps) => {
  const [showSecondary, setShowSecondary] = useState(false)
  const zone = getZone(score)
  const ringColor = getZoneRingColor(score)
  const sortedScores = [...subjectScores].sort((a, b) => a.accuracy - b.accuracy)

  // Secondary CTA appears after 3 seconds (UX Strategy spec)
  useEffect(() => {
    const timer = setTimeout(() => setShowSecondary(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  const trailHref = recommendation
    ? `${ROUTES.dashboard.camptrails}/${recommendation.trail.slug}`
    : ROUTES.dashboard.camptrails

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
      style={{ backgroundColor: '#F5F5F5' }}
    >
      <div className="mx-auto w-full max-w-lg px-6 py-16 text-center">
        {/* Layer 2: Eyebrow — DM Mono 11px uppercase */}
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[2.5px] text-text-tertiary">
          Your Readiness Score
        </p>

        {/* Layer 2: Animated score — 80px, zone-colored ring, 700ms ease-out */}
        <div className="mt-6">
          <AnimatedScore target={score} color={ringColor} />
        </div>

        {/* Layer 3: Zone context card — appears immediately after score animates */}
        <div className="mx-auto mt-6 max-w-[480px]">
          <ZoneContextCard
            zone={zone}
            topicCount={subjectScores.length > 0 ? subjectScores.length : undefined}
          />
        </div>

        {/* Blurred heatmap preview — shape visible, color not */}
        <div className="relative mx-auto mt-8 overflow-hidden rounded-md border border-border bg-white p-6">
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
                    const palette = ['#2D9F6F', '#D4951A', '#4A5568', '#EEF2FC', '#2D9F6F', '#D4951A']
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

        {/* CTAs */}
        <div className="mt-8 flex flex-col items-center gap-3">
          {/* Primary CTA — Camp Orange, full-width */}
          <Link
            href={trailHref}
            className="inline-flex w-full max-w-sm items-center justify-center rounded-sm px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-150 ease-out"
            style={{ backgroundColor: '#E8853A' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#d4752f' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#E8853A' }}
          >
            See Your Trail
          </Link>

          {/* Secondary CTA — delayed 3 seconds, muted */}
          <div
            className="transition-opacity duration-300 ease-out"
            style={{ opacity: showSecondary ? 1 : 0 }}
          >
            <Link
              href={ROUTES.dashboard.upgrade}
              className="inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors duration-150 ease-out hover:text-camp-cobalt"
            >
              View Full Map
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScoreReveal
