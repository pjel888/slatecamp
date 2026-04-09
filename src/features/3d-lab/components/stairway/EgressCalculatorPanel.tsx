'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { computeEgressRequirements } from '../../config/modules/08-vertical/stairway-egress'
import type { UseBoundStore, StoreApi } from 'zustand'
import type { ModuleStoreState } from '../../stores/createModuleStore'

interface EgressCalculatorPanelProps {
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
}

const EgressCalculatorPanel = ({ useStore }: EgressCalculatorPanelProps) => {
  const floorArea = useStore((s) => s.params.floorArea as number) ?? 300
  const occupancyType = useStore((s) => s.params.occupancyType as string) ?? 'business'
  const providedExits = useStore((s) => s.params.providedExits as number) ?? 2
  const isSprinklered = useStore((s) => s.params.isSprinklered) === true
  const stairWidth = useStore((s) => s.params.stairWidth as number) ?? 900

  const egress = computeEgressRequirements(floorArea, occupancyType, providedExits, stairWidth, isSprinklered)

  return (
    <Card>
      <CardHeader className="py-2 px-3">
        <span className="text-sm font-medium text-foreground">Egress Calculator</span>
        <p className="text-xs text-muted-foreground">RA 9514 IRR Rule 10 + PD 1096 Rule X</p>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0 space-y-2">
        {/* Occupant Load */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Occupant Load</span>
          <span className="text-sm font-mono font-bold text-foreground">{egress.occupantLoad} persons</span>
        </div>

        {/* Required Exits */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Required Exits</span>
          <Badge
            variant={egress.exitsCompliant ? 'secondary' : 'destructive'}
            className={cn('text-xs', egress.exitsCompliant && 'bg-success/10 text-success')}
          >
            {egress.effectiveRequiredExits} exits
          </Badge>
        </div>

        {/* PD 1096 Override */}
        {egress.pd1096Override && (
          <div className="text-[10px] text-warning bg-warning/10 rounded-sm px-2 py-1">
            PD 1096: Floor area {floorArea} sqm &gt; 500 sqm — minimum 2 exits required
          </div>
        )}

        {/* Stair Qualification */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">This Stair</span>
          <span className={cn('text-xs font-medium', egress.stairCountsAsExit ? 'text-success' : 'text-destructive')}>
            {egress.stairCountsAsExit
              ? `✓ Width ${stairWidth}mm — counts as exit`
              : `✗ Width ${stairWidth}mm < 710mm minimum`}
          </span>
        </div>

        {/* Width Capacity */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Width Per Exit</span>
          <span className="text-xs font-mono text-foreground">
            {Math.round(egress.requiredWidthPerExit)} mm
          </span>
        </div>

        {/* Travel Distance */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Travel Distance Limit</span>
          <span className="text-xs font-mono text-foreground">
            {egress.travelDistanceLimit} m ({isSprinklered ? 'sprinklered' : 'unsprinklered'})
          </span>
        </div>

        <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/50">
          Source: RA 9514 IRR Rule 10 §1004–§1016, PD 1096 Rule X §1004
        </p>
      </CardContent>
    </Card>
  )
}

export { EgressCalculatorPanel }
export type { EgressCalculatorPanelProps }
