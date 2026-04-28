'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { STAIR_MATERIALS, getMaterialById } from '../../config/modules/08-vertical/stairway-materials'
import type { UseBoundStore, StoreApi } from 'zustand'
import type { ModuleStoreState } from '../../stores/createModuleStore'

interface MaterialSelectorPanelProps {
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
}

const statusColors: Record<string, string> = {
  safe: 'text-success',
  caution: 'text-warning',
  danger: 'text-destructive',
}

const statusLabels: Record<string, string> = {
  safe: 'Safe',
  caution: 'Caution',
  danger: 'Danger',
}

const MaterialSelectorPanel = ({ useStore }: MaterialSelectorPanelProps) => {
  const materialId = useStore((s) => s.params.treadMaterial as string) ?? 'concrete'
  const material = getMaterialById(materialId) ?? STAIR_MATERIALS[3] // default concrete

  return (
    <Card>
      <CardHeader className="py-2 px-3">
        <span className="text-sm font-medium text-foreground">Tread Material</span>
        <p className="text-xs text-muted-foreground">{material.label}</p>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0 space-y-2">
        {/* Material swatch */}
        <div className="flex items-center gap-2">
          <div
            className="h-6 w-6 rounded-sm border border-border"
            style={{ backgroundColor: material.baseColor }}
            aria-label={`${material.label} color swatch`}
          />
          <div className="text-xs text-muted-foreground">
            Roughness: {material.roughness} · Metalness: {material.metalness}
          </div>
        </div>

        {/* Slip resistance */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Dry (CoF {material.dryCoF})</span>
            <span className={cn('font-medium', statusColors[material.slipDryStatus])}>
              {statusLabels[material.slipDryStatus]}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Wet (CoF {material.wetCoF})</span>
            <span className={cn('font-medium', statusColors[material.slipWetStatus])}>
              {statusLabels[material.slipWetStatus]}
            </span>
          </div>
        </div>

        {material.slipWetStatus === 'danger' && (
          <div className="text-[10px] text-destructive bg-destructive/10 rounded-sm px-2 py-1">
            Not recommended for wet areas or exterior stairs
          </div>
        )}

        <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/50">
          Slip resistance per ASTM F1679 / OSHA. PD 1096 does not specify material slip resistance.
        </p>
      </CardContent>
    </Card>
  )
}

export { MaterialSelectorPanel }
export type { MaterialSelectorPanelProps }
