'use client'

import { useState } from 'react'
import { ScoreEntryForm } from './ScoreEntryForm'
import { HeatmapPreview } from './HeatmapPreview'
import { saveCompExamScores } from '@/lib/actions/comp-exam-onboarding'
import type { CompExamScores, HeatmapSeed } from '@/lib/actions/comp-exam-onboarding'

// ── Steps ─────────────────────────────────────────────────────────────────────

type Step = 'intro' | 'entry' | 'heatmap'

// ── Component ──────────────────────────────────────────────────────────────────

export const CompExamFlow = () => {
  const [step, setStep] = useState<Step>('intro')
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [heatmapSeeds, setHeatmapSeeds] = useState<HeatmapSeed[]>([])

  const handleScoreSubmit = async (scores: CompExamScores, examDate: string | null) => {
    setIsLoading(true)
    setServerError(null)

    const result = await saveCompExamScores(scores, examDate)

    setIsLoading(false)

    if (!result.success) {
      setServerError(result.error ?? 'Something went wrong. Please try again.')
      return
    }

    setHeatmapSeeds(result.heatmapSeeds ?? [])
    setStep('heatmap')
  }

  // ── Intro step ───────────────────────────────────────────────────────────────

  if (step === 'intro') {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <p className="text-[11px] uppercase tracking-[1.5px] text-[#8896A7]">
            Comp Exam Bridge
          </p>
          <h1 className="text-xl font-bold text-[#1A2332]">
            Your school just told you a number.
          </h1>
          <p className="text-base text-[#4A5568]">
            Let&apos;s make it useful.
          </p>
        </div>

        <div className="rounded-md border border-[#D4DAE3] bg-white px-4 py-4 space-y-3">
          <p className="text-sm text-[#1A2332]">
            Enter your comp exam scores by subject. We&apos;ll instantly map them to your heatmap — so you know exactly where to start.
          </p>
          <ul className="space-y-1.5">
            {[
              'Takes 2 minutes',
              'No manual setup — we seed your heatmap automatically',
              'The diagnostic quiz refines it further',
            ].map(item => (
              <li key={item} className="flex items-start gap-2 text-sm text-[#4A5568]">
                <span className="mt-0.5 h-4 w-4 shrink-0 flex items-center justify-center rounded-full bg-[#EEF2FC] text-[#1B3FC4]" aria-hidden="true">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4L3 6L7 2" stroke="#1B3FC4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => setStep('entry')}
            className="w-full rounded-sm bg-[#1B3FC4] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Enter my comp exam scores →
          </button>
          <a
            href="/dashboard"
            className="block w-full rounded-sm border border-[#D4DAE3] bg-white px-4 py-2.5 text-center text-sm text-[#8896A7] transition-colors duration-150 hover:border-[#1B3FC4] hover:text-[#4A5568] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Skip for now
          </a>
        </div>
      </div>
    )
  }

  // ── Score entry step ─────────────────────────────────────────────────────────

  if (step === 'entry') {
    return (
      <div className="space-y-5">
        <div>
          <button
            type="button"
            onClick={() => setStep('intro')}
            className="mb-3 flex items-center gap-1 text-xs text-[#8896A7] hover:text-[#4A5568] transition-colors duration-150"
            aria-label="Back to introduction"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>

          <h2 className="text-lg font-bold text-[#1A2332]">Enter your scores</h2>
          <p className="mt-0.5 text-sm text-[#4A5568]">
            Enter the percentage score for each subject as shown on your comp exam results.
          </p>
        </div>

        {serverError && (
          <p className="rounded-sm border border-[#D64545] bg-[#FDF0F0] px-3 py-2 text-sm text-[#D64545]">
            {serverError}
          </p>
        )}

        <ScoreEntryForm onSubmit={handleScoreSubmit} isLoading={isLoading} />
      </div>
    )
  }

  // ── Heatmap step ─────────────────────────────────────────────────────────────

  return <HeatmapPreview seeds={heatmapSeeds} />
}
