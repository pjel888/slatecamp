'use client'
import { Certificate } from '@phosphor-icons/react'
import { SCIcon } from '../icons/Icon'
import { cn } from '@/lib/utils'

/**
 * ProfessionalPractice — Subject illustration for Professional Practice.
 * Layer 1: Document rectangle + text lines. Layer 2: Certificate icon. Layer 3: Orange stamp circle.
 */
export function ProfessionalPractice({ className }: { className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <svg viewBox="0 0 160 120" className="w-full h-full" aria-hidden="true">
        {/* Layer 1: Ground — document shape */}
        <g filter="url(#grain)">
          <rect x="30" y="15" width="100" height="90" fill="var(--gc-primary)" opacity="0.08" rx="3" />
          {/* Text lines */}
          <line x1="45" y1="35" x2="115" y2="35" stroke="var(--gc-primary)" strokeWidth="2" opacity="0.12" />
          <line x1="45" y1="50" x2="105" y2="50" stroke="var(--gc-primary)" strokeWidth="2" opacity="0.10" />
          <line x1="45" y1="65" x2="95" y2="65" stroke="var(--gc-primary)" strokeWidth="2" opacity="0.08" />
          <line x1="45" y1="80" x2="80" y2="80" stroke="var(--gc-primary)" strokeWidth="2" opacity="0.06" />
        </g>
        {/* Layer 3: Accents — stamp */}
        <circle cx="110" cy="80" r="12" fill="none" stroke="var(--gc-accent)" strokeWidth="2" opacity="0.5" />
        <circle cx="110" cy="80" r="8" fill="var(--gc-accent)" opacity="0.15" />
      </svg>
      {/* Layer 2: Phosphor icon overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <SCIcon icon={Certificate} size="2xl" weight="duotone" color="var(--gc-primary)" />
      </div>
    </div>
  )
}
