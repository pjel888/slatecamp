import Link from 'next/link'

/**
 * Locked Heatmap Overlay — UX Strategy Section 8
 * Free users see blurred/silhouetted heatmap.
 * "Your map is updating — [X] nodes explored. Upgrade to see exactly where to focus."
 * This is "specific loss" — their own data, not generic paywalled content.
 */

interface LockedHeatmapOverlayProps {
  nodesExplored: number
  children: React.ReactNode
}

export const LockedHeatmapOverlay = ({
  nodesExplored,
  children,
}: LockedHeatmapOverlayProps) => {
  return (
    <div className="relative">
      {/* Blurred heatmap content — shape visible, details not */}
      <div
        className="pointer-events-none select-none"
        style={{ filter: 'blur(6px)' }}
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Overlay with messaging */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 rounded-md">
        <svg
          className="h-5 w-5 text-[#8896A7] mb-2"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
        <p className="text-sm font-medium text-[#1A2332] text-center max-w-xs">
          Your map is updating &mdash; {nodesExplored} {nodesExplored === 1 ? 'node' : 'nodes'} explored.
        </p>
        <Link
          href="/dashboard/upgrade"
          className="mt-2 text-sm font-medium text-[#1B3FC4] hover:text-[#1535A8] transition-colors duration-150"
        >
          Upgrade to see exactly where to focus &rarr;
        </Link>
      </div>
    </div>
  )
}
