'use client'

import Link from 'next/link'
import type { AssessmentSubjectScore, TrailRecommendation } from '@/types/app'

interface ScoreRevealProps {
  score: number
  subjectScores: AssessmentSubjectScore[]
  recommendation: TrailRecommendation | null
}

const getScoreColor = (score: number): string => {
  if (score < 50) return '#D64545'
  if (score < 70) return '#D4951A'
  return '#2D9F6F'
}

const getInterpretation = (score: number): string => {
  if (score < 40) return 'A lot of ground ahead \u2014 but this is exactly where the journey starts.'
  if (score < 60) return 'You have a foundation. Now let\u2019s build on it.'
  if (score < 75) return 'Solid ground. A focused trail will close the gaps.'
  if (score < 90) return 'Strong position. Let\u2019s sharpen the edges.'
  return 'The data says you\u2019re ready. Let\u2019s confirm it with a simulation.'
}

const getBarColor = (accuracy: number): string => {
  if (accuracy < 40) return '#D64545'
  if (accuracy < 70) return '#D4951A'
  return '#2D9F6F'
}

const ScoreReveal = ({ score, subjectScores, recommendation }: ScoreRevealProps) => {
  const scoreColor = getScoreColor(score)
  const interpretation = getInterpretation(score)
  const sortedScores = [...subjectScores].sort((a, b) => a.accuracy - b.accuracy)

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* THE NUMBER */}
      <div className="text-center">
        <p
          className="text-5xl font-bold tabular-nums"
          style={{ color: scoreColor }}
        >
          {score}%
        </p>
      </div>

      {/* ONE-LINE INTERPRETATION */}
      <p className="mt-4 text-center text-base" style={{ color: '#4A5568' }}>
        {interpretation}
      </p>

      {/* SUBJECT BREAKDOWN */}
      {sortedScores.length > 0 && (
        <div className="mt-10 rounded-md bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold" style={{ color: '#1A2332' }}>
            Subject Breakdown
          </h2>
          <div className="space-y-4">
            {sortedScores.map((subject) => {
              const barColor = getBarColor(subject.accuracy)
              return (
                <div key={subject.subjectArea}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="text-sm font-medium truncate mr-3"
                      style={{ color: '#1A2332' }}
                    >
                      {subject.subjectArea}
                    </span>
                    <span
                      className="text-sm font-medium tabular-nums shrink-0"
                      style={{ color: barColor }}
                    >
                      {subject.accuracy}%
                    </span>
                  </div>
                  <div
                    className="h-2 w-full rounded-full"
                    style={{ backgroundColor: '#EEF2FC' }}
                  >
                    <div
                      className="h-2 rounded-full transition-all duration-300 ease-out"
                      style={{
                        width: `${Math.max(subject.accuracy, 2)}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* BLURRED HEATMAP TEASER */}
      <div className="relative mt-8 overflow-hidden rounded-md bg-white p-6">
        <div className="blur-md pointer-events-none select-none" aria-hidden="true">
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 35 }).map((_, i) => {
              const colors = ['#2D9F6F', '#D4951A', '#D64545', '#EEF2FC', '#2D9F6F', '#D4951A']
              return (
                <div
                  key={i}
                  className="h-6 rounded-sm"
                  style={{ backgroundColor: colors[i % colors.length] }}
                />
              )
            })}
          </div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/60">
          <svg
            className="h-5 w-5"
            style={{ color: '#4A5568' }}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
          <p className="text-sm font-medium" style={{ color: '#4A5568' }}>
            Unlock Full Analytics &mdash; see exactly where every gap is.
          </p>
        </div>
      </div>

      {/* TRAIL RECOMMENDATION */}
      {recommendation && (
        <div className="mt-8 rounded-md bg-white p-6">
          <p className="text-sm italic" style={{ color: '#4A5568' }}>
            {recommendation.reasoning}
          </p>
          <p className="mt-3 text-base font-bold" style={{ color: '#1A2332' }}>
            {recommendation.trail.name}
          </p>
          <p className="mt-1 text-sm" style={{ color: '#4A5568' }}>
            {recommendation.weekOnePreview}
          </p>
        </div>
      )}

      {/* CTAs */}
      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        {recommendation && (
          <Link
            href={`/dashboard/trails/${recommendation.trail.slug}`}
            className="inline-flex items-center justify-center rounded-sm px-6 py-3 text-sm font-medium text-white transition-colors duration-150 ease-out hover:opacity-90"
            style={{ backgroundColor: '#1B3FC4' }}
          >
            Start Your Camp Trail &rarr;
          </Link>
        )}
        <Link
          href="/dashboard/trails"
          className="inline-flex items-center justify-center rounded-sm border px-6 py-3 text-sm font-medium transition-colors duration-150 ease-out hover:bg-[#EEF2FC]"
          style={{ color: '#1B3FC4', borderColor: '#1B3FC4' }}
        >
          Browse All Trails
        </Link>
      </div>
    </div>
  )
}

export default ScoreReveal
