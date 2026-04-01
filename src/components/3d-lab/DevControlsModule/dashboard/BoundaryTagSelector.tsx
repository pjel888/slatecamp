'use client'

import type { BoundaryTag } from '@/types/lot'
import { BOUNDARY_TAG_COLORS } from '@/types/lot'

const TAG_OPTIONS: { value: BoundaryTag; label: string }[] = [
  { value: 'front', label: 'Front' },
  { value: 'rear', label: 'Rear' },
  { value: 'left_side', label: 'Left' },
  { value: 'right_side', label: 'Right' },
]

export function BoundaryTagSelector({ value, onChange }: {
  value: BoundaryTag
  onChange: (tag: BoundaryTag) => void
}) {
  return (
    <div className="flex gap-1">
      {TAG_OPTIONS.map((opt) => {
        const active = value === opt.value
        const color = BOUNDARY_TAG_COLORS[opt.value]
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-sm px-1.5 py-0.5 text-[8px] font-medium uppercase tracking-wider transition-colors duration-150 ${
              active
                ? 'text-white'
                : 'border border-[#D4DAE3] text-[#8896A7] hover:border-current'
            }`}
            style={active ? { backgroundColor: color } : undefined}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
