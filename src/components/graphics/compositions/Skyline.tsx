import { cn } from '@/lib/utils'

/**
 * Skyline — Abstract cityscape composition.
 * Usage: Dashboard hero, general decorative contexts.
 * 3-layer: ground (building rects) + accent (sun circle, dots) + grain.
 */
export function Skyline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 200"
      className={cn('w-full h-full', className)}
      aria-hidden="true"
    >
      {/* Layer 1: Ground — building silhouettes */}
      <g filter="url(#grain)">
        <rect x="20" y="80" width="60" height="120" fill="var(--gc-primary)" opacity="0.12" rx="2" />
        <rect x="90" y="50" width="45" height="150" fill="var(--gc-primary)" opacity="0.18" rx="2" />
        <rect x="145" y="70" width="55" height="130" fill="var(--gc-primary)" opacity="0.10" rx="2" />
        <rect x="210" y="40" width="50" height="160" fill="var(--gc-primary)" opacity="0.15" rx="2" />
        <rect x="270" y="60" width="40" height="140" fill="var(--gc-primary)" opacity="0.08" rx="2" />
        <rect x="320" y="90" width="60" height="110" fill="var(--gc-primary)" opacity="0.12" rx="2" />
      </g>
      {/* Layer 3: Accents */}
      <circle cx="350" cy="35" r="14" fill="var(--gc-accent)" opacity="0.5" />
      <circle cx="55" cy="60" r="4" fill="var(--gc-success)" opacity="0.4" />
      <circle cx="240" cy="25" r="3" fill="var(--gc-accent)" opacity="0.3" />
    </svg>
  )
}
