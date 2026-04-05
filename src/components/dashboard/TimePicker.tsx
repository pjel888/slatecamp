'use client'

import { useState, useCallback } from 'react'
import { Clock } from '@phosphor-icons/react'

// ── Types ────────────────────────────────────────────────────────────────────

interface TimeOption {
  minutes: number
  label: string
  preview: string
}

interface TimePickerProps {
  onSelect: (minutes: number) => void
  isLoading?: boolean
}

// ── Options ──────────────────────────────────────────────────────────────────

const TIME_OPTIONS: TimeOption[] = [
  {
    minutes: 15,
    label: '15 min',
    preview: 'Quick review session',
  },
  {
    minutes: 30,
    label: '30 min',
    preview: 'Review cards + focused quiz',
  },
  {
    minutes: 60,
    label: '60 min',
    preview: 'Full dose: review, quiz, and weak areas',
  },
  {
    minutes: 120,
    label: '2+ hrs',
    preview: 'Extended session with timed practice',
  },
]

// ── Component ────────────────────────────────────────────────────────────────

export const TimePicker = ({ onSelect, isLoading = false }: TimePickerProps) => {
  const [selected, setSelected] = useState<number | null>(null)

  const handleSelect = useCallback(
    (minutes: number) => {
      if (isLoading) return
      setSelected(minutes)
      onSelect(minutes)
    },
    [onSelect, isLoading],
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock size={16} weight="bold" style={{ color: '#4A5568' }} />
        <p className="text-sm font-medium" style={{ color: '#1A2332' }}>
          How much time do you have?
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {TIME_OPTIONS.map((option) => {
          const isSelected = selected === option.minutes
          return (
            <button
              key={option.minutes}
              type="button"
              disabled={isLoading}
              onClick={() => handleSelect(option.minutes)}
              className={[
                'rounded-md border p-3 text-left transition-all duration-150 ease-out',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
                isSelected
                  ? 'border-camp-cobalt bg-primary-50 ring-1 ring-camp-cobalt'
                  : 'border-border bg-white hover:shadow-sm',
                isLoading ? 'cursor-wait opacity-60' : 'cursor-pointer',
              ].join(' ')}
              style={{
                // Focus ring in Cobalt
                // @ts-expect-error CSS custom property
                '--tw-ring-color': '#1B3FC4',
              }}
              aria-pressed={isSelected}
            >
              <span
                className="block text-lg font-semibold tabular-nums"
                style={{ color: isSelected ? '#1B3FC4' : '#1A2332' }}
              >
                {option.label}
              </span>
              <span
                className="mt-0.5 block text-xs leading-snug"
                style={{ color: '#4A5568' }}
              >
                {option.preview}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
