'use client'

import * as React from 'react'
import { useFormStatus } from 'react-dom'
import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'

const PENDING_CLASSES =
  'cursor-not-allowed opacity-70 transition-[opacity] duration-150 ease-in-out'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded-sm border border-transparent bg-clip-padding font-medium whitespace-nowrap transition-all duration-150 ease-out outline-none select-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary (also aliased as 'default')
        primary:
          'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 active:scale-[0.98]',
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 active:scale-[0.98]',

        // Secondary (also aliased as 'outline')
        secondary:
          'bg-transparent border border-border text-foreground hover:bg-muted active:bg-muted/80 active:scale-[0.98]',
        outline:
          'bg-transparent border border-border text-foreground hover:bg-muted active:bg-muted/80 active:scale-[0.98]',

        // Ghost
        ghost:
          'bg-transparent text-foreground hover:bg-muted active:bg-muted/80 aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',

        // Subtle
        subtle:
          'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80 active:scale-[0.98]',

        // Destructive
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80 active:scale-[0.98]',

        // Link
        link: 'text-primary underline-offset-4 hover:underline active:text-primary/80',

        // Success
        success:
          'bg-emerald text-white hover:bg-emerald/90 active:bg-emerald/80 active:scale-[0.98]',

        // Warm CTA (orange accent, backward compat)
        warmCta:
          'bg-camp-orange text-white hover:brightness-90 active:brightness-80 active:scale-[0.98]',
      },
      size: {
        xs: "h-7 gap-1 px-2 py-1 text-[11px] [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 px-3 py-1.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        md: "h-9 gap-1.5 px-4 py-2 text-sm [&_svg:not([class*='size-'])]:size-4",
        default: "h-9 gap-1.5 px-4 py-2 text-sm [&_svg:not([class*='size-'])]:size-4",
        lg: "h-10 gap-1.5 px-6 py-2.5 text-sm [&_svg:not([class*='size-'])]:size-4",
        xl: "h-12 gap-2 px-8 py-3 text-base [&_svg:not([class*='size-'])]:size-5",
        icon: "size-8 [&_svg:not([class*='size-'])]:size-4",
        'icon-xs':
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-sm [&_svg:not([class*='size-'])]:size-3",
        'icon-sm':
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-sm [&_svg:not([class*='size-'])]:size-3.5",
        'icon-lg': "size-9 [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

/* ------------------------------------------------------------------ */
/* Spinner size map (mirrors icon sizes per button size)              */
/* ------------------------------------------------------------------ */

const spinnerSizeClass: Record<string, string> = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  default: 'w-4 h-4',
  lg: 'w-4 h-4',
  xl: 'w-5 h-5',
  icon: 'w-4 h-4',
  'icon-xs': 'w-3 h-3',
  'icon-sm': 'w-3.5 h-3.5',
  'icon-lg': 'w-4 h-4',
}

/* ------------------------------------------------------------------ */
/* Button                                                             */
/* ------------------------------------------------------------------ */

type ButtonVariantProps = VariantProps<typeof buttonVariants>

interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>,
    ButtonVariantProps {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  loading?: boolean
  loadingText?: React.ReactNode
  showSpinner?: boolean
  fullWidth?: boolean
  asChild?: boolean
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => any
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      leftIcon,
      rightIcon,
      loading = false,
      loadingText,
      showSpinner = true,
      fullWidth = false,
      disabled,
      onClick,
      children,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const [isAutoLoading, setIsAutoLoading] = React.useState(false)
    const resolvedSize = size ?? 'default'
    const resolvedLoading = loading || isAutoLoading
    const resolvedDisabled = resolvedLoading || disabled
    const Comp = asChild ? Slot : ButtonPrimitive

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onClick) {
        const result = onClick(e)
        if (result instanceof Promise) {
          setIsAutoLoading(true)
          try {
            await result
          } finally {
            setIsAutoLoading(false)
          }
        }
      }
    }

    return (
      <Comp
        ref={ref}
        data-slot="button"
        suppressHydrationWarning
        className={cn(
          buttonVariants({ variant, size, className }),
          resolvedLoading && 'pointer-events-none opacity-70',
          fullWidth && 'w-full',
        )}
        aria-disabled={resolvedDisabled ? true : undefined}
        onClick={handleClick}
        {...(!asChild ? { disabled: resolvedDisabled } : {})}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {resolvedLoading ? (
              <>
                {showSpinner && (
                  <Spinner className={spinnerSizeClass[resolvedSize]} />
                )}
                {loadingText && (
                  <span className="animate-in fade-in slide-in-from-left-1 duration-200">
                    {loadingText}
                  </span>
                )}
              </>
            ) : (
              <>
                {leftIcon}
                {children}
                {rightIcon}
              </>
            )}
          </>
        )}
      </Comp>
    )
  },
)
Button.displayName = 'Button'

/* ------------------------------------------------------------------ */
/* PendingButton                                                      */
/* ------------------------------------------------------------------ */

interface PendingButtonProps
  extends ButtonProps {
  pending?: boolean
  pendingLabel?: React.ReactNode
}

const PendingButton = ({
  className,
  variant = 'default',
  size = 'default',
  pending = false,
  pendingLabel,
  children,
  disabled,
  ...props
}: PendingButtonProps) => {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(pending && PENDING_CLASSES, className)}
      loading={pending}
      loadingText={pendingLabel}
      disabled={disabled}
      aria-busy={pending ? true : undefined}
      {...props}
    >
      {children}
    </Button>
  )
}

/* ------------------------------------------------------------------ */
/* SubmitButton                                                       */
/* ------------------------------------------------------------------ */

const SubmitButton = ({
  className,
  variant = 'default',
  size = 'default',
  pendingLabel = 'Saving...',
  children,
  ...props
}: Omit<PendingButtonProps, 'pending'>) => {
  const { pending } = useFormStatus()
  return (
    <PendingButton
      variant={variant}
      size={size}
      className={className}
      pending={pending}
      pendingLabel={pendingLabel}
      {...props}
    >
      {children}
    </PendingButton>
  )
}

export { Button, buttonVariants, PendingButton, SubmitButton }
export type { ButtonProps, PendingButtonProps }
