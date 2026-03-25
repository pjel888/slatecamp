'use client'

import { useState } from 'react'

interface RoomProportion {
  ratio: string
  label: string
  w: number
  h: number
  description: string
  examples: string
  quality: string
}

const PROPORTIONS: RoomProportion[] = [
  {
    ratio: '1 : 1',
    label: 'Square',
    w: 100,
    h: 100,
    description: 'Equal dimensions. Static, stable, but can feel monotonous. No dominant axis — furniture arrangement becomes the spatial organizer. Difficult to create visual hierarchy.',
    examples: 'Small bedrooms, utility rooms, service spaces. Rarely used for living spaces in good design.',
    quality: 'Static',
  },
  {
    ratio: '1 : 1.4',
    label: '√2 Rectangle',
    w: 100,
    h: 140,
    description: 'The √2 proportion (A-series paper ratio). A gentle directionality that feels natural without being corridorlike. Many traditional Japanese tatami rooms use this or similar proportions.',
    examples: 'Study rooms, small offices, consultation rooms, tatami rooms (2:3 mat layout).',
    quality: 'Balanced',
  },
  {
    ratio: '1 : 1.618',
    label: 'Golden Rectangle',
    w: 100,
    h: 162,
    description: 'The golden section — historically considered the most aesthetically pleasing rectangle. Provides clear directionality with a sense of visual completeness. Neither too long nor too square.',
    examples: 'Living rooms, master bedrooms, conference rooms, gallery spaces, Parthenon floor plan.',
    quality: 'Harmonious',
  },
  {
    ratio: '1 : 2',
    label: 'Double Square',
    w: 100,
    h: 200,
    description: 'Strong axial direction. Functions well for movement-oriented spaces with entry at one end. The long axis creates a clear visual destination. Can feel corridorlike if too narrow.',
    examples: 'Dining rooms, narrow galleries, corridor-kitchen layouts, bowling-alley bedrooms (avoid for habitable rooms).',
    quality: 'Directional',
  },
]

export const ProportionComparator = () => {
  const [activeIdx, setActiveIdx] = useState(2) // Golden ratio as default

  return (
    <div className="not-prose my-5 rounded-[10px] border border-[#E0DED8] overflow-hidden bg-white dark:bg-wiki-ink dark:border-[#3A3835]">
      <div className="px-5 py-3.5 bg-muted border-b border-[#E0DED8] dark:bg-[#252420] dark:border-[#3A3835]">
        <div className="font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.1em] text-camp-cobalt">
          Interactive · Room Proportion Comparator
        </div>
        <div className="text-xs text-ink-muted mt-0.5 dark:text-[#A8A8A5]">
          Tap a proportion to see its spatial quality and design implications
        </div>
      </div>

      {/* Proportion SVGs */}
      <div className="flex items-end justify-center gap-5 px-5 py-6 flex-wrap">
        {PROPORTIONS.map((p, i) => {
          const isActive = i === activeIdx
          const scale = 0.7
          const w = p.w * scale
          const h = p.h * scale
          return (
            <button
              key={p.ratio}
              type="button"
              onClick={() => setActiveIdx(i)}
              className="flex flex-col items-center transition-all duration-150 group"
            >
              <svg width={w + 10} height={h + 10}>
                <rect
                  x="5"
                  y="5"
                  width={w}
                  height={h}
                  rx="3"
                  className={`transition-all duration-150 ${
                    isActive
                      ? 'fill-camp-cobalt/10 stroke-camp-cobalt stroke-2'
                      : 'fill-muted stroke-[#E0DED8] stroke-1 group-hover:stroke-camp-cobalt'
                  }`}
                />
                <text
                  x={w / 2 + 5}
                  y={h / 2 + 8}
                  textAnchor="middle"
                  fontFamily="var(--font-dm-mono), monospace"
                  fontSize="9"
                  fill={isActive ? '#1B3FC4' : '#A8A8A5'}
                >
                  {p.ratio}
                </text>
              </svg>
              <div className={`font-[var(--font-dm-mono)] text-[11px] mt-2 uppercase tracking-[0.06em] transition-colors duration-150 ${
                isActive ? 'text-camp-cobalt font-medium' : 'text-[#A8A8A5]'
              }`}>
                {p.label}
              </div>
              <div className={`text-[11px] mt-0.5 ${isActive ? 'text-wiki-ink font-medium dark:text-[#E2E0D8]' : 'text-[#A8A8A5]'}`}>
                {p.quality}
              </div>
            </button>
          )
        })}
      </div>

      {/* Info */}
      <div className="px-5 py-4 border-t border-[#ECEAE4] dark:border-[#3A3835]">
        <div className="font-semibold text-sm text-wiki-ink mb-1.5 dark:text-[#E2E0D8]">
          {PROPORTIONS[activeIdx].ratio} — {PROPORTIONS[activeIdx].label}
        </div>
        <p className="text-[13px] text-[#3D3D3A] leading-relaxed mb-2 dark:text-[#C8C6C0]">
          {PROPORTIONS[activeIdx].description}
        </p>
        <div className="text-[12px] text-ink-muted dark:text-[#A8A8A5]">
          <strong className="text-wiki-ink dark:text-[#E2E0D8]">Common uses:</strong> {PROPORTIONS[activeIdx].examples}
        </div>
      </div>
    </div>
  )
}
