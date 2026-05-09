'use client'

import { useCallback, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSidebar } from './SidebarProvider'
import { SidebarHeader } from './SidebarHeader'
import { SidebarNavItem } from './SidebarNavItem'
import { SidebarFooterNotice, type SidebarFooterNoticeData } from './SidebarFooterNotice'
import { SIDEBAR_GROUPS, DASHBOARD_ITEM, SETTINGS_ITEM } from './sidebar-constants'
import {
  SIDEBAR_ICON_SLOT,
  SIDEBAR_PADDING,
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
  TRANSITION,
} from './types'
import type { SidebarProps } from './types'
import { useActiveSession } from '@/lib/context/active-session-context'
import { ConfirmModal as ConfirmDialog } from '@/components/ui/modal'
import { cn } from '@/lib/utils'
import { useNavigationPending } from '@/hooks/useNavigationPending'
import { useQuizStore } from '@/stores/useQuizStore'
import { updateSessionProgress } from '@/lib/actions/quiz-v2'

// ---------------------------------------------------------------------------
// Sidebar — structural nav shell for push layout
// 52px collapsed, 256px expanded, CSS transitions only
// ---------------------------------------------------------------------------

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return ''
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const SIDEBAR_FOOTER_NOTICE_PREVIEW: SidebarFooterNoticeData | null = {
  kind: 'subscription-expiring',
  title: 'Subscription ends soon',
  description: 'Renew to keep full access.',
}

export const Sidebar = ({ userDisplay, tier, isAdmin: _isAdmin, isDevMode: _isDevMode }: SidebarProps) => {
  const { expanded, collapse, expand, sidebarRef, toggleRef, prefersReducedMotion, isLocked } = useSidebar()
  const pathname = usePathname()
  const router = useRouter()
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [pendingHref, setPendingHref] = useState<string | null>(null)
  const [leaveConfirmLoading, setLeaveConfirmLoading] = useState(false)
  const navigationPending = useNavigationPending()
  const userInitials = getInitials(userDisplay.name)

  // Active session guard (provider is always present in dashboard layout)
  const { activeSession } = useActiveSession()

  const handleCollapse = useCallback(() => {
    collapse()
  }, [collapse])

  const handleNavMouseDown = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
  }, [])

  const handleNavigate = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (activeSession) {
        e.preventDefault()
        const href = e.currentTarget.getAttribute('href') ?? '/'
        setPendingHref(href)
        setShowLeaveConfirm(true)
      }
    },
    [activeSession],
  )

  const handleLeaveConfirm = useCallback(async () => {
    const href = pendingHref
    const { sessionId, currentIndex, reset } = useQuizStore.getState()

    setLeaveConfirmLoading(true)
    try {
      if (sessionId) {
        await updateSessionProgress(sessionId, currentIndex)
      }
    } catch {
      // Preserve navigation even if the latest index was already saved or the user is offline.
    } finally {
      reset()
      setLeaveConfirmLoading(false)
      setPendingHref(null)
      if (href) router.push(href)
    }
  }, [pendingHref, router])

  const handleToggle = useCallback(() => {
    if (expanded) {
      handleCollapse()
    } else {
      expand()
    }
  }, [expanded, handleCollapse, expand])

  // Sidebar visual reveal uses clip-path; the layout column snaps separately in SidebarDesktopLayout.
  const clippedWidth = SIDEBAR_WIDTH_EXPANDED - SIDEBAR_WIDTH_COLLAPSED
  const sidebarStyle: React.CSSProperties = prefersReducedMotion
    ? {
      width: SIDEBAR_WIDTH_EXPANDED,
      clipPath: expanded ? 'inset(0 0 0 0)' : `inset(0 ${clippedWidth}px 0 0)`,
    }
    : {
      width: SIDEBAR_WIDTH_EXPANDED,
      clipPath: expanded ? 'inset(0 0 0 0)' : `inset(0 ${clippedWidth}px 0 0)`,
      transition: `clip-path ${expanded ? `${TRANSITION.expandDuration}ms ${TRANSITION.expandEasing}` : `${TRANSITION.collapseDuration}ms ${TRANSITION.collapseEasing}`}`,
    }

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  const sidebarPaddingStyle = { paddingInline: SIDEBAR_PADDING }
  const dividerInsetStyle: React.CSSProperties = expanded
    ? { left: 0, right: 0 }
    : { left: SIDEBAR_PADDING, width: SIDEBAR_ICON_SLOT }

  return (
    <>
      <ConfirmDialog
        open={showLeaveConfirm}
        onOpenChange={setShowLeaveConfirm}
        title="Leave quiz?"
        description="Your saved answers will remain. You can resume this session later."
        confirmLabel="Resume later"
        cancelLabel="Stay in quiz"
        onConfirm={handleLeaveConfirm}
        loading={leaveConfirmLoading}
      />

      {/* Sidebar nav shell — structural flex child, displaces content */}
      <nav
        ref={sidebarRef as React.RefObject<HTMLElement>}
        aria-label="Main navigation"
        onMouseDown={handleNavMouseDown}
        style={{
          position: 'relative',
          zIndex: 20,
          flexShrink: 0,
          height: '100dvh',
          flexDirection: 'column',
          overflow: 'hidden',
          contain: 'layout paint style',
          willChange: 'clip-path',
          transform: 'translateZ(0)',
          ...sidebarStyle,
        }}
        className="hidden bg-white lg:flex lg:flex-col"
      >
        {isLocked && (
          <div
            className="absolute inset-0 z-[60] bg-white/40 backdrop-blur-[1px] cursor-not-allowed animate-in fade-in duration-200"
            aria-hidden="true"
          />
        )}
        <SidebarHeader
          expanded={expanded}
          tier={tier}
          onToggle={handleToggle}
          toggleRef={toggleRef}
        />

        {/* Scrollable body */}
        <div
          style={{ padding: 0 }}
          className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* Profile summary — replaces the former standalone Dashboard slot. */}
          <div
            className="relative flex h-[72px] shrink-0 items-center xl:h-[76px]"
            style={sidebarPaddingStyle}
            aria-label={userDisplay.name}
            title={userDisplay.name}
          >
            <div
              aria-hidden="true"
              className="absolute bottom-0 border-b border-border"
              style={dividerInsetStyle}
            />
            <div className="grid h-10 w-full grid-cols-[48px_minmax(0,1fr)] items-center gap-1 overflow-hidden rounded-md">
              <div className="flex h-10 w-12 shrink-0 items-center justify-center">
                <div
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full',
                    !userDisplay.avatarUrl && 'bg-gradient-to-br from-camp-cobalt to-primary-400',
                  )}
                >
                  {userDisplay.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={userDisplay.avatarUrl}
                      alt={userDisplay.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="select-none text-[12px] font-semibold leading-none text-white">
                      {userInitials}
                    </span>
                  )}
                </div>
              </div>
              <div
                aria-hidden={!expanded}
                className={cn(
                  'min-w-0 overflow-hidden transition-[opacity,transform] duration-[180ms] ease-out motion-reduce:transition-none motion-reduce:transform-none',
                  expanded ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-1 opacity-0',
                )}
              >
                <p className="truncate text-[12.5px] font-medium leading-none text-gray-900">
                  {userDisplay.name}
                </p>
              </div>
            </div>
          </div>

          {/* Nav groups */}
          <div className="flex flex-col gap-3 pt-3" style={sidebarPaddingStyle}>
            <div className="flex flex-col gap-1">
              <SidebarNavItem
                item={DASHBOARD_ITEM}
                isActive={isActive(DASHBOARD_ITEM.href, true)}
                expanded={expanded}
                showTooltip
                onNavigate={handleNavigate}
                navigationPending={navigationPending}
              />
            </div>
            {SIDEBAR_GROUPS.map((group, groupIdx) => (
              <div key={group.key} className="flex flex-col gap-1">
                {/* Group header slot stays mounted at the same height in both states.
                    Only opacity changes, so section labels never push icon rows. */}
                <div className="relative flex h-5 items-center overflow-hidden">
                  <span
                    aria-hidden={!expanded}
                    className={cn(
                      'px-2 text-[8px] font-bold tracking-wider text-text-tertiary uppercase select-none',
                      'transition-[opacity,transform] duration-[180ms] ease-out motion-reduce:transition-none motion-reduce:transform-none',
                      expanded ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-1 opacity-0',
                    )}
                  >
                    {group.label}
                  </span>
                  {!expanded && groupIdx > 0 && (
                    <div
                      aria-hidden="true"
                      className="absolute left-0 top-1/2 w-12 border-t border-border/40"
                    />
                  )}
                </div>
                {group.items.map((navItem) => (
                  <SidebarNavItem
                    key={navItem.id}
                    item={navItem}
                    isActive={isActive(navItem.href)}
                    expanded={expanded}
                    showTooltip
                    onNavigate={handleNavigate}
                    navigationPending={navigationPending}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Flex spacer — absorbs remaining space */}
          <div className="flex-1" />
        </div>

        {/* Sidebar footer — half-height counterpart to the image header; settings anchors the bottom. */}
        <div
          className="relative h-[144px] shrink-0 p-2"
        >
          <div
            className="flex h-full flex-col justify-between overflow-hidden rounded-md border border-gray-200 bg-gray-100 p-2 transition-[width] duration-[180ms] ease-out motion-reduce:transition-none"
            style={{ width: expanded ? SIDEBAR_WIDTH_EXPANDED - SIDEBAR_PADDING * 2 : SIDEBAR_ICON_SLOT }}
          >
            <SidebarFooterNotice expanded={expanded} notice={SIDEBAR_FOOTER_NOTICE_PREVIEW} />
            <Link
              href={SETTINGS_ITEM.href}
              onClick={handleNavigate}
              aria-current={isActive(SETTINGS_ITEM.href) ? 'page' : undefined}
              aria-label={expanded ? undefined : SETTINGS_ITEM.label}
              className={cn(
                'group relative grid h-8 w-full grid-cols-[32px_minmax(0,1fr)] items-center overflow-hidden rounded-sm outline-none',
                'text-gray-500 transition-colors duration-[120ms] ease-out hover:bg-white/70 hover:text-primary',
                'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-camp-cobalt',
                isActive(SETTINGS_ITEM.href) && 'bg-white/70 text-primary',
              )}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center">
                <SETTINGS_ITEM.icon size={16} weight="regular" className="shrink-0" />
              </span>
              <span
                aria-hidden={!expanded}
                className={cn(
                  'min-w-0 truncate whitespace-nowrap text-[12.5px] leading-none transition-[opacity,transform] duration-[180ms] ease-out motion-reduce:transition-none motion-reduce:transform-none',
                  isActive(SETTINGS_ITEM.href) ? 'font-medium' : 'font-normal',
                  expanded ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-1 opacity-0',
                )}
              >
                {SETTINGS_ITEM.label}
              </span>
            </Link>
          </div>
        </div>

      </nav>
    </>
  )
}
