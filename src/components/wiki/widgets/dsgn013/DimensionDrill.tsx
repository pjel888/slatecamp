'use client'

import { useState } from 'react'

const ITEMS = [
  { q: 'Twin bed dimensions', a: '990 × 1,900 mm' },
  { q: 'Double bed dimensions', a: '1,370 × 1,900 mm' },
  { q: 'Queen bed dimensions', a: '1,520 × 2,030 mm' },
  { q: 'King bed dimensions', a: '1,930 × 2,030 mm' },
  { q: 'Dining table height', a: '750 mm' },
  { q: 'Standard chair seat height', a: '450 mm' },
  { q: 'Kitchen counter height', a: '850–900 mm' },
  { q: 'Counter depth', a: '600 mm' },
  { q: 'Round table for 8', a: '1,524 mm (60") diameter' },
  { q: 'Clerical workstation area (ALE)', a: '4.60 sq m' },
  { q: 'Office area per employee (ALE)', a: '9.30 sq m (NFA)' },
  { q: 'PD 1096 min bedroom area', a: '6.00 sq m, min dim 2.00 m' },
  { q: 'PD 1096 min kitchen area', a: '3.00 sq m, min dim 1.50 m' },
  { q: 'PD 1096 min T&B area', a: '1.20 sq m, min dim 0.90 m' },
]

export const DimensionDrill = () => {
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const item = ITEMS[idx]

  const next = () => {
    setIdx((idx + 1) % ITEMS.length)
    setRevealed(false)
  }

  const prev = () => {
    setIdx((idx - 1 + ITEMS.length) % ITEMS.length)
    setRevealed(false)
  }

  return (
    <div className="not-prose my-5 rounded-md border border-border overflow-hidden bg-card dark:bg-card">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-gradient-to-br from-signal-gold-light to-[var(--signal-gold-wash)] border-b border-wiki-border dark:from-warning/10 dark:to-warning/5 dark:border-wiki-invert-divider">
        <div className="w-7 h-7 rounded-lg bg-warning flex items-center justify-center text-white text-sm">
          🧠
        </div>
        <div className="font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.1em] text-signal-gold-deep">
          Retrieval Practice
        </div>
      </div>

      {/* Drill card */}
      <div className="p-6 text-center">
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className={`w-full rounded-md p-7 min-h-[120px] flex flex-col items-center justify-center transition-colors duration-150 cursor-pointer select-none ${
            revealed
              ? 'bg-cobalt-light dark:bg-camp-cobalt/10'
              : 'bg-muted hover:bg-cobalt-light dark:bg-wiki-surface-dark dark:hover:bg-camp-cobalt/10'
          }`}
        >
          <div
            className={`font-semibold transition-all duration-150 ${
              revealed
                ? 'text-[13px] text-ink-muted dark:text-wiki-muted'
                : 'text-base text-wiki-ink dark:text-wiki-invert-heading'
            }`}
          >
            {item.q}
          </div>
          {revealed && (
            <div className="font-[var(--font-dm-mono)] text-[28px] font-medium text-camp-cobalt mt-2.5">
              {item.a}
            </div>
          )}
          {!revealed && (
            <div className="text-xs text-wiki-muted mt-2 dark:text-ink-muted">
              Tap to reveal
            </div>
          )}
        </button>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={prev}
            className="px-4 py-2 border border-wiki-border rounded-lg bg-white text-[13px] font-medium text-ink-muted transition-all duration-150 hover:border-camp-cobalt hover:text-camp-cobalt dark:bg-wiki-surface-dark dark:border-wiki-invert-divider dark:text-wiki-muted"
          >
            ← Previous
          </button>
          <span className="font-[var(--font-dm-mono)] text-xs text-wiki-muted">
            {idx + 1} / {ITEMS.length}
          </span>
          <button
            type="button"
            onClick={next}
            className="px-4 py-2 border border-wiki-border rounded-lg bg-white text-[13px] font-medium text-ink-muted transition-all duration-150 hover:border-camp-cobalt hover:text-camp-cobalt dark:bg-wiki-surface-dark dark:border-wiki-invert-divider dark:text-wiki-muted"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
