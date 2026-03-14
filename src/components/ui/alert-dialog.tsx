"use client"

import * as React from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const AlertDialogCloseContext = React.createContext<(() => void) | null>(null)

function AlertDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  return (
    <AlertDialogCloseContext.Provider value={() => setOpen(false)}>
      <Dialog open={open} onOpenChange={setOpen}>
        {children}
      </Dialog>
    </AlertDialogCloseContext.Provider>
  )
}

function AlertDialogTrigger({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof DialogTrigger>) {
  if (
    asChild &&
    React.Children.only(children) &&
    React.isValidElement(children)
  ) {
    return <DialogTrigger {...props} render={children} />
  }
  return <DialogTrigger {...props}>{children}</DialogTrigger>
}

function AlertDialogContent({
  className,
  showCloseButton = false,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  return (
    <DialogContent
      className={className}
      showCloseButton={showCloseButton}
      {...props}
    />
  )
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <DialogHeader className={className} {...props} />
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <DialogFooter className={className} {...props} />
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogTitle>) {
  return <DialogTitle className={className} {...props} />
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogDescription>) {
  return <DialogDescription className={className} {...props} />
}

function AlertDialogCancel({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <DialogClose
      render={
        <Button variant="outline" className={cn(className)} {...props}>
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
      onClick={(e) => {
        onClick?.(e)
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
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
}
