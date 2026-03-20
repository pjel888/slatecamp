'use client'

import { usePathname } from 'next/navigation'
import { Gear } from '@phosphor-icons/react'
import { ROUTES } from '@/lib/constants/routes'
import { SidebarNavItem } from './SidebarNavItem'
import { SidebarUpgradeCTA } from './SidebarUpgradeCTA'

// ---------------------------------------------------------------------------
// SidebarFooter
// ---------------------------------------------------------------------------
// No border — parent adds dividers for consistent inset lines.
// ---------------------------------------------------------------------------

interface SidebarFooterProps {
  collapsed: boolean
  isAdmin?: boolean
  onBeforeNavigate: (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => void
}

export const SidebarFooter = ({
  collapsed,
  onBeforeNavigate,
}: SidebarFooterProps) => {
  const pathname = usePathname()

  const isSettingsActive =
    pathname === ROUTES.SETTINGS || pathname.startsWith(ROUTES.SETTINGS)

  return (
    <div className="px-3 py-2">
      <SidebarUpgradeCTA collapsed={collapsed} />
      <SidebarNavItem
        href={ROUTES.SETTINGS}
        label="Settings"
        icon={Gear}
        isActive={isSettingsActive}
        collapsed={collapsed}
        onBeforeNavigate={(e) => onBeforeNavigate(e, ROUTES.SETTINGS)}
      />
    </div>
  )
}
