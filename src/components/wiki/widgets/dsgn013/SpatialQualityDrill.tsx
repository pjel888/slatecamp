'use client'

import { useState } from 'react'

const ITEMS = [
  { q: 'D/H ratio for "threshold of enclosure"', a: 'D/H = 1' },
  { q: 'D/H ratio where enclosure dissolves', a: 'D/H > 3' },
  { q: 'Golden section ratio', a: '1 : 1.618 (φ)' },
  { q: '√2 rectangle ratio', a: '1 : 1.414' },
  { q: 'Minimum ceiling height — ground floor (PD 1096)', a: '2.70 m' },
  { q: 'Minimum ceiling height — upper floors (PD 1096)', a: '2.40 m' },
  { q: 'Mezzanine minimum clear height', a: '1.80 m (floor to ceiling underside)' },
  { q: 'Prospect-refuge theory author', a: 'Jay Appleton (1975)' },
  { q: 'Human intimate distance zone', a: '0 – 450 mm' },
  { q: 'Human personal distance zone', a: '450 – 1,200 mm' },
  { q: 'Human social distance zone', a: '1,200 – 3,600 mm' },
  { q: 'Human public distance zone', a: '3,600 mm and beyond' },
  { q: 'Ideal conversation distance', a: '1,500 – 2,400 mm' },
  { q: 'Maximum interior distance for facial recognition', a: '~12,000 mm (12 m)' },
  { q: 'Standard residential ceiling height (PH practice)', a: '2.70 – 3.00 m' },
  { q: 'Grand/monumental ceiling height', a: '4.50 m and above' },
]

export const SpatialQualityDrill = () => {
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
    <div className="not-prose my-5 rounded-[10px] border border-[#E0DED8] overflow-hidden bg-white dark:bg-[#1A1A1A] dark:border-[#3A3835]">
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-gradient-to-br from-[#FFF8E6] to-[#FFF4DC] border-b border-[#E0DED8] dark:from-[#D4951A]/10 dark:to-[#D4951A]/5 dark:border-[#3A3835]">
        <div className="w-7 h-7 rounded-lg bg-[#D4951A] flex items-center justify-center text-white text-sm">
          🧠
        </div>
        <div className="font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.1em] text-[#D4900C]">
          Retrieval Practice — Spatial Quality
        </div>
      </div>

      <div className="p-6 text-center">
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className={`w-full rounded-[10px] p-7 min-h-[120px] flex flex-col items-center justify-center transition-colors duration-150 cursor-pointer select-none ${
            revealed
              ? 'bg-[#EEF3FD] dark:bg-[#1B3FC4]/10'
              : 'bg-[#F5F5F5] hover:bg-[#EEF3FD] dark:bg-[#252420] dark:hover:bg-[#1B3FC4]/10'
          }`}
        >
          <div className={`font-semibold transition-all duration-150 ${
            revealed ? 'text-[13px] text-[#737370] dark:text-[#A8A8A5]' : 'text-base text-[#1A1A1A] dark:text-[#E2E0D8]'
          }`}>
            {item.q}
          </div>
          {revealed && (
            <div className="font-[var(--font-dm-mono)] text-[28px] font-medium text-[#1B3FC4] mt-2.5">
              {item.a}
            </div>
          )}
          {!revealed && (
            <div className="text-xs text-[#A8A8A5] mt-2 dark:text-[#737370]">Tap to reveal</div>
          )}
        </button>

        <div className="flex items-center justify-between mt-4">
          <button type="button" onClick={prev} className="px-4 py-2 border border-[#E0DED8] rounded-lg bg-white text-[13px] font-medium text-[#737370] transition-all duration-150 hover:border-[#1B3FC4] hover:text-[#1B3FC4] dark:bg-[#252420] dark:border-[#3A3835] dark:text-[#A8A8A5]">
            ← Previous
          </button>
          <span className="font-[var(--font-dm-mono)] text-xs text-[#A8A8A5]">{idx + 1} / {ITEMS.length}</span>
          <button type="button" onClick={next} className="px-4 py-2 border border-[#E0DED8] rounded-lg bg-white text-[13px] font-medium text-[#737370] transition-all duration-150 hover:border-[#1B3FC4] hover:text-[#1B3FC4] dark:bg-[#252420] dark:border-[#3A3835] dark:text-[#A8A8A5]">
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
