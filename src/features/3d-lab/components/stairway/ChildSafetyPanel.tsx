'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  ADA_CHILDREN_HANDRAIL_MAX_HEIGHT_MM,
  ADA_CHILDREN_MIN_CLEARANCE_MM,
  IBC_GUARD_MAX_SPACING_MM,
  IBC_RISER_MAX_OPENING_MM,
} from '../../config/modules/08-vertical/stairway-constants'
import type { UseBoundStore, StoreApi } from 'zustand'
import type { ModuleStoreState } from '../../stores/createModuleStore'

interface ChildSafetyPanelProps {
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
}

const ChildSafetyPanel = ({ useStore }: ChildSafetyPanelProps) => {
  const primaryUsers = useStore((s) => s.params.primaryUsers as string) ?? 'general'
  const handrailHeight = useStore((s) => s.params.handrailHeight as number) ?? 900

  const isChildMode = primaryUsers === 'children' || primaryUsers === 'mixed'
  if (!isChildMode) return null

  const secondaryHeight = ADA_CHILDREN_HANDRAIL_MAX_HEIGHT_MM
  const clearance = handrailHeight - secondaryHeight
  const clearanceOk = clearance >= ADA_CHILDREN_MIN_CLEARANCE_MM

  return (
    <Card>
      <CardHeader className="py-2 px-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Children&apos;s Safety</span>
          <Badge variant="secondary" className="text-[10px]">⚠️ ADA/IBC Reference</Badge>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0 space-y-2">
        <CheckRow
          label="Secondary Handrail"
          value={`${secondaryHeight} mm`}
          isPass
          citation={`ADA §504 max ${ADA_CHILDREN_HANDRAIL_MAX_HEIGHT_MM} mm`}
        />
        <CheckRow
          label="Rail Clearance"
          value={`${clearance} mm`}
          isPass={clearanceOk}
          citation={`ADA min ${ADA_CHILDREN_MIN_CLEARANCE_MM} mm`}
        />
        <CheckRow
          label="Guard Spacing"
          value={`≤ ${IBC_GUARD_MAX_SPACING_MM} mm`}
          isPass
          citation={`IBC §1013.2 (4" sphere rule)`}
        />
        <CheckRow
          label="Riser Openings"
          value="Solid risers"
          isPass
          citation={`IBC §1011.3 max ${IBC_RISER_MAX_OPENING_MM} mm opening`}
        />
        <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/50">
          Philippine codes do not specify children&apos;s handrail requirements. Values shown are ADA/IBC reference. ⚠️ UNVERIFIED
        </p>
      </CardContent>
    </Card>
  )
}

const CheckRow = ({
  label,
  value,
  isPass,
  citation,
}: {
  label: string
  value: string
  isPass: boolean
  citation: string
}) => (
  <div className="flex items-center justify-between text-xs">
    <span className="text-muted-foreground">{label}</span>
    <div className="flex items-center gap-1.5">
      <span className={cn('font-mono', isPass ? 'text-foreground' : 'text-destructive font-medium')}>
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground">({citation})</span>
      <span>{isPass ? '✓' : '✗'}</span>
    </div>
  </div>
)

export { ChildSafetyPanel }
export type { ChildSafetyPanelProps }
