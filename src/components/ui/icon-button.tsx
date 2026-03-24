'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const iconButtonVariants = cva(
  'inline-flex items-center justify-center rounded-sm transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        ghost:
          'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
        outline:
          'border border-border text-muted-foreground hover:bg-muted hover:text-foreground',
        subtle:
          'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground',
      },
      size: {
        sm: 'w-7 h-7',
        md: 'w-8 h-8',
        lg: 'w-9 h-9',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'md',
    },
  },
)

const iconSizeMap = {
  sm: '[&_svg]:w-3.5 [&_svg]:h-3.5',
  md: '[&_svg]:w-4 [&_svg]:h-4',
  lg: '[&_svg]:w-[18px] [&_svg]:h-[18px]',
} as const

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  icon: React.ReactNode
  tooltip?: string
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { className, icon, tooltip, variant = 'ghost', size = 'md', ...props },
    ref,
  ) => {
    const sizeKey = size ?? 'md'

    const button = (
      <button
        ref={ref}
        aria-label={tooltip}
        className={cn(
          iconButtonVariants({ variant, size }),
          iconSizeMap[sizeKey],
          className,
        )}
        {...props}
      >
        {icon}
      </button>
    )

    if (!tooltip) {
      return button
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    )
  },
)

IconButton.displayName = 'IconButton'

export { IconButton, iconButtonVariants }
export type { IconButtonProps }
