import { cn } from '@/lib/utils'

/**
 * FocusRing — Concentric circles composition.
 * Usage: Target/readiness contexts, analytics backgrounds.
 * 3-layer: ground (concentric circles) + accent (dot) + grain.
 */
export function FocusRing({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={cn('w-full h-full', className)}
      aria-hidden="true"
    >
      {/* Layer 1: Ground — concentric rings */}
      <g filter="url(#grain)">
        <circle cx="100" cy="100" r="90" fill="none" stroke="var(--gc-primary)" strokeWidth="1" opacity="0.08" />
        <circle cx="100" cy="100" r="70" fill="none" stroke="var(--gc-primary)" strokeWidth="1" opacity="0.12" />
        <circle cx="100" cy="100" r="50" fill="none" stroke="var(--gc-primary)" strokeWidth="1.5" opacity="0.16" />
        <circle cx="100" cy="100" r="30" fill="var(--gc-primary)" opacity="0.06" />
      </g>
      {/* Layer 3: Accents */}
      <circle cx="100" cy="100" r="6" fill="var(--gc-accent)" opacity="0.6" />
      <circle cx="145" cy="55" r="3" fill="var(--gc-success)" opacity="0.4" />
    </svg>
  )
}
