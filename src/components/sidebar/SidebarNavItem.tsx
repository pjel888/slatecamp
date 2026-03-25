'use client'

import Link from 'next/link'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
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
// Row height: 32px. Icon container: 40x32px. Label/badge: opacity-only toggle.
// Active indicator: ::before pseudo at left:-6px (parent px-[6px] is the bleed zone).
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
      data-t={label}
      data-k={shortcut}
      className={cn(
        // Base layout
        'relative flex h-8 w-full items-center rounded-md px-0 outline-none',
        // Transition
        'transition-colors duration-[120ms] ease-out',
        // Focus-visible ring
        'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1B3FC4]',
        // Default state
        'text-gray-500 dark:text-gray-400',
        // Hover state
        'hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200',
        // Active state
        isActive && [
          'bg-gray-100/50 dark:bg-gray-800/50',
          'text-gray-900 dark:text-gray-200',
          // ::before active left-border indicator
          // left:-6px bleeds into the parent px-[6px] padding zone
          'before:absolute before:left-[-6px] before:top-1/2 before:-translate-y-1/2',
          'before:w-[2.5px] before:h-4',
          'before:bg-[#1B3FC4] dark:before:bg-[#4F6AE8]',
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

      {/* Label — opacity-only visibility, takes no space when collapsed */}
      <span
        className={cn(
          'whitespace-nowrap overflow-hidden text-[12.5px] leading-none transition-opacity duration-[180ms]',
          isActive ? 'font-medium' : 'font-normal',
          expanded ? 'opacity-100' : 'opacity-0 w-0',
        )}
      >
        {label}
      </span>

      {/* Keyboard badge — only when expanded and shortcut exists */}
      {expanded && shortcut && (
        <span
          className={cn(
            'ml-auto mr-1 font-mono text-[9px] font-medium',
            'text-gray-400 dark:text-gray-500',
            'bg-gray-100 dark:bg-gray-800',
            'px-1 rounded-[3px]',
            'transition-opacity duration-[180ms]',
            expanded ? 'opacity-100' : 'opacity-0',
          )}
        >
          {shortcut}
        </span>
      )}
    </Link>
  )

  // Tooltip only shown when collapsed and showTooltip is true
  if (showTooltip && !expanded) {
    return (
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
    )
  }

  return anchor
}
