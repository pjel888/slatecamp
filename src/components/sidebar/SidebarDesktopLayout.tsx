'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useSidebar } from './SidebarProvider'
import {
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
  TRANSITION,
} from './types'

type SidebarDesktopLayoutProps = {
  sidebar: ReactNode
  children: ReactNode
}

const SIDEBAR_EDGE_SHADOW =
  '1px 0 0 rgba(15, 23, 42, 0.10), 8px 0 14px -14px rgba(15, 23, 42, 0.40)'

export const SidebarDesktopLayout = ({
  sidebar,
  children,
}: SidebarDesktopLayoutProps) => {
  const { expanded, prefersReducedMotion } = useSidebar()
  const [layoutExpanded, setLayoutExpanded] = useState(expanded)

  useEffect(() => {
    if (expanded || prefersReducedMotion) {
      setLayoutExpanded(expanded)
      return
    }

    const timer = window.setTimeout(() => {
      setLayoutExpanded(false)
    }, TRANSITION.collapseDuration)

    return () => window.clearTimeout(timer)
  }, [expanded, prefersReducedMotion])

  const sidebarWidth = layoutExpanded
    ? SIDEBAR_WIDTH_EXPANDED
    : SIDEBAR_WIDTH_COLLAPSED

  return (
    <div
      className='grid h-full min-h-0 min-w-0 flex-1 grid-cols-1 lg:grid-cols-[var(--sidebar-grid-columns)]'
      style={
        {
          '--sidebar-grid-columns': `${sidebarWidth}px minmax(0, 1fr)`,
        } as CSSProperties
      }
    >
      <div
        className='relative z-20 hidden h-[100dvh] overflow-hidden bg-white lg:block'
        style={{ boxShadow: SIDEBAR_EDGE_SHADOW }}
      >
        {sidebar}
      </div>
      <div className='flex h-full min-h-0 min-w-0 flex-col'>{children}</div>
    </div>
  )
}
