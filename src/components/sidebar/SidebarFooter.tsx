'use client'

import { CaretDoubleRight } from '@phosphor-icons/react'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// SidebarFooter — HTML v4 anatomy
// Two 30px rows: profile + toggle. Border-top separates from nav.
// ---------------------------------------------------------------------------

interface SidebarFooterProps {
  expanded: boolean
  userDisplay: { name: string; avatarUrl: string | null }
  tier: string
  onToggle: () => void
  toggleRef: React.RefObject<HTMLButtonElement | null>
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
  onToggle,
  toggleRef,
}: SidebarFooterProps) => {
  const initials = getInitials(userDisplay.name)

  const profileRow = (
    <div
      role="button"
      tabIndex={0}
      data-t={userDisplay.name}
      className={cn(
        'flex h-[30px] w-full items-center rounded-md cursor-pointer',
        'transition-colors duration-[120ms] ease-out',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        'outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[camp-cobalt]',
      )}
    >
      {/* Avatar container: 40x30px */}
      <div className="flex h-[30px] w-10 shrink-0 items-center justify-center">
        <div
          className={cn(
            'h-[22px] w-[22px] rounded-full overflow-hidden',
            'flex items-center justify-center shrink-0',
            !userDisplay.avatarUrl &&
              'bg-gradient-to-br from-[camp-cobalt] to-[#6366F1]',
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
          'transition-opacity duration-[180ms] ease-out',
          expanded ? 'opacity-100' : 'opacity-0 w-0',
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
                'bg-[camp-cobalt]/[0.07] text-[camp-cobalt]',
                'dark:bg-[#4F6AE8]/10 dark:text-[#4F6AE8]',
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
        'flex flex-col gap-2',
        'border-t border-gray-200 dark:border-gray-800',
        'pt-2 pb-6 px-[6px]',
      )}
    >
      {/* Profile row — with tooltip when collapsed */}
      {!expanded ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full">{profileRow}</div>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {userDisplay.name}
          </TooltipContent>
        </Tooltip>
      ) : (
        profileRow
      )}

      {/* Toggle button */}
      <button
        ref={toggleRef}
        onClick={onToggle}
        aria-expanded={expanded}
        aria-label="Toggle sidebar"
        className={cn(
          'flex h-[30px] w-full items-center rounded-md',
          'transition-colors duration-[120ms] ease-out',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          'outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[camp-cobalt]',
        )}
      >
        {/* Toggle icon container: 40x30px */}
        <div className="flex h-[30px] w-10 shrink-0 items-center justify-center">
          <CaretDoubleRight
            size={14}
            weight="regular"
            className={cn(
              'text-gray-400 shrink-0',
              'transition-transform duration-[180ms] ease-out',
              expanded && 'rotate-180',
            )}
          />
        </div>

        {/* Toggle label */}
        <span
          className={cn(
            'whitespace-nowrap overflow-hidden text-[11.5px] text-gray-400 dark:text-gray-500',
            'transition-opacity duration-[180ms] ease-out',
            expanded ? 'opacity-100' : 'opacity-0 w-0',
          )}
        >
          Collapse
        </span>

        {/* Shortcut badge */}
        <span
          className={cn(
            'ml-auto mr-1 font-mono text-[11px] font-medium',
            'text-gray-400 dark:text-gray-500',
            'bg-gray-100 dark:bg-gray-800',
            'px-1 rounded-[3px]',
            'transition-opacity duration-[180ms] ease-out',
            expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden',
          )}
        >
          ⌘B
        </span>
      </button>
    </div>
  )
}
