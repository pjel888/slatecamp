'use client'

import { Sparkle, Lightning, Crown, ShieldCheck, type Icon as PhosphorIcon } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import type { UserTier } from '@/types/app'

const TIER_CONFIG: Record<
  UserTier,
  { label: string; icon: PhosphorIcon; className: string }
> = {
  free: {
    label: 'Free',
    icon: Sparkle,
    className: 'bg-zinc-100 text-zinc-500 border-zinc-200',
  },
  camp: {
    label: 'Camp',
    icon: Lightning,
    className: 'bg-[#F0F5FA] text-primary border-primary/20',
  },
  insurance: {
    label: 'Insurance',
    icon: ShieldCheck,
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
  const IconComponent = config.icon
  const isSm = size === 'sm'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm border font-medium ${config.className} ${
        isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-[11px]'
      } ${className ?? ''}`}
    >
      {showIcon && (
        <SCIcon
          icon={IconComponent}
          size='xs'
        />
      )}
      {config.label}
      {isDevMode && '*'}
    </span>
  )
}
