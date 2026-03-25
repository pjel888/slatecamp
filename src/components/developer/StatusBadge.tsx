import { Check, Warning, X } from '@phosphor-icons/react'
import type { ServiceStatus } from '@/types/developer'

/* ------------------------------------------------------------------ */
/*  StatusBadge                                                        */
/*  Renders status with THREE signals: dot + icon + text label.        */
/*  Color is never the only indicator.                                 */
/* ------------------------------------------------------------------ */

interface StatusBadgeProps {
  status: ServiceStatus
  size?: 'sm' | 'md'
  showIcon?: boolean
}

const config = {
  operational: {
    label: 'Operational',
    dotColor: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    Icon: Check,
  },
  degraded: {
    label: 'Degraded',
    dotColor: 'bg-amber-500',
    textColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    Icon: Warning,
  },
  outage: {
    label: 'Outage',
    dotColor: 'bg-red-500',
    textColor: 'text-red-600',
    bgColor: 'bg-red-50',
    Icon: X,
  },
} as const

const sizeConfig = {
  sm: { text: 'text-[11px]', icon: 'w-3 h-3', dot: 'w-1.5 h-1.5', px: 'px-1.5 py-0.5', gap: 'gap-1' },
  md: { text: 'text-[11px]', icon: 'w-3.5 h-3.5', dot: 'w-2 h-2', px: 'px-2 py-1', gap: 'gap-1.5' },
} as const

export const StatusBadge = ({ status, size = 'md', showIcon = true }: StatusBadgeProps) => {
  const { label, dotColor, textColor, bgColor, Icon } = config[status]
  const s = sizeConfig[size]

  return (
    <span
      className={`inline-flex items-center ${s.gap} ${s.px} ${bgColor} rounded-full ${textColor} ${s.text} font-medium`}
    >
      <span className={`${s.dot} rounded-full ${dotColor} shrink-0`} />
      {showIcon && <Icon className={`${s.icon} shrink-0`} />}
      {label}
    </span>
  )
}
