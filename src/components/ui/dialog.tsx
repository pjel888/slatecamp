"use client"

import * as React from "react"

import {
  ConfirmModal,
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalPortal,
  ModalTitle,
  ModalTrigger,
  type ConfirmModalProps,
  type ModalContentProps,
  type ModalSize,
} from "@/components/ui/modal"

function Dialog(props: React.ComponentProps<typeof Modal>) {
  return <Modal data-slot="dialog" {...props} />
}

function DialogTrigger({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof ModalTrigger> & {
  asChild?: boolean
  children?: React.ReactNode
}) {
  if (asChild && React.isValidElement(children)) {
    return <ModalTrigger data-slot="dialog-trigger" render={children} {...props} />
  }

  return (
    <ModalTrigger data-slot="dialog-trigger" {...props}>
      {children}
    </ModalTrigger>
  )
}

function DialogPortal(props: React.ComponentProps<typeof ModalPortal>) {
  return <ModalPortal data-slot="dialog-portal" {...props} />
}

function DialogClose(props: React.ComponentProps<typeof ModalClose>) {
  return <ModalClose data-slot="dialog-close" {...props} />
}

function DialogOverlay(props: React.ComponentProps<typeof ModalOverlay>) {
  return <ModalOverlay data-slot="dialog-overlay" {...props} />
}

type DialogSize = ModalSize
type DialogContentProps = ModalContentProps & {
  /** @deprecated Close buttons now live in DialogHeader/ModalHeader. */
  showCloseButton?: boolean
}

function DialogContent({
  showCloseButton: _showCloseButton,
  ...props
}: DialogContentProps) {
  return <ModalContent data-slot="dialog-content" {...props} />
}

function DialogHeader(props: React.ComponentProps<typeof ModalHeader>) {
  return <ModalHeader data-slot="dialog-header" {...props} />
}

function DialogFooter(props: React.ComponentProps<typeof ModalFooter>) {
  return <ModalFooter data-slot="dialog-footer" {...props} />
}

function DialogTitle(props: React.ComponentProps<typeof ModalTitle>) {
  return <ModalTitle data-slot="dialog-title" {...props} />
}

function DialogDescription(props: React.ComponentProps<typeof ModalDescription>) {
  return <ModalDescription data-slot="dialog-description" {...props} />
}

function ConfirmDialog(props: ConfirmModalProps) {
  return <ConfirmModal {...props} />
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  ConfirmDialog,
}

const DialogBody = ModalBody

export type { DialogSize, DialogContentProps, ConfirmModalProps as ConfirmDialogProps }
