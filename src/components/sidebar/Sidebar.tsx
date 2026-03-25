'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSidebar } from './SidebarProvider'
import { SidebarHeader } from './SidebarHeader'
import { SidebarNavItem } from './SidebarNavItem'
import { SidebarFooter } from './SidebarFooter'
import { SIDEBAR_GROUPS, DASHBOARD_ITEM, SETTINGS_ITEM } from './sidebar-constants'
import {
  Z_INDEX,
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
  TRANSITION,
} from './types'
import type { SidebarProps } from './types'
import { useActiveSession } from '@/lib/context/active-session-context'
import { ConfirmDialog } from '@/components/ui/dialog'

// ---------------------------------------------------------------------------
// Sidebar — unified fixed nav shell (replaces SidebarShell + SidebarRail + SidebarOverlay)
// Spec: HTML v4 locked layout. 52px collapsed, 216px expanded, CSS transitions only.
// ---------------------------------------------------------------------------

export const Sidebar = ({ userDisplay, tier, isAdmin, isDevMode }: SidebarProps) => {
  const { expanded, collapse, expand, toggle, sidebarRef, toggleRef, prefersReducedMotion } = useSidebar()
  const pathname = usePathname()
  const router = useRouter()
  const collapsingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isCollapsing = useRef(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  // Track collapsing state for CSS class (faster easing during collapse)
  useEffect(() => {
    if (collapsingTimerRef.current) {
      clearTimeout(collapsingTimerRef.current)
      collapsingTimerRef.current = null
    }

    if (!expanded && isCollapsing.current) {
      // Already set collapsing — wait for duration then clear
      collapsingTimerRef.current = setTimeout(() => {
        isCollapsing.current = false
        // Force a re-render isn't needed — the CSS class is managed via DOM ref directly
        const el = sidebarRef.current as HTMLElement | null
        if (el) el.removeAttribute('data-collapsing')
      }, TRANSITION.collapseDuration)
    }
  }, [expanded, sidebarRef])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (collapsingTimerRef.current) {
        clearTimeout(collapsingTimerRef.current)
      }
    }
  }, [])

  // Active session guard (provider is always present in dashboard layout)
  const { activeSession } = useActiveSession()

  const handleCollapse = useCallback(() => {
    // Mark collapsing for CSS easing switch
    const el = sidebarRef.current as HTMLElement | null
    if (el) el.setAttribute('data-collapsing', '')
    isCollapsing.current = true

    if (collapsingTimerRef.current) clearTimeout(collapsingTimerRef.current)
    collapsingTimerRef.current = setTimeout(() => {
      if (el) el.removeAttribute('data-collapsing')
      isCollapsing.current = false
    }, TRANSITION.collapseDuration)

    collapse()
  }, [collapse, sidebarRef])

  const handleBackdropMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault()
      handleCollapse()
    },
    [handleCollapse],
  )

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
        return
      }
      // Collapse on navigate (overlay pattern)
      if (expanded) handleCollapse()
    },
    [activeSession, expanded, handleCollapse],
  )

  const handleLeaveConfirm = useCallback(() => {
    if (pendingHref) router.push(pendingHref)
    setPendingHref(null)
    if (expanded) handleCollapse()
  }, [pendingHref, router, expanded, handleCollapse])

  const handleToggle = useCallback(() => {
    if (expanded) {
      handleCollapse()
    } else {
      expand()
    }
  }, [expanded, handleCollapse, expand])

  // Inline style: expand/collapse width transition
  const sidebarStyle: React.CSSProperties = prefersReducedMotion
    ? {
        width: expanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED,
      }
    : {
        width: expanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED,
        transition: `width ${expanded ? `${TRANSITION.expandDuration}ms ${TRANSITION.expandEasing}` : `${TRANSITION.collapseDuration}ms ${TRANSITION.collapseEasing}`}`,
      }

  // data-collapsing overrides transition inline — handled via DOM ref in handleCollapse
  // CSS in global styles picks up [data-collapsing] to use collapse easing

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      <ConfirmDialog
        open={showLeaveConfirm}
        onOpenChange={setShowLeaveConfirm}
        title="Leave active session?"
        description="You have an active session. Are you sure you want to leave?"
        confirmLabel="Leave"
        cancelLabel="Stay"
        onConfirm={handleLeaveConfirm}
      />

      {/* Sidebar nav shell */}
      <nav
        ref={sidebarRef as React.RefObject<HTMLElement>}
        aria-label="Main navigation"
        onMouseDown={handleNavMouseDown}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100dvh',
          zIndex: Z_INDEX.sidebar,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRight: '1px solid var(--border)',
          boxShadow: expanded
            ? '0 4px 20px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)'
            : 'none',
          ...sidebarStyle,
        }}
        className="hidden bg-white lg:flex lg:flex-col"
      >
        <SidebarHeader expanded={expanded} />

        {/* Scrollable body */}
        <div
          style={{ padding: 0 }}
          className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* Dashboard — standalone group */}
          <div className="pt-4 pb-2 px-[6px]">
            <SidebarNavItem
              item={DASHBOARD_ITEM}
              isActive={isActive(DASHBOARD_ITEM.href, true)}
              expanded={expanded}
              showTooltip
              onNavigate={handleNavigate}
            />
          </div>

          {/* Separator */}
          <div className="mx-[6px] my-1 border-t border-border" />

          {/* Nav groups */}
          {SIDEBAR_GROUPS.map((group, groupIdx) => (
            <div key={group.key}>
              {/* Group label — visible only when expanded */}
              <div
                className="flex h-[22px] items-end text-[11px] uppercase tracking-[0.08em] text-gray-400"
                style={{
                  paddingLeft: 16, // aligns with icon center at 10px group padding + 6px offset
                  opacity: expanded ? 0.75 : 0,
                  transition: prefersReducedMotion
                    ? undefined
                    : `opacity ${expanded ? `${TRANSITION.expandDuration}ms ${TRANSITION.expandEasing}` : `${TRANSITION.collapseDuration}ms ${TRANSITION.collapseEasing}`}`,
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                {group.label}
              </div>

              {/* Group items */}
              <div className="flex flex-col gap-2" style={{ padding: '0 6px' }}>
                {group.items.map((navItem) => (
                  <SidebarNavItem
                    key={navItem.id}
                    item={navItem}
                    isActive={isActive(navItem.href)}
                    expanded={expanded}
                    showTooltip
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>

              {/* Separator between groups (not after last) */}
              {groupIdx < SIDEBAR_GROUPS.length - 1 && (
                <div className="mx-[6px] my-4 border-t border-border" />
              )}
            </div>
          ))}

          {/* Flex spacer — absorbs remaining space */}
          <div className="flex-1" />
        </div>

        {/* Settings — pinned above footer, outside scrollable body for spatial lock */}
        <div className="shrink-0" style={{ padding: '0 6px' }}>
          <SidebarNavItem
            item={SETTINGS_ITEM}
            isActive={isActive(SETTINGS_ITEM.href)}
            expanded={expanded}
            showTooltip
            onNavigate={handleNavigate}
          />
        </div>

        <SidebarFooter
          expanded={expanded}
          userDisplay={userDisplay}
          tier={tier}
          onToggle={handleToggle}
          toggleRef={toggleRef}
        />
      </nav>

      {/* Backdrop — sibling of nav, not child */}
      <div
        aria-hidden="true"
        onMouseDown={handleBackdropMouseDown}
        className="hidden lg:block"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: Z_INDEX.backdrop,
          background: 'rgba(0,0,0,0.025)',
          backdropFilter: 'blur(1px)',
          opacity: expanded ? 1 : 0,
          pointerEvents: expanded ? 'auto' : 'none',
          transition: prefersReducedMotion ? undefined : 'opacity 200ms ease-out',
        }}
      />
    </>
  )
}
