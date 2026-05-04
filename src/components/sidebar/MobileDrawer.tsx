'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { X } from '@phosphor-icons/react/dist/ssr'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useActiveSession } from '@/lib/context/active-session-context'
import { SIDEBAR_GROUPS, DASHBOARD_ITEM, SETTINGS_ITEM } from './sidebar-constants'
import { Z_INDEX, ICON_TIER_OPACITY } from './types'
import type { SidebarNavItemConfig } from './types'
import type { NavigationPendingInfo } from './types'
import { ConfirmDialog } from '@/components/ui/dialog'
import { useNavigationPending } from '@/hooks/useNavigationPending'

// ---------------------------------------------------------------------------
// MobileDrawer — full-screen slide-in nav drawer for mobile
// Spec: HTML v4. z-index 50. Slides from left. CSS transitions only.
// ---------------------------------------------------------------------------

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  userDisplay: { name: string; avatarUrl: string | null }
  tierLabel: string
  showTierBadge: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getInitials = (name: string): string => {
  if (!name?.trim()) return 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

// ---------------------------------------------------------------------------
// MobileNavItem — 42px touch-friendly row
// ---------------------------------------------------------------------------

interface MobileNavItemProps {
  item: SidebarNavItemConfig
  isActive: boolean
  onNavigate: (e: React.MouseEvent<HTMLAnchorElement>) => void
  navigationPending?: NavigationPendingInfo
}

const MobileNavItem = ({ item, isActive, onNavigate, navigationPending }: MobileNavItemProps) => {
  const { icon: Icon, label, href, tier } = item
  const tierOpacity = ICON_TIER_OPACITY[tier]

  // Navigation pending state
  const isNavigating = navigationPending?.isNavigating ?? false
  const isItemPending = navigationPending?.isPendingHref(href) ?? false
  const isItemDisabled = isNavigating && !isItemPending

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isItemDisabled) {
      e.preventDefault()
      e.stopPropagation()
      return
    }

    if (!isItemPending && !isActive && navigationPending) {
      navigationPending.startNavigation(href, { id: item.id })
    }

    onNavigate(e)
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      aria-current={isActive ? 'page' : undefined}
      aria-disabled={isItemDisabled ? true : undefined}
      aria-busy={isItemPending ? true : undefined}
      data-pending={isItemPending ? '' : undefined}
      className={cn(
        // Base layout — 42px height for touch targets
        'relative flex h-[42px] w-full items-center gap-[11px] rounded-[7px] px-2.5',
        'outline-none transition-colors duration-[120ms] ease-out',
        'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-camp-cobalt',
        // Default
        'text-gray-500 dark:text-gray-400',
        // Hover
        'hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200',
        // Active
        isActive && [
          'bg-gray-100/50 dark:bg-gray-800/50',
          'text-gray-900 dark:text-gray-200',
          // Left-edge active indicator
          'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2',
          'before:w-[2.5px] before:h-[18px]',
          'before:bg-camp-cobalt dark:before:bg-primary-400',
          'before:rounded-r-sm',
          "before:content-['']",
        ],
        // Pending state
        isItemPending && [
          'cursor-progress',
          'bg-primary-50/60 dark:bg-primary-900/10',
          'text-primary/80 dark:text-primary-400/80',
        ],
        // Disabled state
        isItemDisabled && [
          'pointer-events-none',
          'opacity-40',
          'cursor-progress',
          'select-none',
        ],
      )}
    >
      {isItemPending ? (
        <span
          className="block h-4 w-4 shrink-0 animate-spin rounded-full border-[2px] border-current border-t-transparent motion-reduce:animate-none motion-reduce:border-t-0 motion-reduce:opacity-50"
          aria-hidden="true"
        />
      ) : (
        <Icon
          size={16}
          weight="regular"
          className="w-4 h-4 shrink-0 transition-opacity duration-[120px]"
          style={{ opacity: isActive || tier === 'default' ? 1.0 : tierOpacity }}
        />
      )}

      {/* Label */}
      <span
        className={cn(
          'text-[14px] leading-none',
          isActive ? 'font-medium' : 'font-normal',
        )}
      >
        {label}
      </span>

      {/* Visually hidden loading announcement */}
      {isItemPending && (
        <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          Loading {label}…
        </span>
      )}
    </Link>
  )
}

// ---------------------------------------------------------------------------
// MobileDrawer
// ---------------------------------------------------------------------------

export const MobileDrawer = ({
  isOpen,
  onClose,
  userDisplay,
  tierLabel,
  showTierBadge,
}: MobileDrawerProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const { activeSession } = useActiveSession()
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [pendingHref, setPendingHref] = useState<string | null>(null)
  const navigationPending = useNavigationPending()

  // Close on route change
  useEffect(() => {
    onClose()
  }, [pathname])

  // Escape key closes drawer
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Body scroll lock
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Auto-focus close button when drawer opens
  useEffect(() => {
    if (!isOpen) return
    const id = setTimeout(() => closeButtonRef.current?.focus(), 50)
    return () => clearTimeout(id)
  }, [isOpen])

  const isActive = useCallback(
    (href: string, exact = false) =>
      exact ? pathname === href : pathname === href || pathname.startsWith(href + '/'),
    [pathname],
  )

  // Navigation handler: active session guard + close drawer
  const handleNavigate = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (activeSession) {
        e.preventDefault()
        const href = e.currentTarget.getAttribute('href') ?? '/'
        setPendingHref(href)
        setShowLeaveConfirm(true)
        return
      }
      onClose()
    },
    [activeSession, onClose],
  )

  const handleLeaveConfirm = useCallback(() => {
    if (pendingHref) router.push(pendingHref)
    setPendingHref(null)
    onClose()
  }, [pendingHref, router, onClose])

  // Reduced-motion detection (client-side only, safe for SSR)
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  const drawerTransition = prefersReducedMotion
    ? undefined
    : 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)'

  const backdropTransition = prefersReducedMotion
    ? undefined
    : 'opacity 200ms ease-out'

  const initials = getInitials(userDisplay.name)

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

      {/* Backdrop — z-index 49, behind drawer */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: Z_INDEX.mobileDrawer - 1,
          background: 'rgba(0,0,0,0.20)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: backdropTransition,
        }}
        className="lg:hidden"
      />

      {/* Drawer — slides in from left */}
      <nav
        role="dialog"
        aria-modal={isOpen}
        aria-label="Mobile navigation"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100dvh',
          zIndex: Z_INDEX.mobileDrawer,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: drawerTransition,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid var(--border)',
        }}
        className="bg-white dark:bg-gray-950 lg:hidden"
      >
        {/* Drawer header */}
        <div
          className="flex shrink-0 items-center justify-between border-b border-border"
          style={{ height: 44, padding: '0 10px' }}
        >
          {/* Wordmark */}
          <div
            className="font-extrabold text-[13px] select-none"
            style={{ letterSpacing: '-0.3px', lineHeight: 1 }}
          >
            <span className="text-text-primary dark:text-white">Slate</span>
            <span className="text-camp-cobalt">Camp</span>
          </div>

          {/* Close button — min 44×44 touch target */}
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close navigation"
            className="flex items-center justify-center rounded-md text-text-secondary dark:text-gray-400 transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800 outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-camp-cobalt"
            style={{ width: 44, height: 44 }}
          >
            <X size={20} weight="regular" />
          </button>
        </div>

        {/* Scrollable nav area */}
        <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Dashboard — standalone */}
          <div className="px-[10px]">
            <MobileNavItem
              item={DASHBOARD_ITEM}
              isActive={isActive(DASHBOARD_ITEM.href, true)}
              onNavigate={handleNavigate}
              navigationPending={navigationPending}
            />
          </div>

          {/* Separator */}
          <div className="mx-[10px] my-1.5 border-t border-border" />

          {/* Nav groups */}
          {SIDEBAR_GROUPS.map((group, groupIdx) => (
            <div key={group.key}>
              {/* Group label — always visible in drawer (expanded state) */}
              <div
                className="flex h-[22px] items-end text-[11px] uppercase tracking-[0.08em] text-text-tertiary"
                style={{ paddingLeft: 14, userSelect: 'none' }}
              >
                {group.label}
              </div>

              {/* Group items */}
              <div className="px-[10px]">
                {group.items.map((item) => (
                  <MobileNavItem
                    key={item.id}
                    item={item}
                    isActive={isActive(item.href)}
                    onNavigate={handleNavigate}
                    navigationPending={navigationPending}
                  />
                ))}
              </div>

              {/* Separator between groups (not after last) */}
              {groupIdx < SIDEBAR_GROUPS.length - 1 && (
                <div className="mx-[10px] my-1.5 border-t border-border" />
              )}
            </div>
          ))}

          {/* Flex spacer — pushes settings to bottom */}
          <div className="flex-1" />

          {/* Settings — bottom-pinned */}
          <div className="mx-[10px] mb-1 border-t border-border" />
          <div className="px-[10px]">
            <MobileNavItem
              item={SETTINGS_ITEM}
              isActive={isActive(SETTINGS_ITEM.href)}
              onNavigate={handleNavigate}
              navigationPending={navigationPending}
            />
          </div>
        </div>

        {/* Drawer footer — user profile */}
        <div className="shrink-0 border-t border-border px-[10px] py-3">
          <div className="flex items-center gap-2.5">
            {/* Avatar — 28×28px */}
            <Avatar className="h-7 w-7 shrink-0 border border-border shadow-sm">
              {userDisplay.avatarUrl ? (
                <AvatarImage src={userDisplay.avatarUrl} alt={userDisplay.name} />
              ) : null}
              <AvatarFallback className="bg-primary-50 text-[11px] font-medium text-text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Name + tier badge */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-[13px] font-medium text-text-primary dark:text-gray-100">
                  {userDisplay.name}
                </p>
                {showTierBadge && tierLabel && (
                  <span className="shrink-0 rounded-[3px] bg-primary-50 px-1 py-px font-mono text-[11px] font-medium uppercase text-camp-cobalt">
                    {tierLabel}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
