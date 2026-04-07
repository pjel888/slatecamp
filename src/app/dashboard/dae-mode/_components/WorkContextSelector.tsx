'use client'

import { useState } from 'react'
import type { WorkContext } from '@/lib/actions/dae-mode'

// ─── Context definitions ──────────────────────────────────────────────────────

const WORK_CONTEXTS: Array<{ value: WorkContext; label: string; description: string }> = [
  {
    value: 'building_permit',
    label: 'Building Permit Process',
    description: 'Code compliance, permit applications, plan review',
  },
  {
    value: 'construction_supervision',
    label: 'Construction Supervision',
    description: 'Site visits, construction documents, contractor coordination',
  },
  {
    value: 'design_development',
    label: 'Design Development',
    description: 'Schematic design, design development, material selection',
  },
  {
    value: 'pre_design',
    label: 'Pre-Design / Programming',
    description: 'Client requirements, site analysis, programming documents',
  },
  {
    value: 'government_practice',
    label: 'Government Practice',
    description: 'Public sector projects, government regulations, zoning',
  },
  {
    value: 'contract_administration',
    label: 'Contract Administration',
    description: 'RFIs, submittals, change orders, project closeout',
  },
]

// ─── Props ────────────────────────────────────────────────────────────────────

interface WorkContextSelectorProps {
  initialSelected: WorkContext[]
  onBegin: (contexts: WorkContext[]) => void
  loading: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

const WorkContextSelector = ({
  initialSelected,
  onBegin,
  loading,
}: WorkContextSelectorProps) => {
  const [selected, setSelected] = useState<WorkContext[]>(initialSelected)

  const toggle = (value: WorkContext) => {
    setSelected((prev) => {
      if (prev.includes(value)) {
        return prev.filter((v) => v !== value)
      }
      if (prev.length >= 3) return prev
      return [...prev, value]
    })
  }

  const handleBegin = () => {
    if (selected.length === 0 || loading) return
    onBegin(selected)
  }

  return (
    <div>
      <p className="text-[13px] text-muted-foreground mb-1">
        Select up to 3
      </p>

      <div className="flex flex-col gap-2 mb-6" role="group" aria-label="Work contexts">
        {WORK_CONTEXTS.map(({ value, label, description }) => {
          const isSelected = selected.includes(value)
          const isDisabled = !isSelected && selected.length >= 3

          return (
            <button
              key={value}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              disabled={isDisabled}
              onClick={() => toggle(value)}
              className={[
                'w-full text-left px-4 py-3 rounded-md border transition-colors duration-150 ease-out',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                isSelected
                  ? 'border-primary bg-primary-50'
                  : 'border-border bg-card hover:border-primary/40',
                isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
              ].join(' ')}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox indicator */}
                <span
                  className={[
                    'mt-0.5 flex-shrink-0 w-4 h-4 rounded-sm border flex items-center justify-center transition-colors duration-150',
                    isSelected
                      ? 'bg-primary border-primary'
                      : 'bg-card border-border',
                  ].join(' ')}
                  aria-hidden="true"
                >
                  {isSelected && (
                    <svg
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>

                <div>
                  <p
                    className={[
                      'text-[14px] font-medium leading-snug',
                      isSelected ? 'text-primary' : 'text-foreground',
                    ].join(' ')}
                  >
                    {label}
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">{description}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={handleBegin}
        disabled={selected.length === 0 || loading}
        className={[
          'w-full rounded-sm px-4 py-2.5 text-[14px] font-medium transition-colors duration-150 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
          selected.length === 0 || loading
            ? 'bg-border text-muted-foreground cursor-not-allowed'
            : 'bg-primary text-white hover:bg-primary-700',
        ].join(' ')}
      >
        {loading ? 'Starting session…' : `Start ${selected.length > 0 ? '10' : ''}-Question Session →`}
      </button>
    </div>
  )
}

WorkContextSelector.displayName = 'WorkContextSelector'

export { WorkContextSelector }
