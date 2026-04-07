'use client'

import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfidenceInputProps {
  /** Continuous 0–1 value. 0 = guessing, 1 = confident */
  value: number | null
  onChange: (v: number) => void
  disabled?: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getLabel = (v: number): string => {
  if (v <= 0.25) return 'Guessing'
  if (v <= 0.5) return 'Not sure'
  if (v <= 0.75) return 'Partly sure'
  return 'Confident'
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ConfidenceInput = ({
  value,
  onChange,
  disabled = false,
}: ConfidenceInputProps) => {
  const current = value ?? 0.5
  const label = getLabel(current)
  const percentage = Math.round(current * 100)

  return (
    <div
      className={cn(
        'flex flex-col gap-1.5 py-3',
        disabled && 'opacity-30 pointer-events-none',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          <span className="font-semibold">Optional</span>
          {' · '}
          How sure are you of your answer?
        </span>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {label} ({percentage}%)
        </span>
      </div>

      {/* Continuous slider 0–1 — thumb turns Cobalt on hover */}
      <div className="flex flex-col gap-1 group">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={percentage}
          onChange={(e) => onChange(Number(e.target.value) / 100)}
          disabled={disabled}
          className="confidence-slider w-full h-1 appearance-none rounded-full cursor-pointer"
          style={{ backgroundColor: 'var(--border)' }}
          onMouseEnter={(e) => { e.currentTarget.style.setProperty('--thumb-bg', 'var(--primary)'); e.currentTarget.style.backgroundColor = 'var(--primary-50)' }}
          onMouseLeave={(e) => { e.currentTarget.style.setProperty('--thumb-bg', 'var(--muted-foreground)'); e.currentTarget.style.backgroundColor = 'var(--border)' }}
          onMouseDown={(e) => { e.currentTarget.style.setProperty('--thumb-bg', 'var(--primary-700)') }}
          onMouseUp={(e) => { e.currentTarget.style.setProperty('--thumb-bg', 'var(--primary)') }}
          aria-label="Confidence level"
          aria-valuetext={`${label} ${percentage}%`}
        />
        <style>{`
          .confidence-slider { --thumb-bg: var(--muted-foreground); }
          .confidence-slider::-webkit-slider-thumb {
            -webkit-appearance: none; appearance: none;
            width: 14px; height: 14px; border-radius: 50%;
            background: var(--thumb-bg); border: none; cursor: pointer;
            transition: background-color 150ms ease-out;
          }
          .confidence-slider::-moz-range-thumb {
            width: 14px; height: 14px; border-radius: 50%;
            background: var(--thumb-bg); border: none; cursor: pointer;
          }
          .confidence-slider::-moz-range-track { background: transparent; }
        `}</style>

        {/* Fixed labels under slider */}
        <div className="flex justify-between">
          <span className="text-[10px] text-muted-foreground">Guessing</span>
          <span className="text-[10px] text-muted-foreground">Confident</span>
        </div>
      </div>
    </div>
  )
}
