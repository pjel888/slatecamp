'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// SidebarNavGroup
// ---------------------------------------------------------------------------

interface SidebarNavGroupProps {
  /** Optional uppercase mono label above the group. */
  label?: string
  children: React.ReactNode
  className?: string
}

const SidebarNavGroup = ({ label, children, className }: SidebarNavGroupProps) => (
  <div className={cn('first:mt-0 mt-4', className)}>
    {label && (
      <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-widest text-muted-foreground px-3 py-2 mb-1 select-none">
        {label}
      </p>
    )}
    <div className="space-y-px">{children}</div>
  </div>
)

// ---------------------------------------------------------------------------
// SidebarNavItem
// ---------------------------------------------------------------------------

interface SidebarNavItemProps {
  href: string
  label: string
  /** Leading icon node (e.g. Lucide or Phosphor icon). */
  icon?: React.ReactNode
  /** Right-aligned badge or count node. */
  badge?: React.ReactNode
  /** Whether this item represents the current route. */
  active?: boolean
  /** When true, only the icon is shown (rail/collapsed mode). */
  collapsed?: boolean
  className?: string
}

const SidebarNavItem = ({
  href,
  label,
  icon,
  badge,
  active = false,
  collapsed = false,
  className,
}: SidebarNavItemProps) => (
  <Link
    href={href}
    aria-current={active ? 'page' : undefined}
    className={cn(
      'group relative flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-150 outline-none',
      collapsed && 'justify-center px-0',
      active
        ? 'bg-primary/10 text-primary font-medium'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      className,
    )}
  >
    {/* Active indicator bar */}
    {active && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3.5 bg-primary rounded-r-full" />
    )}

    {icon && (
      <span className={cn('w-4 h-4 shrink-0 [&>svg]:w-4 [&>svg]:h-4', collapsed && 'w-5 h-5 [&>svg]:w-5 [&>svg]:h-5')}>
        {icon}
      </span>
    )}

    {collapsed ? (
      <span className="sr-only">{label}</span>
    ) : (
      <>
        <span className="truncate">{label}</span>
        {badge && <span className="ml-auto shrink-0">{badge}</span>}
      </>
    )}
  </Link>
)

// ---------------------------------------------------------------------------
// SidebarNavDivider
// ---------------------------------------------------------------------------

interface SidebarNavDividerProps {
  className?: string
}

const SidebarNavDivider = ({ className }: SidebarNavDividerProps) => (
  <div className={cn('mx-3 my-2 h-px bg-border', className)} role="separator" />
)

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { SidebarNavGroup, SidebarNavItem, SidebarNavDivider }
export type { SidebarNavGroupProps, SidebarNavItemProps, SidebarNavDividerProps }
