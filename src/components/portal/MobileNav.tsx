'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { List } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { NavGroup } from './PortalSidebar'

interface MobileNavProps {
  navItems: NavGroup[]
  accentColor: string
  accentLightColor: string
  portalLabel: string
}

const MobileNav = ({
  navItems,
  accentColor,
  accentLightColor,
  portalLabel,
}: MobileNavProps) => {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const [manualToggle, setManualToggle] = React.useState<Record<string, boolean>>({})

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  const isExpanded = (item: { href: string; children?: { href: string }[] }) => {
    if (!item.children) return false
    // Manual toggle takes priority
    if (manualToggle[item.href] !== undefined) return manualToggle[item.href]
    // Auto-expand when a child or the parent is active
    return isActive(item.href) || item.children.some((c) => isActive(c.href, true))
  }

  const toggleSection = (href: string, currentExpanded: boolean) => {
    setManualToggle((prev) => ({ ...prev, [href]: !currentExpanded }))
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="lg:hidden flex items-center justify-center w-8 h-8 rounded-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-150"
        aria-label="Open navigation menu"
      >
        <SCIcon icon={List} size="sm" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[260px] p-0">
        <SheetHeader className="px-4 py-3 border-b border-border">
          <SheetTitle className="text-sm font-semibold">{portalLabel}</SheetTitle>
        </SheetHeader>
        <nav className="overflow-y-auto py-3">
          {navItems.map((group) => (
            <div key={group.label} className="first:mt-0 mt-4">
              <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground px-4 py-2 select-none">
                {group.label}
              </p>
              <div className="space-y-2">
                {group.items.map((item) => {
                  const active = isActive(item.href)
                  const expanded = isExpanded(item)
                  return (
                    <React.Fragment key={item.href}>
                      {item.children ? (
                        <button
                          type="button"
                          onClick={() => toggleSection(item.href, expanded)}
                          aria-expanded={expanded}
                          className={cn(
                            'group relative flex items-center gap-2 px-4 py-2 text-xs transition-colors duration-150 w-full text-left cursor-pointer',
                            active ? 'font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                          )}
                          style={
                            active
                              ? { color: accentColor, backgroundColor: accentLightColor, borderLeft: `2px solid ${accentColor}` }
                              : { borderLeft: '2px solid transparent' }
                          }
                        >
                          {item.icon && (
                            <span className={cn('w-3.5 h-3.5 shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5', active ? 'opacity-100' : 'opacity-50')}>
                              {item.icon}
                            </span>
                          )}
                          <span className="truncate">{item.label}</span>
                          <svg
                            className={cn(
                              'ml-auto w-3 h-3 shrink-0 text-muted-foreground transition-transform duration-150',
                              expanded && 'rotate-90',
                            )}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          aria-current={active ? 'page' : undefined}
                          className={cn(
                            'group relative flex items-center gap-2 px-4 py-2 text-xs transition-colors duration-150',
                            active ? 'font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                          )}
                          style={
                            active
                              ? { color: accentColor, backgroundColor: accentLightColor, borderLeft: `2px solid ${accentColor}` }
                              : { borderLeft: '2px solid transparent' }
                          }
                        >
                          {item.icon && (
                            <span className={cn('w-3.5 h-3.5 shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5', active ? 'opacity-100' : 'opacity-50')}>
                              {item.icon}
                            </span>
                          )}
                          <span className="truncate">{item.label}</span>
                        </Link>
                      )}
                      {item.children && expanded && (
                        <div className="ml-6">
                          {item.children.map((child) => {
                            const childActive = isActive(child.href, true)
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                  'block px-4 py-1.5 text-[11px] transition-colors duration-150',
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
        </nav>
      </SheetContent>
    </Sheet>
  )
}

export { MobileNav }
