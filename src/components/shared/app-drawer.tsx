'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { CloseButton } from '@/components/ui/close-button'

const panelSizeVariants = cva('', {
  variants: {
    size: {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      full: 'max-w-xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

interface AppDrawerProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  side?: 'right' | 'left' | 'bottom'
  size?: 'sm' | 'md' | 'lg' | 'full'
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

const AppDrawer = ({
  open,
  onClose,
  title,
  subtitle,
  side = 'right',
  size = 'md',
  children,
  footer,
  className,
}: AppDrawerProps) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose],
  )

  // Focus trap: focus first focusable element on open, restore on close
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement | null
      const timer = setTimeout(() => {
        const panel = panelRef.current
        if (!panel) return
        const focusable = panel.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        focusable?.focus()
      }, 50)
      return () => clearTimeout(timer)
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [open])

  // Escape key listener
  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [open, handleEscape])

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [open])

  if (!open) return null

  const isHorizontal = side === 'right' || side === 'left'

  const panelPositionClasses = cn(
    'fixed z-50 flex flex-col bg-card shadow-lg',
    side === 'right' && 'inset-y-0 right-0 border-l border-border',
    side === 'left' && 'inset-y-0 left-0 border-r border-border',
    side === 'bottom' && 'inset-x-0 bottom-0 border-t border-border',
    isHorizontal && 'w-full',
    isHorizontal && panelSizeVariants({ size }),
    side === 'bottom' && 'max-h-[80vh]',
  )

  // Slide animation classes
  const slideOpenClass = cn(
    side === 'right' && 'animate-slide-in-right',
    side === 'left' && 'animate-slide-in-left',
    side === 'bottom' && 'animate-slide-in-bottom',
  )

  return createPortal(
    <div data-slot="app-drawer" aria-modal="true" role="dialog" aria-label={title}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(panelPositionClasses, slideOpenClass, className)}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-foreground">
              {title}
            </h2>
            {subtitle && (
              <p className="truncate text-xs text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          <CloseButton
            onClick={onClose}
            aria-label={`Close ${title}`}
            size="sm"
            className="ml-2 shrink-0"
          />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="shrink-0 border-t border-border px-4 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

export { AppDrawer }
export type { AppDrawerProps }
