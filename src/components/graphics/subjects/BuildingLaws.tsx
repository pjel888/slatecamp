'use client'
import { FileText } from '@phosphor-icons/react'
import { SCIcon } from '../icons/Icon'
import { cn } from '@/lib/utils'

/**
 * BuildingLaws — Subject illustration for Building Laws & Codes.
 * Layer 1: Grid lines + highlighted cell. Layer 2: FileText icon. Layer 3: Emerald checkmark.
 */
export function BuildingLaws({ className }: { className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <svg viewBox="0 0 160 120" className="w-full h-full" aria-hidden="true">
        {/* Layer 1: Ground — grid/table lines */}
        <g filter="url(#grain)">
          {[20, 50, 80, 110].map((y) => (
            <line key={y} x1="15" y1={y} x2="145" y2={y} stroke="var(--gc-primary)" strokeWidth="0.5" opacity="0.1" />
          ))}
          {[15, 55, 95, 135, 145].map((x) => (
            <line key={x} x1={x} y1="20" x2={x} y2="110" stroke="var(--gc-primary)" strokeWidth="0.5" opacity="0.08" />
          ))}
          {/* Highlighted cell */}
          <rect x="55" y="50" width="40" height="30" fill="var(--gc-primary)" opacity="0.08" rx="1" />
        </g>
        {/* Layer 3: Accents */}
        <circle cx="135" cy="25" r="6" fill="var(--gc-success)" opacity="0.5" />
        <path d="M131 25l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" opacity="0.8" />
      </svg>
      {/* Layer 2: Phosphor icon overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <SCIcon icon={FileText} size="2xl" weight="duotone" color="var(--gc-primary)" />
      </div>
    </div>
  )
}
