'use client'

import { useFormStatus } from 'react-dom'
import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const PENDING_CLASSES =
  'cursor-not-allowed opacity-70 transition-[opacity] duration-150 ease-in-out'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded-sm border border-transparent bg-clip-padding font-medium whitespace-nowrap transition-all duration-150 ease-out outline-none select-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary (also aliased as 'default')
        primary:
          'bg-primary text-[8px]rimary-foreground hover:bg-primary/90 active:bg-primary/80 active:scale-[0.98]',
        default:
          'bg-primary text-[8px]rimary-foreground hover:bg-primary/90 active:bg-primary/80 active:scale-[0.98]',

        // Secondary (also aliased as 'outline')
        secondary:
          'bg-transparent border border-border text-foreground hover:bg-muted active:bg-muted/80 active:scale-[0.98]',
        outline:
          'bg-transparent border border-border text-foreground hover:bg-muted active:bg-muted/80 active:scale-[0.98]',

        // Ghost
        ghost:
          'bg-transparent text-foreground hover:bg-muted active:bg-muted/80 aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',

        // Destructive
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80 active:scale-[0.98]',

        // Link
        link: 'text-[8px]rimary underline-offset-4 hover:underline active:text-[8px]rimary/80',

        // Success
        success:
          'bg-emerald text-white hover:bg-emerald/90 active:bg-emerald/80 active:scale-[0.98]',

        // Warm CTA (orange accent, backward compat)
        warmCta:
          'bg-camp-orange text-white hover:brightness-90 active:brightness-80 active:scale-[0.98]',
      },
      size: {
        xs: "h-7 gap-1 px-2 py-1 text-[11px] [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 px-3 py-1.5 text-[8px]s [&_svg:not([class*='size-'])]:size-3.5",
        md: "h-9 gap-1.5 px-4 py-2 text-sm [&_svg:not([class*='size-'])]:size-4",
        default: "h-9 gap-1.5 px-4 py-2 text-sm [&_svg:not([class*='size-'])]:size-4",
        lg: "h-10 gap-1.5 px-6 py-2.5 text-sm [&_svg:not([class*='size-'])]:size-4",
        xl: "h-12 gap-2 px-8 py-3 text-base [&_svg:not([class*='size-'])]:size-5",
        icon: 'size-8',
        'icon-xs':
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-sm [&_svg:not([class*='size-'])]:size-3",
        'icon-sm':
          'size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-sm',
        'icon-lg': 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

/* ------------------------------------------------------------------ */
/* Spinner (inline SVG, used when loading=true)                       */
/* ------------------------------------------------------------------ */

const Spinner = ({ className }: { className?: string }) => (
  <svg
    className={cn('animate-spin', className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
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

interface ButtonProps
  extends ButtonPrimitive.Props,
    VariantProps<typeof buttonVariants> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  loading?: boolean
  fullWidth?: boolean
}

const Button = ({
  className,
  variant = 'default',
  size = 'default',
  leftIcon,
  rightIcon,
  loading = false,
  fullWidth = false,
  disabled,
  children,
  ...props
}: ButtonProps) => {
  const resolvedSize = size ?? 'default'

  return (
    <ButtonPrimitive
      data-slot="button"
      suppressHydrationWarning
      className={cn(
        buttonVariants({ variant, size, className }),
        loading && 'pointer-events-none opacity-70',
        fullWidth && 'w-full',
      )}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <Spinner className={spinnerSizeClass[resolvedSize]} />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </ButtonPrimitive>
  )
}

/* ------------------------------------------------------------------ */
/* PendingButton                                                      */
/* ------------------------------------------------------------------ */

interface PendingButtonProps
  extends ButtonPrimitive.Props, VariantProps<typeof buttonVariants> {
  pending?: boolean
  pendingLabel?: React.ReactNode
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  loading?: boolean
  fullWidth?: boolean
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
      disabled={pending || disabled}
      aria-busy={pending ? true : undefined}
      {...props}
    >
      {pending && pendingLabel !== undefined ? pendingLabel : children}
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
