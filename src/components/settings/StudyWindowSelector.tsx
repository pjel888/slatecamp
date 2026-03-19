'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { saveStudyWindow, type StudyWindow } from '@/lib/actions/profile'

const OPTIONS: { value: StudyWindow; label: string; description: string }[] = [
  { value: 'morning', label: 'Morning', description: 'Before noon' },
  { value: 'evening', label: 'Evening', description: 'After 5pm' },
  { value: 'both', label: 'Both', description: 'Morning and evening' },
  { value: 'any', label: 'No preference', description: '' },
]

interface StudyWindowSelectorProps {
  initialValue?: StudyWindow
  /** Compact mode for embedding in onboarding */
  compact?: boolean
}

export const StudyWindowSelector = ({
  initialValue = 'any',
  compact = false,
}: StudyWindowSelectorProps) => {
  const [selected, setSelected] = useState<StudyWindow>(initialValue)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSelect = async (value: StudyWindow) => {
    setSelected(value)
    setSaved(false)
    setIsSaving(true)
    try {
      await saveStudyWindow(value)
      setSaved(true)
    } catch {
      // Silent fail
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={cn('space-y-3', compact ? '' : 'p-5 bg-white border border-[#D4DAE3] rounded-md')}>
      {!compact && (
        <div>
          <h3 className="text-sm font-bold text-[#1A2332]">When do you usually study?</h3>
          <p className="text-[13px] text-[#4A5568] mt-0.5">
            We&apos;ll optimize your trail step ordering based on learning science.
          </p>
        </div>
      )}
      <div className="space-y-1.5">
        {OPTIONS.map(({ value, label, description }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleSelect(value)}
            className={cn(
              'w-full flex items-center justify-between rounded-md border px-4 py-3 transition-colors text-left',
              selected === value
                ? 'border-[#1B3FC4] bg-[#EEF2FC]'
                : 'border-[#D4DAE3] hover:border-[#1B3FC4]/50 hover:bg-[#EEF2FC]/30',
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                  selected === value ? 'border-[#1B3FC4]' : 'border-[#D4DAE3]',
                )}
              >
                {selected === value && (
                  <div className="w-2 h-2 rounded-full bg-[#1B3FC4]" />
                )}
              </div>
              <span className="text-sm font-medium text-[#1A2332]">{label}</span>
            </div>
            {description && (
              <span className="text-xs text-[#8896A7]">{description}</span>
            )}
          </button>
        ))}
      </div>
      {saved && (
        <p className="text-xs text-[#2D9F6F] font-medium">Saved</p>
      )}
    </div>
  )
}
