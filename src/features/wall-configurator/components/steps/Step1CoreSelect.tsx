'use client'

import { useWallConfigStore } from '../../store/useWallConfigStore'
import type { CoreType } from '../../types/wall.types'

interface CoreOption {
  value: CoreType
  label: string
  title: string
  sequence: string[]
}

const CORE_OPTIONS: CoreOption[] = [
  {
    value: 'chb',
    label: 'Core Type',
    title: 'CHB (Masonry)',
    sequence: ['CHB core', 'Plaster', 'Skim (opt.)', 'Primer', 'Paint'],
  },
  {
    value: 'drywall',
    label: 'Core Type',
    title: 'Drywall',
    sequence: ['Board', 'Tape', 'Compound', 'Primer', 'Paint'],
  },
  {
    value: 'plywood',
    label: 'Core Type',
    title: 'Plywood Partition',
    sequence: ['Plywood', 'Wood frame', 'Primer', 'Paint'],
  },
  {
    value: 'cement-board',
    label: 'Core Type',
    title: 'Cement Board',
    sequence: ['Board', 'Tape', 'Compound', 'Skim (opt.)', 'Primer', 'Paint'],
  },
  {
    value: 'brick',
    label: 'Core Type',
    title: 'Brick Masonry',
    sequence: ['Brick', 'Plaster', 'Skim (opt.)', 'Primer', 'Paint'],
  },
  {
    value: 'solid-concrete',
    label: 'Core Type',
    title: 'Solid Concrete',
    sequence: ['Roughening', 'Plaster', 'Skim', 'Primer', 'Paint'],
  },
  {
    value: 'existing-wall',
    label: 'Core Type',
    title: 'Existing Wall (Repaint)',
    sequence: ['Skim (opt.)', 'Primer', 'Paint'],
  },
]

export function Step1CoreSelect() {
  const coreType = useWallConfigStore((s) => s.config.coreType)
  const setCoreType = useWallConfigStore((s) => s.setCoreType)
  const nextStep = useWallConfigStore((s) => s.nextStep)

  function handleSelect(value: CoreType) {
    setCoreType(value)
  }

  function handleNext() {
    if (coreType) {
      nextStep()
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {CORE_OPTIONS.map((option) => {
          const isSelected = coreType === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={[
                'cursor-pointer rounded-md p-3 text-left transition-colors duration-150 ease-out',
                isSelected
                  ? 'border-l-[3px] border-l-[#1B3FC4] bg-[#EEF2FC]'
                  : 'border border-border hover:border-primary',
              ].join(' ')}
            >
              <p className="font-mono text-[8px] font-medium uppercase tracking-[0.12em] text-[#8896A7]">
                {option.label}
              </p>
              <p
                className={[
                  'mt-1 text-[13px] font-semibold',
                  isSelected ? 'text-[#1B3FC4]' : 'text-[#1A2332]',
                ].join(' ')}
              >
                {option.title}
              </p>
              <ol className="mt-2 flex flex-col gap-1">
                {option.sequence.map((step, i) => (
                  <li key={step} className="flex items-start gap-1.5 text-[12px] text-[#4A5568]">
                    <span className="font-mono text-[9px] text-[#1B3FC4] shrink-0 mt-px">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </button>
          )
        })}
      </div>

      <div className="flex justify-end border-t border-border pt-4">
        <button
          type="button"
          onClick={handleNext}
          disabled={!coreType}
          className="rounded-sm bg-[#1B3FC4] px-4 py-2 text-[13px] font-medium text-white transition-colors duration-150 ease-out hover:bg-[#1535A8] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
