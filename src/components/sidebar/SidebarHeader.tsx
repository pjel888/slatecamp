'use client'

import { cn } from '@/lib/utils'
import { SlateCampLogomark } from '@/components/graphics/logos/SlateCampLogomark'

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
      'flex h-16 shrink-0 items-center px-[3px]',
      'border-b border-gray-200 dark:border-gray-800',
    )}
  >
    {/* Logo icon container: 40x64px — matches dashboard header height for visual continuity */}
    <div className="flex h-16 w-12 shrink-0 items-center justify-center">
      <SlateCampLogomark
        size={32}
        className="text-camp-cobalt dark:text-[#4F6AE8]"
      />
    </div>

    {/* Wordmark — opacity-only visibility */}
    <div
      className={cn(
        'whitespace-nowrap overflow-hidden',
        'text-[14px] font-semibold leading-none font-[family-name:var(--font-sora)]',
        'transition-opacity duration-[180ms] ease-out',
        expanded ? 'opacity-100' : 'opacity-0 w-0 ml-0',
        expanded && 'ml-2.5',
      )}
    >
      <span className="text-camp-cobalt dark:text-[#4F6AE8]">SlateCamp</span>
    </div>
  </div>
)
