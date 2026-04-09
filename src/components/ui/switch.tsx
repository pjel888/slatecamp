"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// ─── Track sizing ────────────────────────────────────────────────────────────
// Default: 36 × 20 px track, 16 px thumb → 2 px padding each side
// Small  : 28 × 16 px track, 12 px thumb → 2 px padding each side
// Thumb travel = trackWidth − thumbDiameter − (2 × padding)
//   default: 36 − 16 − 4 = 16 px
//   sm     : 28 − 12 − 4 = 12 px

const switchVariants = cva(
  "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent p-[2px] transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80 data-disabled:cursor-not-allowed data-disabled:opacity-50",
  {
    variants: {
      size: {
        default: "h-5 w-9",
        sm: "h-4 w-7",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

type SwitchProps = SwitchPrimitive.Root.Props & VariantProps<typeof switchVariants>

const Switch = ({
  className,
  size = "default",
  ...props
}: SwitchProps) => {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(switchVariants({ size }), className)}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-background shadow-sm ring-0 transition-transform duration-150",
          "group-data-[size=default]/switch:size-4",
          "group-data-[size=sm]/switch:size-3",
          "data-unchecked:translate-x-0",
          "group-data-[size=default]/switch:data-checked:translate-x-4",
          "group-data-[size=sm]/switch:data-checked:translate-x-3",
          "dark:data-checked:bg-primary-foreground",
          "dark:data-unchecked:bg-foreground",
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
export type { SwitchProps }
