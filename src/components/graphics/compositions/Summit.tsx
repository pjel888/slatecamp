import { cn } from '@/lib/utils'

/**
 * Summit — Abstract mountain/peak composition.
 * Usage: Achievement screens, goal completion, landing page.
 * 3-layer: ground (triangles) + accent (flag, dots) + grain.
 */
export function Summit({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 200"
      className={cn('w-full h-full', className)}
      aria-hidden="true"
    >
      {/* Layer 1: Ground — mountain peaks */}
      <g filter="url(#grain)">
        <polygon points="60,200 160,60 260,200" fill="var(--gc-primary)" opacity="0.12" />
        <polygon points="180,200 280,40 380,200" fill="var(--gc-primary)" opacity="0.18" />
        <polygon points="0,200 80,100 160,200" fill="var(--gc-primary)" opacity="0.08" />
      </g>
      {/* Layer 3: Accents — flag at summit */}
      <line x1="280" y1="40" x2="280" y2="18" stroke="var(--gc-accent)" strokeWidth="2" opacity="0.7" />
      <polygon points="280,18 300,24 280,30" fill="var(--gc-accent)" opacity="0.6" />
      <circle cx="100" cy="80" r="3" fill="var(--gc-success)" opacity="0.4" />
      <circle cx="350" cy="120" r="5" fill="var(--gc-accent)" opacity="0.25" />
    </svg>
  )
}
