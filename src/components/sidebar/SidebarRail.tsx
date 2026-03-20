'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { SidebarSimple, ShieldCheck } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { useSidebar } from './SidebarProvider'
import { SidebarNavItem } from './SidebarNavItem'
import { SidebarNavGroup } from './SidebarNavGroup'
import { SidebarUserProfile } from './SidebarUserProfile'
import { SidebarFooter } from './SidebarFooter'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { ROUTES } from '@/lib/constants/routes'
import { GROUPED_NAVIGATION } from '@/lib/routes'
import type { UserTier } from '@/types/app'

// ---------------------------------------------------------------------------
// Logomark -- compact logo for the rail
// ---------------------------------------------------------------------------

const Logomark = () => (
  <div className="flex h-8 w-8 items-center justify-center rounded-md text-white shadow-sm overflow-hidden">
    <Image
      src="/SlateCampLogoMark.svg"
      alt="SlateCamp logomark"
      width={24}
      height={24}
      priority
      className="h-4 w-4"
    />
  </div>
)

// ---------------------------------------------------------------------------
// SidebarRail
// ---------------------------------------------------------------------------

interface SidebarRailProps {
  isAdmin?: boolean
  onBeforeNavigate: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void
  userDisplay?: { name: string; avatarUrl: string | null }
  tier?: UserTier
  isDevMode?: boolean
}

export const SidebarRail = ({
  isAdmin,
  onBeforeNavigate,
  userDisplay,
  tier = 'free',
  isDevMode,
}: SidebarRailProps) => {
  const { expanded, toggle, toggleRef } = useSidebar()
  const pathname = usePathname()

  return (
    <aside
      className="hidden lg:flex lg:flex-col shrink-0 bg-white w-[72px] z-[10]"
      aria-label="Navigation rail"
    >
      {/* 1. Logo area */}
      <div className="h-16 flex items-center justify-center border-b border-border shrink-0">
        <Link href={ROUTES.DASHBOARD} className="outline-none">
          <Logomark />
        </Link>
      </div>

      {/* 2. Toggle button area */}
      <div className="flex items-center justify-center border-b border-border shrink-0 py-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              ref={toggleRef}
              onClick={toggle}
              aria-expanded={expanded}
              className="flex h-7 w-7 items-center justify-center rounded-sm text-[#8896A7] transition-colors duration-150 hover:bg-[#EEF2FC]/50 hover:text-primary outline-none"
            >
              <SCIcon icon={SidebarSimple} size="sm" className="scale-x-[-1]" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={12}
            className="bg-[#1A2332] text-white font-medium text-xs"
          >
            Expand sidebar
          </TooltipContent>
        </Tooltip>
      </div>

      {/* 3. User profile (avatar only in rail) */}
      {userDisplay && (
        <SidebarUserProfile
          name={userDisplay.name}
          avatarUrl={userDisplay.avatarUrl}
          tier={tier}
          isDevMode={isDevMode}
          variant="rail"
        />
      )}

      {/* 4. Navigation area */}
      <nav className="flex flex-1 flex-col px-3 overflow-y-auto overflow-x-hidden py-2">
        {/* Dashboard standalone */}
        <SidebarNavItem
          href={GROUPED_NAVIGATION.dashboard.href}
          label={GROUPED_NAVIGATION.dashboard.label}
          icon={GROUPED_NAVIGATION.dashboard.icon}
          isActive={pathname === GROUPED_NAVIGATION.dashboard.href}
          variant="rail"
          onBeforeNavigate={(e) => onBeforeNavigate(e, GROUPED_NAVIGATION.dashboard.href)}
        />

        {/* Grouped navigation */}
        {GROUPED_NAVIGATION.groups.map(({ config, items }) => (
          <SidebarNavGroup
            key={config.key}
            label={config.label}
            items={items}
            variant="rail"
            onBeforeNavigate={onBeforeNavigate}
          />
        ))}

        {/* Admin Dev Settings */}
        {isAdmin && (
          <div className="mt-4">
            <SidebarNavItem
              href={ROUTES.SETTINGS_DEVELOPER}
              label="Dev Settings"
              icon={ShieldCheck}
              isActive={pathname === ROUTES.SETTINGS_DEVELOPER}
              variant="rail"
              onBeforeNavigate={(e) => onBeforeNavigate(e, ROUTES.SETTINGS_DEVELOPER)}
            />
          </div>
        )}
      </nav>

      {/* 5. Footer area (CTA + Settings) */}
      <SidebarFooter
        variant="rail"
        isAdmin={isAdmin}
        onBeforeNavigate={onBeforeNavigate}
      />
    </aside>
  )
}
