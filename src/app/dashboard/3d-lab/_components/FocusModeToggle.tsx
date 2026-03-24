'use client'

import { Crosshair, GridFour } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'

interface FocusModeToggleProps {
  active: boolean
  onToggle: () => void
  tourComplete: boolean
}

export const FocusModeToggle = ({ active, onToggle, tourComplete }: FocusModeToggleProps) => {
  if (!tourComplete) return null

  return (
    <button
      onClick={onToggle}
      className={`absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[12px] font-medium transition-colors duration-150 ${
        active
          ? 'bg-primary text-white'
          : 'bg-white/90 backdrop-blur-sm border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
      }`}
      title={active ? 'Focus Mode: one dimension at a time' : 'Full View: all dimensions visible'}
    >
      <SCIcon icon={active ? Crosshair : GridFour} size="xs" />
      {active ? 'Focus Mode' : 'Full View'}
    </button>
  )
}
