'use client'

import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

function Tabs({
  className,
  orientation = 'horizontal',
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        'group/tabs flex gap-2 data-horizontal:flex-col',
        className,
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  'group/tabs-list inline-flex w-fit items-center justify-center text-muted-foreground group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col',
  {
    variants: {
      variant: {
        underline: 'gap-1 rounded-none border-b border-border bg-transparent',
        line: 'gap-1 rounded-none border-b border-border bg-transparent',
        pill: 'gap-1 rounded-none bg-transparent',
        segmented: 'rounded-lg bg-muted p-1',
      },
    },
    defaultVariants: {
      variant: 'underline',
    },
  },
)

function TabsList({
  className,
  variant = 'underline',
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

const tabsTriggerBase =
  "relative inline-flex flex-1 items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

const tabsTriggerVariants = cva(tabsTriggerBase, {
  variants: {
    variant: {
      underline:
        'rounded-none border-b-2 border-transparent text-muted-foreground hover:text-foreground data-active:border-primary data-active:text-primary',
      line: 'rounded-none border-b-2 border-transparent text-muted-foreground hover:text-foreground data-active:border-primary data-active:text-primary',
      pill: 'rounded-md text-muted-foreground hover:text-foreground data-active:bg-primary/10 data-active:text-primary',
      segmented:
        'rounded-md text-muted-foreground data-active:bg-background data-active:text-foreground data-active:shadow-sm',
    },
  },
  defaultVariants: {
    variant: 'underline',
  },
})

function TabsTrigger({
  className,
  ...props
}: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        tabsTriggerBase,
        // Underline variant
        'group-data-[variant=underline]/tabs-list:rounded-none group-data-[variant=underline]/tabs-list:border-b-2 group-data-[variant=underline]/tabs-list:border-transparent group-data-[variant=underline]/tabs-list:text-muted-foreground group-data-[variant=underline]/tabs-list:hover:text-foreground group-data-[variant=underline]/tabs-list:data-active:border-primary group-data-[variant=underline]/tabs-list:data-active:text-primary',
        // Line variant (alias for underline, backward compat)
        'group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:border-b-2 group-data-[variant=line]/tabs-list:border-transparent group-data-[variant=line]/tabs-list:text-muted-foreground group-data-[variant=line]/tabs-list:hover:text-foreground group-data-[variant=line]/tabs-list:data-active:border-primary group-data-[variant=line]/tabs-list:data-active:text-primary',
        // Pill variant
        'group-data-[variant=pill]/tabs-list:rounded-md group-data-[variant=pill]/tabs-list:text-muted-foreground group-data-[variant=pill]/tabs-list:hover:text-foreground group-data-[variant=pill]/tabs-list:data-active:bg-primary/10 group-data-[variant=pill]/tabs-list:data-active:text-primary',
        // Segmented variant
        'group-data-[variant=segmented]/tabs-list:rounded-md group-data-[variant=segmented]/tabs-list:text-muted-foreground group-data-[variant=segmented]/tabs-list:data-active:bg-background group-data-[variant=segmented]/tabs-list:data-active:text-foreground group-data-[variant=segmented]/tabs-list:data-active:shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn('flex-1 text-sm outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants, tabsTriggerVariants }
