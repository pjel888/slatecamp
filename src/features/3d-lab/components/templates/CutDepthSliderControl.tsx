'use client'

import { Slider } from '@/components/ui/slider'
import type { CutawaySectionConfig } from '@/features/3d-lab/types/templates'
import type { createModuleStore } from '@/features/3d-lab/stores/createModuleStore'

interface CutDepthSliderControlProps {
  config: CutawaySectionConfig
  useStore: ReturnType<typeof createModuleStore>
  cutMax: number
}

/**
 * CutDepthSliderControl — Compact cut depth slider for ViewportToolbar extras.
 * Extracted from CutawaySection template.
 */
export const CutDepthSliderControl = ({ useStore, cutMax }: CutDepthSliderControlProps) => {
  const params = useStore((s) => s.params)
  const setParam = useStore((s) => s.setParam)
  const cutPosition = typeof params.cutPosition === 'number' ? params.cutPosition : cutMax

  return (
    <div className="flex items-center gap-1.5 px-1">
      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground shrink-0">
        Cut
      </span>
      <Slider
        value={[cutPosition]}
        min={0}
        max={cutMax}
        step={0.01}
        onValueChange={(v) => {
          const val = Array.isArray(v) ? v[0] : v
          if (typeof val === 'number') setParam('cutPosition', val)
        }}
        className="w-20 cursor-pointer"
      />
      <span className="text-[9px] font-bold text-foreground tabular-nums w-8 text-right">
        {cutPosition.toFixed(1)}m
      </span>
    </div>
  )
}
