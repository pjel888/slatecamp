'use client'

import Link from 'next/link'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  ICON_CONTAINER_CLASS,
  ICON_SIZE,
  ICON_TIER_OPACITY,
} from './types'
import type { SidebarNavItemProps } from './types'
import type { NavigationPendingInfo } from './types'

// ---------------------------------------------------------------------------
// SidebarNavItem — HTML v4 anatomy
// Row height: 32px. Grid: 48px fixed icon slot + label column.
// The icon slot never changes, so the icon center stays at padding + 24px.
// Active indicator stays inside the row so label clipping cannot hide it.
// Extended with navigation-pending feedback (spinner + disabled state).
// ---------------------------------------------------------------------------

interface ExtendedSidebarNavItemProps extends SidebarNavItemProps {
  navigationPending?: NavigationPendingInfo
}

export const SidebarNavItem = ({
  item,
  isActive,
  expanded,
  showTooltip,
  onNavigate,
  navigationPending,
}: ExtendedSidebarNavItemProps) => {
  const { icon: Icon, label, href, tier, id } = item

  const tierOpacity = ICON_TIER_OPACITY[tier]

  // Navigation pending state
  const isNavigating = navigationPending?.isNavigating ?? false
  const isItemPending = navigationPending?.isPendingHref(href) ?? false
  const isItemDisabled = isNavigating && !isItemPending

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Prevent clicks on disabled items
    if (isItemDisabled) {
      e.preventDefault()
      e.stopPropagation()
      return
    }

    // Start navigation pending state if not already set
    if (!isItemPending && !isActive && navigationPending) {
      navigationPending.startNavigation(href, { id })
    }

    // Call existing onNavigate (used for active-session confirm dialog)
    onNavigate(e)
  }

  const anchor = (
    <Link
      href={href}
      onClick={handleClick}
      aria-current={isActive ? 'page' : undefined}
      aria-label={expanded ? undefined : label}
      aria-disabled={isItemDisabled ? true : undefined}
      aria-busy={isItemPending ? true : undefined}
      data-t={label}
      data-k={item.shortcut}
      data-pending={isItemPending ? '' : undefined}
      className={cn(
        // Base layout
        'group relative grid h-8 grid-cols-[48px_auto] items-center gap-1 overflow-visible rounded-md px-0 outline-none',
        expanded ? 'w-full pr-3' : 'w-full grid-cols-[48px_minmax(0,1fr)] pr-0',
        // One shared hover/active surface: 36px tall in expanded, 36x36 in collapsed.
        'before:absolute before:top-[-2px] before:z-0 before:h-9 before:rounded-md before:bg-primary-50 before:opacity-0',
        "before:shadow-[inset_0_0_0_1px_rgba(37,64,197,0.08)] before:transition-opacity before:duration-[120ms] before:ease-out before:content-['']",
        'hover:before:opacity-100 focus-visible:before:opacity-100',
        'dark:before:bg-primary-900/20 dark:before:shadow-[inset_0_0_0_1px_rgba(148,163,184,0.12)]',
        expanded ? 'before:inset-x-0' : 'before:left-1.5 before:w-9',
        // Transition
        'transition-colors duration-[120ms] ease-out',
        // Focus-visible ring
        'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-camp-cobalt',
        // Default state
        'text-gray-500 dark:text-gray-400',
        // Hover state
        'hover:text-primary dark:hover:text-primary-400',
        'hover:bg-transparent',
        // Active state uses the same 48px-tall surface as hover.
        isActive && [
          'text-primary dark:text-primary-400',
          'before:opacity-100',
        ],
        // Pending state — subtle highlight + cursor
        isItemPending && [
          'cursor-progress',
          'bg-primary-50/60 dark:bg-primary-900/10',
          'text-primary/80 dark:text-primary-400/80',
        ],
        // Disabled state — muted, no pointer interaction
        isItemDisabled && [
          'pointer-events-none',
          'opacity-40',
          'cursor-progress',
          'select-none',
        ],
      )}
    >
      {/* Icon container: 48px slot; the link paints the shared hover/active surface behind it. */}
      <span
        className={cn(
          ICON_CONTAINER_CLASS,
          'relative z-10 rounded-md transition-[background-color,box-shadow] duration-[120ms] ease-out',
        )}
      >
        {isItemPending ? (
          // Spinner replaces icon for pending item
          <span
            className="block h-4 w-4 animate-spin rounded-full border-[2px] border-current border-t-transparent motion-reduce:animate-none motion-reduce:border-t-0 motion-reduce:opacity-50"
            aria-hidden="true"
          />
        ) : (
          <Icon
            size={ICON_SIZE}
            weight="regular"
            style={{
              opacity:
                isActive || tier === 'default'
                  ? 1.0
                  : tierOpacity,
            }}
            className={cn(
              'transition-opacity duration-[120ms]',
              'relative z-10 shrink-0',
              isActive && 'opacity-100',
            )}
          />
        )}
      </span>

      {/* Label — clipped/faded in collapsed mode */}
      <span
        aria-hidden={!expanded}
        className={cn(
          'relative z-10 min-w-0 truncate whitespace-nowrap text-[12.5px] leading-none transition-[opacity,transform] duration-[180ms] ease-out motion-reduce:transition-none motion-reduce:transform-none',
          isActive ? 'font-medium' : 'font-normal',
          expanded ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-1 opacity-0',
        )}
      >
        {label}
      </span>

      {/* Visually hidden loading announcement for screen readers */}
      {isItemPending && (
        <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          Loading {label}…
        </span>
      )}
    </Link>
  )

  return (
    <div className="w-full">
      {showTooltip && !expanded ? (
        <TooltipProvider delay={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              {isItemPending ? (
                // In collapsed mode with tooltip, wrap in a span to avoid tooltip trigger issues
                <span>{anchor}</span>
              ) : (
                anchor
              )}
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {label}
              {item.shortcut && (
                <span className="ml-1.5 text-gray-400 dark:text-gray-500">
                  {item.shortcut}
                </span>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        anchor
      )}
    </div>
  )
}
