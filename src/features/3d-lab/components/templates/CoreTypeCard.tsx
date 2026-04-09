'use client'

import type { CoreType, CoreTypeRegistryEntry } from '@/features/3d-lab/config/modules/10-materials/wall-types'

interface CoreTypeCardProps {
  coreType: CoreType
  entry: CoreTypeRegistryEntry
  isActive: boolean
  onSelect: (type: CoreType) => void
}

export const CoreTypeCard = ({ coreType, entry, isActive, onSelect }: CoreTypeCardProps) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(coreType)}
      className={`
        flex flex-col items-center gap-1 rounded-sm border p-2 text-center
        min-w-[72px] transition-all duration-150 ease-out cursor-pointer
        ${isActive
          ? 'border-primary bg-primary-50 shadow-sm'
          : 'border-border bg-card hover:border-primary/40 hover:shadow-sm'
        }
      `}
    >
      {/* Color swatch representing the material */}
      <div
        className="h-6 w-10 rounded-xs border border-border/50"
        style={{ backgroundColor: entry.color }}
      />
      <span className="text-[10px] font-medium leading-tight text-foreground">
        {entry.label.split(' ')[0]}
      </span>
      <span className="text-[8px] text-muted-foreground">
        {Math.round(entry.thickness * 1000)}mm
      </span>
      {entry.baseCostPerSqm > 0 && (
        <span className="text-[8px] text-muted-foreground">
          ₱{(entry.baseCostPerSqm / 1000).toFixed(1)}k
        </span>
      )}
    </button>
  )
}
