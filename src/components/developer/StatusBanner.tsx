import { Check, Warning, X } from '@phosphor-icons/react/dist/ssr'
import type { ServiceStatus } from '@/types/developer'

/* ------------------------------------------------------------------ */
/*  StatusBanner                                                       */
/*  Full-width banner showing global system status.                    */
/*  Computes worst-case from the provided status array.                */
/* ------------------------------------------------------------------ */

interface StatusBannerProps {
  statuses: Array<{ service: string; status: ServiceStatus }>
  checkedAtLabel?: string
}

const bannerConfig = {
  operational: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    icon: Check,
    message: 'All Systems Operational',
  },
  degraded: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    icon: Warning,
    message: 'Partially Degraded Service',
  },
  outage: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: X,
    message: 'System Outage Detected',
  },
} as const

const computeWorstStatus = (statuses: Array<{ status: ServiceStatus }>): ServiceStatus => {
  if (statuses.some((s) => s.status === 'outage')) return 'outage'
  if (statuses.some((s) => s.status === 'degraded')) return 'degraded'
  return 'operational'
}

export const StatusBanner = ({ statuses, checkedAtLabel = 'just now' }: StatusBannerProps) => {
  const worstStatus = computeWorstStatus(statuses)
  const { bg, border, text, icon: Icon, message } = bannerConfig[worstStatus]

  return (
    <div
      className={`flex items-center justify-between ${bg} ${border} border rounded-md px-4 py-3`}
    >
      <div className={`flex items-center gap-2 ${text}`}>
        <Icon className="w-4 h-4 shrink-0" />
        <span className="text-[13px] font-semibold">{message}</span>
      </div>
      <span className="font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">
        Last checked: {checkedAtLabel}
      </span>
    </div>
  )
}
