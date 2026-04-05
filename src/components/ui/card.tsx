import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const cardVariants = cva(
  'group/card flex flex-col overflow-hidden text-sm text-card-foreground has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 *:[img:first-child]:rounded-t-lg *:[img:last-child]:rounded-b-lg z-1',
  {
    variants: {
      variant: {
        default: 'bg-card border border-border rounded-lg',
        interactive:
          'bg-card border border-border rounded-lg hover:border-primary/30 hover:shadow-sm cursor-pointer transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2',
        selected: 'border border-primary bg-primary/5 rounded-lg',
        'accent-left': 'bg-card border-2 border-border rounded-lg',
        feature: 'rounded-lg',
        ghost: 'bg-transparent rounded-lg',
      },
      size: {
        sm: 'p-3 gap-3',
        md: 'p-4 gap-4',
        lg: 'p-6 gap-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

type CardVariantProps = VariantProps<typeof cardVariants>

interface CardProps
  extends React.ComponentProps<'div'>,
    CardVariantProps {
  asChild?: boolean
}

function Card({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: CardProps) {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="card"
      data-size={size}
      className={cn(cardVariants({ variant, size }), className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-lg px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3',
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('text-sm font-semibold', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-4 group-data-[size=sm]/card:px-3', className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        'flex items-center rounded-b-lg border-t bg-muted/50 p-4 group-data-[size=sm]/card:p-3',
        className,
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
}

export type { CardProps, CardVariantProps }
