import { cn } from '@/lib/utils'

/**
 * BlueprintGrid — Technical grid composition.
 * Usage: 3D lab, structural content, wiki backgrounds.
 * 3-layer: ground (grid lines) + accent (highlighted cells) + grain.
 */
export function BlueprintGrid({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 200"
      className={cn('w-full h-full', className)}
      aria-hidden="true"
    >
      {/* Layer 1: Ground — grid lines */}
      <g filter="url(#grain-light)">
        {/* Major grid */}
        {[0, 80, 160, 240, 320, 400].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="200" stroke="var(--gc-primary)" strokeWidth="0.5" opacity="0.1" />
        ))}
        {[0, 80, 160, 200].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="400" y2={y} stroke="var(--gc-primary)" strokeWidth="0.5" opacity="0.1" />
        ))}
        {/* Minor grid */}
        {[40, 120, 200, 280, 360].map((x) => (
          <line key={`vm${x}`} x1={x} y1="0" x2={x} y2="200" stroke="var(--gc-primary)" strokeWidth="0.3" opacity="0.05" />
        ))}
      </g>
      {/* Layer 3: Accents — highlighted cells */}
      <rect x="80" y="80" width="80" height="80" fill="var(--gc-primary)" opacity="0.06" rx="1" />
      <rect x="240" y="0" width="80" height="80" fill="var(--gc-accent)" opacity="0.06" rx="1" />
      <circle cx="120" cy="120" r="4" fill="var(--gc-accent)" opacity="0.5" />
    </svg>
  )
}
