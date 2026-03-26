'use client'

import { useCallback, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { savePostdiction } from '@/lib/actions/quiz-v2/save-postdiction'

// ─── Marker positions ───────────────────────────────────────────────────────

const MARKERS = [0, 25, 50, 75, 100]

// ─── Props ──────────────────────────────────────────────────────────────────

interface PostdictionPromptProps {
  sessionId: string
  actualScore: number
  onReveal: () => void
  defaultValue?: number
}

// ─── Component ──────────────────────────────────────────────────────────────

const PostdictionPrompt = ({
  sessionId,
  actualScore,
  onReveal,
  defaultValue = 50,
}: PostdictionPromptProps) => {
  const [value, setValue] = useState(defaultValue)
  const [isPending, startTransition] = useTransition()

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Number(e.target.value))
  }, [])

  const handleShowScore = useCallback(() => {
    startTransition(async () => {
      await savePostdiction(sessionId, value, actualScore)
      onReveal()
    })
  }, [sessionId, value, actualScore, onReveal])

  const handleSkip = useCallback(() => {
    onReveal()
  }, [onReveal])

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-lg font-semibold text-[#1A2332]">
            Before you see your score — how do you think you did?
          </h2>
          <p className="mt-1 text-[13px] text-[#4A5568]">
            Estimating your performance builds self-assessment skills over time.
          </p>
        </div>

        {/* Slider card */}
        <div className="rounded-md border border-[#D4DAE3] bg-white p-6">
          {/* Current value display */}
          <div className="text-center mb-5">
            <span className="text-[40px] font-bold leading-none tabular-nums text-[#1A2332]">
              {value}
            </span>
            <span className="text-[24px] font-semibold text-[#4A5568]">%</span>
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
              aria-label="Estimated score percentage"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={value}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[#D4DAE3] accent-[#1B3FC4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3FC4]/20 focus-visible:ring-offset-2"
              style={{
                background: `linear-gradient(to right, #1B3FC4 0%, #1B3FC4 ${value}%, #D4DAE3 ${value}%, #D4DAE3 100%)`,
              }}
            />

            {/* Tick markers */}
            <div className="flex justify-between mt-2" aria-hidden="true">
              {MARKERS.map((mark) => (
                <span
                  key={mark}
                  className="text-[11px] tabular-nums text-[#8896A7]"
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
            onClick={handleShowScore}
            loading={isPending}
            disabled={isPending}
            className="rounded-sm"
          >
            Show My Score
          </Button>

          <button
            type="button"
            onClick={handleSkip}
            disabled={isPending}
            className="block w-full text-center text-[13px] text-[#4A5568] hover:text-[#1B3FC4] transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:underline disabled:opacity-50"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}

PostdictionPrompt.displayName = 'PostdictionPrompt'

export { PostdictionPrompt }
