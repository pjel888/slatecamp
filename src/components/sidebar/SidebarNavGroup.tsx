'use client'

import { usePathname } from 'next/navigation'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react'
import { SidebarNavItem } from './SidebarNavItem'

interface SidebarNavGroupProps {
  label: string
  items: Array<{ href: string; label: string; icon?: PhosphorIcon }>
  variant: 'rail' | 'expanded'
  onBeforeNavigate: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void
}

export const SidebarNavGroup = ({
  label,
  items,
  variant,
  onBeforeNavigate,
}: SidebarNavGroupProps) => {
  const pathname = usePathname()

  return (
    <div>
      {/* Group header -- h-8 spacer in both states to preserve icon alignment.
          Expanded: shows label. Rail: empty gap separates icon clusters. */}
      <div className="h-8 flex items-end px-2 pb-1">
        {variant === 'expanded' && (
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#8896A7]">
            {label}
          </span>
        )}
      </div>

      <div className="space-y-px">
        {items.map(({ href, label: itemLabel, icon }) => {
          const isActive =
            pathname === href ||
            (href !== '/dashboard' && pathname.startsWith(href))

          return (
            <SidebarNavItem
              key={href}
              href={href}
              label={itemLabel}
              icon={icon}
              isActive={isActive}
              variant={variant}
              onBeforeNavigate={(e) => onBeforeNavigate(e, href)}
            />
          )
        })}
      </div>
    </div>
  )
}
