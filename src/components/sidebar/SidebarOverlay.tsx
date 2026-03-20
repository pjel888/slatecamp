'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ShieldCheck, Sparkle, Lightning, Crown } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { useSidebar } from './SidebarProvider'
import { SidebarPanel } from './SidebarPanel'
import { SidebarHeader } from './SidebarHeader'
import { SidebarUserProfile } from './SidebarUserProfile'
import { SidebarNavItem } from './SidebarNavItem'
import { SidebarNavGroup } from './SidebarNavGroup'
import { SidebarFooter } from './SidebarFooter'
import { TierBadge } from '@/components/shared/TierBadge'
import { Button } from '@/components/ui/button'
import { ICON_BOX } from './types'
import { GROUPED_NAVIGATION } from '@/lib/routes'
import { ROUTES } from '@/lib/constants/routes'
import Link from 'next/link'
import type { UserTier } from '@/types/app'

// ---------------------------------------------------------------------------
// Tier icon helper
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// SidebarOverlay
// ---------------------------------------------------------------------------

interface SidebarOverlayProps {
  isAdmin?: boolean
  onBeforeNavigate: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void
  userDisplay?: { name: string; avatarUrl: string | null }
  tier?: UserTier
  isDevMode?: boolean
}

export const SidebarOverlay = ({
  isAdmin,
  onBeforeNavigate,
  userDisplay,
  tier = 'free',
  isDevMode,
}: SidebarOverlayProps) => {
  const { collapsed, setCollapsed, toggleRef } = useSidebar()
  const prefersReducedMotion = useReducedMotion()

  const backdropTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.15 }

  const panelTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: 'easeOut' as const }

  useEffect(() => {
    if (collapsed) return
    const timer = setTimeout(() => {
      const panel = document.querySelector<HTMLElement>(
        '[role="dialog"][aria-label="Navigation sidebar"]',
      )
      const firstFocusable = panel?.querySelector<HTMLElement>(
        'a, button, [tabindex]:not([tabindex="-1"])',
      )
      firstFocusable?.focus()
    }, 50)
    return () => clearTimeout(timer)
  }, [collapsed])

  const handleBackdropClick = () => {
    setCollapsed(true)
    requestAnimationFrame(() => {
      toggleRef.current?.focus()
    })
  }

  const TierIcon = getTierIcon(tier)

  return (
    <AnimatePresence>
      {!collapsed && (
        <>
          {/* Backdrop */}
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={backdropTransition}
            className="fixed inset-0 z-[39] bg-black/25"
            onMouseDown={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.aside
            key="sidebar-panel"
            initial={prefersReducedMotion ? { opacity: 0 } : { x: -260 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { x: -260 }}
            transition={panelTransition}
            className="fixed inset-y-0 left-0 z-[40] w-[260px] bg-white border-r border-border shadow-md"
            role="dialog"
            aria-label="Navigation sidebar"
          >
            <SidebarPanel
              header={
                <>
                  <SidebarHeader onBeforeNavigate={onBeforeNavigate} />

                  {/* Profile — no divider */}
                  {userDisplay && (
                    <div className="px-3">
                      <SidebarUserProfile
                        name={userDisplay.name}
                        avatarUrl={userDisplay.avatarUrl}
                        collapsed={false}
                      />
                    </div>
                  )}

                  {/* Tier & Plan — no divider */}
                  <div className="py-2 px-3">
                    <div className="flex items-center justify-start gap-2.5 px-2 py-[5px] rounded-sm">
                      <div className={ICON_BOX}>
                        <SCIcon icon={TierIcon} size="sm" className={getTierIconColor(tier)} />
                      </div>
                      <div className="flex min-w-0 flex-1 items-center justify-between">
                        <TierBadge tier={tier} devMode={isDevMode} size="sm" />
                        {tier === 'free' && (
                          <Link
                            href={ROUTES.SETTINGS_BILLING}
                            onClick={(e) => onBeforeNavigate(e, ROUTES.SETTINGS_BILLING)}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-xs font-medium border-border text-[#4A5568] hover:bg-primary hover:text-white hover:border-primary transition-colors"
                            >
                              Upgrade
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              }
              nav={
                <OverlayNavItems
                  isAdmin={isAdmin}
                  onBeforeNavigate={onBeforeNavigate}
                />
              }
              footer={
                <SidebarFooter
                  collapsed={false}
                  isAdmin={isAdmin}
                  onBeforeNavigate={onBeforeNavigate}
                />
              }
            />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

// ---------------------------------------------------------------------------
// OverlayNavItems -- ONLY nav links (profile + tier are in header slot)
// ---------------------------------------------------------------------------

interface OverlayNavItemsProps {
  isAdmin?: boolean
  onBeforeNavigate: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void
}

const OverlayNavItems = ({
  isAdmin,
  onBeforeNavigate,
}: OverlayNavItemsProps) => {
  const pathname = usePathname()

  return (
    <>
      {/* Dashboard standalone */}
      <SidebarNavItem
        href={GROUPED_NAVIGATION.dashboard.href}
        label={GROUPED_NAVIGATION.dashboard.label}
        icon={GROUPED_NAVIGATION.dashboard.icon}
        isActive={pathname === GROUPED_NAVIGATION.dashboard.href}
        collapsed={false}
        onBeforeNavigate={(e) => onBeforeNavigate(e, GROUPED_NAVIGATION.dashboard.href)}
      />

      {/* Grouped navigation */}
      {GROUPED_NAVIGATION.groups.map(({ config, items }) => (
        <SidebarNavGroup
          key={config.key}
          label={config.label}
          items={items}
          collapsed={false}
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
            collapsed={false}
            onBeforeNavigate={(e) => onBeforeNavigate(e, ROUTES.SETTINGS_DEVELOPER)}
          />
        </div>
      )}
    </>
  )
}
