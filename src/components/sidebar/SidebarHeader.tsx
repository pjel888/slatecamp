'use client'

import { cn } from '@/lib/utils'
import { SlateCampLogomark } from '@/components/graphics/logos/SlateCampLogomark'
import { SIDEBAR_PADDING } from './types'

// ---------------------------------------------------------------------------
// SidebarHeader — HTML v4 anatomy
// Height: 40px. Logo icon: 40x40px. Wordmark: opacity-only on expand.
// ---------------------------------------------------------------------------

interface SidebarHeaderProps {
  expanded: boolean
}

export const SidebarHeader = ({ expanded }: SidebarHeaderProps) => (
  <div
    className={cn(
      'grid h-16 shrink-0 grid-cols-[40px_minmax(0,1fr)] items-center gap-1 overflow-hidden',
      'border-b border-gray-200 dark:border-gray-800',
    )}
    style={{ paddingInline: SIDEBAR_PADDING }}
  >
    {/* Logo icon container: 40x64px — same fixed slot as every nav icon */}
    <div className="flex h-16 w-10 shrink-0 items-center justify-center">
      <SlateCampLogomark
        size={32}
        className="text-camp-cobalt dark:text-primary"
      />
    </div>

    {/* Wordmark — opacity-only visibility */}
    <div
      className={cn(
        'min-w-0 whitespace-nowrap overflow-hidden',
        'text-[14px] font-semibold leading-none font-[family-name:var(--font-sora)]',
        'transition-[opacity,transform] duration-[180ms] ease-out motion-reduce:transition-none motion-reduce:transform-none',
        expanded ? 'translate-x-0 opacity-100' : 'translate-x-1 opacity-0',
      )}
    >
      <span className="text-camp-cobalt dark:text-primary">SlateCamp</span>
    </div>
  </div>
)
