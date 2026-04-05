'use client'

import { useState } from 'react'

const BEDS = [
  {
    name: 'Twin',
    w: 990,
    l: 1900,
    svgW: 66,
    svgH: 127,
    rectW: 64,
    rectH: 125,
    info: 'Twin bed (990 × 1,900 mm) — Single occupant. Common in dormitories, children\u2019s rooms, and hospital wards. Minimum room: 6.00 sq m (PD 1096). Clearance: 900 mm on one side for passage, 600 mm at foot for wardrobe access.',
  },
  {
    name: 'Double',
    w: 1370,
    l: 1900,
    svgW: 91,
    svgH: 127,
    rectW: 89,
    rectH: 125,
    info: 'Double bed (1,370 × 1,900 mm) — Two occupants, budget. The most common ALE trap: students confuse this with queen. Needs 600 mm clearance on both sides for double occupancy.',
  },
  {
    name: 'Queen',
    w: 1520,
    l: 2030,
    svgW: 101,
    svgH: 136,
    rectW: 99,
    rectH: 134,
    info: 'Queen bed (1,520 × 2,030 mm) — Two occupants, standard. The most tested bed size on the ALE. Length is 2,030 mm (not 2,000). 150 mm wider than double, 130 mm longer.',
  },
  {
    name: 'King',
    w: 1930,
    l: 2030,
    svgW: 129,
    svgH: 136,
    rectW: 127,
    rectH: 134,
    info: 'King bed (1,930 × 2,030 mm) — Two occupants, luxury. Width nearly equals length — almost square. Requires a room width \u2265 3,830 mm (bed + 900 mm passage each side).',
  },
]

const formatDim = (mm: number) => mm.toLocaleString()

export const BedSizeComparator = () => {
  const [active, setActive] = useState(0)
  const bed = BEDS[active]

  return (
    <div className="not-prose my-5 rounded-[10px] border border-wiki-border overflow-hidden bg-white dark:bg-wiki-ink dark:border-wiki-invert-divider">
      {/* Header */}
      <div className="px-5 py-3.5 bg-muted border-b border-wiki-border dark:bg-wiki-surface-dark dark:border-wiki-invert-divider">
        <div className="font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.1em] text-camp-cobalt">
          Interactive · Tap a bed to see its clearance requirements
        </div>
      </div>

      {/* Bed SVGs */}
      <div className="flex gap-4 items-end justify-center flex-wrap px-6 py-6">
        {BEDS.map((b, i) => {
          const isActive = i === active
          return (
            <button
              key={b.name}
              type="button"
              onClick={() => setActive(i)}
              className="text-center transition-all duration-150 group"
            >
              <svg width={b.svgW} height={b.svgH}>
                <rect
                  x="1"
                  y="1"
                  width={b.rectW}
                  height={b.rectH}
                  rx="4"
                  className={`transition-all duration-150 ${
                    isActive
                      ? 'fill-camp-cobalt/15 stroke-camp-cobalt stroke-2'
                      : 'fill-cobalt-light stroke-[#E0DED8] stroke-1 group-hover:stroke-camp-cobalt group-hover:stroke-2'
                  }`}
                />
                <text
                  x={b.svgW / 2}
                  y={b.svgH / 2 + 3}
                  textAnchor="middle"
                  fontFamily="var(--font-dm-mono), monospace"
                  fontSize="9"
                  fill="#1B3FC4"
                >
                  {b.name.toUpperCase()}
                </text>
              </svg>
              <div className="font-[var(--font-dm-mono)] text-[11px] text-ink-muted mt-2 uppercase tracking-[0.08em]">
                {b.name}
              </div>
              <div className="font-[var(--font-dm-mono)] text-[11px] text-camp-cobalt font-medium mt-0.5">
                {formatDim(b.w)} × {formatDim(b.l)}
              </div>
            </button>
          )
        })}
      </div>

      {/* Info panel */}
      <div className="px-5 py-3.5 border-t border-wiki-divider text-[13px] text-wiki-body leading-relaxed min-h-[60px] dark:border-wiki-invert-divider dark:text-wiki-invert-body">
        <strong className="text-wiki-ink dark:text-wiki-invert-heading">
          {bed.name} bed ({formatDim(bed.w)} × {formatDim(bed.l)} mm)
        </strong>{' '}
        — {bed.info.split(' — ')[1]}
      </div>
    </div>
  )
}
