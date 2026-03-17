'use client'
import { Compass } from '@phosphor-icons/react'
import { SCIcon } from '../icons/Icon'
import { cn } from '@/lib/utils'

/**
 * HistoryOfArchitecture — Subject illustration for Architectural History.
 * Layer 1: Arc (arch) + vertical lines (columns). Layer 2: Compass icon. Layer 3: Orange keystone triangle.
 */
export function HistoryOfArchitecture({ className }: { className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <svg viewBox="0 0 160 120" className="w-full h-full" aria-hidden="true">
        {/* Layer 1: Ground — columns and arch */}
        <g filter="url(#grain)">
          {/* Columns */}
          <rect x="30" y="40" width="10" height="70" fill="var(--gc-primary)" opacity="0.15" rx="1" />
          <rect x="60" y="40" width="10" height="70" fill="var(--gc-primary)" opacity="0.12" rx="1" />
          <rect x="90" y="40" width="10" height="70" fill="var(--gc-primary)" opacity="0.15" rx="1" />
          <rect x="120" y="40" width="10" height="70" fill="var(--gc-primary)" opacity="0.12" rx="1" />
          {/* Arch */}
          <path d="M30 40 Q80 5 130 40" fill="none" stroke="var(--gc-primary)" strokeWidth="2" opacity="0.18" />
        </g>
        {/* Layer 3: Accents — keystone */}
        <polygon points="80,12 74,24 86,24" fill="var(--gc-accent)" opacity="0.6" />
        <circle cx="140" cy="25" r="3" fill="var(--gc-success)" opacity="0.4" />
      </svg>
      {/* Layer 2: Phosphor icon overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <SCIcon icon={Compass} size="2xl" weight="duotone" color="var(--gc-primary)" />
      </div>
    </div>
  )
}
