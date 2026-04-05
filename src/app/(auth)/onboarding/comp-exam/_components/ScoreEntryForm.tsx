'use client'

import { useState } from 'react'
import type { AleSubjectKey, CompExamScores } from '@/lib/actions/comp-exam-onboarding'

// ── Subject list — flat, no Area A/B/C grouping ───────────────────────────────

const ALE_SUBJECTS: { key: AleSubjectKey; label: string }[] = [
  { key: 'ALE-HIST', label: 'History of Architecture' },
  { key: 'ALE-THEO', label: 'Theory of Architecture' },
  { key: 'ALE-PLAN', label: 'Theory & Principles of Planning' },
  { key: 'ALE-PRAC', label: 'Professional Practice' },
  { key: 'ALE-STRU', label: 'Structural Design' },
  { key: 'ALE-MATL', label: 'Building Materials & Construction' },
  { key: 'ALE-UTIL', label: 'Building Utilities (MEPF)' },
]

// ── Tier indicator ─────────────────────────────────────────────────────────────

const getTierColor = (score: string): string => {
  const n = Number(score)
  if (!score || isNaN(n)) return 'bg-[#D4DAE3]'
  if (n < 50) return 'bg-[#D64545]'
  if (n < 70) return 'bg-[#D4951A]'
  return 'bg-[#2D9F6F]'
}

const getTierLabel = (score: string): string => {
  const n = Number(score)
  if (!score || isNaN(n)) return ''
  if (n < 50) return 'Needs focus'
  if (n < 70) return 'Developing'
  return 'Strong'
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface ScoreEntryFormProps {
  onSubmit: (scores: CompExamScores, examDate: string | null) => void
  isLoading: boolean
}

// ── Component ──────────────────────────────────────────────────────────────────

export const ScoreEntryForm = ({ onSubmit, isLoading }: ScoreEntryFormProps) => {
  const [scores, setScores] = useState<Partial<Record<AleSubjectKey, string>>>(
    Object.fromEntries(ALE_SUBJECTS.map(s => [s.key, ''])) as Partial<Record<AleSubjectKey, string>>
  )
  const [examDate, setExamDate] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const handleChange = (key: AleSubjectKey, value: string) => {
    // Allow empty or numeric 0-100
    if (value === '' || (Number(value) >= 0 && Number(value) <= 100 && /^\d{0,3}$/.test(value))) {
      setScores(prev => ({ ...prev, [key]: value }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate all fields are filled
    const missing = ALE_SUBJECTS.filter(s => scores[s.key] === '' || scores[s.key] === undefined)
    if (missing.length > 0) {
      setError('Please enter a score for every subject.')
      return
    }

    const parsed = Object.fromEntries(
      ALE_SUBJECTS.map(s => [s.key, Number(scores[s.key])])
    ) as CompExamScores

    onSubmit(parsed, examDate || null)
  }

  const filledCount = ALE_SUBJECTS.filter(s => scores[s.key] !== '' && scores[s.key] !== undefined).length

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Subjects */}
      <div className="space-y-3">
        {ALE_SUBJECTS.map(({ key, label }) => {
          const val = scores[key] ?? ''
          const tierColor = getTierColor(val)
          const tierLabel = getTierLabel(val)

          return (
            <div key={key} className="flex items-center gap-3">
              {/* Tier dot */}
              <div
                className={[
                  'h-2.5 w-2.5 shrink-0 rounded-full transition-colors duration-150',
                  tierColor,
                ].join(' ')}
                aria-hidden="true"
              />

              {/* Label */}
              <label
                htmlFor={`score-${key}`}
                className="flex-1 text-sm text-[#1A2332] leading-tight"
              >
                {label}
              </label>

              {/* Score input with % suffix */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="relative flex items-center">
                  <input
                    id={`score-${key}`}
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={val}
                    onChange={e => handleChange(key, e.target.value)}
                    placeholder="—"
                    className="w-16 rounded-sm border border-[#D4DAE3] bg-white px-2.5 py-1.5 text-right text-sm text-[#1A2332] placeholder:text-[#8896A7] focus:border-[#1B3FC4] focus:outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    aria-label={`${label} score`}
                  />
                  <span className="ml-1 text-sm text-[#4A5568]">%</span>
                </div>

                {/* Tier label */}
                <span className="w-20 text-[11px] text-[#4A5568] text-right hidden sm:block">
                  {tierLabel}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Progress note */}
      {filledCount > 0 && filledCount < ALE_SUBJECTS.length && (
        <p className="text-xs text-[#4A5568]">
          {filledCount} of {ALE_SUBJECTS.length} subjects entered
        </p>
      )}

      {/* Exam date — optional */}
      <div className="border-t border-[#D4DAE3] pt-4">
        <label htmlFor="comp-exam-date" className="block text-sm font-medium text-[#1A2332] mb-1.5">
          When did you take the comp exam?{' '}
          <span className="font-normal text-[#8896A7]">(optional)</span>
        </label>
        <input
          id="comp-exam-date"
          type="date"
          value={examDate}
          onChange={e => setExamDate(e.target.value)}
          className="w-full rounded-sm border border-[#D4DAE3] bg-white px-3 py-2 text-sm text-[#1A2332] focus:border-[#1B3FC4] focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-sm border border-[#D64545] bg-[#FDF0F0] px-3 py-2 text-sm text-[#D64545]">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-sm bg-[#1B3FC4] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Mapping your scores…' : 'Map my scores →'}
      </button>
    </form>
  )
}
