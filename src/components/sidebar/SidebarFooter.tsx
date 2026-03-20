'use client'

import { usePathname } from 'next/navigation'
import { Gear } from '@phosphor-icons/react'
import { ROUTES } from '@/lib/constants/routes'
import { SidebarNavItem } from './SidebarNavItem'
import { SidebarUpgradeCTA } from './SidebarUpgradeCTA'

// ---------------------------------------------------------------------------
// SidebarFooter
// ---------------------------------------------------------------------------
// Simplified per user decision:
// - NO ThemeToggle (belongs in Settings page)
// - NO DropdownMenu / popover
// - Just CTA (free users only) + Settings link
// ---------------------------------------------------------------------------

interface SidebarFooterProps {
  variant: 'rail' | 'expanded'
  isAdmin?: boolean
  onBeforeNavigate: (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => void
}

export const SidebarFooter = ({
  variant,
  onBeforeNavigate,
}: SidebarFooterProps) => {
  const pathname = usePathname()

  const isSettingsActive =
    pathname === ROUTES.SETTINGS || pathname.startsWith(ROUTES.SETTINGS)

  return (
    <div className="border-t border-border px-3 py-2">
      <SidebarUpgradeCTA variant={variant} />
      <SidebarNavItem
        href={ROUTES.SETTINGS}
        label="Settings"
        icon={Gear}
        isActive={isSettingsActive}
        variant={variant}
        onBeforeNavigate={(e) => onBeforeNavigate(e, ROUTES.SETTINGS)}
      />
    </div>
  )
}
