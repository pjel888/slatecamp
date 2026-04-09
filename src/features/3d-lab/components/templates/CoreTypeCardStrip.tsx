'use client'

import { WALL_CORE_REGISTRY } from '@/features/3d-lab/config/modules/10-materials/wall-core-registry'
import type { CoreType } from '@/features/3d-lab/config/modules/10-materials/wall-types'
import { CoreTypeCard } from './CoreTypeCard'

const CORE_TYPE_ORDER: CoreType[] = [
  'chb', 'drywall', 'plywood', 'cement-board', 'brick', 'solid-concrete', 'existing-wall',
]

interface CoreTypeCardStripProps {
  activeCoreType: CoreType
  onSelect: (type: CoreType) => void
}

export const CoreTypeCardStrip = ({ activeCoreType, onSelect }: CoreTypeCardStripProps) => {
  return (
    <div className="space-y-1.5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Wall Type
      </h3>
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {CORE_TYPE_ORDER.map((type) => (
          <CoreTypeCard
            key={type}
            coreType={type}
            entry={WALL_CORE_REGISTRY[type]}
            isActive={type === activeCoreType}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}
