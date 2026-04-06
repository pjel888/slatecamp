'use client'

import { memo } from 'react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { ArrowCounterClockwise } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { useLabStore } from '../_stores/labStore'
import { cn } from '@/lib/utils'

export interface ControlDef {
  key: 'lotArea' | 'far' | 'bhl' | 'setbackFront' | 'setbackSide'
  label: string
  min: number
  max: number
  step: number
  unit: string
  decimalPlaces?: number
}

interface ControlPanelProps {
  controls: ControlDef[]
  title?: string
  className?: string
}

/**
 * Floating 2D overlay panel with sliders that write to the Zustand lab store.
 * Each onChange dispatches to labStore.setParam() which calls invalidate()
 * — no React re-renders inside the Canvas.
 */
export const ControlPanel = memo(function ControlPanel({
  controls,
  title = 'Parameters',
  className,
}: ControlPanelProps) {
  const setParam = useLabStore((s) => s.setParam)
  const resetParametric = useLabStore((s) => s.resetParametric)
  const lotArea = useLabStore((s) => s.lotArea)
  const far = useLabStore((s) => s.far)
  const bhl = useLabStore((s) => s.bhl)
  const setbackFront = useLabStore((s) => s.setbackFront)
  const setbackSide = useLabStore((s) => s.setbackSide)

  const storeValues = { lotArea, far, bhl, setbackFront, setbackSide }

  return (
    <div
      className={cn(
        'absolute bottom-4 left-4 z-10 w-72',
        'bg-white/90 backdrop-blur-sm border border-border rounded-md shadow-lg p-3',
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
          {title}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-sm hover:bg-zinc-100"
          onClick={resetParametric}
          title="Reset to defaults"
        >
          <SCIcon icon={ArrowCounterClockwise} size="xs" className="text-zinc-400" />
        </Button>
      </div>

      <div className="space-y-3">
        {controls.map((ctrl) => {
          const value = storeValues[ctrl.key]
          const displayVal =
            ctrl.decimalPlaces !== undefined
              ? value.toFixed(ctrl.decimalPlaces)
              : value

          return (
            <div key={ctrl.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-zinc-600">
                  {ctrl.label}
                </label>
                <span className="text-[11px] font-bold text-zinc-900 tabular-nums">
                  {displayVal} {ctrl.unit}
                </span>
              </div>
              <Slider
                value={[value]}
                min={ctrl.min}
                max={ctrl.max}
                step={ctrl.step}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v
                  if (typeof val === 'number') setParam(ctrl.key, val)
                }}
                className="cursor-pointer"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
})
