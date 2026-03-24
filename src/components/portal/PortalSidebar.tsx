'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface NavChild {
  label: string
  href: string
}

interface NavItem {
  label: string
  href: string
  icon?: React.ReactNode
  children?: NavChild[]
}

interface NavGroup {
  label: string
  items: NavItem[]
}

interface PortalSidebarProps {
  navItems: NavGroup[]
  accentColor: string
  accentLightColor: string
  className?: string
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const PortalSidebar = ({
  navItems,
  accentColor,
  accentLightColor,
  className,
}: PortalSidebarProps) => {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  const sectionExpanded = (item: NavItem) =>
    isActive(item.href) || item.children?.some((c) => isActive(c.href, true))

  return (
    <aside
      className={cn(
        'w-[220px] shrink-0 bg-card border-r border-border sticky top-12 h-[calc(100vh-48px)] overflow-y-auto py-3 hidden lg:block',
        className,
      )}
    >
      {navItems.map((group) => (
        <div key={group.label} className="first:mt-0 mt-4">
          <p className="font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-[0.1em] text-muted-foreground px-4 py-2 select-none">
            {group.label}
          </p>
          <div className="space-y-px">
            {group.items.map((item) => {
              const active = isActive(item.href)
              const expanded = sectionExpanded(item)

              return (
                <React.Fragment key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group relative flex items-center gap-2 px-4 py-1.5 text-xs transition-colors duration-150',
                      active ? 'font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                    )}
                    style={
                      active
                        ? {
                            color: accentColor,
                            backgroundColor: accentLightColor,
                            borderLeft: `2px solid ${accentColor}`,
                          }
                        : { borderLeft: '2px solid transparent' }
                    }
                  >
                    {item.icon && (
                      <span
                        className={cn(
                          'w-3.5 h-3.5 shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5',
                          active ? 'opacity-100' : 'opacity-50',
                        )}
                      >
                        {item.icon}
                      </span>
                    )}
                    <span className="truncate">{item.label}</span>
                  </Link>

                  {/* Sub-items */}
                  {item.children && expanded && (
                    <div className="ml-6">
                      {item.children.map((child) => {
                        const childActive = isActive(child.href, true)
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              'block px-4 py-1 text-[11px] transition-colors duration-150',
                              childActive ? 'font-medium' : 'text-muted-foreground hover:text-foreground',
                            )}
                            style={childActive ? { color: accentColor } : undefined}
                          >
                            {child.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>
      ))}
    </aside>
  )
}

export { PortalSidebar }
export type { PortalSidebarProps, NavGroup, NavItem, NavChild }
