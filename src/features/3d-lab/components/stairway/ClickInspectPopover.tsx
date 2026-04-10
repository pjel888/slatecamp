'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { matchClickTarget } from '../../config/modules/08-vertical/stairway-click-targets'
import { computeStairState } from '../../config/modules/08-vertical/stairway-computation'
import { LAW_COLORS } from '../../config/modules/08-vertical/stairway-constants'
import type { UseBoundStore, StoreApi } from 'zustand'
import type { ModuleStoreState } from '../../stores/createModuleStore'
import type { StairDimensionKey } from '../../config/modules/08-vertical/stairway-types'

interface ClickInspectPopoverProps {
  elementId: string
  screenPosition: { x: number; y: number }
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
  onClose: () => void
}

const LAW_LABELS: Record<string, { name: string; color: string }> = {
  pd1096: { name: 'PD 1096', color: LAW_COLORS.PD_1096 },
  bp220: { name: 'BP 220', color: LAW_COLORS.BP_220 },
  bp344: { name: 'BP 344', color: LAW_COLORS.BP_344 },
  ra9514: { name: 'RA 9514', color: LAW_COLORS.RA_9514 },
}

const getCurrentValue = (
  dimensionKey: string,
  state: ReturnType<typeof computeStairState>,
  params: ModuleStoreState['params'],
): number => {
  if (dimensionKey === 'verticalRise') {
    return state.actualTotalRise
  }

  const computedValue = state[dimensionKey as keyof typeof state]
  if (typeof computedValue === 'number') {
    return computedValue
  }

  const rawValue = params[dimensionKey]
  if (typeof rawValue === 'number') {
    return rawValue
  }
  if (typeof rawValue === 'string') {
    return Number(rawValue)
  }

  return 0
}

const ClickInspectPopover = ({ elementId, screenPosition, useStore, onClose }: ClickInspectPopoverProps) => {
  const params = useStore((s) => s.params)
  const target = matchClickTarget(elementId)

  if (!target) return null

  const state = computeStairState(params)
  const currentValue = getCurrentValue(target.dimensionKey, state, params)
  const dimensionStatus = target.dimensionKey in state.dimensionStatuses
    ? state.dimensionStatuses[target.dimensionKey as StairDimensionKey]
    : undefined

  // Clamp position to viewport
  const left = Math.min(screenPosition.x, window.innerWidth - 280)
  const top = Math.min(screenPosition.y, window.innerHeight - 200)

  return (
    <>
      {/* Backdrop to dismiss */}
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />

      <Card
        className="fixed z-50 w-64 shadow-lg"
        style={{ left: `${left}px`, top: `${top}px` }}
      >
        <CardHeader className="py-2 px-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{target.elementName}</span>
            <Badge variant="secondary" className="text-xs font-mono">
              {Math.round(currentValue)} {target.unit}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{target.description}</p>
        </CardHeader>

        {dimensionStatus && (
          <CardContent className="px-3 pb-2 pt-0 space-y-1">
            {Object.entries(LAW_LABELS).map(([key, law]) => {
              const lawEval = dimensionStatus.laws.find((entry) => entry.lawKey === key)
              if (!lawEval || !lawEval.applies) return null

              return (
                <div
                  key={key}
                  className={cn(
                    'flex items-center gap-1.5 text-xs',
                    lawEval.passes ? 'text-muted-foreground' : 'text-foreground font-medium',
                  )}
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: law.color }}
                    aria-hidden="true"
                  />
                  <span className="flex-1">{law.name}: {lawEval.limit} {target.unit}</span>
                  <span>{lawEval.passes ? '✓' : '✗'}</span>
                </div>
              )
            })}
          </CardContent>
        )}
      </Card>
    </>
  )
}

export { ClickInspectPopover }
export type { ClickInspectPopoverProps }
