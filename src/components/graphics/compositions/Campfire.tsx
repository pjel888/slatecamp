import { cn } from '@/lib/utils'

/**
 * Campfire — Abstract flame/warmth composition.
 * Usage: Onboarding, welcome screens, brand moments.
 * 3-layer: ground (log shapes) + flame shapes + accent sparks.
 */
export function Campfire({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={cn('w-full h-full', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cf-flame" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="var(--gc-accent)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--gc-accent)" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      {/* Layer 1: Ground — log shapes */}
      <g filter="url(#grain)">
        <rect x="55" y="150" width="90" height="14" rx="7" fill="var(--gc-primary)" opacity="0.2" transform="rotate(-8 100 157)" />
        <rect x="50" y="162" width="100" height="14" rx="7" fill="var(--gc-primary)" opacity="0.15" transform="rotate(5 100 169)" />
      </g>
      {/* Layer 2: Flame shapes */}
      <ellipse cx="100" cy="120" rx="30" ry="50" fill="url(#cf-flame)" />
      <ellipse cx="90" cy="110" rx="18" ry="35" fill="var(--gc-accent)" opacity="0.12" />
      <ellipse cx="110" cy="115" rx="15" ry="30" fill="var(--gc-accent)" opacity="0.10" />
      {/* Layer 3: Accent sparks */}
      <circle cx="85" cy="70" r="2.5" fill="var(--gc-accent)" opacity="0.5" />
      <circle cx="115" cy="60" r="2" fill="var(--gc-accent)" opacity="0.4" />
      <circle cx="95" cy="55" r="1.5" fill="var(--gc-accent)" opacity="0.3" />
      <circle cx="108" cy="78" r="1.5" fill="var(--gc-success)" opacity="0.35" />
    </svg>
  )
}
