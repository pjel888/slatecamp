'use client'

import { X } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const closeButtonVariants = cva(
  'inline-flex items-center justify-center rounded-full transition-colors duration-150 outline-none select-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        ghost:
          'bg-destructive/10 text-destructive/70 hover:bg-destructive/20 hover:text-destructive active:bg-destructive/30 focus-visible:ring-destructive/20',
        subtle:
          'bg-destructive/15 text-destructive/80 hover:bg-destructive/25 hover:text-destructive active:bg-destructive/35 focus-visible:ring-destructive/20',
        destructive:
          'bg-destructive/20 text-destructive hover:bg-destructive/30 active:bg-destructive/40 focus-visible:ring-destructive/20',
      },
      size: {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-10 h-10',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'sm',
    },
  },
)

const iconSizeClass: Record<string, string> = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}

interface CloseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof closeButtonVariants> {}

const CloseButton = ({
  className,
  variant = 'ghost',
  size = 'sm',
  'aria-label': ariaLabel = 'Close',
  ...props
}: CloseButtonProps) => {
  const resolvedSize = size ?? 'md'

  return (
    <button
      data-slot="close-button"
      type="button"
      aria-label={ariaLabel}
      className={cn(closeButtonVariants({ variant, size, className }))}
      {...props}
    >
      <X className={iconSizeClass[resolvedSize]} aria-hidden="true" />
    </button>
  )
}

export { CloseButton, closeButtonVariants }
export type { CloseButtonProps }
