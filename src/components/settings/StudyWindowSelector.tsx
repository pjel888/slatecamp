'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { saveStudyWindow } from '@/lib/actions/profile'

export type StudyWindow = 'morning' | 'evening' | 'both' | 'any'

const OPTIONS: { value: StudyWindow; label: string; description: string }[] = [
  { value: 'morning', label: 'Morning', description: 'Before noon' },
  { value: 'evening', label: 'Evening', description: 'After 5pm' },
  { value: 'both', label: 'Both', description: 'Morning and evening' },
  { value: 'any', label: 'No preference', description: '' },
]

interface StudyWindowSelectorProps {
  initialValue?: StudyWindow
  compact?: boolean
  mode?: 'save' | 'controlled'
  value?: StudyWindow
  onChange?: (value: StudyWindow) => void
}

export const StudyWindowSelector = ({
  initialValue = 'any',
  compact = false,
  mode = 'save',
  value,
  onChange,
}: StudyWindowSelectorProps) => {
  const isControlled = mode === 'controlled'
  const [selected, setSelected] = useState<StudyWindow>(value ?? initialValue)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (isControlled && value) {
      setSelected(value)
    }
  }, [isControlled, value])

  const handleSelect = async (nextValue: StudyWindow) => {
    setSelected(nextValue)

    if (isControlled) {
      onChange?.(nextValue)
      return
    }

    setSaved(false)
    setIsSaving(true)
    try {
      await saveStudyWindow(nextValue)
      setSaved(true)
    } catch {
      // Silent fail keeps settings responsive; completion is handled elsewhere.
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={cn('space-y-3', compact ? '' : 'rounded-md border border-border bg-white p-5')}>
      {!compact && (
        <div>
          <h3 className="text-sm font-bold text-text-primary">When do you usually study?</h3>
          <p className="mt-0.5 text-[13px] text-text-secondary">
            We&apos;ll optimize your trail step ordering based on learning science.
          </p>
        </div>
      )}
      <div className="space-y-1.5">
        {OPTIONS.map(({ value: optionValue, label, description }) => (
          <button
            key={optionValue}
            type="button"
            onClick={() => void handleSelect(optionValue)}
            disabled={!isControlled && isSaving}
            aria-pressed={selected === optionValue}
            className={cn(
              'w-full rounded-md border px-4 py-3 text-left transition-colors',
              'flex items-center justify-between',
              selected === optionValue
                ? 'border-camp-cobalt bg-primary-50'
                : 'border-border hover:border-camp-cobalt/50 hover:bg-primary-50/30',
              !isControlled && isSaving && 'cursor-not-allowed opacity-70',
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded-full border-2',
                  selected === optionValue ? 'border-camp-cobalt' : 'border-border',
                )}
              >
                {selected === optionValue && <div className="h-2 w-2 rounded-full bg-camp-cobalt" />}
              </div>
              <span className="text-sm font-medium text-text-primary">{label}</span>
            </div>
            {description && <span className="text-xs text-text-tertiary">{description}</span>}
          </button>
        ))}
      </div>
      {!isControlled && saved && <p className="text-xs font-medium text-emerald">Saved</p>}
    </div>
  )
}
