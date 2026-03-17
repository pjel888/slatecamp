'use client'
import { Buildings } from '@phosphor-icons/react'
import { SCIcon } from '../icons/Icon'
import { cn } from '@/lib/utils'

/**
 * StructuralSystems — Subject illustration for Structural Engineering.
 * Layer 1: Building rectangles. Layer 2: Buildings icon. Layer 3: Orange sun dot.
 */
export function StructuralSystems({ className }: { className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <svg viewBox="0 0 160 120" className="w-full h-full" aria-hidden="true">
        <defs>
          <linearGradient id="ss-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--gc-primary)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--gc-primary)" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        {/* Layer 1: Ground shapes */}
        <g filter="url(#grain)">
          <rect x="15" y="40" width="50" height="70" fill="var(--gc-primary)" opacity="0.15" rx="2" />
          <rect x="75" y="20" width="60" height="90" fill="url(#ss-grad)" rx="2" />
        </g>
        {/* Layer 3: Accent dots */}
        <circle cx="130" cy="30" r="8" fill="var(--gc-accent)" opacity="0.6" />
        <circle cx="25" cy="30" r="4" fill="var(--gc-success)" opacity="0.4" />
        {/* Window cutouts */}
        <rect x="25" y="55" width="12" height="10" rx="1" fill="var(--gc-cutout)" opacity="0.6" />
        <rect x="25" y="75" width="12" height="10" rx="1" fill="var(--gc-cutout)" opacity="0.6" />
        <rect x="88" y="35" width="10" height="10" rx="1" fill="var(--gc-accent)" opacity="0.2" />
        <rect x="105" y="35" width="10" height="10" rx="1" fill="var(--gc-cutout)" opacity="0.5" />
      </svg>
      {/* Layer 2: Phosphor icon overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <SCIcon icon={Buildings} size="2xl" weight="duotone" color="var(--gc-primary)" />
      </div>
    </div>
  )
}
