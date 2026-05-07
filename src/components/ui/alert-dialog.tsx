"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@/components/ui/modal"
import { cn } from "@/lib/utils"

const AlertDialogCloseContext = React.createContext<(() => void) | null>(null)

type AlertDialogProps = React.ComponentProps<typeof Modal> & {
  children: React.ReactNode
}

function AlertDialog({
  children,
  open: controlledOpen,
  onOpenChange,
  ...props
}: AlertDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const open = controlledOpen ?? uncontrolledOpen

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(nextOpen)
      }
      onOpenChange?.(nextOpen, undefined)
    },
    [controlledOpen, onOpenChange],
  )

  return (
    <AlertDialogCloseContext.Provider value={() => handleOpenChange(false)}>
      <Modal open={open} onOpenChange={handleOpenChange} {...props}>
        {children}
      </Modal>
    </AlertDialogCloseContext.Provider>
  )
}

function AlertDialogTrigger({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof ModalTrigger> & {
  asChild?: boolean
  children?: React.ReactNode
}) {
  if (asChild && React.isValidElement(children)) {
    return <ModalTrigger {...props} render={children} />
  }

  return <ModalTrigger {...props}>{children}</ModalTrigger>
}

type AlertDialogContentProps = React.ComponentProps<typeof ModalContent> & {
  showCloseButton?: boolean
}

function AlertDialogContent({
  className,
  showCloseButton: _showCloseButton,
  size = "sm",
  ...props
}: AlertDialogContentProps) {
  return (
    <ModalContent
      role="alertdialog"
      size={size}
      className={className}
      {...props}
    />
  )
}

function AlertDialogHeader(props: React.ComponentProps<typeof ModalHeader>) {
  return <ModalHeader {...props} />
}

function AlertDialogBody(props: React.ComponentProps<typeof ModalBody>) {
  return <ModalBody {...props} />
}

function AlertDialogFooter(props: React.ComponentProps<typeof ModalFooter>) {
  return <ModalFooter {...props} />
}

function AlertDialogTitle(props: React.ComponentProps<typeof ModalTitle>) {
  return <ModalTitle {...props} />
}

function AlertDialogDescription(props: React.ComponentProps<typeof ModalDescription>) {
  return <ModalDescription {...props} />
}

function AlertDialogCancel({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <ModalClose
      render={
        <Button variant="secondary" className={cn(className)} {...props}>
          {children}
        </Button>
      }
    />
  )
}

function AlertDialogAction({
  className,
  onClick,
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  const close = React.useContext(AlertDialogCloseContext)

  return (
    <Button
      className={cn(className)}
      onClick={(event) => {
        onClick?.(event)
        close?.()
      }}
      {...props}
    >
      {children}
    </Button>
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
}
