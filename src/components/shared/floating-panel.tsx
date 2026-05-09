'use client'

import type { PointerEvent, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal'

interface FloatingPanelProps {
  open: boolean
  onClose: () => void

  title: string
  subtitle?: string
  headerActions?: ReactNode
  renderHeader?: (props: {
    onClose: () => void
    dragHandleProps: DragHandleProps | null
  }) => ReactNode

  sidebar?: ReactNode
  sidebarWidth?: number
  footer?: ReactNode
  children: ReactNode

  /** @deprecated FloatingPanel now uses the canonical Modal shell; dragging is intentionally ignored. */
  draggable?: boolean
  /** @deprecated FloatingPanel now uses the canonical Modal shell; persisted drag position is intentionally ignored. */
  dragStorageKey?: string

  backdrop?: 'blur' | 'dim' | 'none'

  width?: number
  height?: number | 'auto'
  minWidth?: number
  minHeight?: number
  maxHeight?: number | string
  position?: 'center' | 'top-center'

  className?: string
}

interface DragHandleProps {
  onPointerDown: (e: PointerEvent) => void
  role: 'button'
  tabIndex: 0
  'aria-label': string
}

/**
 * @deprecated Use `@/components/ui/modal` directly.
 * This compatibility wrapper intentionally delegates all dialog behavior,
 * backdrop, focus management, header, body, and footer structure to Modal.
 */
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
  backdrop = 'none',
  width = 640,
  height = 'auto',
  minWidth = 320,
  minHeight = 200,
  maxHeight = 'calc(100vh - 48px)',
  position = 'center',
  className,
}: FloatingPanelProps) => {
  return (
    <Modal
      open={open}
      modal={backdrop === 'none' ? false : true}
      disablePointerDismissal={backdrop === 'none'}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      <ModalContent
        width={width}
        height={height}
        minWidth={minWidth}
        minHeight={minHeight}
        maxHeight={maxHeight}
        position={position}
        backdrop={backdrop}
        role="dialog"
        aria-label={title || 'Panel'}
        className={className}
      >
        {renderHeader ? (
          renderHeader({ onClose, dragHandleProps: null })
        ) : (
          <ModalHeader>
            <div className="flex min-w-0 items-baseline gap-2">
              <ModalTitle>{title}</ModalTitle>
              {subtitle && <ModalDescription>{subtitle}</ModalDescription>}
            </div>
            {headerActions && <div className="mt-2">{headerActions}</div>}
          </ModalHeader>
        )}

        <ModalBody className="p-0">
          <div className="flex min-h-full min-w-0 flex-1 overflow-hidden">
            {sidebar && (
              <div
                className="shrink-0 overflow-y-auto border-r border-border/60 bg-muted/30"
                style={{ width: sidebarWidth }}
              >
                {sidebar}
              </div>
            )}
            <div className={cn('flex min-w-0 flex-1 flex-col overflow-hidden')}>
              {children}
            </div>
          </div>
        </ModalBody>

        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </Modal>
  )
}

export { FloatingPanel }
export type { FloatingPanelProps, DragHandleProps }
