'use client'

import Link from 'next/link'
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants/routes'

interface PortalTopbarProps {
  portalLabel: string
  topbarBg: string
  rightContent?: React.ReactNode
  searchComponent?: React.ReactNode
  mobileNav?: React.ReactNode
  backHref?: string
  backLabel?: string
  className?: string
}

const PortalTopbar = ({
  portalLabel,
  topbarBg,
  rightContent,
  searchComponent,
  mobileNav,
  backHref = ROUTES.DASHBOARD,
  backLabel = 'Dashboard',
  className,
}: PortalTopbarProps) => (
  <header
    className={cn(
      'sticky top-0 z-50 h-12 flex items-center px-5 gap-3 border-b border-white/[0.06]',
      className,
    )}
    style={{ background: topbarBg }}
  >
    {mobileNav}
    <span className="font-[family-name:var(--font-display)] font-extrabold text-sm text-white tracking-tight">
      SlateCamp
    </span>
    <span className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium text-white/45 uppercase tracking-[0.1em] px-2 py-0.5 border border-white/[0.12] rounded-sm">
      {portalLabel}
    </span>
    <div className="w-px h-5 bg-white/10" />

    {rightContent}

    {searchComponent ?? <div className="flex-1" />}

    {backHref && (
      <Link
        href={backHref}
        className="flex items-center gap-1 text-[11px] text-white/45 hover:text-white transition-colors duration-150"
      >
        <ArrowLeft size={16} className="w-4 h-4" />
        {backLabel}
      </Link>
    )}
  </header>
)

export { PortalTopbar }
export type { PortalTopbarProps }
