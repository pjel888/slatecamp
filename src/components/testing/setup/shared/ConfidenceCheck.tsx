'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { SubjectConfidence, ConfidenceRating } from '@/types/testing'

interface SubjectEntry {
  subjectId: string
  subjectName: string
}

interface ConfidenceCheckProps {
  subjects: SubjectEntry[]
  ratings: SubjectConfidence[]
  onChange: (updated: SubjectConfidence[]) => void
}

const CONFIDENCE_LEVELS: { value: ConfidenceRating; label: string; emoji: string }[] = [
  { value: 1, label: 'No idea', emoji: '😰' },
  { value: 2, label: 'Shaky', emoji: '😟' },
  { value: 3, label: 'Okay', emoji: '😐' },
  { value: 4, label: 'Good', emoji: '😊' },
  { value: 5, label: 'Solid', emoji: '💪' },
]

const getConfidenceColor = (rating: ConfidenceRating): string => {
  if (rating <= 1) return 'var(--warm-red)'
  if (rating <= 2) return 'var(--warning)'
  if (rating <= 3) return 'var(--primary)'
  if (rating <= 4) return 'var(--success)'
  return 'var(--success)'
}

const getConfidenceLabel = (rating: ConfidenceRating): string =>
  CONFIDENCE_LEVELS.find((l) => l.value === rating)?.label ?? ''

const getTrackGradient = (rating: ConfidenceRating): string => {
  const pct = ((rating - 1) / 4) * 100
  const color = getConfidenceColor(rating)
  return `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, var(--border-default) ${pct}%, var(--border-default) 100%)`
}

const ConfidenceCheck = ({ subjects, ratings, onChange }: ConfidenceCheckProps) => {
  const [expandedTooltip, setExpandedTooltip] = useState(false)

  const getRating = useCallback(
    (subjectId: string): ConfidenceRating =>
      ratings.find((r) => r.subjectId === subjectId)?.rating ?? 3,
    [ratings],
  )

  const handleSliderChange = useCallback(
    (subjectId: string, subjectName: string, newValue: ConfidenceRating) => {
      const existing = ratings.find((r) => r.subjectId === subjectId)
      if (existing) {
        onChange(
          ratings.map((r) =>
            r.subjectId === subjectId ? { ...r, rating: newValue } : r,
          ),
        )
      } else {
        onChange([...ratings, { subjectId, subjectName, rating: newValue }])
      }
    },
    [ratings, onChange],
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-2 mb-1">
        <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
          How confident are you in these areas right now? Drag to rate — we&apos;ll show you how
          accurate your predictions were afterward.
        </p>
        <button
          type="button"
          onClick={() => setExpandedTooltip(!expandedTooltip)}
          aria-label="About confidence check"
          aria-expanded={expandedTooltip}
          className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full border border-[var(--border-default)] text-[var(--muted-foreground)] text-[11px] font-medium hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors duration-150 ease-out"
        >
          ?
        </button>
      </div>

      {/* Expanded tooltip */}
      {expandedTooltip && (
        <div
          className="mt-2 mb-3 rounded-md p-3 text-[13px] leading-relaxed"
          style={{ backgroundColor: 'var(--primary)', color: 'white', opacity: 0.9 }}
          role="note"
        >
          This helps you develop self-awareness about what you know. Your prediction
          doesn&apos;t affect your score — it&apos;s a metacognitive exercise. After the session,
          you&apos;ll see how your confidence compared to your actual performance.
        </div>
      )}

      {/* Scale labels */}
      <div className="flex items-center justify-between mt-4 mb-2 px-1">
        <span className="text-[11px] font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
          No idea
        </span>
        <span className="text-[11px] font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
          Solid
        </span>
      </div>

      {/* Subject sliders */}
      <div className="space-y-4">
        {subjects.map((subject) => {
          const currentRating = getRating(subject.subjectId)
          const color = getConfidenceColor(currentRating)
          const label = getConfidenceLabel(currentRating)

          return (
            <div key={subject.subjectId} className="group">
              {/* Subject name + current label */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] font-medium text-[var(--foreground)] truncate">
                  {subject.subjectName}
                </span>
                <span
                  className="text-[12px] font-medium transition-colors duration-150 tabular-nums"
                  style={{ color }}
                >
                  {label}
                </span>
              </div>

              {/* Custom slider track */}
              <div className="relative">
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={currentRating}
                  onChange={(e) =>
                    handleSliderChange(
                      subject.subjectId,
                      subject.subjectName,
                      Number(e.target.value) as ConfidenceRating,
                    )
                  }
                  aria-label={`Confidence level for ${subject.subjectName}`}
                  aria-valuetext={label}
                  className={cn(
                    'w-full h-6 appearance-none bg-transparent cursor-pointer',
                    'focus-visible:outline-none',
                    // Track styling
                    '[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full',
                    '[&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full',
                    // Thumb styling
                    '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:-mt-[7px] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150',
                    '[&::-webkit-slider-thumb]:hover:scale-110',
                    '[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md',
                  )}
                  style={{
                    // Dynamic track gradient
                    // @ts-expect-error CSS custom property for track gradient
                    '--slider-track': getTrackGradient(currentRating),
                    '--slider-thumb-bg': color,
                  }}
                  ref={(el) => {
                    if (el) {
                      el.style.setProperty('--slider-bg', getTrackGradient(currentRating))
                      // Apply track gradient via inline style on the element
                      const style = document.createElement('style')
                      const id = `slider-${subject.subjectId}`
                      const existing = document.getElementById(id)
                      if (existing) existing.remove()
                      style.id = id
                      style.textContent = `
                        #${CSS.escape(el.id || id)} {
                          &::-webkit-slider-runnable-track { background: ${getTrackGradient(currentRating)}; }
                          &::-moz-range-track { background: ${getTrackGradient(currentRating)}; }
                          &::-webkit-slider-thumb { background: ${color}; }
                          &::-moz-range-thumb { background: ${color}; }
                        }
                      `
                      el.id = el.id || id
                      document.head.appendChild(style)
                    }
                  }}
                />

                {/* Step indicators */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none px-[2px]">
                  {CONFIDENCE_LEVELS.map((level) => (
                    <div
                      key={level.value}
                      className={cn(
                        'w-1.5 h-1.5 rounded-full transition-all duration-150',
                        currentRating >= level.value
                          ? 'opacity-0'
                          : 'opacity-30',
                      )}
                      style={{
                        backgroundColor: currentRating >= level.value ? color : 'var(--muted-foreground)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

ConfidenceCheck.displayName = 'ConfidenceCheck'

export { ConfidenceCheck }
