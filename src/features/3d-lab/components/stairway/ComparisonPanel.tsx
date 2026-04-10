'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { computeStairState } from '../../config/modules/08-vertical/stairway-computation'
import type { UseBoundStore, StoreApi } from 'zustand'
import type { ModuleStoreState } from '../../stores/createModuleStore'

interface ComparisonPanelProps {
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
}

const ComparisonPanel = ({ useStore }: ComparisonPanelProps) => {
  const params = useStore((s) => s.params)
  const state = computeStairState(params)
  const deltas = state.internationalDeltas
  const activeWidthLaw = state.dimensionStatuses.stairWidth.activeLawKey
  const activeVerticalRiseLaw = state.dimensionStatuses.verticalRise.activeLawKey

  return (
    <Card>
      <CardHeader className="py-2 px-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">International Comparison</span>
          <Badge variant="secondary" className="text-[10px]">
            ⚠️ UNVERIFIED
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Active PH baseline: {formatLaw(activeWidthLaw)} width · {formatLaw(activeVerticalRiseLaw)} vertical rise
        </p>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0">
        <div className="space-y-0.5">
          {/* Header row */}
          <div className="grid grid-cols-5 gap-1 text-[10px] text-muted-foreground font-medium pb-1 border-b border-border/50">
            <span>Dimension</span>
            <span className="text-center">PH</span>
            <span className="text-center">IBC</span>
            <span className="text-center">ADA</span>
            <span className="text-center">IRC</span>
          </div>
          {/* Data rows */}
          {deltas.map((delta) => {
            return (
              <div key={delta.dimension} className="grid grid-cols-5 gap-1 text-[10px] py-0.5">
                <span className="text-muted-foreground truncate">{formatDimName(delta.dimension)}</span>
                <ComparisonCell value={delta.phValue} verified />
                <ComparisonCell value={delta.ibcValue} />
                <ComparisonCell value={delta.adaValue} />
                <ComparisonCell value={delta.ircValue} />
              </div>
            )
          })}
        </div>
        <p className="text-[10px] text-muted-foreground pt-2 border-t border-border/50 mt-2">
          All international values are ⚠️ UNVERIFIED. Require SME review before production use.
        </p>
      </CardContent>
    </Card>
  )
}

const ComparisonCell = ({
  value,
  verified = false,
}: {
  value: number
  verified?: boolean
}) => {
  if (value === 0) return <span className="text-center text-muted-foreground">—</span>
  return (
    <span className={cn('text-center font-mono', verified ? 'text-foreground' : 'text-muted-foreground')}>
      {value}
    </span>
  )
}

const formatLaw = (lawKey: string | null): string => {
  if (lawKey === 'ra9514') return 'RA 9514'
  if (lawKey === 'bp344') return 'BP 344'
  if (lawKey === 'bp220') return 'BP 220'
  return 'PD 1096'
}

const formatDimName = (key: string): string => {
  const map: Record<string, string> = {
    riserHeight: 'Riser',
    treadDepth: 'Tread',
    headroom: 'Headroom',
    handrailHeight: 'Handrail',
    stairWidth: 'Width',
    verticalRise: 'Rise',
  }
  return map[key] ?? key
}

export { ComparisonPanel }
export type { ComparisonPanelProps }
