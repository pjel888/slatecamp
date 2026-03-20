'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { SidebarSimple, ShieldCheck, Sparkle, Lightning, Crown } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { useSidebar } from './SidebarProvider'
import { SidebarNavItem } from './SidebarNavItem'
import { SidebarNavGroup } from './SidebarNavGroup'
import { SidebarUserProfile } from './SidebarUserProfile'
import { SidebarFooter } from './SidebarFooter'
import { ICON_BOX } from './types'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { ROUTES } from '@/lib/constants/routes'
import { GROUPED_NAVIGATION } from '@/lib/routes'
import type { UserTier } from '@/types/app'

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

const getTierIcon = (tier: UserTier) => {
  if (tier === 'free') return Sparkle
  if (tier === 'camp' || tier === 'insurance') return Lightning
  return Crown
}

const getTierIconColor = (tier: UserTier) => {
  if (tier === 'free') return 'text-[#D4951A]'
  if (tier === 'camp' || tier === 'insurance') return 'text-primary'
  return 'text-[#D4951A]'
}

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
}: SidebarRailProps) => {
  const { toggle, toggleRef } = useSidebar()
  const pathname = usePathname()
  const TierIcon = getTierIcon(tier)

  return (
    <aside
      className="hidden lg:flex lg:flex-col shrink-0 bg-white w-[72px] z-[10]"
      aria-label="Navigation rail"
    >
      {/* 1. Logo — only divider in the entire sidebar */}
      <div className="h-16 flex items-center justify-center shrink-0">
        <Link href={ROUTES.DASHBOARD} className="outline-none">
          <Logomark />
        </Link>
      </div>
      <div className="mx-3 h-px bg-border" />

      {/* 2. Toggle */}
      <div className="flex items-center justify-center shrink-0 py-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              ref={toggleRef}
              onClick={toggle}
              aria-expanded={false}
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

      {/* 3. User profile */}
      {userDisplay && (
        <div className="px-3">
          <SidebarUserProfile
            name={userDisplay.name}
            avatarUrl={userDisplay.avatarUrl}
            collapsed={true}
          />
        </div>
      )}

      {/* 4. Tier */}
      <div className="py-2 px-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-start gap-2.5 px-2 py-[5px] rounded-sm">
              <div className={ICON_BOX}>
                <SCIcon icon={TierIcon} size="sm" className={getTierIconColor(tier)} />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={12}
            className="bg-[#1A2332] text-white font-medium text-xs"
          >
            {tier === 'free' ? 'Free plan' : `${tier.charAt(0).toUpperCase() + tier.slice(1)} plan`}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* 5. Nav */}
      <nav className="flex flex-1 flex-col px-3 overflow-y-auto overflow-x-hidden py-2">
        <SidebarNavItem
          href={GROUPED_NAVIGATION.dashboard.href}
          label={GROUPED_NAVIGATION.dashboard.label}
          icon={GROUPED_NAVIGATION.dashboard.icon}
          isActive={pathname === GROUPED_NAVIGATION.dashboard.href}
          collapsed={true}
          onBeforeNavigate={(e) => onBeforeNavigate(e, GROUPED_NAVIGATION.dashboard.href)}
        />
        {GROUPED_NAVIGATION.groups.map(({ config, items }) => (
          <SidebarNavGroup
            key={config.key}
            label={config.label}
            items={items}
            collapsed={true}
            onBeforeNavigate={onBeforeNavigate}
          />
        ))}
        {isAdmin && (
          <div className="mt-4">
            <SidebarNavItem
              href={ROUTES.SETTINGS_DEVELOPER}
              label="Dev Settings"
              icon={ShieldCheck}
              isActive={pathname === ROUTES.SETTINGS_DEVELOPER}
              collapsed={true}
              onBeforeNavigate={(e) => onBeforeNavigate(e, ROUTES.SETTINGS_DEVELOPER)}
            />
          </div>
        )}
      </nav>

      {/* 6. Footer */}
      <SidebarFooter
        collapsed={true}
        isAdmin={isAdmin}
        onBeforeNavigate={onBeforeNavigate}
      />
    </aside>
  )
}
