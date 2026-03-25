'use client'

import { useState } from 'react'

const FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Time-Gated', value: 'time_gated' },
  { label: 'Subject Mastery', value: 'subject_mastery' },
  { label: 'Code Deep-Dives', value: 'code_deep_dive' },
  { label: 'Remediation', value: 'remediation' },
  { label: 'Exam Simulation', value: 'exam_simulation' },
] as const

type FilterValue = (typeof FILTER_OPTIONS)[number]['value']

interface TrailFilterRowProps {
  onFilterChange: (filter: string) => void
  activeFilter?: string
}

export const TrailFilterRow = ({ onFilterChange, activeFilter = 'all' }: TrailFilterRowProps) => {
  const [selected, setSelected] = useState<FilterValue>(activeFilter as FilterValue)

  const handleClick = (value: FilterValue) => {
    setSelected(value)
    onFilterChange(value)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      {FILTER_OPTIONS.map((option) => {
        const isActive = selected === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleClick(option.value)}
            className={[
              'px-3.5 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all duration-150',
              isActive
                ? 'bg-text-primary text-white border-text-primary'
                : 'bg-white text-text-secondary border-border hover:border-[#B8B4AC] hover:bg-surface-light',
            ].join(' ')}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
