'use client'

import Link from 'next/link'
import { SidebarSimple } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { ROUTES } from '@/lib/constants/routes'
import { SlateCampLogo } from '@/components/ui/SlateCampLogo'
import { useSidebar } from './SidebarProvider'

// ---------------------------------------------------------------------------
// SidebarHeader (overlay)
// ---------------------------------------------------------------------------
// Two sections matching rail vertical layout. Only divider: under the logo.
// ---------------------------------------------------------------------------

interface SidebarHeaderProps {
  onBeforeNavigate: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void
}

export const SidebarHeader = ({ onBeforeNavigate }: SidebarHeaderProps) => {
  const { setCollapsed, toggleRef } = useSidebar()

  const handleCollapse = () => {
    setCollapsed(true)
    requestAnimationFrame(() => {
      toggleRef.current?.focus()
    })
  }

  return (
    <>
      {/* 1. Logo area — only divider in the sidebar */}
      <div className="flex h-16 items-center shrink-0 px-3">
        <Link
          href={ROUTES.DASHBOARD}
          onClick={(e) => onBeforeNavigate(e, ROUTES.DASHBOARD)}
          className="outline-none"
        >
          <SlateCampLogo size="sm" />
        </Link>
      </div>
      <div className="mx-3 h-px bg-border" />

      {/* 2. Toggle area — no divider */}
      <div className="flex items-center justify-end shrink-0 py-1 px-3">
        <button
          onClick={handleCollapse}
          className="flex h-7 w-7 items-center justify-center rounded-sm text-[#8896A7] transition-colors duration-150 hover:bg-[#EEF2FC]/50 hover:text-primary outline-none"
          aria-label="Collapse sidebar"
        >
          <SCIcon icon={SidebarSimple} size="sm" />
        </button>
      </div>
    </>
  )
}
