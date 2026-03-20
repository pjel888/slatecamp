'use client'

import { usePathname } from 'next/navigation'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react'
import { SidebarNavItem } from './SidebarNavItem'

interface SidebarNavGroupProps {
  label: string
  items: Array<{ href: string; label: string; icon?: PhosphorIcon }>
  collapsed: boolean
  onBeforeNavigate: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void
}

export const SidebarNavGroup = ({
  label,
  items,
  collapsed,
  onBeforeNavigate,
}: SidebarNavGroupProps) => {
  const pathname = usePathname()

  return (
    <div>
      {/* Group header — spacing only, no divider lines */}
      <div className="h-8 flex items-end px-2 pb-1">
        {!collapsed && (
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
              collapsed={collapsed}
              onBeforeNavigate={(e) => onBeforeNavigate(e, href)}
            />
          )
        })}
      </div>
    </div>
  )
}
