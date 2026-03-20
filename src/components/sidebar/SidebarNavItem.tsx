'use client'

import type { SidebarNavItemProps } from './types'
import { ICON_BOX } from './types'
import { TransitionLink } from '@/components/shared/TransitionLink'
import { SCIcon } from '@/components/graphics/icons/Icon'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const baseClasses =
  'relative flex items-center gap-2.5 px-2 py-[5px] text-[13px] leading-tight rounded-sm transition-colors duration-150 outline-none w-full justify-start overflow-hidden'

export const SidebarNavItem = ({
  href,
  label,
  icon: Icon,
  isActive,
  variant,
  onBeforeNavigate,
}: SidebarNavItemProps) => {
  const stateClasses = isActive
    ? 'text-primary font-semibold bg-[#EEF2FC]'
    : 'text-[#4A5568] hover:bg-[#EEF2FC]/50 hover:text-primary'

  const link = (
    <TransitionLink
      href={href}
      className={cn(baseClasses, stateClasses)}
      onBeforeNavigate={onBeforeNavigate}
    >
      {/* Active indicator -- 3px blue bar on the left */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[14px] bg-primary rounded-r-full" />
      )}

      <div className={ICON_BOX}>
        {Icon ? (
          <SCIcon
            icon={Icon}
            size="sm"
            weight={isActive ? 'bold' : 'regular'}
            className={cn(isActive ? 'text-primary' : 'text-[#4A5568]')}
          />
        ) : null}
      </div>

      {variant === 'rail' ? (
        <span className="sr-only">{label}</span>
      ) : (
        <span className="truncate whitespace-nowrap">{label}</span>
      )}
    </TransitionLink>
  )

  if (variant === 'rail') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent
          side="right"
          sideOffset={12}
          className="bg-[#1A2332] text-white font-medium text-xs"
        >
          {label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return link
}
