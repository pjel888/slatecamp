'use client'

import Link from 'next/link'
import { SidebarSimple } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { ROUTES } from '@/lib/constants/routes'
import { SlateCampLogo } from '@/components/ui/SlateCampLogo'
import { useSidebar } from './SidebarProvider'

// ---------------------------------------------------------------------------
// SidebarHeader
// ---------------------------------------------------------------------------
// Panel header with full logo wordmark and a collapse toggle button.
// Matches the rail's top area layout but in expanded (260px) form.
// ---------------------------------------------------------------------------

interface SidebarHeaderProps {
  onBeforeNavigate: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void
}

export const SidebarHeader = ({ onBeforeNavigate }: SidebarHeaderProps) => {
  const { setExpanded, toggleRef } = useSidebar()

  const handleCollapse = () => {
    setExpanded(false)
    requestAnimationFrame(() => {
      toggleRef.current?.focus()
    })
  }

  return (
    <div className="flex h-16 items-center justify-between border-b border-border shrink-0 px-3">
      {/* Logo -- full wordmark linking to dashboard */}
      <Link
        href={ROUTES.DASHBOARD}
        onClick={(e) => onBeforeNavigate(e, ROUTES.DASHBOARD)}
        className="outline-none"
      >
        <SlateCampLogo size="sm" />
      </Link>

      {/* Collapse toggle */}
      <button
        onClick={handleCollapse}
        className="flex h-7 w-7 items-center justify-center rounded-sm text-[#8896A7] transition-colors duration-150 hover:bg-[#EEF2FC]/50 hover:text-primary outline-none"
        aria-label="Collapse sidebar"
      >
        <SCIcon icon={SidebarSimple} size="sm" />
      </button>
    </div>
  )
}
