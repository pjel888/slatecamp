"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { X } from "@phosphor-icons/react"
import { SCIcon } from "@/components/graphics/icons/Icon"

/* ------------------------------------------------------------------ */
/*  Root                                                               */
/* ------------------------------------------------------------------ */

const ModalStaticOpenContext = React.createContext(false)

function Modal({ open, defaultOpen, children, ...props }: DialogPrimitive.Root.Props) {
  const staticOpen = open ?? defaultOpen ?? false

  return (
    <ModalStaticOpenContext.Provider value={staticOpen}>
      <DialogPrimitive.Root open={open} defaultOpen={defaultOpen} {...props}>
        {children}
      </DialogPrimitive.Root>
    </ModalStaticOpenContext.Provider>
  )
}

function ModalTrigger(props: DialogPrimitive.Trigger.Props & { asChild?: boolean }) {
  return <DialogPrimitive.Trigger data-slot="modal-trigger" {...props} />
}

function ModalPortal({ children, ...props }: DialogPrimitive.Portal.Props) {
  if (typeof document === "undefined") {
    return <>{children}</>
  }

  return (
    <DialogPrimitive.Portal data-slot="modal-portal" {...props}>
      {children}
    </DialogPrimitive.Portal>
  )
}

function ModalClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="modal-close" {...props} />
}

/* ------------------------------------------------------------------ */
/*  Overlay                                                            */
/* ------------------------------------------------------------------ */

const modalOverlayVariants = cva(
  "fixed inset-0 isolate z-50 duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
  {
    variants: {
      backdrop: {
        blur: "bg-black/50 backdrop-blur-sm",
        dim: "bg-black/50",
        none: "bg-transparent pointer-events-none",
      },
    },
    defaultVariants: {
      backdrop: "blur",
    },
  }
)

function ModalOverlay({
  className,
  backdrop = "blur",
  ...props
}: DialogPrimitive.Backdrop.Props & VariantProps<typeof modalOverlayVariants>) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="modal-overlay"
      className={cn(modalOverlayVariants({ backdrop }), className)}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */

const modalContentVariants = cva(
  "fixed z-50 flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card text-sm shadow-modal outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
  {
    variants: {
      size: {
        sm: "w-[calc(100vw-24px)] sm:max-w-sm",
        md: "w-[calc(100vw-24px)] sm:max-w-md",
        lg: "w-[calc(100vw-24px)] sm:max-w-lg",
        xl: "w-[calc(100vw-24px)] sm:max-w-xl",
        full: "w-[calc(100vw-24px)] sm:max-w-3xl",
      },
      position: {
        center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        "top-center": "top-[15vh] left-1/2 -translate-x-1/2",
      },
    },
    defaultVariants: {
      size: "md",
      position: "center",
    },
  }
)

type ModalSize = NonNullable<VariantProps<typeof modalContentVariants>["size"]>
type ModalPosition = NonNullable<VariantProps<typeof modalContentVariants>["position"]>

type ModalContentProps = DialogPrimitive.Popup.Props &
  VariantProps<typeof modalContentVariants> & {
    backdrop?: VariantProps<typeof modalOverlayVariants>["backdrop"]
    overlayClassName?: string
    width?: number
    height?: number | "auto"
    minWidth?: number
    minHeight?: number
    maxHeight?: number | string
  }

function ModalContent({
  className,
  children,
  size = "md",
  position = "center",
  backdrop = "blur",
  overlayClassName,
  width,
  height = "auto",
  minWidth = 320,
  minHeight = 200,
  maxHeight = "calc(100vh - 48px)",
  role = "dialog",
  ...props
}: ModalContentProps) {
  const staticOpen = React.useContext(ModalStaticOpenContext)
  const sizingStyle: React.CSSProperties = {
    ...(width ? { width, maxWidth: "calc(100vw - 24px)" } : {}),
    ...(height !== "auto" ? { height } : {}),
    minWidth,
    minHeight,
    maxHeight,
  }

  const contentClassName = cn(modalContentVariants({ size, position }), className)

  if (typeof document === "undefined") {
    if (!staticOpen) return null

    const staticProps = props as React.ComponentPropsWithoutRef<"div">

    return (
      <>
        <div
          data-slot="modal-overlay"
          className={cn(modalOverlayVariants({ backdrop }), overlayClassName)}
        />
        <div
          data-slot="modal-content"
          className={contentClassName}
          style={sizingStyle}
          role={role}
          aria-modal="true"
          {...staticProps}
        >
          {children}
        </div>
      </>
    )
  }

  return (
    <ModalPortal>
      <ModalOverlay backdrop={backdrop} className={overlayClassName} />
      <DialogPrimitive.Popup
        data-slot="modal-content"
        className={contentClassName}
        style={sizingStyle}
        role={role}
        {...props}
      >
        {children}
      </DialogPrimitive.Popup>
    </ModalPortal>
  )
}

/* ------------------------------------------------------------------ */
/*  Header                                                             */
/* ------------------------------------------------------------------ */

function ModalHeader({
  className,
  showCloseButton = true,
  closeAriaLabel = "Close",
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
  closeAriaLabel?: string
}) {
  return (
    <div
      data-slot="modal-header"
      className={cn(
        "flex items-center gap-2 border-b border-border px-3 py-2 shrink-0",
        className
      )}
      {...props}
    >
      <div className="flex-1 min-w-0">{children}</div>
      {showCloseButton && (
        <DialogPrimitive.Close
          data-slot="modal-close"
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0"
              aria-label={closeAriaLabel}
            />
          }
        >
          <SCIcon icon={X} size="sm" ariaLabel={closeAriaLabel} />
          <span className="sr-only">{closeAriaLabel}</span>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function ModalTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="modal-title"
      className={cn("text-[13px] font-semibold text-foreground truncate", className)}
      {...props}
    />
  )
}

function ModalDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="modal-description"
      className={cn(
        "text-[11px] text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ */
/*  Body                                                               */
/* ------------------------------------------------------------------ */

function ModalBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="modal-body"
      className={cn("min-h-0 flex-1 overflow-y-auto", className)}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */

function ModalFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="modal-footer"
      className={cn(
        "shrink-0 flex flex-col-reverse gap-2 border-t border-border bg-muted/50 px-3 py-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          Close
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  ConfirmModal                                                       */
/* ------------------------------------------------------------------ */

interface ConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: "primary" | "destructive"
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  loading?: boolean
  size?: ModalSize
  showCloseButton?: boolean
}

const ConfirmModal = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "primary",
  onConfirm,
  onCancel,
  loading = false,
  size = "sm",
  showCloseButton = true,
}: ConfirmModalProps) => {
  const handleCancel = React.useCallback(() => {
    onCancel?.()
    onOpenChange(false)
  }, [onCancel, onOpenChange])

  const handleConfirm = React.useCallback(async () => {
    await onConfirm()
    onOpenChange(false)
  }, [onConfirm, onOpenChange])

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size={size} role="alertdialog">
        <ModalHeader showCloseButton={showCloseButton}>
          <ModalTitle>{title}</ModalTitle>
        </ModalHeader>
        {description && (
          <ModalBody className="p-4">
            <ModalDescription className="text-sm">{description}</ModalDescription>
          </ModalBody>
        )}
        <ModalFooter className="sm:justify-between">
          <Button variant="secondary" onClick={handleCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Loading..." : confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

/* ------------------------------------------------------------------ */
/*  Exports                                                            */
/* ------------------------------------------------------------------ */

export {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ModalClose,
  ModalPortal,
  ModalOverlay,
  ConfirmModal,
}

export type {
  ModalSize,
  ModalPosition,
  ModalContentProps,
  ConfirmModalProps,
}
