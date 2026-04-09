'use client'

import { cn } from '@/lib/utils'
import { computeBlondelComfort, computePitch } from '../../config/modules/08-vertical/stairway-computation'
import type { UseBoundStore, StoreApi } from 'zustand'
import type { ModuleStoreState } from '../../stores/createModuleStore'

interface ViewportComfortGaugeProps {
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
}

/**
 * Corner-anchored DOM overlay showing Blondel 2R+T comfort value and pitch angle.
 * Viewport Sanctity Rule: max 120x60px, monospace font, semi-transparent bg.
 * Renders as standard React DOM — NOT drei <Html> inside the canvas.
 */
const ViewportComfortGauge = ({ useStore }: ViewportComfortGaugeProps) => {
  const riserHeight = useStore((s) => s.params.riserHeight as number) ?? 185
  const treadDepth = useStore((s) => s.params.treadDepth as number) ?? 250

  const { twoRPlusT, comfortStatus } = computeBlondelComfort(riserHeight, treadDepth)
  const { pitchAngle, pitchStatus } = computePitch(riserHeight, treadDepth)

  const isComfortable = comfortStatus === 'comfortable'
  const statusIcon = isComfortable ? '✓' : '⚠'

  return (
    <div
      className={cn(
        'absolute bottom-3 right-3 z-10',
        'max-w-[120px] rounded-sm px-2 py-1.5',
        'bg-foreground/70 backdrop-blur-sm',
        'font-mono text-[11px] leading-tight',
        'pointer-events-none select-none',
      )}
    >
      {/* Line 1: 2R+T value */}
      <div className={cn('whitespace-nowrap', isComfortable ? 'text-success' : 'text-warning')}>
        2R+T: {Math.round(twoRPlusT)} mm {statusIcon}
      </div>
      {/* Line 2: Pitch angle — hidden on mobile for space */}
      <div className="text-white/80 whitespace-nowrap hidden sm:block">
        Pitch: {pitchAngle.toFixed(1)}° {pitchStatus.charAt(0).toUpperCase() + pitchStatus.slice(1)}
      </div>
    </div>
  )
}

export { ViewportComfortGauge }
export type { ViewportComfortGaugeProps }
