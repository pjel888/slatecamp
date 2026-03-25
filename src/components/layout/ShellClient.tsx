'use client'

import { useState } from 'react'
import type { NavSection, NavFooterItem, UserRole } from '@/types/layout'
import { UnifiedSidebar } from './UnifiedSidebar'
import { UnifiedTopBar } from './UnifiedTopBar'
import { MobileDrawer } from './MobileDrawer'

interface ShellClientProps {
  shellTitle: string
  sections: NavSection[]
  footerItems: NavFooterItem[]
  role: UserRole
  children: React.ReactNode
  /** Display name for the top bar greeting — defaults to role label */
  displayName?: string
}

export const ShellClient = ({
  shellTitle,
  sections,
  footerItems,
  role,
  children,
  displayName,
}: ShellClientProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const resolvedDisplayName = displayName ?? shellTitle

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar — fixed left, hidden on mobile */}
      <UnifiedSidebar
        shellTitle={shellTitle}
        sections={sections}
        footerItems={footerItems}
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
        shellTitle={shellTitle}
        sections={sections}
        footerItems={footerItems}
      />
    </div>
  )
}
