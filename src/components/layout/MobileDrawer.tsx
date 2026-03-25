'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MobileDrawerProps, NavSection, NavFooterItem, NavItem } from '@/types/layout'

export const MobileDrawer = ({
  open,
  onClose,
  shellTitle,
  sections,
  footerItems,
}: MobileDrawerProps) => {
  const drawerRef = useRef<HTMLDivElement>(null)

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // Focus trap: move focus into drawer when opened
  useEffect(() => {
    if (!open) return
    const drawer = drawerRef.current
    if (!drawer) return

    const focusable = drawer.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    first?.focus()

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }

    document.addEventListener('keydown', trap)
    return () => document.removeEventListener('keydown', trap)
  }, [open])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Close on any link click inside sidebar
  const handleDrawerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('a')) onClose()
  }

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ease-out lg:hidden',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          'fixed left-0 top-0 bottom-0 z-50 w-72 bg-card flex flex-col lg:hidden',
          'transform transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        onClick={handleDrawerClick}
      >
        {/* Close button row */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            {shellTitle}
          </span>
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="flex items-center justify-center h-[44px] w-[44px] rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-150 ease-out -mr-2"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Sidebar content — reuse UnifiedSidebar but override its desktop-only class by wrapping */}
        <div className="flex-1 overflow-y-auto">
          {/* Inline nav instead of UnifiedSidebar to avoid hidden lg:flex restriction */}
          <MobileNavContent
            sections={sections}
            footerItems={footerItems}
            shellTitle={shellTitle}
          />
        </div>
      </div>
    </>
  )
}

// ── Internal mobile nav (same structure as UnifiedSidebar but always visible) ──

const isItemActive = (href: string, pathname: string): boolean => {
  const segments = href.split('/').filter(Boolean)
  if (segments.length === 1) return pathname === href
  return pathname.startsWith(href)
}

const MobileNavContent = ({
  sections,
  footerItems,
}: {
  sections: NavSection[]
  footerItems: NavFooterItem[]
  shellTitle: string
}) => {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
      <nav aria-label="Main Navigation" className="flex-1 px-2 py-3">
        {sections.map((section, i) => (
          <div key={section.label} role="group" aria-labelledby={`mobile-nav-section-${i}`} className="mb-4">
            <p
              id={`mobile-nav-section-${i}`}
              className="mb-1 px-3 font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground"
            >
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item: NavItem) => {
                const active = isItemActive(item.href, pathname)
                return (
                  <Link
                    key={item.href}
                    href={item.disabled ? '#' : item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-2.5 px-3 text-sm transition-colors duration-150 ease-out min-h-[44px] rounded-sm border-l-[3px]',
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
              })}
            </div>
          </div>
        ))}
      </nav>

      {footerItems.length > 0 && (
        <div className="shrink-0 border-t border-border px-2 py-2 space-y-0.5">
          {footerItems.map((item: NavFooterItem) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 text-sm text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground hover:bg-muted/50 min-h-[44px] rounded-sm"
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
