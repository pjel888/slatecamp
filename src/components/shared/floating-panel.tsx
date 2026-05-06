'use client'

import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { DotsSixVertical } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { CloseButton } from '@/components/ui/close-button'
import { useDraggableFloatingPosition } from '@/lib/hooks/useDraggableFloatingPosition'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FloatingPanelProps {
  open: boolean
  onClose: () => void

  // Header
  title: string
  subtitle?: string
  headerActions?: React.ReactNode

  /**
   * Fully custom header renderer. When provided, replaces the default
   * title / close-button header. The callback receives `onClose` and
   * `dragHandleProps` (non-null only when `draggable` is true) so the
   * consumer can wire them into its own markup.
   */
  renderHeader?: (props: {
    onClose: () => void
    dragHandleProps: DragHandleProps | null
  }) => React.ReactNode

  // Layout
  sidebar?: React.ReactNode
  sidebarWidth?: number
  footer?: React.ReactNode
  children: React.ReactNode

  // Behavior
  draggable?: boolean
  dragStorageKey?: string

  // Backdrop
  backdrop?: 'blur' | 'dim' | 'none'

  // Sizing
  width?: number
  height?: number | 'auto'
  minWidth?: number
  minHeight?: number
  maxHeight?: number | string

  // Positioning (non-draggable only)
  position?: 'center' | 'top-center'

  className?: string
}

interface DragHandleProps {
  onPointerDown: (e: React.PointerEvent) => void
  role: 'button'
  tabIndex: 0
  'aria-label': string
}

/* ------------------------------------------------------------------ */
/*  Default header                                                     */
/* ------------------------------------------------------------------ */

const DefaultHeader = ({
  title,
  subtitle,
  headerActions,
  onClose,
  draggable,
  dragHandleProps,
}: {
  title: string
  subtitle?: string
  headerActions?: React.ReactNode
  onClose: () => void
  draggable: boolean
  dragHandleProps: DragHandleProps | null
}) => (
  <div className="flex items-center gap-1 border-b border-border px-2 py-2 shrink-0">
    {/* Drag handle area -- always 32px wide for visual consistency */}
    <div
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-sm transition-colors',
        draggable
          ? 'cursor-grab active:cursor-grabbing text-muted-foreground/60 hover:text-muted-foreground touch-none'
          : 'text-transparent',
      )}
      {...(dragHandleProps ?? {})}
    >
      {draggable && <SCIcon icon={DotsSixVertical} size="sm" />}
    </div>

    {/* Title + subtitle */}
    <div className="flex-1 min-w-0 flex items-baseline gap-2">
      <span className="text-[13px] font-semibold text-foreground truncate">
        {title}
      </span>
      {subtitle && (
        <span className="text-[11px] text-muted-foreground truncate">
          {subtitle}
        </span>
      )}
    </div>

    {/* Header actions slot */}
    {headerActions}

    {/* Close */}
    <CloseButton onClick={onClose} />
  </div>
)

/* ------------------------------------------------------------------ */
/*  FloatingPanel                                                      */
/* ------------------------------------------------------------------ */

const FloatingPanel = ({
  open,
  onClose,
  title,
  subtitle,
  headerActions,
  renderHeader,
  sidebar,
  sidebarWidth = 180,
  footer,
  children,
  draggable = false,
  dragStorageKey = 'floating-panel',
  backdrop = 'none',
  width = 640,
  height = 'auto',
  minWidth = 320,
  minHeight = 200,
  maxHeight = 'calc(100vh - 48px)',
  position = 'center',
  className,
}: FloatingPanelProps) => {
  // Draggable positioning hook (only meaningful when draggable)
  const { style: floatStyle, onPointerDown: onDrag } =
    useDraggableFloatingPosition(dragStorageKey, 'center', 120)

  // Escape key closes
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, handleKeyDown])

  // SSR guard
  if (typeof document === 'undefined' || !open) return null

  // Build drag handle props bundle for the header
  const dragHandleProps: DragHandleProps | null = draggable
    ? {
        onPointerDown: onDrag,
        role: 'button' as const,
        tabIndex: 0 as const,
        'aria-label': 'Drag to move',
      }
    : null

  // Resolve sizing styles
  const panelStyle: React.CSSProperties = {
    width,
    minWidth,
    minHeight,
    maxWidth: 'calc(100vw - 24px)',
    ...(height !== 'auto' ? { height } : {}),
    maxHeight,
  }

  // Position classes
  const positionClasses = draggable
    ? '' // position handled by floatStyle
    : position === 'top-center'
      ? 'fixed top-[15vh] left-1/2 -translate-x-1/2'
      : 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'

  // Animation classes
  const animationClasses = draggable
    ? '' // no entrance animation for draggable (persisted position)
    : 'animate-in fade-in duration-150'

  const panel = (
    <div
      role="dialog"
      aria-label={title || 'Panel'}
      aria-modal={backdrop !== 'none'}
      className={cn(
        'z-[101] flex flex-col rounded-lg bg-card shadow-modal overflow-hidden',
        positionClasses,
        animationClasses,
        className,
      )}
      style={{
        ...(draggable
          ? { ...floatStyle, width, minWidth, minHeight, maxWidth: 'calc(100vw - 24px)', maxHeight, ...(height !== 'auto' ? { height } : {}) }
          : panelStyle),
        display: open ? 'flex' : 'none',
      }}
    >
      {/* Header */}
      {renderHeader
        ? renderHeader({ onClose, dragHandleProps })
        : (
            <DefaultHeader
              title={title}
              subtitle={subtitle}
              headerActions={headerActions}
              onClose={onClose}
              draggable={draggable}
              dragHandleProps={dragHandleProps}
            />
          )}

      {/* Body (with optional sidebar) */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {sidebar && (
          <div
            className="border-r border-border/60 bg-muted/30 overflow-y-auto shrink-0"
            style={{ width: sidebarWidth }}
          >
            {sidebar}
          </div>
        )}
        <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
      </div>

      {/* Footer */}
      {footer && (
        <div className="shrink-0 border-t border-border px-3 py-2">
          {footer}
        </div>
      )}
    </div>
  )

  // Backdrop
  const backdropEl =
    backdrop === 'blur' ? (
      <div
        className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />
    ) : backdrop === 'dim' ? (
      <div
        className="fixed inset-0 z-[100] bg-black/20 animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />
    ) : null

  return createPortal(
    <>
      {backdropEl}
      {panel}
    </>,
    document.body,
  )
}

export { FloatingPanel }
export type { FloatingPanelProps, DragHandleProps }
