import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/developer/StatusBadge'
import type { ServiceStatus } from '@/types/developer'

/* ------------------------------------------------------------------ */
/*  StatusKPICard                                                      */
/*  Displays a single KPI metric with eyebrow label, large value,     */
/*  and a StatusBadge at the bottom.                                   */
/* ------------------------------------------------------------------ */

interface StatusKPICardProps {
  label: string
  value: string | number
  unit?: string
  status: ServiceStatus
}

export const StatusKPICard = ({ label, value, unit, status }: StatusKPICardProps) => (
  <Card size="sm" className="flex flex-col gap-2">
    <span className="font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
      {label}
    </span>
    <span className="font-[family-name:var(--font-dm-mono)] text-2xl font-semibold tabular-nums text-foreground">
      {value}
      {unit && (
        <span className="text-sm text-muted-foreground ml-1">{unit}</span>
      )}
    </span>
    <StatusBadge status={status} size="sm" />
  </Card>
)
