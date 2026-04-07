'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface BottomNavItem {
  label: string
  href: string
  icon: React.ReactNode
  activeIcon?: React.ReactNode
}

interface BottomNavigationProps {
  items: BottomNavItem[]
  className?: string
}

/* ------------------------------------------------------------------ */
/*  Bottom Navigation                                                   */
/* ------------------------------------------------------------------ */

const BottomNavigation = ({ items, className }: BottomNavigationProps) => {
  const pathname = usePathname()

  return (
    <nav
      data-slot="bottom-navigation"
      className={cn(
        'fixed bottom-0 left-0 z-50 w-full border-t border-border bg-card lg:hidden',
        className,
      )}
      aria-label="Bottom navigation"
    >
      <div
        className="mx-auto grid h-14 max-w-lg font-medium"
        style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}
      >
        {items.map((item) => {
          const isActive = pathname?.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              data-slot="bottom-nav-item"
              className={cn(
                'inline-flex flex-col items-center justify-center gap-0.5 px-2 transition-colors duration-150 ease-out',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-inset',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="[&>svg]:h-5 [&>svg]:w-5" aria-hidden="true">
                {isActive && item.activeIcon ? item.activeIcon : item.icon}
              </span>
              <span className="text-[10px] leading-tight">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export { BottomNavigation }
export type { BottomNavigationProps, BottomNavItem }
