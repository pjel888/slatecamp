'use client'

import { useState } from 'react'
import { MobileTopBar } from './MobileTopBar'
import { MobileDrawer } from './MobileDrawer'

interface MobileSidebarShellProps {
  userDisplay: { name: string; avatarUrl: string | null }
  tierLabel: string
  showTierBadge: boolean
}

export const MobileSidebarShell = ({
  userDisplay,
  tierLabel,
  showTierBadge,
}: MobileSidebarShellProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <MobileTopBar onOpenDrawer={() => setDrawerOpen(true)} />
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        userDisplay={userDisplay}
        tierLabel={tierLabel}
        showTierBadge={showTierBadge}
      />
    </>
  )
}
