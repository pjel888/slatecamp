'use client'

import type { WallViewMode } from '@/features/3d-lab/config/modules/10-materials/wall-types'

interface ViewModeButtonStripProps {
  activeMode: WallViewMode
  onModeChange: (mode: WallViewMode) => void
}

const VIEW_MODES: Array<{ value: WallViewMode; label: string }> = [
  { value: 'overview', label: 'Overview' },
  { value: 'section-cut', label: 'Section Cut' },
  { value: 'exploded', label: 'Exploded' },
  { value: 'build-sequence', label: 'Build' },
]

export const ViewModeButtonStrip = ({ activeMode, onModeChange }: ViewModeButtonStripProps) => {
  return (
    <div className="flex gap-1">
      {VIEW_MODES.map((mode) => (
        <button
          key={mode.value}
          type="button"
          onClick={() => onModeChange(mode.value)}
          className={`
            rounded-sm px-2.5 py-1 text-xs font-medium transition-colors duration-150 ease-out
            ${activeMode === mode.value
              ? 'bg-primary text-white'
              : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }
          `}
        >
          {mode.label}
        </button>
      ))}
    </div>
  )
}
