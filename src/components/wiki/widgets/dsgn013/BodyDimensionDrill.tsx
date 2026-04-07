'use client'

import { useState } from 'react'

const ITEMS = [
  { q: 'Male 50th %ile stature', a: '1,740 mm' },
  { q: 'Female 50th %ile stature', a: '1,622 mm' },
  { q: 'Male 50th %ile eye height (standing)', a: '1,630 mm' },
  { q: 'Male 50th %ile elbow height', a: '1,105 mm' },
  { q: 'Male 50th %ile seated height', a: '910 mm' },
  { q: 'Male 50th %ile popliteal height', a: '435 mm' },
  { q: 'Standard seat height', a: '430–450 mm' },
  { q: 'Standard desk height', a: '730–760 mm' },
  { q: 'Desk knee clearance', a: '680 mm minimum' },
  { q: 'Standing forward reach (max)', a: '610 mm' },
  { q: 'Standing comfortable reach', a: '460 mm' },
  { q: 'Wheelchair max overhead reach', a: '1,220 mm (unobstructed)' },
  { q: 'BP 344 accessible reach range', a: '380–1,220 mm AFF' },
  { q: 'Clear floor space (wheelchair)', a: '750 × 1,200 mm' },
  { q: 'Counter height (standard)', a: '850–900 mm' },
  { q: 'Handrail height (stairs)', a: '865–965 mm' },
  { q: 'Eye height for signage', a: '1,400–1,700 mm AFF' },
  { q: 'Monitor distance from eyes', a: '460–710 mm' },
]

export const BodyDimensionDrill = () => {
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
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-gradient-to-br from-signal-gold-light to-[var(--signal-gold-wash)] border-b border-wiki-border dark:from-warning/10 dark:to-warning/5 dark:border-wiki-invert-divider">
        <div className="w-7 h-7 rounded-lg bg-warning flex items-center justify-center text-white text-sm">
          🧠
        </div>
        <div className="font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.1em] text-signal-gold-deep">
          Retrieval Practice — Body Dimensions
        </div>
      </div>

      <div className="p-6 text-center">
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className={`w-full rounded-[10px] p-7 min-h-[120px] flex flex-col items-center justify-center transition-colors duration-150 cursor-pointer select-none ${
            revealed
              ? 'bg-cobalt-light dark:bg-camp-cobalt/10'
              : 'bg-muted hover:bg-cobalt-light dark:bg-wiki-surface-dark dark:hover:bg-camp-cobalt/10'
          }`}
        >
          <div className={`font-semibold transition-all duration-150 ${
            revealed ? 'text-[13px] text-ink-muted dark:text-wiki-muted' : 'text-base text-wiki-ink dark:text-wiki-invert-heading'
          }`}>
            {item.q}
          </div>
          {revealed && (
            <div className="font-[var(--font-dm-mono)] text-[28px] font-medium text-camp-cobalt mt-2.5">
              {item.a}
            </div>
          )}
          {!revealed && (
            <div className="text-xs text-wiki-muted mt-2 dark:text-ink-muted">Tap to reveal</div>
          )}
        </button>

        <div className="flex items-center justify-between mt-4">
          <button type="button" onClick={prev} className="px-4 py-2 border border-wiki-border rounded-lg bg-white text-[13px] font-medium text-ink-muted transition-all duration-150 hover:border-camp-cobalt hover:text-camp-cobalt dark:bg-wiki-surface-dark dark:border-wiki-invert-divider dark:text-wiki-muted">
            ← Previous
          </button>
          <span className="font-[var(--font-dm-mono)] text-xs text-wiki-muted">{idx + 1} / {ITEMS.length}</span>
          <button type="button" onClick={next} className="px-4 py-2 border border-wiki-border rounded-lg bg-white text-[13px] font-medium text-ink-muted transition-all duration-150 hover:border-camp-cobalt hover:text-camp-cobalt dark:bg-wiki-surface-dark dark:border-wiki-invert-divider dark:text-wiki-muted">
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
