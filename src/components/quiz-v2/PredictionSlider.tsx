'use client'

import { useCallback, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { savePrediction } from '@/lib/actions/quiz-v2/save-prediction'
import type { QuizMode } from '@/types/quiz-config'

// ─── Modes that show the prediction prompt ──────────────────────────────────

const PREDICTION_MODES: Set<QuizMode> = new Set(['storm', 'full_exam', 'endurance'])

export const shouldShowPrediction = (mode: QuizMode): boolean =>
  PREDICTION_MODES.has(mode)

// ─── Marker positions ───────────────────────────────────────────────────────

const MARKERS = [0, 25, 50, 75, 100]

// ─── Props ──────────────────────────────────────────────────────────────────

interface PredictionSliderProps {
  sessionId: string
  mode: QuizMode
  onConfirm: () => void
  defaultValue?: number
}

// ─── Component ──────────────────────────────────────────────────────────────

const PredictionSlider = ({
  sessionId,
  mode,
  onConfirm,
  defaultValue = 50,
}: PredictionSliderProps) => {
  const [value, setValue] = useState(defaultValue)
  const [isPending, startTransition] = useTransition()

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Number(e.target.value))
  }, [])

  const handleLockIn = useCallback(() => {
    startTransition(async () => {
      await savePrediction(sessionId, value)
      onConfirm()
    })
  }, [sessionId, value, onConfirm])

  const handleSkip = useCallback(() => {
    onConfirm()
  }, [onConfirm])

  if (!shouldShowPrediction(mode)) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Before you start — how do you think you'll do?
        </h2>
        <p className="mt-1 text-[13px] text-text-secondary">
          This isn't graded. It helps train your self-assessment accuracy.
        </p>
      </div>

      {/* Slider card */}
      <div className="rounded-md border border-border bg-card p-6">
        {/* Current value display */}
        <div className="text-center mb-5">
          <span className="text-[40px] font-bold leading-none tabular-nums text-foreground">
            {value}
          </span>
          <span className="text-[24px] font-semibold text-text-secondary">%</span>
        </div>

        {/* Slider */}
        <div className="relative px-1">
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={value}
            onChange={handleChange}
            aria-label="Predicted score percentage"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={value}
            className="w-full h-2 rounded-full appearance-none cursor-pointer bg-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
            style={{
              background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${value}%, var(--border) ${value}%, var(--border) 100%)`,
            }}
          />

          {/* Tick markers */}
          <div className="flex justify-between mt-2" aria-hidden="true">
            {MARKERS.map((mark) => (
              <span
                key={mark}
                className="text-[11px] tabular-nums text-muted-foreground"
              >
                {mark}%
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          variant="default"
          size="lg"
          fullWidth
          onClick={handleLockIn}
          loading={isPending}
          disabled={isPending}
          className="rounded-sm"
        >
          Lock In & Start
        </Button>

        <button
          type="button"
          onClick={handleSkip}
          disabled={isPending}
          className="block w-full text-center text-[13px] text-text-secondary hover:text-primary transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:underline disabled:opacity-50"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}

PredictionSlider.displayName = 'PredictionSlider'

export { PredictionSlider }
