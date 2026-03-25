'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { UnifiedSidebarProps, NavItem, NavSection, NavFooterItem } from '@/types/layout'

// ── Helpers ──

const isItemActive = (href: string, pathname: string): boolean => {
  // Root role routes (no sub-path) require exact match
  const segments = href.split('/').filter(Boolean)
  if (segments.length === 1) return pathname === href
  return pathname.startsWith(href)
}

// ── Sub-components ──

const NavItemLink = ({ item, pathname }: { item: NavItem; pathname: string }) => {
  const active = isItemActive(item.href, pathname)

  return (
    <Link
      href={item.disabled ? '#' : item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-2.5 px-3 text-sm transition-colors duration-150 ease-out min-h-[44px] rounded-sm',
        'border-l-[3px]',
        active
          ? 'border-l-primary bg-sidebar-accent font-medium text-foreground'
          : 'border-l-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50',
        item.disabled && 'pointer-events-none opacity-50',
      )}
      title={item.tooltip}
    >
      <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge !== undefined && (
        <span className="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] text-primary">
          {item.badge}
        </span>
      )}
    </Link>
  )
}

const NavSectionGroup = ({
  section,
  index,
  pathname,
}: {
  section: NavSection
  index: number
  pathname: string
}) => {
  const labelId = `nav-section-${index}`

  return (
    <div role="group" aria-labelledby={labelId} className="mb-4">
      <p
        id={labelId}
        className="mb-1 px-3 font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground"
      >
        {section.label}
      </p>
      <div className="space-y-0.5">
        {section.items.map((item) => (
          <NavItemLink key={item.href} item={item} pathname={pathname} />
        ))}
      </div>
    </div>
  )
}

const FooterItemLink = ({ item }: { item: NavFooterItem }) => (
  <Link
    href={item.href}
    className="flex items-center gap-2.5 px-3 text-sm text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground hover:bg-muted/50 min-h-[44px] rounded-sm"
  >
    <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
    <span className="truncate">{item.label}</span>
  </Link>
)

// ── Main Component ──

export const UnifiedSidebar = ({ shellTitle, sections, footerItems }: UnifiedSidebarProps) => {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex w-60 flex-col border-r border-border bg-card shrink-0 fixed top-0 left-0 bottom-0 z-30">
      {/* Title */}
      <div className="px-4 py-4 border-b border-border shrink-0">
        <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          {shellTitle}
        </span>
      </div>

      {/* Nav */}
      <nav aria-label="Main Navigation" className="flex-1 overflow-y-auto px-2 py-3">
        {sections.map((section, i) => (
          <NavSectionGroup key={section.label} section={section} index={i} pathname={pathname} />
        ))}
      </nav>

      {/* Footer */}
      {footerItems.length > 0 && (
        <div className="shrink-0 border-t border-border px-2 py-2 space-y-0.5">
          {footerItems.map((item) => (
            <FooterItemLink key={item.href} item={item} />
          ))}
        </div>
      )}
    </aside>
  )
}
