'use client'

import { BookOpen } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils'

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
      'flex h-16 shrink-0 items-center px-[6px]',
      'border-b border-gray-200 dark:border-gray-800',
    )}
  >
    {/* Logo icon container: 40x64px — matches dashboard header height for visual continuity */}
    <div className="flex h-16 w-10 shrink-0 items-center justify-center">
      <BookOpen
        size={17}
        weight="fill"
        className="text-camp-cobalt dark:text-[#4F6AE8]"
      />
    </div>

    {/* Wordmark — opacity-only visibility */}
    <div
      className={cn(
        'whitespace-nowrap overflow-hidden',
        'text-[13px] font-extrabold tracking-[-0.3px] leading-none font-sans',
        'transition-opacity duration-[180ms] ease-out',
        expanded ? 'opacity-100' : 'opacity-0 w-0',
      )}
    >
      <span className="text-gray-900 dark:text-gray-200">Slate</span>
      <span className="text-camp-cobalt dark:text-[#4F6AE8]">Camp</span>
    </div>
  </div>
)
