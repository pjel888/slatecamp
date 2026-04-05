"use client"

import { CheckCircle, WarningCircle, Warning, Info } from "@phosphor-icons/react"
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
  success: CheckCircle,
  error: WarningCircle,
  warning: Warning,
  info: Info,
  primary: Info,
} as const

const variantIconColors = {
  success: "text-emerald-500",
  error: "text-destructive",
  warning: "text-amber-500",
  info: "text-blue-500",
  primary: "text-primary",
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
          : Info // Fallback to Info icon for default/others

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex gap-3 items-start pr-2">
              <Icon
                weight="fill"
                className={`h-5 w-5 mt-0.5 shrink-0 ${
                  isSemanticVariant(variantStr) 
                    ? variantIconColors[variantStr] 
                    : "text-zinc-400"
                }`}
              />
              <div className="grid gap-1">
                {title && <ToastTitle className="text-[13px] font-bold leading-tight">{title}</ToastTitle>}
                {description && (
                  <ToastDescription className="text-[12px] text-zinc-500 leading-normal">
                    {description}
                  </ToastDescription>
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
