'use client'

import { useState } from 'react'

interface RatioData {
  ratio: string
  d: number
  h: number
  label: string
  feeling: string
  examples: string
  color: string
}

const RATIOS: RatioData[] = [
  {
    ratio: 'D/H < 1',
    d: 60,
    h: 100,
    label: 'Enclosed',
    feeling: 'Intimate, enclosed, potentially oppressive. Strong sense of containment. Vertical surfaces dominate the visual field.',
    examples: 'Narrow alleys, traditional European streets, Japanese machiya corridors, Gothic cathedral naves',
    color: '#1B3FC4',
  },
  {
    ratio: 'D/H = 1',
    d: 100,
    h: 100,
    label: 'Balanced',
    feeling: 'Fully enclosed but not oppressive. The "threshold of enclosure" — walls and floor/sky feel equally present. Strong spatial definition.',
    examples: 'Italian piazzas, traditional courtyard houses, well-proportioned urban streets',
    color: '#2D9F6F',
  },
  {
    ratio: 'D/H = 2',
    d: 140,
    h: 70,
    label: 'Comfortable',
    feeling: 'Spacious but still defined. The sky becomes a significant presence. Most people feel comfortable and oriented. The "sweet spot" for many civic spaces.',
    examples: 'Grand boulevards, campus quads, residential streets with mature trees',
    color: '#D4951A',
  },
  {
    ratio: 'D/H = 3',
    d: 180,
    h: 60,
    label: 'Open',
    feeling: 'Enclosure begins to dissolve. Buildings read as individual objects rather than space-defining walls. Landscape elements (trees, topography) become necessary to maintain spatial coherence.',
    examples: 'Suburban arterials, parking lots with perimeter buildings, open plazas',
    color: '#E63329',
  },
  {
    ratio: 'D/H > 4',
    d: 220,
    h: 55,
    label: 'Lost',
    feeling: 'No sense of enclosure. The space feels undefined, windswept, or "lost." Buildings are too far apart to create spatial walls. Disorienting without strong landscape structure.',
    examples: 'Highway corridors, big-box retail pads, empty lots between towers',
    color: '#737370',
  },
]

export const DHRatioExplorer = () => {
  const [activeIdx, setActiveIdx] = useState(1)
  const active = RATIOS[activeIdx]

  return (
    <div className="not-prose my-5 rounded-[10px] border border-[#E0DED8] overflow-hidden bg-white dark:bg-[#1A1A1A] dark:border-[#3A3835]">
      {/* Header */}
      <div className="px-5 py-3.5 bg-gradient-to-br from-[#EEF3FD] to-[#E8EEFF] border-b border-[#E0DED8] dark:from-[#1B3FC4]/10 dark:to-[#1B3FC4]/5 dark:border-[#3A3835]">
        <div className="font-[var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[0.1em] text-[#1B3FC4]">
          Interactive · D/H Ratio and Spatial Enclosure
        </div>
        <div className="text-xs text-[#737370] mt-0.5 dark:text-[#A8A8A5]">
          Tap a ratio to see how distance-to-height affects spatial perception
        </div>
      </div>

      {/* SVG visualization */}
      <div className="px-5 pt-5 pb-2 overflow-x-auto">
        <div className="flex items-end justify-center gap-3 min-w-[480px]">
          {RATIOS.map((r, i) => {
            const isActive = i === activeIdx
            return (
              <button
                key={r.ratio}
                type="button"
                onClick={() => setActiveIdx(i)}
                className="flex flex-col items-center transition-all duration-150 group"
              >
                <svg width={Math.max(r.d + 20, 70)} height={r.h + 30} className="mb-1">
                  {/* Left wall */}
                  <rect
                    x="5" y={30 - (r.h > 80 ? 0 : 10)}
                    width="8" height={r.h}
                    fill={isActive ? r.color : '#E0DED8'}
                    rx="1"
                    className="transition-colors duration-150"
                  />
                  {/* Right wall */}
                  <rect
                    x={r.d + 7} y={30 - (r.h > 80 ? 0 : 10)}
                    width="8" height={r.h}
                    fill={isActive ? r.color : '#E0DED8'}
                    rx="1"
                    className="transition-colors duration-150"
                  />
                  {/* Ground line */}
                  <line
                    x1="5" y1={r.h + 30 - (r.h > 80 ? 0 : 10)}
                    x2={r.d + 15} y2={r.h + 30 - (r.h > 80 ? 0 : 10)}
                    stroke={isActive ? r.color : '#E0DED8'}
                    strokeWidth="1.5"
                    strokeDasharray={isActive ? 'none' : '4 3'}
                  />
                  {/* Person dot */}
                  <circle
                    cx={(r.d + 20) / 2}
                    cy={r.h + 22 - (r.h > 80 ? 0 : 10)}
                    r="4"
                    fill={isActive ? r.color : '#A8A8A5'}
                    className="transition-colors duration-150"
                  />
                </svg>
                <div className={`font-[var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[0.06em] transition-colors duration-150 ${
                  isActive ? 'text-[#1B3FC4]' : 'text-[#A8A8A5]'
                }`}>
                  {r.ratio}
                </div>
                <div className={`text-[11px] font-medium mt-0.5 transition-colors duration-150 ${
                  isActive ? 'text-[#1A1A1A] dark:text-[#E2E0D8]' : 'text-[#A8A8A5]'
                }`}>
                  {r.label}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Info panel */}
      <div className="px-5 py-4 border-t border-[#ECEAE4] dark:border-[#3A3835]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: active.color }} />
          <span className="font-semibold text-sm text-[#1A1A1A] dark:text-[#E2E0D8]">
            {active.ratio} — {active.label}
          </span>
        </div>
        <p className="text-[13px] text-[#3D3D3A] leading-relaxed mb-2 dark:text-[#C8C6C0]">
          {active.feeling}
        </p>
        <div className="text-[12px] text-[#737370] dark:text-[#A8A8A5]">
          <strong className="text-[#1A1A1A] dark:text-[#E2E0D8]">Examples:</strong> {active.examples}
        </div>
      </div>
    </div>
  )
}
