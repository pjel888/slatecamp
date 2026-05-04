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
// Row height: 32px. Grid: 40px fixed icon slot + label column.
// The icon slot never changes, so the icon center stays at padding + 20px.
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
        'relative grid h-8 w-full grid-cols-[40px_minmax(0,1fr)] items-center gap-1 overflow-hidden rounded-md px-0 outline-none',
        // Transition
        'transition-colors duration-[120ms] ease-out',
        // Focus-visible ring
        'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-camp-cobalt',
        // Default state
        'text-gray-500 dark:text-gray-400',
        // Hover state
        'hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200',
        // Active state
        isActive && [
          'bg-primary-50 dark:bg-primary-900/20',
          'text-primary dark:text-primary-400',
          'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2',
          'before:w-[2.5px] before:h-4',
          'before:bg-camp-cobalt dark:before:bg-primary-400',
          'before:rounded-r-sm',
          "before:content-['']",
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
      {/* Icon container: 40x32px, spatially locked */}
      <span className={ICON_CONTAINER_CLASS}>
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
              'shrink-0',
              isActive && 'opacity-100',
            )}
          />
        )}
      </span>

      {/* Label — clipped/faded in collapsed mode */}
      <span
        aria-hidden={!expanded}
        className={cn(
          'min-w-0 truncate whitespace-nowrap text-[12.5px] leading-none transition-[opacity,transform] duration-[180ms] ease-out motion-reduce:transition-none motion-reduce:transform-none',
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
