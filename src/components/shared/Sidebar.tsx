'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { TransitionLink } from '@/components/shared/TransitionLink'
import {
  LayoutDashboard,
  BarChart3,
  Box,
  Settings,
  Shield,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  FileText,
  Zap,
  Crown,
  Globe,
  FlaskConical,
  Brain,
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
import { siteConfig } from '@/lib/constants/site'

const NAV_ITEMS = [
  { href: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { href: ROUTES.WIKI, label: 'Wiki', icon: Globe },
  { href: ROUTES.NOTES, label: 'Notes', icon: FileText },
  { href: ROUTES.TESTING, label: 'Testing', icon: Brain },
  { href: ROUTES.THREE_D_LAB, label: '3D Lab', icon: Box },
  { href: ROUTES.ANALYTICS, label: 'Analytics', icon: BarChart3 },
  { href: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
]

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
}

/** Single padding for the entire sidebar content column so icons are in the exact same position expanded/collapsed. */
const SIDEBAR_CONTENT_PX = 'px-4'
/** Fixed icon column: same size and position for tier, exam, nav in both states. */
const SIDEBAR_ICON_BOX = 'flex h-5 w-5 shrink-0 items-center justify-center'
const SIDEBAR_ICON_SIZE = 'h-5 w-5'

export function Sidebar({
  isAdmin,
  isDevMode = false,
  userDisplay,
  tier = 'free',
}: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { activeSession: mode } = useActiveSession()
  const [collapsed, setCollapsed] = useState(false)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [leaveTarget, setLeaveTarget] = useState<string>(ROUTES.DASHBOARD)
  const displayName = userDisplay?.name ?? 'User'
  const initials = getInitials(displayName)

  // Read persisted collapsed state on the client after initial hydration to avoid SSR/client mismatch.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('cerebro_sidebar_collapsed')
      if (stored === 'true') setCollapsed(true)
      if (stored === 'false') setCollapsed(false)
    } catch {
      // Ignore read errors (e.g. disabled storage)
    }
  }, [])

  function handleNavClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    if (mode && href !== pathname) {
      e.preventDefault()
      setLeaveTarget(href)
      setLeaveDialogOpen(true)
    }
  }

  function handleConfirmLeave() {
    setLeaveDialogOpen(false)
    router.push(
      mode === 'review' ? `${ROUTES.TESTING}?tab=review&exited=1` : leaveTarget,
    )
  }

  function toggleCollapse() {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('cerebro_sidebar_collapsed', String(next))
      return next
    })
  }

  return (
    <aside
      className={`hidden lg:flex lg:flex-col lg:border-r lg:border-border/40 lg:bg-sidebar transition-all duration-300 ease-in-out ${
        collapsed ? 'lg:w-[68px]' : 'lg:w-[260px]'
      }`}
    >
      {/* Header — same padding as content column */}
      <div
        className={`flex h-14 items-center border-b border-border/40 ${SIDEBAR_CONTENT_PX} ${collapsed ? 'justify-end' : 'justify-between'}`}
      >
        {!collapsed && (
          <div className='flex items-center gap-2'>
            <Link
              href={ROUTES.DASHBOARD}
              className='text-lg font-semibold tracking-tight text-foreground'
              onClick={(e) => handleNavClick(e, '/dashboard')}
            >
              {siteConfig.name}
            </Link>
          </div>
        )}
        <button
          onClick={toggleCollapse}
          className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground'
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeftOpen className='h-4 w-4' strokeWidth={1.5} />
          ) : (
            <PanelLeftClose className='h-4 w-4' strokeWidth={1.5} />
          )}
        </button>
      </div>

      {/* One content column: same px-4 in both states so every icon sits at the same horizontal position */}
      <div className={`flex flex-1 flex-col ${SIDEBAR_CONTENT_PX}`}>
        {/* User profile — same left alignment when collapsed so no movement on expand */}
        <div
          className={`border-b border-border/40 py-3 ${collapsed ? 'flex justify-start' : ''}`}
        >
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={ROUTES.SETTINGS}
                  className='inline-flex shrink-0 items-center justify-start py-2'
                  aria-label='Settings'
                  onClick={(e) => handleNavClick(e, ROUTES.SETTINGS)}
                >
                  <Avatar className='size-9'>
                    {userDisplay?.avatarUrl ? (
                      <AvatarImage src={userDisplay.avatarUrl} alt='' />
                    ) : null}
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </Link>
              </TooltipTrigger>
              <TooltipContent side='right' sideOffset={8}>
                {displayName}
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className='flex items-center gap-3 rounded-xl py-2'>
              <Link
                href={ROUTES.SETTINGS}
                className='shrink-0 rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                onClick={(e) => handleNavClick(e, ROUTES.SETTINGS)}
              >
                <Avatar className='size-9'>
                  {userDisplay?.avatarUrl ? (
                    <AvatarImage src={userDisplay.avatarUrl} alt='' />
                  ) : null}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Link>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-medium text-foreground'>
                  {displayName}
                </p>
                {/* <Link
                  href={ROUTES.SETTINGS}
                  className='flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground'
                  onClick={(e) => handleNavClick(e, ROUTES.SETTINGS)}
                >
                  <User className='h-3.5 w-3.5' strokeWidth={1.5} />
                  Settings
                </Link> */}
              </div>
            </div>
          )}
        </div>

        {/* Plan indicator + upgrade CTA — fixed icon column so tier aligns with nav */}
        <div className='border-b border-border/40 p-2  h-[56px] flex items-center justify-start'>
          {collapsed ? (
            tier === 'free' ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={ROUTES.SETTINGS_BILLING}
                    className='flex items-center justify-start py-2'
                    aria-label='Upgrade to Pro'
                    onClick={(e) => handleNavClick(e, ROUTES.SETTINGS_BILLING)}
                  >
                    <div className={SIDEBAR_ICON_BOX}>
                      <Sparkles
                        className={`${SIDEBAR_ICON_SIZE} text-color-signal-amber`}
                        strokeWidth={1.5}
                      />
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side='right' sideOffset={8}>
                  Upgrade to Pro
                </TooltipContent>
              </Tooltip>
            ) : (
              <div
                className='flex justify-start py-2'
                title={`${tier.charAt(0).toUpperCase() + tier.slice(1)}${isDevMode ? '*' : ''}`}
              >
                <div className={SIDEBAR_ICON_BOX}>
                  {tier === 'pro' ? (
                    <Zap
                      className={`${SIDEBAR_ICON_SIZE} text-color-signal-blue`}
                      strokeWidth={1.5}
                    />
                  ) : (
                    <Crown
                      className={`${SIDEBAR_ICON_SIZE} text-color-result-gold`}
                      strokeWidth={1.5}
                    />
                  )}
                </div>
              </div>
            )
          ) : (
            <div className=' '>
              <div className='flex min-w-0 items-center gap-2'>
                <div className={SIDEBAR_ICON_BOX}>
                  {tier === 'free' ? (
                    <Sparkles
                      className={`${SIDEBAR_ICON_SIZE} text-color-signal-amber`}
                      strokeWidth={1.5}
                    />
                  ) : tier === 'pro' ? (
                    <Zap
                      className={`${SIDEBAR_ICON_SIZE} text-color-signal-blue`}
                      strokeWidth={1.5}
                    />
                  ) : (
                    <Crown
                      className={`${SIDEBAR_ICON_SIZE} text-color-result-gold`}
                      strokeWidth={1.5}
                    />
                  )}
                </div>
                <TierBadge tier={tier} devMode={isDevMode} size='sm' />
              </div>
              {tier === 'free' && (
                <Link
                  href={ROUTES.SETTINGS_BILLING}
                  onClick={(e) => handleNavClick(e, ROUTES.SETTINGS_BILLING)}
                >
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-7 gap-1 text-[11px] px-2'
                  >
                    <Sparkles className='h-3 w-3' strokeWidth={1.5} />
                    Upgrade
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className='flex-1 space-y-1 py-4'>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href ||
              (href !== '/dashboard' && pathname.startsWith(href))

            const link = (
              <TransitionLink
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl p-2 text-[13px] transition-all truncate ${
                  collapsed ? 'justify-start' : ''
                } ${
                  isActive
                    ? 'bg-secondary font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                }`}
                onBeforeNavigate={(e) => handleNavClick(e, href)}
              >
                <div className={SIDEBAR_ICON_BOX}>
                  <Icon className={SIDEBAR_ICON_SIZE} strokeWidth={1.5} />
                </div>
                {!collapsed && label}
              </TransitionLink>
            )

            if (collapsed) {
              return (
                <Tooltip key={href}>
                  <TooltipTrigger
                    render={<span className='block'>{link}</span>}
                  />
                  <TooltipContent side='right' sideOffset={8}>
                    {label}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return link
          })}

          {isAdmin && (
            <>
              <div className='my-2 border-t border-border/40' />
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <span className='block'>
                        <TransitionLink
                          href={ROUTES.SETTINGS_DEVELOPER}
                          className={`flex items-center gap-3 rounded-xl p-2 text-[13px] transition-all ${
                            collapsed ? 'justify-start' : ''
                          } ${
                            pathname === ROUTES.SETTINGS_DEVELOPER
                              ? 'bg-color-signal-amber/10 font-medium text-color-signal-amber'
                              : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                          }`}
                          onBeforeNavigate={(e) =>
                            handleNavClick(e, ROUTES.SETTINGS_DEVELOPER)
                          }
                        >
                          <div className={SIDEBAR_ICON_BOX}>
                            <Shield
                              className={SIDEBAR_ICON_SIZE}
                              strokeWidth={1.5}
                            />
                          </div>
                        </TransitionLink>
                      </span>
                    }
                  />
                  <TooltipContent side='right' sideOffset={8}>
                    Dev Settings
                  </TooltipContent>
                </Tooltip>
              ) : (
                <TransitionLink
                  href={ROUTES.SETTINGS_DEVELOPER}
                  className={`flex items-center gap-3 rounded-xl p-2 text-[13px] transition-all truncate ${
                    pathname === ROUTES.SETTINGS_DEVELOPER
                      ? 'bg-color-signal-amber/10 font-medium text-color-signal-amber'
                      : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                  }`}
                  onBeforeNavigate={(e) =>
                    handleNavClick(e, ROUTES.SETTINGS_DEVELOPER)
                  }
                >
                  <div className={SIDEBAR_ICON_BOX}>
                    <Shield className={SIDEBAR_ICON_SIZE} strokeWidth={1.5} />
                  </div>
                  Dev Settings
                </TransitionLink>
              )}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className='border-t border-border/40 py-2'>
          <div
            className={`flex items-center gap-1 ${collapsed ? 'justify-start py-2' : 'justify-end py-2'}`}
          >
            <ThemeToggle />
          </div>
        </div>
      </div>
      {/* end content column */}

      {mode && (
        <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
          <DialogContent showCloseButton={false} className='sm:max-w-[380px]'>
            <DialogTitle>Are you sure you want to exit?</DialogTitle>
            <DialogDescription>
              Your progress in this {mode === 'review' ? 'review' : 'quiz'} will
              not be saved. You can come back anytime.
            </DialogDescription>
            <DialogFooter className='mt-4 gap-2 border-t border-border bg-muted/30 p-4 sm:flex-row'>
              <Button
                variant='outline'
                onClick={() => setLeaveDialogOpen(false)}
                className='flex-1 sm:flex-initial'
              >
                No, stay
              </Button>
              <Button
                variant='destructive'
                onClick={handleConfirmLeave}
                className='flex-1 sm:flex-initial'
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
