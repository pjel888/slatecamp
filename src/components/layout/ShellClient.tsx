'use client'

import { useState } from 'react'
import type { UserRole } from '@/types/layout'
import { getRoleConfig } from '@/config/navigation'
import { UnifiedSidebar } from './UnifiedSidebar'
import { UnifiedTopBar } from './UnifiedTopBar'
import { MobileDrawer } from './MobileDrawer'

interface ShellClientProps {
  role: UserRole
  children: React.ReactNode
  /** Display name for the top bar greeting — defaults to shell title */
  displayName?: string
}

export const ShellClient = ({
  role,
  children,
  displayName,
}: ShellClientProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const config = getRoleConfig(role)
  const resolvedDisplayName = displayName ?? config.shellTitle

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar — fixed left, hidden on mobile */}
      <UnifiedSidebar
        shellTitle={config.shellTitle}
        sections={config.sections}
        footerItems={config.footerItems}
      />

      {/* Content area — offset by sidebar width on desktop */}
      <div className="flex flex-col flex-1 lg:ml-60 min-w-0">
        {/* Top bar */}
        <UnifiedTopBar
          displayName={resolvedDisplayName}
          role={role}
          onMenuToggle={() => setDrawerOpen(true)}
        />

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 pb-20 lg:pb-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile drawer */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        shellTitle={config.shellTitle}
        sections={config.sections}
        footerItems={config.footerItems}
      />
    </div>
  )
}
