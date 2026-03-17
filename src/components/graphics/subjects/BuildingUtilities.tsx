'use client'
import { TreeStructure } from '@phosphor-icons/react'
import { SCIcon } from '../icons/Icon'
import { cn } from '@/lib/utils'

/**
 * BuildingUtilities — Subject illustration for MEP/Utilities.
 * Layer 1: Concentric circles (pipe section). Layer 2: TreeStructure icon. Layer 3: Horizontal lines (ducts).
 */
export function BuildingUtilities({ className }: { className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <svg viewBox="0 0 160 120" className="w-full h-full" aria-hidden="true">
        {/* Layer 1: Ground — pipe cross-section */}
        <g filter="url(#grain)">
          <circle cx="60" cy="60" r="40" fill="none" stroke="var(--gc-primary)" strokeWidth="1.5" opacity="0.15" />
          <circle cx="60" cy="60" r="28" fill="none" stroke="var(--gc-primary)" strokeWidth="1" opacity="0.12" />
          <circle cx="60" cy="60" r="16" fill="var(--gc-primary)" opacity="0.08" />
        </g>
        {/* Layer 3: Accents — duct lines */}
        <line x1="110" y1="30" x2="150" y2="30" stroke="var(--gc-primary)" strokeWidth="2" opacity="0.12" />
        <line x1="110" y1="50" x2="145" y2="50" stroke="var(--gc-primary)" strokeWidth="2" opacity="0.10" />
        <line x1="110" y1="70" x2="140" y2="70" stroke="var(--gc-primary)" strokeWidth="2" opacity="0.08" />
        <circle cx="130" cy="100" r="6" fill="var(--gc-accent)" opacity="0.5" />
      </svg>
      {/* Layer 2: Phosphor icon overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <SCIcon icon={TreeStructure} size="2xl" weight="duotone" color="var(--gc-primary)" />
      </div>
    </div>
  )
}
