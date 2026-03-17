'use client'
import { Ruler } from '@phosphor-icons/react'
import { SCIcon } from '../icons/Icon'
import { cn } from '@/lib/utils'

/**
 * SitePlanning — Subject illustration for Site Planning & Development.
 * Layer 1: Ellipses (contours) + rotated rect (lot). Layer 2: Ruler icon. Layer 3: Emerald north arrow.
 */
export function SitePlanning({ className }: { className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <svg viewBox="0 0 160 120" className="w-full h-full" aria-hidden="true">
        {/* Layer 1: Ground — contour lines */}
        <g filter="url(#grain)">
          <ellipse cx="80" cy="70" rx="65" ry="40" fill="none" stroke="var(--gc-primary)" strokeWidth="0.8" opacity="0.1" />
          <ellipse cx="80" cy="70" rx="50" ry="30" fill="none" stroke="var(--gc-primary)" strokeWidth="0.8" opacity="0.12" />
          <ellipse cx="80" cy="70" rx="35" ry="20" fill="none" stroke="var(--gc-primary)" strokeWidth="0.8" opacity="0.14" />
          {/* Lot rectangle (rotated) */}
          <rect x="60" y="55" width="40" height="30" fill="var(--gc-primary)" opacity="0.08" rx="1" transform="rotate(-12 80 70)" />
        </g>
        {/* Layer 3: Accents — north arrow */}
        <g transform="translate(135, 25)">
          <line x1="0" y1="15" x2="0" y2="-5" stroke="var(--gc-success)" strokeWidth="1.5" opacity="0.6" />
          <polygon points="0,-5 -4,3 4,3" fill="var(--gc-success)" opacity="0.6" />
        </g>
        <circle cx="30" cy="30" r="4" fill="var(--gc-accent)" opacity="0.4" />
      </svg>
      {/* Layer 2: Phosphor icon overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <SCIcon icon={Ruler} size="2xl" weight="duotone" color="var(--gc-primary)" />
      </div>
    </div>
  )
}
