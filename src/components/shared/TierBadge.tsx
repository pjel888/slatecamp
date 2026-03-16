'use client'

import { Sparkles, Zap, Crown, Shield } from 'lucide-react'
import type { UserTier } from '@/types/app'

const TIER_CONFIG: Record<
  UserTier,
  { label: string; icon: React.ElementType; className: string }
> = {
  free: {
    label: 'Free',
    icon: Sparkles,
    className: 'bg-zinc-100 text-zinc-500 border-zinc-200',
  },
  camp: {
    label: 'Camp',
    icon: Zap,
    className: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  insurance: {
    label: 'Insurance',
    icon: Shield,
    className: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  institutional: {
    label: 'Institutional',
    icon: Crown,
    className: 'bg-amber-50 text-amber-600 border-amber-100',
  },
}

/** @deprecated Use `UserTier` with `devMode` prop instead. */
export type DisplayTier = UserTier | 'dev'

interface TierBadgeProps {
  tier: DisplayTier
  /** When true, appends an asterisk to indicate dev/simulated mode. */
  devMode?: boolean
  size?: 'sm' | 'default'
  showIcon?: boolean
  className?: string
}

export function TierBadge({
  tier,
  devMode = false,
  size = 'default',
  showIcon = true,
  className,
}: TierBadgeProps) {
  // If legacy "dev" value is passed, treat as "institutional" in dev mode
  const resolvedTier: UserTier = tier === 'dev' ? 'institutional' : tier
  const isDevMode = devMode || tier === 'dev'

  // Guard against undefined tier or DB values not in TIER_CONFIG (e.g. subscription_tier 'pro'/'enterprise')
  const config = TIER_CONFIG[resolvedTier] ?? TIER_CONFIG.free
  const IconComponent = config.icon as React.ComponentType<any>
  const isSm = size === 'sm'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm border font-medium ${config.className} ${
        isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'
      } ${className ?? ''}`}
    >
      {showIcon && (
        <IconComponent
          className={isSm ? 'h-3 w-3' : 'h-3.5 w-3.5'}
          strokeWidth={1.5}
        />
      )}
      {config.label}
      {isDevMode && '*'}
    </span>
  )
}
