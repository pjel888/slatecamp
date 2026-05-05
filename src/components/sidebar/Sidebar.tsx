'use client'

import { useCallback, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSidebar } from './SidebarProvider'
import { SidebarHeader } from './SidebarHeader'
import { SidebarNavItem } from './SidebarNavItem'
import { SidebarFooter } from './SidebarFooter'
import { SIDEBAR_GROUPS, DASHBOARD_ITEM, SETTINGS_ITEM } from './sidebar-constants'
import {
  SIDEBAR_PADDING,
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
  TRANSITION,
} from './types'
import type { SidebarProps } from './types'
import { useActiveSession } from '@/lib/context/active-session-context'
import { ConfirmDialog } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useNavigationPending } from '@/hooks/useNavigationPending'
import { useQuizStore } from '@/stores/useQuizStore'
import { updateSessionProgress } from '@/lib/actions/quiz-v2'

// ---------------------------------------------------------------------------
// Sidebar — structural nav shell for push layout
// 52px collapsed, 256px expanded, CSS transitions only
// ---------------------------------------------------------------------------

export const Sidebar = ({ userDisplay, tier, isAdmin: _isAdmin, isDevMode: _isDevMode }: SidebarProps) => {
  const { expanded, collapse, expand, sidebarRef, toggleRef, prefersReducedMotion, isLocked } = useSidebar()
  const pathname = usePathname()
  const router = useRouter()
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [pendingHref, setPendingHref] = useState<string | null>(null)
  const [leaveConfirmLoading, setLeaveConfirmLoading] = useState(false)
  const navigationPending = useNavigationPending()

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
  const dashboardRegionStyle = {
    paddingInline: SIDEBAR_PADDING,
  }

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
          {/* Dashboard — standalone; bottom rule aligns with HeaderHero bottom edge. */}
          <div
            className="flex h-[72px] shrink-0 items-center border-b border-border xl:h-[76px]"
            style={dashboardRegionStyle}
          >
            <SidebarNavItem
              item={DASHBOARD_ITEM}
              isActive={isActive(DASHBOARD_ITEM.href, true)}
              expanded={expanded}
              showTooltip
              onNavigate={handleNavigate}
              navigationPending={navigationPending}
            />
          </div>

          {/* Nav groups */}
          <div className="flex flex-col gap-3 pt-3" style={sidebarPaddingStyle}>
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
                      className="absolute inset-x-1 top-1/2 border-t border-border/40"
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

        {/* Settings — pinned above footer, outside scrollable body for spatial lock */}
        <div className="shrink-0 pb-3" style={sidebarPaddingStyle}>
          <SidebarNavItem
            item={SETTINGS_ITEM}
            isActive={isActive(SETTINGS_ITEM.href)}
            expanded={expanded}
            showTooltip
            onNavigate={handleNavigate}
            navigationPending={navigationPending}
          />
        </div>

        <SidebarFooter
          expanded={expanded}
          userDisplay={userDisplay}
          tier={tier}
        />
      </nav>
    </>
  )
}
