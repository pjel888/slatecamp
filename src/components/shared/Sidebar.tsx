'use client'

import { useState, useEffect } from 'react'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { TransitionLink } from '@/components/shared/TransitionLink'
import {
  ShieldCheck,
  SidebarSimple,
  Sparkle,
  Lightning,
  Crown,
} from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { useActiveSession } from '@/lib/context/active-session-context'
import { ThemeToggle } from './ThemeToggle'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { TierBadge } from '@/components/shared/TierBadge'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import type { UserTier } from '@/types/app'
import { ROUTES } from '@/lib/constants/routes'
import { SlateCampLogo } from '../ui/SlateCampLogo'
import { GROUPED_NAVIGATION } from '@/lib/routes'
import { cn } from '@/lib/utils'

function getInitials(name: string, email?: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2)
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }
  if (email) return email.slice(0, 2).toUpperCase()
  return 'U'
}

interface SidebarProps {
  isAdmin?: boolean
  isDevMode?: boolean
  userDisplay?: { name: string; avatarUrl: string | null }
  tier?: UserTier
  currentDiscipline?: string
}

/** * ARCHITECTURE FIX: The Strict Bounding Box
 * 32px box + 20px total left padding = perfectly centered in a 72px collapsed sidebar.
 */
/** 32px alignment box: 20px left padding + 16px (half of 32px) = 36px = center of 72px collapsed rail.
 *  DO NOT change this — icons stay pixel-perfect between collapsed/expanded. */
const ICON_BOX = 'flex h-8 w-8 shrink-0 items-center justify-center'
const ICON_SIZE = 'h-[18px] w-[18px]'

/** * Premium Collapsed Logomark
 */
const Logomark = () => (
  <div className='flex h-8 w-8 items-center justify-center rounded-md  text-white shadow-sm overflow-hidden'>
    <Image
      src='/SlateCampLogoMark.svg'
      alt='SlateCamp logomark'
      width={24}
      height={24}
      priority
      className='h4- w-4'
    />
  </div>
)

interface SidebarItemProps {
  href: string
  label: string
  icon?: PhosphorIcon
  isActive: boolean
  collapsed: boolean
  onBeforeNavigate: (e: React.MouseEvent<HTMLAnchorElement>) => void
}

const SidebarItem = ({
  href,
  label,
  icon: Icon,
  isActive,
  collapsed,
  onBeforeNavigate,
}: SidebarItemProps) => {
  // We NEVER change to justify-center. Mathematical padding keeps the icon static.
  const baseClasses =
    'relative flex items-center gap-2.5 px-2 py-[5px] text-[13px] leading-tight rounded-sm transition-colors duration-150 outline-none w-full justify-start overflow-hidden'

  const stateClasses = isActive
    ? 'text-primary font-semibold bg-[#EEF2FC]'
    : 'text-[#4A5568] hover:bg-[#EEF2FC]/50 hover:text-primary'

  const link = (
    <TransitionLink
      href={href}
      className={cn(baseClasses, stateClasses)}
      onBeforeNavigate={onBeforeNavigate}
    >
      {/* Dieter Rams Active Indicator */}
      {isActive && (
        <div className='absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[14px] bg-primary rounded-r-full' />
      )}

      <div className={ICON_BOX}>
        {Icon ? (
          <SCIcon
            icon={Icon}
            size='sm'
            weight={isActive ? 'bold' : 'regular'}
            className={cn(isActive ? 'text-primary' : 'text-[#4A5568]')}
          />
        ) : null}
      </div>

      {/* Opacity transition for text prevents harsh snapping */}
      <span
        className={cn(
          'truncate whitespace-nowrap transition-opacity duration-300',
          collapsed ? 'opacity-0' : 'opacity-100',
        )}
      >
        {label}
      </span>
    </TransitionLink>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent
          side='right'
          sideOffset={12}
          className='bg-[#1A2332] text-white font-medium text-xs'
        >
          {label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return link
}

export const Sidebar = ({
  isAdmin,
  isDevMode = false,
  userDisplay,
  tier = 'free',
  currentDiscipline,
}: SidebarProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const { activeSession: mode } = useActiveSession()
  const [collapsed, setCollapsed] = useState(false)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [leaveTarget, setLeaveTarget] = useState<string>(ROUTES.DASHBOARD)

  const displayName = userDisplay?.name ?? 'User'
  const initials = getInitials(displayName)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('cerebro_sidebar_collapsed')
      if (stored === 'true') setCollapsed(true)
      if (stored === 'false') setCollapsed(false)
    } catch {}
  }, [])

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (mode && href !== pathname) {
      e.preventDefault()
      setLeaveTarget(href)
      setLeaveDialogOpen(true)
    }
  }

  const handleConfirmLeave = () => {
    setLeaveDialogOpen(false)
    router.push(
      mode === 'review' ? `${ROUTES.REVIEW}?tab=review&exited=1` : leaveTarget,
    )
  }

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('cerebro_sidebar_collapsed', String(next))
      return next
    })
  }

  return (
    <aside
      className={cn(
        'hidden lg:flex lg:flex-col  transition-[width] duration-300 ease-in-out overflow-hidden shrink-0',
        collapsed ? 'w-[72px]' : 'w-[260px]',
        'bg-white',
        // 'bg-[#1B3FC4]',
        'z-10',
      )}
    >
      {/* 1. Logo Area (Stays perfectly static at the top) */}
      <div
        className={cn(
          'flex h-16 items-center border-b border-border shrink-0 transition-all duration-300',
          collapsed ? 'justify-center' : 'justify-start px-3',
        )}
      >
        <Link
          href={ROUTES.DASHBOARD}
          onClick={(e) => handleNavClick(e, ROUTES.DASHBOARD)}
          className='outline-none'
        >
          {collapsed ? <Logomark /> : <SlateCampLogo size='sm' />}
        </Link>
      </div>

      {/* 2. Minimize/Expand Toggle (Below Logo, Above Profile) */}
      <div
        className={cn(
          'flex items-center border-b border-border shrink-0 py-1 transition-all duration-300',
          collapsed ? 'justify-center' : 'justify-end px-3',
        )}
      >
        <button
          onClick={toggleCollapse}
          className='flex h-7 w-7 items-center justify-center rounded-sm text-[#8896A7] transition-colors duration-150 hover:bg-[#EEF2FC]/50 hover:text-primary outline-none'
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <SCIcon icon={SidebarSimple} size='sm' className='scale-x-[-1]' />
          ) : (
            <SCIcon icon={SidebarSimple} size='sm' />
          )}
        </button>
      </div>

      {/* 3. Main Content Area */}
      <div className='flex flex-1 flex-col px-3 overflow-y-auto overflow-x-hidden pb-4'>
        {/* User Profile Area */}
        <div className='border-b border-border py-2'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={ROUTES.SETTINGS}
                className='flex items-center justify-start gap-2.5 px-2 py-[5px] rounded-sm transition-colors duration-150 hover:bg-[#EEF2FC]/50 outline-none'
                onClick={(e) => handleNavClick(e, ROUTES.SETTINGS)}
              >
                <div className={ICON_BOX}>
                  <Avatar className='h-7 w-7 border border-border shadow-sm'>
                    {userDisplay?.avatarUrl ? (
                      <AvatarImage
                        src={userDisplay.avatarUrl}
                        alt={displayName}
                      />
                    ) : null}
                    <AvatarFallback className='bg-[#EEF2FC] text-xs font-medium text-[#1A2332]'>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div
                  className={cn(
                    'min-w-0 flex-1 transition-opacity duration-300',
                    collapsed ? 'opacity-0' : 'opacity-100',
                  )}
                >
                  <p className='truncate text-[13px] font-medium text-[#1A2332]'>
                    {displayName}
                  </p>
                </div>
              </Link>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent
                side='right'
                sideOffset={12}
                className='bg-primary text-white font-medium text-xs'
              >
                {displayName} (Settings)
              </TooltipContent>
            )}
          </Tooltip>
        </div>
        {/* Tier & Plan Area */}
        <div className='border-b border-border py-2'>
          <div className='flex items-center justify-start gap-2.5 px-2'>
            <div className={ICON_BOX}>
              {tier === 'free' ? (
                <SCIcon icon={Sparkle} size='sm' className='text-[#D4951A]' />
              ) : tier === 'camp' || tier === 'insurance' ? (
                <SCIcon icon={Lightning} size='sm' className='text-primary' />
              ) : (
                <SCIcon icon={Crown} size='sm' className='text-[#D4951A]' />
              )}
            </div>

            <div
              className={cn(
                'flex min-w-0 flex-1 items-center justify-between transition-opacity duration-300',
                collapsed ? 'opacity-0' : 'opacity-100',
              )}
            >
              <TierBadge tier={tier} devMode={isDevMode} size='sm' />
              {tier === 'free' && (
                <Link
                  href={ROUTES.SETTINGS_BILLING}
                  onClick={(e) => handleNavClick(e, ROUTES.SETTINGS_BILLING)}
                  tabIndex={collapsed ? -1 : 0}
                >
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-6 px-2 text-xs font-medium border-border text-[#4A5568] hover:bg-primary hover:text-white hover:border-primary transition-colors'
                  >
                    Upgrade
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Links — no divider lines, groups separated by labels + spacing */}
        <nav className='flex-1 py-2'>
          {/* Dashboard standalone */}
          <SidebarItem
            key={GROUPED_NAVIGATION.dashboard.href}
            href={GROUPED_NAVIGATION.dashboard.href}
            label={GROUPED_NAVIGATION.dashboard.label}
            icon={GROUPED_NAVIGATION.dashboard.icon}
            isActive={pathname === GROUPED_NAVIGATION.dashboard.href}
            collapsed={collapsed}
            onBeforeNavigate={(e) => handleNavClick(e, GROUPED_NAVIGATION.dashboard.href)}
          />

          {/* Grouped navigation — label creates separation, no lines */}
          {GROUPED_NAVIGATION.groups.map(({ config, items }) => (
            <div key={config.key} className="mt-4">
              {/* Group label — only in expanded; collapsed uses the mt-4 gap */}
              {!collapsed && (
                <div className="px-2 mb-1">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[#8896A7]">
                    {config.label}
                  </span>
                </div>
              )}
              <div className="space-y-px">
                {items.map(({ href, label, icon }) => {
                  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                  return (
                    <SidebarItem
                      key={href}
                      href={href}
                      label={label}
                      icon={icon}
                      isActive={isActive}
                      collapsed={collapsed}
                      onBeforeNavigate={(e) => handleNavClick(e, href)}
                    />
                  )
                })}
              </div>
            </div>
          ))}

          {isAdmin && (
            <div className="mt-4">
              <SidebarItem
                href={ROUTES.SETTINGS_DEVELOPER}
                label='Dev Settings'
                icon={ShieldCheck}
                isActive={pathname === ROUTES.SETTINGS_DEVELOPER}
                collapsed={collapsed}
                onBeforeNavigate={(e) =>
                  handleNavClick(e, ROUTES.SETTINGS_DEVELOPER)
                }
              />
            </div>
          )}
        </nav>
      </div>

      {/* 4. Footer Area (Settings + Theme Toggle) */}
      <div className='border-t border-border px-3 py-2'>
        <SidebarItem
          href={GROUPED_NAVIGATION.settings.href}
          label={GROUPED_NAVIGATION.settings.label}
          icon={GROUPED_NAVIGATION.settings.icon}
          isActive={pathname === GROUPED_NAVIGATION.settings.href || pathname.startsWith(GROUPED_NAVIGATION.settings.href)}
          collapsed={collapsed}
          onBeforeNavigate={(e) => handleNavClick(e, GROUPED_NAVIGATION.settings.href)}
        />
        <div
          className={cn(
            'flex pt-1 transition-all duration-300',
            collapsed ? 'justify-center' : 'justify-start px-2',
          )}
        >
          <ThemeToggle />
        </div>
      </div>

      {/* Leave Session Dialog (Unchanged) */}
      {mode && (
        <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
          <DialogContent
            showCloseButton={false}
            className='sm:max-w-[380px] bg-white border-border'
          >
            <DialogTitle className='text-[#1A2332]'>
              Are you sure you want to exit?
            </DialogTitle>
            <DialogDescription className='text-[#4A5568]'>
              Your progress in this {mode === 'review' ? 'review' : 'quiz'} will
              not be saved. You can come back anytime.
            </DialogDescription>
            <DialogFooter className='mt-4 gap-2 border-t border-border bg-[#F8F7F5] p-4 sm:flex-row'>
              <Button
                variant='outline'
                onClick={() => setLeaveDialogOpen(false)}
                className='flex-1 sm:flex-initial border-border text-[#1A2332] hover:bg-white'
              >
                No, stay
              </Button>
              <Button
                variant='destructive'
                onClick={handleConfirmLeave}
                className='flex-1 sm:flex-initial bg-[#D64545] hover:bg-[#D64545]/90 text-white'
              >
                Yes, exit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </aside>
  )
}
