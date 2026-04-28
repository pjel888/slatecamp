'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { UseBoundStore, StoreApi } from 'zustand'
import type { ModuleStoreState } from '../../stores/createModuleStore'

interface NosingDetailPanelProps {
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
}

const ADA_NOSING_MAX_PROJECTION = 38  // mm — ADA/ANSI A117.1 ⚠️ UNVERIFIED
const ADA_NOSING_MAX_RADIUS = 13      // mm — ADA/ANSI A117.1 ⚠️ UNVERIFIED
const IBC_CONTRAST_STRIP_MIN = 25     // mm — IBC 504.6 ⚠️ UNVERIFIED
const IBC_CONTRAST_STRIP_MAX = 51     // mm — IBC 504.6 ⚠️ UNVERIFIED

const NosingDetailPanel = ({ useStore }: NosingDetailPanelProps) => {
  const projection = useStore((s) => s.params.nosingProjection as number) ?? 25
  const radius = useStore((s) => s.params.nosingRadius as number) ?? 10
  const undercut = useStore((s) => s.params.riserUndercut as number) ?? 15
  const contrastStrip = useStore((s) => s.params.contrastStripWidth as number) ?? 38

  const projViolation = projection > ADA_NOSING_MAX_PROJECTION
  const radiusViolation = radius > ADA_NOSING_MAX_RADIUS
  const stripViolation = contrastStrip < IBC_CONTRAST_STRIP_MIN || contrastStrip > IBC_CONTRAST_STRIP_MAX

  return (
    <Card>
      <CardHeader className="py-2 px-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Nosing Cross-Section</span>
          <Badge variant="secondary" className="text-[10px]">
            ⚠️ ADA/IBC Reference
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0 space-y-2">
        <DimensionRow
          label="Projection"
          value={projection}
          limit={ADA_NOSING_MAX_PROJECTION}
          unit="mm"
          isViolation={projViolation}
          citation="ADA max 38 mm"
        />
        <DimensionRow
          label="Edge Radius"
          value={radius}
          limit={ADA_NOSING_MAX_RADIUS}
          unit="mm"
          isViolation={radiusViolation}
          citation="ADA max 13 mm"
        />
        <DimensionRow
          label="Riser Undercut"
          value={undercut}
          limit={30}
          unit="°"
          isViolation={undercut > 30}
          citation="Max 30° from vertical"
        />
        <DimensionRow
          label="Contrast Strip"
          value={contrastStrip}
          limit={IBC_CONTRAST_STRIP_MAX}
          unit="mm"
          isViolation={stripViolation}
          citation={`IBC 504.6: ${IBC_CONTRAST_STRIP_MIN}–${IBC_CONTRAST_STRIP_MAX} mm`}
        />
        <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/50">
          Philippine codes (PD 1096, BP 344) do not specify nosing profiles.
          Values shown are ADA/IBC reference only. ⚠️ UNVERIFIED
        </p>
      </CardContent>
    </Card>
  )
}

const DimensionRow = ({
  label,
  value,
  limit: _limit,
  unit,
  isViolation,
  citation,
}: {
  label: string
  value: number
  limit: number
  unit: string
  isViolation: boolean
  citation: string
}) => (
  <div className="flex items-center justify-between text-xs">
    <span className="text-muted-foreground">{label}</span>
    <div className="flex items-center gap-1.5">
      <span className={cn('font-mono', isViolation ? 'text-destructive font-medium' : 'text-foreground')}>
        {value} {unit}
      </span>
      <span className="text-[10px] text-muted-foreground">
        ({citation})
      </span>
      <span>{isViolation ? '✗' : '✓'}</span>
    </div>
  </div>
)

export { NosingDetailPanel }
export type { NosingDetailPanelProps }
