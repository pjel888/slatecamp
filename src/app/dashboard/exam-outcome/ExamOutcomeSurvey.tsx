import { ROUTES } from '@/lib/routes';
'use client'

import { useState } from 'react'
import { submitExamOutcome } from './actions'
import { Card } from '@/components/ui/card'

type ExamResult = 'passed' | 'failed' | 'did_not_take'

const ExamOutcomeSurvey = ({ examBatch }: { examBatch: string }) => {
  const [step, setStep] = useState<'result' | 'score' | 'done'>('result')
  const [result, setResult] = useState<ExamResult | null>(null)
  const [score, setScore] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleResultSelect = (selected: ExamResult) => {
    setResult(selected)
    if (selected === 'did_not_take') {
      handleSubmit(selected)
    } else {
      setStep('score')
    }
  }

  const handleSubmit = async (overrideResult?: ExamResult) => {
    const finalResult = overrideResult ?? result
    if (!finalResult) return

    setSubmitting(true)
    setError(null)

    const { success, error: submitError } = await submitExamOutcome({
      exam_batch: examBatch,
      result: finalResult,
      self_reported_score: score ? Number(score) : null,
    })

    setSubmitting(false)

    if (success) {
      setStep('done')
    } else {
      setError(submitError ?? 'Something went wrong. Please try again.')
    }
  }

  if (step === 'done' && result === 'passed') {
    return (
      <div className="space-y-4">
        <Card className="p-6 text-center border-emerald/30 bg-emerald-50">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald/10">
            <svg className="h-6 w-6 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-base font-semibold text-foreground">
            Architect.
          </p>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Your SlateCamp heatmap is now your professional reference library.
            The building codes you studied are the building codes you&apos;ll practice with.
          </p>
        </Card>

        <Card className="p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            What&apos;s next
          </p>
          <a
            href={ROUTES.dashboard.root}
            className="flex items-center justify-between rounded-sm border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors duration-150 hover:border-primary hover:bg-primary/10/50"
          >
            Enter Professional Mode
            <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Someone reviewing right now is at 38% wondering if they&apos;ll make it.
            Your journey is their map.
          </p>
        </Card>
      </div>
    )
  }

  if (step === 'done' && result === 'failed') {
    return (
      <div className="space-y-4">
        <Card className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-sm font-medium text-foreground">
            Thank you for sharing.
          </p>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Your heatmap from this cycle is saved. Your Camp Trail picks up
            exactly where you left off &mdash; with additional data from this cycle.
          </p>
        </Card>

        <Card className="p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Your data is ready
          </p>
          <a
            href={ROUTES.dashboard.root}
            className="flex items-center justify-between rounded-sm border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors duration-150 hover:border-primary hover:bg-primary/10/50"
          >
            See your updated heatmap
            <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            More data, better strategy. The next exam window opens registration soon.
          </p>
        </Card>
      </div>
    )
  }

  if (step === 'done') {
    return (
      <Card className="p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
          <svg className="h-6 w-6 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-medium text-foreground">
          Thank you for sharing.
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Your result helps us improve SlateCamp for future candidates.
        </p>
      </Card>
    )
  }

  if (step === 'score') {
    return (
      <Card className="p-6 space-y-4">
        <div>
          <label htmlFor="score" className="block text-sm font-medium text-foreground mb-1.5">
            What was your reported score?
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            Optional — from the PRC results page.
          </p>
          <input
            type="number"
            id="score"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="e.g. 75"
            min={0}
            max={100}
            className="w-full rounded-sm border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={submitting}
            className="flex-1 rounded-sm bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={submitting}
            className="rounded-sm border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-150 ease-out hover:bg-muted"
          >
            Skip
          </button>
        </div>
      </Card>
    )
  }

  // Step 1: Result selection
  return (
    <Card className="p-6 space-y-4">
      <p className="text-sm font-medium text-foreground">
        Did you take the {examBatch} LEA?
      </p>

      <div className="space-y-2">
        {([
          { value: 'passed' as const, label: 'Yes — I passed' },
          { value: 'failed' as const, label: 'Yes — preparing for next cycle' },
          { value: 'did_not_take' as const, label: 'I did not take it' },
        ]).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleResultSelect(option.value)}
            disabled={submitting}
            className="flex w-full items-center justify-between rounded-sm border border-border px-4 py-3 text-left text-sm font-medium text-foreground transition-colors duration-150 hover:border-primary hover:bg-primary/10/50 disabled:opacity-60"
          >
            {option.label}
            <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {submitting && (
        <p className="text-center text-sm text-muted-foreground">Saving...</p>
      )}
    </Card>
  )
}

export default ExamOutcomeSurvey
