'use client'

import { useState } from 'react'
import type { LeaSubjectKey, CompExamScores } from '@/lib/actions/comp-exam-onboarding'

// ── Subject list — flat, no Area A/B/C grouping ───────────────────────────────

const LEA_SUBJECTS: { key: LeaSubjectKey; label: string }[] = [
  { key: 'LEA-HIST', label: 'History of Architecture' },
  { key: 'LEA-THEO', label: 'Theory of Architecture' },
  { key: 'LEA-PLAN', label: 'Theory & Principles of Planning' },
  { key: 'LEA-PRAC', label: 'Professional Practice' },
  { key: 'LEA-STRU', label: 'Structural Design' },
  { key: 'LEA-MATL', label: 'Building Materials & Construction' },
  { key: 'LEA-UTIL', label: 'Building Utilities (MEPF)' },
]

// ── Tier indicator ─────────────────────────────────────────────────────────────

const getTierColor = (score: string): string => {
  const n = Number(score)
  if (!score || isNaN(n)) return 'bg-border'
  if (n < 50) return 'bg-destructive'
  if (n < 70) return 'bg-warning'
  return 'bg-success'
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
  isLoading?: boolean
}

// ── Component ──────────────────────────────────────────────────────────────────

export const ScoreEntryForm = ({ onSubmit, isLoading }: ScoreEntryFormProps) => {
  const [scores, setScores] = useState<Partial<Record<LeaSubjectKey, string>>>(
    Object.fromEntries(LEA_SUBJECTS.map(s => [s.key, ''])) as Partial<Record<LeaSubjectKey, string>>
  )
  const [examDate, setExamDate] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const handleChange = (key: LeaSubjectKey, value: string) => {
    // Allow empty or numeric 0-100
    if (value === '' || (Number(value) >= 0 && Number(value) <= 100 && /^\d{0,3}$/.test(value))) {
      setScores(prev => ({ ...prev, [key]: value }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate all fields are filled
    const missing = LEA_SUBJECTS.filter(s => scores[s.key] === '' || scores[s.key] === undefined)
    if (missing.length > 0) {
      setError('Please enter a score for every subject.')
      return
    }

    const parsed = Object.fromEntries(
      LEA_SUBJECTS.map(s => [s.key, Number(scores[s.key])])
    ) as CompExamScores

    onSubmit(parsed, examDate || null)
  }

  const filledCount = LEA_SUBJECTS.filter(s => scores[s.key] !== '' && scores[s.key] !== undefined).length

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Subjects */}
      <div className="space-y-3">
        {LEA_SUBJECTS.map(({ key, label }) => {
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
                className="flex-1 text-sm text-foreground leading-tight"
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
                    className="w-16 rounded-sm border border-border bg-card px-2.5 py-1.5 text-right text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    aria-label={`${label} score`}
                  />
                  <span className="ml-1 text-sm text-muted-foreground">%</span>
                </div>

                {/* Tier label */}
                <span className="w-20 text-[11px] text-muted-foreground text-right hidden sm:block">
                  {tierLabel}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Progress note */}
      {filledCount > 0 && filledCount < LEA_SUBJECTS.length && (
        <p className="text-xs text-muted-foreground">
          {filledCount} of {LEA_SUBJECTS.length} subjects entered
        </p>
      )}

      {/* Exam date — optional */}
      <div className="border-t border-border pt-4">
        <label htmlFor="comp-exam-date" className="block text-sm font-medium text-foreground mb-1.5">
          When did you take the comp exam?{' '}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <input
          id="comp-exam-date"
          type="date"
          value={examDate}
          onChange={e => setExamDate(e.target.value)}
          className="w-full rounded-sm border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-sm border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-sm bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Mapping your scores…' : 'Map my scores →'}
      </button>
    </form>
  )
}
