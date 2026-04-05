'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const modeColors = {
  camp: {
    solid: 'bg-primary text-white hover:bg-primary/90',
    outline: 'border-primary text-primary hover:bg-primary/10',
    ghost: 'text-primary hover:bg-primary/10',
    ring: 'ring-primary',
  },
  storm: {
    solid: 'bg-foreground text-background hover:bg-foreground/90',
    outline: 'border-foreground text-foreground hover:bg-foreground/10',
    ghost: 'text-foreground hover:bg-foreground/10',
    ring: 'ring-foreground',
  },
  blindspot: {
    solid: 'bg-purple-600 text-white hover:bg-purple-600/90',
    outline: 'border-purple-600 text-purple-600 hover:bg-purple-600/10',
    ghost: 'text-purple-600 hover:bg-purple-600/10',
    ring: 'ring-purple-600',
  },
  proof: {
    solid: 'bg-camp-orange text-white hover:bg-camp-orange/90',
    outline: 'border-camp-orange text-camp-orange hover:bg-camp-orange/10',
    ghost: 'text-camp-orange hover:bg-camp-orange/10',
    ring: 'ring-camp-orange',
  },
  chill: {
    solid: 'bg-primary text-white hover:bg-primary/90',
    outline: 'border-primary text-primary hover:bg-primary/10',
    ghost: 'text-primary hover:bg-primary/10',
    ring: 'ring-primary',
  },
} as const

type Mode = keyof typeof modeColors

const modeButtonVariants = cva(
  'inline-flex items-center justify-center font-semibold rounded-sm transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 text-sm',
        lg: 'h-10 px-6 text-sm',
      },
      variant: {
        solid: '',
        outline: 'bg-transparent border',
        ghost: 'bg-transparent',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'solid',
    },
  },
)

interface ModeButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof modeButtonVariants> {
  mode: Mode
  active?: boolean
  children: React.ReactNode
}

const ModeButton = React.forwardRef<HTMLButtonElement, ModeButtonProps>(
  (
    {
      className,
      mode,
      variant = 'solid',
      size = 'md',
      active = false,
      children,
      ...props
    },
    ref,
  ) => {
    const colors = modeColors[mode]
    const variantKey = variant ?? 'solid'

    return (
      <button
        ref={ref}
        className={cn(
          modeButtonVariants({ size, variant }),
          colors[variantKey],
          active && `ring-2 ${colors.ring} ring-offset-2`,
          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  },
)

ModeButton.displayName = 'ModeButton'

export { ModeButton, modeButtonVariants, modeColors }
export type { ModeButtonProps, Mode }
