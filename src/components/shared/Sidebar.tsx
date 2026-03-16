'use client'

import { useState, useEffect, type ComponentType, type SVGProps } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { TransitionLink } from '@/components/shared/TransitionLink'
import {
  Shield,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Zap,
  Crown,
} from 'lucide-react'
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
import { SIDEBAR_NAVIGATION } from '@/lib/routes'
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
const ICON_BOX = 'flex h-8 w-8 shrink-0 items-center justify-center'
const ICON_SIZE = 'h-[18px] w-[18px]'

/** * Premium Collapsed Logomark
 */
const Logomark = () => (
  <div className='flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm'>
    <span className='font-serif font-bold text-lg leading-none mt-0.5'>S</span>
  </div>
)

interface SidebarItemProps {
  href: string
  label: string
  icon?: ComponentType<SVGProps<SVGSVGElement>>
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
    'relative flex items-center gap-3 px-2 py-1.5 text-sm rounded-md transition-colors duration-200 outline-none w-full justify-start overflow-hidden'

  const stateClasses = isActive
    ? 'text-blue-600 font-semibold bg-blue-50'
    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'

  const link = (
    <TransitionLink
      href={href}
      className={cn(baseClasses, stateClasses)}
      onBeforeNavigate={onBeforeNavigate}
    >
      {/* Dieter Rams Active Indicator */}
      {isActive && (
        <div className='absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-[16px] bg-blue-600 rounded-r-full' />
      )}

      <div className={ICON_BOX}>
        {Icon ? (
          <Icon
            className={cn(
              ICON_SIZE,
              isActive ? 'text-blue-600' : 'text-gray-500',
            )}
            strokeWidth={isActive ? 2 : 1.75}
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
          className='bg-blue-500 text-zinc-50 font-medium text-xs'
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
      mode === 'review' ? `${ROUTES.TESTING}?tab=review&exited=1` : leaveTarget,
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
        'hidden lg:flex lg:flex-col border-r border-border transition-[width] duration-300 ease-in-out overflow-hidden shrink-0',
        collapsed ? 'w-[72px]' : 'w-[260px]',
        'bg-white',
        'z-10',
      )}
    >
      {/* 1. Logo Area (Stays perfectly static at the top) */}
      <div
        className={cn(
          'flex h-16 items-center border-b border-border shrink-0 transition-all duration-300',
          collapsed ? 'justify-center' : 'justify-start px-5',
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
          'flex items-center border-b border-border shrink-0 py-1.5 transition-all duration-300',
          collapsed ? 'justify-center' : 'justify-end px-3',
        )}
      >
        <button
          onClick={toggleCollapse}
          className='flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 outline-none'
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeftOpen className='h-[18px] w-[18px]' strokeWidth={1.5} />
          ) : (
            <PanelLeftClose className='h-[18px] w-[18px]' strokeWidth={1.5} />
          )}
        </button>
      </div>

      {/* 3. Main Content Area */}
      <div className='flex flex-1 flex-col px-3 overflow-y-auto overflow-x-hidden pb-4'>
        {/* User Profile Area */}
        <div className='border-b border-border py-3'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={ROUTES.SETTINGS}
                className='flex items-center justify-start gap-3 px-2 py-1.5 rounded-md transition-colors hover:bg-gray-100 outline-none'
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
                    <AvatarFallback className='bg-gray-100 text-xs font-medium text-gray-900'>
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
                  <p className='truncate text-[13px] font-medium text-zinc-900'>
                    {displayName}
                  </p>
                </div>
                </Link>
                </TooltipTrigger>
                {collapsed && (
                <TooltipContent
                side='right'
                sideOffset={12}
                className='bg-slatecamp-ink-main text-slatecamp-paper font-medium text-xs'
                >
                {displayName} (Settings)
                </TooltipContent>
                )}
                </Tooltip>
                </div>
        {/* Tier & Plan Area */}
        <div className='border-b border-border py-3'>
          <div className='flex items-center justify-start gap-3 px-2'>
            <div className={ICON_BOX}>
              {tier === 'free' ? (
                <Sparkles
                  className={cn(ICON_SIZE, 'text-amber-600')}
                  strokeWidth={1.5}
                />
              ) : tier === 'camp' || tier === 'insurance' ? (
                <Zap
                  className={cn(
                    ICON_SIZE,
                    tier === 'camp' ? 'text-blue-600' : 'text-indigo-600',
                  )}
                  strokeWidth={1.5}
                />
              ) : (
                <Crown
                  className={cn(ICON_SIZE, 'text-amber-500')}
                  strokeWidth={1.5}
                />
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
                    className='h-6 px-2 text-xs font-medium border-border text-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors'
                  >
                    Upgrade
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className='flex-1 space-y-1 py-4'>
          {SIDEBAR_NAVIGATION.map(({ href, label, icon }) => {
            const isActive =
              pathname === href ||
              (href !== '/dashboard' && pathname.startsWith(href))
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

          {isAdmin && (
            <>
              <div className='my-3 border-t border-border' />
              <SidebarItem
                href={ROUTES.SETTINGS_DEVELOPER}
                label='Dev Settings'
                icon={Shield}
                isActive={pathname === ROUTES.SETTINGS_DEVELOPER}
                collapsed={collapsed}
                onBeforeNavigate={(e) =>
                  handleNavClick(e, ROUTES.SETTINGS_DEVELOPER)
                }
              />
            </>
          )}
        </nav>
      </div>

      {/* 4. Footer Area (Theme Toggle) */}
      <div className='border-t border-border p-3'>
        <div
          className={cn(
            'flex transition-all duration-300',
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
            <DialogTitle className='text-zinc-900'>
              Are you sure you want to exit?
            </DialogTitle>
            <DialogDescription className='text-zinc-600'>
              Your progress in this {mode === 'review' ? 'review' : 'quiz'} will
              not be saved. You can come back anytime.
            </DialogDescription>
            <DialogFooter className='mt-4 gap-2 border-t border-border bg-gray-50 p-4 sm:flex-row'>
              <Button
                variant='outline'
                onClick={() => setLeaveDialogOpen(false)}
                className='flex-1 sm:flex-initial border-border text-gray-900 hover:bg-white'
              >
                No, stay
              </Button>
              <Button
                variant='destructive'
                onClick={handleConfirmLeave}
                className='flex-1 sm:flex-initial bg-red-600 hover:bg-red-700 text-white'
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
