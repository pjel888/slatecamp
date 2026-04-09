'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { UseBoundStore, StoreApi } from 'zustand'
import type { ModuleStoreState } from '../../stores/createModuleStore'

interface EvacuationControlsProps {
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
}

const EvacuationControls = ({ useStore }: EvacuationControlsProps) => {
  const isActive = useStore((s) => s.params.evacuationActive) === true
  const occupantLoad = useStore((s) => s.params.floorArea as number) ?? 300
  const stairWidth = useStore((s) => s.params.stairWidth as number) ?? 900

  if (!isActive) return null

  // Rough flow rate: wider stairs = faster evacuation
  const widthM = stairWidth / 1000
  const flowRate = widthM * 1.3 // ~1.3 persons/meter/second (Fruin estimate)
  const estimatedSeconds = Math.ceil(occupantLoad / flowRate)
  const isBottleneck = stairWidth < 900

  return (
    <Card className="border-warning/30 bg-warning/5">
      <CardHeader className="py-2 px-3">
        <span className="text-sm font-medium text-foreground">Evacuation Simulation Active</span>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Est. Evacuation Time</span>
          <span className="font-mono text-foreground">~{estimatedSeconds}s</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Flow Rate</span>
          <span className="font-mono text-foreground">{flowRate.toFixed(1)} persons/s</span>
        </div>
        {isBottleneck && (
          <div className="text-[10px] text-destructive bg-destructive/10 rounded-sm px-2 py-1">
            Bottleneck: Stair width {stairWidth}mm &lt; 900mm — flow restricted
          </div>
        )}
        <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/50">
          Based on Fruin pedestrian flow model. Cocoanut Grove fire (1942) drove modern exit width requirements.
        </p>
      </CardContent>
    </Card>
  )
}

export { EvacuationControls }
export type { EvacuationControlsProps }
