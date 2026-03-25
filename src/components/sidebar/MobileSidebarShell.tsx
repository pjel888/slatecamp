'use client'

import { useState } from 'react'
import { MobileTopBar } from './MobileTopBar'
import { MobileDrawer } from './MobileDrawer'

interface MobileSidebarShellProps {
  userDisplay: { name: string; avatarUrl: string | null }
  tier: string
}

export const MobileSidebarShell = ({ userDisplay, tier }: MobileSidebarShellProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <MobileTopBar onOpenDrawer={() => setDrawerOpen(true)} />
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        userDisplay={userDisplay}
        tier={tier}
      />
    </>
  )
}
