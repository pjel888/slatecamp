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

// ---------------------------------------------------------------------------
// SidebarNavItem — HTML v4 anatomy
// Row height: 32px. Grid: 40px fixed icon slot + label column.
// The icon slot never changes, so the icon center stays at padding + 20px.
// Active indicator stays inside the row so label clipping cannot hide it.
// ---------------------------------------------------------------------------

export const SidebarNavItem = ({
  item,
  isActive,
  expanded,
  showTooltip,
  onNavigate,
}: SidebarNavItemProps) => {
  const { icon: Icon, label, href, tier, shortcut } = item

  const tierOpacity = ICON_TIER_OPACITY[tier]

  const anchor = (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
      aria-label={expanded ? undefined : label}
      data-t={label}
      data-k={shortcut}
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
          // ::before active left-border indicator
          'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2',
          'before:w-[2.5px] before:h-4',
          'before:bg-camp-cobalt dark:before:bg-primary-400',
          'before:rounded-r-sm',
          'before:content-[\'\']',
        ],
      )}
    >
      {/* Icon container: 40x32px, spatially locked */}
      <span className={ICON_CONTAINER_CLASS}>
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
            // On hover the parent rule drives color; icon inherits currentColor
            'shrink-0',
            // Active/hover: opacity snaps to 1 via parent group trigger
            (isActive) && 'opacity-100',
          )}
        />
      </span>

      {/* Label — clipped/faded in collapsed mode without affecting icon position */}
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

      {/* Keyboard badge — only when expanded and shortcut exists */}
      {/* {expanded && shortcut && (
        <span
          className={cn(
            'ml-auto mr-1 font-mono text-[11px] font-medium',
            'text-gray-400 dark:text-gray-500',
            'bg-gray-100 dark:bg-gray-800',
            'px-1 rounded-[3px]',
            'transition-opacity duration-[180ms]',
            expanded ? 'opacity-100' : 'opacity-0',
          )}
        >
          {shortcut}
        </span>
      )} */}
    </Link>
  )

  return (
    <div className="w-full">
      {showTooltip && !expanded ? (
        <TooltipProvider delay={0}>
          <Tooltip>
            <TooltipTrigger asChild>{anchor}</TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {label}
              {shortcut && (
                <span className="ml-1.5 text-gray-400 dark:text-gray-500">
                  {shortcut}
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
