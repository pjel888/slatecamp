'use client'

import type { createModuleStore } from '@/features/3d-lab/stores/createModuleStore'
import { LabSlider } from '@/features/3d-lab/components/controls/LabSlider'

interface ExplodeSliderControlProps {
  useStore: ReturnType<typeof createModuleStore>
}

/**
 * ExplodeSliderControl — Compact explode slider for the ViewportToolbar.
 * Extracted from ExplodedAssembly template.
 */
export const ExplodeSliderControl = ({ useStore }: ExplodeSliderControlProps) => {
  const explode = useStore((s) => (s.params.explode as number) ?? 0)
  const setParam = useStore((s) => s.setParam)

  return (
    <LabSlider
      label="Explode"
      value={explode}
      min={0}
      max={1}
      step={0.01}
      onChange={(v) => setParam('explode', v)}
      formatValue={(v) => `${Math.round(v * 100)}%`}
      compact
      className="px-1"
    />
  )
}
