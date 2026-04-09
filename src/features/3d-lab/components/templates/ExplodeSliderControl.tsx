'use client'

import { useCallback } from 'react'
import type { createModuleStore } from '@/features/3d-lab/stores/createModuleStore'

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

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setParam('explode', parseFloat(e.target.value))
    },
    [setParam],
  )

  return (
    <div className="flex items-center gap-1.5 px-1">
      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
        Explode
      </span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={explode}
        onChange={handleChange}
        className="w-16 h-1 bg-muted rounded-full appearance-none cursor-pointer accent-camp-cobalt"
      />
      <span className="text-[9px] font-bold text-foreground tabular-nums w-6 text-right">
        {Math.round(explode * 100)}%
      </span>
    </div>
  )
}
