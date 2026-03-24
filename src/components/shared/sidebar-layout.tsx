'use client'

import { useCallback, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// SidebarLayout
// ---------------------------------------------------------------------------
// Generic rail+overlay sidebar wrapper. Left sidebars show a narrow rail on
// desktop that overlays to full width on click/hover. Right sidebars are
// visible on desktop, overlay on mobile. Both sides use position-based
// overlay (never pushes content).
// ---------------------------------------------------------------------------

interface SidebarLayoutProps {
  /** Which edge the sidebar sits on. */
  side: 'left' | 'right'
  /** Full (expanded) width class. Default: 'w-64' left, 'w-80' right. */
  width?: string
  /** Collapsed rail width class (left sidebars only). Default: 'w-14'. */
  collapsedWidth?: string
  /** Whether the sidebar is expanded. */
  open: boolean
  /** Callback when open state should change. */
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

const SidebarLayout = ({
  side,
  width,
  collapsedWidth,
  open,
  onOpenChange,
  children,
  className,
}: SidebarLayoutProps) => {
  const resolvedWidth = width ?? (side === 'left' ? 'w-64' : 'w-80')
  const resolvedCollapsedWidth = collapsedWidth ?? 'w-14'
  const panelRef = useRef<HTMLDivElement>(null)

  // --- Escape key closes overlay ---
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    },
    [open, onOpenChange],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [handleEscape])

  // --- Lock body scroll on mobile when open ---
  useEffect(() => {
    const isMobile = window.innerWidth < 1024
    if (open && isMobile) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [open])

  const isLeft = side === 'left'

  return (
    <aside className={cn('relative', className)}>
      {/* ----------------------------------------------------------------- */}
      {/* Mobile backdrop (< 1024px) */}
      {/* ----------------------------------------------------------------- */}
      {open && (
        <div
          className="fixed inset-0 z-[39] bg-black/20 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Desktop rail (left sidebar only, >= 1024px) */}
      {/* ----------------------------------------------------------------- */}
      {isLeft && (
        <div
          className={cn(
            'hidden lg:flex flex-col h-full border-r border-border bg-card shrink-0',
            resolvedCollapsedWidth,
            open && 'invisible',
          )}
          aria-hidden={open}
        />
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Sidebar panel */}
      {/* ----------------------------------------------------------------- */}
      <div
        ref={panelRef}
        role={open ? 'dialog' : undefined}
        aria-label={open ? `${side} sidebar` : undefined}
        className={cn(
          // Base
          'flex flex-col h-full bg-card overflow-hidden',
          resolvedWidth,

          // --- Mobile: overlay from edge ---
          'fixed inset-y-0 z-[40]',
          isLeft ? 'left-0' : 'right-0',
          'transition-transform duration-200 ease-out',

          // Mobile hidden state
          !open && (isLeft ? '-translate-x-full' : 'translate-x-full'),
          // Mobile open state
          open && 'translate-x-0',

          // --- Desktop (>= 1024px) ---
          // Left: overlay over content from the rail edge
          isLeft && 'lg:fixed lg:inset-y-0 lg:left-0 lg:shadow-md',
          isLeft && !open && 'lg:-translate-x-full',
          isLeft && open && 'lg:translate-x-0',

          // Right: static in flow on desktop, always visible
          !isLeft && 'lg:static lg:translate-x-0 lg:z-auto lg:border-l lg:border-border',

          // Border
          isLeft ? 'border-r border-border' : '',
        )}
      >
        <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </div>
    </aside>
  )
}

export { SidebarLayout }
export type { SidebarLayoutProps }
