'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSidebar } from './SidebarProvider'
import { SidebarHeader } from './SidebarHeader'
import { SidebarNavItem } from './SidebarNavItem'
import { SidebarFooter } from './SidebarFooter'
import { SIDEBAR_GROUPS, DASHBOARD_ITEM, SETTINGS_ITEM } from './sidebar-constants'
import {
  SIDEBAR_DIVIDER_INSET,
  SIDEBAR_PADDING,
  SIDEBAR_SECTION_GAP,
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
  TRANSITION,
} from './types'
import type { SidebarProps } from './types'
import { useActiveSession } from '@/lib/context/active-session-context'
import { ConfirmDialog } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Sidebar — structural nav shell for push layout
// 52px collapsed, 256px expanded, CSS transitions only
// ---------------------------------------------------------------------------

export const Sidebar = ({ userDisplay, tier, isAdmin: _isAdmin, isDevMode: _isDevMode }: SidebarProps) => {
  const { expanded, collapse, expand, toggle: _toggle, sidebarRef, toggleRef, prefersReducedMotion, isLocked } = useSidebar()
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

  const handleLeaveConfirm = useCallback(() => {
    if (pendingHref) router.push(pendingHref)
    setPendingHref(null)
  }, [pendingHref, router])

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

  const sidebarPaddingStyle = { paddingInline: SIDEBAR_PADDING }
  const dividerStyle = {
    marginInline: SIDEBAR_DIVIDER_INSET,
    marginBlock: SIDEBAR_SECTION_GAP,
  }

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

      {/* Sidebar nav shell — structural flex child, displaces content */}
      <nav
        ref={sidebarRef as React.RefObject<HTMLElement>}
        aria-label="Main navigation"
        onMouseDown={handleNavMouseDown}
        style={{
          position: 'relative',
          flexShrink: 0,
          height: '100dvh',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRight: '1px solid var(--border)',
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
        <SidebarHeader expanded={expanded} />

        {/* Scrollable body */}
        <div
          style={{ padding: 0 }}
          className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* Dashboard — standalone */}
          <div className="pt-2" style={sidebarPaddingStyle}>
            <SidebarNavItem
              item={DASHBOARD_ITEM}
              isActive={isActive(DASHBOARD_ITEM.href, true)}
              expanded={expanded}
              showTooltip
              onNavigate={handleNavigate}
            />
          </div>

          {/* Separator */}
          <div className="border-t border-border" style={dividerStyle} />

          {/* Nav groups */}
          <div className="flex flex-col gap-3" style={sidebarPaddingStyle}>
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
    </>
  )
}
