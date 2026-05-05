'use client'

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { SIDEBAR_PADDING } from './types'

// ---------------------------------------------------------------------------
// SidebarFooter — HTML v4 anatomy
// Two 30px rows: profile + toggle. Border-top separates from nav.
// ---------------------------------------------------------------------------

interface SidebarFooterProps {
  expanded: boolean
  userDisplay: { name: string; avatarUrl: string | null }
  tier: string
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return ''
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export const SidebarFooter = ({
  expanded,
  userDisplay,
  tier,
}: SidebarFooterProps) => {
  const initials = getInitials(userDisplay.name)

  const profileRow = (
    <div
      aria-label={userDisplay.name}
      data-t={userDisplay.name}
      className={cn(
        'grid h-[30px] w-full grid-cols-[48px_minmax(0,1fr)] items-center gap-1 overflow-hidden rounded-md',
        'transition-colors duration-[120ms] ease-out',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
      )}
    >
      {/* Avatar container: 48x30px */}
      <div className="flex h-[30px] w-12 shrink-0 items-center justify-center">
        <div
          className={cn(
            'h-[22px] w-[22px] rounded-full overflow-hidden',
            'flex items-center justify-center shrink-0',
            !userDisplay.avatarUrl &&
              'bg-gradient-to-br from-camp-cobalt to-primary-400',
          )}
        >
          {userDisplay.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={userDisplay.avatarUrl}
              alt={userDisplay.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-[11px] font-semibold text-white leading-none select-none">
              {initials}
            </span>
          )}
        </div>
      </div>

      {/* Profile info — opacity-only visibility */}
      <div
        className={cn(
          'flex flex-col justify-center min-w-0 overflow-hidden',
          'transition-[opacity,transform] duration-[180ms] ease-out motion-reduce:transition-none motion-reduce:transform-none',
          expanded ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-1 opacity-0',
        )}
      >
        {/* Name + Pro badge */}
        <div className="flex items-center whitespace-nowrap overflow-hidden">
          <span className="text-[11.5px] font-medium text-gray-900 dark:text-gray-200 truncate">
            {userDisplay.name}
          </span>
          {tier === 'pro' && (
            <span
              className={cn(
                'ml-1.5 inline-flex items-center',
                'font-mono text-[7.5px] uppercase tracking-[0.04em]',
                'bg-camp-cobalt/[0.07] text-camp-cobalt',
                'dark:bg-primary-400/10 dark:text-primary',
                'rounded-[2px] px-1',
              )}
            >
              Pro
            </span>
          )}
        </div>

        {/* Email */}
        {/* Email not in props — omitted; caller can extend if needed */}
      </div>
    </div>
  )

  return (
    <div
      className={cn(
        'flex flex-col',
        'border-t border-gray-200 dark:border-gray-800',
        'pt-3 pb-4',
      )}
      style={{ paddingInline: SIDEBAR_PADDING }}
    >
      {/* Profile row — with tooltip when collapsed */}
      {!expanded ? (
        <TooltipProvider delay={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full">{profileRow}</div>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {userDisplay.name}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        profileRow
      )}

    </div>
  )
}
