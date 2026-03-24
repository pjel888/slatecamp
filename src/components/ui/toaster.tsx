"use client"

import { CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { useToast } from "@/lib/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

const variantIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
} as const

const variantIconColors = {
  success: "text-emerald-500",
  error: "text-destructive",
  warning: "text-amber-500",
  info: "text-blue-500",
} as const

type SemanticVariant = keyof typeof variantIcons

const isSemanticVariant = (v: string | null | undefined): v is SemanticVariant =>
  v != null && v in variantIcons

export const Toaster = () => {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, variant, ...props }) => {
        const variantStr = variant as string | null | undefined
        const Icon = isSemanticVariant(variantStr)
          ? variantIcons[variantStr]
          : null

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex gap-3 items-start">
              {Icon && (
                <Icon
                  className={`h-5 w-5 mt-0.5 shrink-0 ${
                    variantIconColors[variantStr as SemanticVariant]
                  }`}
                />
              )}
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
