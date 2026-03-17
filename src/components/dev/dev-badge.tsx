'use client'

import { usePathname } from 'next/navigation'
import { useDevStore } from '@/stores/dev-store'

/**
 * Tiny floating badge showing route path, active flags count.
 * Only renders in development mode.
 */
export function DevBadge() {
  if (process.env.NODE_ENV !== 'development') return null

  return <DevBadgeInner />
}

function DevBadgeInner() {
  const pathname = usePathname()
  const showDevBadges = useDevStore((s) => s.showDevBadges)
  const overrideCount = useDevStore((s) => Object.keys(s.featureOverrides).length)

  if (!showDevBadges) return null

  return (
    <div className="fixed top-2 left-2 z-50 flex items-center gap-1.5 rounded-full border border-border bg-background/90 px-2 py-0.5 shadow-sm backdrop-blur-sm">
      <span className="text-[9px] font-mono text-muted-foreground truncate max-w-[200px]">
        {pathname}
      </span>
      {overrideCount > 0 && (
        <span className="inline-flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-amber-500 px-1 text-[8px] font-bold text-white">
          {overrideCount}
        </span>
      )}
    </div>
  )
}
