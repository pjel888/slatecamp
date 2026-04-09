'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { UseBoundStore, StoreApi } from 'zustand'
import type { ModuleStoreState } from '../../stores/createModuleStore'

interface HandrailDetailPanelProps {
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
}

const ADA_GRIP_MIN_MM = 32    // ADA/ANSI A117.1 §505 ⚠️ UNVERIFIED
const ADA_GRIP_MAX_MM = 38    // ADA/ANSI A117.1 §505 ⚠️ UNVERIFIED
const ADA_CLEARANCE_MIN_MM = 38 // ADA/ANSI A117.1 §505 ⚠️ UNVERIFIED

const HandrailDetailPanel = ({ useStore }: HandrailDetailPanelProps) => {
  const diameter = useStore((s) => s.params.handrailDiameter as number) ?? 35
  const clearance = useStore((s) => s.params.wallClearance as number) ?? 45
  const profile = useStore((s) => s.params.handrailProfile as string) ?? 'circular'

  const diameterViolation = diameter < ADA_GRIP_MIN_MM || diameter > ADA_GRIP_MAX_MM
  const clearanceViolation = clearance < ADA_CLEARANCE_MIN_MM

  const gripAssessment = diameterViolation
    ? diameter < ADA_GRIP_MIN_MM ? 'Too thin — weak grip' : 'Too thick — reduced grip'
    : 'Good power grip'

  return (
    <Card>
      <CardHeader className="py-2 px-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Handrail Cross-Section</span>
          <Badge variant="secondary" className="text-[10px]">
            ⚠️ ADA Reference
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0 space-y-2">
        <DetailRow
          label="Grip Diameter"
          value={diameter}
          unit="mm"
          isViolation={diameterViolation}
          citation={`ADA: ${ADA_GRIP_MIN_MM}–${ADA_GRIP_MAX_MM} mm`}
        />
        <DetailRow
          label="Wall Clearance"
          value={clearance}
          unit="mm"
          isViolation={clearanceViolation}
          citation={`ADA min ${ADA_CLEARANCE_MIN_MM} mm`}
        />
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Profile Shape</span>
          <span className="text-foreground capitalize">{profile.replace('-', ' ')}</span>
        </div>
        <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
          <span className="text-muted-foreground">Graspability</span>
          <span className={cn('font-medium', diameterViolation ? 'text-destructive' : 'text-success')}>
            {gripAssessment}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/50">
          Philippine codes (PD 1096, BP 344) do not specify handrail cross-section profiles.
          Values shown are ADA reference only. ⚠️ UNVERIFIED
        </p>
      </CardContent>
    </Card>
  )
}

const DetailRow = ({
  label,
  value,
  unit,
  isViolation,
  citation,
}: {
  label: string
  value: number
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
      <span className="text-[10px] text-muted-foreground">({citation})</span>
      <span>{isViolation ? '✗' : '✓'}</span>
    </div>
  </div>
)

export { HandrailDetailPanel }
export type { HandrailDetailPanelProps }
